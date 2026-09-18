"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("wrong password");
        setLoading(false);
        return;
      }
      // hard navigate so the session cookie is always picked up behind tunnels
      window.location.assign("/");
      return;
    } catch {
      setError("login failed");
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="mark">mc</span>
          <div>
            <h1 className="m-0 text-[18px] font-medium tracking-tight">
              momcard
            </h1>
            <p className="m-0 text-[12px]" style={{ color: "var(--muted)" }}>
              private local · family billing
            </p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="stat-k" htmlFor="password">
            password
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error ? (
            <p className="m-0 text-[12px]" style={{ color: "var(--bad)" }}>
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-gold mt-1" disabled={loading}>
            {loading ? "checking…" : "enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
