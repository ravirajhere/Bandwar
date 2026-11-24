"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, User, MapPin, ArrowRight, Compass } from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  type: "article" | "person" | "page";
  category?: string;
  href: string;
}

interface CommandPaletteProps {
  searchIndex: SearchItem[];
}

export function CommandPalette({ searchIndex }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Filter results
  const filteredItems = query === "" 
    ? searchIndex.slice(0, 5) // Show recent/popular if empty
    : searchIndex.filter((item) => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        router.push(filteredItems[selectedIndex].href);
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-canvas border border-divider text-ink-muted text-sm rounded-sm hover:border-accent transition-colors"
      >
        <Search size={14} />
        <span>Search archive...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-divider bg-surface px-1.5 font-mono text-[10px] font-medium text-ink-muted opacity-100 ml-2">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="w-full max-w-xl bg-surface border border-divider rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-divider bg-canvas">
          <Search size={18} className="text-ink-muted mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, people, or pages..."
            className="flex-1 bg-transparent border-none outline-none text-ink placeholder:text-ink-muted text-base"
          />
          <kbd className="hidden sm:inline-block border border-divider bg-surface rounded px-1.5 text-[10px] text-ink-muted font-mono">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-ink-muted text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredItems.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => { router.push(item.href); setIsOpen(false); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors ${index === selectedIndex ? "bg-accent/10 text-accent" : "text-ink hover:bg-canvas"}`}
                  >
                    <div className={`p-1.5 rounded-sm ${index === selectedIndex ? "bg-accent/20 text-accent" : "bg-canvas text-ink-muted border border-divider"}`}>
                      {item.type === "article" && <FileText size={16} />}
                      {item.type === "person" && <User size={16} />}
                      {item.type === "page" && <Compass size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      {item.category && (
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-60 mt-0.5">{item.category}</p>
                      )}
                    </div>
                    {index === selectedIndex && <ArrowRight size={16} className="text-accent shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-canvas border-t border-divider px-4 py-2 flex items-center justify-between text-[10px] text-ink-muted">
          <span>Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Select with <kbd className="font-mono">↵</kbd></span>
        </div>
      </div>
    </div>
  );
}