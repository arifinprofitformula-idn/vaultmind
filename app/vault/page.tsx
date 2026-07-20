"use client";

import EmptyVault from "@/components/EmptyVault";
import Input from "@/components/Input";
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

  if (isLoading || vaultMode === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050814] text-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
          <p className="mt-4 text-sm text-slate-400">Menyiapkan vault...</p>
        </div>
      </main>
    );
  }

  if (vaultMode === "create") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050814] px-6 py-12 text-slate-100">
        {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
        <form
          onSubmit={handleCreateVault}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-cyan-950/20"
        >
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
            Buat Vault
          </p>
          <h1 className="mt-4 text-3xl font-black text-white">
            Buat master password
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Master password tidak dikirim ke server. Simpan baik-baik, karena
            tanpa ini isi vault tidak bisa dibuka.
          </p>
          <div className="mt-8 space-y-5">
            <Input
              label="Master password"
              type="password"
              value={masterPassword}
              onChange={(event) => setMasterPassword(event.target.value)}
              placeholder="Minimal 12 karakter"
            />
            <PasswordStrengthBar password={masterPassword} />
            <p className="text-xs text-slate-500">
              Status: {masterStrength.label}
            </p>
            <Input
              label="Konfirmasi master password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            <button
              disabled={isBusy}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {isBusy ? "Membuat..." : "Buat Vault"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  if (vaultMode === "unlock") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050814] px-6 py-12 text-slate-100">
        {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
        <form
          onSubmit={handleUnlockVault}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-cyan-950/20"
        >
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
            Unlock Vault
          </p>
          <h1 className="mt-4 text-3xl font-black text-white">
            Masukkan master password
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Vault terenkripsi ditemukan di perangkat atau cloud. Dekripsi hanya
            dilakukan di browser Anda.
          </p>
          <div className="mt-8 space-y-5">
            <Input
              label="Master password"
              type="password"
              value={masterPassword}
              onChange={(event) => setMasterPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            <button
              disabled={isBusy}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {isBusy ? "Membuka..." : "Buka Vault"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200"
            >
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
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050814] px-6 py-8 text-slate-100">
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
              VaultMind
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">
              {entries.length} entri tersimpan
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sync status: {syncLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGeneratePassword}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-100"
            >
              Generate
            </button>
            <button
              onClick={handleExportBackup}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-100"
            >
              Export
            </button>
            <button
              onClick={() => lockVault("Vault dikunci.")}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-100"
            >
              Kunci
            </button>
            <button
              onClick={handleDeleteLocalVault}
              className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-100"
            >
              Hapus lokal
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-black text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {vaultMode === "open" && entries.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowHealth(!showHealth)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:border-slate-700 transition-colors"
            >
              {showHealth ? "▾ Sembunyikan" : "▸ Lihat"} Password Health Report
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
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6">
            <h2 className="text-xl font-black text-white">
              {editingId ? "Edit entri" : "Tambah entri"}
            </h2>
            <form onSubmit={handleSaveEntry} className="mt-6 space-y-4">
              <Input
                label="Nama layanan"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
              <PasswordStrengthBar password={form.password} />
              {form.password ? (
                <p className="text-xs text-slate-500">
                  Status: {formPasswordStrength.label}
                </p>
              ) : null}
              <Input
                label="URL"
                type="url"
                value={form.url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, url: event.target.value }))
                }
                placeholder="https://example.com"
              />
              <label className="block">
                <span className="text-sm font-bold text-slate-200">Kategori</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as VaultEntry["category"],
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              {form.category === "Tagihan" ? (
                <label className="block">
                  <span className="text-sm font-bold text-slate-200">
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
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  >
                    <option value="">Pilih tanggal</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Tanggal {day}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    Tagihan ini akan dianggap jatuh tempo setiap tanggal
                    tersebut tiap bulannya.
                  </p>
                </label>
              ) : null}
              <label className="block">
                <span className="text-sm font-bold text-slate-200">Catatan</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <button
                disabled={isBusy}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
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
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200"
                >
                  Batal edit
                </button>
              ) : null}
            </form>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari name, username, URL, kategori..."
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
              <select
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
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
                      className="absolute right-3 top-3 rounded-lg bg-slate-800/80 px-2.5 py-1 text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-slate-200 transition-all"
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
