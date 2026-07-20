// SERVER-ONLY: Do NOT import from Client Components or browser code.

import { verifyAccessToken } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export type AuthUser = { id: string; email: string };

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return null;
  }

  return { id: payload.sub, email: payload.email };
}
