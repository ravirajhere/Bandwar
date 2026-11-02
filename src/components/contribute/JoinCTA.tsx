"use client";

import { useContributorGate } from "@/hooks/useContributorGate";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function JoinCTA() {
  const { contributor, requestLogin, registrationModal } = useContributorGate();

  return (
    <>
      {contributor ? (
        // Agar user pehle se login hai
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6 md:p-8 text-center mb-10">
          <CheckCircle2 size={32} className="text-green-600 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-ink mb-2">You're already a Contributor!</h3>
          <p className="text-sm text-ink-muted mb-5">
            Welcome back, {contributor.displayName}. You can now edit any text on the website inline.
          </p>
          <Link 
            href="/section"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-sm font-semibold text-sm transition-colors"
          >
            Go to Archive
          </Link>
        </div>
      ) : (
        // Agar user naya hai (login nahi hai)
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 md:p-10 text-center mb-12 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-ink mb-2">Ready to contribute?</h3>
          <p className="text-sm md:text-base text-ink-muted mb-6 max-w-lg mx-auto">
            Create a free profile to start suggesting edits, adding photos, or writing new articles. It only takes a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={requestLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-sm font-semibold transition-colors shadow-sm"
            >
              <UserPlus size={18} /> Create Profile / Sign In
            </button>
            <Link 
              href="/section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface border border-divider text-ink hover:bg-canvas px-8 py-3.5 rounded-sm font-semibold transition-colors shadow-sm"
            >
              Browse Archive
            </Link>
          </div>
        </div>
      )}
      
      {/* Modal open karne ke liye */}
      {registrationModal}
    </>
  );
}