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
      <header className="sticky top-0 z-50 bg-wiki-bg border-b border-wiki-border-light transition-colors">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo / Site Name */}
          <Link 
            href="/" 
            className="font-serif text-2xl font-bold text-wiki-text hover:text-black dark:hover:text-white transition-colors shrink-0"
            onClick={() => setIsOpen(false)}
          >
            {config.site.name}
          </Link>

          {/* Desktop Nav & Controls */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6" aria-label="Main Navigation">
              {config.nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`text-[15px] transition-colors flex items-center gap-1.5 pb-1 ${
                      isActive 
                        ? "text-wiki-text font-bold border-b-2 border-wiki-text" 
                        : "text-wiki-text hover:text-wiki-link hover:underline"
                    }`}
                  >
                    <span className="text-base opacity-70" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Controls */}
            <div className="flex items-center gap-3 pl-4 border-l border-wiki-border-light">
              {/* Search Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-wiki-text hover:bg-wiki-bg-alt border border-wiki-border-light transition-colors flex items-center justify-center"
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
              className="p-2 text-wiki-text hover:bg-wiki-bg-alt rounded-sm transition-colors"
              aria-label="Search Articles"
            >
              <Search size={22} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="p-2 text-wiki-text hover:bg-wiki-bg-alt rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-wiki-link"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <div 
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-wiki-bg-alt border-b border-wiki-border-light ${
            isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="px-4 pt-2 pb-4 flex flex-col gap-1" aria-label="Mobile Navigation">
            
            {/* Mobile Controls (Sirf Theme Toggle bacha hai) */}
            <div className="flex justify-between items-center py-2 border-b border-wiki-border-light mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-wiki-text">Theme</span>
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Links */}
            {config.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-[15px] py-3 flex items-center gap-3 border-b border-wiki-border-light last:border-0 transition-colors ${
                    isActive 
                      ? "text-wiki-text font-bold bg-wiki-bg" 
                      : "text-wiki-text hover:text-wiki-link"
                  }`}
                >
                  <span className="text-lg opacity-70" aria-hidden="true">{item.icon}</span>
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