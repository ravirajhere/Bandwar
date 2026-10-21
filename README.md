<!-- ═══════════════════════════════════════════════════════════════════
     BANDWAR — A VILLAGE ARCHIVE
     Community-built digital archive · Begusarai, Bihar, India
     
     Keywords: Bandwar village, Bandwar Begusarai, Bandwar Bihar,
               Mithila village, Burhi Gandak, village archive,
               Bihar village history, Begusarai archive
     ═══════════════════════════════════════════════════════════════════ -->

<div align="center">

# 🏘️ Bandwar — Village Archive

### Community-built archive of **Bandwar village, Begusarai, Bihar**

*Documenting 2,600 years of history on the banks of the Burhi Gandak*

[![Live Site](https://img.shields.io/badge/🌐_Live-bandwar.vercel.app-1f3d2f?style=for-the-badge)](https://bandwar.vercel.app)
[![License: MIT](https://img.shields.io/badge/Code-MIT-yellow?style=for-the-badge)](LICENSE)
[![Content](https://img.shields.io/badge/Content-©_Community-a64b2a?style=for-the-badge)](https://bandwar.vercel.app/about#license)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://bandwar.vercel.app)
[![Built with Vanilla JS](https://img.shields.io/badge/Built_with-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://bandwar.vercel.app)

[![Build](https://github.com/ravirajhe/Bandwar/actions/workflows/build.yml/badge.svg)](https://github.com/ravirajhe/Bandwar/actions/workflows/build.yml)
[![Manifesto](https://github.com/ravirajhe/Bandwar/actions/workflows/manifesto.yml/badge.svg)](https://github.com/ravirajhe/Bandwar/actions/workflows/manifesto.yml)
[![Optimize Images](https://github.com/ravirajhe/Bandwar/actions/workflows/optimize-images.yml/badge.svg)](https://github.com/ravirajhe/Bandwar/actions/workflows/optimize-images.yml)

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
- [Features](#-features)
- [Architecture](#️-architecture)
- [Project Structure](#-project-structure)
- [Data Model](#-data-model)
- [The Rolling Horizon Model](#-the-rolling-horizon-model)
- [SEO & Rich Results](#-seo--rich-results)
- [Image Pipeline & Auto-Cleanup](#-image-pipeline--auto-cleanup)
- [Automation](#️-automation)
- [Performance](#-performance)
- [Quick Start](#-quick-start)
- [How to Add Content](#-how-to-add-content)
- [Theming](#-theming)
- [Technical Stack](#-technical-stack)
- [Contributing](#-contributing)
- [Data Sources](#-data-sources)
- [FAQ](#-faq)
- [License](#-license)
- [Contact](#-contact)
- [Roadmap](#️-roadmap)

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

## ✨ Features

### 📚 Content & Architecture
- **30 in-depth articles** across categories, split into a **modular data structure**
- **Live full-text search** — instant results across every article
- **Interactive map** — 18 landmarks rendered with Leaflet.js + Esri satellite imagery
- **2,600-year timeline** — from the Anga Mahajanapada to present, across 4 historical eras
- **Photo gallery** — curated photographs with category filters and lightbox viewing
- **Vision page** — 15 development priorities with before/after image sliders
- **Achievement records** — 4 completed projects with funding details
- **FAQ Accordion** — Interactive `details`/`summary` elements with `FAQPage` Schema

### 🎨 Design
- **Two-file theming** — `theme.css` (tokens) + `style.css` (components)
- **5-color override** — change 5 lines to completely restyle the site
- **Theme presets built-in** — dark, sepia, contrast, indigo
- **Editorial layout** — typography-first, no cards, no gradients
- **Accessibility** — `.sr-only` classes for hidden screen-reader text and image captions

### 🔍 SEO & Discoverability (Latest Updates)
- **Complete Schema.org `@graph`** — Article, Place, Organization, WebSite, FAQPage, BreadcrumbList
- **Google Search Name Fix** — WebSite Schema `name` and `alternateName` optimized to prevent "Vercel" from showing as the site name.
- **Google Image SEO** — Hero images wrapped in `<figure>` with hidden `<figcaption class="sr-only">` for better image context.
- **Auto-generated sitemaps** — pages + images, filesystem-checked (zero 404s)
- **Image Sitemap Titles** — `<image:title>` and `<image:caption>` tags added for Google Images
- **Static pre-rendered HTML** — full content in Wave 1 (no JS dependency for content)
- **Canonical URLs** — per-article, per-page, clean (no `.html`)
- **Open Graph + Twitter Cards** — dynamic per article
- **hreflang ready** — `en-IN`, `x-default` (Hindi version ready)

### ⚡ Performance
- **Zero runtime dependencies** — pure HTML, CSS, vanilla JavaScript
- **Sub-second load time** — no frameworks, no bundlers
- **WebP + AVIF** — modern image formats (60–80% smaller)
- **Responsive images** — automatic srcset generation
- **Lazy loading** — all below-fold images
- **PWA installable** — works offline via service worker
- **LCP optimized** — preload hints for hero images

### 📄 Manifesto
- **Rolling horizon model** — "Bandwar 2036" auto-shifts each year
- **Auto-generated PDF** — `Vision-Vikshit-Bandwar.pdf`
- **A4 print-ready** — 34-page document via Puppeteer
- **Auto-cleanup** — old PDFs removed automatically

---

## 🏗️ Architecture

```text
                ┌────────────────────────────────────────┐
                │          data/                         │
                │  (Single source of truth for content)  │
                │  master · categories · articles/*      │
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
                   │  dist/ (static pages)    │
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

```text
bandwar/
│
├── 📁 .github/workflows/                # CI/CD Pipelines
│   ├── build.yml                        # Site build + sitemaps
│   ├── manifesto.yml                    # PDF regeneration
│   └── optimize-images.yml              # WebP + AVIF + Cleanup
│
├── 📁 data/                             # ⭐ Single source of truth
│   ├── 📁 articles/                     # Modular article storage
│   │   ├── culture.json
│   │   ├── education.json
│   │   ├── geography.json
│   │   ├── health.json
│   │   ├── infrastructure.json
│   │   ├── landmarks.json
│   │   └── religion.json
│   ├── categories.json                  # Category metadata
│   ├── master.json                      # Site config, brand, nav, SEO
│   ├── vision.json                      # 15 priorities + 4 achievements
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
│   └── 📁 partials/                     # Head, Nav, Footer
│
├── 📁 scripts/                          # Build tools
│   ├── build.cjs                        # Main build engine (v5.4)
│   ├── validate.cjs                     # Rule enforcement
│   ├── optimize-images.cjs              # WebP/AVIF + Auto-Cleanup
│   ├── generate-sitemaps.cjs            # 3 sitemaps
│   └── generate-manifesto.cjs           # Puppeteer PDF
│
├── 📁 css/
│   ├── theme.css                        # ⚙️ ALL design tokens
│   └── style.css                        # Components (uses only tokens)
│
├── 📁 js/
│   ├── core.js                          # Nav, footer, theme, PWA
│   ├── articles.js                      # Article interactivity
│   ├── sections.js                      # Search + filter
│   ├── places.js                        # Leaflet map + gallery
│   ├── time.js                          # Timeline filter
│   └── vision.js                        # Before/after sliders
│
├── 📁 images/                           # Source images (originals)
│   ├── home/
│   ├── culture/
│   ├── village/
│   ├── vision/
│   ├── education/
│   └── icons/                           # PWA icons
│
├── 📄 package.json                      # Scripts + dev deps
├── 📄 vercel.json                       # Deployment config
├── 📄 robots.txt                        # Crawler directives
├── 📄 manifest.json                     # PWA manifest
├── 📄 sw.js                             # Service worker
├── 📄 humans.txt                        # Web credits
├── 📄 CHANGELOG.md                      # Version history
├── 📄 CONTRIBUTING.md                   # Contribution guide
└── 📄 LICENSE                           # MIT (code) + © Community (content)
```

---

## 📚 Data Model

**5 modular data sources, split for scalability:**

### `data/master.json`
Site config — the **master key**:
```json
{
  "site": { "name", "url", "language", "description", "edition" },
  "village": { "name", "coordinates", "population", "pincode" },
  "brand": { "colors", "fonts" },
  "nav": [...],
  "seo": {...},
  "imageSEO": {...},
  "home": { "hero", "stats", "about", "cta" }
}
```

### `data/categories.json`
```json
{
  "categories": [
    { "id": "culture", "title": "Culture", "icon": "🎭", "description": "..." }
  ]
}
```

### `data/articles/` (Directory)
Articles are split into category-specific files for easier management and fewer Git conflicts:
- `culture.json`, `education.json`, `geography.json`, `health.json`, `infrastructure.json`, `landmarks.json`, `religion.json`.

*Adding a new article means just adding it to the relevant JSON file. The build script auto-merges them.*

### `data/vision.json`
Rolling horizon vision, 15 development priorities (with `status: pending/done`), and achievements.

### `data/media.json`
Photo gallery, 18 landmark coordinates, and 2,600-year timeline events.

---

## 🔄 The Rolling Horizon Model

**Bandwar {currentYear + 10}** — not fixed. It's a **rolling 10-year horizon** that auto-shifts every year.

```text
Year 2026 → "Bandwar 2036" (current year + 10)
Year 2027 → "Bandwar 2037"
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

## 🔍 SEO & Rich Results (Latest Updates)

Every indexable page carries a **complete `<head>`** with unique meta tags, canonical URLs, Open Graph, Twitter Cards, and JSON-LD schemas pre-rendered.

### 🆕 Recent SEO Fixes
1. **Google Site Name Fix**: Added `alternateName` to the `WebSite` schema and shortened `site.name` in `master.json` to prevent Google from displaying "Vercel" as the site name in search results.
2. **Google Image Search Fix**: Added hidden `<figcaption class="sr-only">` tags to hero images and `<image:title>` tags to the Image Sitemap. Google now extracts proper image titles instead of the page title.
3. **Inline Link Parsing**: `[[article-id|display text]]` syntax is now natively parsed in article texts and FAQs, stripping brackets for clean meta descriptions.

### Schema per page

| Page | Schema Types |
|---|---|
| Homepage | WebSite + Place + Organization + ImageObject + BreadcrumbList |
| Article | Article + FAQPage + ImageObject[] + BreadcrumbList + contentLocation |
| Section | CollectionPage + ItemList + BreadcrumbList |
| Place | CollectionPage + ItemList[Place] + BreadcrumbList |
| Time | CollectionPage + ItemList[Event] + BreadcrumbList |
| Vision | Report + ItemList + BreadcrumbList |
| About | AboutPage + Organization + BreadcrumbList |

### Sitemaps (auto-generated)
- `sitemap.xml` — page URLs
- `sitemap-images.xml` — 100+ images with explicit `<image:caption>` and `<image:title>`
- `sitemap-index.xml` — master index

---

## 🎨 Image Pipeline & Auto-Cleanup

**Every image gets:**
- ✅ **WebP conversion** (60% smaller)
- ✅ **AVIF conversion** (70% smaller)
- ✅ **Responsive variants** (400, 800, 1200, 1600px)
- ✅ **Descriptive filenames** (kebab-case)
- ✅ **Auto-cleanup**: If an original `.jpg` is renamed or deleted, the `optimize-images.cjs` script now auto-deletes the orphaned `.webp`, `.avif`, and responsive variants.

**Naming convention:**
```text
✅ burhi-gandak-river-dawn.jpg
✅ bada-krishna-mandir-idol.jpg
❌ 01-river.jpg
❌ IMG_2847.jpg
```

---

## ⚙️ Automation

**Three workflows keep everything in sync:**

### 1. `build.yml` — Fast (~30 sec)
**Triggers:** Changes to `data/**`, `templates/**`, `css/**`, `js/**`
- Validate data + rules
- Build static site
- Generate sitemaps

### 2. `manifesto.yml` — Slow but rare (~3 min)
**Triggers:** Changes to `data/vision.json`
- Generate PDF via Puppeteer + sharp
- Auto-delete old PDFs
- Commit with `[skip ci]`

### 3. `optimize-images.yml` — Slow but rare (~3 min)
**Triggers:** Changes to `images/**`
- Convert to WebP + AVIF
- Generate responsive variants
- Run cleanup script to delete orphaned images
- Commit with `[skip ci]`

**Vercel auto-deploy:**
- Enabled via `vercel.json`.
- **Ignored Build Step** is configured to skip `[skip ci]` commits (saves build minutes).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20
- **Git** >= 2.x

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
| `npm run build:full` | Includes image optimization + PDF |
| `npm run dev` | Watch mode (rebuilds on change) |
| `npm run validate` | Check rules (inline CSS, naming, etc.) |
| `npm run optimize-images` | Convert to WebP/AVIF + auto-cleanup |
| `npm run clean` | Delete dist/ |

---

## 📝 How to Add Content

### ➕ Add a new article
1. Open the relevant file in `data/articles/` (e.g., `religion.json`).
2. Add a new object to the `articles` array.
3. Commit — **site, sitemap, and SEO all update automatically.**

### ➕ Add a photo
1. Add image to `images/culture/` (kebab-case name).
2. Add entry to `data/media.json` under `gallery.photos`.
3. Push — `optimize-images.yml` runs automatically and generates optimized versions.

### ➕ Add a vision priority
1. Add entry to `data/vision.json` under `priorities`.
2. Set `status: "pending"` (or `in-progress`).
3. Commit — vision page + manifesto PDF regenerate.

### 🎨 Change the entire theme
1. Open `data/master.json`.
2. Change the 5 brand colors under `"brand": { "colors": { ... } }`.
3. Rebuild — **whole site restyles.**

---

## 🧱 Technical Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 (pre-rendered) |
| **Styling** | CSS3 with custom properties |
| **Scripting** | Vanilla JavaScript (no framework) |
| **Maps** | Leaflet.js + Esri Satellite |
| **Hosting** | Vercel |
| **Fonts** | Google Fonts (Fraunces, Inter, IBM Plex Mono) |
| **PWA** | Service Worker + Manifest |
| **PDF Generation** | Puppeteer + sharp |
| **Image Optimization** | sharp |
| **Automation** | GitHub Actions (3 workflows) |

**Runtime dependencies:** 0 (all assets self-hosted)
**Build-time dependencies:** 3 (Puppeteer, sharp, chokidar)

---

## 🤝 Contributing

We're actively looking for:
- 📷 **Photographs**
- 📖 **Memories**
- 📜 **Documents**
- 🚧 **Updates**
- ✏️ **Corrections**

**How to submit:**
1. **📧 Email** — [bandwar.archive@gmail.com](mailto:bandwar.archive@gmail.com)
2. **🏛️ In person** — Gram Panchayat office, Bandwar

---

## 📚 Data Sources

All facts in this archive are sourced from verifiable records:
- Census of India, 2011
- MGNREGA Public Portal
- Jal Jeevan Mission dashboard
- News18, Prabhat Khabar, Hindustan, Dainik Jagran
- Rajya Sabha records
- Archaeological Survey of India
- Personal interviews, 2024–2026

---

## ❓ FAQ

### What is Bandwar village?
**Bandwar** is a village in **Begusarai district, Bihar, India**, located on the banks of the **Burhi Gandak river** in the historic **Mithila region**.

### Is this archive affiliated with the government?
**No.** This is a **community project**. Not affiliated with any government body, political party, or commercial organization.

### Is the code open source?
**Yes.** The code is released under the **MIT License**. Anyone can fork, modify, and adapt it for their own village archive.

### Can I build a similar archive for my village?
**Absolutely.** That's why the code is open source. Fork this repo, replace the JSON data with your village's content, and deploy.

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
- Modular data architecture (Category-wise JSON split)
- Google Site Name search fix (Vercel → Bandwar)
- Google Image SEO fix (figcaption + image sitemaps)
- FAQ Schema generation
- Image auto-cleanup logic (orphaned files)
- Interactive map with 18 landmarks
- 2,600-year timeline
- Rolling horizon manifesto
- Auto-generated PDF (`Vision-Vikshit-Bandwar.pdf`)
- Complete SEO architecture (schema, sitemaps, meta)
- PWA installability with offline cache
- Dark mode toggle with localStorage
- WebP + AVIF image pipeline

### ⏳ In Progress
- PageSpeed optimization (async fonts, critical CSS)
- AI-generated "required" images for pending priorities
- Screenshots for documentation

### ☐ Planned
- Hindi version (`hi-IN` with `/hi/` routes)
- Voice recordings of elders — audio archive
- Alumni registry for S.N.K. High School
- Flood memory map — historic flood records
- English Wikipedia article for Bandwar

---

<div align="center">

### 🌾 A living archive. If you have something to add, it would be welcome.

**[⭐ Star this repo](https://github.com/ravirajhe/Bandwar)** ·
**[🌐 Visit the site](https://bandwar.vercel.app)** ·
**[📧 Contribute](mailto:ravirajbandwar@gmail.com)**

*Made with ❤️ in Bihar, India*

---

[⬆ Back to Top](#-bandwar--a-village-archive)

</div>