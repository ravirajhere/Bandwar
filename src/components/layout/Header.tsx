"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal"; // Ensure path is correct
import { SearchItem } from "@/lib/search-data";

interface HeaderProps {
  searchIndex?: SearchItem[]; // Optional for now, but good for SearchModal
}

export function Header({ searchIndex = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Complete Navigation List (From your master.json architecture)
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
      <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-divider h-14 md:h-16 3xl:h-20 transition-all duration-200">
        <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-0">
          
          {/* 1. Logo & Branding */}
          <Link 
            href="/" 
            className="font-serif text-lg md:text-xl 3xl:text-2xl font-bold text-ink tracking-tight hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Bandwar Archive
          </Link>

          {/* 2. Desktop Navigation */}
          <nav className="hidden lg:flex items-center h-full gap-1 xl:gap-2" aria-label="Main Navigation">
            {navLinks.map((item) => {
              // Check for exact match or sub-path (e.g., /section/history)
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`h-full flex items-center px-3 xl:px-4 text-sm 3xl:text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                    isActive 
                      ? "text-ink font-semibold border-b-2 border-accent" 
                      : "text-ink-muted hover:text-ink font-medium hover:bg-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right Actions (Search, Theme, Mobile Menu) */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Search Archive (Ctrl+K)"
            >
              <Search size={18} className="3xl:w-6 3xl:h-6" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-ink-muted hover:text-ink hover:bg-surface rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. Mobile Menu Overlay (Smooth Transition) */}
      <div 
        className={`lg:hidden fixed inset-x-0 top-14 md:top-16 3xl:top-20 z-40 bg-canvas border-b border-divider shadow-lg transition-all duration-300 ease-in-out origin-top ${
          isOpen ? "scale-y-100 opacity-100 visible" : "scale-y-0 opacity-0 invisible"
        }`}
      >
        <nav className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto" aria-label="Mobile Navigation">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-6 py-4 text-base font-medium border-b border-divider transition-colors focus-visible:outline-none focus-visible:bg-surface ${
                  isActive ? "text-accent bg-surface border-l-4 border-l-accent" : "text-ink-muted hover:text-ink hover:bg-surface border-l-4 border-l-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 5. Search Modal Integration */}
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