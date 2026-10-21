# 📜 Bandwar Village Archive

A community-built digital archive of Bandwar village, Begusarai (Bihar) — its history, temples, schools, culture, and daily life. 

This project follows a **"Code-Once, Edit Forever"** architecture. The website is 100% static (SSG), requires no database or backend, and is entirely driven by JSON data. As a Solo Editor, you only need to touch the `data/` folder to update the website.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, SSG)
- **Styling:** Tailwind CSS
- **Data Validation:** Zod (Ensures JSON data is always 100% correct before build)
- **Maps:** Leaflet & React-Leaflet
- **Deployment:** Vercel (Zero-config)

---

## 📂 Folder Structure (Where to do what)

You only need to focus on **2 folders**. You do not need to touch the underlying code.

bandwar-archive/
├── data/                   # 👑 YOUR WORKSPACE (All Content)
│   ├── master.json         # Site Config, SEO, Nav, About Page data
│   ├── categories.json     # Categories (Temples, Schools, etc.)
│   ├── people.json         # Notable personalities directory
│   ├── vision.json         # Vision 2035 Manifesto data
│   ├── media.json          # Gallery, Timeline, and Map (Landmarks) data
│   └── articles/           # All articles in JSON format
│       ├── education.json  
│       └── culture.json    # (Create new files and add data here)
│
├── public/
│   └── images/             # Put all your photos here
│
├── scripts/                # Automation scripts
│   └── validate.ts         # JSON validation script
│
└── src/                    # Website code (Do not touch this)

---

## 🛠️ Local Setup (For the first time)

Run these commands in your terminal:

1. Install dependencies:
   npm install

2. Start the local server:
   npm run dev
   
   The website will be live at http://localhost:3000.

---

## ✍️ How to Add New Content (Solo Editor Workflow)

Follow these steps whenever you want to add new content:

### 1. Adding a New Article
- Create a new JSON file in the `data/articles/` folder (e.g., `geography.json`).
- You can copy `education.json` to check the schema format.
- To link to other articles inside the text, use the `[[article-id|Display Text]]` format.

### 2. Adding a New Person
- Open `data/people.json`.
- Add a new object to the `people` array. (The `id` must be unique).

### 3. Adding a New Photo
- First, place the photo in the correct folder inside `public/images/` (e.g., `public/images/culture/`).
- Then, open `data/media.json` and add a new object to the `gallery.photos` array.

### 4. Updating the Timeline
- Open `data/media.json`.
- Add a new event to the `timeline` array. Make sure to include the `sortKey` (e.g., 2026) to place it in the correct chronological order.

---

## 🛡️ Data Validation (The Most Important Step)

Because we are using JSON, a small mistake (like a missing comma or a misspelled field) can break the website build. 

Therefore, always run this command before pushing to GitHub:

   npm run validate

- If it shows **Green** (✅), your data is perfect. You can proceed.
- If it shows **Red** (❌), the terminal will show the exact line number and error. Fix the JSON accordingly.

---

## 🚀 Deployment (Vercel)

Our code will connect directly from GitHub to Vercel. Whenever you update the JSON and `git push`, Vercel will automatically rebuild and deploy the website.

1. Push your code to GitHub:
   git add .
   git commit -m "feat: added new article and photos"
   git push origin main
   
2. Log in to Vercel.com and import your GitHub repository.
3. The framework preset will automatically select Next.js. Click **Deploy**.
4. Your archive will be live!

### Google Search Console Setup
After deploying, go to Google Search Console (https://search.google.com/search-console) and submit your `sitemap.xml`. Our dynamic sitemap will automatically notify Google about all your new articles.

---

## 💡 Golden Rules (Always Remember)

1. **Do not touch the `src/` folder.** The code is already written; from now on, only play with the `data/` folder.
2. **Image paths:** In JSON, the image path should be written as `images/folder-name/photo-name.jpg` (without a leading `/`).
3. **Unique IDs:** Every article, person, and photo must have a unique ID (e.g., `chhath-ghat`, `snk-high-school`).
4. **Before deploying:** Always run `npm run validate`.

---

*Made with ❤️ by the Bandwar Village Community.*