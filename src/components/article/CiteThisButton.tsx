"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Quote, Copy, CheckCircle2, X } from "lucide-react";
import { generateCitations } from "@/lib/citation";

interface CiteThisButtonProps {
  title: string;
  author: string;
  siteName: string;
  url: string;
  date: string;
}

export function CiteThisButton({ title, author, siteName, url, date }: CiteThisButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<"apa" | "mla" | "chicago" | "bibtex">("apa");
  const [copied, setCopied] = useState(false);

  const citations = useMemo(
    () => generateCitations({ title, author, siteName, url, date }),
    [title, author, siteName, url, date]
  );
  const currentCitation = citations[activeFormat];

  // Esc se band + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCitation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-accent hover:border-accent text-xs font-semibold border border-divider rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Cite this article"
      >
        <Quote size={13} aria-hidden="true" /> Cite
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cite this article"
        >
          <div
            className="bg-surface border border-divider rounded-sm shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-divider bg-canvas">
              <h3 className="font-serif font-bold text-ink flex items-center gap-2">
                <Quote size={18} className="text-accent" aria-hidden="true" /> Cite this Article
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-muted hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm p-0.5"
                aria-label="Close"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-2 mb-4 border-b border-divider pb-2 overflow-x-auto">
                {(["apa", "mla", "chicago", "bibtex"] as const).map((format) => (
                  <button
                    type="button"
                    key={format}
                    onClick={() => { setActiveFormat(format); setCopied(false); }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${activeFormat === format ? "bg-accent text-white" : "text-ink-muted hover:bg-canvas"}`}
                  >
                    {format === "bibtex" ? "BibTeX" : format.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="bg-canvas p-4 rounded-sm border border-divider min-h-[120px] flex items-center">
                <p className="text-sm text-ink font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {currentCitation}
                </p>
              </div>
            </div>

            <div className="p-4 bg-canvas border-t border-divider flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-accent text-white rounded-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {copied ? <CheckCircle2 size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                {copied ? "Copied!" : "Copy Citation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}