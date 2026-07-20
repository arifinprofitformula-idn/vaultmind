import { generateVerificationToken } from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { getAppUrl } from "@/lib/server-env";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type ForgotPasswordBody = {
  email?: unknown;
};

type ResetUserRow = {
  id: string;
  is_verified: boolean;
};

const SUCCESS_MESSAGE =
  "Jika email terdaftar dan sudah diverifikasi, link reset akan dikirim.";

function isRecord(value: unknown): value is ForgotPasswordBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();
    let resetUrl: string | null = null;

    if (!isRecord(body) || typeof body.email !== "string") {
      return Response.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();

    if (email.length === 0) {
      return Response.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const userResult = await query<ResetUserRow>(
      "SELECT id, is_verified FROM users WHERE email = $1",
      [email],
    );
    const user = userResult.rows[0];

    if (user?.is_verified === true) {
      const token = generateVerificationToken();

      await query(
        `
          INSERT INTO password_reset_tokens (user_id, token, expires_at)
          VALUES ($1, $2, NOW() + INTERVAL '1 hour')
        `,
        [user.id, token],
      );

      try {
        await sendPasswordResetEmail(email, token);
        resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}`;
      } catch (error) {
        console.error("[Password Reset Email Error]", error);
      }
    }

    return Response.json({
      message: SUCCESS_MESSAGE,
      ...(process.env.NODE_ENV !== "production" && resetUrl ? { resetUrl } : {}),
    });
  } catch (error) {
    console.error("[Forgot Password Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
