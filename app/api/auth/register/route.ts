import { generateVerificationToken, hashPassword } from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";
import { getAppUrl } from "@/lib/server-env";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RegisterBody = {
  email?: unknown;
  password?: unknown;
};

type UserIdRow = {
  id: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is RegisterBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return Response.json({ error: "Body request tidak valid." }, { status: 400 });
    }

    if (typeof body.email !== "string") {
      return Response.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    if (typeof body.password !== "string" || body.password.length < 8) {
      return Response.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 },
      );
    }

    const existingUser = await query<UserIdRow>(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return Response.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(body.password);
    const insertedUser = await query<UserIdRow>(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email, passwordHash],
    );
    const userId = insertedUser.rows[0]?.id;

    if (!userId) {
      throw new Error("Gagal membuat user.");
    }

    const token = generateVerificationToken();

    await query(
      `
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '24 hours')
      `,
      [userId, token],
    );

    await sendVerificationEmail(email, token);

    const verificationUrl = `${getAppUrl()}/auth/verify?token=${token}`;

    return Response.json(
      {
        message: "Registrasi berhasil. Cek email untuk verifikasi.",
        ...(process.env.NODE_ENV !== "production" ? { verificationUrl } : {}),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Register Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
