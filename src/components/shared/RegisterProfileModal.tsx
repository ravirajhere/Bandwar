"use client";

import { useState, useEffect } from "react";
import { X, Loader2, UserPlus, LogIn } from "lucide-react";
import { suggestUsername } from "@/lib/contributor";
import { useToast } from "@/components/ui/Toast";

interface RegisterProfileModalProps {
  onComplete: (contributor: any) => void;
  onCancel: () => void;
}

export function RegisterProfileModal({ onComplete, onCancel }: RegisterProfileModalProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [existingUsername, setExistingUsername] = useState("");
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  useEffect(() => {
    if (displayName.trim() && !isUsernameEdited) {
      setUsername(suggestUsername(displayName));
    }
  }, [displayName, isUsernameEdited]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contributor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, customUsername: username }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Welcome, ${data.contributor.displayName}!`, "success");
        onComplete(data.contributor);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contributor/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: existingUsername }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Welcome back, ${data.contributor.displayName}!`, "success");
        onComplete(data.contributor);
      } else {
        setError(data.error || "Username not found.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm no-print">
      <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl overflow-hidden border border-divider flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-start p-5 border-b border-divider bg-canvas/50 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-sm flex items-center justify-center shrink-0">
              {mode === "register" ? <UserPlus size={20} /> : <LogIn size={20} />}
            </div>
            <div>
              <h2 className="font-serif font-bold text-ink text-lg">
                {mode === "register" ? "Create Your Profile" : "Welcome Back"}
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                {mode === "register" 
                  ? "You must create a profile to contribute." 
                  : "Enter your private Login ID to sign in on this device."}
              </p>
            </div>
          </div>
          <button onClick={onCancel} disabled={isSubmitting} className="text-ink/50 hover:text-ink p-2 bg-surface border border-divider rounded-sm">
            <X size={18} />
          </button>
        </div>

        {mode === "register" ? (
          <form onSubmit={handleRegister} className="p-5 sm:p-6 overflow-y-auto space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="e.g. Ramesh Kumar" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
              <p className="text-[10px] text-ink-muted mt-1">This name will be visible publicly.</p>
            </div>

            {username && (
              <div className="bg-canvas border border-divider rounded-sm p-3">
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                  Private Login ID (Keep it secret)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-ink font-semibold">@</span>
                  <input type="text" value={username.replace('@', '')} onChange={(e) => { setIsUsernameEdited(true); setUsername(`@${e.target.value.replace(/[^a-zA-Z0-9_]/g, '')}`); }} className="flex-1 bg-transparent border-b border-divider text-ink font-mono text-sm outline-none pb-0.5 focus:border-accent" />
                </div>
                <p className="text-[10px] text-ink-muted mt-2">
                  You will use this ID to log in on other devices. This ID is <strong>never shown publicly</strong>. Only your name and photo will be visible.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Email <span className="text-ink/40 font-normal">(Optional)</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For verification only" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 p-2.5 rounded-sm">{error}</p>}

            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 rounded-sm border border-divider text-sm">Cancel</button>
              <button type="submit" disabled={isSubmitting || !username || displayName.length < 2} className="px-5 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white py-2 rounded-sm font-semibold text-sm disabled:opacity-50">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create & Continue"}
              </button>
            </div>

            <div className="text-center pt-3 border-t border-divider">
              <button type="button" onClick={() => setMode("login")} className="text-xs text-accent hover:underline">
                Already have an account? Sign in →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Your Private Login ID</label>
              <input type="text" value={existingUsername} onChange={(e) => setExistingUsername(e.target.value)} required placeholder="@yourusername" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
              <p className="text-[11px] text-ink-muted mt-1">This is the ID you created on another device.</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 p-2.5 rounded-sm">{error}</p>}

            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 rounded-sm border border-divider text-sm">Cancel</button>
              <button type="submit" disabled={isSubmitting || !existingUsername} className="px-5 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white py-2 rounded-sm font-semibold text-sm disabled:opacity-50">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
              </button>
            </div>

            <div className="text-center pt-3 border-t border-divider">
              <button type="button" onClick={() => setMode("register")} className="text-xs text-accent hover:underline">
                ← Create a new account instead
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}