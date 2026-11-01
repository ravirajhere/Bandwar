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
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        ink: {
          DEFAULT: "var(--text-ink)",
          muted: "var(--text-ink-muted)",
          inverted: "var(--text-inverted)"
        },
        accent: {
          DEFAULT: "var(--brand-accent)",
          hover: "var(--brand-accent-hover)",
          subtle: "var(--brand-accent-subtle)"
        },
        divider: "var(--border-divider)",
      },
      fontFamily: {
        // Strict Serif for Headings (Encyclopedia style)
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        // Strict Sans for reading (Wikipedia uses Arial/Helvetica, we use Inter)
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
      },
      fontSize: {
        // High density sizes
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem', // Fixed 16px for mobile/desktop
        'lg': '1.125rem', 
        'xl': '1.25rem',
        '2xl': '1.5rem', 
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      borderRadius: {
        // Strict, almost sharp corners
        none: "0",
        sm: "2px", // Very subtle
        DEFAULT: "4px",
      },
      boxShadow: {
        // ZERO soft shadows. Only strict dropdown/modal shadows.
        'none': 'none',
        'strict': '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;