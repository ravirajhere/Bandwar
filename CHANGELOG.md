# Changelog

All notable changes to the **Bandwar Archive** project will be documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Hindi version (`hi-IN`) with `/hi/` routes
- Voice recordings of village elders
- Alumni registry for S.N.K. High School
- Flood memory map with historic flood records
- English Wikipedia article for Bandwar
- Additional development priorities (Drainage, Playground, Piped Water, Library)
- Google Business Profile for local pack

---

## [5.0.0] — 2026-10-10

### Added
- **Complete SEO architecture** — schema.org `@graph` on every page
- **Static site generation** — all pages pre-rendered at build time
- **Rolling horizon model** — vision year auto-shifts (2026 → "Bandwar 2036")
- **Image pipeline** — WebP + AVIF + responsive variants via sharp
- **Master control file** (`data/master.json`) — single source of truth
- **Build system** (`scripts/build.cjs`) — 44 pages in < 1 second
- **Validation system** (`scripts/validate.cjs`) — 8 rules enforced
- **Image sitemap** (`sitemap-images.xml`) — 100+ images indexed
- **Sitemap index** (`sitemap-index.xml`) — master reference
- **`robots.txt`** with AI scraper blocks
- **License schema** on all images
- **Pre-rendered landmark list** for SEO (place.html)
- **Pre-rendered timeline events** for SEO (time.html)
- **Before/after sliders** for vision priorities (with keyboard accessibility)
- **PWA support** — installable, offline-capable
- **Two-file theme system** — `theme.css` + `style.css`
- **4 theme presets** — dark, sepia, contrast, indigo
- **GitHub Actions** — automated build + deploy
- **Vercel deploy hook** — bypasses daily deploy limit
- **`.github/ISSUE_TEMPLATE/`** — structured bug/feature/content reports
- **`CONTRIBUTING.md`** — full contribution guide
- **`CODE_OF_CONDUCT.md`** — Contributor Covenant 2.1
- **`SECURITY.md`** — responsible disclosure policy
- **This CHANGELOG**

### Changed
- **Migrated** from runtime rendering to build-time pre-rendering
- **Migrated** CSS tokens to v4 namespace (`--c-*`, `--f-*`, `--sp-*`)
- **Renamed** image folders: `index/` → `home/`, `reality/` → `village/`, `needs/` → `vision/`
- **Consolidated** data files: 7 → 4 (`master`, `content`, `vision`, `media`)
- **Consolidated** HTML pages: 10 → 8 maintained templates
- **Updated** `package.json` — new scripts, Node 20 requirement
- **Updated** `vercel.json` — build from `dist/`, security headers
- **Improved** image naming convention — kebab-case, descriptive
- **Improved** navigation — absolute paths, active state detection

### Fixed
- **Removed duplicate `:root` block** in `style.css` (dark mode now works)
- **Fixed** sitemap generator — now reads `content.json` (was `articles.json`)
- **Fixed** sitemap paths — `/place` (was `/map`), `/section` (was `/category`)
- **Fixed** canonical URLs on article pages (unique per article)
- **Fixed** OG image alt text on all pages

### Removed
- **Removed** inline CSS from `section.html` (~30 lines)
- **Removed** inline CSS from `place.html` (~48 lines)
- **Removed** unused weather widget CSS (~40 lines)
- **Removed** unused countdown CSS (~40 lines)
- **Removed** legacy `--ink`, `--paper`, `--forest` aliases
- **Removed** runtime schema injection (now build-time)
- **Removed** runtime content rendering (now pre-rendered)

### Security
- **Added** `Content-Security-Policy` headers
- **Added** `Strict-Transport-Security` with preload
- **Added** `X-Content-Type-Options: nosniff`
- **Added** `X-Frame-Options: SAMEORIGIN`
- **Added** `Referrer-Policy: strict-origin-when-cross-origin`
- **Added** `Permissions-Policy` restricting geolocation/microphone/camera
- **Self-hosted** Leaflet.js (removed CDN dependency)

---

## [4.0.0] — 2026-09-15

### Added
- 30 in-depth articles across 7 categories
- Interactive map with 18 landmarks (Leaflet.js)
- 2,600-year timeline with 4 historical eras
- Photo gallery with 37 images and lightbox
- Vision page with 15 before/after sliders
- 4 government achievement records
- PWA installability with service worker
- Two-file theme system with dark mode
- Clean URLs on all pages
- Reading progress bar on articles
- Search functionality
- Contribute page

### Changed
- Redesigned visual identity
- Improved typography (Fraunces, Inter, IBM Plex Mono)
- Reorganized content into JSON data files

---

## [3.0.0] — 2026-06-01

### Added
- Initial public launch
- Core content structure
- Basic SEO (title, description, canonical)
- Responsive design
- Dark mode toggle

---

## [2.0.0] — 2026-03-15

### Added
- Content editing workflow
- Multiple data files
- Initial theming system

---

## [1.0.0] — 2024-12-01

### Added
- Initial repository setup
- First article drafts
- Basic HTML structure

---

## Types of Changes

- `Added` — new features
- `Changed` — changes in existing functionality
- `Deprecated` — soon-to-be-removed features
- `Removed` — removed features
- `Fixed` — bug fixes
- `Security` — vulnerability fixes

---

## Links

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Repository](https://github.com/ravirajhere/Bandwar)
- [Live Site](https://bandwar.vercel.app)