"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { SearchItem } from "@/lib/search-data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

interface HeaderProps {
  searchIndex?: SearchItem[];
}

export function Header({ searchIndex = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [contributor, setContributor] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Archive", href: "/section" },
    { label: "Directory", href: "/directory" },
    { label: "People", href: "/people" },
    { label: "Gallery", href: "/gallery" },
    { label: "Map", href: "/map" },
    { label: "About", href: "/about" },
  ];

  useEffect(() => {
    setIsOpen(false);
    const stored = localStorage.getItem("bandwar_contributor");
    if (stored) {
      try { setContributor(JSON.parse(stored)); } catch { setContributor(null); }
    } else {
      setContributor(null);
    }
  }, [pathname]);

  // TOP TIER: Scroll pe Header shrink + shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // TOP TIER: Mobile Menu khula ho to peeche scroll band
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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

  const handleLanguageClick = (lang: "en" | "hi" | "an") => {
    if (lang === "en") {
      setLanguage("en");
      return;
    }
    toast(
      "Notice: Multi-language support (Hindi & Angika) is currently in development. The archive remains fully accessible in English.",
      "info"
    );
  };

  const langBtn = (lang: "en" | "hi" | "an", label: string, isActive: boolean) =>
    `px-1.5 sm:px-2 py-1.5 transition-colors ${isActive ? "bg-accent text-white" : "text-ink-muted hover:bg-canvas hover:text-ink"}`;

  return (
    <>
      <header
        className={`sticky top-0 z-header bg-canvas/95 backdrop-blur border-b border-divider transition-all duration-300 ${
          isScrolled ? "h-14 shadow-sm" : "h-16 3xl:h-20"
        }`}
      >
        <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-0">
          <Link
            href="/"
            aria-label="Bandwar Village Archive Home"
            className="font-serif text-xl 3xl:text-2xl font-bold text-ink tracking-tight hover:opacity-80 shrink-0"
          >
            Bandwar Village Archive
          </Link>

          <nav className="hidden lg:flex items-center h-full gap-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`h-full flex items-center px-4 text-sm 3xl:text-base transition-colors border-b-2 ${
                    isActive
                      ? "text-ink font-semibold border-accent"
                      : "text-ink-muted hover:text-ink font-medium border-transparent hover:border-divider"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {contributor && (
              <Link
                href={`/contributors/${contributor.username}`}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-ink-muted hover:text-accent bg-canvas hover:bg-surface border border-divider rounded-pill transition-colors"
                title="My Profile"
              >
                <User size={16} aria-hidden="true" />
                <span className="truncate max-w-[120px]">{contributor.displayName}</span>
              </Link>
            )}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-ink/60 border border-divider bg-surface hover:bg-canvas hover:text-ink rounded-pill transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Search size={16} className="group-hover:text-accent transition-colors" aria-hidden="true" />
              <span className="text-xs font-medium pr-6">Search archive...</span>
              <kbd className="bg-canvas border border-divider px-1.5 py-0.5 rounded-sm text-[10px] font-mono text-ink/40 group-hover:text-ink/60 transition-colors">Ctrl K</kbd>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-ink-muted hover:text-ink"
              aria-label="Open Search"
            >
              <Search size={20} aria-hidden="true" />
            </button>

            {/* Language Toggle — TOP TIER: Ab state se chalega */}
            <div className="flex bg-surface border border-divider rounded-pill overflow-hidden text-[10px] sm:text-xs font-bold ml-1">
              <button onClick={() => handleLanguageClick("en")} className={langBtn("en", "EN", language === "en")} aria-label="Switch to English" aria-pressed={language === "en"}>
                EN
              </button>
              <button onClick={() => handleLanguageClick("hi")} className={langBtn("hi", "हिं", language === "hi")} aria-label="Hindi (Coming Soon)" aria-pressed={language === "hi"}>
                हिं
              </button>
              <button onClick={() => handleLanguageClick("an")} className={langBtn("an", "अं", language === "an")} aria-label="Angika (Coming Soon)" aria-pressed={language === "an"}>
                अं
              </button>
            </div>

            <ThemeToggle />

            <button
              className="lg:hidden p-2 text-ink-muted hover:text-ink ml-1"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-overlay bg-canvas overflow-y-auto border-t border-divider animate-fade-in">
          <div className="flex justify-between items-center px-6 py-4 border-b border-divider bg-surface/50">
            <span className="text-sm font-bold text-ink-muted uppercase tracking-wider">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-1 text-ink-muted hover:text-ink" aria-label="Close Menu">
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-col pb-6" aria-label="Mobile Navigation">
            <div className="px-6 py-4 border-b border-divider flex items-center justify-between bg-surface/30">
              <span className="text-sm font-medium text-ink">Language</span>
              <div className="flex bg-canvas border border-divider rounded-pill overflow-hidden text-xs font-bold">
                <button onClick={() => handleLanguageClick("en")} className={`px-4 py-1.5 ${language === "en" ? "bg-accent text-white" : "text-ink-muted"}`}>English</button>
                <button onClick={() => handleLanguageClick("hi")} className={`px-4 py-1.5 ${language === "hi" ? "bg-accent text-white" : "text-ink-muted"}`}>हिंदी</button>
                <button onClick={() => handleLanguageClick("an")} className={`px-4 py-1.5 ${language === "an" ? "bg-accent text-white" : "text-ink-muted"}`}>अंगिका</button>
              </div>
            </div>

            {contributor && (
              <Link
                href={`/contributors/${contributor.username}`}
                className="px-6 py-4 text-base font-bold border-b border-divider text-accent bg-accent/5 flex items-center gap-2"
              >
                <User size={18} aria-hidden="true" /> My Profile
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