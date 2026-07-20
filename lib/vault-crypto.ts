// This module runs exclusively in the browser (Web Crypto API).
// Do NOT import from Server Components or API routes.

export type PasswordHistoryEntry = {
  password: string;
  changedAt: string;
};

export type VaultEntry = {
  id: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: "Email" | "Bank" | "Sosmed" | "Kerja" | "Tagihan" | "Lainnya";
  billingDueDay?: number;
  passwordHistory?: PasswordHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type VaultHealthIssue = {
  entryId: string;
  entryName: string;
  type: "weak" | "old" | "reused";
  detail: string;
};

export type VaultHealthReport = {
  totalEntries: number;
  issues: VaultHealthIssue[];
  weakCount: number;
  oldCount: number;
  reusedCount: number;
  score: number; // 0-100
};

export type EncryptedVault = {
  id: "main";
  version: 1;
  kdf: {
    name: "PBKDF2-SHA256";
    iterations: number;
    salt: string;
  };
  cipher: {
    name: "AES-256-GCM";
    iv: string;
    data: string;
  };
  updatedAt: string;
};

export type PasswordScore = {
  label: string;
  score: number;
  tone: "danger" | "warning" | "success";
};

export const KDF_ITERATIONS = 600_000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy: Uint8Array<ArrayBuffer> = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function deriveVaultKey(
  masterPassword: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations,
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptEntries(
  key: CryptoKey,
  entries: VaultEntry[],
): Promise<EncryptedVault["cipher"]> {
  const iv = randomBytes(12);
  const plaintext = encoder.encode(JSON.stringify(entries));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    key,
    plaintext,
  );

  return {
    name: "AES-256-GCM",
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

function isPasswordHistoryEntry(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const h = value as Record<string, unknown>;
  return typeof h.password === "string" && typeof h.changedAt === "string";
}

function isVaultEntry(value: unknown): value is VaultEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  const validCategories: VaultEntry["category"][] = [
    "Email",
    "Bank",
    "Sosmed",
    "Kerja",
    "Tagihan",
    "Lainnya",
  ];

  const hasPasswordHistory =
    entry.passwordHistory === undefined ||
    (Array.isArray(entry.passwordHistory) &&
      entry.passwordHistory.every(isPasswordHistoryEntry));

  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.username === "string" &&
    typeof entry.password === "string" &&
    (entry.url === undefined || typeof entry.url === "string") &&
    (entry.notes === undefined || typeof entry.notes === "string") &&
    typeof entry.category === "string" &&
    validCategories.includes(entry.category as VaultEntry["category"]) &&
    (entry.billingDueDay === undefined ||
      (typeof entry.billingDueDay === "number" &&
        entry.billingDueDay >= 1 &&
        entry.billingDueDay <= 31)) &&
    hasPasswordHistory &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string"
  );
}

async function decryptEntries(
  key: CryptoKey,
  cipher: EncryptedVault["cipher"],
): Promise<VaultEntry[]> {
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(base64ToBytes(cipher.iv)),
    },
    key,
    toArrayBuffer(base64ToBytes(cipher.data)),
  );
  const parsed: unknown = JSON.parse(decoder.decode(plaintext));

  if (!Array.isArray(parsed) || !parsed.every(isVaultEntry)) {
    throw new Error("Vault data tidak valid.");
  }

  return parsed;
}

export async function createVault(
  masterPassword: string,
  entries: VaultEntry[] = [],
): Promise<{ key: CryptoKey; vault: EncryptedVault }> {
  const salt = randomBytes(32);
  const key = await deriveVaultKey(masterPassword, salt, KDF_ITERATIONS);
  const cipher = await encryptEntries(key, entries);

  return {
    key,
    vault: {
      id: "main",
      version: 1,
      kdf: {
        name: "PBKDF2-SHA256",
        iterations: KDF_ITERATIONS,
        salt: bytesToBase64(salt),
      },
      cipher,
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function unlockVault(
  masterPassword: string,
  vault: EncryptedVault,
): Promise<{ key: CryptoKey; entries: VaultEntry[] }> {
  const salt = base64ToBytes(vault.kdf.salt);
  const key = await deriveVaultKey(masterPassword, salt, vault.kdf.iterations);

  try {
    const entries = await decryptEntries(key, vault.cipher);
    return { key, entries };
  } catch {
    throw new Error("Master password salah atau vault rusak.");
  }
}

export async function sealVault(
  key: CryptoKey,
  previousVault: EncryptedVault,
  entries: VaultEntry[],
): Promise<EncryptedVault> {
  return {
    ...previousVault,
    cipher: await encryptEntries(key, entries),
    updatedAt: new Date().toISOString(),
  };
}

export function generateStrongPassword(length = 24): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+[]{}?";
  const maxValid = Math.floor(256 / alphabet.length) * alphabet.length - 1;
  let result = "";

  while (result.length < length) {
    const bytes = randomBytes(length - result.length);

    for (const byte of bytes) {
      if (byte > maxValid) {
        continue;
      }

      result += alphabet[byte % alphabet.length];

      if (result.length === length) {
        break;
      }
    }
  }

  return result;
}

export function scorePassword(password: string): PasswordScore {
  let score = 0;

  if (password.length >= 12) score += 25;
  if (password.length >= 16) score += 25;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  if (score >= 80) {
    return { label: "Sangat kuat", score, tone: "success" };
  }

  if (score >= 55) {
    return { label: "Cukup kuat", score, tone: "warning" };
  }

  return { label: "Perlu diperkuat", score, tone: "danger" };
}

export function createEntryId(): string {
  return crypto.randomUUID();
}

// ============================================================
// VAULT HEALTH REPORT
// ============================================================

const OLD_THRESHOLD_DAYS = 90;

export function analyzeVaultHealth(entries: VaultEntry[]): VaultHealthReport {
  const issues: VaultHealthIssue[] = [];
  const passwordMap = new Map<string, string[]>(); // password -> entryIds

  const now = Date.now();
  const oldCutoff = now - OLD_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  for (const entry of entries) {
    // Check weak passwords
    const strength = scorePassword(entry.password);
    if (strength.score < 55) {
      issues.push({
        entryId: entry.id,
        entryName: entry.name,
        type: "weak",
        detail: `Password \"${strength.label.toLowerCase()}\" (skor ${strength.score})`,
      });
    }

    // Check old passwords (not updated in 90+ days)
    const updatedMs = new Date(entry.updatedAt).getTime();
    if (updatedMs < oldCutoff) {
      const daysOld = Math.floor(
        (now - updatedMs) / (24 * 60 * 60 * 1000),
      );
      issues.push({
        entryId: entry.id,
        entryName: entry.name,
        type: "old",
        detail: `Terakhir diupdate ${daysOld} hari yang lalu`,
      });
    }

    // Track for reuse detection
    if (!passwordMap.has(entry.password)) {
      passwordMap.set(entry.password, []);
    }
    passwordMap.get(entry.password)!.push(entry.name);
  }

  // Check reused passwords
  for (const [, names] of passwordMap) {
    if (names.length > 1) {
      for (const name of names) {
        const entry = entries.find((e) => e.name === name);
        if (entry?.password && passwordMap.get(entry.password)?.length) {
          // Only add once per entry
          const alreadyTracked = issues.some(
            (i) => i.entryId === entry.id && i.type === "reused",
          );
          if (!alreadyTracked) {
            issues.push({
              entryId: entry.id,
              entryName: entry.name,
              type: "reused",
              detail: `Password sama dengan: ${passwordMap.get(entry.password)!.filter((n) => n !== entry.name).join(", ")}`,
            });
          }
        }
      }
    }
  }

  const weakCount = issues.filter((i) => i.type === "weak").length;
  const oldCount = issues.filter((i) => i.type === "old").length;
  const reusedCount = issues.filter((i) => i.type === "reused").length;

  // Score: start 100, subtract per issue (max penalty per category)
  const penalty = Math.min(weakCount * 10, 30) + Math.min(oldCount * 5, 20) + Math.min(reusedCount * 15, 30);
  const score = Math.max(0, 100 - penalty);

  return {
    totalEntries: entries.length,
    issues,
    weakCount,
    oldCount,
    reusedCount,
    score,
  };
}
