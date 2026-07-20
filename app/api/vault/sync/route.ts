import { query } from "@/lib/db";
import { getAuthUser } from "@/lib/get-auth-user";
import type { EncryptedVault } from "@/lib/vault-crypto";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type VaultRow = {
  encrypted_vault: EncryptedVault;
};

type SyncBody = {
  vault?: unknown;
};

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

function isSyncBody(value: unknown): value is SyncBody {
  return isRecord(value);
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query<VaultRow>(
      "SELECT encrypted_vault FROM vaults WHERE user_id = $1",
      [user.id],
    );

    if (result.rows.length === 0) {
      return Response.json(
        { error: "Vault belum ada di cloud." },
        { status: 404 },
      );
    }

    return Response.json({ vault: result.rows[0].encrypted_vault });
  } catch (error) {
    console.error("[Vault Sync GET Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();

    if (!isSyncBody(body) || !isEncryptedVault(body.vault)) {
      return Response.json(
        { error: "Format vault tidak valid." },
        { status: 400 },
      );
    }

    await query(
      `
        INSERT INTO vaults (user_id, encrypted_vault, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET encrypted_vault = EXCLUDED.encrypted_vault, updated_at = NOW()
      `,
      [user.id, body.vault],
    );

    return Response.json({ message: "Vault tersimpan." });
  } catch (error) {
    console.error("[Vault Sync POST Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await query("DELETE FROM vaults WHERE user_id = $1", [user.id]);

    return Response.json({ message: "Vault cloud dihapus." });
  } catch (error) {
    console.error("[Vault Sync DELETE Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
