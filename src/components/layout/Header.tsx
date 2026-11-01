"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User } from "lucide-react"; // 🚀 User icon add kiya
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { SearchItem } from "@/lib/search-data";

interface HeaderProps {
  searchIndex?: SearchItem[];
}

export function Header({ searchIndex = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [contributor, setContributor] = useState<any>(null); // 🚀 State for user
  const pathname = usePathname();

  // Nav links
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Archive", href: "/section" },
    { label: "Directory", href: "/directory" },
    { label: "People", href: "/people" },
    { label: "Gallery", href: "/gallery" },
    { label: "Vision", href: "/vision" },
    { label: "About", href: "/about" },
  ];

  useEffect(() => {
    setIsOpen(false);
    // 🚀 Check karein ki user logged in hai ya nahi
    const stored = localStorage.getItem("bandwar_contributor");
    if (stored) {
      try { setContributor(JSON.parse(stored)); } catch {}
    }
  }, [pathname]);

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
      <header className="sticky top-0 z-50 bg-canvas border-b border-divider h-16 3xl:h-20 transition-colors duration-200">
        <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-0">
          
          <Link href="/" className="font-serif text-xl 3xl:text-2xl font-bold text-ink tracking-tight hover:opacity-80">
            Bandwar Archive
          </Link>

          <nav className="hidden lg:flex items-center h-full gap-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`h-full flex items-center px-4 text-sm 3xl:text-base transition-colors border-b-2 ${
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

          <div className="flex items-center gap-2">
            
            {/* 🚀 PROFILE BUTTON (Agar user logged in hai) */}
            {contributor && (
              <Link 
                href={`/contributors/${contributor.username}`}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-ink-muted hover:text-accent bg-canvas hover:bg-surface border border-divider rounded-sm transition-colors"
                title="My Profile"
              >
                <User size={16} />
                <span>{contributor.username}</span>
              </Link>
            )}

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-ink-muted border border-divider bg-surface hover:bg-canvas rounded-sm transition-colors"
            >
              <Search size={16} />
              <span className="text-xs pr-4">Search...</span>
              <kbd className="bg-canvas border border-divider px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-muted">Ctrl K</kbd>
            </button>

            <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 text-ink-muted hover:text-ink">
              <Search size={20} />
            </button>

            <ThemeToggle />

            <button 
              className="lg:hidden p-2 text-ink-muted hover:text-ink"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 3xl:top-20 bottom-0 z-40 bg-canvas overflow-y-auto border-t border-divider">
          <nav className="flex flex-col">
            {/* Mobile Profile Link */}
            {contributor && (
              <Link 
                href={`/contributors/${contributor.username}`}
                className="px-6 py-4 text-base font-bold border-b border-divider text-accent bg-accent/5 flex items-center gap-2"
              >
                <User size={18} /> My Profile ({contributor.username})
              </Link>
            )}
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-6 py-4 text-base font-medium border-b border-divider ${
                    isActive ? "text-accent bg-surface border-l-4 border-l-accent" : "text-ink hover:bg-surface border-l-4 border-l-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {isSearchOpen && (
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} searchIndex={searchIndex} />
      )}
    </>
  );
}