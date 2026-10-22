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
        // 🏛️ TUMHARA PURANA THEME (Archival/Editorial - Backup ke liye rakha hai)
        primary: "#1a1a18",
        paper: "#f7f5ef",
        surface: "#efece4",
        accent: "#1f3d2f",
        warn: "#a64b2a",

        // 🌐 NAYA WIKIPEDIA THEME (Clean, Data-Rich, Familiar)
        // Inhe change karke tu kabhi bhi naya look de sakta hai
        wiki: {
          bg: "#ffffff",          // Main page background
          "bg-alt": "#f8f9fa",    // Infobox background, Table headers
          text: "#202122",        // Main text (High Contrast for Seniors)
          "text-muted": "#54595d",// Secondary text, captions
          link: "#0645ad",        // Classic Wikipedia Blue for internal links
          "link-visited": "#0b0080", // Visited links
          border: "#a2a9b1",      // Standard table/infobox borders
          "border-light": "#c8ccd1", // Light borders for separators
        }
      },
      fontFamily: {
        // Tera current setup
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
        
        // Wikipedia style fonts
        "wiki-sans": ["Arial", "Helvetica", "sans-serif"],
        "wiki-serif": ["Georgia", "Times New Roman", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#202122', // Wiki text color
            fontFamily: 'var(--font-inter), Arial, sans-serif',
            a: {
              color: '#0645ad', // Wiki link blue
              '&:hover': {
                textDecoration: 'underline',
              },
              textDecoration: 'none',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-fraunces), Georgia, serif', // Wikipedia uses serif for headings
              fontWeight: 'normal',
              borderBottom: '1px solid #c8ccd1', // Classic Wiki heading underline
              paddingBottom: '0.3em',
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