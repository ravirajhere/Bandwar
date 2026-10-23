import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
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
        serif: ["var(--font-playfair)", "Georgia", "serif"], // Upgraded to Playfair
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-inter), sans-serif',
            a: {
              color: 'var(--brand-primary)',
              '&:hover': { textDecoration: 'underline', color: 'var(--brand-hover)' },
              textDecoration: 'none',
              fontWeight: '500',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: '600',
              color: 'var(--text-main)',
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