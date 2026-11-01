"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { SearchItem } from "@/lib/search-data";

interface HeaderProps {
  searchIndex?: SearchItem[];
}

export function Header({ searchIndex = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Core Navigation Links
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Archive", href: "/section" },
    { label: "Directory", href: "/directory" },
    { label: "People", href: "/people" },
    { label: "Gallery", href: "/gallery" },
    { label: "Vision", href: "/vision" },
    { label: "About", href: "/about" },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Keyboard shortcut for Search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 🏛️ Header Shell (Solid, Sticky, Flat) */}
      <header className="sticky top-0 z-50 bg-canvas border-b border-divider h-16 3xl:h-20 transition-colors duration-200">
        <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-0">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="font-serif text-xl 3xl:text-2xl font-bold text-ink tracking-tight hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Bandwar Archive
          </Link>

          {/* 💻 Desktop Navigation (GitHub Style Active States) */}
          <nav className="hidden lg:flex items-center h-full gap-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              // Check exact match or sub-path (e.g., /section/history)
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`h-full flex items-center px-4 text-sm 3xl:text-base transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                    isActive 
                      ? "text-ink font-semibold border-accent bg-canvas/50" 
                      : "text-ink-muted hover:text-ink font-medium border-transparent hover:border-divider hover:bg-surface/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 🛠️ Right Actions (Search, Theme, Mobile Menu) */}
          <div className="flex items-center gap-2">
            
            {/* Search Button (Wikipedia/Stripe style box) */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-ink-muted border border-divider bg-surface hover:bg-canvas rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Search Archive (Ctrl+K)"
            >
              <Search size={16} />
              <span className="text-xs pr-4">Search...</span>
              <kbd className="bg-canvas border border-divider px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-muted">Ctrl K</kbd>
            </button>

            {/* Mobile Search Icon */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Search Archive"
            >
              <Search size={20} />
            </button>

            <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* 📱 Mobile Menu (Solid Overlay, No Flashy Animation) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 3xl:top-20 bottom-0 z-40 bg-canvas overflow-y-auto border-t border-divider shadow-sm">
          <nav className="flex flex-col" aria-label="Mobile Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-6 py-4 text-base font-medium border-b border-divider transition-colors focus-visible:outline-none focus-visible:bg-surface ${
                    isActive 
                      ? "text-accent bg-surface border-l-4 border-l-accent" 
                      : "text-ink hover:bg-surface border-l-4 border-l-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          searchIndex={searchIndex} 
        />
      )}
    </>
  );
}