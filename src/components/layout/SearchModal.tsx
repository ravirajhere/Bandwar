"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 For smooth client-side routing
import { Search, X, FileText, CornerDownLeft } from "lucide-react";
import { SearchItem } from "@/lib/search-data";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchIndex: SearchItem[];
}

export function SearchModal({ isOpen, onClose, searchIndex }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter results
  const results = query.trim() === "" 
    ? [] 
    : searchIndex.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input, Lock scroll & Handle Tab focus trap
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Handle Keyboard (Esc, Up/Down, Enter, Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        router.push(results[selectedIndex].url); // 👈 Fixed: Using Next.js router
        onClose();
      } else if (e.key === "Tab" && modalRef.current) {
        // ♿ Accessibility: Focus Trap
        const focusableElements = modalRef.current.querySelectorAll(
          'input, button, a[href]'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, router]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Highlight matched text safely
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-accent/20 text-accent font-semibold px-0.5 rounded-sm">{part}</mark> 
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 3xl:pt-32 px-4 animate-in fade-in duration-200" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
    >
      <div 
        ref={modalRef}
        className="bg-surface w-full max-w-2xl 3xl:max-w-4xl border border-divider rounded-xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-divider p-4 3xl:p-5 bg-canvas/50">
          <Search className="text-ink/40 ml-1 mr-3 shrink-0 3xl:w-7 3xl:h-7" size={22} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for articles, landmarks, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-ink text-lg 3xl:text-xl outline-none placeholder:text-ink/40"
            aria-label="Search input"
          />
          <button 
            onClick={onClose} 
            className="p-1.5 text-ink/50 hover:text-ink hover:bg-divider/50 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close search"
          >
            <X size={20} className="3xl:w-6 3xl:h-6" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-2 3xl:p-3 custom-scrollbar">
          {query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-16 3xl:py-24 text-ink/50">
              <Search size={48} className="mb-4 opacity-20 3xl:w-16 3xl:h-16" />
              <p className="text-sm 3xl:text-base font-medium">Type to search across the archive</p>
              <p className="text-xs 3xl:text-sm mt-1">Try searching for "School", "Temple", or "History"</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-ink/60 text-sm 3xl:text-base">
              No records found for "<strong className="text-ink">{query}</strong>".<br/>
              <span className="text-xs 3xl:text-sm mt-2 block">Try a different keyword.</span>
            </div>
          ) : (
            <ul className="space-y-1" ref={listRef}>
              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li key={item.id}>
                    <Link 
                      href={item.url}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 3xl:p-5 rounded-lg transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected 
                          ? "bg-canvas border-divider shadow-sm" 
                          : "border-transparent hover:bg-canvas/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 3xl:gap-4 mb-1 sm:mb-0 w-full">
                        <div className={`p-2 3xl:p-3 rounded-md shrink-0 ${isSelected ? "bg-accent/10 text-accent" : "bg-canvas text-ink/40"}`}>
                          <FileText size={16} className="3xl:w-5 3xl:h-5" />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <span className={`font-medium text-[15px] 3xl:text-lg block truncate ${isSelected ? "text-accent" : "text-ink"}`}>
                            {highlightText(item.title, query)}
                          </span>
                          <p className="text-[13px] 3xl:text-base text-ink/60 line-clamp-1 mt-0.5">
                            {highlightText(item.description, query)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer (Keyboard Shortcuts Hint) */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3 3xl:px-6 3xl:py-4 border-t border-divider bg-canvas/50 text-xs 3xl:text-sm text-ink/50">
          <div className="flex items-center gap-4 3xl:gap-6">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded text-[10px] 3xl:text-xs font-mono">↑</kbd>
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded text-[10px] 3xl:text-xs font-mono">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded text-[10px] 3xl:text-xs font-mono">Enter</kbd>
              to select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded text-[10px] 3xl:text-xs font-mono">Esc</kbd>
              to close
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-accent">
            <CornerDownLeft size={12} className="3xl:w-4 3xl:h-4" /> Search Archive
          </span>
        </div>
      </div>
    </div>
  );
}