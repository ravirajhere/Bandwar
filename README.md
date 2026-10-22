# 🏛️ Bandwar Village Archive

A community-built digital archive of Bandwar village, Begusarai (Bihar) — its history, temples, schools, culture, and daily life.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square)](https://zod.dev/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

## 📖 Our Philosophy: "Code-Once, Edit Forever"

This project follows a strict **Static Site Generation (SSG)** architecture. The website requires **no database, no backend, and no CMS**. 

It is entirely driven by JSON data. As a **Solo Editor**, you never need to touch the complex React/Next.js code inside `src/`. Your entire workspace is the `data/` folder.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, SSG)
- **Styling:** Tailwind CSS (Custom theme integrated)
- **Data Validation:** Zod (Zero-Error Theorem implemented)
- **Icons:** Lucide React
- **Maps:** Leaflet & React-Leaflet
- **Deployment:** Vercel (Zero-config with Prebuild Validation)

---

## 📂 Folder Structure (Your Workspace)

Only focus on the **`data/`** and **`public/images/`** folders. The rest is automated.

```text
bandwar-archive/
├── data/                   # 👑 YOUR ONLY WORKSPACE
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
├── public/
│   └── images/             # 📸 Put all your photos here (WebP recommended)
│
├── scripts/                
│   └── validate.ts         # The Engine that checks your JSON for errors
│
└── src/                    # ⚠️ DO NOT TOUCH THIS FOLDER (Code is locked)
```

---

## 🛠️ Local Setup (For the first time)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local server:
   ```bash
   npm run dev
   ```
   *The website will be live at `http://localhost:3000`.*

---

## ✍️ The Solo Editor Workflow (How to add content)

### 1. Adding a New Article
- Create a new JSON file in `data/articles/` (e.g., `geography.json`).
- **Strict Rules:**
  - `id`: Must be lowercase with hyphens (e.g., `snk-high-school`). No spaces or capital letters.
  - `lastUpdated`: Must be in `YYYY-MM-DD` format (e.g., `2026-10-22`).
  - Internal Links: Use the `[[article-id|Display Text]]` format inside the `text` field.

### 2. Adding a New Person
- Open `data/people.json`.
- Add an object to the `people` array. Ensure the `id` is unique and lowercase.

### 3. Adding a New Photo
- Place the photo in the correct folder inside `public/images/` (e.g., `public/images/education/photo-name.jpg`).
- Open `data/media.json` and add a new object to the `gallery.photos` array.
- **Image Path Rule:** Write the path as `images/education/photo-name.jpg` (No leading slash `/`).

### 4. Updating the Timeline
- Open `data/media.json`.
- Add an event to the `timeline` array. Include the `sortKey` (year) for chronological sorting.

---

## 🛡️ Data Validation (The Most Important Step)

Because we use JSON and Zod, a single missing comma or a wrong date format (like writing `22-10-2026` instead of `2026-10-22`) will break the build.

**Always run this before pushing to GitHub:**

```bash
npm run validate
```

- ✅ **Green Pass:** Your data is 100% perfect. You can push.
- ❌ **Red Fail:** The terminal will show exact human-readable errors (e.g., `Field [articles.0.title]: Required`). Fix them immediately.

> **🛡️ The "Prebuild" Safety Net:** We have added a `prebuild` hook. Vercel will automatically run this validation *before* building the site. If your JSON is broken, **Vercel will reject the deployment**, saving your live site from crashing.

---

## 🚀 Deployment (Vercel)

Vercel is connected directly to this GitHub repository. 

1. Update your JSON or Images.
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: added new article and photos"
   git push origin main
   ```
3. Vercel will automatically trigger a build. If the `validate` script passes, your new site will be live in ~1 minute.

### Google Search Console Setup
After deploying, go to [Google Search Console](https://search.google.com/search-console) and submit your `sitemap.xml`. Our dynamic sitemap will automatically notify Google about all your new articles.

---

## 🏆 Golden Rules (Never Break These)

1. **Do not touch the `src/` folder.** The React code and UI are finalized to Enterprise standards.
2. **JSON Syntax:** Always use double quotes (`"key": "value"`). JSON does not accept single quotes or comments (`//`).
3. **Strict Dates:** Always use `YYYY-MM-DD` format for `lastUpdated`.
4. **Unique IDs:** Every article, person, and photo must have a unique, lowercase `id`.
5. **Before deploying:** Always run `npm run validate` locally if you have Node.js installed.

---
*Made with ❤️ by the Bandwar Village Community.*
