"use client"; // Mobile menu toggle ke liye isko client component banana padta hai

import { useState } from "react";
import Link from "next/link";
import { MasterConfig } from "@/lib/schema";

export function Header({ config }: { config: MasterConfig }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#f7f5ef]/90 backdrop-blur-md border-b border-[#1a1a18]/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Site Name */}
        <Link href="/" className="font-serif text-2xl font-bold text-[#1a1a18] tracking-tight">
          {config.site.name}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {config.nav.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="text-sm font-medium text-[#1a1a18]/70 hover:text-[#1f3d2f] transition-colors flex items-center gap-1.5"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-[#1a1a18]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <nav className="md:hidden bg-[#f7f5ef] border-b border-[#1a1a18]/10 px-4 pt-2 pb-4 flex flex-col gap-3">
          {config.nav.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-medium text-[#1a1a18]/80 py-2 flex items-center gap-2 border-b border-[#1a1a18]/5 last:border-0"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}