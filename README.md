# 🏛️ Bandwar Village Archive

A community-built digital archive of Bandwar village, Begusarai (Bihar) — its history, temples, schools, culture, and daily life. 

This project is built on a **Data-Driven Architecture**. The entire website is static, requires no database, and is fully powered by JSON files. As a Solo Editor or Developer, you can manage the content via the `data/` folder, and customize the UI/layout via the `src/` folder.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square)](https://zod.dev/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (Custom Editorial & Archival Theme)
- **Data Validation:** Zod (Strict Type-Safety & Error Handling)
- **Maps & Icons:** Leaflet & Lucide React
- **Deployment:** Vercel (With Automated Pre-build Validation)

---

## 📂 Full File Structure

Yahan project ka pura structure diya gaya hai taaki tumhe pata ho ki kya kahan hai:

```text
bandwar-archive/
├── data/                   # 👑 CONTENT WORKSPACE (JSON Data)
│   ├── master.json         # Site Config, Homepage, Footer, Nav, SEO
│   ├── categories.json     # Categories for articles
│   ├── people.json         # Notable personalities directory
│   ├── vision.json         # Vision 2035 Manifesto
│   ├── media.json          # Gallery, Timeline, & Map (Landmarks)
│   └── articles/           # All articles (Split into files by category)
│       ├── education.json  
│       ├── culture.json    
│       └── ...             
│
├── public/                 # 📸 STATIC ASSETS
│   └── images/             # Put all photos here (e.g., images/education/photo.jpg)
│
├── scripts/                # ⚙️ AUTOMATION
│   └── validate.ts         # The engine that checks JSON for errors
│
├── src/                    # 💻 CORE APPLICATION CODE (UI & Logic)
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   │   ├── [id]/           # Dynamic Article Page (e.g., /article/snk-high-school)
│   │   ├── about/          # About page
│   │   ├── section/        # Archive/Category listing page
│   │   ├── globals.css     # Global Tailwind styles & Typography rules
│   │   ├── layout.tsx      # Main Layout (Header, Footer, Fonts)
│   │   ├── page.tsx        # Homepage (Hero, Stats, Latest Articles)
│   │   └── sitemap.ts      # Auto-generates sitemap.xml for Google
│   │
│   ├── components/         # Reusable UI Components
│   │   ├── article/        # Article related components
│   │   │   ├── ArticleCard.tsx # Card for homepage/lists
│   │   │   ├── FaqAccordion.tsx# Collapsible FAQs
│   │   │   ├── Infobox.tsx     # Right-side data sheet on articles
│   │   │   └── WikiText.tsx    # Parses [[id|label]] internal links
│   │   └── layout/         # Layout components
│   │       ├── Header.tsx      # Navigation bar & mobile menu
│   │       └── Footer.tsx      # Site footer
│   │
│   └── lib/                # Core Logic
│       ├── data.ts         # Functions to read JSON and pass to pages
│       └── schema.ts       # Zod schemas for strict data validation
│
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind custom colors and fonts
└── tsconfig.json           # TypeScript configuration
```

---

## 🛠️ Local Setup (For the first time)

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

## ✍️ How to Update Content (Solo Editor Workflow)

### 1. Adding or Updating an Article
- **File Location:** `data/articles/` (e.g., `education.json`).
- **Strict Rules:**
  - `id`: Must be lowercase, unique, and use hyphens (e.g., `snk-high-school`).
  - `lastUpdated`: Must be in `YYYY-MM-DD` format (e.g., `2026-10-22`).
  - `content`: Add new sections using `heading` and `text`.
  - **Internal Links:** To link to another article inside the text, use this format: `[[article-id|Display Text]]`.

### 2. Adding a New Person
- **File Location:** `data/people.json`.
- Add a new object to the `people` array. Ensure the `id` is unique and lowercase.

### 3. Adding a New Photo
- **Step 1:** Place the photo in `public/images/` (e.g., `public/images/education/my-photo.jpg`).
- **Step 2:** Open `data/media.json` and add it to the `gallery.photos` array.
- **Path Rule:** Write paths as `images/education/photo-name.jpg` (No leading slash `/`).

### 4. Updating the Timeline or Map
- **File Location:** `data/media.json`.
- Add an event to the `timeline` array with a `sortKey` (year) to place it chronologically.

### 5. Updating Homepage or Footer
- **File Location:** `data/master.json`.
- All text, links, and stats for the Home and Footer are driven by this single file.

---

## 💻 How to Update UI & Code (Developer Workflow)

If you want to change the design, layout, or logic, here is where you need to look:

- **Change Colors or Fonts:** Update `tailwind.config.ts` (for colors) and `src/app/layout.tsx` (for fonts).
- **Change Global Spacing/Typography:** Edit `src/app/globals.css`.
- **Update Homepage Layout:** Edit `src/app/page.tsx`.
- **Update Article Layout:** Edit `src/app/[id]/page.tsx`.
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

### SEO & Sitemaps
- **Sitemap:** The dynamic sitemap is available at `/sitemap.xml`. It includes all articles and their images.
- **Google Search Console:** Submit `https://bandwar.vercel.app/sitemap.xml` in the Search Console to ensure Google indexes new articles quickly.

---

## 🏆 Golden Rules

1. **Backup before UI changes:** If you are modifying files inside `src/`, test them locally first using `npm run dev`.
2. **JSON Syntax:** Always use double quotes (`"key": "value"`). JSON does not accept single quotes or comments (`//`).
3. **Strict Dates:** Always use `YYYY-MM-DD` format for `lastUpdated`.
4. **Unique IDs:** Every article, person, and photo must have a unique, lowercase `id`.
5. **Before deploying:** Always run `npm run validate` to ensure data integrity.

---
*Made with ❤️ by the Bandwar Village Community.*