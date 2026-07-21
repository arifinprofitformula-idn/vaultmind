"use client";

import EmptyVault from "@/components/EmptyVault";
import PasswordHealthPanel from "@/components/PasswordHealthPanel";
import PasswordHistoryModal from "@/components/PasswordHistoryModal";
import PasswordStrengthBar from "@/components/PasswordStrengthBar";
import Toast from "@/components/Toast";
import VaultEntryCard from "@/components/VaultEntryCard";
import { useAuth } from "@/lib/auth-context";
import {
  createEntryId,
  createVault,
  generateStrongPassword,
  scorePassword,
  sealVault,
  unlockVault,
  type EncryptedVault,
  type PasswordHistoryEntry,
  type VaultEntry,
} from "@/lib/vault-crypto";
import {
  deleteStoredVault,
  exportVaultToJSON,
  getStoredVault,
  importVaultFromJSON,
  saveStoredVault,
} from "@/lib/vault-store";
import { downloadVault, uploadVault } from "@/lib/vault-sync";
import {
  Download,
  Eye,
  EyeOff,
  FileUp,
  KeyRound,
  Lock,
  LogOut,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type VaultMode = "loading" | "create" | "unlock" | "open";
type ToastState =
  | { message: string; type: "success" | "error" | "info" }
  | null;
type SyncStatus = "idle" | "syncing" | "synced" | "offline";

const categories: Array<VaultEntry["category"]> = [
  "Email",
  "Bank",
  "Sosmed",
  "Kerja",
  "Tagihan",
  "Lainnya",
];

const fieldClass =
  "mt-2 w-full rounded-lg border border-[#3b494b] bg-[#32353c] px-4 py-3 text-sm font-semibold text-[#e1e2eb] outline-none transition placeholder:text-[#849495] focus:border-[#00dbe9] focus:shadow-[0_0_0_3px_rgba(0,219,233,0.12)]";

const selectClass =
  "mt-2 w-full rounded-lg border border-[#3b494b] bg-[#32353c] px-4 py-3 text-sm font-semibold text-[#e1e2eb] outline-none transition focus:border-[#00dbe9] focus:shadow-[0_0_0_3px_rgba(0,219,233,0.12)]";

const labelClass = "text-xs font-semibold text-[#b9cacb]";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00dbe9] to-[#006970] px-4 py-3 text-sm font-black text-[#05070a] transition hover:shadow-[0_0_24px_rgba(0,219,233,0.22)] disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#3b494b] bg-transparent px-4 py-3 text-sm font-bold text-[#e1e2eb] transition hover:border-[#00dbe9] hover:bg-[#00dbe9]/5";

const emptyForm = {
  name: "",
  username: "",
  password: "",
  url: "",
  notes: "",
  category: "Lainnya" as VaultEntry["category"],
  billingDueDay: "",
};

function nowIso() {
  return new Date().toISOString();
}

function validateUrl(url: string): boolean {
  if (!url.trim()) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function VaultPage() {
  const router = useRouter();
  const { user, accessToken, isLoading, logout } = useAuth();
  const [vaultMode, setVaultMode] = useState<VaultMode>("loading");
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [error, setError] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [historyEntry, setHistoryEntry] = useState<VaultEntry | null>(null);
  const [showHealth, setShowHealth] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [showEntryPassword, setShowEntryPassword] = useState(false);

  const keyRef = useRef<CryptoKey | null>(null);
  const vaultRef = useRef<EncryptedVault | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesCategory =
        activeCategory === "all" || entry.category === activeCategory;
      const haystack = [
        entry.name,
        entry.username,
        entry.url ?? "",
        entry.category,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [entries, query, activeCategory]);

  const formPasswordStrength = useMemo(
    () => scorePassword(form.password),
    [form.password],
  );
  const masterStrength = useMemo(
    () => scorePassword(masterPassword),
    [masterPassword],
  );

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      setToast({ message, type });
    },
    [],
  );

  const showError = useCallback((message: string) => {
    setError(message);
    setToast({ message, type: "error" });
  }, []);

  const lockVault = useCallback(
    (message?: string) => {
      keyRef.current = null;
      vaultRef.current = null;
      setEntries([]);
      setVaultMode("unlock");
      setMasterPassword("");
      setConfirmPassword("");
      setForm(emptyForm);
      setEditingId(null);
      setError("");

      if (message) showToast(message, "info");
    },
    [showToast],
  );

  const initVault = useCallback(async () => {
    setVaultMode("loading");

    try {
      const storedVault = await getStoredVault();

      if (storedVault) {
        vaultRef.current = storedVault;
        setVaultMode("unlock");
        return;
      }

      if (accessToken) {
        try {
          const cloudVault = await downloadVault(accessToken);

          if (cloudVault) {
            await saveStoredVault(cloudVault);
            vaultRef.current = cloudVault;
            setVaultMode("unlock");
            showToast("Vault cloud tersedia. Masukkan master password.", "info");
            return;
          }
        } catch {
          setSyncStatus("offline");
        }
      }

      setVaultMode("create");
    } catch {
      setVaultMode("create");
    }
  }, [accessToken, showToast]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!isLoading && user) {
      void initVault();
    }
  }, [initVault, isLoading, user]);

  useEffect(() => {
    if (vaultMode !== "open") return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["mousemove", "keydown", "click", "touchstart"];

    events.forEach((eventName) =>
      window.addEventListener(eventName, updateActivity),
    );

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs > 5 * 60 * 1000) {
        lockVault("Vault dikunci otomatis.");
      }
    }, 10 * 1000);

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, updateActivity),
      );
      window.clearInterval(interval);
    };
  }, [lockVault, vaultMode]);

  async function handleCreateVault(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (masterPassword.length < 12) {
      showError("Master password minimal 12 karakter.");
      return;
    }

    if (masterPassword !== confirmPassword) {
      showError("Konfirmasi master password tidak sama.");
      return;
    }

    setIsBusy(true);

    try {
      const { key, vault } = await createVault(masterPassword, []);
      keyRef.current = key;
      vaultRef.current = vault;
      await saveStoredVault(vault);

      if (accessToken) {
        try {
          setSyncStatus("syncing");
          await uploadVault(accessToken, vault);
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        }
      }

      setEntries([]);
      setVaultMode("open");
      setMasterPassword("");
      setConfirmPassword("");
      showToast("Vault baru berhasil dibuat.", "success");
    } catch {
      showError("Gagal membuat vault.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUnlockVault(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsBusy(true);

    try {
      const storedVault = await getStoredVault();

      if (!storedVault) {
        showError("Vault tidak ditemukan.");
        return;
      }

      const unlocked = await unlockVault(masterPassword, storedVault);
      keyRef.current = unlocked.key;
      vaultRef.current = storedVault;
      setEntries(unlocked.entries);
      setVaultMode("open");
      setMasterPassword("");
      lastActivityRef.current = Date.now();
      showToast("Vault berhasil dibuka.", "success");
    } catch {
      showError("Master password salah atau vault rusak.");
    } finally {
      setIsBusy(false);
    }
  }

  const persistEntries = useCallback(
    async (nextEntries: VaultEntry[]) => {
      if (!keyRef.current || !vaultRef.current) {
        throw new Error("Vault belum terbuka.");
      }

      const nextVault = await sealVault(
        keyRef.current,
        vaultRef.current,
        nextEntries,
      );
      vaultRef.current = nextVault;
      await saveStoredVault(nextVault);
      setEntries(nextEntries);

      if (accessToken) {
        try {
          setSyncStatus("syncing");
          await uploadVault(accessToken, nextVault);
          setSyncStatus("synced");
        } catch {
          setSyncStatus("offline");
        }
      }
    },
    [accessToken],
  );

  async function handleSaveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      showError("Nama layanan wajib diisi.");
      return;
    }

    if (!form.password.trim()) {
      showError("Password wajib diisi.");
      return;
    }

    if (!validateUrl(form.url)) {
      showError("URL harus diawali http:// atau https://.");
      return;
    }

    const parsedDueDay = form.billingDueDay ? Number(form.billingDueDay) : null;

    if (form.category === "Tagihan") {
      if (
        !parsedDueDay ||
        !Number.isInteger(parsedDueDay) ||
        parsedDueDay < 1 ||
        parsedDueDay > 31
      ) {
        showError("Tanggal jatuh tempo tagihan harus antara 1-31.");
        return;
      }
    }

    setIsBusy(true);

    try {
      const timestamp = nowIso();
      const existingEntry = editingId
        ? entries.find((entry) => entry.id === editingId)
        : null;
      const passwordChanged =
        existingEntry && existingEntry.password !== form.password;

      const historyUpdate: PasswordHistoryEntry[] | undefined =
        passwordChanged
          ? [
              ...(existingEntry.passwordHistory || []),
              {
                password: existingEntry.password,
                changedAt: existingEntry.updatedAt,
              },
            ]
          : existingEntry?.passwordHistory;

      const nextEntry: VaultEntry = editingId
        ? {
            ...existingEntry,
            id: editingId,
            name: form.name.trim(),
            username: form.username.trim(),
            password: form.password,
            url: form.url.trim() || undefined,
            notes: form.notes.trim() || undefined,
            category: form.category,
            billingDueDay:
              form.category === "Tagihan" ? parsedDueDay ?? undefined : undefined,
            passwordHistory: passwordChanged
              ? historyUpdate
              : existingEntry?.passwordHistory,
            createdAt: existingEntry?.createdAt ?? timestamp,
            updatedAt: timestamp,
          }
        : {
            id: createEntryId(),
            name: form.name.trim(),
            username: form.username.trim(),
            password: form.password,
            url: form.url.trim() || undefined,
            notes: form.notes.trim() || undefined,
            category: form.category,
            billingDueDay:
              form.category === "Tagihan" ? parsedDueDay ?? undefined : undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
      const nextEntries = editingId
        ? entries.map((entry) => (entry.id === editingId ? nextEntry : entry))
        : [nextEntry, ...entries];

      await persistEntries(nextEntries);
      setForm(emptyForm);
      setEditingId(null);
      showToast(editingId ? "Entri diperbarui." : "Entri disimpan.", "success");
    } catch {
      showError("Gagal menyimpan entri.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleEdit(entry: VaultEntry) {
    setForm({
      name: entry.name,
      username: entry.username,
      password: entry.password,
      url: entry.url ?? "",
      notes: entry.notes ?? "",
      category: entry.category,
      billingDueDay: entry.billingDueDay ? String(entry.billingDueDay) : "",
    });
    setEditingId(entry.id);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus entri ini?")) return;

    try {
      await persistEntries(entries.filter((entry) => entry.id !== id));
      showToast("Entri dihapus.", "success");
    } catch {
      showError("Gagal menghapus entri.");
    }
  }

  async function handleCopy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    showToast(`${label} disalin.`, "info");

    window.setTimeout(() => {
      void navigator.clipboard.writeText("");
    }, 30 * 1000);
  }

  function handleGeneratePassword() {
    setForm((current) => ({
      ...current,
      password: generateStrongPassword(),
    }));
    showToast("Password kuat dibuat.", "info");
  }

  function handleExportBackup() {
    if (!vaultRef.current) return;

    const json = exportVaultToJSON(vaultRef.current);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vaultmind-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Backup diunduh.", "success");
  }

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const json = await file.text();
      const importedVault = importVaultFromJSON(json);
      await saveStoredVault(importedVault);
      vaultRef.current = importedVault;
      setVaultMode("unlock");
      setEntries([]);
      showToast("Backup diimpor. Masukkan master password.", "success");
    } catch {
      showError("Format file backup tidak valid.");
    }
  }

  async function handleDeleteLocalVault() {
    if (!window.confirm("Hapus vault lokal dari perangkat ini?")) return;

    await deleteStoredVault();
    lockVault("Vault lokal dihapus dari perangkat ini.");
    setVaultMode("create");
  }

  async function handleLogout() {
    lockVault();
    await logout();
    router.push("/auth/login");
  }

  async function handleRegeneratePassword(entryId: string, newPassword: string) {
    const nextEntries = entries.map((e) =>
      e.id === entryId
        ? {
            ...e,
            password: newPassword,
            updatedAt: nowIso(),
            passwordHistory: [
              ...(e.passwordHistory || []),
              { password: e.password, changedAt: e.updatedAt },
            ],
          }
        : e,
    );
    try {
      await persistEntries(nextEntries);
    } catch {
      showError("Gagal menyimpan password baru.");
      return;
    }
    showToast("Password baru dibuat & tersimpan.", "success");
  }

  function handleNavigateToEntry(entryId: string) {
    // Scroll to the entry card
    const el = entryRefs.current.get(entryId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-cyan-400", "rounded-xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-cyan-400", "rounded-xl");
      }, 2000);
    }
  }

  async function handleRestoreHistory(entryId: string, oldPassword: string) {
    const nextEntries = entries.map((e) =>
      e.id === entryId
        ? {
            ...e,
            password: oldPassword,
            updatedAt: nowIso(),
            passwordHistory: [
              ...(e.passwordHistory || []),
              { password: e.password, changedAt: e.updatedAt },
            ],
          }
        : e,
    );
    try {
      await persistEntries(nextEntries);
    } catch {
      showError("Gagal menyimpan password yang dipulihkan.");
      return;
    }
    setHistoryEntry(null);
    showToast("Password dipulihkan dari riwayat.", "success");
  }

  const syncLabel = {
    idle: "Lokal",
    syncing: "Syncing",
    synced: "Tersinkron",
    offline: "Offline",
  }[syncStatus];
  const billCount = entries.filter((entry) => entry.category === "Tagihan").length;
  const categoryCount = new Set(entries.map((entry) => entry.category)).size;
  const syncTone =
    syncStatus === "synced"
      ? "border-[#00dbe9] bg-[#00dbe9]/10 text-[#7df4ff]"
      : syncStatus === "offline"
        ? "border-[#ffb4ab] bg-[#ffb4ab]/10 text-[#ffb4ab]"
        : "border-[#3b494b] bg-[#1d2026] text-[#b9cacb]";

  if (isLoading || vaultMode === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#05070a] px-4 py-10 text-[#e1e2eb]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(0,219,233,0.16),transparent_28%),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:auto,72px_72px,72px_72px]" />
        <div className="relative text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00dbe9]/30 bg-[#0b0e14]/70 shadow-[0_0_34px_rgba(0,219,233,0.18)] backdrop-blur-xl">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00dbe9]/20 border-t-[#00dbe9]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#b9cacb]">
            Menyiapkan vault...
          </p>
        </div>
      </main>
    );
  }

  if (vaultMode === "create") {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#05070a] px-4 py-10 text-[#e1e2eb] md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,219,233,0.14),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(112,0,255,0.1),transparent_24%)]" />
        {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
        <form
          onSubmit={handleCreateVault}
          className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]/70 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8"
        >
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#00dbe9]/10 blur-3xl" />
          <div className="relative z-10 mb-8 flex items-center justify-center">
            <Shield className="mr-2 h-6 w-6 text-[#00dbe9]" />
            <span className="text-2xl font-black uppercase tracking-wider text-[#00dbe9]">
              VaultMind
            </span>
          </div>
          <p className="relative z-10 text-sm font-black uppercase tracking-[0.18em] text-[#00dbe9]">
            Buat Vault
          </p>
          <h1 className="relative z-10 mt-3 text-3xl font-black leading-tight text-[#e1e2eb]">
            Buat master password
          </h1>
          <p className="relative z-10 mt-4 text-sm leading-6 text-[#b9cacb]">
            Master password tidak dikirim ke server. Simpan baik-baik, karena
            tanpa ini isi vault tidak bisa dibuka.
          </p>
          <div className="relative z-10 mt-8 space-y-5">
            <label className="block">
              <span className={labelClass}>Master password</span>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showMasterPassword ? "text" : "password"}
                  value={masterPassword}
                  onChange={(event) => setMasterPassword(event.target.value)}
                  placeholder="Minimal 12 karakter"
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 mt-2 flex w-12 items-center justify-center text-[#849495] transition hover:text-[#00dbe9]"
                  aria-label={
                    showMasterPassword
                      ? "Sembunyikan master password"
                      : "Tampilkan master password"
                  }
                >
                  {showMasterPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>
            <PasswordStrengthBar password={masterPassword} />
            <p className="text-xs text-[#849495]">
              Status: {masterStrength.label}
            </p>
            <label className="block">
              <span className={labelClass}>Konfirmasi master password</span>
              <input
                suppressHydrationWarning
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={fieldClass}
              />
            </label>
            {error ? <p className="text-sm text-[#ffb4ab]">{error}</p> : null}
            <button
              disabled={isBusy}
              className={`w-full ${primaryButtonClass}`}
            >
              <KeyRound className="h-4 w-4" />
              {isBusy ? "Membuat..." : "Buat Vault"}
            </button>
          </div>
          <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-xs text-[#b9cacb]/70">
            <Lock className="h-4 w-4" />
            <span>End-to-End Encrypted</span>
          </div>
        </form>
      </main>
    );
  }

  if (vaultMode === "unlock") {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#05070a] px-4 py-10 text-[#e1e2eb] md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(0,219,233,0.14),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(112,0,255,0.1),transparent_24%)]" />
        {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
        <div className="relative w-full max-w-[420px]">
          <div className="mb-8 flex items-center justify-center">
            <Shield className="mr-2 h-6 w-6 text-[#00dbe9]" />
            <h1 className="text-2xl font-black uppercase tracking-wider text-[#00dbe9]">
              VaultMind
            </h1>
          </div>
          <form
            onSubmit={handleUnlockVault}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]/70 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8"
          >
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#00dbe9]/10 blur-3xl transition group-hover:bg-[#00dbe9]/20" />
            <p className="relative z-10 text-sm font-black uppercase tracking-[0.18em] text-[#00dbe9]">
              Unlock Vault
            </p>
            <h2 className="relative z-10 mt-3 text-3xl font-black leading-tight text-[#e1e2eb]">
              Masukkan master password
            </h2>
            <p className="relative z-10 mt-4 text-sm leading-6 text-[#b9cacb]">
              Vault terenkripsi ditemukan di perangkat atau cloud. Dekripsi
              hanya dilakukan di browser Anda.
            </p>
            <div className="relative z-10 mt-8 space-y-5">
              <label className="block">
                <span className={labelClass}>Master password</span>
                <div className="relative">
                  <input
                    suppressHydrationWarning
                    type={showMasterPassword ? "text" : "password"}
                    value={masterPassword}
                    onChange={(event) => setMasterPassword(event.target.value)}
                    placeholder="••••••••"
                    className={`${fieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 mt-2 flex w-12 items-center justify-center text-[#849495] transition hover:text-[#00dbe9]"
                    aria-label={
                      showMasterPassword
                        ? "Sembunyikan master password"
                        : "Tampilkan master password"
                    }
                  >
                    {showMasterPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>
              {error ? <p className="text-sm text-[#ffb4ab]">{error}</p> : null}
              <div className="space-y-2 pt-2">
                <button disabled={isBusy} className={`w-full ${primaryButtonClass}`}>
                  <KeyRound className="h-4 w-4" />
                  {isBusy ? "Membuka..." : "Buka Vault"}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full ${secondaryButtonClass}`}
                >
                  <FileUp className="h-4 w-4" />
                  Import backup terenkripsi
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </div>
            </div>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#b9cacb]/70">
            <Lock className="h-4 w-4" />
            <span>End-to-End Encrypted</span>
          </div>
          <footer className="mt-8 flex flex-col items-center gap-2 border-t border-[#3b494b] pt-4">
            <div className="flex gap-4 text-xs font-semibold text-[#b9cacb]">
              <a href="/privacy" className="transition hover:text-[#00dbe9]">
                Privacy Policy
              </a>
              <a href="/terms" className="transition hover:text-[#00dbe9]">
                Terms of Service
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#849495]/70">
              VaultMind 2026
            </p>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070a] px-4 py-6 text-[#e1e2eb] md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,219,233,0.12),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(112,0,255,0.12),transparent_24%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:auto,auto,88px_88px,88px_88px]" />
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <div className="relative mx-auto max-w-[1440px]">
        <header className="rounded-2xl border border-white/10 bg-[#0b0e14]/70 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#00dbe9]" />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00dbe9]">
                VaultMind
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-black text-[#e1e2eb] md:text-4xl">
              {entries.length} entri tersimpan
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${syncTone}`}>
                {syncLabel}
              </span>
              <span className="rounded-full border border-[#3b494b] bg-[#1d2026] px-3 py-1 text-xs font-bold text-[#b9cacb]">
                Zero-knowledge
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGeneratePassword}
              className={secondaryButtonClass}
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
            <button
              onClick={handleExportBackup}
              className={secondaryButtonClass}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => lockVault("Vault dikunci.")}
              className={secondaryButtonClass}
            >
              <Lock className="h-4 w-4" />
              Kunci
            </button>
            <button
              onClick={handleDeleteLocalVault}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ffb4ab]/30 bg-[#ffb4ab]/10 px-4 py-3 text-sm font-bold text-[#ffb4ab] transition hover:bg-[#ffb4ab]/15"
            >
              <Trash2 className="h-4 w-4" />
              Hapus lokal
            </button>
            <button
              onClick={handleLogout}
              className={primaryButtonClass}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ["Total Entri", entries.length],
              ["Kategori Aktif", categoryCount],
              ["Tagihan", billCount],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[#3b494b]/70 bg-[#1d2026]/70 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#849495]">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black text-[#e1e2eb]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </header>

        {vaultMode === "open" && entries.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHealth(!showHealth)}
              className="flex w-full items-center justify-between rounded-xl border border-[#3b494b] bg-[#0b0e14]/70 px-4 py-3 text-left text-sm font-semibold text-[#e1e2eb] backdrop-blur-xl transition hover:border-[#00dbe9]"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#00dbe9]" />
                Password Health Report
              </span>
              <span className="text-[#849495]">
                {showHealth ? "Sembunyikan" : "Lihat"}
              </span>
            </button>
            {showHealth && (
              <div className="mt-3">
                <PasswordHealthPanel
                  entries={entries}
                  onNavigateToEntry={handleNavigateToEntry}
                  onRegeneratePassword={handleRegeneratePassword}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-2xl border border-white/10 bg-[#0b0e14]/70 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <h2 className="text-xl font-black text-[#e1e2eb]">
              {editingId ? "Edit entri" : "Tambah entri"}
            </h2>
            <form onSubmit={handleSaveEntry} className="mt-6 space-y-4">
              <label className="block">
                <span className={labelClass}>Nama layanan</span>
                <input
                  suppressHydrationWarning
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Username</span>
                <input
                  suppressHydrationWarning
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Password</span>
                <div className="relative">
                  <input
                    suppressHydrationWarning
                    type={showEntryPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className={`${fieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEntryPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 mt-2 flex w-12 items-center justify-center text-[#849495] transition hover:text-[#00dbe9]"
                    aria-label={
                      showEntryPassword
                        ? "Sembunyikan password entri"
                        : "Tampilkan password entri"
                    }
                  >
                    {showEntryPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>
              <PasswordStrengthBar password={form.password} />
              {form.password ? (
                <p className="text-xs text-[#849495]">
                  Status: {formPasswordStrength.label}
                </p>
              ) : null}
              <label className="block">
                <span className={labelClass}>URL</span>
                <input
                  suppressHydrationWarning
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Kategori</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as VaultEntry["category"],
                    }))
                  }
                  className={selectClass}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              {form.category === "Tagihan" ? (
                <label className="block">
                  <span className={labelClass}>
                    Tanggal jatuh tempo (setiap bulan)
                  </span>
                  <select
                    value={form.billingDueDay}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        billingDueDay: event.target.value,
                      }))
                    }
                    className={selectClass}
                  >
                    <option value="">Pilih tanggal</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Tanggal {day}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[#849495]">
                    Tagihan ini akan dianggap jatuh tempo setiap tanggal
                    tersebut tiap bulannya.
                  </p>
                </label>
              ) : null}
              <label className="block">
                <span className={labelClass}>Catatan</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-[#3b494b] bg-[#32353c] px-4 py-3 text-sm font-semibold text-[#e1e2eb] outline-none transition placeholder:text-[#849495] focus:border-[#00dbe9] focus:shadow-[0_0_0_3px_rgba(0,219,233,0.12)]"
                />
              </label>
              <button
                disabled={isBusy}
                className={`w-full ${primaryButtonClass}`}
              >
                {editingId ? "Simpan perubahan" : "Simpan entri"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className={`w-full ${secondaryButtonClass}`}
                >
                  Batal edit
                </button>
              ) : null}
            </form>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-[#0b0e14]/60 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#849495]" />
                <input
                  suppressHydrationWarning
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari nama, username, URL, kategori..."
                  className="w-full rounded-lg border border-[#3b494b] bg-[#32353c] py-3 pl-11 pr-4 text-sm font-semibold text-[#e1e2eb] outline-none transition placeholder:text-[#849495] focus:border-[#00dbe9] focus:shadow-[0_0_0_3px_rgba(0,219,233,0.12)]"
                />
              </div>
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="rounded-lg border border-[#3b494b] bg-[#32353c] px-4 py-3 text-sm font-semibold text-[#e1e2eb] outline-none transition focus:border-[#00dbe9] focus:shadow-[0_0_0_3px_rgba(0,219,233,0.12)]"
              >
                <option value="all">Semua kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    ref={(el) => {
                      if (el) entryRefs.current.set(entry.id, el as HTMLDivElement);
                    }}
                    className="group relative transition-all duration-500"
                  >
                    <VaultEntryCard
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCopy={handleCopy}
                    />
                    <button
                      onClick={() => setHistoryEntry(entry)}
                      className="absolute right-3 top-3 rounded-full border border-[#3b494b] bg-[#1d2026]/90 px-2.5 py-1 text-[10px] font-semibold text-[#b9cacb] opacity-0 transition-all hover:border-[#00dbe9] hover:text-[#00dbe9] group-hover:opacity-100"
                      title="Riwayat password"
                    >
                      Riwayat
                    </button>
                  </div>
                ))
              ) : (
                <EmptyVault />
              )}
            </div>
          </section>
        </div>
      </div>

      {historyEntry && (
        <PasswordHistoryModal
          entry={historyEntry}
          onClose={() => setHistoryEntry(null)}
          onRestore={handleRestoreHistory}
        />
      )}
    </main>
  );
}
