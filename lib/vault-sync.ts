// This module runs in the browser (fetch client).
// Do NOT import server-only modules here.

import type { EncryptedVault } from "./vault-crypto";

export async function uploadVault(
  accessToken: string,
  vault: EncryptedVault,
): Promise<void> {
  const res = await fetch("/api/vault/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ vault }),
  });

  if (!res.ok) {
    throw new Error("Gagal menyimpan vault ke cloud.");
  }
}

export async function downloadVault(
  accessToken: string,
): Promise<EncryptedVault | null> {
  const res = await fetch("/api/vault/sync", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Gagal mengunduh vault dari cloud.");
  }

  const data = (await res.json()) as { vault: EncryptedVault };
  return data.vault;
}

export async function deleteCloudVault(accessToken: string): Promise<void> {
  const res = await fetch("/api/vault/sync", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Gagal menghapus vault cloud.");
  }
}
