"use client";

import { useState } from "react";
import { List, X, ChevronRight } from "lucide-react";

interface MobileTOCProps {
  content: { heading: string }[];
  hasFaqs: boolean;
}

export function MobileTOC({ content, hasFaqs }: MobileTOCProps) {
  const [isOpen, setIsOpen] = useState(false);

  const generateAnchorId = (heading: string) => 
    heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden no-print">
      {/* 🚀 Floating Action Button (Formal & Accessible) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-accent text-white p-3.5 rounded-full shadow-lg hover:bg-accent-hover transition-all active:scale-95 flex items-center justify-center border-2 border-canvas focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
        aria-label="Open Table of Contents"
        aria-expanded={isOpen}
      >
        <List size={22} />
      </button>

      {/* 🪟 Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          
          {/* Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Sheet Content */}
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Table of Contents"
            className="relative bg-surface w-full max-h-[85vh] rounded-t-2xl shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 ease-out border-t border-divider"
          >
            
            {/* 📌 Drag Handle (Native App Feel) */}
            <div className="w-full flex justify-center pt-3 pb-1 bg-canvas/30 shrink-0">
              <div className="w-12 h-1.5 bg-divider rounded-full"></div>
            </div>

            {/* Sheet Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-divider bg-canvas/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <List size={20} className="text-accent" />
                <h3 className="font-serif font-semibold text-ink text-lg m-0">Contents</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-ink/60 hover:text-ink p-2 bg-surface border border-divider rounded-full transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close Table of Contents"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sheet List */}
            <div className="overflow-y-auto p-3 sm:p-4">
              <ul className="space-y-1">
                {content.map((block, index) => (
                  <li key={index}>
                    <a 
                      href={`#${generateAnchorId(block.heading)}`}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between p-3.5 min-h-[48px] rounded-lg hover:bg-canvas active:bg-canvas/80 text-ink/80 hover:text-ink transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="font-medium text-[15px] leading-snug flex gap-3">
                        <span className="text-ink/40 font-mono text-sm mt-0.5 tabular-nums">{index + 1}.</span>
                        {block.heading}
                      </span>
                      <ChevronRight size={16} className="text-ink/30 group-hover:text-accent transition-colors shrink-0" />
                    </a>
                  </li>
                ))}
                {hasFaqs && (
                  <li>
                    <a 
                      href="#faqs"
                      onClick={handleLinkClick}
                      className="flex items-center justify-between p-3.5 min-h-[48px] rounded-lg hover:bg-canvas active:bg-canvas/80 text-ink/80 hover:text-ink transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent mt-2 border-t border-divider pt-4"
                    >
                      <span className="font-medium text-[15px] leading-snug flex gap-3">
                        <span className="text-ink/40 font-mono text-sm mt-0.5 tabular-nums">{content.length + 1}.</span>
                        Frequently Asked Questions
                      </span>
                      <ChevronRight size={16} className="text-ink/30 group-hover:text-accent transition-colors shrink-0" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}