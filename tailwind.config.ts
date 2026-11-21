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
      sm: "640px", md: "768px", lg: "1024px", xl: "1280px",
      "2xl": "1536px", "3xl": "1920px", "4xl": "2560px",
    },
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "2rem", lg: "3rem", "3xl": "6rem", "4xl": "8rem" },
      screens: { sm: "100%", md: "720px", lg: "960px", xl: "1140px", "2xl": "1280px", "3xl": "1440px" },
    },
    extend: {
      colors: {
        // 🏛️ BANDWAR IDENTITY: Warm Archive Palette
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        paper: "var(--bg-paper)", // New: for depth layers
        ink: {
          DEFAULT: "var(--text-ink)",
          muted: "var(--text-ink-muted)",
          subtle: "var(--text-ink-subtle)",
          inverted: "var(--text-inverted)",
        },
        // 🎨 Mithila Terracotta (Signature color)
        accent: {
          DEFAULT: "var(--brand-accent)",
          hover: "var(--brand-accent-hover)",
          subtle: "var(--brand-accent-subtle)",
          muted: "var(--brand-accent-muted)",
        },
        // 🌾 Warm dividers
        divider: {
          DEFAULT: "var(--border-divider)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        // Editorial gold for special moments
        gold: "var(--brand-gold)",
        
        // Semantic
        success: "var(--status-success)",
        warning: "var(--status-warning)",
        error: "var(--status-error)",
        info: "var(--status-info)",
      },
      fontFamily: {
        // 🚀 Fraunces — The signature typeface (Anthropic/Stripe inspired)
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.7' }],
        'lg': ['1.125rem', { lineHeight: '1.65' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.15' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
      },
      maxWidth: {
        'reading': '72ch', // Editorial standard
        'text': '60ch',
        'display': '90ch',
      },
      borderRadius: {
        // Sharp but refined (Apple/Stripe inspired)
        none: "0",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        // Warm-tinted shadows (not pure black)
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(124, 45, 18, 0.04)',
        'card': '0 1px 3px 0 rgba(124, 45, 18, 0.06), 0 1px 2px -1px rgba(124, 45, 18, 0.04)',
        'lifted': '0 4px 12px -2px rgba(124, 45, 18, 0.08), 0 2px 4px -2px rgba(124, 45, 18, 0.04)',
        'editorial': '0 8px 24px -4px rgba(28, 24, 21, 0.12)',
      },
      zIndex: {
        'base': '0', 'dropdown': '1000', 'sticky': '1020', 
        'header': '1030', 'overlay': '1040', 'modal': '1050', 'toast': '1060',
      },
      backgroundImage: {
        // Subtle paper texture (Swiss minimalism meets heritage)
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: '72ch',
            color: 'var(--text-ink)',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            '--tw-prose-body': 'var(--text-ink)',
            '--tw-prose-headings': 'var(--text-ink)',
            '--tw-prose-links': 'var(--brand-accent)',
            '--tw-prose-quotes': 'var(--text-ink-muted)',
            a: {
              color: 'var(--brand-accent)',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.15s ease',
              '&:hover': { borderBottomColor: 'var(--brand-accent)' },
            },
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontWeight: '600',
              letterSpacing: '-0.02em',
            },
            h1: { fontSize: '2.25rem', marginBottom: '1rem' },
            h2: { fontSize: '1.5rem', marginTop: '2.5rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-divider)' },
            h3: { fontSize: '1.25rem', marginTop: '2rem', marginBottom: '0.5rem' },
            blockquote: {
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              borderLeftWidth: '3px',
              borderLeftColor: 'var(--brand-gold)',
              paddingLeft: '1.5rem',
              margin: '2rem 0',
              color: 'var(--text-ink)',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;