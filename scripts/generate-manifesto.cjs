/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — MANIFESTO PDF GENERATOR
   Generates a print-ready A4 PDF from vision.json + master.json
   
   Rolling Horizon Model:
     Edition: {currentYear}–{currentYear + 10}
     Auto-shifts each year (2026 → "Bandwar 2036", 2027 → "Bandwar 2037")
   
   Usage:
     node scripts/generate-manifesto.cjs
     node scripts/generate-manifesto.cjs --verbose
     node scripts/generate-manifesto.cjs --no-images
   
   Output:
     assets/pdfs/bandwar-vision-2026-2036.pdf
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/* ─────────────── CONFIG ─────────────── */
const ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'assets/pdfs');
const TMP_DIR = path.join(os.tmpdir(), 'bandwar-manifesto');
const ARGS = process.argv.slice(2);
const VERBOSE = ARGS.includes('--verbose');
const NO_IMAGES = ARGS.includes('--no-images');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

/* ─────────────── DEPENDENCIES ─────────────── */
let puppeteer, sharp;
try {
  puppeteer = require('puppeteer');
} catch (err) {
  console.error('');
  console.error(`${COLORS.red}${COLORS.bold}✗ puppeteer is not installed${COLORS.reset}`);
  console.error(`  Install: ${COLORS.blue}npm install --save-dev puppeteer${COLORS.reset}`);
  console.error('');
  process.exit(1);
}

if (!NO_IMAGES) {
  try {
    sharp = require('sharp');
  } catch (err) {
    console.warn(`${COLORS.yellow}⚠ sharp not installed — images will be inlined as-is${COLORS.reset}`);
    sharp = null;
  }
}

/* ─────────────── LOAD DATA ─────────────── */
function loadJSON(relPath) {
  const full = path.join(ROOT, relPath);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`${COLORS.red}✗ Failed to load ${relPath}: ${err.message}${COLORS.reset}`);
    process.exit(1);
  }
}

/* ─────────────── HELPERS ─────────────── */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/* ─────────────── IMAGE OPTIMIZATION ─────────────── */
async function optimizeImage(relPath, options = {}) {
  const { maxWidth = 1200, quality = 75 } = options;
  if (!relPath) return null;

  const fullPath = path.join(ROOT, relPath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    if (VERBOSE) console.log(`    ${COLORS.yellow}⚠ Image missing: ${relPath}${COLORS.reset}`);
    return null;
  }

  try {
    let buffer;
    if (sharp) {
      buffer = await sharp(fullPath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .toBuffer();
    } else {
      buffer = fs.readFileSync(fullPath);
    }
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    if (VERBOSE) console.log(`    ${COLORS.red}✗ Failed to optimize ${relPath}: ${err.message}${COLORS.reset}`);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   HELPER — Normalize "how" field (array OR object → array of {label, value})
   ═══════════════════════════════════════════════════════════════════ */
function normalizeHow(how) {
  if (!how) return [];
  
  // If array of {label, value} or {label, value, ...}
  if (Array.isArray(how)) {
    return how.map(f => ({
      label: f.label || f.key || '',
      value: f.value || f.text || ''
    }));
  }
  
  // If object {scheme: "...", cost: "...", ...}
  if (typeof how === 'object') {
    return Object.entries(how).map(([key, value]) => ({
      label: key,
      value: String(value)
    }));
  }
  
  return [];
}

/* ═══════════════════════════════════════════════════════════════════
   MANIFESTO HTML BUILDER
   ═══════════════════════════════════════════════════════════════════ */

async function buildManifestoHTML(master, vision) {
  const currentYear = new Date().getFullYear();
  const horizonEnd = currentYear + 10;
  const editionLabel = `${currentYear}–${horizonEnd}`;

  // ─── CATEGORIZE PRIORITIES ───
  const allPriorities = vision.priorities || [];
  const activePriorities = allPriorities.filter(p =>
    p.status === 'pending' || p.status === 'in-progress' || !p.status
  );
  const donePriorities = allPriorities.filter(p =>
    p.status === 'done' && p.completed
  );

  // ─── AUTO-PROMOTE DONE PRIORITIES ───
  const manualAchievements = vision.achievements || [];
  const autoAchievements = donePriorities.map(p => ({
    id: p.id,
    title: p.title,
    description: p.summary || p.reality || '',
    completed: p.completed,
    photo: p.required?.photo || p.present?.photo,
    facts: { Completed: p.completed, Category: p.category },
  }));

  const allAchievements = [...manualAchievements, ...autoAchievements]
    .sort((a, b) => (b.completed || '').localeCompare(a.completed || ''));

  const roadmap = vision.roadmap || [];

  // ─── PRELOAD IMAGES ───
  console.log(`  ${COLORS.gray}Loading images...${COLORS.reset}`);

  const imageCache = new Map();

  async function getImage(relPath) {
    if (!relPath) return null;
    if (imageCache.has(relPath)) return imageCache.get(relPath);
    const data = await optimizeImage(relPath, { maxWidth: 1400, quality: 75 });
    imageCache.set(relPath, data);
    return data;
  }

  // Cover image
  const coverImage = master.home?.hero?.image
    ? await getImage(master.home.hero.image)
    : null;

  // Priority images
  for (const need of activePriorities) {
    if (need.present?.photo) await getImage(need.present.photo);
    if (need.required?.photo) await getImage(need.required.photo);
  }

  // Achievement images
  for (const ach of allAchievements) {
    if (ach.photo) await getImage(ach.photo);
  }

  console.log(`  ${COLORS.green}✓${COLORS.reset} ${imageCache.size} images loaded`);

  // ─── COVER ───
  const coverHTML = `
    <section class="page cover">
      ${coverImage ? `<div class="cover-bg" style="background-image: url('${coverImage}')"></div>` : ''}
      <div class="cover-overlay"></div>
      <div class="cover-content">
        <div class="cover-brand">${esc(master.site.shortName)}</div>
        <div class="cover-meta">A Village Archive · ${esc(master.village.district)}, ${esc(master.village.state)}</div>
        <h1 class="cover-title">
          Bandwar <span class="cover-year">${horizonEnd}</span>
        </h1>
        <p class="cover-subtitle">A non-political development manifesto for the village</p>
        <div class="cover-edition">Edition ${editionLabel}</div>
      </div>
      <div class="cover-footer">
        ${esc(master.village.name)} · ${master.village.coordinates.lat}°N, ${master.village.coordinates.lng}°E
      </div>
    </section>
  `;

  // ─── COLOPHON ───
  const colophonHTML = `
    <section class="page colophon">
      <div class="section-label">Colophon</div>
      <h2 class="page-title">About This Document</h2>

      <div class="colophon-grid">
        <div class="colophon-item">
          <div class="colophon-label">Document</div>
          <p>This is the ${editionLabel} edition of the Bandwar Vision Manifesto — a community-authored, non-political document outlining the village's development priorities for the next decade.</p>
        </div>

        <div class="colophon-item">
          <div class="colophon-label">Publisher</div>
          <p>${esc(master.organization.name)}<br>
          ${esc(master.contact.address)}<br>
          ${esc(master.contact.email)}</p>
        </div>

        <div class="colophon-item">
          <div class="colophon-label">Method</div>
          <p>Each priority was identified through consultation with village residents, review of public records, and observation of existing conditions. Completed projects are acknowledged by name and funding source.</p>
        </div>

        <div class="colophon-item">
          <div class="colophon-label">Sources</div>
          <ul class="colophon-sources">
            <li>Census of India, 2011</li>
            <li>MGNREGA Public Portal</li>
            <li>Jal Jeevan Mission dashboard</li>
            <li>Prabhat Khabar, Hindustan, Dainik Jagran</li>
            <li>Rajya Sabha records</li>
            <li>Personal interviews with residents</li>
          </ul>
        </div>

        <div class="colophon-item">
          <div class="colophon-label">License</div>
          <p>This document is released under a Creative Commons BY-NC 4.0 License. Free to share for non-commercial purposes with attribution.</p>
        </div>

        <div class="colophon-item">
          <div class="colophon-label">Archive</div>
          <p>Previous editions are archived at:<br>
          <strong>${esc(master.site.url)}/vision</strong></p>
        </div>
      </div>

      <div class="page-number">02</div>
    </section>
  `;

  // ─── PREAMBLE ───
  const preambleHTML = `
    <section class="page preamble">
      <div class="section-label">Preamble</div>
      <h2 class="page-title">Why This Document Exists</h2>

      <div class="preamble-body">
        <p class="preamble-lead">
          Every village deserves a plan. Not a plan written by outsiders,
          but a plan written by the people who live there — a record of
          what is needed, what has been done, and what could be.
        </p>

        <p>
          Bandwar is a village on the banks of the Burhi Gandak river, in
          Begusarai district, Bihar — part of the historic Mithila region.
          It is home to over twelve thousand people. It has temples that
          are generations old, a school that once offered free education
          to students from across the region, and a community that has
          survived floods, famines, and the slow erosion of rural life.
        </p>

        <p>
          This document is not a complaint. It is not a political
          statement. It is a record. It lists ${activePriorities.length} priorities that
          villagers have identified — from a dedicated ghat on the
          riverbank to a functioning health facility — and it offers a
          path to each of them.
        </p>

        <p>
          Some of these priorities will be addressed in the next two
          years. Others will take a decade. Some may not be addressed at
          all. But every one of them deserves to be written down, so that
          the next generation knows what their parents and grandparents
          wanted — and how far they got.
        </p>
      </div>

      <div class="page-number">03</div>
    </section>
  `;

  // ─── SNAPSHOT ───
  const snapshotHTML = `
    <section class="page snapshot">
      <div class="section-label">Snapshot</div>
      <h2 class="page-title">The Village at a Glance</h2>

      <div class="snapshot-grid">
        <div class="snapshot-item">
          <div class="snapshot-value">${esc(String(master.village.population))}</div>
          <div class="snapshot-label">Population (2011)</div>
        </div>
        <div class="snapshot-item">
          <div class="snapshot-value">${esc(master.village.area)}</div>
          <div class="snapshot-label">Total area</div>
        </div>
        <div class="snapshot-item">
          <div class="snapshot-value">2,600</div>
          <div class="snapshot-label">Years of history</div>
        </div>
        <div class="snapshot-item">
          <div class="snapshot-value">${activePriorities.length}</div>
          <div class="snapshot-label">Active priorities</div>
        </div>
        <div class="snapshot-item">
          <div class="snapshot-value">${allAchievements.length}</div>
          <div class="snapshot-label">Completed projects</div>
        </div>
        <div class="snapshot-item">
          <div class="snapshot-value">${roadmap.length}</div>
          <div class="snapshot-label">Phases</div>
        </div>
      </div>

      <div class="snapshot-meta">
        <div class="snapshot-meta-item">
          <span class="snapshot-meta-label">Coordinates</span>
          <span class="snapshot-meta-value">${master.village.coordinates.lat}°N, ${master.village.coordinates.lng}°E</span>
        </div>
        <div class="snapshot-meta-item">
          <span class="snapshot-meta-label">PIN Code</span>
          <span class="snapshot-meta-value">${esc(master.village.pincode)}</span>
        </div>
        <div class="snapshot-meta-item">
          <span class="snapshot-meta-label">Region</span>
          <span class="snapshot-meta-value">${esc(master.village.region)}</span>
        </div>
        <div class="snapshot-meta-item">
          <span class="snapshot-meta-label">District</span>
          <span class="snapshot-meta-value">${esc(master.village.district)}, ${esc(master.village.state)}</span>
        </div>
      </div>

      <div class="page-number">04</div>
    </section>
  `;

  // ─── PRIORITIES ───
  const priorityPages = [];
  for (let i = 0; i < activePriorities.length; i++) {
    const need = activePriorities[i];
    const num = String(i + 1).padStart(2, '0');
    const total = String(activePriorities.length).padStart(2, '0');

    const presentImg = need.present?.photo ? await getImage(need.present.photo) : null;
    const requiredImg = need.required?.photo ? await getImage(need.required.photo) : null;

    const statusText = need.status === 'in-progress' ? 'In Progress' : 'Planned';
    const statusClass = need.status === 'in-progress' ? 'badge-progress' : 'badge-pending';

    // ✅ FIXED: handle how as array OR object
    const howEntries = normalizeHow(need.how);
    const factsHTML = howEntries.map(({ label, value }) => `
      <div class="priority-fact">
        <span class="priority-fact-label">${esc(label)}</span>
        <span class="priority-fact-value">${esc(value)}</span>
      </div>
    `).join('');

    priorityPages.push(`
      <section class="page priority">
        <div class="priority-header">
          <div class="priority-meta">
            <span class="priority-num">${num} / ${total}</span>
            <span class="priority-badge ${statusClass}">${statusText}</span>
          </div>
          <h2 class="priority-title">${esc(need.title)}</h2>
          ${need.summary ? `<p class="priority-summary">${esc(need.summary)}</p>` : ''}
        </div>

        <div class="priority-images">
          ${presentImg ? `
            <figure class="priority-image priority-image-present">
              <img src="${presentImg}" alt="Present condition">
              <figcaption>Present · ${esc(need.present.caption || need.title)}</figcaption>
            </figure>
          ` : ''}
          ${requiredImg ? `
            <figure class="priority-image priority-image-required">
              <img src="${requiredImg}" alt="Vision">
              <figcaption>Vision · ${esc(need.required.caption || need.title)}</figcaption>
            </figure>
          ` : ''}
        </div>

        <div class="priority-body">
          ${need.reality ? `
            <div class="priority-section">
              <div class="priority-section-label">The Reality</div>
              <p>${esc(need.reality)}</p>
            </div>
          ` : ''}
          ${need.vision ? `
            <div class="priority-section">
              <div class="priority-section-label">What It Should Be</div>
              <p>${esc(need.vision)}</p>
            </div>
          ` : ''}
          ${factsHTML ? `
            <div class="priority-section">
              <div class="priority-section-label">How It Can Happen</div>
              <div class="priority-facts">${factsHTML}</div>
            </div>
          ` : ''}
        </div>
      </section>
    `);
  }

  // ─── ACHIEVEMENTS ───
  const achievementPages = [];
  for (let i = 0; i < allAchievements.length; i++) {
    const ach = allAchievements[i];
    const achImg = ach.photo ? await getImage(ach.photo) : null;

    const factsHTML = ach.facts ? Object.entries(ach.facts).map(([k, v]) => `
      <div class="achievement-fact">
        <span class="achievement-fact-label">${esc(k)}</span>
        <span class="achievement-fact-value">${esc(v)}</span>
      </div>
    `).join('') : '';

    achievementPages.push(`
      <section class="page achievement">
        <div class="section-label">Completed · ${esc(ach.completed || '')}</div>
        <h2 class="page-title">${esc(ach.title)}</h2>

        ${achImg ? `
          <figure class="achievement-image">
            <img src="${achImg}" alt="${esc(ach.title)}">
          </figure>
        ` : ''}

        <p class="achievement-description">${esc(ach.description || '')}</p>

        ${factsHTML ? `
          <div class="achievement-facts">${factsHTML}</div>
        ` : ''}
      </section>
    `);
  }

  // ─── ROADMAP ───
  const roadmapPages = roadmap.map((phase, i) => {
    const num = String(i + 1).padStart(2, '0');
    const yearStart = currentYear + (phase.phase - 1) * 3;
    const yearEnd = phase.phase === 3 ? currentYear + 9 : yearStart + 2;

    const items = (phase.items || []).map(item => `
      <li class="roadmap-item">
        <span class="roadmap-icon">${esc(item.icon || '•')}</span>
        <div>
          <strong>${esc(item.title)}</strong>
          <p>${esc(item.description || '')}</p>
        </div>
      </li>
    `).join('');

    return `
      <section class="page roadmap-phase">
        <div class="section-label">Phase ${num} · ${esc(phase.label || '')}</div>
        <div class="roadmap-years">${yearStart}–${yearEnd}</div>
        <h2 class="page-title">${esc(phase.title)}</h2>
        ${phase.focus ? `<p class="roadmap-focus">${esc(phase.focus)}</p>` : ''}
        <ul class="roadmap-items">${items}</ul>
      </section>
    `;
  }).join('');

  // ─── ADOPTION ───
  const adoptionHTML = `
    <section class="page adoption">
      <div class="section-label">Adoption</div>
      <h2 class="page-title">Adoption of this Manifesto</h2>

      <p class="adoption-lead">
        This document is a community statement. It is not binding on any
        authority, but it represents the considered view of the people of
        Bandwar about what their village needs in the decade ahead.
      </p>

      <p>
        We, the residents of Bandwar, adopt this manifesto as a statement
        of priorities. We ask that any authority — local, district, or
        state — consider these priorities when planning investments in
        the region. We ask that our elected representatives raise these
        matters in the appropriate forums.
      </p>

      <div class="signature-lines">
        <div class="signature-line">
          <div class="signature-blank"></div>
          <div class="signature-label">Resident / Representative</div>
        </div>
        <div class="signature-line">
          <div class="signature-blank"></div>
          <div class="signature-label">Resident / Representative</div>
        </div>
        <div class="signature-line">
          <div class="signature-blank"></div>
          <div class="signature-label">Resident / Representative</div>
        </div>
        <div class="signature-line">
          <div class="signature-blank"></div>
          <div class="signature-label">Resident / Representative</div>
        </div>
      </div>

      <div class="adoption-meta">
        <div class="adoption-meta-item">
          <div class="adoption-meta-label">Date of adoption</div>
          <div class="adoption-meta-value">_________________</div>
        </div>
        <div class="adoption-meta-item">
          <div class="adoption-meta-label">Place</div>
          <div class="adoption-meta-value">Bandwar, ${esc(master.village.district)}</div>
        </div>
      </div>
    </section>
  `;

  // ─── BACK COVER ───
  const backCoverHTML = `
    <section class="page back-cover">
      <div class="back-cover-content">
        <p class="back-cover-quote">
          "A village is not just houses and fields.<br>
          It is memory. It is the plan we make<br>
          for the ones who come after us."
        </p>
        <div class="back-cover-attribution">— Bandwar Village Archive</div>
      </div>

      <div class="back-cover-footer">
        <div class="back-cover-brand">${esc(master.site.shortName)}</div>
        <div class="back-cover-info">
          ${esc(master.site.url)}<br>
          ${esc(master.contact.email)}
        </div>
      </div>
    </section>
  `;

  // ─── ASSEMBLE FULL HTML ───
  const html = `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<title>Bandwar ${horizonEnd} — Manifesto</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1a1a18;
    background: #f7f5ef;
    font-size: 11pt;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 22mm 20mm;
    page-break-after: always;
    position: relative;
    background: #f7f5ef;
    display: flex;
    flex-direction: column;
  }
  .page:last-child { page-break-after: auto; }
  .section-label {
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #1f3d2f;
    margin-bottom: 4mm;
    padding-bottom: 2mm;
    border-bottom: 1px solid #1f3d2f;
    display: inline-block;
  }
  .page-title {
    font-family: Georgia, serif;
    font-size: 22pt;
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 8mm;
    color: #1a1a18;
  }
  .page-number {
    position: absolute;
    bottom: 15mm;
    right: 20mm;
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    letter-spacing: 0.15em;
    color: #8a8578;
  }

  /* COVER */
  .cover { background: #1a1a18; color: #f7f5ef; padding: 0; justify-content: flex-end; overflow: hidden; }
  .cover-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.4; }
  .cover-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(26,26,24,0.5) 0%, rgba(26,26,24,0.85) 70%, rgba(26,26,24,0.98) 100%); }
  .cover-content { position: relative; z-index: 2; padding: 22mm 20mm 40mm; }
  .cover-brand { font-family: 'Courier New', monospace; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(247,245,239,0.7); margin-bottom: 4mm; }
  .cover-meta { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.16em; color: rgba(247,245,239,0.5); margin-bottom: 40mm; }
  .cover-title { font-family: Georgia, serif; font-size: 72pt; font-weight: 400; line-height: 0.92; letter-spacing: -0.04em; color: #f7f5ef; margin-bottom: 8mm; }
  .cover-year { font-style: italic; color: #b8d0c1; }
  .cover-subtitle { font-family: Georgia, serif; font-size: 14pt; font-style: italic; line-height: 1.4; color: rgba(247,245,239,0.85); max-width: 140mm; margin-bottom: 10mm; }
  .cover-edition { font-family: 'Courier New', monospace; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.16em; color: rgba(247,245,239,0.6); padding-top: 4mm; border-top: 1px solid rgba(247,245,239,0.2); display: inline-block; }
  .cover-footer { position: absolute; bottom: 20mm; left: 20mm; font-family: 'Courier New', monospace; font-size: 8pt; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(247,245,239,0.4); }

  /* COLOPHON */
  .colophon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm 12mm; flex: 1; }
  .colophon-item { break-inside: avoid; }
  .colophon-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.15em; color: #1f3d2f; margin-bottom: 3mm; }
  .colophon-item p { font-size: 10pt; line-height: 1.5; color: #3a3a34; }
  .colophon-sources { list-style: none; font-size: 10pt; line-height: 1.7; color: #3a3a34; }
  .colophon-sources li::before { content: '— '; color: #8a8578; }

  /* PREAMBLE */
  .preamble-body p { font-size: 11pt; line-height: 1.7; color: #3a3a34; margin-bottom: 6mm; max-width: 155mm; }
  .preamble-lead { font-size: 13pt; font-style: italic; color: #1a1a18 !important; line-height: 1.5 !important; margin-bottom: 8mm !important; padding-bottom: 6mm; border-bottom: 1px solid #d4d0c4; }

  /* SNAPSHOT */
  .snapshot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8mm 6mm; margin-bottom: 15mm; }
  .snapshot-item { padding-top: 4mm; border-top: 1px solid #1f3d2f; }
  .snapshot-value { font-family: Georgia, serif; font-size: 22pt; font-weight: 500; line-height: 1; letter-spacing: -0.02em; color: #1a1a18; margin-bottom: 3mm; }
  .snapshot-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.14em; color: #8a8578; }
  .snapshot-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 12mm; padding-top: 8mm; border-top: 1px solid #d4d0c4; }
  .snapshot-meta-item { display: flex; flex-direction: column; gap: 2mm; }
  .snapshot-meta-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.14em; color: #8a8578; }
  .snapshot-meta-value { font-size: 11pt; color: #1a1a18; }

  /* PRIORITY */
  .priority { padding: 18mm 18mm 15mm; }
  .priority-header { margin-bottom: 6mm; }
  .priority-meta { display: flex; align-items: center; gap: 4mm; margin-bottom: 4mm; }
  .priority-num { font-family: 'Courier New', monospace; font-size: 8pt; letter-spacing: 0.15em; text-transform: uppercase; color: #8a8578; }
  .priority-badge { display: inline-block; padding: 1.5mm 3mm; font-family: 'Courier New', monospace; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.12em; border-radius: 8mm; }
  .badge-pending { background: rgba(166,75,42,0.15); color: #a64b2a; }
  .badge-progress { background: rgba(31,61,47,0.15); color: #1f3d2f; }
  .priority-title { font-family: Georgia, serif; font-size: 26pt; font-weight: 400; line-height: 1.05; letter-spacing: -0.02em; color: #1a1a18; margin-bottom: 3mm; }
  .priority-summary { font-family: Georgia, serif; font-size: 11pt; font-style: italic; color: #6a6560; line-height: 1.4; max-width: 150mm; }
  .priority-images { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-bottom: 6mm; }
  .priority-image { margin: 0; overflow: hidden; }
  .priority-image img { width: 100%; height: 55mm; object-fit: cover; display: block; }
  .priority-image figcaption { font-family: 'Courier New', monospace; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.1em; color: #8a8578; padding-top: 2mm; line-height: 1.4; }
  .priority-image-present figcaption::before { content: '● Present · '; color: #a64b2a; }
  .priority-image-required figcaption::before { content: '◆ Vision · '; color: #1f3d2f; }
  .priority-body { display: grid; gap: 5mm; }
  .priority-section-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.15em; color: #1f3d2f; margin-bottom: 2mm; padding-bottom: 1.5mm; border-bottom: 1px solid #1f3d2f; display: inline-block; }
  .priority-section p { font-size: 10pt; line-height: 1.55; color: #3a3a34; }
  .priority-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 6mm; }
  .priority-fact { display: flex; flex-direction: column; gap: 1mm; padding-top: 2mm; border-top: 1px solid #e0dcd0; }
  .priority-fact-label { font-family: 'Courier New', monospace; font-size: 7pt; text-transform: uppercase; letter-spacing: 0.12em; color: #8a8578; }
  .priority-fact-value { font-size: 10pt; color: #1a1a18; font-weight: 500; }

  /* ACHIEVEMENT */
  .achievement-image { margin: 6mm 0; overflow: hidden; }
  .achievement-image img { width: 100%; max-height: 100mm; object-fit: cover; display: block; }
  .achievement-description { font-size: 11pt; line-height: 1.6; color: #3a3a34; max-width: 155mm; margin-bottom: 8mm; }
  .achievement-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(40mm, 1fr)); gap: 5mm; padding-top: 6mm; border-top: 1px solid #d4d0c4; }
  .achievement-fact { display: flex; flex-direction: column; gap: 2mm; }
  .achievement-fact-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.14em; color: #8a8578; }
  .achievement-fact-value { font-family: Georgia, serif; font-size: 12pt; color: #1a1a18; font-weight: 500; }

  /* ROADMAP */
  .roadmap-years { font-family: 'Courier New', monospace; font-size: 10pt; letter-spacing: 0.14em; color: #8a8578; margin-bottom: 3mm; }
  .roadmap-focus { font-family: Georgia, serif; font-size: 12pt; font-style: italic; color: #6a6560; margin-bottom: 10mm; }
  .roadmap-items { list-style: none; display: grid; gap: 6mm; }
  .roadmap-item { display: grid; grid-template-columns: auto 1fr; gap: 5mm; padding-bottom: 5mm; border-bottom: 1px solid #e0dcd0; align-items: start; }
  .roadmap-item:last-child { border-bottom: none; }
  .roadmap-icon { font-size: 16pt; line-height: 1; }
  .roadmap-item strong { font-family: Georgia, serif; font-size: 12pt; font-weight: 500; color: #1a1a18; display: block; margin-bottom: 1.5mm; }
  .roadmap-item p { font-size: 10pt; line-height: 1.5; color: #6a6560; }

  /* ADOPTION */
  .adoption-lead { font-family: Georgia, serif; font-size: 13pt; font-style: italic; line-height: 1.5; color: #1a1a18; margin-bottom: 8mm; padding-bottom: 6mm; border-bottom: 1px solid #d4d0c4; max-width: 155mm; }
  .adoption p { font-size: 11pt; line-height: 1.6; color: #3a3a34; margin-bottom: 6mm; max-width: 155mm; }
  .signature-lines { margin: 15mm 0 10mm; display: grid; gap: 12mm; }
  .signature-line { display: grid; gap: 2mm; }
  .signature-blank { height: 12mm; border-bottom: 1px solid #1a1a18; }
  .signature-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.14em; color: #8a8578; }
  .adoption-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; padding-top: 8mm; border-top: 1px solid #d4d0c4; margin-top: 10mm; }
  .adoption-meta-label { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.14em; color: #8a8578; margin-bottom: 2mm; }
  .adoption-meta-value { font-size: 11pt; color: #1a1a18; }

  /* BACK COVER */
  .back-cover { background: #1a1a18; color: #f7f5ef; justify-content: space-between; padding: 0; }
  .back-cover-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40mm 25mm; }
  .back-cover-quote { font-family: Georgia, serif; font-size: 18pt; font-style: italic; line-height: 1.45; color: rgba(247,245,239,0.92); max-width: 140mm; margin-bottom: 8mm; }
  .back-cover-attribution { font-family: 'Courier New', monospace; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.16em; color: rgba(247,245,239,0.5); }
  .back-cover-footer { padding: 15mm 25mm; border-top: 1px solid rgba(247,245,239,0.15); display: flex; justify-content: space-between; align-items: flex-end; gap: 10mm; }
  .back-cover-brand { font-family: Georgia, serif; font-size: 14pt; font-weight: 500; color: #f7f5ef; }
  .back-cover-info { font-family: 'Courier New', monospace; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.12em; line-height: 1.7; color: rgba(247,245,239,0.5); text-align: right; }

  @media print {
    html, body { background: white; }
    .page { background: white; box-shadow: none; }
    .cover, .back-cover { background: #1a1a18; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

${coverHTML}
${colophonHTML}
${preambleHTML}
${snapshotHTML}
${priorityPages.join('')}
${achievementPages.join('')}
${roadmapPages}
${adoptionHTML}
${backCoverHTML}

</body>
</html>
`;

  return {
    html,
    stats: {
      currentYear,
      horizonEnd,
      editionLabel,
      totalPriorities: activePriorities.length,
      totalAchievements: allAchievements.length,
      totalRoadmapPhases: roadmap.length,
      totalPages: 4 + activePriorities.length + allAchievements.length + roadmap.length + 2,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════
   PUPPETEER PDF RENDER
   ═══════════════════════════════════════════════════════════════════ */
async function renderPDF(html, outputPath) {
  console.log(`  ${COLORS.gray}Launching Puppeteer...${COLORS.reset}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          }))
      );
    });

    await page.emulateMediaType('print');

    console.log(`  ${COLORS.gray}Rendering PDF...${COLORS.reset}`);
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return true;
  } finally {
    await browser.close();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */
async function main() {
  const startTime = Date.now();

  console.log('');
  console.log(`${COLORS.blue}${COLORS.bold}▶ Bandwar Manifesto Generator${COLORS.reset}`);
  console.log(`${COLORS.gray}  Root: ${ROOT}${COLORS.reset}`);
  console.log('');

  // ─── LOAD DATA ───
  console.log(`${COLORS.gray}  Loading data...${COLORS.reset}`);
  const master = loadJSON('data/master.json');
  const vision = loadJSON('data/vision.json');

  const priorityCount = (vision.priorities || []).length;
  const achievementCount = (vision.achievements || []).length;
  const roadmapCount = (vision.roadmap || []).length;

  console.log(`  ${COLORS.green}✓${COLORS.reset} master.json   ${COLORS.gray}(${master.site.name})${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} vision.json   ${COLORS.gray}(${priorityCount} priorities, ${achievementCount} achievements, ${roadmapCount} roadmap phases)${COLORS.reset}`);
  console.log('');

  // ─── BUILD HTML ───
  console.log(`${COLORS.bold}Building manifesto HTML...${COLORS.reset}`);
  const { html, stats } = await buildManifestoHTML(master, vision);
  console.log(`  ${COLORS.green}✓${COLORS.reset} HTML built (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log('');

  // ─── ENSURE OUTPUT DIR ───
  ensureDir(PDF_DIR);

  // ─── OUTPUT PATH ───
  const outputFile = `bandwar-vision-${stats.currentYear}-${stats.horizonEnd}.pdf`;
  const outputPath = path.join(PDF_DIR, outputFile);

  // ─── GENERATE PDF ───
  console.log(`${COLORS.bold}Generating PDF...${COLORS.reset}`);
  console.log(`  ${COLORS.gray}Edition: ${stats.editionLabel}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}Pages:   ~${stats.totalPages}${COLORS.reset}`);

  await renderPDF(html, outputPath);

  // ─── STATS ───
  const fileSize = fs.statSync(outputPath).size;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log(`${COLORS.green}${COLORS.bold}═══ PDF Summary ═══${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} File:      ${outputFile}`);
  console.log(`  ${COLORS.gray}  Size:      ${fileSizeMB} MB${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Pages:     ${stats.totalPages}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Priorities: ${stats.totalPriorities}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Achievements: ${stats.totalAchievements}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Roadmap:   ${stats.totalRoadmapPhases} phases${COLORS.reset}`);
  console.log(`  ${COLORS.blue}⏱  Time:      ${elapsed}s${COLORS.reset}`);
  console.log('');
  console.log(`  ${COLORS.gray}Output: ${outputPath}${COLORS.reset}`);
  console.log('');
  console.log(`${COLORS.green}${COLORS.bold}Manifesto generated.${COLORS.reset}`);
  console.log('');
}

main().catch(err => {
  console.error('');
  console.error(`${COLORS.red}${COLORS.bold}✗ Manifesto generation failed:${COLORS.reset}`);
  console.error(`${COLORS.red}  ${err.message}${COLORS.reset}`);
  if (VERBOSE) {
    console.error('');
    console.error(err.stack);
  }
  console.error('');
  process.exit(1);
});