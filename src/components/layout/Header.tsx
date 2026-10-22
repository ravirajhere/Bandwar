"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 Active link ke liye
import { MasterConfig } from "@/lib/schema";
import { Menu, X } from "lucide-react"; // 👈 Professional Icons

export function Header({ config }: { config: MasterConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Current URL check karne ke liye

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo / Site Name */}
        <Link 
          href="/" 
          className="font-serif text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity"
          onClick={() => setIsOpen(false)} // Mobile menu close on logo click
        >
          {config.site.name}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {config.nav.map((item) => {
            // Check if current path matches the link
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive 
                    ? "text-warn" // Active link color (Terracotta)
                    : "text-primary/70 hover:text-accent" // Normal & Hover color
                }`}
              >
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-primary hover:bg-surface rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}         // 👈 Accessibility
          aria-controls="mobile-menu"    // 👈 Accessibility
        >
          {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown (Smooth Animation) */}
      <div 
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-paper border-b border-primary/10 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                className={`text-base font-medium py-3 flex items-center gap-3 border-b border-primary/5 last:border-0 transition-colors ${
                  isActive 
                    ? "text-warn font-bold" 
                    : "text-primary/80 hover:text-accent"
                }`}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}