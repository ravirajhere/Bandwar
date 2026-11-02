"use client";

import { useState, useEffect } from "react";
import { X, Hammer, Sparkles } from "lucide-react";

export function DevNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the notice
    const dismissed = localStorage.getItem("bandwar_dev_notice_dismissed");
    if (!dismissed) {
      // Small delay so it doesn't feel aggressive on load
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("bandwar_dev_notice_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-sm p-3 md:p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* Icon */}
      <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mt-0.5">
        <Hammer size={14} className="text-accent md:w-4 md:h-4" />
      </div>
      
      {/* Content */}
      <div className="flex-grow min-w-0">
        <p className="text-sm text-ink leading-relaxed m-0">
          <span className="font-bold text-accent inline-flex items-center gap-1">
            <Sparkles size={12} /> Under Development:
          </span>{" "}
          This portal is actively being built by the village community. New articles, photos, and features are added regularly. Some pages may still be incomplete — thank you for your patience.
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        aria-label="Dismiss notice"
      >
        <X size={16} />
      </button>
    </div>
  );
}