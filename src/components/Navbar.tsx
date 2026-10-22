"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MasterConfig } from "@/lib/schema";
import { Menu, X } from "lucide-react";

export function Navbar({ config }: { config: MasterConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    // Wikipedia Style: Solid White Background, Thin Grey Border, No Blur
    <header className="sticky top-0 z-50 bg-wiki-bg border-b border-wiki-border-light">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Logo / Site Name */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className="font-serif text-2xl font-bold text-wiki-text hover:text-black transition-colors"
        >
          {config.site.name}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {config.nav.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-[15px] transition-colors flex items-center gap-1.5 pb-1 ${
                  isActive 
                    ? "text-wiki-text font-bold border-b-2 border-wiki-text" // Active State
                    : "text-wiki-text hover:text-wiki-link hover:underline" // Hover State (Blue)
                }`}
              >
                <span className="text-base opacity-70" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-wiki-text hover:bg-wiki-bg-alt rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-wiki-link"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      <div 
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-wiki-bg-alt border-b border-wiki-border-light ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 pt-2 pb-4 flex flex-col gap-1" aria-label="Mobile Navigation">
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
  );
}