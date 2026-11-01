"use client";

import { useState, useEffect } from "react";
import { X, Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { suggestUsername } from "@/lib/contributor";
import { useToast } from "@/components/ui/Toast";

interface RegisterProfileModalProps {
  onComplete: (contributor: any) => void;
  onCancel: () => void;
}

export function RegisterProfileModal({ onComplete, onCancel }: RegisterProfileModalProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  // Auto-suggest username when name changes
  useEffect(() => {
    if (displayName.trim() && !username) {
      setUsername(suggestUsername(displayName));
    }
  }, [displayName, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contributor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim(), customUsername: username }),
      });
      const data = await res.json();

      if (data.success) {
        toast(`Welcome to the archive, ${data.contributor.username}!`, "success");
        onComplete(data.contributor);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl overflow-hidden border border-divider flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-start p-5 border-b border-divider bg-canvas/50 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-sm flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-ink text-lg">Create Your Profile</h2>
              <p className="text-sm text-ink-muted mt-1">You must create a profile to contribute to this archive.</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={isSubmitting} className="text-ink/50 hover:text-ink p-2 bg-surface border border-divider rounded-sm transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="e.g. Ramesh Kumar" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>

          {username && (
            <div className="bg-accent/5 border border-accent/20 rounded-sm p-3">
              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Your Username (You can change it once)</label>
              <div className="flex items-center gap-2">
                 <span className="text-sm font-mono text-accent font-semibold">@</span>
                 <input 
                   type="text" 
                   value={username.replace('@', '')} 
                   onChange={(e) => setUsername(`@${e.target.value.replace(/[^a-zA-Z0-9_]/g, '')}`)}
                   className="flex-1 bg-transparent border-b border-accent/30 text-accent font-mono text-sm outline-none pb-0.5 focus:border-accent"
                 />
              </div>
              <p className="text-[10px] text-ink-muted mt-2">This will be your public identity on the portal.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Email <span className="text-ink/40 font-normal">(Optional)</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For verification only" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 p-2.5 rounded-sm">{error}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 rounded-sm border border-divider text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting || !username || displayName.length < 2} className="px-5 flex items-center gap-2 bg-accent hover:bg-accent-hover text-white py-2 rounded-sm font-semibold transition-all disabled:opacity-50 text-sm">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Profile & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}