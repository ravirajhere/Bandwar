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
- **Premium Typography:** Uses **Fraunces** (a modern serif) for headings and **Inter** for body text, with JetBrains Mono for technical data.
- **Read-First Philosophy:** The website is strictly in "Reading Mode" by default. Editing is an intentional action enabled via an "Edit Mode" toggle on articles.
- **Senior-Friendly & Accessible:** Large touch targets, high contrast ratios, and keyboard-navigable interfaces with global `focus-visible` rings.
- **Dark/Light Mode:** "Obsidian" dark mode that saves preference via `localStorage` without page flashing.
- **Dynamic Scaling:** CSS scaling optimized for everything from a 320px mobile screen to 4K TVs.

### 👤 Contributor Profiles & Auth System
A lightweight, database-free authentication system designed for high trust.
- **Identity-First Editing:** No one can edit without a profile. A simple popup asks for Name, a Private Login ID (username), and optional email.
- **Privacy First:** A contributor's Username is treated strictly as a private login credential. The public website only displays their **Display Name** and **Profile Photo**.
- **Profile Pages:** Every contributor gets a public page (`/contributors/[username]`) featuring their bio and profile picture.
- **Direct Image Upload:** Profile photos are compressed directly in the browser (Canvas API) before being uploaded to GitHub.
- **Cross-Device Login:** No passwords. Users can log in on any device by simply entering their existing private Login ID.

### 🛡️ Advanced Moderation System (Telegram + Dashboard)
This is the core of the portal's automation. It uses GitHub as a database and Telegram as a real-time notification system.
- **Wikipedia-Style Inline Editing:** Visitors can edit Titles, Paragraphs, and Infobox data directly on the page.
- **Auto-Updating Metadata:** When an edit is published, the system automatically updates the `lastUpdated` date and `lastEditedBy` name on the article/profile.
- **Pending Image Review:** When a hero image or profile photo is uploaded, it goes to a `public/images/pending/` folder. The editor can preview it on the Dashboard before approving.
- **Exact Path Overwrite:** When approved, the new image overwrites the old image at its exact previous path (e.g., `public/images/religion/ram-mandir.jpg`), ensuring no broken links.
- **Dynamic Custom Categories:** If a visitor submits a new Article or Directory entry, they can create a *Custom Category* (e.g., "Sports"). Upon publishing, the system automatically creates the new `.json` file and registers the category.
- **Batch Publishing (Zero Build Waste):** Approving an edit only "Stages" it. The actual JSON files are only updated when you hit **"🚀 Publish Live"** on the Dashboard. This groups 10+ edits into **one single GitHub commit**, saving Vercel build minutes.
- **Auto-Delete on Reject:** If an editor rejects a pending image, it is automatically deleted from the GitHub repository to keep it clean.

### 🗺️ Core Pages & Features
- **Home Dashboard:** Grand editorial hero section with a dismissible Development Notice, Quick Access buttons, and an interactive Satellite Map.
- **About & Community:** Features an "Our Story" section, principles, and a dynamic **Recent Contributors** grid that automatically updates to show active members.
- **Get Involved (Contribute):** A dedicated page explaining the inline editing tools, with a prominent Call-to-Action for visitors to create their contributor profile.
- **Interactive Village Map:** Uses React Leaflet with Esri satellite tiles. Features marker clustering and a custom location-fixing tool.
- **Directory:** Searchable index of doctors, shops, and emergency contacts with last updated timestamps.
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
│   ├── projects.json           # Development projects & achievements data
│   ├── categories.json         # Article categories
│   ├── contributors.json       # Registered user profiles (Auto-managed)
│   ├── queue.json              # PENDING & STAGED community edits (Auto-managed)
│   └── articles/               # All articles split by category
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
│   │   ├── people/             # People Directory & Profiles
│   │   ├── section/            # Archive category listing
│   │   ├── globals.css         # Custom CSS tokens, fonts, print styles
│   │   └── layout.tsx          # Main Layout (Header, Footer, JSON-LD SEO)
│   │
│   ├── components/             
│   │   ├── about/              # ContributorGrid (Recent contributors on About page)
│   │   ├── article/            # ArticleToolbar, Infobox, MobileTOC
│   │   ├── contribute/         # JoinCTA, ContributeForm
│   │   ├── contributor/        # ProfileClientWrapper, EditProfileModal
│   │   ├── editor/             # EditableText, EditableParagraph, EditModeToggle
│   │   ├── home/               # DevNotice (Development banner)
│   │   ├── layout/             # Header, Footer, SearchModal
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

1. **Receive Submission:** A user submits an edit or new content. It automatically saves to data/queue.json (Pending) and sends a Telegram alert with an image preview.
2. **Review in Dashboard:** Go to /admin/dashboard (Password: bandwar_admin_2026). You will see all Pending edits with a strict Red/Green diff view.
3. **Review Images:** If an image was submitted, it is saved to public/images/pending/. You can click it to view full size.
4. **Stage or Reject:** Click "Stage for Publish" (or click ✅ on Telegram). If you reject an image, it is automatically deleted from GitHub to keep the repo clean.
5. **Batch Publish:** Once you have 5-10 staged edits, click the green "🚀 Publish X Updates Live" button. 
   - The Dashboard uses the GitHub API to update all target JSON files in a single commit.
   - Pending images are moved to their final exact paths (overwriting old ones).
   - New custom categories are automatically registered.
   - **Metadata (Last Updated & Last Edited By) is automatically updated.**
   - Vercel triggers exactly one build and deploys the changes.

---

## 🛡️ Data Validation (Crucial)

Because the website relies on Zod and JSON, a single missing comma will break the build. Vercel is configured to run validation automatically before deploying.

To run it manually:
npm run validate

- ✅ Green Pass: Data is perfect.
- ❌ Red Fail: The terminal will show exactly which field is missing (Expected string, received null, etc.). Fix the JSON immediately.

---

## 🏆 Golden Rules for Maintenance

1. **queue.json & contributors.json are Auto-managed:** Do not manually edit these files unless resetting a corrupted state. They are managed entirely by the API routes.
2. **Security:** Never commit your .env file. All tokens must live in Vercel's Environment Variables. Never expose your GitHub PAT (GITHUB_TOKEN) to the client-side code.
3. **Vercel Builds:** The vercel.json file contains an ignoreCommand. It tells Vercel to ignore builds if only queue.json is changed. This saves your free tier limits.
4. **Image Paths:** In JSON, use paths like images/home/hero.jpg (no leading slash).
5. **Typography:** Use the font-serif class for headings (Fraunces) and default font-sans (Inter) for body text to maintain the identity.

---
*Built with ❤️ for Bandwar. Inspired by Wikipedia, The New York Times, and GitHub.*