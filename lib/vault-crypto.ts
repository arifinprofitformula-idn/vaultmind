// This module runs exclusively in the browser (Web Crypto API).
// Do NOT import from Server Components or API routes.

export type VaultEntry = {
  id: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: "Email" | "Bank" | "Sosmed" | "Kerja" | "Lainnya";
  createdAt: string;
  updatedAt: string;
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
    "Lainnya",
  ];

  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.username === "string" &&
    typeof entry.password === "string" &&
    (entry.url === undefined || typeof entry.url === "string") &&
    (entry.notes === undefined || typeof entry.notes === "string") &&
    typeof entry.category === "string" &&
    validCategories.includes(entry.category as VaultEntry["category"]) &&
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
