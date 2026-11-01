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
      "3xl": "1920px", // TV
      "4xl": "2560px", // 4K
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
        "3xl": "1440px", // Max reading width for TV
      },
    },
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        ink: {
          DEFAULT: "var(--text-ink)",
          muted: "var(--text-ink-muted)",
          inverted: "var(--text-inverted)",
        },
        accent: {
          DEFAULT: "var(--brand-accent)",
          hover: "var(--brand-accent-hover)",
          subtle: "var(--brand-accent-subtle)",
        },
        divider: "var(--border-divider)",
        // Semantic Colors for Forms, Alerts, and Toasts
        success: "var(--status-success)",
        warning: "var(--status-warning)",
        error: "var(--status-error)",
        info: "var(--status-info)",
      },
      fontFamily: {
        // Strict Serif for Headings (Encyclopedic Authority)
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        // Strict Sans for Body (High readability, Wikipedia/Meta style)
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        // Mono for Data, Coordinates, and Code
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      fontSize: {
        // High density sizes (No fancy fluid typography, just strict scaling)
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6' }], // Standard reading size
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.1' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      maxWidth: {
        // Reading constraints (Crucial for Top-Tier Content Sites)
        'reading': '75ch', // Wikipedia standard for articles
        'text': '65ch',    // Stricter width for sidebars/cards
      },
      borderRadius: {
        // Strict, almost sharp corners (GOV.UK / GitHub style)
        none: "0",
        sm: "2px",
        DEFAULT: "4px", 
      },
      boxShadow: {
        // ZERO soft or heavy shadows. Only structural shadows for Modals.
        'none': 'none',
        'strict': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
      },
      zIndex: {
        // Systematic Z-Index Layers (Prevents z-[9999] spaghetti code)
        'base': '0',
        'dropdown': '1000',
        'sticky': '1020',
        'header': '1030',
        'overlay': '1040',
        'modal': '1050',
        'toast': '1060',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: 'var(--text-ink)',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
            fontSize: '1rem',
            lineHeight: '1.8',
            // Strict Links (Wikipedia/Stripe style)
            a: {
              color: 'var(--brand-accent)',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline', textUnderlineOffset: '2px' },
            },
            // Formal Headings
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Georgia, Cambria, serif',
              fontWeight: 'bold',
              color: 'var(--text-ink)',
              scrollMarginTop: '100px', // For TOC anchors
            },
            h1: { fontSize: '2.25rem', lineHeight: '1.1', marginBottom: '1rem' },
            h2: { fontSize: '1.5rem', lineHeight: '1.3', marginTop: '2.5rem', marginBottom: '0.75rem', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border-divider)' },
            h3: { fontSize: '1.25rem', marginTop: '2rem', marginBottom: '0.5rem' },
            p: { marginBottom: '1.25rem' },
            blockquote: {
              fontStyle: 'italic',
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--brand-accent)',
              paddingLeft: '1rem',
              color: 'var(--text-ink-muted)',
              margin: '2rem 0',
            },
            'ul, ol': { paddingLeft: '1.5rem', marginBottom: '1.25rem' },
            li: { marginBottom: '0.5rem' },
          },
        },
        // Dark Mode Overrides
        invert: {
          css: {
            color: 'var(--text-ink)',
            'h1, h2, h3, h4, h5, h6': { color: 'var(--text-ink)' },
            blockquote: { color: 'var(--text-ink-muted)' },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;