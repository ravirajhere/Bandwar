"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft, FileText, User, Phone, MapPin } from "lucide-react";
import { SearchItem } from "@/lib/search-data";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchIndex: SearchItem[];
}

// 🚀 FIX: Escape regex special characters to prevent UI crashes on search
const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function SearchModal({ isOpen, onClose, searchIndex }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 🚀 Filter Logic
  const rawResults = query.trim() === "" 
    ? [] 
    : searchIndex.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20); // Limit to 20 results for performance

  const results = rawResults;

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input & Lock scroll
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

  // Keyboard Navigation & Focus Trap
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
        router.push(results[selectedIndex].url);
        onClose();
      } else if (e.key === "Tab" && modalRef.current) {
        // Accessibility Focus Trap
        const focusableElements = modalRef.current.querySelectorAll('input, button, a[href]');
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

  // 🚀 Highlight matched text (with escaped regex)
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-accent/15 text-accent font-semibold px-0.5">{part}</mark> 
        : <span key={i}>{part}</span>
    );
  };

  // 🚀 Type-based Icon & Label
  const getTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case "article": return { icon: <FileText size={16} aria-hidden="true" />, label: "Article" };
      case "person": return { icon: <User size={16} aria-hidden="true" />, label: "Person" };
      case "directory": return { icon: <Phone size={16} aria-hidden="true" />, label: "Directory" };
      case "landmark": return { icon: <MapPin size={16} aria-hidden="true" />, label: "Landmark" };
      default: return { icon: <FileText size={16} aria-hidden="true" />, label: "Page" };
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 3xl:pt-32 px-4 animate-in fade-in duration-200 no-print" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search archive"
    >
      <div 
        ref={modalRef}
        className="bg-surface w-full max-w-2xl 3xl:max-w-3xl border border-divider rounded-sm shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-divider p-4 3xl:p-5 bg-canvas shrink-0">
          <Search className="text-ink/40 ml-1 mr-3 shrink-0 3xl:w-6 3xl:h-6" size={22} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search the archive..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-ink font-serif text-lg md:text-xl 3xl:text-2xl outline-none placeholder:text-ink/30 placeholder:font-serif"
            aria-label="Search input"
          />
          <button 
            onClick={onClose} 
            className="p-2 text-ink/40 hover:text-ink hover:bg-divider/50 rounded-sm transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close search"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-2 3xl:p-3 custom-scrollbar bg-surface">
          {query.trim() === "" ? (
            // Formal Empty State
            <div className="flex flex-col items-center justify-center py-16 3xl:py-24 text-ink/40">
              <Search size={40} className="mb-4 opacity-30" aria-hidden="true" />
              <p className="text-sm font-medium uppercase tracking-wider mb-1">Archive Search</p>
              <p className="text-xs">Type a keyword to search across articles, people, and directory.</p>
            </div>
          ) : results.length === 0 ? (
            // No Results State
            <div className="text-center py-16 text-ink/60">
              <p className="text-base font-serif mb-1">No records found for "<strong className="text-ink">{query}</strong>"</p>
              <p className="text-xs uppercase tracking-wider">Try a different keyword.</p>
            </div>
          ) : (
            <ul className="space-y-0.5" ref={listRef}>
              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                const typeInfo = getTypeInfo(item.type || "page");

                return (
                  <li key={item.id}>
                    <Link 
                      href={item.url}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-start gap-3 p-3 rounded-sm transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isSelected 
                          ? "bg-canvas border-divider" 
                          : "border-transparent hover:bg-canvas/50"
                      }`}
                    >
                      {/* Type Icon */}
                      <div className={`mt-0.5 shrink-0 ${isSelected ? "text-accent" : "text-ink/40"}`}>
                        {typeInfo.icon}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`font-serif font-semibold text-[15px] truncate ${isSelected ? "text-accent" : "text-ink"}`}>
                            {highlightText(item.title, query)}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-ink/40 shrink-0 bg-canvas px-1.5 py-0.5 border border-divider rounded-sm">
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-ink/60 line-clamp-1 leading-snug">
                          {highlightText(item.description, query)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer (Keyboard Shortcuts Hint) */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-divider bg-canvas/80 text-[11px] text-ink/50 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded-sm font-mono text-[10px]">↑</kbd>
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded-sm font-mono text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded-sm font-mono text-[10px]">Enter</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-surface border border-divider px-1.5 py-0.5 rounded-sm font-mono text-[10px]">Esc</kbd>
              Close
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-accent">
            <CornerDownLeft size={12} aria-hidden="true" /> Archive Search
          </span>
        </div>
      </div>
    </div>
  );
}