"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Filhaal ke liye password hardcoded hai. Baad mein isko secure karenge.
    if (password === "bandwar_admin_2026") {
      // Cookie set karke dashboard par bhejenge
      document.cookie = "admin_session=true; path=/; max-age=86400"; 
      router.push("/admin/dashboard");
    } else {
      setError("Invalid administrative password.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm bg-surface border border-divider p-8 shadow-sm rounded-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-canvas border border-divider flex items-center justify-center rounded-sm text-accent">
            <Lock size={24} />
          </div>
        </div>
        <h1 className="text-xl font-serif font-bold text-center text-ink mb-2">Editorial Access</h1>
        <p className="text-xs text-center text-ink-muted mb-6">Restricted to Bandwar Portal Moderators.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 border border-divider bg-canvas text-ink text-sm rounded-sm focus:outline-none focus:border-accent"
              placeholder="Enter admin password"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" className="w-full h-10 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-sm transition-colors">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}