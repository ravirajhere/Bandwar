import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "2rem",
        lg: "3rem",
        "3xl": "6rem",
        "4xl": "8rem",
      },
      screens: {
        sm: "100%",
        md: "720px",
        lg: "960px",
        xl: "1140px",
        "2xl": "1280px",
        "3xl": "1440px",
      },
    },
    extend: {
      colors: {
        // Single Source: globals.css ke Token se juda
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        paper: "var(--bg-paper)",
        elevated: "var(--bg-elevated)",
        ink: {
          DEFAULT: "var(--text-ink)",
          muted: "var(--text-ink-muted)",
          subtle: "var(--text-ink-subtle)",
          inverted: "var(--text-inverted)",
        },
        accent: {
          DEFAULT: "var(--brand-accent)",
          hover: "var(--brand-accent-hover)",
          subtle: "var(--brand-accent-subtle)",
          muted: "var(--brand-accent-muted)",
        },
        divider: {
          DEFAULT: "var(--border-divider)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        gold: "var(--brand-gold)",
        success: "var(--status-success)",
        warning: "var(--status-warning)",
        error: "var(--status-error)",
        info: "var(--status-info)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.65" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.35" }],
        "3xl": ["1.875rem", { lineHeight: "1.25" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
        "7xl": ["4.5rem", { lineHeight: "1.02" }],
        "8xl": ["6rem", { lineHeight: "1" }],
      },
      maxWidth: {
        reading: "72ch",
        text: "60ch",
        display: "90ch",
        article: "75ch",
      },
      // TOP TIER: Radius ab globals.css ke Token se — duplicate khatam
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-card)",
        md: "var(--radius-card)",
        lg: "var(--radius-card)",
        image: "var(--radius-image)",
        pill: "var(--radius-pill)",
        input: "var(--radius-input)",
        card: "var(--radius-card)",
      },
      // TOP TIER: Shadow bhi Token se
      boxShadow: {
        none: "none",
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        lifted: "var(--shadow-lifted)",
        editorial: "var(--shadow-editorial)",
      },
      zIndex: {
        base: "0",
        dropdown: "1000",
        sticky: "1020",
        header: "1030",
        overlay: "1040",
        modal: "1050",
        toast: "1060",
        progress: "1070",
      },
      // Motion — Top Tier Feel
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.3s ease both",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.8s linear infinite",
      },
      backgroundImage: {
        "paper-texture":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E\")",
        "hero-gradient":
          "linear-gradient(to top, rgba(28,24,21,0.65) 0%, rgba(28,24,21,0.25) 45%, transparent 70%)",
        "accent-gradient":
          "linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-hover) 100%)",
      },
    },
  },
  // TOP TIER: Typography plugin yahin rahega, par h2/h3 ka style globals.css se lega
  // Agar typography plugin use kar raha hai to ye rakhe, nahi to hata de
  plugins: [],
};

export default config;