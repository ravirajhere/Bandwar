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
    setIsOpen(false); // Close sheet when a link is clicked
  };

  return (
    <div className="lg:hidden no-print">
      {/* 🚀 Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand text-white p-3.5 rounded-full shadow-elevated hover:bg-brand-hover transition-transform active:scale-95 flex items-center justify-center border-2 border-background"
        aria-label="Open Table of Contents"
      >
        <List size={22} />
      </button>

      {/* 🪟 Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          {/* Sheet Content */}
          <div className="relative bg-card w-full max-h-[80vh] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            
            {/* Sheet Header */}
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted-background shrink-0">
              <div className="flex items-center gap-2">
                <List size={20} className="text-brand" />
                <h3 className="font-serif font-semibold text-foreground text-lg">Contents</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-muted hover:text-foreground p-1.5 bg-background rounded-full transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sheet List */}
            <div className="overflow-y-auto p-4 custom-scrollbar">
              <ul className="space-y-1">
                {content.map((block, index) => (
                  <li key={index}>
                    <a 
                      href={`#${generateAnchorId(block.heading)}`}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted-background text-foreground/80 hover:text-brand transition-colors group"
                    >
                      <span className="font-medium text-[15px] leading-snug flex gap-3">
                        <span className="text-muted/60 font-mono text-sm mt-0.5">{index + 1}.</span>
                        {block.heading}
                      </span>
                      <ChevronRight size={16} className="text-border group-hover:text-brand transition-colors" />
                    </a>
                  </li>
                ))}
                {hasFaqs && (
                  <li>
                    <a 
                      href="#faqs"
                      onClick={handleLinkClick}
                      className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted-background text-foreground/80 hover:text-brand transition-colors group"
                    >
                      <span className="font-medium text-[15px] leading-snug flex gap-3">
                        <span className="text-muted/60 font-mono text-sm mt-0.5">{content.length + 1}.</span>
                        Frequently Asked Questions
                      </span>
                      <ChevronRight size={16} className="text-border group-hover:text-brand transition-colors" />
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