"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Simple Nav Links for Encyclopedia
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Archive", href: "/section" },
    { label: "Directory", href: "/directory" },
    { label: "Map", href: "/#map" },
    { label: "People", href: "/people" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-canvas border-b border-divider h-14">
        <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-0">
          
          {/* Logo */}
          <Link href="/" className="font-serif text-xl font-bold text-ink tracking-tight hover:no-underline">
            Bandwar Archive
          </Link>

          {/* Desktop Nav (Strict & Flat) */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`text-sm ${isActive ? "text-ink font-semibold border-b-2 border-accent" : "text-accent hover:underline"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="text-ink-muted hover:text-ink">
              <Search size={18} />
            </button>
            <ThemeToggle />
            <button 
              className="lg:hidden text-ink"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-b border-divider bg-surface">
          <div className="flex flex-col p-2">
            {navLinks.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="p-2 text-sm text-accent border-b border-divider last:border-0 hover:bg-canvas"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}