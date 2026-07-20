import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("vm_session")?.value === "1";

  // Optimistic page guard only; API authorization still uses Bearer JWT.
  if (hasSession && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/vault", request.url));
  }

  if (!hasSession && pathname.startsWith("/vault")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vault/:path*", "/auth/:path*"],
};
