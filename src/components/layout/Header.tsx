"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MasterConfig } from "@/lib/schema";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { SearchItem } from "@/lib/search-data";

// Header component props type
interface HeaderProps {
  config: MasterConfig;
  searchIndex: SearchItem[];
}

export function Header({ config, searchIndex }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 🏛️ Premium Sticky Header with Glass Effect */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="container-custom h-20 flex items-center justify-between">
          
          {/* Logo / Site Name */}
          <Link 
            href="/" 
            className="font-serif text-2xl md:text-3xl font-bold text-foreground hover:text-brand transition-colors shrink-0 tracking-tight"
            onClick={() => setIsOpen(false)}
          >
            {config.site.name}
          </Link>

          {/* Desktop Nav & Controls */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-1.5" aria-label="Main Navigation">
              {config.nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`px-4 py-2.5 rounded-full text-[15px] transition-all duration-200 flex items-center gap-2 ${
                      isActive 
                        ? "bg-brand/10 text-brand font-semibold" 
                        : "text-foreground/80 hover:bg-muted-background hover:text-foreground font-medium"
                    }`}
                  >
                    <span className="text-base opacity-80" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Controls */}
            <div className="flex items-center gap-3 pl-6 border-l border-border">
              {/* Search Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-foreground/70 hover:text-foreground bg-card hover:bg-muted-background border border-border rounded-full transition-all duration-200 shadow-sm hover:shadow"
                title="Search Articles"
                aria-label="Search Articles"
              >
                <Search size={18} />
              </button>

              {/* Dark/Light Mode Toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-foreground/70 hover:text-foreground bg-card border border-border rounded-full transition-all duration-200 shadow-sm"
              aria-label="Search Articles"
            >
              <Search size={20} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="p-2.5 text-foreground/70 hover:text-foreground bg-card border border-border rounded-full transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <div 
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-border bg-background ${
            isOpen ? "max-h-[600px] opacity-100 border-t" : "max-h-0 opacity-0 border-t-0"
          }`}
        >
          <nav className="px-4 py-4 flex flex-col gap-1.5" aria-label="Mobile Navigation">
            
            {/* Mobile Controls (Theme Toggle) */}
            <div className="flex justify-between items-center py-2 px-3 border-b border-border mb-2">
              <span className="text-sm font-semibold text-foreground">Appearance</span>
              <ThemeToggle />
            </div>

            {/* Mobile Links */}
            {config.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base py-3 px-4 rounded-xl flex items-center gap-3 transition-colors ${
                    isActive 
                      ? "text-brand font-semibold bg-brand/5" 
                      : "text-foreground/80 hover:text-foreground hover:bg-muted-background font-medium"
                  }`}
                >
                  <span className="text-lg opacity-80" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Search Modal Render */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        searchIndex={searchIndex} 
      />
    </>
  );
}