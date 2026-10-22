import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a18",   // Dark text / Backgrounds
        paper: "#f7f5ef",     // Main Page Background
        surface: "#efece4",   // Cards, Infobox, Pullquote Background
        accent: "#1f3d2f",    // Dark Green (Buttons, Links)
        warn: "#a64b2a",      // Terracotta (Highlights, Badges)
        white: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1a1a18',
            a: {
              color: '#1f3d2f',
              '&:hover': {
                color: '#a64b2a',
              },
              textDecoration: 'none',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // 👈 Added by Expert (Must install)
  ],
};

export default config;