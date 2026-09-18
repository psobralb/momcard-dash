import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  sessionTokenFromPassword,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  let password = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } else {
    const form = await request.formData();
    password = String(form.get("password") ?? "");
  }

  if (!process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json(
      { error: "DASHBOARD_PASSWORD not configured" },
      { status: 500 }
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

  const token = sessionTokenFromPassword(password);
  const proto = request.headers.get("x-forwarded-proto") || "";
  const urlHttps = request.url.startsWith("https://");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    AUTH_COOKIE,
    token,
    sessionCookieOptions(urlHttps || proto.includes("https"))
  );
  return res;
}
