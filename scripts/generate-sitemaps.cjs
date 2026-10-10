/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — SITEMAP GENERATOR
   sitemap.xml (pages) + sitemap-images.xml (images with captions)
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');

/* ─────────────── CONFIG ─────────────── */
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ARGS = process.argv.slice(2);
const VERBOSE = ARGS.includes('--verbose');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

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

/* ─────────────── UTILITIES ─────────────── */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(relPath, baseUrl) {
  if (!relPath) return null;
  if (relPath.startsWith('http')) return relPath;
  const clean = String(relPath).replace(/^\//, '');
  return `${baseUrl.replace(/\/$/, '')}/${clean}`;
}

function imageExists(relPath) {
  if (!relPath || typeof relPath !== 'string') return false;
  if (relPath.startsWith('http')) return true;
  const full = path.join(ROOT, relPath.replace(/^\//, ''));
  try {
    return fs.statSync(full).isFile();
  } catch {
    return false;
  }
}

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/* ═══════════════════════════════════════════════════════════════════
   STATS TRACKING
   ═══════════════════════════════════════════════════════════════════ */
const stats = {
  pages: 0,
  images: 0,
  imagesMissing: 0,
  imagesMissingList: [],
  imagesMissingSeen: new Set(),
};

function trackImage(src, caption, list, seen) {
  if (!src) return;
  if (seen.has(src)) return;
  seen.add(src);

  if (!imageExists(src)) {
    if (!stats.imagesMissingSeen.has(src)) {
      stats.imagesMissingSeen.add(src);
      stats.imagesMissing++;
      stats.imagesMissingList.push(src);
    }
    return;
  }

  stats.images++;
  list.push({ src, caption: caption || '' });
}

/* ═══════════════════════════════════════════════════════════════════
   BUILD PAGES
   ═══════════════════════════════════════════════════════════════════ */
function buildPages(master, content) {
  const base = master.site.url.replace(/\/$/, '');
  const today = formatDate();
  const pages = [];

  // Static pages
  const staticPages = [
    { path: '/',         priority: 1.0, changefreq: 'weekly' },
    { path: '/section',  priority: 0.9, changefreq: 'weekly' },
    { path: '/place',    priority: 0.9, changefreq: 'monthly' },
    { path: '/time',     priority: 0.8, changefreq: 'monthly' },
    { path: '/vision',   priority: 0.8, changefreq: 'monthly' },
    { path: '/about',    priority: 0.6, changefreq: 'monthly' },
  ];

  staticPages.forEach(p => {
    pages.push({
      loc: base + p.path,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    });
  });

  // Articles
  const articles = content.articles || [];
  articles.forEach(article => {
    pages.push({
      loc: `${base}/article/${article.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8,
    });
  });

  // Categories
  const categories = content.categories || [];
  categories.forEach(category => {
    const count = articles.filter(a => (a.categories || []).includes(category.id)).length;
    if (count === 0) return;
    pages.push({
      loc: `${base}/section/${category.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
    });
  });

  return pages;
}

/* ═══════════════════════════════════════════════════════════════════
   BUILD IMAGE MAP
   ═══════════════════════════════════════════════════════════════════ */
function buildImageMap(master, content, media, vision) {
  const base = master.site.url.replace(/\/$/, '');
  const pageImages = new Map();

  function add(pageUrl, images) {
    if (!images || !images.length) return;
    if (!pageImages.has(pageUrl)) pageImages.set(pageUrl, []);
    pageImages.get(pageUrl).push(...images);
  }

  /* ─── HOMEPAGE ─── */
  {
    const list = [];
    const seen = new Set();
    if (master.home?.hero?.image) {
      trackImage(
        master.home.hero.image,
        master.home.hero.alt || `${master.village.name} village`,
        list,
        seen
      );
    }
    add(base + '/', list);
  }

  /* ─── ARTICLES ─── */
  const articles = content.articles || [];
  articles.forEach(article => {
    const pageUrl = `${base}/article/${article.id}`;
    const list = [];
    const seen = new Set();

    if (article.hero) {
      trackImage(article.hero, article.title, list, seen);
    }

    if (Array.isArray(article.photos)) {
      article.photos.forEach(photo => {
        if (photo && photo.src) {
          trackImage(photo.src, photo.caption || article.title, list, seen);
        }
      });
    }

    add(pageUrl, list);
  });

  /* ─── PLACE (landmarks + gallery) ─── */
  {
    const pageUrl = `${base}/place`;
    const list = [];
    const seen = new Set();

    // Landmarks
    if (Array.isArray(media.landmarks)) {
      media.landmarks.forEach(landmark => {
        if (landmark.photo) {
          trackImage(landmark.photo, landmark.name, list, seen);
        }
      });
    }

    // Gallery — FIXED: media.gallery is object with .photos
    const galleryPhotos = media.gallery?.photos || [];
    if (Array.isArray(galleryPhotos)) {
      galleryPhotos.forEach(photo => {
        if (photo.src) {
          trackImage(photo.src, photo.caption || 'Bandwar village photograph', list, seen);
        }
      });
    }

    add(pageUrl, list);
  }

  /* ─── TIME (timeline — usually no photos, skip) ─── */
  {
    const pageUrl = `${base}/time`;
    const list = [];
    const seen = new Set();

    if (Array.isArray(media.timeline)) {
      media.timeline.forEach(event => {
        if (event.photo) {
          trackImage(event.photo, event.title, list, seen);
        }
      });
    }

    add(pageUrl, list);
  }

  /* ─── VISION (priorities + achievements) ─── */
  {
    const pageUrl = `${base}/vision`;
    const list = [];
    const seen = new Set();

    // Priorities
    if (Array.isArray(vision.priorities)) {
      vision.priorities.forEach(need => {
        if (need.present?.photo) {
          trackImage(
            need.present.photo,
            need.present.caption || `Present: ${need.title}`,
            list,
            seen
          );
        }
        if (need.required?.photo) {
          trackImage(
            need.required.photo,
            need.required.caption || `Vision: ${need.title}`,
            list,
            seen
          );
        }
        if (need.inside?.photos && Array.isArray(need.inside.photos)) {
          need.inside.photos.forEach(p => {
            if (p && p.src) trackImage(p.src, p.caption || need.title, list, seen);
          });
        }
      });
    }

    // Achievements
    if (Array.isArray(vision.achievements)) {
      vision.achievements.forEach(ach => {
        if (ach.photo) {
          trackImage(ach.photo, ach.title, list, seen);
        }
      });
    }

    add(pageUrl, list);
  }

  return pageImages;
}

/* ═══════════════════════════════════════════════════════════════════
   GENERATE SITEMAP.XML
   ═══════════════════════════════════════════════════════════════════ */
function generateSitemap(pages) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  pages.forEach(page => {
    lines.push('  <url>');
    lines.push(`    <loc>${esc(page.loc)}</loc>`);
    lines.push(`    <lastmod>${page.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    lines.push(`    <priority>${page.priority.toFixed(1)}</priority>`);
    lines.push('  </url>');
  });

  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

/* ═══════════════════════════════════════════════════════════════════
   GENERATE SITEMAP-IMAGES.XML
   ═══════════════════════════════════════════════════════════════════ */
function generateImageSitemap(pageImages, master) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];

  const base = master.site.url.replace(/\/$/, '');
  const sorted = [...pageImages.keys()].sort((a, b) => {
    if (a === base + '/') return -1;
    if (b === base + '/') return 1;
    return a.localeCompare(b);
  });

  let total = 0;

  sorted.forEach(pageUrl => {
    const images = pageImages.get(pageUrl);
    if (!images || !images.length) return;

    lines.push('  <url>');
    lines.push(`    <loc>${esc(pageUrl)}</loc>`);

    images.forEach(img => {
      lines.push('    <image:image>');
      lines.push(`      <image:loc>${esc(absoluteUrl(img.src, base))}</image:loc>`);
      if (img.caption) {
        const cleanCaption = img.caption.slice(0, 500);
        lines.push(`      <image:caption>${esc(cleanCaption)}</image:caption>`);
        lines.push(`      <image:title>${esc(cleanCaption)}</image:title>`);
      }
      lines.push('    </image:image>');
      total++;
    });

    lines.push('  </url>');
  });

  lines.push('</urlset>');
  lines.push('');
  return { xml: lines.join('\n'), total };
}

/* ═══════════════════════════════════════════════════════════════════
   GENERATE SITEMAP-INDEX.XML
   ═══════════════════════════════════════════════════════════════════ */
function generateSitemapIndex(master) {
  const base = master.site.url.replace(/\/$/, '');
  const today = formatDate();

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <sitemap>',
    `    <loc>${base}/sitemap.xml</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '  </sitemap>',
    '  <sitemap>',
    `    <loc>${base}/sitemap-images.xml</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '  </sitemap>',
    '</sitemapindex>',
    '',
  ].join('\n');
}

/* ═══════════════════════════════════════════════════════════════════
   WRITE OUTPUT
   ═══════════════════════════════════════════════════════════════════ */
function ensureDist() {
  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST, { recursive: true });
  }
}

function writeOutput(relPath, content) {
  const full = path.join(DIST, relPath);
  fs.writeFileSync(full, content, 'utf8');
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */
function main() {
  const startTime = Date.now();

  console.log('');
  console.log(`${COLORS.blue}${COLORS.bold}▶ Bandwar Sitemap Generator${COLORS.reset}`);
  console.log(`${COLORS.gray}  Root: ${ROOT}${COLORS.reset}`);
  console.log('');

  console.log(`${COLORS.gray}  Loading data...${COLORS.reset}`);

  const master  = loadJSON('data/master.json');
  const content = loadJSON('data/content.json');
  const media   = loadJSON('data/media.json');
  const vision  = loadJSON('data/vision.json');

  const articles = content.articles || [];
  const categories = content.categories || [];
  const landmarkCount = (media.landmarks || []).length;
  const galleryCount = (media.gallery?.photos || []).length;
  const timelineCount = (media.timeline || []).length;

  console.log(`  ${COLORS.green}✓${COLORS.reset} master.json   ${COLORS.gray}(${master.site.url})${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} content.json  ${COLORS.gray}(${articles.length} articles, ${categories.length} categories)${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} media.json    ${COLORS.gray}(${landmarkCount} landmarks, ${galleryCount} photos, ${timelineCount} events)${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} vision.json   ${COLORS.gray}(${(vision.priorities || []).length} priorities, ${(vision.achievements || []).length} achievements)${COLORS.reset}`);
  console.log('');

  // Build pages
  console.log(`${COLORS.bold}Building page URLs...${COLORS.reset}`);
  const pages = buildPages(master, content);
  stats.pages = pages.length;
  console.log(`  ${COLORS.green}✓${COLORS.reset} ${pages.length} page URLs`);
  console.log('');

  // Build image map
  console.log(`${COLORS.bold}Building image map...${COLORS.reset}`);
  const pageImages = buildImageMap(master, content, media, vision);
  console.log(`  ${COLORS.green}✓${COLORS.reset} ${stats.images} images across ${pageImages.size} pages`);
  if (stats.imagesMissing > 0) {
    console.log(`  ${COLORS.yellow}⚠${COLORS.reset} ${stats.imagesMissing} images missing (skipped)`);
  }
  console.log('');

  // Ensure dist
  ensureDist();

  // Write sitemaps
  console.log(`${COLORS.bold}Writing sitemaps...${COLORS.reset}`);

  const sitemapXML = generateSitemap(pages);
  writeOutput('sitemap.xml', sitemapXML);
  console.log(`  ${COLORS.green}✓${COLORS.reset} sitemap.xml         ${COLORS.gray}(${pages.length} URLs)${COLORS.reset}`);

  const { xml: imageXML, total: imageCount } = generateImageSitemap(pageImages, master);
  writeOutput('sitemap-images.xml', imageXML);
  console.log(`  ${COLORS.green}✓${COLORS.reset} sitemap-images.xml  ${COLORS.gray}(${imageCount} images)${COLORS.reset}`);

  const indexXML = generateSitemapIndex(master);
  writeOutput('sitemap-index.xml', indexXML);
  console.log(`  ${COLORS.green}✓${COLORS.reset} sitemap-index.xml   ${COLORS.gray}(master index)${COLORS.reset}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log(`${COLORS.bold}═══ Sitemap Summary ═══${COLORS.reset}`);
  console.log(`  Pages:  ${COLORS.blue}${pages.length}${COLORS.reset}`);
  console.log(`  Images: ${COLORS.blue}${imageCount}${COLORS.reset}`);
  console.log(`  Time:   ${COLORS.blue}${elapsed}s${COLORS.reset}`);
  console.log('');
  console.log(`${COLORS.green}${COLORS.bold}Sitemaps generated.${COLORS.reset}`);
  console.log('');
}

main();