# 🏛️ Bandwar Village Portal

A community-built digital portal for Bandwar village, Begusarai (Bihar) — a living, interactive website designed for the village, its residents, and their descendants. 

Built with a **Wikipedia-inspired, distraction-free UI**, this portal prioritizes accessibility (especially for senior citizens), speed, and a strict data-driven architecture.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square&logo=zod)](https://zod.dev/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## ✨ Key Features

- **Wikipedia-Style Layout:** Clean 3-column article layout (TOC, Content, Infobox), sharp borders, and no distracting animations.
- **Senior-Friendly Accessibility:** 
  - Global Font Size Adjuster (A- / A+) that saves user preference.
  - Dark/Light Mode toggle.
  - "Listen to Article" (Text-to-Speech).
  - Print & WhatsApp Share options.
- **Living Village Features:** 
  - Village Directory (Searchable list of doctors, shops, emergency contacts).
  - Mobile Emergency Sticky Bar (Direct call buttons).
  - Interactive Village Map with Satellite View toggle.
  - Photo Gallery with a full-screen Lightbox.
- **Zero-Database Architecture:** 100% static site powered by JSON files. No backend costs, ultra-fast load times.
- **Pre-Build Validation:** Zod validates all JSON data before deployment. If data is malformed, the Vercel build fails, ensuring the live site never crashes.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (with CSS Variables for Dark Mode & Themes)
- **Data Validation:** Zod (Strict Type-Safety)
- **Maps:** React Leaflet (with Esri Satellite tiles)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 📂 Detailed File Structure

```text
bandwar-portal/
├── data/                       # 👑 CONTENT WORKSPACE (Update JSONs here)
│   ├── master.json             # Site Config, Homepage, Footer, Nav, SEO, Emergency Contacts
│   ├── directory.json          # Local services, doctors, shops, emergency numbers
│   ├── events.json             # Village events and festivals
│   ├── reach.json              # How to reach the village (bus/train info)
│   ├── media.json              # Gallery photos, Timeline events, Map landmarks
│   ├── people.json             # Notable personalities directory
│   ├── vision.json             # Vision 2035 Manifesto data
│   └── articles/               # All articles (Split into files by category)
│       ├── education.json  
│       ├── culture.json    
│       └── ...             
│
├── public/                     # 📸 STATIC ASSETS
│   └── images/                 # Put all photos here (e.g., images/education/photo.jpg)
│
├── scripts/                    # ⚙️ AUTOMATION
│   └── validate.ts             # The engine that checks JSON for errors
│
├── src/                        # 💻 CORE APPLICATION CODE
│   ├── app/                    # Next.js App Router (Pages)
│   │   ├── article/[id]/       # Dynamic Article Page (3-column layout)
│   │   ├── about/              # About page
│   │   ├── contribute/         # Form to submit corrections/photos
│   │   ├── directory/          # Village Directory page (Search & Filter)
│   │   ├── events/             # Village Events page
│   │   ├── place/              # Map & Gallery page
│   │   ├── section/            # Archive/Category listing page
│   │   ├── vision/             # Vision 2035 page (With Before/After slider)
│   │   ├── globals.css         # Global Tailwind styles, CSS Variables, Print styles
│   │   ├── layout.tsx          # Main Layout (Header, Footer, Theme/Font scripts)
│   │   ├── not-found.tsx       # Custom 404 Page
│   │   ├── page.tsx            # Homepage (Portal Grid, Stats, Latest Articles)
│   │   └── sitemap.ts          # Auto-generates sitemap.xml for Google
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── article/            # Article components
│   │   │   ├── ArticleToolbar.tsx # Listen, Print, Share, A-/A+ controls
│   │   │   ├── FaqAccordion.tsx   # Collapsible FAQs
│   │   │   ├── Infobox.tsx        # Right-side data sheet on articles
│   │   │   └── WikiText.tsx       # Parses [[id|label]] internal links
│   │   ├── contribute/         # Form components for Contribute page
│   │   ├── directory/          # Search & Filter components for Directory
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx         # Navbar with Theme & Font Size toggles
│   │   │   ├── Footer.tsx         # Site footer
│   │   │   ├── EmergencyBar.tsx   # Sticky mobile emergency bar
│   │   │   ├── FontSizeControls.tsx # A- / A+ global font logic
│   │   │   └── ThemeToggle.tsx    # Dark/Light mode switch
│   │   └── place/              # Map & Gallery components
│   │       ├── GalleryGrid.tsx    # Photo grid with category filters
│   │       ├── Lightbox.tsx       # Full-screen image viewer
│   │       └── LandmarkMap.tsx    # Leaflet map with Satellite toggle
│   │
│   └── lib/                    # Core Logic
│       ├── data.ts             # Functions to read JSON and pass to pages
│       └── schema.ts           # Zod schemas for strict data validation
│
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies and scripts
├── tailwind.config.ts          # Tailwind custom colors (Wiki theme) and fonts
└── tsconfig.json               # TypeScript configuration
```

---

## 🛠️ Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   *The website will be live at `http://localhost:3000`.*

---

## ✍️ How to Update Content (Editor Workflow)

### 1. Adding or Updating an Article
- **File Location:** `data/articles/` (e.g., `education.json`).
- **Strict Rules:**
  - `id`: Must be lowercase, unique, and use hyphens (e.g., `snk-high-school`).
  - `lastUpdated`: Must be in `YYYY-MM-DD` format.
  - **Internal Links:** To link to another article, use `[[article-id|Display Text]]`.

### 2. Adding a Directory Entry (Doctor, Shop, etc.)
- **File Location:** `data/directory.json`.
- Add an object to the `items` array. Set `isEmergency: true` for urgent contacts.

### 3. Adding a New Event
- **File Location:** `data/events.json`.
- Add an object to the `events` array with date, title, type, description, and location.

### 4. Adding a New Photo
- **Step 1:** Place the photo in `public/images/`.
- **Step 2:** Open `data/media.json` and add it to the `gallery.photos` array.
- **Path Rule:** Write paths as `images/education/photo-name.jpg` (No leading slash `/`).

### 5. Updating Emergency Contacts (Mobile Bar)
- **File Location:** `data/master.json`.
- Update the `emergencyContacts` array.

---

## 💻 How to Update UI & Code (Developer Workflow)

If you want to change the design, layout, or add new features, here is where you need to look:

- **Change Colors or Fonts:** Update `tailwind.config.ts` (for colors) and `src/app/layout.tsx` (for fonts).
- **Change Global Spacing/Typography/Dark Mode Variables:** Edit `src/app/globals.css`.
- **Update Homepage Layout:** Edit `src/app/page.tsx`.
- **Update Article Layout:** Edit `src/app/article/[id]/page.tsx`.
- **Update Navigation/Footer:** Edit `src/components/layout/Header.tsx` and `Footer.tsx`.
- **Add a new field to JSON:** You MUST update the Zod Schema in `src/lib/schema.ts` first, otherwise the build will fail.

---

## 🛡️ Data Validation (The Most Important Step)

Because the website is built on JSON and Zod, a single missing comma or wrong date format will break the build.

**Always run this command in your terminal before pushing to GitHub:**

```bash
npm run validate
```

- ✅ **Green Pass:** Data is perfect. Push to GitHub.
- ❌ **Red Fail:** The terminal will show exact errors (e.g., `Field [articles.0.title]: Required`). Fix the JSON immediately.

> **🛡️ The "Prebuild" Safety Net:** Vercel is configured to run this validation *before* building. If your JSON is broken, Vercel will reject the deployment, ensuring the live site never crashes.

---

## 🚀 Deployment (Vercel)

The repository is connected directly to Vercel.

1. Make your changes.
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: added new article and updated UI"
   git push origin main
   ```
3. Vercel will automatically build and deploy.

---

## 🏆 Golden Rules

1. **Backup before UI changes:** If you are modifying files inside `src/`, test them locally first using `npm run dev`.
2. **JSON Syntax:** Always use double quotes (`"key": "value"`). JSON does not accept single quotes or comments (`//`).
3. **Strict Dates:** Always use `YYYY-MM-DD` format for `lastUpdated`.
4. **Unique IDs:** Every article, person, and photo must have a unique, lowercase `id`.
5. **Before deploying:** Always run `npm run validate` to ensure data integrity.

---
*Made with ❤️ & Curiosity by the Bandwar Village Community.*