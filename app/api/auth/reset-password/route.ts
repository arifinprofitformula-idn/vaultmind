import { hashPassword } from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type ResetPasswordBody = {
  token?: unknown;
  newPassword?: unknown;
};

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
};

function isRecord(value: unknown): value is ResetPasswordBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || typeof body.token !== "string") {
      return Response.json({ error: "Token tidak ditemukan." }, { status: 400 });
    }

    if (
      typeof body.newPassword !== "string" ||
      body.newPassword.length < 8
    ) {
      return Response.json(
        { error: "Password baru minimal 8 karakter." },
        { status: 400 },
      );
    }

    const resetTokenResult = await query<PasswordResetTokenRow>(
      `
        SELECT id, user_id FROM password_reset_tokens
        WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
      `,
      [body.token],
    );
    const resetToken = resetTokenResult.rows[0];

    if (!resetToken) {
      return Response.json(
        { error: "Token tidak valid atau sudah expired." },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(body.newPassword);

    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      resetToken.user_id,
    ]);

    await query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1", [
      resetToken.id,
    ]);

    await query(
      `
        UPDATE refresh_tokens SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL
      `,
      [resetToken.user_id],
    );

    return Response.json({
      message: "Password berhasil direset. Silakan login.",
    });
  } catch (error) {
    console.error("[Reset Password Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
