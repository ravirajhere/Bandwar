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
        primary: "#1a1a18",
        paper: "#f7f5ef",
        surface: "#efece4",
        accent: "#1f3d2f",
        warn: "#a64b2a",
        wiki: {
          bg: "var(--bg-main)",
          "bg-alt": "var(--bg-alt)",
          header: "var(--bg-header)", // 👈 Naya color add kiya
          text: "var(--text-main)",
          "text-muted": "var(--text-muted)",
          link: "var(--link-color)",
          "link-visited": "var(--link-visited)",
          border: "var(--border-main)",
          "border-light": "var(--border-light)",
        },
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
            color: 'var(--text-main)',
            fontFamily: 'var(--font-inter), Arial, sans-serif',
            a: {
              color: 'var(--link-color)',
              '&:hover': { textDecoration: 'underline' },
              textDecoration: 'none',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontWeight: 'normal',
              borderBottom: '1px solid var(--border-light)',
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