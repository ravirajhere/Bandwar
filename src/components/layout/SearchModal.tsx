"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { SearchItem } from "@/lib/search-data";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchIndex: SearchItem[];
}

export function SearchModal({ isOpen, onClose, searchIndex }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery(""); // Reset query on close
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Filter results (Only Articles)
  const results = query.trim() === "" 
    ? [] 
    : searchIndex.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15); // Show only top 15 results

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-20 px-4 sm:pt-32 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-wiki-bg w-full max-w-2xl border border-wiki-border shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Click inside doesn't close
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-wiki-border-light p-3">
          <Search className="text-wiki-text-muted ml-1 mr-3" size={22} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-wiki-text text-lg outline-none placeholder:text-wiki-text-muted"
          />
          <button onClick={onClose} className="p-1 text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg-alt transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="text-center py-10 text-wiki-text-muted text-sm">
              Type something to search across all articles...
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-wiki-text-muted text-sm">
              No articles found for "<strong>{query}</strong>". Try a different keyword.
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={item.url}
                    onClick={onClose}
                    className="block p-3 hover:bg-wiki-bg-alt border border-transparent hover:border-wiki-border-light transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-wiki-text text-[15px]">{item.title}</span>
                      {/* Category tag hidden for now since it's all articles */}
                    </div>
                    <p className="text-[13px] text-wiki-text-muted line-clamp-1">{item.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}