<!-- ═══════════════════════════════════════════════════════════════════
     BANDWAR — A VILLAGE ARCHIVE
     Community-built digital archive · Begusarai, Bihar, India
     
     Keywords: Bandwar village, Bandwar Begusarai, Bandwar Bihar,
               Mithila village, Burhi Gandak, village archive,
               Bihar village history, Begusarai archive
     ═══════════════════════════════════════════════════════════════════ -->

<div align="center">

# 🏘️ Bandwar — A Village Archive

### A community-built digital archive of **Bandwar village, Begusarai, Bihar**

*Documenting 2,600 years of history on the banks of the Burhi Gandak*

[![Live Site](https://img.shields.io/badge/🌐_Live-bandwar.vercel.app-1f3d2f?style=for-the-badge)](https://bandwar.vercel.app)
[![License: MIT](https://img.shields.io/badge/Code-MIT-yellow?style=for-the-badge)](LICENSE)
[![Content](https://img.shields.io/badge/Content-©_Community-a64b2a?style=for-the-badge)](https://bandwar.vercel.app/about#license)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://bandwar.vercel.app)
[![Built with Vanilla JS](https://img.shields.io/badge/Built_with-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://bandwar.vercel.app)

[![Deploy](https://github.com/ravirajhe/Bandwar/actions/workflows/build.yml/badge.svg)](https://github.com/ravirajhe/Bandwar/actions/workflows/build.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Made with ❤️ in Bihar](https://img.shields.io/badge/Made_with_❤️_in-Bihar,_India-ff9933?style=for-the-badge)]()

**[🌐 Live Site](https://bandwar.vercel.app)** ·
**[📖 About](https://bandwar.vercel.app/about)** ·
**[🗺️ Explore Map](https://bandwar.vercel.app/place)** ·
**[📅 Timeline](https://bandwar.vercel.app/time)** ·
**[🔮 Vision](https://bandwar.vercel.app/vision)**

</div>

---

## 📖 Table of Contents

<details open>
<summary>Click to expand / collapse</summary>

- [What is Bandwar?](#-what-is-bandwar)
- [Why This Archive Exists](#-why-this-archive-exists)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Data Model](#-data-model)
- [The Rolling Horizon Model](#-the-rolling-horizon-model)
- [SEO Architecture](#-seo-architecture)
- [Image Pipeline](#-image-pipeline)
- [Automation](#-automation)
- [Quick Start](#-quick-start)
- [How to Add Content](#-how-to-add-content)
- [Theming](#-theming)
- [Technical Stack](#-technical-stack)
- [Contributing](#-contributing)
- [Data Sources](#-data-sources)
- [FAQ](#-faq)
- [License](#-license)
- [Contact](#-contact)
- [Roadmap](#-roadmap)

</details>

---

## 🏘️ What is Bandwar?

**Bandwar** is a village on the banks of the **Burhi Gandak river**, in **Begusarai district, Bihar, India** — part of the historic **Mithila region**. The village's geographic coordinates are **25.5009°N, 86.1606°E**, and it falls under PIN code **851131**.

This repository hosts the **community-built digital archive** of Bandwar — a permanent, publicly-accessible record of the village's **history, culture, temples, schools, landmarks, and people**.

> **Not a government project. Not a political platform. Not a commercial venture.**
> *A record of a village, kept by the village.*

**Live site:** [bandwar.vercel.app](https://bandwar.vercel.app)

---

## 💡 Why This Archive Exists

Most Indian villages have no written history. Their past lives in the memories of elders — and when those elders pass, the history passes with them.

Bandwar Archive changes that. It captures:

- 📜 **2,600 years of history** — from the Anga Mahajanapada era to the present
- 🛕 **Sacred spaces** — Shivala, Ram Mandir Thakurbari, Durga Mandir, and more
- 🎓 **Educational institutions** — S.N.K. High School and the Vaani Vilas Pustakalaya
- 🗺️ **Geographic landmarks** — 18 mapped locations with satellite coordinates
- 👥 **Community memory** — oral histories, photographs, and documents from residents
- 🔮 **A rolling 10-year vision** — a non-political manifesto of development priorities

Every fact is sourced. Every photograph is credited. Nothing is published without consent.

---

## 📸 Screenshots

<div align="center">

### 🏠 Homepage — Hero, Stats, and Categories
<img src="docs/screenshots/home.png" alt="Bandwar homepage with hero image and village statistics" width="800"/>

### 🗺️ Interactive Map — 18 Landmarks
<img src="docs/screenshots/map.png" alt="Interactive Leaflet map showing 18 landmarks in Bandwar village" width="800"/>

### 📅 Timeline — 2,600 Years
<img src="docs/screenshots/timeline.png" alt="Bandwar timeline from Anga Mahajanapada to present day" width="800"/>

### 🔮 Vision — Before/After Sliders
<img src="docs/screenshots/vision.png" alt="Vision page with development priorities" width="800"/>

### 📄 Bandwar Manifesto — A4 PDF
<img src="docs/screenshots/manifesto.png" alt="Bandwar manifesto PDF preview" width="800"/>

### 📱 Mobile + Dark Mode
<img src="docs/screenshots/mobile-dark.png" alt="Bandwar archive on mobile in dark mode" width="300"/>

</div>

---

## ✨ Features

### 📚 Content
- **30 in-depth articles** on history, religion, education, culture, infrastructure, and health
- **Live full-text search** — instant results across every article
- **Category browser** — 10 categories with live article counts
- **Interactive map** — 18 landmarks rendered with Leaflet.js + Esri satellite imagery
- **2,600-year timeline** — from the Anga Mahajanapada to present, across 4 historical eras
- **Photo gallery** — curated photographs with category filters and lightbox viewing
- **Vision page** — development priorities with before/after image sliders
- **Achievement records** — completed projects with funding details
- **Community contributions** — email-based submissions, no backend required

### 🎨 Design
- **Two-file theming** — `theme.css` (tokens) + `style.css` (components)
- **5-color override** — change 5 lines to completely restyle the site
- **Theme presets built-in** — dark, sepia, contrast, indigo
- **User-toggleable** — dark mode switch persisted to localStorage
- **Editorial layout** — typography-first, no cards, no gradients

### 🔍 SEO & Discoverability
- **Complete Schema.org `@graph`** — Article, Place, Organization, WebSite, ImageObject, BreadcrumbList
- **Auto-generated sitemaps** — pages + images, filesystem-checked (zero 404s)
- **Static pre-rendered HTML** — full content in Wave 1 (no JS dependency for content)
- **Canonical URLs** — per-article, per-page, clean (no `.html`)
- **Open Graph + Twitter Cards** — dynamic per article
- **hreflang ready** — `en-IN`, `x-default` (Hindi version ready)
- **Image SEO** — descriptive filenames, alt text, captions, license schema
- **Google Search Console** verified

### ⚡ Performance
- **Zero runtime dependencies** — pure HTML, CSS, vanilla JavaScript
- **Sub-second load time** — no frameworks, no bundlers
- **WebP + AVIF** — modern image formats (60-80% smaller)
- **Responsive images** — automatic srcset generation
- **Lazy loading** — all below-fold images
- **PWA installable** — works offline via service worker
- **LCP optimized** — preload hints for hero images

---

## 🏗️ Architecture

```
                ┌────────────────────────────────────────┐
                │          data/*.json                   │
                │  (Single source of truth for content)  │
                │   master · content · vision · media    │
                └────────────────┬───────────────────────┘
                                 │
                ┌────────────────┼───────────────────────┐
                │                │                       │
                ▼                ▼                       ▼
          ┌─────────┐      ┌─────────┐           ┌──────────┐
          │ Website │      │ Sitemap │           │Manifesto │
          │ (build) │      │Generator│           │   PDF    │
          │         │      │  .cjs   │           │(Puppeteer│
          └────┬────┘      └────┬────┘           │  +sharp) │
               │                │                └─────┬────┘
               │                │                      │
               └────────────────┼──────────────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │  scripts/build.cjs       │
                   │  (Pre-renders everything)│
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │  dist/ (44 static pages) │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │  GitHub Actions + Vercel │
                   │  (auto-deploy on push)   │
                   └──────────────────────────┘
```

**Golden rule:** Content grows in JSON. The maintained files never change.

---

## 📂 Project Structure

```
bandwar/
│
├── 📁 .github/
│   ├── 📁 workflows/
│   │   ├── build.yml                    # Build + deploy pipeline
│   │   ├── generate-manifesto.yml       # Auto-regenerate PDF
│   │   └── generate-sitemaps.yml        # Auto-regenerate sitemaps
│   └── 📁 ISSUE_TEMPLATE/
│
├── 📁 data/                             # ⭐ Single source of truth
│   ├── master.json                      # Site + brand + nav + SEO + features
│   ├── content.json                     # 30 articles + 10 categories
│   ├── vision.json                      # Priorities + achievements + roadmap
│   └── media.json                       # Gallery + landmarks + timeline
│
├── 📁 templates/                        # ⭐ Build-time templates
│   ├── layout.html                      # Base layout
│   ├── index.html                       # Homepage
│   ├── article.html                     # Article page
│   ├── section.html                     # Category browser
│   ├── place.html                       # Map + gallery
│   ├── time.html                        # Timeline
│   ├── vision.html                      # Vision + manifesto
│   ├── about.html                       # About + sources + license
│   └── 📁 partials/
│       ├── head.html                    # SEO meta block
│       ├── nav.html                     # Navigation
│       └── footer.html                  # Footer
│
├── 📁 scripts/                          # Build tools
│   ├── build.cjs                        # Main build engine
│   ├── validate.cjs                     # Rule enforcement
│   ├── optimize-images.cjs              # WebP + AVIF + responsive
│   ├── generate-sitemaps.cjs            # Sitemaps
│   └── generate-manifesto.cjs           # Puppeteer PDF
│
├── 📁 css/                              # Source styles
│   ├── theme.css                        # ⚙️ ALL design tokens
│   └── style.css                        # Components (uses only tokens)
│
├── 📁 js/                               # Vanilla JavaScript
│   ├── core.js                          # Navbar, footer, theme, PWA
│   ├── articles.js                      # Article interactivity
│   ├── sections.js                      # Search + filter
│   ├── places.js                        # Leaflet map + gallery
│   ├── time.js                          # Timeline filter
│   └── vision.js                        # Before/after sliders
│
├── 📁 images/                           # Source images
│   ├── home/                            # Homepage images
│   ├── culture/                         # Temples, festivals
│   ├── village/                         # Current state photos
│   ├── vision/                          # Before/after slider images
│   ├── education/                       # Schools, library
│   ├── history/                         # Historical images
│   └── icons/                           # PWA icons (48–512px)
│
├── 📁 docs/                             # Documentation
│   └── screenshots/                     # README screenshots
│
├── 📁 dist/                             # Build output (gitignored)
│   ├── index.html
│   ├── article/*.html                   # 30 pages
│   ├── section/*.html                   # 11 pages
│   ├── place.html, time.html, ...
│   ├── sitemap.xml, sitemap-images.xml
│   ├── robots.txt, manifest.json, sw.js
│   └── assets/                          # Copied CSS/JS/images
│
├── 📄 master.json (in data/)            # Site config
├── 📄 LICENSE                           # MIT (code) + © Community (content)
├── 📄 README.md                         # You are here
├── 📄 package.json                      # Scripts + dev deps
├── 📄 vercel.json                       # Deployment config
├── 📄 robots.txt                        # Crawler directives
├── 📄 manifest.json                     # PWA manifest
├── 📄 sw.js                             # Service worker
└── 📄 humans.txt                        # Web credits
```

---

## 📚 Data Model

**4 data files, one source of truth each:**

### `data/master.json`
Site config — the **master key**:
```json
{
  "site": { "name", "url", "language", "description", ... },
  "village": { "name", "coordinates", "population", ... },
  "brand": { "colors", "fonts" },
  "nav": [...],
  "footer": {...},
  "seo": {...},
  "home": { "hero", "stats", "about", "cta" },
  "about": { "story", "principles", "sources", ... },
  "contact": {...},
  "social": {...},
  "features": {...},
  "license": {...}
}
```

**Change `site.name` → 30+ files auto-update.**

### `data/content.json`
Articles + categories:
```json
{
  "categories": [10 items],
  "articles": [30 items with id, title, categories, content, related, ...]
}
```

### `data/vision.json`
Rolling horizon vision:
```json
{
  "priorities": [15 items with status: pending/in-progress/done],
  "achievements": [4 items],
  "roadmap": [3 phases with relative years]
}
```

### `data/media.json`
Photos + landmarks + timeline:
```json
{
  "gallery": [37 photos],
  "landmarks": [18 landmarks with coordinates],
  "timeline": [15 events across 4 eras]
}
```

---

## 🔄 The Rolling Horizon Model

**Bandwar 2035** is not fixed. It's a **rolling 10-year horizon** that auto-shifts every year.

```
Year 2026 → "Bandwar 2036" (current year + 10)
Year 2027 → "Bandwar 2037"
Year 2028 → "Bandwar 2038"
```

### How it works:
1. Priorities have a `status` field: `pending` / `in-progress` / `done`
2. Build script **auto-categorizes**:
   - `pending` + `in-progress` → **Needs section**
   - `done` + `completed: "2028"` → **Achievements section**
3. Roadmap uses **relative phases** (Year 1-3, 4-6, 7-10)
4. Previous editions **preserved** at `/vision/{year}-{end}`

**Zero manual work every year.**

---

## 🔍 SEO Architecture

Every indexable page carries a **complete `<head>`**:

| Element | Status |
|---|---|
| Primary SEO (title, description) | ✅ Unique per page |
| Canonical URL | ✅ Absolute, clean |
| Open Graph | ✅ Full set |
| Twitter Cards | ✅ summary_large_image |
| hreflang | ✅ en-IN + x-default |
| Robots meta | ✅ max-image-preview:large |
| JSON-LD @graph | ✅ Pre-rendered in HTML |

### Schema per page

| Page | Schema Types |
|---|---|
| Homepage | WebSite + Place + Organization + ImageObject + BreadcrumbList |
| Article | Article + ImageObject[] + BreadcrumbList + contentLocation |
| Section | CollectionPage + ItemList + BreadcrumbList |
| Place | CollectionPage + ItemList[Place] + BreadcrumbList |
| Time | CollectionPage + ItemList[Event] + BreadcrumbList |
| Vision | Report + ItemList + BreadcrumbList |
| About | AboutPage + Organization + BreadcrumbList |

### Sitemaps (auto-generated)

- `sitemap.xml` — page URLs (40+ pages)
- `sitemap-images.xml` — 100+ images with captions
- `sitemap-index.xml` — master index

---

## 🎨 Image Pipeline

**Every image gets:**
- ✅ **WebP conversion** (60% smaller)
- ✅ **AVIF conversion** (70% smaller)
- ✅ **Responsive variants** (400, 800, 1200, 1600px)
- ✅ **Descriptive filenames** (kebab-case)
- ✅ **Alt text + captions**
- ✅ **License schema**
- ✅ **Image sitemap entry**

**Naming convention:**
```
✅ burhi-gandak-river-dawn.jpg
✅ bada-krishna-mandir-idol.jpg
❌ 01-river.jpg
❌ IMG_2847.jpg
❌ hero.jpg
```

---

## ⚙️ Automation

**Two workflows keep content in sync:**

### `build.yml` — Runs on push to `main`
1. Validate data + rules
2. Optimize images (WebP + AVIF + responsive)
3. Build static site (44 pages)
4. Generate sitemaps
5. Generate manifesto PDF
6. Commit optimized images
7. Trigger Vercel deploy hook

### `generate-sitemaps.yml` — Runs on data changes
- Regenerates `sitemap.xml` + `sitemap-images.xml`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **Git** >= 2.x
- (Optional) Vercel account for deployment

### Installation

```bash
# 1. Clone
git clone https://github.com/ravirajhe/Bandwar.git
cd Bandwar

# 2. Install dev dependencies
npm install

# 3. Build the site
npm run build

# 4. Serve locally
npm run serve
```

Open [http://localhost:8000](http://localhost:8000).

### Available Commands

| Command | What it does |
|---|---|
| `npm run build` | Full build (validate + site + sitemaps) |
| `npm run build:site` | Build site only |
| `npm run build:full` | Includes image optimization + PDF |
| `npm run dev` | Watch mode (rebuilds on change) |
| `npm run serve` | Build + serve dist/ locally |
| `npm run validate` | Check rules (inline CSS, naming, etc.) |
| `npm run optimize-images` | Convert to WebP/AVIF + responsive |
| `npm run clean` | Delete dist/ |

### Verification

```bash
# Run validation
npm run validate
# Expected: ✓ Passed · ⚠ Warnings (content) · ✗ Errors (0)
```

---

## 📝 How to Add Content

### ➕ Add a new article

1. Open `data/content.json`
2. Add a new object to the `articles` array:

```json
{
  "id": "new-temple",
  "title": "New Temple",
  "subtitle": "Short description",
  "categories": ["religion"],
  "summary": "One-paragraph summary...",
  "hero": "images/culture/new-temple.jpg",
  "photos": [],
  "infobox": { "Type": "Hindu temple" },
  "content": [
    { "heading": "History", "text": "..." }
  ],
  "related": ["shivala"],
  "location": { "lat": 25.5012, "lng": 86.1610 },
  "tags": ["temple"]
}
```

3. Commit — **site, sitemap, and SEO all update automatically**

**⏱️ Time: 2 minutes · Files edited: 1**

### ➕ Add a photo

1. Add image to `images/culture/` (kebab-case name)
2. Add entry to `data/media.json` under `gallery`
3. Run `npm run optimize-images`
4. Commit — image sitemap updates

### ➕ Add a landmark

1. Add entry to `data/media.json` under `landmarks` with lat/lng
2. Commit — map and Place schema update

### ➕ Add a timeline event

1. Add entry to `data/media.json` under `timeline`
2. Commit — timeline and Event schema update

### ➕ Add a vision priority

1. Add entry to `data/vision.json` under `priorities`
2. Set `status: "pending"` (or `in-progress`)
3. Commit — vision page + manifesto PDF regenerate

### ➕ Mark a priority as complete

1. Open `data/vision.json`
2. Change priority's `status` to `"done"` and set `"completed": "2028"`
3. Commit — **automatically moves to Achievements section**

### 🎨 Change the entire theme

1. Open `data/master.json`
2. Change the 5 brand colors:

```json
"brand": {
  "colors": {
    "primary": "#YOUR_INK",
    "base": "#YOUR_PAPER",
    "surface": "#YOUR_CARD",
    "accent": "#YOUR_ACCENT",
    "warn": "#YOUR_WARN"
  }
}
```

3. Rebuild — **whole site restyles**

**⏱️ Time: 5 minutes · Files edited: 1**

---

## 🎨 Theming

### Two-file system

The entire visual identity lives in **`css/theme.css`**:

```css
:root {
  --c-primary:  #1a1a18;   /* ink — main text */
  --c-base:     #f7f5ef;   /* paper — background */
  --c-surface:  #efece4;   /* cards, subtle sections */
  --c-accent:   #1f3d2f;   /* forest — links, emphasis */
  --c-warn:     #a64b2a;   /* ember — accents */
}
```

Everything else — text hierarchies, borders, surfaces, shadows — derives automatically via `color-mix()`.

### Built-in theme presets

Activate with `<html data-theme="dark">`:

| Preset | Description |
|---|---|
| `dark` | Ink-on-paper inverted — for night reading |
| `sepia` | Warm brown tones — antique feel |
| `contrast` | High-contrast for accessibility |
| `indigo` | Alternate brand palette |

### Rule for developers

**Never write hardcoded values in `style.css`.** Always use tokens:

```css
/* ❌ Never */                /* ✅ Always */
color: #1a1a18;                color: var(--c-text);
font-family: 'Fraunces';       font-family: var(--f-display);
padding: 16px;                 padding: var(--sp-4);
```

Verify with:
```bash
npm run validate
```

---

## 🧱 Technical Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 (pre-rendered) |
| **Styling** | CSS3 with custom properties |
| **Scripting** | Vanilla JavaScript (no framework) |
| **Maps** | Leaflet.js + Esri Satellite (self-hosted) |
| **Hosting** | Vercel |
| **Fonts** | Google Fonts (Fraunces, Inter, IBM Plex Mono) |
| **PWA** | Service Worker + Manifest |
| **PDF Generation** | Puppeteer + sharp (dev only) |
| **Image Optimization** | sharp (dev only) |
| **Automation** | GitHub Actions |

**Runtime dependencies:** 0 (all assets self-hosted)
**Build-time dependencies:** 3 (Puppeteer, sharp, chokidar)
**Build time:** ~1 second (static site)

---

## 🤝 Contributing

We're actively looking for:

- 📷 **Photographs** — old or new, personal or public
- 📖 **Memories** — written accounts from elders
- 📜 **Documents** — land records, letters, government papers
- 🚧 **Updates** — project progress
- ✏️ **Corrections** — errors in names, dates, facts

### How to submit

1. **📧 Email** — [bandwar.archive@gmail.com](mailto:bandwar.archive@gmail.com)
2. **🏛️ In person** — Gram Panchayat office, Bandwar
3. **👥 Via committee** — Any member of the Bandwar Archive committee

Every contribution is credited. Nothing is published without consent.

### For developers

```bash
# Fork → Clone → Branch → Commit → Push → PR
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

**Commit format:**
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting
refactor: code restructure
```

---

## 📚 Data Sources

All facts in this archive are sourced from verifiable records:

- Census of India, 2011
- MGNREGA Public Portal
- Jal Jeevan Mission dashboard
- **News18, Prabhat Khabar, Hindustan, Dainik Jagran**
- Rajya Sabha records
- Local residents and village elders
- Archaeological Survey of India
- Personal interviews, 2024–2026

---

## ❓ FAQ

### What is Bandwar village?

**Bandwar** is a village in **Begusarai district, Bihar, India**, located on the banks of the **Burhi Gandak river** in the historic **Mithila region**. Its PIN code is **851131**.

### Where is Bandwar located?

Bandwar is at coordinates **25.5009°N, 86.1606°E**, in Begusarai district — approximately 130 km east of Patna.

### What is the Bandwar Archive?

The **Bandwar Archive** is a community-built digital repository documenting the village's history, culture, temples, schools, landmarks, and people.

### Who built this website?

The archive is built and maintained by the **Bandwar Village Community**, with technical implementation by [Ravi Raj](https://github.com/ravirajhe). Every contributor is credited.

### What is the rolling horizon model?

Instead of a fixed "Bandwar 2035", the vision auto-shifts each year: 2026 → "Bandwar 2036", 2027 → "Bandwar 2037". Completed priorities move automatically from Vision to Achievements.

### Is this archive affiliated with the government?

**No.** This is a **community project**. Not affiliated with any government body, political party, or commercial organization.

### Is the code open source?

**Yes.** The code is released under the **MIT License**. Anyone can fork, modify, and adapt it for their own village archive.

### Is the content free to use?

The **content** (articles, photographs, documents) is **© Bandwar Village Community** and is not for commercial use without permission. Contact [bandwar.archive@gmail.com](mailto:bandwar.archive@gmail.com) for usage requests.

### Can I build a similar archive for my village?

**Absolutely.** That's why the code is open source. Fork this repo, replace the JSON data with your village's content, and deploy.

### Is there a Hindi version?

**Not yet.** A Hindi version (`hi-IN` with `/hi/` routes) is on the roadmap. The hreflang tags are already in place.

---

## 📜 License

**📖 Content** — © Bandwar Village Community and contributors. Not for commercial use without permission. See [about](https://bandwar.vercel.app/about#license).

**💻 Code** — Released under the **MIT License**. Free to use, modify, and adapt.

---

## 📧 Contact

- **📧 Email:** [bandwar.archive@gmail.com](mailto:bandwar.archive@gmail.com)
- **📍 Location:** Bandwar, Begusarai, Bihar — 851131, India
- **🌐 Coordinates:** 25.5009°N, 86.1606°E
- **🐙 GitHub:** [github.com/ravirajhe/Bandwar](https://github.com/ravirajhe/Bandwar)
- **🌐 Live Site:** [bandwar.vercel.app](https://bandwar.vercel.app)

---

## 🗺️ Roadmap

### ✅ Done
- 30 articles across 7 categories
- Interactive map with 18 landmarks
- 2,600-year timeline with 4 eras
- Photo gallery with lightbox
- Vision page with before/after sliders
- Government achievements documented
- Rolling horizon manifesto (auto-shifting)
- Complete SEO architecture (schema, sitemaps, meta)
- Image sitemap (auto-generated, filesystem-checked)
- Two-file theme system with 4 presets
- PWA installability with offline cache
- Clean URLs everywhere
- Dark mode toggle with localStorage
- WebP + AVIF image pipeline
- Responsive images with srcset

### ⏳ In Progress
- AI-generated "required" images for pending priorities
- Vercel webhook stability monitoring

### ☐ Planned
- Hindi version (`hi-IN` with `/hi/` routes)
- Voice recordings of elders — audio archive
- Alumni registry for S.N.K. High School
- Flood memory map — historic flood records
- English Wikipedia article for Bandwar
- Additional priorities — Drainage, Playground, Piped Water, Library
- Signature page — printed copy at Panchayat
- Google Business Profile for local pack

---

<div align="center">

### 🌾 A living archive. If you have something to add, it would be welcome.

**[⭐ Star this repo](https://github.com/ravirajhe/Bandwar)** ·
**[🌐 Visit the site](https://bandwar.vercel.app)** ·
**[📧 Contribute](mailto:bandwar.archive@gmail.com)**

*Made with ❤️ in Bihar, India*

---

[⬆ Back to Top](#-bandwar--a-village-archive)

</div>