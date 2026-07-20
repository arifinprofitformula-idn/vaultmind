// SERVER-ONLY: Do NOT import from Client Components or browser code.

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { getJwtAccessSecret } from "./server-env";

type AccessTokenPayload = {
  sub: string;
  email: string;
  type: "access";
};

function isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "sub" in value &&
    "email" in value &&
    "type" in value &&
    typeof value.sub === "string" &&
    typeof value.email === "string" &&
    value.type === "access"
  );
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string, email: string): string {
  const secret = getJwtAccessSecret();
  const payload: AccessTokenPayload = { sub: userId, email, type: "access" };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES ??
      "15m") as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

export function verifyAccessToken(
  token: string,
): { sub: string; email: string } | null {
  try {
    const payload: unknown = jwt.verify(token, getJwtAccessSecret());

    if (!isAccessTokenPayload(payload)) {
      return null;
    }

    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
