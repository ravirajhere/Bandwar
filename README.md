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
[![Next.js](https://img.shields.io/badge/Built_with-Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://bandwar.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://bandwar.vercel.app)

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
- [SEO & Rich Results](#-seo--rich-results)
- [Performance & Optimization](#-performance--optimization)
- [Quick Start](#-quick-start)
- [How to Add Content](#-how-to-add-content)
- [Technical Stack](#-technical-stack)
- [Data Sources](#-data-sources)
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
- 👥 **People of Bandwar** — a directory of notable residents, leaders, and a submission form.
- 🚆 **Travel Guide** — detailed directions for NRIs and tourists via Air, Train, and Road.
- 🗺️ **Geographic landmarks** — 18 mapped locations with satellite coordinates
- 🛕 **Sacred spaces** — Shivala, Ram Mandir Thakurbari, Durga Mandir, and more
- 🔮 **A rolling 10-year vision** — a non-political manifesto of development priorities

Every fact is sourced. Every photograph is credited. Nothing is published without consent.

---

## ✨ Features

### 📚 Content & Architecture
- **Next.js 14 App Router** — Server Components with Static Site Generation (SSG) for maximum speed.
- **Zod Data Validation** — Type-safe JSON parsing ensures zero broken pages at build time.
- **30+ in-depth articles** across categories, split into a **modular data structure**.
- **People of Bandwar** — Notable figures directory with an interactive email-based submission form.
- **Interactive Map** — 18 landmarks rendered with Leaflet.js + Esri satellite imagery.
- **2,600-year timeline** — from the Anga Mahajanapada to present.
- **Vision page** — 15 development priorities with before/after image sliders.
- **FAQ Accordion** — Interactive `details`/`summary` elements with `FAQPage` Schema.

### ⚡ Performance & SEO
- **Static Export** (`output: 'export'`) — Generates pure HTML/CSS with minimal JS for ultimate performance.
- **Zero Layout Shift (CLS)** — Handled natively via Next.js optimization.
- **Complete Schema.org `@graph`** — Article, Place, Organization, WebSite, FAQPage, BreadcrumbList pre-rendered.
- **Google Search Name Fix** — Optimized `alternateName` to prevent "Vercel" from showing as the site name.
- **Auto-generated sitemaps** — Native Next.js `sitemap.ts` generation.
- **Self-hosted Fonts** — Optimized via `next/font` for zero render-blocking.

---

## 🏗️ Architecture

```text
                ┌────────────────────────────────────────┐
                │          data/ (JSON)                  │
                │  (Single source of truth for content)  │
                └────────────────┬───────────────────────┘
                                 │
                                 ▼
                   ┌──────────────────────────┐
                   │  Next.js App Router      │
                   │  (Server Components +    │
                   │   Zod Validation)        │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │  Static Export           │
                   │  (out/ folder HTML/JS)   │
                   └────────────┬─────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │  Vercel Edge Network     │
                   │  (Manual Deploy)         │
                   └──────────────────────────┘
```

**Golden rule:** Content grows in JSON. The React components and Next.js config never change.

---

## 📂 Project Structure

```text
bandwar/
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
├── 📁 public/                           # Static assets
│   ├── 📁 images/                       # Source images (WebP/AVIF)
│   ├── 📁 fonts/                        # Self-hosted fonts
│   └── 📁 pdfs/                         # Manifesto PDF
│
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── layout.tsx                   # Root layout (Navbar/Footer)
│   │   ├── page.tsx                     # Homepage
│   │   ├── article/[slug]/page.tsx      # Dynamic Article page
│   │   ├── section/page.tsx             # Categories
│   │   └── sitemap.ts                   # Auto-generated sitemap
│   │
│   ├── 📁 components/                   # Reusable React UI
│   └── 📁 lib/                          # Utilities & Zod Schemas
│       ├── data.ts                      # FS data loaders
│       └── schema.ts                    # Zod validation
│
├── 📄 next.config.mjs                   # Next.js config (output: export)
├── 📄 package.json                      # Scripts + dev deps
├── 📄 tsconfig.json                     # TypeScript config
├── 📄 vercel.json                       # Deployment config (Manual Deploy)
└── 📄 LICENSE                           # MIT (code) + © Community (content)
```

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

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) for local development.

---

## 📝 How to Add Content

*Due to `"deploymentEnabled": false` in `vercel.json`, pushing to GitHub will **not** auto-deploy. To go live, manually trigger a Redeploy from the Vercel Dashboard.*

### ➕ Add a new article
1. Open the relevant file in `data/articles/`.
2. Add a new object to the `articles` array.
3. Commit — Next.js will auto-generate the new page at build time.

### ➕ Add a notable person
1. Open `data/people.json`.
2. Add an object with `name`, `role`, `locality`, `bio`, and `photo`.
3. Commit.

---

## 🧱 Technical Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript + React |
| **Styling** | Custom CSS (Tokens & Components) |
| **Validation** | Zod |
| **Maps** | Leaflet.js + Esri Satellite |
| **Hosting** | Vercel (Static Export) |
| **Fonts** | Self-hosted (next/font) |

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
- **Migration to Next.js 14 (App Router)**
- **TypeScript & Zod Integration**
- **People of Bandwar Page** (Directory + Email Submission form)
- **How to Reach Bandwar Page** (Travel Guide with real data)
- Interactive map with 18 landmarks
- 2,600-year timeline
- Complete SEO architecture

### ⏳ In Progress
- PageSpeed optimization (next/image, next/font, critical CSS)
- Hindi version (`hi-IN` with `/hi/` routes)

### ☐ Planned
- **Village Directory** (Mechanics, Doctors, Shops)
- **Emergency Contacts** (Ambulance, Mukhiya, Police)
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