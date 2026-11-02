"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Page load par theme check karna
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("bandwar-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 2. Toggle function
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("bandwar-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("bandwar-theme", "dark");
      setIsDark(true);
    }
  };

  // Hydration mismatch se bachne ke liye (Server par button nahi dikhega)
  if (!mounted) {
    return (
      <button className="p-2 text-ink-muted border border-divider rounded-sm opacity-50 cursor-wait" disabled>
        <div className="w-[18px] h-[18px]"></div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Dark Mode"
      className="p-2 text-ink-muted hover:text-ink hover:bg-canvas border border-divider rounded-sm transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {isDark ? (
        <Sun size={18} className="text-accent" />
      ) : (
        <Moon size={18} className="text-ink" />
      )}
    </button>
  );
}