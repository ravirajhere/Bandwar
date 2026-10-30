# 🏛️ Bandwar Village Portal

A community-built digital portal for Bandwar village, Begusarai (Bihar) — a living, interactive website designed for the village, its residents, and their descendants. 

Built with a **Modern Heritage UI** and **Wikipedia-inspired editing**, this portal prioritizes accessibility (especially for senior citizens), speed, and a strict data-driven architecture. It is designed to be maintained by a **Solo Editor** while allowing seamless **Community Contributions** without requiring a traditional backend.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square&logo=zod)](https://zod.dev/)
[![Web3Forms](https://img.shields.io/badge/Web3Forms-Community_Edits-orange?style=flat-square)](https://web3forms.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## ✨ Key Features

### 🎨 UI/UX & Accessibility
- **Premium Heritage Design:** Warm earthy colors, Glassmorphism navbar, and Playfair Display + Inter typography.
- **Senior-Friendly:** Large touch targets, high contrast, and readable font sizes.
- **Dark/Light Mode:** Saves user preference via `localStorage` with no flash on load.
- **Live Weather & Time Widget:** Integrated in the footer using Open-Meteo API (updates every 30 mins).
- **Reading Progress Bar:** A sleek green line at the top of articles indicating scroll progress.
- **Text-to-Speech (TTS):** "Listen to Article" in Hindi for easy listening.

### 🌐 Community Contributions (The "No-Backend" Magic)
The website uses **Web3Forms** to allow visitors to suggest edits without a database.
- **Universal Add Content Modal:** Visitors can submit new Articles, Directory entries, People profiles, and Gallery photos directly from their respective pages.
- **Google Maps Level Location Picker:** If a map marker is wrong, users can drag the map (with fixed center pin), use the search bar (Nominatim API), or use GPS to suggest exact coordinates.
- **Inline Edit Buttons:** Pencil icons on Directory phone numbers, Images, and Articles to suggest quick corrections.
- **Editor Approval:** All submissions go directly to the Editor's email. Once approved, the Editor manually updates the JSON and pushes to GitHub.

### 🗺️ Core Pages & Features
- **Home Dashboard:** Interactive Satellite Map (Esri), Quick Access buttons, Latest Articles, and Village Stats.
- **Directory:** Searchable list of doctors, shops, and emergency contacts with inline editing.
- **Gallery:** Dedicated visual archive with category filters and a full-screen Lightbox. Includes auto-hide logic for missing images.
- **Article Archive:** Clean 3-column layout (TOC, Content, Infobox) with FAQ Schema and internal linking `[[article-id|label]]`.
- **Zero-Database Architecture:** 100% static site powered by JSON files. Ultra-fast load times and zero hosting costs for the database.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (with CSS Variables for Dark Mode & Themes)
- **Data Validation:** Zod (Strict Type-Safety)
- **Maps:** React Leaflet (Esri Satellite tiles, Marker Clustering)
- **Icons:** Lucide React
- **Forms:** Web3Forms (Serverless email submissions & file uploads)
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
    │       ├── education.json  
    │       ├── culture.json    
    │       └── ...
    │
    ├── public/                     # 📸 STATIC ASSETS
    │   ├── admin/                  # (Optional) CMS files if added later
    │   └── images/                 # All photos organized by category
    │
    ├── scripts/                    # ⚙️ AUTOMATION
    │   └── validate.ts             # The engine that checks JSON for errors before build
    │
    ├── src/                        # 💻 CORE APPLICATION CODE
    │   ├── app/                    # Next.js App Router (Pages)
    │   │   ├── article/[id]/       # Article Page (TOC, Reading Progress, Toolbar)
    │   │   ├── gallery/            # Dedicated Photo Gallery Page
    │   │   ├── directory/          # Village Directory Page
    │   │   ├── people/             # People Directory & Dynamic Profiles
    │   │   ├── contribute/         # Main contribution hub (Web3Forms)
    │   │   ├── section/            # Archive/Category listing
    │   │   ├── globals.css         # Global styles, Tokens, Leaflet Overrides
    │   │   ├── layout.tsx          # Main Layout (Header, Footer, JSON-LD SEO)
    │   │   └── page.tsx            # Homepage (Hero, Map, Stats)
    │   │
    │   ├── components/             # Reusable UI Components
    │   │   ├── article/            # ArticleToolbar, FaqAccordion, Infobox, ReadingProgress
    │   │   ├── contribute/         # ContributeForm (Hub)
    │   │   ├── directory/          # DirectoryClient, EditContactModal
    │   │   ├── layout/             # Header, Footer, SearchModal
    │   │   ├── people/             # PersonCard (implied)
    │   │   ├── place/              # LandmarkMap, EditLocationModal, GalleryGrid, Lightbox
    │   │   └── shared/             # AddContentModal, ImageUpdateButton, LiveWeatherWidget
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

2. **Important:** Open `src/components/shared/AddContentModal.tsx` and `src/components/place/EditLocationModal.tsx` and replace `YOUR_ACCESS_KEY_HERE` with your actual **Web3Forms Access Key**.

3. Start the local development server:
   npm run dev

---

## ✍️ Editor Workflow (How to handle Contributions)

Since the site is static, you act as the database manager.

1. **Receive Email:** When a user submits a form (Add Article, Fix Location, Update Number), Web3Forms sends an email to `ravirajbandwar@gmail.com`.
2. **Review:** Open the email. It contains all the exact data (and new Latitude/Longitude if it's a map fix).
3. **Update JSON:** 
   - If it's a new Article, add it to `data/articles/`.
   - If it's a Map fix, update the `lat` and `lng` in `data/media.json` inside the `landmarks` array.
4. **Push:** `git add .`, `git commit`, `git push`. Vercel will automatically update the live site.

### Special Rule: Auto-Hide Missing Images
In `src/lib/data.ts`, we implemented an `fs.existsSync` check. If you add a photo to `media.json` but forget to upload the actual file to `public/images/`, the website will **automatically hide** it to prevent broken image icons on the live site. Check your terminal build logs to see warnings about missing images.

---

## 🛡️ Data Validation (Crucial)

Because the website relies on Zod and JSON, a single missing comma will break the build.

**Always run this command before pushing to GitHub:**
npm run validate

- ✅ **Green Pass:** Data is perfect.
- ❌ **Red Fail:** The terminal will show exactly which field is missing.

---

## 🏆 Golden Rules

1. **Web3Forms Key:** Never commit your real API key if the repo is public. (In Next.js static sites, it is exposed to the client, which is fine for Web3Forms, but still good practice to keep it clean).
2. **JSON Syntax:** Always use double quotes. No comments allowed in JSON.
3. **Image Paths:** Do not use a leading slash in JSON (`images/home/hero.jpg`, NOT `/images/home/hero.jpg`). The code handles the slash automatically.
4. **Map Coordinates:** Always use decimal degrees (e.g., `25.5009`) for Latitude and Longitude.

---
*Made with ❤️ & Curiosity by the Bandwar Village Community.*