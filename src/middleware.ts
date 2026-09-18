import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "mc_session";

async function sessionTokenFromPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`momcard:${password}:v1`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const pw = process.env.DASHBOARD_PASSWORD;
  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  let ok = false;
  if (pw && cookie) {
    const expected = await sessionTokenFromPassword(pw);
    ok = cookie === expected;
  }

  if (!ok) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
