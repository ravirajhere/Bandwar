// src/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ navLinks }: { navLinks: { label: string; href: string; icon: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      backgroundColor: "var(--bg-base)",
      borderBottom: "1px solid var(--border-color)",
      backdropFilter: "blur(8px)",
      backgroundColor: "rgba(247, 245, 239, 0.9)" // For light mode transparency
    }}>
      <div className="container flex-between" style={{ height: "64px" }}>
        
        {/* Logo / Brand Name */}
        <Link href="/" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)" }}>
          Bandwar<span style={{ color: "var(--accent-green)" }}>.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: "none", gap: "var(--space-3)", alignItems: "center" }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--accent-green)" : "var(--text-primary)",
                  borderBottom: isActive ? "2px solid var(--accent-green)" : "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.2s ease"
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "flex",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "var(--text-primary)"
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <nav style={{
          position: "absolute",
          top: "64px",
          left: 0,
          right: 0,
          backgroundColor: "var(--bg-base)",
          borderBottom: "1px solid var(--border-color)",
          padding: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          boxShadow: "var(--shadow-md)"
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: "1.1rem",
                fontWeight: pathname === link.href ? 600 : 400,
                color: pathname === link.href ? "var(--accent-green)" : "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Simple CSS injection for hiding/showing desktop nav */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}} />
    </header>
  );
}