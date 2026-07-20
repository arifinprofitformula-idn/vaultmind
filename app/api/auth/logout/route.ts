import {
  appendSetCookies,
  clearRefreshCookie,
  clearSessionCookie,
} from "@/lib/auth-cookies";
import { hashToken } from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { parseCookie } from "cookie";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const cookies = parseCookie(request.headers.get("cookie") ?? "");
    const rawToken = cookies.refresh_token;

    if (rawToken) {
      await query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1",
        [hashToken(rawToken)],
      );
    }

    const headers = new Headers();
    appendSetCookies(headers, [clearRefreshCookie(), clearSessionCookie()]);

    return Response.json(
      { message: "Berhasil logout." },
      {
        headers,
      },
    );
  } catch (error) {
    console.error("[Logout Error]", error);

    return Response.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
