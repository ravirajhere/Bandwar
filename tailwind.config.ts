import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    // 📱 Mobile to TV Breakpoints (No over-engineering, just exact needs)
    screens: {
      sm: "640px",   // Large Phones
      md: "768px",   // Tablets (Portrait)
      lg: "1024px",  // Tablets (Landscape) / Laptops
      xl: "1280px",  // Standard Desktops
      "2xl": "1536px", // Large Desktops
      "3xl": "1920px", // TV / 1080p
      "4xl": "2560px", // 4K TVs
    },
    // 🏛️ Unique Identity: "The Reading Container"
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem", // Mobile: safe thumb distance
        sm: "2rem",
        md: "3rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
        "3xl": "10rem",     // TV: Huge side margins so eyes don't travel far
        "4xl": "16rem",     // 4K TV: Theater mode margins
      },
      screens: {
        sm: "100%",
        md: "720px",
        lg: "960px",
        xl: "1140px",
        "2xl": "1280px", // Max width for standard reading
        "3xl": "1440px", // TV reading width
      },
    },
    extend: {
      colors: {
        // 🎨 NEW IDENTITY TOKENS (Modern Heritage)
        canvas: "var(--bg-canvas)",      // Deep/Off-white background
        surface: "var(--bg-surface)",    // Cards, Panels
        ink: {
          DEFAULT: "var(--text-ink)",    // Primary text
          muted: "var(--text-ink-muted)",// Secondary text
          inverted: "var(--text-inverted)"
        },
        accent: {
          DEFAULT: "var(--brand-accent)",// Primary Buttons/Links
          hover: "var(--brand-accent-hover)",
          subtle: "var(--brand-accent-subtle)"
        },
        divider: "var(--border-divider)", // Subtle lines
        
        // 🔄 Legacy mapping (Taaki purane components na tuute)
        background: "var(--bg-canvas)",
        foreground: "var(--text-ink)",
        card: {
          DEFAULT: "var(--bg-surface)",
        },
        muted: {
          DEFAULT: "var(--text-ink-muted)",
          background: "var(--bg-surface)",
        },
        border: "var(--border-divider)",
        wiki: {
          bg: "var(--bg-canvas)",
          "bg-alt": "var(--bg-surface)",
          header: "var(--bg-surface)",
          text: "var(--text-ink)",
          "text-muted": "var(--text-ink-muted)",
          link: "var(--brand-accent)",
          "link-visited": "var(--brand-accent-visited)",
          border: "var(--border-divider)",
        },
      },
      fontFamily: {
        // Serif for headings (Heritage), Sans for body (Modern readability)
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      
      // 🔠 FLUID TYPOGRAPHY (Mobile to TV seamless scaling)
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 0.8rem + 0.3vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.95rem + 0.4vw, 1.125rem)",      // Body Text
        "fluid-lg": "clamp(1.125rem, 1rem + 0.5vw, 1.25rem)",
        "fluid-xl": "clamp(1.25rem, 1.15rem + 0.8vw, 1.5rem)",
        "fluid-2xl": "clamp(1.5rem, 1.3rem + 1vw, 2rem)",            // H3
        "fluid-3xl": "clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)",      // H2
        "fluid-4xl": "clamp(2.25rem, 1.75rem + 2vw, 3.5rem)",        // H1
        "fluid-5xl": "clamp(2.5rem, 2rem + 2.5vw, 4.5rem)",          // Hero Display
      },
      
      spacing: {
        // Standardized spacing rhythm (based on 4px scale)
        'safe-top': 'env(safe-area-inset-top)', // iPhone notch safety
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      
      boxShadow: {
        // Formal, soft shadows. No heavy drop shadows.
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },

      // 📖 PROSE (For Articles, Privacy, Terms, etc.)
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            // Senior UX Rule: Max 70ch for perfect reading line length
            maxWidth: '70ch', 
            color: 'var(--text-ink)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1rem, 0.95rem + 0.4vw, 1.125rem)',
            lineHeight: '1.75',
            
            // Links (Distinct but formal)
            a: {
              color: 'var(--brand-accent)',
              textDecoration: 'none',
              fontWeight: '500',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s ease',
              '&:hover': {
                borderBottomColor: 'var(--brand-accent)',
              },
            },
            
            // Headings (Heritage feel)
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-serif)',
              fontWeight: '600',
              color: 'var(--text-ink)',
              scrollMarginTop: '120px', // For Table of Contents links
            },
            h1: { fontSize: 'clamp(2rem, 1.75rem + 1.5vw, 3rem)', marginTop: '0', marginBottom: '1.5rem', lineHeight: '1.2' },
            h2: { fontSize: 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)', marginTop: '2.5rem', marginBottom: '1rem', lineHeight: '1.3' },
            h3: { fontSize: 'clamp(1.25rem, 1.15rem + 0.8vw, 1.75rem)', marginTop: '2rem', marginBottom: '0.75rem' },
            
            // Text details
            p: { marginBottom: '1.5rem' },
            strong: { fontWeight: '600', color: 'var(--text-ink)' },
            
            // Lists
            'ul, ol': { paddingLeft: '1.5rem', marginBottom: '1.5rem' },
            li: { marginBottom: '0.5rem' },
            
            // Quotes
            blockquote: {
              fontStyle: 'italic',
              fontFamily: 'var(--font-serif)',
              borderLeftWidth: '3px',
              borderLeftColor: 'var(--brand-accent)',
              backgroundColor: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: '0 8px 8px 0',
              margin: '2rem 0',
              color: 'var(--text-ink)',
            },
            
            // Images & Captions
            img: {
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              margin: '2rem auto',
            },
            
            // Table (For Infoboxes / Data)
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9em',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            'thead th': {
              borderBottom: '2px solid var(--border-divider)',
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: '600',
            },
            'tbody td': {
              borderBottom: '1px solid var(--border-divider)',
              padding: '0.75rem',
            }
          },
        },
        // Special TV Prose (For 4K screens, if user wants to read full text on TV)
        tv: {
          css: {
            fontSize: 'clamp(1.25rem, 1.15rem + 0.5vw, 1.75rem)',
            maxWidth: '80ch',
            lineHeight: '1.6',
          }
        }
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;