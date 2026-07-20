import {
  appendSetCookies,
  createRefreshCookie,
  createSessionCookie,
} from "@/lib/auth-cookies";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyPassword,
} from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type LoginUserRow = {
  id: string;
  email: string;
  password_hash: string;
  is_verified: boolean;
};

function isRecord(value: unknown): value is LoginBody {
  return typeof value === "object" && value !== null;
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  return ip && ip.length > 0 ? ip : null;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return Response.json({ error: "Body request tidak valid." }, { status: 400 });
    }

    if (typeof body.email !== "string" || body.email.trim().length === 0) {
      return Response.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    if (
      typeof body.password !== "string" ||
      body.password.trim().length === 0
    ) {
      return Response.json({ error: "Password wajib diisi." }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const userResult = await query<LoginUserRow>(
      "SELECT id, email, password_hash, is_verified FROM users WHERE email = $1",
      [email],
    );
    const user = userResult.rows[0];

    if (!user) {
      return Response.json(
        { error: "Email atau password salah." },
        { status: 401 },
      );
    }

    const passwordValid = await verifyPassword(body.password, user.password_hash);

    if (!passwordValid) {
      return Response.json(
        { error: "Email atau password salah." },
        { status: 401 },
      );
    }

    if (!user.is_verified) {
      return Response.json(
        { error: "Email belum diverifikasi. Cek inbox kamu." },
        { status: 403 },
      );
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await query(
      `
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
        VALUES ($1, $2, NOW() + INTERVAL '7 days', $3, $4)
      `,
      [
        user.id,
        tokenHash,
        request.headers.get("user-agent") ?? null,
        getClientIp(request),
      ],
    );

    const headers = new Headers();
    appendSetCookies(headers, [
      createRefreshCookie(refreshToken),
      createSessionCookie(),
    ]);

    return Response.json(
      { accessToken, user: { id: user.id, email: user.email } },
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    console.error("[Login Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
