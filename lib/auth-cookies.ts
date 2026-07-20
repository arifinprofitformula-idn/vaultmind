import { stringifySetCookie } from "cookie";

const REFRESH_COOKIE = "refresh_token";
const SESSION_COOKIE = "vm_session";
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
const isProduction = process.env.NODE_ENV === "production";

export function createRefreshCookie(token: string): string {
  return stringifySetCookie({
    name: REFRESH_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearRefreshCookie(): string {
  return stringifySetCookie({
    name: REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 0,
  });
}

export function createSessionCookie(): string {
  return stringifySetCookie({
    name: SESSION_COOKIE,
    value: "1",
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearSessionCookie(): string {
  return stringifySetCookie({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export function appendSetCookies(headers: Headers, cookies: string[]): void {
  cookies.forEach((cookie) => headers.append("Set-Cookie", cookie));
}
