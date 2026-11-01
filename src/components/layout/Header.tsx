"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MasterConfig } from "@/lib/schema";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { SearchItem } from "@/lib/search-data";

interface HeaderProps {
  config: MasterConfig;
  searchIndex: SearchItem[];
}

export function Header({ config, searchIndex }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Search shortcut (Ctrl+K / Cmd+K)
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="site-header no-print sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-divider transition-colors duration-300">
        <div className="container mx-auto h-16 md:h-20 3xl:h-24 flex items-center justify-between gap-4 px-4 md:px-0">
          
          {/* Logo / Site Name */}
          <Link 
            href="/" 
            className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-ink hover:text-accent transition-colors shrink-0 tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
            onClick={() => setIsOpen(false)}
          >
            {config.site.name}
          </Link>

          {/* 💻 Desktop & TV Nav */}
          <div className="hidden lg:flex items-center justify-end flex-1 gap-4 xl:gap-6">
            <nav className="flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
              {config.nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-3 xl:px-4 py-2 md:py-2.5 rounded-md text-sm xl:text-base whitespace-nowrap transition-all duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isActive 
                        ? "bg-surface text-accent font-semibold shadow-sm border border-divider" 
                        : "text-ink/80 hover:bg-surface hover:text-ink font-medium border border-transparent"
                    }`}
                  >
                    <span className="text-base opacity-80" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Controls */}
            <div className="flex items-center gap-2 xl:gap-3 pl-3 xl:pl-5 border-l border-divider shrink-0">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="group relative p-2 md:p-2.5 text-ink/70 hover:text-ink bg-surface hover:bg-surface/80 border border-divider rounded-md transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title="Search (Ctrl+K)"
                aria-label="Search"
              >
                <Search size={18} />
                
                <span className="hidden xl:block absolute -bottom-9 right-0 bg-ink text-canvas text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Ctrl + K
                </span>
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* 📱 Mobile & Tablet Controls */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-ink/70 hover:text-ink bg-surface border border-divider rounded-md transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button 
              className="p-2 text-ink/70 hover:text-ink bg-surface border border-divider rounded-md transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Nav Dropdown (Scrollable if links get longer) */}
        <div 
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-divider bg-canvas ${
            isOpen ? "max-h-[calc(100vh-4rem)] opacity-100 border-t overflow-y-auto" : "max-h-0 opacity-0 border-t-0"
          }`}
        >
          <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile Navigation">
            {config.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-base py-3 px-4 rounded-lg flex items-center gap-3 transition-colors ${
                    isActive 
                      ? "text-accent font-semibold bg-surface border border-divider shadow-sm" 
                      : "text-ink/80 hover:text-ink hover:bg-surface font-medium border border-transparent"
                  }`}
                >
                  <span className="text-lg opacity-80" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            
            {/* Theme Toggle isolated at bottom of mobile menu */}
            <div className="mt-4 pt-4 border-t border-divider flex items-center justify-between px-4">
              <span className="text-sm font-medium text-ink/70">Appearance</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        searchIndex={searchIndex} 
      />
    </>
  );
}