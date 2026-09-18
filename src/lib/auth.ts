import { createHash, timingSafeEqual } from "crypto";

export const AUTH_COOKIE = "mc_session";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export function sessionTokenFromPassword(password: string): string {
  return createHash("sha256")
    .update(`momcard:${password}:v1`)
    .digest("hex");
}

export function expectedSessionToken(): string | null {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw) return null;
  return sessionTokenFromPassword(pw);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifySessionCookie(value: string | undefined): boolean {
  const expected = expectedSessionToken();
  if (!expected || !value) return false;
  try {
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function sessionCookieOptions(secure?: boolean) {
  // Prefer Secure on HTTPS (cloudflare tunnel); allow override from login route.
  const useSecure =
    secure === true ||
    process.env.COOKIE_SECURE === "1" ||
    process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: useSecure,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
