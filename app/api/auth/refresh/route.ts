import {
  appendSetCookies,
  createRefreshCookie,
  createSessionCookie,
} from "@/lib/auth-cookies";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { parseCookie } from "cookie";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RefreshTokenRow = {
  id: string;
  user_id: string;
};

type UserEmailRow = {
  email: string;
};

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  return ip && ip.length > 0 ? ip : null;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const cookies = parseCookie(request.headers.get("cookie") ?? "");
    const rawToken = cookies.refresh_token;

    if (!rawToken) {
      return Response.json(
        { error: "Session tidak ditemukan. Silakan login." },
        { status: 401 },
      );
    }

    const tokenHash = hashToken(rawToken);
    const tokenResult = await query<RefreshTokenRow>(
      `
        SELECT id, user_id FROM refresh_tokens
        WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
      `,
      [tokenHash],
    );
    const storedToken = tokenResult.rows[0];

    if (!storedToken) {
      return Response.json(
        { error: "Session expired. Silakan login ulang." },
        { status: 401 },
      );
    }

    await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [
      storedToken.id,
    ]);

    const userResult = await query<UserEmailRow>(
      "SELECT email FROM users WHERE id = $1",
      [storedToken.user_id],
    );
    const user = userResult.rows[0];

    if (!user) {
      return Response.json(
        { error: "Session expired. Silakan login ulang." },
        { status: 401 },
      );
    }

    const accessToken = generateAccessToken(storedToken.user_id, user.email);
    const newRefreshToken = generateRefreshToken();
    const newHash = hashToken(newRefreshToken);

    await query(
      `
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
        VALUES ($1, $2, NOW() + INTERVAL '7 days', $3, $4)
      `,
      [
        storedToken.user_id,
        newHash,
        request.headers.get("user-agent") ?? null,
        getClientIp(request),
      ],
    );

    const headers = new Headers();
    appendSetCookies(headers, [
      createRefreshCookie(newRefreshToken),
      createSessionCookie(),
    ]);

    return Response.json(
      { accessToken },
      {
        headers,
      },
    );
  } catch (error) {
    console.error("[Refresh Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
