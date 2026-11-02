<div align="center">

# 🏛️ Bandwar Village Portal

**A community-built, zero-database digital archive for Bandwar village, Begusarai (Bihar).**

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

The Bandwar Portal is not just a website; it is a **digital preservation project**. It was built with a "Content-First, Zero-Database" philosophy.

- **Zero Database:** We use **GitHub as our CMS and Database**. There is no MongoDB, MySQL, or Firebase. Everything is stored in static `.json` files. This means zero hosting costs for a database, 100% data ownership, and infinite scalability.
- **Read-First, Edit-Second:** Inspired by Wikipedia, the website is in "Reading Mode" by default. Editing is an intentional action (via an Edit Mode toggle) to prevent accidental edits and maintain an authoritative tone.
- **Solo-Editor, Community-Driven:** The system is designed for a single editor to manage, but powered by community contributions via a Telegram Bot and an Inline Editing system.
- **Privacy First:** A contributor's Login ID (username) is kept strictly private. The public website only displays their Display Name and Profile Photo.

---

## ✨ Key Features (Deep Dive)

### 🎨 The "Warm Archive" UI Identity
- **Aesthetic:** Inspired by The New York Times and Anthropic. Features a "Warm Aged Paper" background (`#FBF8F3`), "Mithila Terracotta" accents (`#7C2D12`), and editorial typography.
- **Typography:** Uses **Fraunces** (modern serif) for headings, **Inter** for body text, and **JetBrains Mono** for technical map data.
- **Responsive:** Fluid typography scaling from a 320px mobile screen to a 4K TV.
- **Dark Mode:** A custom "Obsidian" dark mode that saves preference via `localStorage` without page flashing (FOUC).

### 🗺️ Cartographic Index (`/map` Page)
- **Formal Design:** A dedicated map page designed like an archival atlas. It removes gimmicky emojis and uses formal numbered markers, a scale bar, and live coordinate tracking.
- **A-Z Index:** A sidebar with an alphabetical searchable index of all landmarks. Clicking a landmark auto-pans the map.
- **Location Fixing:** A crowdsourced "Report wrong location" tool allowing users to drag the map to correct coordinates.

### 🔊 Sticky Audio Player (TTS)
- **English-Only:** Uses the browser's Web Speech API to read articles aloud in professional English.
- **Sticky UI:** A Spotify-style floating player at the bottom allows users to pause, play, skip sections, and change reading speed without losing their place in the article.
- **Section-by-Section:** Reads the Introduction, then pauses slightly before reading each heading and paragraph.

### 🛡️ The Moderation Engine (Telegram + Dashboard)
- **Inline Editing:** Users click pencil icons to edit Titles, Paragraphs, and Infoboxes directly on the page.
- **Auto-Image Compression:** Uploaded images are compressed client-side via Canvas API before being sent to GitHub (saving bandwidth).
- **Pending Review:** New images go to a `public/images/pending/` folder.
- **Telegram Sync:** Submissions trigger a Telegram Bot alert. The editor can approve/reject directly from the phone or the Dashboard.
- **Batch Publishing:** Approving an edit only "Stages" it. Hitting "🚀 Publish Live" bundles 10+ edits into **one single GitHub commit**, preventing Vercel build spam.
- **Auto-Metadata:** When an edit is published, the system auto-updates the `lastUpdated` date and `lastEditedBy` name on the article.
- **Dynamic Categories:** Users can create a "Custom Category" (e.g., Sports). The system auto-generates the new `.json` file and registers it in `categories.json` upon approval.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (Custom design tokens, @tailwindcss/typography)
- **Data Validation:** Zod (Strict Type-Safety during build)
- **Maps:** React Leaflet, React-Leaflet-Cluster
- **Fonts:** Next.js `next/font/google` (Fraunces, Inter, JetBrains Mono)
- **Icons:** Lucide React
- **Automation:** Next.js API Routes (Telegram Bot API, GitHub REST API)
- **Deployment:** Vercel

---

## 📂 File Structure

```text
bandwar-portal/
├── data/                       # 👑 CONTENT WORKSPACE (All JSONs)
│   ├── master.json             # Site Config, Homepage, Footer, SEO
│   ├── directory.json          # Local services, doctors, shops
│   ├── media.json              # Gallery photos, Timeline, Map landmarks
│   ├── people.json             # Notable personalities directory
│   ├── projects.json           # Development projects & achievements data
│   ├── categories.json         # Article categories
│   ├── contributors.json       # Registered user profiles (Auto-managed)
│   ├── queue.json              # PENDING & STAGED community edits (Auto-managed)
│   └── articles/               # Articles split by category
│       ├── culture.json
│       ├── education.json
│       └── ... (other categories)
│
├── public/                     
│   ├── images/                 # All photos organized by category
│   │   └── pending/            # Temp folder for user uploads awaiting review
│   └── images/contributors/    # Auto-generated profile photos
│
├── scripts/                    
│   └── validate.ts             # Zod validation engine (Runs before build)
│
├── src/                        
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Moderation Dashboard (Protected)
│   │   │   ├── dashboard/      # Main review UI (Text & Image diffs)
│   │   │   └── page.tsx        # Admin Login
│   │   ├── api/                
│   │   │   ├── admin/          # APIs for fetching queue, publishing, rejecting
│   │   │   ├── contributor/    # APIs for registration, lookup, profile updates
│   │   │   └── telegram-submit/# Receives forms, saves to queue, alerts Telegram
│   │   ├── article/[id]/       # Article Page (TOC, Reading Progress, Toolbar)
│   │   ├── contributors/       # Public Contributor Profiles ([username]/page.tsx)
│   │   ├── contribute/         # "Get Involved" guide & General Feedback Hub
│   │   ├── directory/          # Village Directory Page
│   │   ├── gallery/            # Photo Gallery Page
│   │   ├── map/                # Dedicated Map Page (A-Z Index, Legend)
│   │   ├── people/             # People Directory & Profiles
│   │   ├── section/            # Archive category listing
│   │   ├── globals.css         # Custom CSS tokens, fonts, print styles
│   │   └── layout.tsx          # Main Layout (Header, Footer, JSON-LD SEO)
│   │
│   ├── components/             
│   │   ├── about/              # ContributorGrid
│   │   ├── article/            # ArticleToolbar, Infobox, MobileTOC
│   │   ├── contribute/         # JoinCTA, ContributeForm
│   │   ├── contributor/        # ProfileClientWrapper, EditProfileModal
│   │   ├── editor/             # EditableText, EditableParagraph, EditModeToggle
│   │   ├── home/               # DevNotice
│   │   ├── layout/             # Header, Footer, SearchModal
│   │   ├── map/                # LandmarkMap, MapIndex, MapLegend, MapClient
│   │   ├── shared/             # AddContentModal, ImageUpdateButton, Toast
│   │   └── ui/                 # Button, Input primitives
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useContributorGate.tsx # Handles auth & profile creation gate
│   │   └── useInlineEdit.ts    # Handles state for inline editing
│   │
│   └── lib/                    
│       ├── data.ts             # Reads JSON, Filters missing images
│       ├── contributor.ts      # Username generation, types
│       ├── search-data.ts      # Aggregates data for Global Search
│       └── schema.ts           # Zod schemas
│
├── .npmrc                      # Forces legacy-peer-deps for Leaflet
├── tailwind.config.ts          # Identity tokens (Warm Archive theme)
├── vercel.json                 # Ignores Vercel builds for queue.json updates
└── package.json                # Dependencies
```

---

## 🛠️ Local Setup Guide

### 1. Install Dependencies
```bash
npm install
```
*(Note: A `.npmrc` file is included in the root with `legacy-peer-deps=true`. This is required because `react-leaflet-cluster` hasn't officially updated its peer dependencies for React 19 yet.)*

### 2. Environment Variables
Create a `.env.local` file in the root directory. You will need a Telegram Bot and a GitHub Personal Access Token (PAT) with `repo` scope.

```env
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id_here"
TELEGRAM_WEBHOOK_SECRET="your_secret_password"

GITHUB_TOKEN="ghp_your_personal_access_token"
GITHUB_REPO_OWNER="your_github_username"
GITHUB_REPO_NAME="your_repo_name"
```

### 3. Start the Development Server
```bash
npm run dev
```

---

## ✍️ The Editor Workflow (Mini-CMS)

Thanks to the Moderation Dashboard, the Editor's life is incredibly easy. The system acts as a mini-CMS.

1. **Receive Submission:** A user submits an edit or new content. It automatically saves to `data/queue.json` (Pending) and sends a Telegram alert with an image preview.
2. **Review in Dashboard:** Go to `/admin/dashboard` (Default Password: `bandwar_admin_2026`). You will see all Pending edits with a strict Red/Green diff view.
3. **Review Images:** If an image was submitted, it is saved to `public/images/pending/`. You can click it to view full size.
4. **Stage or Reject:** Click "Stage for Publish". If you reject an image, it is automatically deleted from GitHub to keep the repo clean.
5. **Batch Publish:** Once you have 5-10 staged edits, click the green **"🚀 Publish X Updates Live"** button. 
   - The Dashboard uses the GitHub API to update all target JSON files in a single commit.
   - Pending images are moved to their final exact paths (overwriting old ones).
   - New custom categories are automatically registered.
   - Metadata (`lastUpdated` & `lastEditedBy`) is automatically updated.
   - Vercel triggers exactly **one** build and deploys the changes.

---

## 🛡️ Data Validation Engine

Because the website relies on Zod and JSON, a single missing comma will break the build. Vercel is configured to run validation automatically before deploying.

To run it manually:
```bash
npm run validate
```

- ✅ **Green Pass:** Data is perfect.
- ❌ **Red Fail:** The terminal will show exactly which field is missing (Expected string, received null, etc.). Fix the JSON immediately.

---

## 🏆 Golden Rules for Maintenance

1. **`queue.json` & `contributors.json` are Auto-managed:** Do not manually edit these files unless resetting a corrupted state. They are managed entirely by the API routes.
2. **Security:** Never commit your `.env` file. All tokens must live in Vercel's Environment Variables. Never expose your GitHub PAT (`GITHUB_TOKEN`) to the client-side code.
3. **Vercel Builds:** The `vercel.json` file contains an `ignoreCommand`. It tells Vercel to ignore builds if *only* `queue.json` is changed. This saves your free tier limits.
4. **Image Paths:** In JSON, use paths like `images/home/hero.jpg` (no leading slash).
5. **Typography:** Use the `font-serif` class for headings (Fraunces) and default `font-sans` (Inter) for body text to maintain the identity.

---
<div align="center">
  <i>Built with ❤️ for Bandwar. Inspired by Wikipedia, The New York Times, and GitHub.</i>
</div>