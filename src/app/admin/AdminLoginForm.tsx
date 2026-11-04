"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Invalid administrative password.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh(); // Re-run middleware to catch new HttpOnly cookie
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm bg-surface border border-divider p-8 shadow-sm rounded-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-canvas border border-divider flex items-center justify-center rounded-sm text-accent">
            <Lock size={24} aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-xl font-serif font-bold text-center text-ink mb-2">Editorial Access</h1>
        <p className="text-xs text-center text-ink-muted mb-6">Restricted to Bandwar Archive Moderators.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 border border-divider bg-canvas text-ink text-sm rounded-sm focus:outline-none focus:border-accent"
              placeholder="Enter admin password"
              autoComplete="current-password"
              disabled={loading}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-10 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}