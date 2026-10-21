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
**[👥 People](https://bandwar.vercel.app/people)** ·
**[🚆 How to Reach](https://bandwar.vercel.app/reach)** ·
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
- 👥 **People of Bandwar** — a directory of notable residents, leaders, and a submission form to add your own name.
- 🚆 **Travel Guide** — detailed directions for NRIs and tourists via Air, Train, and Road.
- 🗺️ **Geographic landmarks** — 18 mapped locations with satellite coordinates
- 🛕 **Sacred spaces** — Shivala, Ram Mandir Thakurbari, Durga Mandir, and more
- 🔮 **A rolling 10-year vision** — a non-political manifesto of development priorities

Every fact is sourced. Every photograph is credited. Nothing is published without consent.

---

## ✨ Features

### 📚 Content & Architecture
- **30+ in-depth articles** across categories, split into a **modular data structure**
- **People of Bandwar** — Notable figures directory with an interactive email-based submission form.
- **How to Reach** — Comprehensive travel guide (Air, Train, Road, Stay) optimized for visitors.
- **Live full-text search** — instant results across every article
- **Interactive map** — 18 landmarks rendered with Leaflet.js + Esri satellite imagery
- **2,600-year timeline** — from the Anga Mahajanapada to present, across 4 historical eras
- **Photo gallery** — curated photographs with category filters and lightbox viewing
- **Vision page** — 15 development priorities with before/after image sliders
- **FAQ Accordion** — Interactive `details`/`summary` elements with `FAQPage` Schema

### 🎨 Design (Modern Heritage v3.0)
- **Paper Grain Texture** — Subtle SVG noise for a tactile, physical book feel.
- **Glassmorphism Navbar** — Frosted glass effect for a premium, modern interface.
- **Fluid Typography** — Seamless scaling from mobile to desktop using `clamp()`.
- **Two-file theming** — `theme.css` (tokens) + `style.css` (components).
- **5-color override** — change 5 lines to completely restyle the site.
- **Accessibility** — `.sr-only` classes for hidden screen-reader text and image captions.

### 🔍 SEO & Discoverability
- **Complete Schema.org `@graph`** — Article, Place, Organization, WebSite, FAQPage, BreadcrumbList.
- **Google Search Name Fix** — Optimized `alternateName` to prevent "Vercel" from showing as the site name.
- **Google Image SEO** — Hero images wrapped in `<figure>` with hidden `<figcaption>`.
- **Auto-generated sitemaps** — 3 sitemaps (Pages, Images, Index) updated to include People & Reach.
- **Static pre-rendered HTML** — full content in Wave 1 (no JS dependency for content).
- **Canonical URLs** — per-article, per-page, clean (no `.html`).

### ⚡ Performance
- **Zero runtime dependencies** — pure HTML, CSS, vanilla JavaScript.
- **WebP + AVIF** — modern image formats (60–80% smaller).
- **Lazy loading** — all below-fold images.
- **PWA installable** — works offline via service worker.

---

## 🏗️ Architecture

```text
                ┌────────────────────────────────────────┐
                │          data/                         │
                │  (Single source of truth for content)  │
                │  master · categories · articles/*      │
                │  people · reach                        │
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
│   ├── categories.json                  # Category metadata
│   ├── master.json                      # Site config, brand, nav, SEO
│   ├── media.json                       # Gallery + landmarks + timeline
│   ├── people.json                      # Notable people directory
│   ├── reach.json                       # Travel & stay guide
│   └── vision.json                      # 15 priorities + 4 achievements
│
├── 📁 templates/                        # ⭐ Build-time templates
│   ├── layout.html                      # Base layout
│   ├── index.html                       # Homepage
│   ├── article.html                     # Article page
│   ├── people.html                      # People directory + form
│   ├── reach.html                       # Travel guide
│   ├── place.html                       # Map + gallery
│   ├── time.html                        # Timeline
│   ├── vision.html                      # Vision + manifesto
│   ├── about.html                       # About + sources + license
│   └── 📁 partials/                     # Head, Nav, Footer
│
├── 📁 scripts/                          # Build tools
│   ├── build.cjs                        # Main build engine (v5.7)
│   ├── validate.cjs                     # Rule enforcement
│   ├── optimize-images.cjs              # WebP/AVIF + Auto-Cleanup
│   ├── generate-sitemaps.cjs            # 3 sitemaps (v2.1)
│   └── generate-manifesto.cjs           # Puppeteer PDF
│
├── 📁 css/
│   ├── theme.css                        # ⚙️ ALL design tokens (v3.0)
│   └── style.css                        # Components (v6.0)
│
├── 📁 js/                               # Vanilla JS modules
│
├── 📁 images/                           # Source images (originals)
│
├── 📄 package.json                      # Scripts + dev deps
├── 📄 vercel.json                       # Deployment config
└── 📄 LICENSE                           # MIT (code) + © Community (content)
```

---

## 📚 Data Model

**7 modular data sources, split for scalability:**

### `data/master.json`
Site config, navigation, SEO, brand colors, home page sections, and about page content.

### `data/categories.json` & `data/articles/`
Categories are separated, and articles are split into category-specific files (`culture.json`, `education.json`, etc.) for easier management and fewer Git conflicts.

### `data/people.json`
A directory of notable individuals from Bandwar (politicians, teachers, authors) with their roles, locality, and bios.

### `data/reach.json`
Structured travel guide data including Air, Train, Road instructions, local transport, and where to stay in Begusarai.

### `data/vision.json` & `data/media.json`
Rolling horizon vision, development priorities, gallery photos, and timeline events.

---

## 🔍 SEO & Sitemaps (Latest Updates)

Every indexable page carries a **complete `<head>`** with JSON-LD schemas pre-rendered.

### Sitemaps (auto-generated)
- `sitemap.xml` — page URLs (Includes new `/people` and `/reach` pages).
- `sitemap-images.xml` — 100+ images with explicit `<image:caption>` and `<image:title>` tags.
- `sitemap-index.xml` — master index for Google Search Console.

---

## 🎨 Image Pipeline & Auto-Cleanup

**Every image gets:**
- ✅ **WebP + AVIF conversion** (60-80% smaller)
- ✅ **Responsive variants** (400, 800, 1200, 1600px)
- ✅ **Auto-cleanup**: If an original `.jpg` is renamed or deleted, the `optimize-images.cjs` script now auto-deletes the orphaned `.webp`, `.avif`, and responsive variants to keep the repo clean.

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

---

## 📝 How to Add Content

### ➕ Add a notable person
1. Open `data/people.json`.
2. Add an object with `name`, `role`, `locality`, `bio`, and `photo`.
3. Push — the `/people` page updates automatically.

### ➕ Add a new article
1. Open the relevant file in `data/articles/`.
2. Add a new object to the `articles` array.
3. Commit — site, sitemap, and SEO all update automatically.

### 🎨 Change the entire theme
1. Open `data/master.json`.
2. Change the 5 brand colors under `"brand": { "colors": { ... } }`.
3. Rebuild — the whole site restyles instantly.

---

## 🧱 Technical Stack

| Layer | Technology |
|---|---|
| **Markup** | HTML5 (pre-rendered) |
| **Styling** | CSS3 (Custom properties, Fluid Typography, Glassmorphism) |
| **Scripting** | Vanilla JavaScript (no framework) |
| **Maps** | Leaflet.js + Esri Satellite (via CDN) |
| **Hosting** | Vercel |
| **Fonts** | Self-hosted (Fraunces, Inter, IBM Plex Mono) |
| **PDF Generation** | Puppeteer + sharp |
| **Automation** | GitHub Actions (3 workflows) |

**Runtime dependencies:** 0 (all assets self-hosted)

---

## 📚 Data Sources

- Census of India, 2011
- MGNREGA Public Portal
- Jal Jeevan Mission dashboard
- News18, Prabhat Khabar, Hindustan, Dainik Jagran
- Rajya Sabha records
- Archaeological Survey of India
- Personal interviews, 2024–2026

---

## 🗺️ Roadmap

### ✅ Done
- **People of Bandwar Page** (Directory + Email Submission form)
- **How to Reach Bandwar Page** (Travel Guide with real data)
- **Modern Heritage CSS Design** (Paper texture, Glass navbar, Fluid text)
- Modular data architecture (Category-wise JSON split)
- Google Site Name search fix (Vercel → Bandwar)
- Google Image SEO fix (figcaption + image sitemaps)
- FAQ Schema generation
- Image auto-cleanup logic (orphaned files)
- Interactive map with 18 landmarks
- 2,600-year timeline
- Auto-generated PDF (`Vision-Vikshit-Bandwar.pdf`)
- Complete SEO architecture
- PWA installability with offline cache

### ⏳ In Progress
- PageSpeed optimization (async fonts, critical CSS)
- AI-generated "required" images for pending priorities

### ☐ Planned
- **Village Directory** (Mechanics, Doctors, Shops) — *Next Priority*
- **Emergency Contacts** (Ambulance, Mukhiya, Police)
- Hindi version (`hi-IN` with `/hi/` routes)
- Voice recordings of elders — audio archive
- Flood memory map — historic flood records

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