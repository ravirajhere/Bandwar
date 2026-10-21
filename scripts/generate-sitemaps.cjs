/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — SITEMAP GENERATOR (v2.1 — Added People & Reach)
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const COLORS = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', gray: '\x1b[90m', bold: '\x1b[1m' };

function loadJSON(relPath) {
  const full = path.join(ROOT, relPath);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`${COLORS.red}✗ Failed to load ${relPath}: ${err.message}${COLORS.reset}`);
    process.exit(1);
  }
}

function loadAllData() {
  const master = loadJSON('data/master.json');
  const vision = loadJSON('data/vision.json');
  const media = loadJSON('data/media.json');
  const categories = loadJSON('data/categories.json').categories || [];

  const articlesDir = path.join(ROOT, 'data', 'articles');
  const articles = [];

  if (fs.existsSync(articlesDir)) {
    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const data = loadJSON(`data/articles/${file}`);
      if (data.articles && Array.isArray(data.articles)) {
        articles.push(...data.articles);
      }
    });
  }
  return { master, vision, media, categories, articles };
}

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function absoluteUrl(relPath, baseUrl) {
  if (!relPath) return null;
  if (relPath.startsWith('http')) return relPath;
  return `${baseUrl.replace(/\/$/, '')}/${String(relPath).replace(/^\//, '')}`;
}

function imageExists(relPath) {
  if (!relPath || typeof relPath !== 'string') return false;
  if (relPath.startsWith('http')) return true;
  try { return fs.statSync(path.join(ROOT, relPath.replace(/^\//, ''))).isFile(); } catch { return false; }
}

function formatDate(date = new Date()) { return date.toISOString().slice(0, 10); }

function buildPages(master, categories, articles) {
  const base = master.site.url.replace(/\/$/, '');
  const today = formatDate();
  const pages = [];

  // ✅ Added /people and /reach here
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/section', priority: 0.9, changefreq: 'weekly' },
    { path: '/place', priority: 0.9, changefreq: 'monthly' },
    { path: '/time', priority: 0.8, changefreq: 'monthly' },
    { path: '/people', priority: 0.8, changefreq: 'monthly' },  // ✅ Added
    { path: '/reach', priority: 0.8, changefreq: 'monthly' },   // ✅ Added
    { path: '/vision', priority: 0.8, changefreq: 'monthly' },
    { path: '/about', priority: 0.6, changefreq: 'monthly' },
  ];

  staticPages.forEach(p => pages.push({ loc: base + p.path, lastmod: today, changefreq: p.changefreq, priority: p.priority }));
  
  articles.forEach(a => pages.push({ loc: `${base}/article/${a.id}`, lastmod: today, changefreq: 'monthly', priority: 0.8 }));
  
  categories.forEach(c => {
    const count = articles.filter(a => (a.categories || []).includes(c.id)).length;
    if (count > 0) pages.push({ loc: `${base}/section/${c.id}`, lastmod: today, changefreq: 'monthly', priority: 0.7 });
  });

  return pages;
}

function buildImageMap(master, articles, media, vision) {
  const base = master.site.url.replace(/\/$/, '');
  const pageImages = new Map();

  function add(pageUrl, images) {
    if (!images || !images.length) return;
    if (!pageImages.has(pageUrl)) pageImages.set(pageUrl, []);
    pageImages.get(pageUrl).push(...images);
  }

  // Homepage
  {
    const list = []; const seen = new Set();
    if (master.home?.hero?.image && imageExists(master.home.hero.image)) {
      list.push({ 
        src: master.home.hero.image, 
        caption: master.home.hero.alt || `${master.village.name} Village View` 
      });
    }
    add(base + '/', list);
  }

  // Articles
  articles.forEach(article => {
    const pageUrl = `${base}/article/${article.id}`;
    const list = []; const seen = new Set();

    if (article.hero && imageExists(article.hero)) {
      list.push({ src: article.hero, caption: article.title }); 
    }
    if (Array.isArray(article.photos)) {
      article.photos.forEach(photo => {
        if (photo.src && imageExists(photo.src) && !seen.has(photo.src)) {
          seen.add(photo.src);
          list.push({ src: photo.src, caption: photo.caption || article.title });
        }
      });
    }
    add(pageUrl, list);
  });

  // Place (Landmarks + Gallery)
  {
    const pageUrl = `${base}/place`; const list = []; const seen = new Set();
    if (Array.isArray(media.landmarks)) {
      media.landmarks.forEach(l => {
        if (l.photo && imageExists(l.photo)) {
          list.push({ src: l.photo, caption: l.name });
        }
      });
    }
    const gallery = media.gallery?.photos || [];
    gallery.forEach(photo => {
      if (photo.src && imageExists(photo.src) && !seen.has(photo.src)) {
        seen.add(photo.src);
        list.push({ src: photo.src, caption: photo.caption || 'Bandwar Village Photograph' });
      }
    });
    add(pageUrl, list);
  }

  // Vision
  {
    const pageUrl = `${base}/vision`;
    const list = []; const seen = new Set();
    if (Array.isArray(vision.priorities)) {
      vision.priorities.forEach(need => {
        if (need.present?.photo && imageExists(need.present.photo)) list.push({ src: need.present.photo, caption: need.present.caption || `Present: ${need.title}` });
        if (need.required?.photo && imageExists(need.required.photo)) list.push({ src: need.required.photo, caption: need.required.caption || `Vision: ${need.title}` });
      });
    }
    if (Array.isArray(vision.achievements)) {
      vision.achievements.forEach(ach => {
        if (ach.photo && imageExists(ach.photo)) list.push({ src: ach.photo, caption: ach.title });
      });
    }
    add(pageUrl, list);
  }

  return pageImages;
}

function generateSitemap(pages) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  pages.forEach(p => {
    lines.push('  <url>');
    lines.push(`    <loc>${esc(p.loc)}</loc>`);
    lines.push(`    <lastmod>${p.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${p.changefreq}</changefreq>`);
    lines.push(`    <priority>${p.priority.toFixed(1)}</priority>`);
    lines.push('  </url>');
  });
  lines.push('</urlset>', '');
  return lines.join('\n');
}

function generateImageSitemap(pageImages, master) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
  ];
  const base = master.site.url.replace(/\/$/, '');
  let total = 0;

  [...pageImages.keys()].forEach(pageUrl => {
    const images = pageImages.get(pageUrl);
    if (!images || !images.length) return;
    lines.push('  <url>');
    lines.push(`    <loc>${esc(pageUrl)}</loc>`);

    images.forEach(img => {
      lines.push('    <image:image>');
      lines.push(`      <image:loc>${esc(absoluteUrl(img.src, base))}</image:loc>`);
      
      const cleanCaption = (img.caption || '').slice(0, 500);
      lines.push(`      <image:caption>${esc(cleanCaption)}</image:caption>`);
      lines.push(`      <image:title>${esc(cleanCaption)}</image:title>`); 
      
      lines.push('    </image:image>');
      total++;
    });
    lines.push('  </url>');
  });

  lines.push('</urlset>', '');
  return { xml: lines.join('\n'), total };
}

function generateSitemapIndex(master) {
  const base = master.site.url.replace(/\/$/, '');
  const today = formatDate();
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${base}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
    `  <sitemap><loc>${base}/sitemap-images.xml</loc><lastmod>${today}</lastmod></sitemap>`,
    '</sitemapindex>', ''].join('\n');
}

function main() {
  console.log(`\n${COLORS.blue}${COLORS.bold}▶ Bandwar Sitemap Generator v2.1${COLORS.reset}\n`);
  const data = loadAllData();
  
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  const pages = buildPages(data.master, data.categories, data.articles);
  const pageImages = buildImageMap(data.master, data.articles, data.media, data.vision);

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), generateSitemap(pages), 'utf8');
  const { xml: imgXml, total: imgCount } = generateImageSitemap(pageImages, data.master);
  fs.writeFileSync(path.join(DIST, 'sitemap-images.xml'), imgXml, 'utf8');
  fs.writeFileSync(path.join(DIST, 'sitemap-index.xml'), generateSitemapIndex(data.master), 'utf8');

  console.log(`  ${COLORS.green}✓${COLORS.reset} Pages mapped:  ${pages.length}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} Images mapped: ${imgCount}\n`);
  console.log(`${COLORS.green}${COLORS.bold}Sitemaps generated successfully.${COLORS.reset}\n`);
}

main();