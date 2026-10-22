import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // 👈 Dark Mode enable karne ke liye yeh zaroori hai
  theme: {
    extend: {
      colors: {
        primary: "#1a1a18",
        paper: "#f7f5ef",
        surface: "#efece4",
        accent: "#1f3d2f",
        warn: "#a64b2a",
        // 👇 Wiki Colors ko CSS Variables se link kar diya 👇
        wiki: {
          bg: "var(--bg-main)",
          "bg-alt": "var(--bg-alt)",
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
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;