"use client";

import React, { useState } from "react";
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

  const citations = generateCitations({ title, author, siteName, url, date });
  const currentCitation = citations[activeFormat];

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
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-accent transition-colors bg-canvas border border-divider px-3 py-1.5 rounded-sm hover:border-accent"
      >
        <Quote size={14} /> Cite
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-divider rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-divider bg-canvas">
              <h3 className="font-serif font-bold text-ink flex items-center gap-2">
                <Quote size={18} className="text-accent" /> Cite this Article
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-ink-muted hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-2 mb-4 border-b border-divider pb-2 overflow-x-auto">
                {(["apa", "mla", "chicago", "bibtex"] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => { setActiveFormat(format); setCopied(false); }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${activeFormat === format ? "bg-accent text-white" : "text-ink-muted hover:bg-canvas"}`}
                  >
                    {format === "bibtex" ? "BibTeX" : format.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="bg-canvas p-4 rounded-sm border border-divider relative group min-h-[120px] flex items-center">
                <p className="text-sm text-ink font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {currentCitation}
                </p>
              </div>
            </div>

            <div className="p-4 bg-canvas border-t border-divider flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleCopy} 
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-accent text-white rounded-sm hover:bg-accent-hover transition-colors"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Citation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}