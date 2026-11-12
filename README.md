<div align="center">

# 🏛️ Bandwar Village Archive

**Community-built, open-data digital archive for Bandwar village, Begusarai (Bihar).**

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square)](https://zod.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Live_Notifications-2CA5E0?style=flat-square&logo=telegram)](https://core.telegram.org/bots)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

</div>

---

## 📖 Table of Contents
1. [Philosophy & Architecture](#-philosophy--architecture)
2. [Key Features (Deep Dive)](#-key-features-deep-dive)
3. [Tech Stack](#-tech-stack)
4. [File Structure](#-file-structure)
5. [Local Setup Guide](#-local-setup-guide)
6. [The Editor Workflow (Mini-CMS)](#-the-editor-workflow-mini-cms)
7. [Data Validation Engine](#-data-validation-engine)
8. [Golden Rules for Maintenance](#-golden-rules-for-maintenance)

---

## 🏛️ Philosophy & Architecture

The Bandwar Archive is not just a website; it is a **digital preservation project**. It was built with a "Content-First, Zero-Database, Open-Data" philosophy.

- **Zero Database:** We use **GitHub as our CMS and Database**. Everything is stored in static `.json` files. This means zero hosting costs, 100% data ownership, and infinite scalability.
- **Open Data for AI & Research:** The website explicitly welcomes AI bots (GPTBot, ClaudeBot, Google-Extended) via `robots.ts`. The content is meant to be referenced by search engines and AI models globally.
- **Read-First, Edit-Second:** Inspired by Wikipedia, the website is in "Reading Mode" by default. Editing is intentional (via Edit Mode) to prevent accidental edits and maintain an authoritative tone.
- **Solo-Editor, Community-Driven:** Designed for a single editor to manage, but powered by community contributions via a Telegram Bot and an Inline Editing system.
- **Privacy First:** A contributor's Login ID is kept strictly private. Only the Display Name and Profile Photo are public.
- **Security First:** Admin routes are protected by HMAC-signed HTTP-only cookies. Moderation tools and GitHub API tokens are never exposed to the client.

---

## ✨ Key Features (Deep Dive)

### 🎨 The "Warm Archive" UI Identity
- **Aesthetic:** Inspired by The New York Times and Anthropic. Features a "Warm Aged Paper" background (`#FBF8F3`), "Mithila Terracotta" accents (`#7C2D12`), and editorial typography.
- **Typography:** Uses **Fraunces** (modern serif) for headings, **Inter** for body text, and **JetBrains Mono** for technical map data.
- **Dark Mode:** A custom "Obsidian" dark mode that saves preference via `localStorage` without page flashing (FOUC).
- **Responsive:** Fluid typography scaling from a 320px mobile screen to a 4K TV.

### 🗺️ Cartographic Index (`/map` Page)
- **Formal Design:** A dedicated map page designed like an archival atlas. Uses formal numbered markers, a scale bar, and live coordinate tracking.
- **A-Z Index:** A sidebar with an alphabetical searchable index of all landmarks. Clicking a landmark auto-pans the map.
- **Location Fixing:** A crowdsourced "Report wrong location" tool allowing users to drag the map to correct coordinates.

### 🔊 Sticky Audio Player (TTS)
- **English-Only:** Uses the browser's Web Speech API to read articles aloud in professional English.
- **Sticky UI:** A Spotify-style floating player at the bottom allows users to pause, play, skip sections, and change reading speed.
- **Section-by-Section:** Reads the Introduction, then pauses slightly before reading each heading and paragraph.

### 🛡️ The Moderation Engine (Telegram + Dashboard)
- **Secure Admin Access:** The `/admin` route is protected by server-side middleware.
- **Inline Editing:** Users click pencil icons to edit Titles, Paragraphs, and Infoboxes directly on the page.
- **Auto-Image Compression:** Uploaded images are compressed client-side via Canvas API before being sent to GitHub.
- **Telegram Sync:** Submissions trigger a Telegram Bot alert. The editor can approve/reject directly from the phone or the Dashboard.
- **Batch Publishing:** Approving an edit only "Stages" it. Hitting "🚀 Publish Live" bundles 10+ edits into **one single GitHub commit**, preventing Vercel build spam.
- **Auto-Metadata:** When an edit is published, the system auto-updates `dateModified`, `lastUpdated`, and `lastEditedBy`.

### 🚀 2026 Advanced SEO & Performance
- **Rich Image SEO:** All images include mandatory `imageAlt` tags. Zod schemas auto-generate alt text if missing. JSON-LD includes `ImageObject` with `creator`, `copyrightNotice`, `license`, and `acquireLicensePage` (fixing Google Search Console warnings).
- **Smart Sitemap (`sitemap.ts`):** Automatically removes future dates (`getSafeDate` logic). Uses **Image Deduplication** (Article Hero images are prioritized over Gallery images to prevent duplicate content penalties).
- **Thin Content Filtering:** The sitemap automatically excludes profiles that lack a proper biography (prevents Google penalties for empty pages).
- **AI Search Optimization (SGE):** JSON-LD includes `about` (Place) and `mentions` (Things) entity linking, plus `FAQPage` schema for "People Also Ask" visibility.
- **Core Web Vitals:** Integrated `sharp` for fast image optimization (AVIF/WebP) and aggressive 1-year caching headers via `next.config.js`.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (Custom design tokens, @tailwindcss/typography)
- **Data Validation:** Zod (Strict Type-Safety during build, Auto-fix fallbacks)
- **Maps:** React Leaflet, React-Leaflet-Cluster
- **Icons:** Lucide React
- **Automation:** Next.js API Routes (Telegram Bot API, GitHub REST API)
- **Security:** Web Crypto API (HMAC-SHA256 for session tokens)
- **Image Optimization:** Sharp (Server-side AVIF/WebP generation)
- **Deployment:** Vercel

---

## 📂 File Structure

```text
bandwar-archive/
├── data/                       # 👑 CONTENT WORKSPACE (All JSONs)
│   ├── master.json             # Site Config, Homepage, Footer, SEO
│   ├── directory.json          # Local services, doctors, shops
│   ├── media.json              # Gallery photos and Map landmarks
│   ├── people.json             # Notable personalities directory
│   ├── categories.json         # Article categories (12 total)
│   ├── contributors.json       # Registered user profiles (Auto-managed)
│   ├── queue.json              # PENDING & STAGED community edits (Auto-managed)
│   └── articles/               # Articles split by category
│       ├── culture.json        # 9 Articles (Festivals, Art, Sports)
│       ├── education.json      # 11 Articles (Schools, Library)
│       ├── economy.json        # 3 Articles (Agriculture, Haat)
│       ├── geography.json      # 2 Articles (River, Bandh)
│       ├── health.json         # 2 Articles (Outbreak, Infra)
│       ├── infrastructure.json # 5 Articles (Bank, Roads, etc.)
│       ├── landmarks.json      # 4 Articles (Dwar, Chowk, Well)
│       ├── religion.json       # 8 Articles (Temples)
│       ├── society.json        # 3 Articles (Wards, Tolas, Panchayat)
│       └── sports.json         # 1 Article (Volleyball)
│
├── public/                     
│   ├── images/                 # All photos organized by category
│   │   └── pending/            # Temp folder for user uploads awaiting review
│   └── images/contributors/    # Auto-generated profile photos
│
├── scripts/                    
│   └── validate.ts             # Zod validation engine & Cross-Reference checker
│
├── src/                        
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Moderation Dashboard (Protected)
│   │   ├── api/                
│   │   │   ├── admin/          # APIs for fetching queue, publishing, rejecting
│   │   │   ├── contributor/    # APIs for registration, lookup, profile updates
│   │   │   └── telegram-submit/# Receives forms, saves to queue, alerts Telegram
│   │   ├── article/[id]/       # Article Page (TOC, Reading Progress, Toolbar)
│   │   ├── contributors/       # Public Contributor Profiles
│   │   ├── contribute/         # "Get Involved" guide & General Feedback Hub
│   │   ├── directory/          # Village Directory Page
│   │   ├── gallery/            # Photo Gallery Page
│   │   ├── map/                # Dedicated Map Page (A-Z Index, Legend)
│   │   ├── people/             # People Directory & Profiles
│   │   ├── section/            # Archive category listing
│   │   ├── robots.ts           # Crawler rules (Allows Googlebot-Image & AI Bots)
│   │   ├── sitemap.ts          # Dynamic Sitemap (Image Deduplication & Safe Dates)
│   │   ├── globals.css         # Custom CSS tokens, fonts, print styles
│   │   └── layout.tsx          # Main Layout (Header, Footer, JSON-LD, Search Index)
│   │
│   ├── components/             
│   │   ├── about/              # ContributorGrid
│   │   ├── article/            # ArticleToolbar, Infobox, MobileTOC
│   │   ├── contribute/         # JoinCTA, ContributeForm
│   │   ├── contributor/        # ProfileClientWrapper, EditProfileModal
│   │   ├── editor/             # EditableText, EditableParagraph, EditModeToggle
│   │   ├── layout/             # Header, Footer, SearchModal
│   │   ├── map/                # LandmarkMap, MapIndex, MapLegend, MapClient
│   │   ├── shared/             # AddContentModal, ImageUpdateButton, Toast
│   │   └── ui/                 # Button, Input primitives
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useContributorGate.tsx 
│   │   └── useInlineEdit.ts    
│   │
│   ├── lib/                    
│   │   ├── data.ts             # Reads JSON, Filters missing images, Caches data
│   │   ├── contributor.ts      # Username generation, types
│   │   ├── search-data.ts      # Aggregates data for Global Search
│   │   ├── adminAuth.ts        # HMAC session generation & validation
│   │   └── schema.ts           # Zod schemas with Auto-Fix Transformers
│   │
│   └── middleware.ts           # Edge Middleware to protect /admin routes
│
├── .npmrc                      # Forces legacy-peer-deps for Leaflet
├── next.config.js              # Redirects, Security Headers, Image Caching
├── tailwind.config.ts          # Identity tokens (Warm Archive theme)
├── vercel.json                 # Ignores Vercel builds for queue.json updates
└── package.json                # Dependencies (Includes `sharp` for Image Opt)
```

---

## 🛠️ Local Setup Guide

### 1. Install Dependencies
```bash
npm install
```
*(Note: A `.npmrc` file is included in the root with `legacy-peer-deps=true`. This is required because `react-leaflet-cluster` hasn't officially updated its peer dependencies for React 19 yet. `sharp` is also included for production-grade image optimization.)*

### 2. Environment Variables
Create a `.env.local` file in the root directory. You will need a Telegram Bot, a GitHub Personal Access Token (PAT) with `repo` scope, and secure Admin credentials.

```env
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id_here"

GITHUB_TOKEN="ghp_your_personal_access_token"
GITHUB_REPO_OWNER="your_github_username"
GITHUB_REPO_NAME="your_repo_name"

# Admin Security (Generate random 32-character strings for these)
ADMIN_PASSWORD="your_strong_password_here"
ADMIN_SESSION_SECRET="your_hmac_session_secret_here"
```

### 3. Start the Development Server
```bash
npm run dev
```

---

## ✍️ The Editor Workflow (Mini-CMS)

Thanks to the Moderation Dashboard, the Editor's life is incredibly easy. The system acts as a mini-CMS.

1. **Receive Submission:** A user submits an edit or new content. It saves to `data/queue.json` (Pending) and sends a Telegram alert with an image preview.
2. **Review in Dashboard:** Go to `/admin` and enter the `ADMIN_PASSWORD`. You will see all Pending edits with a strict Red/Green diff view.
3. **Review Images:** Submitted images are saved to `public/images/pending/`.
4. **Stage or Reject:** Click "Stage for Publish". If you reject an image, it is automatically deleted from GitHub to keep the repo clean.
5. **Batch Publish:** Once you have 5-10 staged edits, click the green **"🚀 Publish X Updates Live"** button. 
   - The Dashboard uses the GitHub API to update all target JSON files in a single atomic commit.
   - Pending images are moved to their final exact paths.
   - Metadata (`dateModified` & `lastEditedBy`) is automatically updated.
   - Vercel triggers exactly **one** build.

---

## 🛡️ Data Validation Engine

Because the website relies on Zod and JSON, a single missing comma will break the build. Vercel is configured to run validation automatically before deploying.

To run it manually:
```bash
npm run validate
```

**The Validation Engine runs in 2 Phases:**
- **Phase 1 (Schema - Strict):** Checks all JSON files against Zod schemas. If a file is missing a required field or has a syntax error, the build **FAILS**.
- **Phase 2 (Cross-Reference - Soft):** Scans every `[[wikilink]]` in article content and every ID in the `related` array. If a target article doesn't exist yet, it throws a **Warning** but **does not break the build**. This allows writers to link future articles without blocking deployment.

- ✅ **Green Pass:** Data is perfect.
- ⚠️ **Yellow Warning:** Broken links found, but build continues (fix when possible).
- ❌ **Red Fail:** JSON structure is broken. Fix immediately.

---

## 🏆 Golden Rules for Maintenance

1. **Original Photos:** Google heavily favors original images. Compress photos to under 200KB before uploading. Ensure every photo has a descriptive `imageAlt` in the JSON.
2. **`queue.json` & `contributors.json` are Auto-managed:** Do not manually edit these files unless resetting a corrupted state.
3. **Security:** Never commit your `.env` file. All tokens must live in Vercel's Environment Variables.
4. **Vercel Builds:** The `vercel.json` file contains an `ignoreCommand`. It tells Vercel to ignore builds if *only* `queue.json` is changed.
5. **Image Paths:** In JSON, use paths like `images/home/hero.jpg` (no leading slash). Next.js `<Image>` will strip query strings automatically.
6. **No Fake Dates:** Never use `new Date()` in dynamic sitemaps or schemas. Always use the `lastUpdated` or `dateModified` values from the JSON data.
7. **Sitemap Image Priority:** If an image exists in an Article AND the Gallery, the `sitemap.ts` automatically prioritizes the Article URL to prevent duplicate content penalties.

---
<div align="center">
  <i>Built with ❤️ for Bandwar by the community, for the world.</i>
</div>