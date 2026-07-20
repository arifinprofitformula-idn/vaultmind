import { query } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type VerificationTokenRow = {
  id: string;
  user_id: string;
};

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Token tidak ditemukan." }, { status: 400 });
    }

    const tokenResult = await query<VerificationTokenRow>(
      `
        SELECT id, user_id FROM email_verification_tokens
        WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
      `,
      [token],
    );
    const verificationToken = tokenResult.rows[0];

    if (!verificationToken) {
      return Response.json(
        { error: "Token tidak valid atau sudah expired." },
        { status: 400 },
      );
    }

    await query("UPDATE users SET is_verified = true WHERE id = $1", [
      verificationToken.user_id,
    ]);

    await query("UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1", [
      verificationToken.id,
    ]);

    return Response.json({
      message: "Email berhasil diverifikasi. Silakan login.",
    });
  } catch (error) {
    console.error("[Verify Email Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
