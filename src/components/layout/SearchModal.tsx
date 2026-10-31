"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, FileText, CornerDownLeft } from "lucide-react";
import { SearchItem } from "@/lib/search-data";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchIndex: SearchItem[];
}

export function SearchModal({ isOpen, onClose, searchIndex }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter results (Sirf Articles)
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

  // Focus input & Lock scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Handle Keyboard (Esc, Up/Down, Enter)
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
        window.location.href = results[selectedIndex].url;
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);

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

  // Highlight matched text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="bg-brand/20 text-brand font-bold px-0.5 rounded">{part}</span> 
        : part
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background/80 dark:bg-black/80 flex items-start justify-center pt-20 px-4 sm:pt-32 backdrop-blur-md animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-card w-full max-w-2xl border border-border rounded-2xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border p-4 bg-muted-background">
          <Search className="text-muted ml-1 mr-3 shrink-0" size={22} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..." // 👈 Placeholder update kiya
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-foreground text-lg outline-none placeholder:text-muted"
          />
          <button 
            onClick={onClose} 
            className="p-1.5 text-muted hover:text-foreground hover:bg-background rounded-md transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-2 custom-scrollbar">
          {query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Type to search across all articles</p>
              <p className="text-xs mt-1">Try "School", "Temple", or "History"</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-muted text-sm">
              No articles found for "<strong className="text-foreground">{query}</strong>".<br/>
              <span className="text-xs mt-2 block">Try a different keyword.</span>
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
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl transition-all border ${
                        isSelected 
                          ? "bg-brand/5 border-brand/20 shadow-sm" 
                          : "border-transparent hover:bg-muted-background"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1 sm:mb-0">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-brand/10" : "bg-muted-background"}`}>
                          <FileText size={16} className="text-brand" />
                        </div>
                        <div>
                          <span className={`font-bold text-[15px] block ${isSelected ? "text-brand" : "text-foreground"}`}>
                            {highlightText(item.title, query)}
                          </span>
                          <p className="text-[13px] text-muted line-clamp-1 mt-0.5">
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

        {/* Footer (Keyboard Shortcuts Hint - Desktop Only) */}
        <div className="hidden md:flex items-center justify-between px-4 py-3 border-t border-border bg-muted-background text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono">↑</kbd>
              <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd>
              to select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd>
              to close
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-brand">
            <CornerDownLeft size={12} /> Search
          </span>
        </div>
      </div>
    </div>
  );
}