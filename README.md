# 🏛️ Bandwar Village Portal

A community-built digital portal for Bandwar village, Begusarai (Bihar) — a living, interactive website designed for the village, its residents, and their descendants. 

Built with a **Modern Heritage UI** and **Top-Website-inspired inline editing**, this portal prioritizes accessibility (especially for senior citizens), speed, and a strict data-driven architecture. It is designed to be maintained by a **Solo Editor** while allowing seamless **Community Contributions** directly via a **Telegram Bot** (No database, no emails, zero cost).

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square&logo=zod)](https://zod.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Community_Edits-blue?style=flat-square&logo=telegram)](https://core.telegram.org/bots)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 📸 Screenshots

*(Yahan aap apni website ke screenshots add kar sakte hain)*

| Desktop View | Mobile View |
| :---: | :---: |
| `![Desktop View](https://via.placeholder.com/800x450?text=Desktop+View)` | `![Mobile View](https://via.placeholder.com/300x600?text=Mobile+View)` |
| **Article Page** | **Interactive Map** |
| `![Article](https://via.placeholder.com/800x450?text=Article+Page)` | `![Map](https://via.placeholder.com/800x450?text=Map+View)` |

---

## ✨ Key Features

### 🎨 UI/UX & Accessibility
- **Premium Heritage Design:** Warm earthy colors, Glassmorphism navbar, and Playfair Display + Inter typography.
- **Senior-Friendly:** Large touch targets, high contrast, and readable font sizes.
- **Dark/Light Mode:** Saves user preference via `localStorage` with no flash on load.
- **Hero Image Lightbox:** Clicking an article's main image opens it in a full-screen, distraction-free Lightbox.
- **Mobile Floating TOC:** A native app-style floating button on mobile that opens the Table of Contents in a bottom sheet, helping users navigate long articles easily.
- **Verified Trust Badge:** Articles display a green "Verified by [Name] on [Date]" badge to build visitor trust.
- **Premium Category Tags:** Beautiful, clickable category badges at the bottom of articles with icons.
- **Reading Progress Bar:** A sleek green line at the top of articles indicating scroll progress.
- **Text-to-Speech (TTS):** "Listen to Article" in Hindi for easy listening.
- **Live Weather & Time Widget:** Integrated in the footer using Open-Meteo API.

### 🌐 Community Contributions (The "Telegram Magic")
The website uses a custom **Telegram Bot integration** to allow visitors to suggest edits without any backend or database.
- **Wikipedia-Style Inline Editing:** Visitors can click the pencil (✏️) icon next to *any* text, paragraph, or Infobox data to suggest a correction.
- **Universal Add Content Modal:** Visitors can submit new Articles, Directory entries, People profiles, and Gallery photos directly from their respective pages.
- **Auto Image Compression & SEO Naming:** When a visitor uploads a photo, it is compressed **on their device** (saving your bandwidth). The system also auto-generates an SEO-friendly filename (e.g., `old-thakurbari-bandwar.jpg`) based on the title they enter.
- **Ready-to-Copy JSON Snippets:** Every Telegram message includes a perfectly formatted JSON block. The Editor can simply copy this block and paste it into the site's JSON files without typing anything manually.
- **Google Maps Level Location Picker:** If a map marker is wrong, users can drag the map, use the search bar (Nominatim API), or use GPS to suggest exact coordinates.
- **Red Links (Missing Articles):** Internal links to non-existent articles appear in red. Clicking them prompts the visitor to submit a request for that new article.
- **Auto-Backlinks:** Articles automatically show a "Mentioned In" section if other articles link to them.

### 🗺️ Core Pages & Features
- **Home Dashboard:** Interactive Satellite Map (Esri), Quick Access buttons, "Recently Updated" articles, and Village Stats.
- **Directory:** Searchable list of doctors, shops, and emergency contacts with inline editing.
- **Gallery:** Dedicated visual archive with category filters and a full-screen Lightbox. Includes auto-hide logic for missing images.
- **Article Archive:** Clean 3-column layout (TOC, Content, Infobox) with FAQ Schema.
- **Zero-Database Architecture:** 100% static site powered by JSON files. Ultra-fast load times and zero hosting costs for the database.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (with CSS Variables for Dark Mode & Themes)
- **Data Validation:** Zod (Strict Type-Safety)
- **Maps:** React Leaflet (Esri Satellite tiles, Marker Clustering)
- **Icons:** Lucide React
- **Forms/Notifications:** Custom Next.js API Route + Telegram Bot API
- **Weather:** Open-Meteo API (No API key required)
- **Deployment:** Vercel

---

## 📂 Detailed File Structure

    bandwar-portal/
    ├── data/                       # 👑 CONTENT WORKSPACE (Update JSONs here)
    │   ├── master.json             # Site Config, Homepage, Footer, Nav, SEO
    │   ├── directory.json          # Local services, doctors, shops
    │   ├── reach.json              # How to reach the village
    │   ├── media.json              # Gallery photos, Timeline events, Map landmarks
    │   ├── people.json             # Notable personalities directory
    │   ├── vision.json             # Vision 2035 Manifesto data
    │   ├── categories.json         # Article categories
    │   └── articles/               # All articles split by category
    │       ├── culture.json
    │       ├── education.json
    │       ├── geography.json
    │       ├── health.json
    │       ├── infrastructure.json
    │       ├── landmarks.json
    │       └── religion.json
    │
    ├── public/                     # 📸 STATIC ASSETS
    │   └── images/                 # All photos organized by category
    │
    ├── scripts/                    # ⚙️ AUTOMATION
    │   └── validate.ts             # The engine that checks JSON for errors before build
    │
    ├── src/                        # 💻 CORE APPLICATION CODE
    │   ├── app/                    # Next.js App Router (Pages)
    │   │   ├── api/telegram-submit/# Next.js API route for all Telegram integrations
    │   │   ├── article/[id]/       # Article Page (TOC, Reading Progress, Toolbar)
    │   │   ├── gallery/            # Dedicated Photo Gallery Page
    │   │   ├── directory/          # Village Directory Page
    │   │   ├── people/             # People Directory & Dynamic Profiles
    │   │   ├── contribute/         # Guide & General Feedback Hub
    │   │   ├── section/            # Archive/Category listing
    │   │   ├── globals.css         # Global styles, Tokens, Leaflet Overrides
    │   │   ├── layout.tsx          # Main Layout (Header, Footer, JSON-LD SEO)
    │   │   └── page.tsx            # Homepage (Hero, Map, Stats)
    │   │
    │   ├── components/             # Reusable UI Components
    │   │   ├── article/            # ArticleToolbar, FaqAccordion, Infobox, ReadingProgress, MobileTOC, ArticleHeroImage
    │   │   ├── contribute/         # ContributeForm (General Feedback)
    │   │   ├── directory/          # DirectoryClient, EditContactModal
    │   │   ├── layout/             # Header, Footer, SearchModal
    │   │   ├── place/              # LandmarkMap, EditLocationModal, GalleryGrid, Lightbox, AddLandmarkModal
    │   │   └── shared/             # AddContentModal, UniversalEditModal, ImageUpdateButton, LiveWeatherWidget, Toast
    │   │
    │   └── lib/                    # Core Logic
    │       ├── data.ts             # Reads JSON, Filters missing images, Sorts articles
    │       ├── search-data.ts      # Aggregates data for Global Search
    │       └── schema.ts           # Zod schemas (Strict typing for all JSON)
    │
    ├── tailwind.config.ts          # Custom colors (Heritage theme) and fonts
    └── package.json                # Dependencies

---

## 🛠️ Local Setup

1. Install dependencies:
   npm install

2. **Environment Variables:** Create a `.env.local` file in the root directory and add your Telegram Bot credentials:

    TELEGRAM_BOT_TOKEN="your_bot_token_here"
    TELEGRAM_CHAT_ID="your_chat_id_here"

3. Start the local development server:
   npm run dev

---

## ✍️ Editor Workflow (How to handle Contributions)

Since the site is static, you act as the database manager, but your workflow is now incredibly simple thanks to the Telegram Bot.

1. **Receive Telegram Message:** When a user submits a form, your Bandwar Bot will instantly send you a formatted message.
2. **Review & Copy:** Open the message on your phone. It contains the page ID, exact field name, old text, and new text. At the bottom, there is a **"📋 COPY-PASTE THIS JSON"** block. Tap on it to copy it.
3. **Update JSON (Mobile):** 
   - Open the **GitHub Mobile App**.
   - Navigate to the specific JSON file (e.g., `data/articles/education.json`).
   - Tap edit, make the necessary change (paste the data), add the `lastEditedBy` name for credit, and commit the change.
4. **Handle Images:** If a user uploaded a photo, download the compressed image from Telegram. Rename it exactly as suggested in the Telegram message (e.g., `old-thakurbari-bandwar.jpg`). Upload it to the specified folder (e.g., `public/images/religion/`), and update the `media.json` file with the exact filename.
5. **Auto Deploy:** Vercel detects the GitHub commit and automatically builds/deploys the new version.

### Special Rule: Auto-Hide Missing Images
In `src/lib/data.ts`, we implemented an `fs.existsSync` check. If you add a photo to `media.json` but forget to upload the actual file to `public/images/`, the website will **automatically hide** it to prevent broken image icons on the live site. Check your terminal build logs to see warnings about missing images.

---

## 🛡️ Data Validation (Crucial)

Because the website relies on Zod and JSON, a single missing comma will break the build. Vercel is configured to run validation automatically before deploying (using the `prebuild` script).

To run it manually:
npm run validate

- ✅ **Green Pass:** Data is perfect.
- ❌ **Red Fail:** The terminal will show exactly which field is missing. Fix the JSON immediately.

---

## 🏆 Golden Rules

1. **Telegram Credentials:** Never commit your `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` directly into the code. Always use Vercel's Environment Variables.
2. **JSON Syntax:** Always use double quotes. No comments allowed in JSON.
3. **Image Paths:** Do not use a leading slash in JSON (`images/home/hero.jpg`, NOT `/images/home/hero.jpg`). The code handles the slash automatically.
4. **Map Coordinates:** Always use decimal degrees (e.g., `25.5009`) for Latitude and Longitude.
5. **Image Optimization:** The system auto-compresses visitor images, but for your own uploads, try to keep them under 500KB (using WebP).

---
*Made with ❤️ & Curiosity by the Bandwar Village Community.*