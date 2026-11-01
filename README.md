# 🏛️ Bandwar Village Portal

A community-built digital archive for Bandwar village, Begusarai (Bihar) — designed to be a living, interactive portal for residents and their descendants.

Built with a **Strict Heritage UI** and a **Zero-Database Architecture**, this portal prioritizes accessibility, content density, and speed. It is designed to be maintained by a **Solo Editor** while allowing seamless, automated **Community Contributions** via a **Telegram Bot and a custom Moderation Dashboard**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zod](https://img.shields.io/badge/Zod-3.23-blueviolet?style=flat-square&logo=zod)](https://zod.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Community_Edits-blue?style=flat-square&logo=telegram)](https://core.telegram.org/bots)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 📸 Screenshots

*(Yahan aap apni website ke screenshots add kar sakte hain)*

| Desktop Homepage | Article Reading View |
| :---: | :---: |
| `![Desktop View](https://via.placeholder.com/800x450?text=Desktop+View)` | `![Article](https://via.placeholder.com/800x450?text=Article+Page)` |
| **Moderation Dashboard** | **Interactive Map** |
| `![Dashboard](https://via.placeholder.com/800x450?text=Moderation+Dashboard)` | `![Map](https://via.placeholder.com/800x450?text=Map+View)` |

---

## ✨ Key Features

### 🎨 The "Warm Archive" Identity (UI/UX)
- **Strict Heritage Design:** A completely custom design system inspired by The New York Times and Anthropic. Features a "Warm Aged Paper" background (`#FBF8F3`), "Mithila Terracotta" accents (`#7C2D12`), and editorial typography.
- **Premium Typography:** Uses **Fraunces** (a modern serif) for headings and **Inter** for body text, with JetBrains Mono for technical data. Includes editorial Drop Caps.
- **Senior-Friendly & Accessible:** Large touch targets, high contrast ratios, and keyboard-navigable interfaces with global `focus-visible` rings.
- **Dark/Light Mode:** "Obsidian" dark mode that saves preference via `localStorage` without page flashing.
- **Dynamic Scaling:** CSS scaling optimized for everything from a 320px mobile screen to 4K TVs.

### 🛡️ Advanced Moderation System (Telegram + Dashboard)
This is the core of the portal's automation. It uses GitHub as a database and Telegram as a real-time notification system.
- **Wikipedia-Style Inline Editing:** Visitors click the pencil (✏️) icon next to any text or Infobox data to suggest a correction.
- **Telegram Inline Buttons:** When a user submits an edit, the Bot sends a message with **[✅ Stage] [❌ Reject]** buttons.
- **Two-Way Sync (Dashboard + Telegram):** If you approve an edit on the Telegram Bot, the custom `/admin/dashboard` updates automatically. If you approve it on the Dashboard, the Telegram message updates to show "Staged via Dashboard."
- **Batch Publishing (Zero Build Waste):** Approving an edit only "Stages" it. The actual JSON files are only updated when you hit **"🚀 Publish Live"** on the Dashboard. This groups 10+ edits into **one single GitHub commit**, saving Vercel build minutes.
- **Auto Image Compression:** When a visitor uploads a photo, it is compressed **on their device** (via Canvas API) before being sent to Telegram/GitHub, saving bandwidth.

### 🗺️ Core Pages & Features
- **Home Dashboard:** Grand editorial hero section, Quick Access buttons (Emergency, People, Archive), and an interactive Satellite Map.
- **Interactive Village Map:** Uses React Leaflet with Esri satellite tiles. Features marker clustering and a custom location-fixing tool (GPS + Drag).
- **Directory:** Searchable index of doctors, shops, and emergency contacts with inline editing.
- **Gallery:** A strict, high-density Masonry grid (Wikimedia Commons style) with a distraction-free Lightbox.
- **Article Archive:** 3-column layout (Sticky TOC, Content, Sticky Infobox) with auto-generated Backlinks ("Mentioned In") and FAQ Accordions.
- **Text-to-Speech (TTS):** "Listen to Article" feature supporting Hindi/Indian English.

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **Styling:** Tailwind CSS (Custom design tokens, @tailwindcss/typography)
- **Data Validation:** Zod (Strict Type-Safety during build)
- **Maps:** React Leaflet, React-Leaflet-Cluster
- **Fonts:** Next.js next/font/google (Fraunces, Inter, JetBrains Mono)
- **Icons:** Lucide React
- **Automation:** Next.js API Routes (Telegram Bot API, GitHub REST API)
- **Deployment:** Vercel

---

## 📂 Detailed File Structure

bandwar-portal/
├── data/                       # 👑 CONTENT WORKSPACE (All JSONs)
│   ├── master.json             # Site Config, Homepage, Footer, SEO
│   ├── directory.json          # Local services, doctors, shops
│   ├── reach.json              # How to reach the village
│   ├── media.json              # Gallery photos, Timeline, Map landmarks
│   ├── people.json             # Notable personalities directory
│   ├── vision.json             # Vision 2035 Manifesto data
│   ├── queue.json              # PENDING & STAGED community edits (Auto-managed)
│   └── articles/               # All articles split by category
│       ├── culture.json
│       ├── education.json
│       ├── landmarks.json
│       └── ... (other categories)
│
├── public/                     # 📸 STATIC ASSETS
│   └── images/                 # All photos organized by category
│
├── scripts/                    
│   └── validate.ts             # Zod validation engine (Runs before build)
│
├── src/                        
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Moderation Dashboard (Protected by cookie)
│   │   │   ├── dashboard/      # Main review UI
│   │   │   └── page.tsx        # Admin Login
│   │   ├── api/                
│   │   │   ├── admin/          # APIs for fetching queue and publishing batches
│   │   │   ├── telegram-submit/# Receives forms, saves to queue, alerts Telegram
│   │   │   └── telegram-webhook/# Handles Telegram button clicks (Syncs with queue)
│   │   ├── article/[id]/       # Article Page (TOC, Reading Progress, Toolbar)
│   │   ├── directory/          # Village Directory Page
│   │   ├── gallery/            # Photo Gallery Page
│   │   ├── people/             # People Directory & Profiles
│   │   ├── section/            # Archive category listing
│   │   ├── globals.css         # Custom CSS tokens, fonts, print styles
│   │   ├── layout.tsx          # Main Layout (Header, Footer, JSON-LD SEO)
│   │   └── page.tsx            # Homepage
│   │
│   ├── components/             
│   │   ├── article/            # ArticleToolbar, FaqAccordion, Infobox, MobileTOC
│   │   ├── contribute/         # ContributeForm
│   │   ├── directory/          # DirectoryClient, EditContactModal
│   │   ├── layout/             # Header, Footer, SearchModal
│   │   ├── place/              # LandmarkMap, GalleryGrid, Lightbox
│   │   ├── shared/             # AddContentModal, UniversalEditModal, Toast
│   │   └── ui/                 # Button, Input primitives (if any)
│   │
│   └── lib/                    
│       ├── data.ts             # Reads JSON, Filters missing images, Sorts articles
│       ├── search-data.ts      # Aggregates data for Global Search
│       └── schema.ts           # Zod schemas (Strict typing for all JSON)
│
├── tailwind.config.ts          # Identity tokens (Warm Archive theme)
├── vercel.json                 # Ignores Vercel builds for queue.json updates
└── package.json                # Dependencies

---

## 🛠️ Local Setup

1. **Install dependencies:**
   npm install

2. **Environment Variables:** Create a .env.local file in the root directory. You will need a Telegram Bot and a GitHub Personal Access Token (PAT).
   TELEGRAM_BOT_TOKEN="your_bot_token_here"
   TELEGRAM_CHAT_ID="your_chat_id_here"
   TELEGRAM_WEBHOOK_SECRET="your_secret_password"
   GITHUB_TOKEN="ghp_your_personal_access_token"
   GITHUB_REPO_OWNER="your_github_username"
   GITHUB_REPO_NAME="your_repo_name"

3. **Start the development server:**
   npm run dev

---

## ✍️ The Editor Workflow (How to handle Contributions)

Thanks to the Moderation Dashboard, the Editor's life is incredibly easy. The system acts as a mini-CMS.

1. **Receive Submission:** A user submits an edit on the website. It automatically saves to data/queue.json (Pending) and sends a Telegram alert with an image preview (if applicable).
2. **Review in Dashboard:** Go to /admin/dashboard (Default Password: bandwar_admin_2026). You will see all Pending edits with a strict Red/Green diff view.
3. **Stage It:** Click "Stage for Publish" (or click ✅ on Telegram). The edit moves to the "Staged" tab. (Vercel will NOT rebuild during this step).
4. **Handle Images:** If an image was submitted, download it from Telegram, rename it to match the instructions, and manually upload it to public/images/ on GitHub.
5. **Batch Publish:** Once you have 5-10 staged edits, click the green "🚀 Publish X Updates Live" button. The Dashboard will use the GitHub API to update all target JSON files in a single commit. Vercel will trigger exactly one build and deploy the changes.

---

## 🛡️ Data Validation (Crucial)

Because the website relies on Zod and JSON, a single missing comma will break the build. Vercel is configured to run validation automatically before deploying.

To run it manually:
npm run validate

- ✅ Green Pass: Data is perfect.
- ❌ Red Fail: The terminal will show exactly which field is missing (Expected string, received null, etc.). Fix the JSON immediately.

---

## 🏆 Golden Rules for Maintenance

1. **queue.json is Auto-managed:** Do not manually edit data/queue.json. It is managed by the API routes. If it gets corrupted, reset it to: { "pending": [], "approved": [] }.
2. **Security:** Never commit your .env file. All tokens must live in Vercel's Environment Variables. Never expose your GitHub PAT (GITHUB_TOKEN) to the client-side code.
3. **Vercel Builds:** The vercel.json file contains an ignoreCommand. It tells Vercel to ignore builds if only queue.json is changed. This saves your free tier limits.
4. **Image Paths:** In JSON, use paths like images/home/hero.jpg (no leading slash).
5. **Typography:** Use the font-serif class for headings (Fraunces) and default font-sans (Inter) for body text to maintain the identity.

---
*Built with ❤️ for Bandwar. Inspired by Wikipedia, The New York Times, and GitHub.*