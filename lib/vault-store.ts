// This module runs exclusively in the browser (IndexedDB API).
// Do NOT import from Server Components or API routes.

import type { EncryptedVault } from "./vault-crypto";

const DB_NAME = "vaultmind-db";
const DB_VERSION = 1;
const STORE_NAME = "vaults";
const MAIN_KEY = "main";

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEncryptedVault(value: unknown): value is EncryptedVault {
  if (!isRecord(value) || !isRecord(value.kdf) || !isRecord(value.cipher)) {
    return false;
  }

  return (
    value.id === "main" &&
    value.version === 1 &&
    value.kdf.name === "PBKDF2-SHA256" &&
    typeof value.kdf.iterations === "number" &&
    typeof value.kdf.salt === "string" &&
    value.cipher.name === "AES-256-GCM" &&
    typeof value.cipher.iv === "string" &&
    typeof value.cipher.data === "string" &&
    typeof value.updatedAt === "string"
  );
}

export async function getStoredVault(): Promise<EncryptedVault | null> {
  const db = await openVaultDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(MAIN_KEY);

    request.onsuccess = () => {
      resolve((request.result as EncryptedVault | undefined) ?? null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveStoredVault(vault: EncryptedVault): Promise<void> {
  const db = await openVaultDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(vault, MAIN_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteStoredVault(): Promise<void> {
  const db = await openVaultDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(MAIN_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function exportVaultToJSON(vault: EncryptedVault): string {
  return JSON.stringify(vault, null, 2);
}

export function importVaultFromJSON(json: string): EncryptedVault {
  const parsed: unknown = JSON.parse(json);

  if (!isEncryptedVault(parsed)) {
    throw new Error("Format file backup tidak valid.");
  }

  return parsed;
}
