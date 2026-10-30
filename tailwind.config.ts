import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    // 🏛️ Professional Container Setup (Senior POV: Content shouldn't stretch too wide)
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
      },
      screens: {
        "2xl": "1400px", // Max width for desktop reading
      },
    },
    extend: {
      colors: {
        // 🏛️ THE NEW PREMIUM IDENTITY (Design Tokens)
        background: "var(--bg-main)",
        foreground: "var(--text-main)",
        card: {
          DEFAULT: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
        },
        brand: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-hover)",
          visited: "var(--brand-visited)", // Added for visited links
        },
        muted: {
          DEFAULT: "var(--text-muted)",
          background: "var(--bg-muted)",
        },
        border: {
          DEFAULT: "var(--border-main)",
          subtle: "var(--border-subtle)",
        },

        // 🔄 BACKWARDS COMPATIBILITY (Old classes mapped to new tokens)
        wiki: {
          bg: "var(--bg-main)",
          "bg-alt": "var(--bg-card)",
          header: "var(--bg-muted)",
          text: "var(--text-main)",
          "text-muted": "var(--text-muted)",
          link: "var(--brand-primary)",
          "link-visited": "var(--brand-visited)",
          border: "var(--border-main)",
          "border-light": "var(--border-subtle)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "12px", // Slightly rounder for modern feel
        xl: "16px",
      },
      // 💡 Added Premium Shadows for Cards & Images
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
      },
      // 💡 Senior POV: Subtle transitions
      transitionDuration: {
        '400': '400ms',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none', // We handle max-width in container now
            color: 'var(--text-main)',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '1.125rem', // Senior-friendly: Base text size is 18px
            lineHeight: '1.8',    // Senior-friendly: Better line spacing
            a: {
              color: 'var(--brand-primary)',
              '&:hover': { textDecoration: 'underline', color: 'var(--brand-hover)' },
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: '600',
              color: 'var(--text-main)',
            },
            h1: { fontSize: '2.5rem', marginBottom: '1.5rem' },
            h2: { fontSize: '2rem', marginTop: '2.5rem', marginBottom: '1rem' },
            h3: { fontSize: '1.5rem', marginTop: '2rem', marginBottom: '0.75rem' },
            p: { marginBottom: '1.5rem' },
            img: {
              borderRadius: '0.75rem',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;