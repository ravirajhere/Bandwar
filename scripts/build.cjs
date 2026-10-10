/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — BUILD ENGINE
   Static site generator · Pre-renders every page from JSON data
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');

/* ─────────────── CONFIG ─────────────── */
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const TEMPLATES = path.join(ROOT, 'templates');
const DATA = path.join(ROOT, 'data');

const ARGS = process.argv.slice(2);
const WATCH = ARGS.includes('--watch');
const CLEAN = ARGS.includes('--clean');
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

/* ─────────────── DATA LOADING ─────────────── */
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
  console.log(`${COLORS.gray}  Loading data files...${COLORS.reset}`);
  const master = loadJSON('data/master.json');
  const content = loadJSON('data/content.json');
  const vision = loadJSON('data/vision.json');
  const media = loadJSON('data/media.json');
  const categories = content.categories || [];
  const articles = content.articles || [];
  return { master, content, vision, media, categories, articles };
}

/* ─────────────── TEMPLATE LOADING ─────────────── */
function loadTemplate(relPath) {
  const full = path.join(TEMPLATES, relPath);
  try {
    return fs.readFileSync(full, 'utf8');
  } catch (err) {
    console.error(`${COLORS.red}✗ Failed to load template ${relPath}: ${err.message}${COLORS.reset}`);
    process.exit(1);
  }
}

function loadAllTemplates() {
  return {
    head: loadTemplate('partials/head.html'),
    nav: loadTemplate('partials/nav.html'),
    footer: loadTemplate('partials/footer.html'),
    layout: loadTemplate('layout.html'),
    index: loadTemplate('index.html'),
    article: loadTemplate('article.html'),
    section: loadTemplate('section.html'),
    place: loadTemplate('place.html'),
    time: loadTemplate('time.html'),
    vision: loadTemplate('vision.html'),
    about: loadTemplate('about.html'),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════ */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(str) {
  return String(str).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function countWords(text) {
  if (!text) return 0;
  return String(text).split(/\s+/).filter(Boolean).length;
}

function readingTime(wordCount) {
  return Math.max(1, Math.round(wordCount / 220));
}

function absoluteUrl(relPath, baseUrl) {
  if (!relPath) return baseUrl;
  if (relPath.startsWith('http')) return relPath;
  const clean = String(relPath).replace(/^\//, '');
  return `${baseUrl.replace(/\/$/, '')}/${clean}`;
}

function toWebp(imagePath) {
  if (!imagePath) return '';
  return imagePath.replace(/\.(jpe?g|png)$/i, '.webp');
}

function toAvif(imagePath) {
  if (!imagePath) return '';
  return imagePath.replace(/\.(jpe?g|png)$/i, '.avif');
}

function buildSrcset(imagePath, widths = [400, 800, 1200, 1600]) {
  if (!imagePath) return '';
  const base = imagePath.replace(/\.(jpe?g|png)$/i, '');
  const ext = imagePath.match(/\.(jpe?g|png)$/i)?.[0] || '.jpg';
  return widths.map(w => `${base}-${w}${ext} ${w}w`).join(', ');
}

function groupBy(arr, key) {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!k) return acc;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function sortByDate(articles) {
  if (!Array.isArray(articles)) return [];
  return [...articles].sort((a, b) => {
    const da = a.datePublished || '';
    const db = b.datePublished || '';
    return db.localeCompare(da);
  });
}

function primaryCategory(article, categories) {
  if (!article.categories || !article.categories.length) return null;
  return categories.find(c => c.id === article.categories[0]) || null;
}

function getCategories(article, categories) {
  if (!article.categories) return [];
  return article.categories.map(id => categories.find(c => c.id === id)).filter(Boolean);
}

function exists(relPath) {
  try {
    return fs.statSync(path.join(ROOT, relPath)).isFile();
  } catch {
    return false;
  }
}

function writeFile(relPath, content) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  if (VERBOSE) {
    const size = (content.length / 1024).toFixed(1);
    console.log(`${COLORS.gray}    → ${relPath} (${size} KB)${COLORS.reset}`);
  }
}

function copyFile(srcRel, destRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(DIST, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcRel, destRel, filter = null) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(DIST, destRel);
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relPath = path.join(srcRel, entry.name);
    if (filter && !filter(relPath)) return;
    if (entry.isDirectory()) {
      copyDir(relPath, path.join(destRel, entry.name), filter);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function cleanDist() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
    console.log(`${COLORS.gray}  Cleaned dist/${COLORS.reset}`);
  }
  fs.mkdirSync(DIST, { recursive: true });
}

function replaceAll(template, replacements) {
  let result = template;
  Object.entries(replacements).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value == null ? '' : String(value));
  });
  return result;
}

/* ═══════════════════════════════════════════════════════════════════
   SCHEMA BUILDERS
   ═══════════════════════════════════════════════════════════════════ */

function buildOrganizationNode(master) {
  return {
    '@type': 'Organization',
    '@id': `${master.site.url}/#organization`,
    'name': master.organization.name,
    'url': master.site.url,
    'logo': {
      '@type': 'ImageObject',
      'url': absoluteUrl('/images/icons/icon-512.png', master.site.url),
      'width': 512,
      'height': 512
    },
    'foundingDate': master.organization.foundingDate,
    'email': master.contact.email,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': master.village.name,
      'addressLocality': master.village.district,
      'addressRegion': master.village.state,
      'postalCode': master.village.pincode,
      'addressCountry': 'IN'
    },
    ...(master.social.github && { 'sameAs': [master.social.github] })
  };
}

function buildWebsiteNode(master) {
  return {
    '@type': 'WebSite',
    '@id': `${master.site.url}/#website`,
    'url': master.site.url,
    'name': master.site.name,
    'description': master.site.description,
    'inLanguage': master.site.language,
    'publisher': { '@id': `${master.site.url}/#organization` },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${master.site.url}/section?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

function buildPlaceNode(master) {
  return {
    '@type': 'Place',
    '@id': `${master.site.url}/#place`,
    'name': master.village.name,
    'description': `A village in ${master.village.district} district, ${master.village.state}, India, part of the historic ${master.village.region} region.`,
    'url': master.site.url,
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': master.village.coordinates.lat,
      'longitude': master.village.coordinates.lng
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': master.village.district,
      'addressRegion': master.village.state,
      'postalCode': master.village.pincode,
      'addressCountry': 'IN'
    },
    'additionalProperty': [
      { '@type': 'PropertyValue', 'name': 'Population', 'value': master.village.population },
      { '@type': 'PropertyValue', 'name': 'Area', 'value': master.village.area },
      { '@type': 'PropertyValue', 'name': 'Elevation', 'value': master.village.elevation }
    ]
  };
}

function buildBreadcrumbNode(items, baseUrl) {
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

function buildImageNode(imagePath, meta, master) {
  const absolute = absoluteUrl(imagePath, master.site.url);
  return {
    '@type': 'ImageObject',
    '@id': `${absolute}#image`,
    'contentUrl': absolute,
    'url': absolute,
    'caption': meta.caption || '',
    'name': meta.name || meta.caption || '',
    'description': meta.description || meta.caption || '',
    ...(meta.width && { 'width': { '@type': 'QuantitativeValue', 'value': meta.width } }),
    ...(meta.height && { 'height': { '@type': 'QuantitativeValue', 'value': meta.height } }),
    'creator': { '@id': `${master.site.url}/#organization` },
    'creditText': master.imageSEO.creditText,
    'license': master.imageSEO.license,
    'acquireLicensePage': master.imageSEO.acquireLicensePage,
    ...(meta.uploadDate && { 'uploadDate': meta.uploadDate })
  };
}

function buildHomeSchema(master, content) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildWebsiteNode(master),
      buildOrganizationNode(master),
      buildPlaceNode(master),
      buildImageNode(master.seo.ogImage, {
        caption: `Bandwar village at dawn, ${master.village.district}, Bihar`,
        name: master.site.name,
        width: master.seo.ogImageWidth,
        height: master.seo.ogImageHeight,
        uploadDate: master.lastUpdated
      }, master),
      buildBreadcrumbNode([
        { name: master.site.shortName, url: '/' }
      ], master.site.url)
    ]
  };
}

function buildArticleSchema(article, master, categories) {
  const url = `${master.site.url}/article/${article.id}`;
  const text = [
    article.summary || '',
    ...(article.content || []).map(c => c.text || '')
  ].join(' ');
  const wordCount = countWords(text);

  const datePub = article.datePublished
    ? new Date(article.datePublished).toISOString()
    : `${master.site.established || '2024'}-01-01T00:00:00+05:30`;
  const dateMod = article.dateModified
    ? new Date(article.dateModified).toISOString()
    : new Date(master.lastUpdated).toISOString();

  const images = [];
  if (article.hero) {
    images.push(buildImageNode(article.hero, {
      caption: article.title,
      name: article.title,
      description: `${article.title} — ${article.subtitle || ''}`.trim(),
      uploadDate: datePub
    }, master));
  }
  (article.photos || []).forEach((photo) => {
    if (photo.src && photo.src !== article.hero) {
      images.push(buildImageNode(photo.src, {
        caption: photo.caption || article.title,
        name: photo.caption || article.title,
        uploadDate: datePub
      }, master));
    }
  });

  const articleNode = {
    '@type': 'Article',
    '@id': `${url}#article`,
    'headline': article.title,
    'description': article.summary || '',
    'url': url,
    'mainEntityOfPage': { '@id': url },
    'datePublished': datePub,
    'dateModified': dateMod,
    'inLanguage': master.site.language,
    'author': { '@id': `${master.site.url}/#organization` },
    'publisher': { '@id': `${master.site.url}/#organization` },
    ...(article.subtitle && { 'alternativeHeadline': article.subtitle }),
    ...(images.length && { 'image': images.map(i => ({ '@id': i['@id'] })) }),
    'articleSection': getCategories(article, categories).map(c => c.title),
    ...(article.tags && { 'keywords': article.tags.join(', ') }),
    'wordCount': wordCount,
    ...(article.location && {
      'contentLocation': {
        '@type': 'Place',
        'name': `${master.village.name}, ${master.village.district}`,
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': article.location.lat,
          'longitude': article.location.lng
        }
      }
    })
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      articleNode,
      ...images,
      buildOrganizationNode(master),
      buildBreadcrumbNode([
        { name: master.site.shortName, url: '/' },
        { name: 'Archive', url: '/section' },
        { name: article.title, url: `/article/${article.id}` }
      ], master.site.url)
    ]
  };
}

function buildSectionSchema(category, articles, master, isAll) {
  const url = isAll
    ? `${master.site.url}/section`
    : `${master.site.url}/section/${category.id}`;

  const name = isAll ? 'All Articles' : category.title;
  const description = isAll
    ? `Browse all ${articles.length} articles in the Bandwar Archive.`
    : category.description || `${articles.length} articles in ${category.title}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
        'url': url,
        'name': `${name} — ${master.site.shortName} Archive`,
        'description': description,
        'inLanguage': master.site.language,
        'isPartOf': { '@id': `${master.site.url}/#website` },
        'publisher': { '@id': `${master.site.url}/#organization` },
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': articles.length,
          'itemListElement': articles.map((a, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'url': `${master.site.url}/article/${a.id}`
          }))
        }
      },
      buildBreadcrumbNode(
        isAll
          ? [
              { name: master.site.shortName, url: '/' },
              { name: 'Archive', url: '/section' }
            ]
          : [
              { name: master.site.shortName, url: '/' },
              { name: 'Archive', url: '/section' },
              { name: category.title, url: `/section/${category.id}` }
            ],
        master.site.url
      ),
      buildOrganizationNode(master)
    ]
  };
}

function buildPlaceSchema(landmarks, master) {
  const url = `${master.site.url}/place`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        'url': url,
        'name': `Places — ${master.site.shortName}`,
        'description': `Explore ${landmarks.length} landmarks of Bandwar village on an interactive map.`,
        'inLanguage': master.site.language,
        'isPartOf': { '@id': `${master.site.url}/#website` },
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': landmarks.length,
          'itemListElement': landmarks.map((l, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'item': {
              '@type': 'Place',
              'name': l.name,
              'description': l.description || '',
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': l.lat,
                'longitude': l.lng
              },
              ...(l.article && { 'url': `${master.site.url}/article/${l.article}` })
            }
          }))
        }
      },
      buildBreadcrumbNode([
        { name: master.site.shortName, url: '/' },
        { name: 'Places', url: '/place' }
      ], master.site.url),
      buildOrganizationNode(master)
    ]
  };
}

function buildTimeSchema(timeline, master) {
  const url = `${master.site.url}/time`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        'url': url,
        'name': `Timeline — ${master.site.shortName}`,
        'description': `${timeline.length} historical events across 2,600 years of Bandwar.`,
        'inLanguage': master.site.language,
        'isPartOf': { '@id': `${master.site.url}/#website` },
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': timeline.length,
          'itemListElement': timeline.map((event, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'item': {
              '@type': 'Event',
              'name': event.title,
              'description': event.description,
              ...(event.sortKey != null && { 'startDate': String(event.sortKey) }),
              'location': {
                '@type': 'Place',
                'name': `${master.village.name}, ${master.village.district}`
              }
            }
          }))
        }
      },
      buildBreadcrumbNode([
        { name: master.site.shortName, url: '/' },
        { name: 'Time', url: '/time' }
      ], master.site.url),
      buildOrganizationNode(master)
    ]
  };
}

function buildVisionSchema(priorities, achievements, roadmap, master, currentYear, horizonEnd) {
  const url = `${master.site.url}/vision`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Report',
        '@id': `${url}#report`,
        'url': url,
        'name': `${master.village.name} ${horizonEnd} — A Non-Political Development Plan`,
        'description': `A non-political development manifesto for ${master.village.name} — ${priorities.length} active priorities, ${achievements.length} completed projects, and a 10-year roadmap (${currentYear}–${horizonEnd}).`,
        'inLanguage': master.site.language,
        'datePublished': `${currentYear}-01-01T00:00:00+05:30`,
        'author': { '@id': `${master.site.url}/#organization` },
        'publisher': { '@id': `${master.site.url}/#organization` },
        'about': {
          '@type': 'ItemList',
          'name': 'Active Priorities',
          'numberOfItems': priorities.length,
          'itemListElement': priorities.map((p, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'item': {
              '@type': 'Thing',
              'name': p.title,
              'description': p.summary || p.reality || ''
            }
          }))
        }
      },
      buildBreadcrumbNode([
        { name: master.site.shortName, url: '/' },
        { name: 'Vision', url: '/vision' }
      ], master.site.url),
      buildOrganizationNode(master)
    ]
  };
}

function buildAboutSchema(master) {
  const url = `${master.site.url}/about`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#page`,
        'url': url,
        'name': `About — ${master.site.shortName}`,
        'description': master.about.intro,
        'inLanguage': master.site.language,
        'isPartOf': { '@id': `${master.site.url}/#website` },
        'mainEntity': { '@id': `${master.site.url}/#organization` }
      },
      buildOrganizationNode(master),
      buildBreadcrumbNode([
        { name: master.site.shortName, url: '/' },
        { name: 'About', url: '/about' }
      ], master.site.url)
    ]
  };
}

function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2);
}

/* ═══════════════════════════════════════════════════════════════════
   HEAD RENDERER
   ═══════════════════════════════════════════════════════════════════ */
function renderHead(templates, master, pageData) {
  const {
    title, description, canonical, ogImage,
    ogType = 'website', ogImageAlt,
    robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    schema, hreflangHindi = '', preloadImages = '', pageSpecificHead = '',
  } = pageData;

  const faviconSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231a1a18'/><text x='50' y='68' font-family='Georgia' font-size='60' fill='%23f7f5ef' text-anchor='middle'>B</text></svg>`;
  const themeColor = master.brand.colors.primary;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage, master.site.url);
  const ogImageAltFinal = ogImageAlt || `${master.site.shortName} — ${master.site.tagline}`;

  const keywordsTag = pageData.keywords
    ? `<meta name="keywords" content="${escapeHtml(pageData.keywords)}">`
    : '';
  const twitterSite = master.seo.twitterHandle
    ? `<meta name="twitter:site" content="${escapeHtml(master.seo.twitterHandle)}">`
    : '';

  const replacements = {
    lang: master.site.language,
    dir: master.site.dir,
    themeColor,
    title: escapeHtml(title),
    description: escapeHtml(description),
    keywords: keywordsTag,
    canonical: escapeHtml(canonical),
    robots,
    hreflangHindi,
    ogType,
    ogSiteName: escapeHtml(master.site.name),
    ogTitle: escapeHtml(title),
    ogDescription: escapeHtml(description),
    ogImage: ogImageUrl,
    ogImageWidth: master.seo.ogImageWidth || 1200,
    ogImageHeight: master.seo.ogImageHeight || 630,
    ogImageAlt: escapeHtml(ogImageAltFinal),
    ogLocale: master.site.locale,
    twitterCard: 'summary_large_image',
    twitterTitle: escapeHtml(title),
    twitterDescription: escapeHtml(description),
    twitterImage: ogImageUrl,
    twitterSite,
    verificationGoogle: master.seo.verification?.google || '',
    faviconSvg,
    manifestUrl: '/manifest.json',
    themeCss: `/assets/css/theme.css?v=${master.version}`,
    styleCss: `/assets/css/style.css?v=${master.version}`,
    pageSpecificHead,
    preloadImages,
    schema: schema ? serializeSchema(schema) : '{}',
  };

  return replaceAll(templates.head, replacements);
}

/* ═══════════════════════════════════════════════════════════════════
   NAV RENDERER
   ═══════════════════════════════════════════════════════════════════ */
function renderNav(templates, master, currentPath) {
  const navItems = master.nav.map(item => {
    const isActive = isActiveNavItem(item.href, currentPath);
    const activeClass = isActive ? ' class="active"' : '';
    const activeAria = isActive ? ' aria-current="page"' : '';
    const icon = item.icon ? `<span aria-hidden="true">${item.icon}</span> ` : '';
    return `<li role="none"><a href="${escapeHtml(item.href)}" role="menuitem"${activeClass}${activeAria}>${icon}${escapeHtml(item.label)}</a></li>`;
  }).join('\n        ');

  const themeToggle = master.features.darkMode ? `
        <button class="nav-icon-btn" id="themeToggle" aria-label="Toggle dark mode" title="Toggle theme" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>` : '';

  const searchBtn = master.features.search ? `
        <a href="/section" class="nav-icon-btn" aria-label="Search the archive" title="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </a>` : '';

  const hamburger = `
        <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navMenu" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <line x1="3" y1="7" x2="21" y2="7"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="17" x2="21" y2="17"/>
          </svg>
        </button>`;

  const pageSlug = derivePageSlug(currentPath);

  return replaceAll(templates.nav, {
    siteName: escapeHtml(master.site.shortName),
    navItems,
    themeToggle: themeToggle + searchBtn + hamburger,
    navActive: pageSlug,
  });
}

function isActiveNavItem(href, currentPath) {
  if (href === '/' && currentPath === '/') return true;
  if (href !== '/' && currentPath.startsWith(href)) return true;
  return false;
}

function derivePageSlug(currentPath) {
  if (currentPath === '/' || currentPath === '/index.html') return 'home';
  const clean = currentPath.replace(/^\/|\/$/g, '').replace(/\.html$/, '');
  return clean.split('/')[0] || 'home';
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER RENDERER
   ═══════════════════════════════════════════════════════════════════ */
function renderFooter(templates, master) {
  const currentYear = new Date().getFullYear();

  const footerSections = master.footer.sections.map(item =>
    `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`
  ).join('\n          ');

  const footerExplore = master.footer.explore.map(item =>
    `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`
  ).join('\n          ');

  const socialLinks = renderSocialLinks(master.social);
  const copyright = (master.footer.copyright || '').replace('{year}', currentYear);
  const credit = master.footer.credit || '';

  return replaceAll(templates.footer, {
    siteName: escapeHtml(master.site.shortName),
    siteFullName: escapeHtml(master.site.name),
    siteDescription: escapeHtml(master.site.description),
    footerSections,
    footerExplore,
    footerCopyright: escapeHtml(copyright),
    footerCredit: escapeHtml(credit),
    contactEmail: escapeHtml(master.contact.email),
    villageName: escapeHtml(master.village.name),
    villageDistrict: escapeHtml(master.village.district),
    villageState: escapeHtml(master.village.state),
    villagePincode: escapeHtml(master.village.pincode),
    socialLinks,
  });
}

function renderSocialLinks(social) {
  const platforms = {
    github: { label: 'GitHub', url: social.github },
    youtube: { label: 'YouTube', url: social.youtube },
    instagram: { label: 'Instagram', url: social.instagram },
    twitter: { label: 'Twitter', url: social.twitter },
  };

  const links = Object.entries(platforms)
    .filter(([_, p]) => p.url)
    .map(([key, p]) =>
      `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(p.label)}">${escapeHtml(p.label)}</a>`
    );

  return links.length ? `<div class="footer-social">${links.join('')}</div>` : '';
}

/* ═══════════════════════════════════════════════════════════════════
   BREADCRUMB + LAYOUT
   ═══════════════════════════════════════════════════════════════════ */
function renderBreadcrumb(items, master) {
  if (!items || items.length === 0) return '';

  const parts = [];
  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    if (isLast) {
      parts.push(`<span class="breadcrumb-current">${escapeHtml(item.name)}</span>`);
    } else {
      parts.push(`<a href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a>`);
      parts.push(`<span class="breadcrumb-sep" aria-hidden="true">›</span>`);
    }
  });

  return `
<div class="breadcrumb-bar">
  <div class="container-wide">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      ${parts.join('\n      ')}
    </nav>
  </div>
</div>`.trim();
}

function renderLayout(templates, master, pageData) {
  const {
    slug, title, description, canonical, ogImage,
    ogType = 'website', ogImageAlt, robots, keywords, schema,
    content, bodyClass = '', bodyAttr = '', breadcrumb = '',
    pageScripts = '', preloadImages = '', pageSpecificHead = '',
  } = pageData;

  const head = renderHead(templates, master, {
    title, description, canonical, ogImage, ogType, ogImageAlt,
    robots, keywords, schema, preloadImages, pageSpecificHead,
  });

  const currentPath = canonicalToPath(canonical, master);
  const nav = renderNav(templates, master, currentPath);
  const footer = renderFooter(templates, master);

  const bodyClassFinal = `page-${slug}${bodyClass ? ' ' + bodyClass : ''}`;

  return replaceAll(templates.layout, {
    lang: master.site.language,
    dir: master.site.dir,
    head,
    nav,
    footer,
    bodyClass: bodyClassFinal,
    bodyAttr,
    breadcrumb,
    content,
    pageScripts,
    version: master.version,
  });
}

function canonicalToPath(canonical, master) {
  try {
    const url = new URL(canonical);
    return url.pathname || '/';
  } catch {
    return '/';
  }
}

/* ═══════════════════════════════════════════════════════════════════
   URL HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function buildCanonical(pathname, master) {
  const base = master.site.url.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

function articleUrl(articleId, master) {
  return buildCanonical(`/article/${articleId}`, master);
}

function sectionCanonicalPath(categoryId) {
  return categoryId ? `/section/${categoryId}` : '/section';
}

function preloadImage(imagePath, master, options = {}) {
  if (!imagePath) return '';
  const {
    fetchpriority = 'high',
    media = null,
    type = null,
    isHero = false,
  } = options;

  const srcset = isHero
    ? buildSrcset(imagePath, [800, 1200, 1600])
    : '';

  const href = isHero
    ? `${imagePath.replace(/\.(jpe?g|png)$/i, '-1200$1')}`
    : imagePath;

  const hrefAbs = absoluteUrl(href, master.site.url);

  let link = `<link rel="preload" as="image" href="${hrefAbs}" fetchpriority="${fetchpriority}"`;
  if (srcset) link += ` imagesrcset="${srcset}" imagesizes="100vw"`;
  if (media) link += ` media="${media}"`;
  if (type) link += ` type="${type}"`;
  link += `>`;

  return link;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — HOME
   ═══════════════════════════════════════════════════════════════════ */
function renderHome(templates, master, content) {
  const { categories, articles } = content;

  const hero = master.home.hero;
  const heroImage = hero.image;
  const heroMeta = master.home.meta.map(m => `
        <span>
          <small>${escapeHtml(m.label)}</small>
          <b>${escapeHtml(m.value)}</b>
        </span>`).join('');

  const statsRow = master.home.stats.map(stat => `
      <div class="stat-item">
        <div class="stat-value">${escapeHtml(stat.value)}</div>
        <div class="stat-label">${escapeHtml(stat.label)}</div>
      </div>`).join('\n      ');

  const manifestoBanner = master.features.manifesto ? renderManifestoBanner(master) : '';

  const recent = sortByDate(articles).slice(0, 6);
  const recentArticles = recent.map(article => {
    const cat = primaryCategory(article, categories);
    const summary = article.summary || '';
    const truncated = summary.length > 180 ? summary.slice(0, 180) + '…' : summary;
    return `
      <li class="recent-item">
        <a href="/article/${escapeHtml(article.id)}">
          <div>
            ${cat ? `<div class="recent-category">${cat.icon || ''} ${escapeHtml(cat.title)}</div>` : ''}
            <div class="recent-title">${escapeHtml(article.title)}</div>
            <p class="recent-summary">${escapeHtml(truncated)}</p>
          </div>
          <span class="recent-arrow" aria-hidden="true">→</span>
        </a>
      </li>`;
  }).join('\n      ');

  const pullquote = `
    <div class="pullquote">
      <blockquote>${escapeHtml(master.home.pullquote.text)}</blockquote>
      <cite>${escapeHtml(master.home.pullquote.cite)}</cite>
    </div>`;

  const categoryTiles = categories.map(cat => {
    const count = articles.filter(a => (a.categories || []).includes(cat.id)).length;
    return `
      <a href="/section/${escapeHtml(cat.id)}" class="category-tile">
        <div class="category-tile-icon">${cat.icon || '📁'}</div>
        <div class="category-tile-title">${escapeHtml(cat.title)}</div>
        <div class="category-tile-count">${count} article${count === 1 ? '' : 's'}</div>
      </a>`;
  }).join('\n      ');

  const aboutParagraphs = master.home.about.paragraphs
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('\n      ');

  const pageContent = replaceAll(templates.index, {
    heroImage: '/' + heroImage.replace(/^\//, ''),
    heroImageAlt: escapeHtml(hero.alt),
    heroLocation: escapeHtml(hero.location),
    heroTitle: escapeHtml(hero.title),
    heroTagline: escapeHtml(hero.tagline),
    heroMeta,
    statsRow,
    manifestoBanner,
    recentArticles,
    pullquote,
    categoryTiles,
    aboutEyebrow: escapeHtml(master.home.about.eyebrow),
    aboutTitle: escapeHtml(master.home.about.title),
    aboutParagraphs,
    ctaLabel: escapeHtml(master.home.cta.label),
    ctaHref: escapeHtml(master.home.cta.href),
  });

  return renderLayout(templates, master, {
    slug: 'home',
    title: master.site.name,
    description: master.site.description,
    canonical: buildCanonical('/', master),
    ogImage: master.seo.ogImage,
    ogType: 'website',
    schema: buildHomeSchema(master, content),
    content: pageContent,
    bodyAttr: 'data-page="home"',
    preloadImages: preloadImage(heroImage, master, { fetchpriority: 'high', isHero: true }),
  });
}

function renderManifestoBanner(master) {
  const currentYear = new Date().getFullYear();
  const horizonEnd = currentYear + 10;

  return `
    <section class="manifesto-banner" aria-label="Manifesto download">
      <div class="container-wide">
        <div class="banner-inner">
          <div class="banner-text">
            <span class="eyebrow">Bandwar ${horizonEnd}</span>
            <h3>A non-political manifesto for the village</h3>
            <p>15 priorities · 10-year roadmap · Download the PDF</p>
          </div>
          <div class="banner-actions">
            <a href="/assets/pdfs/Vision-Vikshit-Bandwar.pdf" class="btn btn-primary" download>
              📄 Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>`.trim();
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — ARTICLE
   ═══════════════════════════════════════════════════════════════════ */
function renderArticle(templates, master, content, article) {
  const { categories } = content;
  const articleUrlFull = articleUrl(article.id, master);

  const text = [
    article.summary || '',
    ...(article.content || []).map(c => c.text || '')
  ].join(' ');
  const wordCount = countWords(text);
  const readMin = readingTime(wordCount);

  const cats = getCategories(article, categories);
  const primaryCat = cats[0] || null;
  const catText = cats.map(c => c.title).join(' · ');

  const year = article.datePublished
    ? new Date(article.datePublished).getFullYear()
    : new Date().getFullYear();

  const categoryEyebrow = `
      <span>${primaryCat ? (primaryCat.icon || '') + ' ' + escapeHtml(primaryCat.title) : 'Archive'}</span>
      <span class="dot"></span>
      <span>${readMin} min read</span>
      <span class="dot"></span>
      <span>${year}</span>`;

  const articleSubtitleBlock = article.subtitle
    ? `<p class="article-subtitle">${escapeHtml(article.subtitle)}</p>`
    : '';

  const heroFigure = article.hero ? renderHeroFigure(article, master) : '';
  const factsBlock = article.infobox ? renderFactsBlock(article.infobox) : '';

  const contentSections = (article.content || []).map((section, i, arr) => {
    const num = String(i + 1).padStart(2, '0');
    const total = String(arr.length).padStart(2, '0');
    const anchor = slugify(section.heading);
    return `
    <section class="article-section" id="${escapeHtml(anchor)}">
      <span class="article-section-num">${num} / ${total}</span>
      <h2>${escapeHtml(section.heading)}</h2>
      <p>${escapeHtml(section.text)}</p>
    </section>`;
  }).join('\n');

  const photosBlock = renderPhotosBlock(article, master);
  const voiceQuoteBlock = article.quote ? renderVoiceQuote(article.quote) : '';
  const relatedBlock = renderRelated(article, content, master);
  const tagsBlock = renderTags(article);

  const metaFooter = `
      <span>Published<b>${escapeHtml(master.site.shortName)} Archive</b></span>
      <span>Location<b>${article.location ? `${article.location.lat.toFixed(4)}°N, ${article.location.lng.toFixed(4)}°E` : '—'}</b></span>
      <span>Category<b>${escapeHtml(catText || 'Uncategorised')}</b></span>`;

  const nextArticle = computeNextArticle(article, content);

  const pageContent = replaceAll(templates.article, {
    articleId: escapeHtml(article.id),
    articleTitle: escapeHtml(article.title),
    articleSubtitle: escapeHtml(article.subtitle || ''),
    articleSubtitleBlock,
    articleSummary: escapeHtml(article.summary || ''),
    categoryEyebrow,
    heroFigure,
    factsBlock,
    contentSections,
    photosBlock,
    voiceQuoteBlock,
    relatedBlock,
    tagsBlock,
    metaFooter,
    nextArticle,
  });

  return renderLayout(templates, master, {
    slug: `article-${article.id}`,
    title: `${article.title} — ${master.site.shortName} Archive`,
    description: article.summary || master.seo.defaultDescription,
    canonical: articleUrlFull,
    ogImage: article.hero || master.seo.ogImage,
    ogType: 'article',
    ogImageAlt: article.title,
    keywords: (article.tags || []).join(', '),
    schema: buildArticleSchema(article, master, categories),
    content: pageContent,
    bodyAttr: `data-page="article" data-article-id="${escapeHtml(article.id)}"`,
    breadcrumb: renderBreadcrumb([
      { name: master.site.shortName, url: '/' },
      { name: 'Archive', url: '/section' },
      { name: article.title, url: `/article/${article.id}` },
    ], master),
    pageScripts: '<script src="/assets/js/articles.js" defer></script>',
    preloadImages: article.hero ? preloadImage(article.hero, master, { fetchpriority: 'high', isHero: true }) : '',
  });
}

function renderHeroFigure(article, master) {
  const hero = article.hero;
  const webp = toWebp(hero);
  const srcset = buildSrcset(hero);
  const alt = `${article.title} — Bandwar village, Begusarai, Bihar`;

  return `
    <figure class="article-hero">
      <picture>
        <source srcset="/${webp}" type="image/webp">
        <img src="/${hero.replace(/^\//, '')}"
             alt="${escapeHtml(alt)}"
             srcset="${srcset.split(', ').map(s => '/' + s).join(', ')}"
             sizes="100vw"
             fetchpriority="high"
             decoding="async"
             width="1600"
             height="900">
      </picture>
    </figure>`.trim();
}

function renderFactsBlock(infobox) {
  const entries = Object.entries(infobox);
  if (!entries.length) return '';

  return `
    <div class="container-wide">
      <div class="article-facts">
        <div class="article-facts-grid">
          ${entries.map(([label, value]) => `
            <div class="article-fact">
              <span class="article-fact-label">${escapeHtml(label)}</span>
              <span class="article-fact-value">${escapeHtml(value)}</span>
            </div>`).join('\n          ')}
        </div>
      </div>
    </div>`.trim();
}

function renderPhotosBlock(article, master) {
  const photos = (article.photos || []).filter(p => p.src && p.src !== article.hero);
  if (!photos.length) return '';

  return `
    <section class="article-photos container-wide">
      <h2 class="article-photos-title">
        Photographs
        <small>${photos.length} ${photos.length === 1 ? 'image' : 'images'}</small>
      </h2>
      <div class="article-photos-grid">
        ${photos.map(photo => `
          <figure class="article-photo">
            <picture>
              <source srcset="/${toWebp(photo.src)}" type="image/webp">
              <img src="/${photo.src.replace(/^\//, '')}"
                   alt="${escapeHtml(photo.caption || article.title)}"
                   loading="lazy"
                   decoding="async"
                   data-lightbox>
            </picture>
            ${photo.caption ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>` : ''}
          </figure>`).join('\n        ')}
      </div>
    </section>`.trim();
}

function renderVoiceQuote(quote) {
  return `
    <div class="container-text">
      <blockquote class="voice-quote">
        <p>${escapeHtml(quote.text)}</p>
        <cite>
          <strong>${escapeHtml(quote.author || '')}</strong>
          ${quote.context ? escapeHtml(quote.context) : ''}
        </cite>
      </blockquote>
    </div>`.trim();
}

function renderRelated(article, content, master) {
  const { articles, categories } = content;
  const related = (article.related || [])
    .map(id => articles.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, 3);

  if (!related.length) return '';

  const cards = related.map(rel => {
    const cat = primaryCategory(rel, categories);
    const summary = (rel.summary || '').slice(0, 160);
    return `
        <a class="article-related-card" href="/article/${escapeHtml(rel.id)}">
          <div>
            ${cat ? `<div class="article-related-cat">${escapeHtml(cat.title)}</div>` : ''}
            <h3 class="article-related-title">${escapeHtml(rel.title)}</h3>
            <p class="article-related-summary">${escapeHtml(summary)}…</p>
          </div>
          <div class="article-related-arrow">READ →</div>
        </a>`;
  }).join('\n');

  return `
    <section class="article-related container-wide">
      <div class="article-related-head">Continue Reading</div>
      <div class="article-related-grid">
        ${cards}
      </div>
    </section>`.trim();
}

function renderTags(article) {
  if (!article.tags || !article.tags.length) return '';

  return `
    <div class="container-text">
      <div class="article-tags">
        <span class="article-tags-label">Topics</span>
        ${article.tags.map(tag => `
          <a href="/section?q=${encodeURIComponent(tag)}" class="article-tag">${escapeHtml(tag)}</a>`).join('')}
      </div>
    </div>`.trim();
}

function computeNextArticle(article, content) {
  const { articles } = content;
  const sorted = sortByDate(articles);
  const idx = sorted.findIndex(a => a.id === article.id);
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  if (!next) {
    return `
    <a href="/section" class="next">
      <span class="label">Explore</span>
      <span class="title">Full Archive →</span>
    </a>`;
  }

  return `
    <a href="/article/${escapeHtml(next.id)}" class="next">
      <span class="label">Next</span>
      <span class="title">${escapeHtml(next.title)} →</span>
    </a>`;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — SECTION
   ═══════════════════════════════════════════════════════════════════ */
function renderSection(templates, master, content, category = null) {
  const { categories, articles } = content;
  const isAll = !category;

  const filtered = isAll
    ? articles
    : articles.filter(a => (a.categories || []).includes(category.id));

  const sortedFiltered = sortByDate(filtered);

  const title = isAll ? 'All Articles' : category.title;
  const intro = isAll
    ? 'Browse every article in the archive — history, religion, education, culture, infrastructure, and more.'
    : (category.description || '');
  const eyebrow = isAll ? 'The Archive' : `Category · ${category.title}`;
  const count = `${sortedFiltered.length} article${sortedFiltered.length === 1 ? '' : 's'}${isAll ? ' in the archive' : ' in this category'}`;

  const sectionIntroBlock = intro ? `<p class="section-intro">${escapeHtml(intro)}</p>` : '';

  const filterChips = renderFilterChips(categories, articles, category, isAll);

  const articlesGrid = sortedFiltered
    .map(a => renderSectionCard(a, content, master))
    .join('\n      ');

  const emptyState = sortedFiltered.length === 0 ? `
    <div class="section-empty">
      <p>No articles in this category yet.</p>
      <a href="/section" class="read-link">Browse all articles</a>
    </div>`.trim() : '';

  const urlPath = sectionCanonicalPath(category?.id);
  const canonical = buildCanonical(urlPath, master);

  const pageContent = replaceAll(templates.section, {
    sectionEyebrow: escapeHtml(eyebrow),
    sectionTitle: escapeHtml(title),
    sectionIntroBlock,
    sectionCount: escapeHtml(count),
    searchValue: '',
    filterChips,
    articlesGrid,
    emptyState,
    pagination: '',
  });

  const slug = isAll ? 'section' : `section-${category.id}`;
  const bodyAttr = isAll
    ? 'data-page="section"'
    : `data-page="section" data-category="${escapeHtml(category.id)}"`;

  return {
    html: renderLayout(templates, master, {
      slug,
      title: isAll
        ? `${master.site.shortName} Archive — All Articles`
        : `${title} — ${master.site.shortName} Archive`,
      description: intro || master.seo.defaultDescription,
      canonical,
      ogImage: master.seo.ogImage,
      ogType: 'website',
      schema: buildSectionSchema(category, sortedFiltered, master, isAll),
      content: pageContent,
      bodyAttr,
      breadcrumb: isAll
        ? renderBreadcrumb([
            { name: master.site.shortName, url: '/' },
            { name: 'Archive', url: '/section' },
          ], master)
        : renderBreadcrumb([
            { name: master.site.shortName, url: '/' },
            { name: 'Archive', url: '/section' },
            { name: category.title, url: urlPath },
          ], master),
      pageScripts: '<script src="/assets/js/sections.js" defer></script>',
    }),
    path: category ? `section/${category.id}.html` : 'section/index.html',
    urlPath,
  };
}

function renderFilterChips(categories, articles, activeCategory, isAll) {
  const allCount = articles.length;
  const chips = [
    `<a href="/section" class="section-filter${isAll ? ' active' : ''}"${isAll ? ' aria-current="page"' : ''}>
        All <span class="filter-count">${allCount}</span>
      </a>`,
    ...categories.map(cat => {
      const count = articles.filter(a => (a.categories || []).includes(cat.id)).length;
      const active = !isAll && cat.id === activeCategory.id;
      return `<a href="/section/${escapeHtml(cat.id)}" class="section-filter${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>
        ${cat.icon || ''} ${escapeHtml(cat.title)}
        <span class="filter-count">${count}</span>
      </a>`;
    }),
  ];
  return chips.join('\n      ');
}

function renderSectionCard(article, content, master) {
  const { categories } = content;
  const cat = primaryCategory(article, categories);
  const hero = article.hero || master.seo.ogImage;
  const webp = toWebp(hero);
  const summary = article.summary || '';
  const truncated = summary.length > 140 ? summary.slice(0, 140) + '…' : summary;

  return `
      <a class="section-card" href="/article/${escapeHtml(article.id)}">
        <div class="section-card-img">
          <picture>
            <source srcset="/${webp}" type="image/webp">
            <img src="/${hero.replace(/^\//, '')}"
                 alt="${escapeHtml(article.title)}"
                 loading="lazy"
                 decoding="async"
                 width="400"
                 height="300">
          </picture>
        </div>
        <div class="section-card-body">
          ${cat ? `<div class="section-card-cat">${cat.icon || ''} ${escapeHtml(cat.title)}</div>` : ''}
          <h3 class="section-card-title">${escapeHtml(article.title)}</h3>
          ${article.subtitle ? `<div class="section-card-sub">${escapeHtml(article.subtitle)}</div>` : ''}
          <p class="section-card-summary">${escapeHtml(truncated)}</p>
        </div>
      </a>`;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — PLACE
   ═══════════════════════════════════════════════════════════════════ */
function renderPlace(templates, master, content, media) {
  const landmarks = media.landmarks || [];
  const gallery = media.gallery?.photos || [];
  const galleryCategories = media.gallery?.categories || [];

  const landmarkGroups = groupBy(landmarks, 'category');
  const mapStats = `
      <div class="map-stat">
        <span class="map-stat-value">${landmarks.length}</span>
        <span class="map-stat-label">Landmarks</span>
      </div>
      <div class="map-stat">
        <span class="map-stat-value">${gallery.length}</span>
        <span class="map-stat-label">Photographs</span>
      </div>
      <div class="map-stat">
        <span class="map-stat-value">${Object.keys(landmarkGroups).length}</span>
        <span class="map-stat-label">Categories</span>
      </div>
      <div class="map-stat">
        <span class="map-stat-value">${escapeHtml(master.village.area)}</span>
        <span class="map-stat-label">Village area</span>
      </div>`;

  const mapFilters = renderPlaceFilters(landmarks, content.categories, 'place-filter');

  const landmarkList = landmarks.map(l => {
    const cat = content.categories.find(c => c.id === l.category);
    return `
        <li class="landmark-item">
          <a href="/article/${escapeHtml(l.article || l.id)}" class="landmark-link">
            <span class="landmark-icon" aria-hidden="true">${cat?.icon || '📍'}</span>
            <div class="landmark-body">
              <h3 class="landmark-name">${escapeHtml(l.name)}</h3>
              <p class="landmark-desc">${escapeHtml(l.description || '')}</p>
              <span class="landmark-coords">${l.lat.toFixed(4)}°N, ${l.lng.toFixed(4)}°E</span>
            </div>
            <span class="landmark-arrow" aria-hidden="true">→</span>
          </a>
        </li>`;
  }).join('');

  const landmarkMarkers = JSON.stringify({
    center: master.village.coordinates,
    zoom: 16,
    landmarks: landmarks.map(l => ({
      id: l.id,
      name: l.name,
      cat: l.category,
      lat: l.lat,
      lng: l.lng,
      icon: l.icon || content.categories.find(c => c.id === l.category)?.icon || '📍',
      article: l.article || l.id,
      photo: l.photo ? '/' + l.photo.replace(/^\//, '') : null,
    })),
  });

  const mapLegend = Object.entries(landmarkGroups).map(([catId, items]) => {
    const cat = content.categories.find(c => c.id === catId);
    return `
        <div class="legend-item">
          <span class="legend-icon">${cat?.icon || '📍'}</span>
          <span class="legend-label">${escapeHtml(cat?.title || catId)}</span>
          <span class="legend-count">${items.length}</span>
        </div>`;
  }).join('');

  const galleryFilters = renderPlaceFilters(gallery, galleryCategories, 'gallery-filter');

  const galleryItems = gallery.map(photo => `
        <figure class="photo-item" data-cat="${escapeHtml(photo.category || '')}">
          <picture>
            <source srcset="/${toWebp(photo.src)}" type="image/webp">
            <img src="/${photo.src.replace(/^\//, '')}"
                 alt="${escapeHtml(photo.caption || 'Photograph of Bandwar')}"
                 loading="lazy"
                 decoding="async"
                 data-lightbox>
          </picture>
          <figcaption class="photo-caption">
            ${escapeHtml(photo.caption || '')}
            ${photo.year ? `<span class="photo-year">${photo.year}</span>` : ''}
          </figcaption>
        </figure>`).join('\n');

  const pageSpecificHead = master.features.map ? `
    <link rel="stylesheet" href="/assets/vendor/leaflet/leaflet.css" media="print" onload="this.media='all'">` : '';

  const pageScripts = master.features.map ? `
    <script src="/assets/vendor/leaflet/leaflet.js" defer></script>
    <script src="/assets/js/places.js" defer></script>` : '<script src="/assets/js/places.js" defer></script>';

  const pageContent = replaceAll(templates.place, {
    placeTitle: 'Places',
    placeIntro: 'Bandwar through its landmarks and photographs — an interactive map of the village and a curated gallery of images from across the archive.',
    landmarkCount: String(landmarks.length),
    galleryCount: String(gallery.length),
    mapStats,
    mapFilters,
    landmarkList,
    landmarkMarkers,
    mapLegend,
    galleryFilters,
    galleryItems,
  });

  return renderLayout(templates, master, {
    slug: 'place',
    title: `Places — ${master.site.shortName} Map & Gallery`,
    description: `Explore Bandwar village through ${landmarks.length} landmarks and ${gallery.length} photographs — map of Begusarai, Bihar.`,
    canonical: buildCanonical('/place', master),
    ogImage: master.seo.ogImage,
    ogType: 'website',
    schema: buildPlaceSchema(landmarks, master),
    content: pageContent,
    bodyAttr: 'data-page="place"',
    breadcrumb: renderBreadcrumb([
      { name: master.site.shortName, url: '/' },
      { name: 'Places', url: '/place' },
    ], master),
    pageScripts,
    pageSpecificHead,
  });
}

function renderPlaceFilters(items, categories, className) {
  const groups = groupBy(items, 'category');
  const allLabel = 'All';

  const chips = [
    `<button class="${className} active" data-cat="" type="button">
        ${allLabel} <span class="filter-count">${items.length}</span>
      </button>`,
    ...Object.entries(groups).map(([catId, list]) => {
      const cat = categories.find(c => c.id === catId);
      return `<button class="${className}" data-cat="${escapeHtml(catId)}" type="button">
        ${cat?.icon || '📍'} ${escapeHtml(cat?.title || catId)}
        <span class="filter-count">${list.length}</span>
      </button>`;
    }),
  ];
  return chips.join('\n      ');
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — TIME
   ═══════════════════════════════════════════════════════════════════ */
function renderTime(templates, master, content, media) {
  const timeline = media.timeline || [];
  const eras = groupBy(timeline, 'era');
  const eraKeys = Object.keys(eras);

  const timeStats = `
      <div class="time-stat">
        <span class="time-stat-value">2,600</span>
        <span class="time-stat-label">Years of history</span>
      </div>
      <div class="time-stat">
        <span class="time-stat-value">${eraKeys.length}</span>
        <span class="time-stat-label">Historical eras</span>
      </div>
      <div class="time-stat">
        <span class="time-stat-value">${timeline.length}</span>
        <span class="time-stat-label">Events documented</span>
      </div>
      <div class="time-stat">
        <span class="time-stat-value">${content.articles.length}</span>
        <span class="time-stat-label">Related articles</span>
      </div>`;

  const eraMeta = {
    ancient:  { icon: '🏛️', title: 'Ancient' },
    medieval: { icon: '🕌', title: 'Medieval' },
    colonial: { icon: '⚔️', title: 'Colonial' },
    modern:   { icon: '🏙️', title: 'Modern' },
    digital:  { icon: '💻', title: 'Digital' },
  };

  const eraFilters = [
    `<button class="time-filter active" data-era="" type="button">
        All <span class="filter-count">${timeline.length}</span>
      </button>`,
    ...eraKeys.map(era => {
      const meta = eraMeta[era] || { icon: '📜', title: era };
      return `<button class="time-filter" data-era="${escapeHtml(era)}" type="button">
        ${meta.icon} ${escapeHtml(meta.title)}
        <span class="filter-count">${eras[era].length}</span>
      </button>`;
    }),
  ].join('\n      ');

  const eraLabels = {
    ancient:  { title: 'Ancient Period',   span: '600 BCE – 1200 CE' },
    medieval: { title: 'Medieval Period',  span: '1200 – 1750 CE' },
    colonial: { title: 'Colonial Period',  span: '1750 – 1947' },
    modern:   { title: 'Modern Period',    span: '1947 – Present' },
    digital:  { title: 'Digital Era',      span: '2020 – Present' },
  };

  const totalEras = eraKeys.length;
  const erasContainer = eraKeys.map((era, i) => {
    const meta = eraLabels[era] || { title: era, span: '' };
    const eraNum = String(i + 1).padStart(2, '0');
    const eraTotal = String(totalEras).padStart(2, '0');

    const events = eras[era]
      .sort((a, b) => (a.sortKey || 0) - (b.sortKey || 0))
      .map(event => {
        const articleLink = event.article
          ? `<a href="/article/${escapeHtml(event.article)}" class="era-event-link">Read full story →</a>`
          : '';
        return `
            <li class="era-event">
              <div class="era-event-year">${escapeHtml(event.year)}</div>
              <div class="era-event-body">
                <h3>${escapeHtml(event.title)}</h3>
                <p>${escapeHtml(event.description)}</p>
                ${articleLink}
              </div>
            </li>`;
      }).join('');

    return `
      <section class="era" data-era="${escapeHtml(era)}" aria-labelledby="era-${escapeHtml(era)}-heading">
        <header class="era-header">
          <span class="era-num">${eraNum} / ${eraTotal}</span>
          <h2 class="era-title" id="era-${escapeHtml(era)}-heading">${escapeHtml(meta.title)}</h2>
          ${meta.span ? `<span class="era-span">${escapeHtml(meta.span)}</span>` : ''}
        </header>
        <ol class="era-events">
          ${events}
        </ol>
      </section>`;
  }).join('\n');

  const pageContent = replaceAll(templates.time, {
    timeTitle: 'Time',
    timeIntro: 'Bandwar across 2,600 years — from the Anga Mahajanapada to the present day.',
    timeStats,
    eraFilters,
    erasContainer,
  });

  return renderLayout(templates, master, {
    slug: 'time',
    title: `Time — ${master.site.shortName} Timeline`,
    description: `2,600 years of Bandwar history — from the Anga Mahajanapada to the present day, across ${eraKeys.length} historical eras.`,
    canonical: buildCanonical('/time', master),
    ogImage: master.seo.ogImage,
    ogType: 'website',
    schema: buildTimeSchema(timeline, master),
    content: pageContent,
    bodyAttr: 'data-page="time"',
    breadcrumb: renderBreadcrumb([
      { name: master.site.shortName, url: '/' },
      { name: 'Time', url: '/time' },
    ], master),
    pageScripts: '<script src="/assets/js/time.js" defer></script>',
  });
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — VISION
   ═══════════════════════════════════════════════════════════════════ */
function renderVision(templates, master, content, vision) {
  const currentYear = new Date().getFullYear();
  const horizonEnd = currentYear + 10;
  const editionLabel = `${currentYear}–${horizonEnd} Edition`;

  const allPriorities = vision.priorities || [];
  const activePriorities = allPriorities.filter(p =>
    p.status === 'pending' || p.status === 'in-progress' || !p.status
  );
  const donePriorities = allPriorities.filter(p =>
    p.status === 'done' && p.completed
  );

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

  const visionStats = `
      <div class="vision-stat">
        <span class="vision-stat-value">${activePriorities.length}</span>
        <span class="vision-stat-label">Active priorities</span>
      </div>
      <div class="vision-stat">
        <span class="vision-stat-value">${allAchievements.length}</span>
        <span class="vision-stat-label">Completed</span>
      </div>
      <div class="vision-stat">
        <span class="vision-stat-value">10</span>
        <span class="vision-stat-label">Year horizon</span>
      </div>
      <div class="vision-stat">
        <span class="vision-stat-value">3</span>
        <span class="vision-stat-label">Phases</span>
      </div>`;

  const manifestoBanner = master.features.manifesto ? `
    <section class="manifesto-banner">
      <div class="container-wide">
        <div class="banner-inner">
          <div class="banner-text">
            <span class="eyebrow">Bandwar ${horizonEnd}</span>
            <h3>A non-political manifesto for the village</h3>
            <p>${editionLabel} · ${activePriorities.length} priorities · ${allAchievements.length} achievements</p>
          </div>
          <div class="banner-actions">
            <a href="/assets/pdfs/Vision-Vikshit-Bandwar.pdf" class="btn btn-primary" download>
              📄 Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>`.trim() : '';

  const needsBlocks = activePriorities.map((need, i) => {
    const num = String(i + 1).padStart(2, '0');
    const total = String(activePriorities.length).padStart(2, '0');
    const statusBadge = need.status === 'in-progress'
      ? '<span class="need-badge need-badge-progress">In Progress</span>'
      : '<span class="need-badge need-badge-pending">Planned</span>';

    const slider = need.present?.photo && need.required?.photo ? `
        <div class="ba-slider" data-ba-slider aria-label="Before and after for ${escapeHtml(need.title)}">
          <picture>
            <source srcset="/${toWebp(need.present.photo)}" type="image/webp">
            <img class="ba-before" src="/${need.present.photo.replace(/^\//, '')}"
                 alt="${escapeHtml(need.present.caption || 'Present: ' + need.title)}"
                 loading="lazy">
          </picture>
          <picture>
            <source srcset="/${toWebp(need.required.photo)}" type="image/webp">
            <img class="ba-after" src="/${need.required.photo.replace(/^\//, '')}"
                 alt="${escapeHtml(need.required.caption || 'Vision: ' + need.title)}"
                 loading="lazy">
          </picture>
          <div class="ba-handle" aria-hidden="true"></div>
          <span class="ba-label ba-before-label">Present</span>
          <span class="ba-label ba-after-label">Vision</span>
        </div>` : '';

    const howFacts = need.how && typeof need.how === 'object' && !Array.isArray(need.how)
      ? Object.entries(need.how).map(([k, v]) => `<li><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</li>`).join('')
      : (Array.isArray(need.how) ? need.how.map(f =>
          `<li><b>${escapeHtml(f.label)}:</b> ${escapeHtml(f.value)}</li>`
        ).join('') : '');

    const articleLink = need.article
      ? `<footer class="need-footer"><a href="/article/${escapeHtml(need.article)}" class="read-link">Read more →</a></footer>`
      : '';

    return `
      <article class="need" id="need-${escapeHtml(need.id)}" data-need-id="${escapeHtml(need.id)}">
        <header class="need-header">
          <div class="need-meta">
            <span class="need-num">${num} / ${total}</span>
            ${statusBadge}
          </div>
          <h3 class="need-title">${escapeHtml(need.title)}</h3>
          ${need.summary ? `<p class="need-summary">${escapeHtml(need.summary)}</p>` : ''}
        </header>
        ${slider}
        <div class="need-details">
          ${need.reality ? `
            <div class="need-detail">
              <span class="need-detail-label">The Reality</span>
              <p>${escapeHtml(need.reality)}</p>
            </div>` : ''}
          ${need.vision ? `
            <div class="need-detail">
              <span class="need-detail-label">What It Should Be</span>
              <p>${escapeHtml(need.vision)}</p>
            </div>` : ''}
          ${howFacts ? `
            <div class="need-detail">
              <span class="need-detail-label">How It Can Happen</span>
              <ul class="need-facts">${howFacts}</ul>
            </div>` : ''}
        </div>
        ${articleLink}
      </article>`;
  }).join('\n');

  const thanksBlocks = allAchievements.map(ach => `
      <article class="achievement">
        ${ach.photo ? `
          <div class="achievement-img">
            <picture>
              <source srcset="/${toWebp(ach.photo)}" type="image/webp">
              <img src="/${ach.photo.replace(/^\//, '')}"
                   alt="${escapeHtml(ach.title)}"
                   loading="lazy"
                   decoding="async">
            </picture>
          </div>` : ''}
        <div class="achievement-body">
          <span class="achievement-badge">Completed ${escapeHtml(ach.completed || '')}</span>
          <h3 class="achievement-title">${escapeHtml(ach.title)}</h3>
          <p class="achievement-desc">${escapeHtml(ach.description || '')}</p>
          ${ach.facts ? `
            <dl class="achievement-facts">
              ${Object.entries(ach.facts).map(([k, v]) => `
                <div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}
            </dl>` : ''}
        </div>
      </article>`).join('\n');

  const roadmapPhases = (vision.roadmap || []).map((phase, i) => {
    const num = String(i + 1).padStart(2, '0');
    const yearStart = currentYear + (phase.phase - 1) * 3;
    const yearEnd = phase.phase === 3 ? currentYear + 9 : yearStart + 2;
    const yearsLabel = `${yearStart}–${yearEnd}`;

    const items = (phase.items || []).map(item => `
        <li class="roadmap-item">
          <span class="roadmap-icon" aria-hidden="true">${item.icon || '•'}</span>
          <div>
            <b>${escapeHtml(item.title)}</b>
            <p>${escapeHtml(item.description || '')}</p>
          </div>
        </li>`).join('');

    return `
      <article class="roadmap-phase" data-phase="${num}">
        <header class="roadmap-header">
          <span class="roadmap-phase-num">Phase ${num} · ${escapeHtml(phase.label || '')}</span>
          <span class="roadmap-phase-years">${yearsLabel}</span>
          <h3 class="roadmap-phase-title">${escapeHtml(phase.title)}</h3>
          ${phase.focus ? `<span class="roadmap-phase-focus">${escapeHtml(phase.focus)}</span>` : ''}
        </header>
        <ul class="roadmap-items">${items}</ul>
      </article>`;
  }).join('\n');

  const archiveYears = [];
  for (let y = currentYear - 1; y >= Math.max(2026, currentYear - 3); y--) {
    archiveYears.push(y);
  }

  const archiveLinks = archiveYears.length
    ? archiveYears.map(year => {
        const end = year + 10;
        return `
          <li class="archive-item">
            <a href="/vision/${year}-${end}" class="archive-link">
              <span class="archive-years">${year}–${end}</span>
              <span class="archive-label">View edition →</span>
            </a>
          </li>`;
      }).join('')
    : `<li class="archive-empty">This is the first edition of the rolling manifesto.</li>`;

  const contributeCTA = `
      <div class="vision-cta">
        <span class="eyebrow">Get Involved</span>
        <h2>Have something to add?</h2>
        <p>Photographs, memories, documents, corrections — every contribution is credited, and nothing is published without consent.</p>
        <div class="vision-cta-actions">
          <a href="/contribute" class="btn btn-primary">Contribute</a>
          <a href="mailto:${escapeHtml(master.contact.email)}" class="btn">Email the archive</a>
        </div>
      </div>`;

  const pageContent = replaceAll(templates.vision, {
    visionTitle: 'Vision',
    horizonEnd: String(horizonEnd),
    currentYear: String(currentYear),
    editionLabel,
    visionIntro: `A non-political plan for the village — ${activePriorities.length} active priorities, ${allAchievements.length} acknowledged achievements, and a rolling 10-year roadmap for ${currentYear}–${horizonEnd}.`,
    visionStats,
    manifestoBanner,
    needsBlocks,
    needsCount: String(activePriorities.length),
    thanksBlocks,
    thanksCount: String(allAchievements.length),
    roadmapPhases,
    archiveLinks,
    contributeCTA,
  });

  return renderLayout(templates, master, {
    slug: 'vision',
    title: `Vision — Bandwar ${horizonEnd}`,
    description: `Bandwar ${horizonEnd} — a non-political development plan with ${activePriorities.length} active priorities and a 10-year roadmap (${currentYear}–${horizonEnd}).`,
    canonical: buildCanonical('/vision', master),
    ogImage: master.seo.ogImage,
    ogType: 'website',
    schema: buildVisionSchema(activePriorities, allAchievements, vision.roadmap, master, currentYear, horizonEnd),
    content: pageContent,
    bodyAttr: `data-page="vision" data-horizon="${horizonEnd}"`,
    breadcrumb: renderBreadcrumb([
      { name: master.site.shortName, url: '/' },
      { name: 'Vision', url: '/vision' },
    ], master),
    pageScripts: '<script src="/assets/js/vision.js" defer></script>',
  });
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — ABOUT
   ═══════════════════════════════════════════════════════════════════ */
function renderAbout(templates, master) {
  const about = master.about;

  const storyBlocks = (about.story || []).map(p => `<p>${escapeHtml(p)}</p>`).join('\n      ');

  const principlesList = (about.principles || []).map(p => `
        <li class="principle-item">
          <span class="principle-icon" aria-hidden="true">${p.icon}</span>
          <div>
            <b class="principle-title">${escapeHtml(p.title)}</b>
            <p class="principle-desc">${escapeHtml(p.description)}</p>
          </div>
        </li>`).join('');

  const sourcesList = (about.sources || []).map(src => {
    const name = src.url
      ? `<a href="${escapeHtml(src.url)}" class="source-name" target="_blank" rel="noopener noreferrer">${escapeHtml(src.name)}</a>`
      : `<span class="source-name">${escapeHtml(src.name)}</span>`;
    return `
        <li class="source-item">
          <span class="source-type">${escapeHtml(src.type)}</span>
          ${name}
          ${src.detail ? `<span class="source-detail">${escapeHtml(src.detail)}</span>` : ''}
        </li>`;
  }).join('');

  const committeeList = (about.committee || []).map(m => `
        <li class="committee-member">
          <span class="committee-role">${escapeHtml(m.role)}</span>
          <span class="committee-name">${escapeHtml(m.name)}</span>
          ${m.link ? `<a href="${escapeHtml(m.link)}" class="committee-link" target="_blank" rel="noopener">↗</a>` : ''}
        </li>`).join('');

  const communityBlock = `
      <p class="community-lead">${escapeHtml(about.community.lead)}</p>
      ${committeeList ? `
        <h3 class="community-subhead">Committee</h3>
        <ul class="committee-list">${committeeList}</ul>` : ''}
      <h3 class="community-subhead">Contributors</h3>
      <p class="community-contributors">${escapeHtml(about.community.contributors)}</p>`;

  const licenseBlock = `
      <div class="license-item">
        <span class="license-badge">Code · ${escapeHtml(master.license.code)}</span>
        <p>The source code is released under the MIT License. Anyone can fork, modify, and adapt it for their own village.</p>
        <a href="${escapeHtml(master.social.github)}/blob/main/LICENSE" class="read-link" target="_blank" rel="noopener">View license →</a>
      </div>
      <div class="license-item">
        <span class="license-badge">Content · ${escapeHtml(master.license.content)}</span>
        <p>Articles, photographs, and documents are the property of the Bandwar Village Community. Not for commercial use without permission.</p>
        <a href="mailto:${escapeHtml(master.contact.email)}?subject=Content license enquiry" class="read-link">Request permission →</a>
      </div>`;

  const contactBlock = `
      <dl class="contact-list">
        <div class="contact-item">
          <dt>Email</dt>
          <dd><a href="mailto:${escapeHtml(master.contact.email)}">${escapeHtml(master.contact.email)}</a></dd>
        </div>
        <div class="contact-item">
          <dt>In Person</dt>
          <dd>Gram Panchayat Office, ${escapeHtml(master.village.name)}</dd>
        </div>
        <div class="contact-item">
          <dt>Post</dt>
          <dd>${escapeHtml(master.contact.address)}</dd>
        </div>
        <div class="contact-item">
          <dt>Coordinates</dt>
          <dd>${master.village.coordinates.lat}°N, ${master.village.coordinates.lng}°E</dd>
        </div>
        ${master.social.github ? `
          <div class="contact-item">
            <dt>GitHub</dt>
            <dd><a href="${escapeHtml(master.social.github)}" target="_blank" rel="noopener">${escapeHtml(master.social.github.replace('https://', ''))}</a></dd>
          </div>` : ''}
      </dl>`;

  const pageContent = replaceAll(templates.about, {
    aboutTitle: 'About',
    aboutIntro: escapeHtml(about.intro),
    storyBlocks,
    principlesList,
    sourcesList,
    communityBlock,
    licenseBlock,
    contactBlock,
  });

  return renderLayout(templates, master, {
    slug: 'about',
    title: `About — ${master.site.shortName} Archive`,
    description: about.intro,
    canonical: buildCanonical('/about', master),
    ogImage: master.seo.ogImage,
    ogType: 'website',
    schema: buildAboutSchema(master),
    content: pageContent,
    bodyAttr: 'data-page="about"',
    breadcrumb: renderBreadcrumb([
      { name: master.site.shortName, url: '/' },
      { name: 'About', url: '/about' },
    ], master),
  });
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE RENDERER — 404
   ═══════════════════════════════════════════════════════════════════ */
function render404(templates, master) {
  const pageContent = `
      <div class="error-page container-text">
        <span class="error-code">404</span>
        <h1 class="error-title">Page not found</h1>
        <p class="error-message">
          The page you're looking for isn't here.
          It may have been moved, or the link may be incorrect.
        </p>
        <div class="error-actions">
          <a href="/" class="btn btn-primary">Return to homepage</a>
          <a href="/section" class="btn">Browse the archive</a>
        </div>
      </div>`;

  return renderLayout(templates, master, {
    slug: '404',
    title: `Page not found — ${master.site.shortName}`,
    description: 'The page you are looking for could not be found.',
    canonical: buildCanonical('/404', master),
    ogImage: master.seo.ogImage,
    ogType: 'website',
    robots: 'noindex, follow',
    schema: null,
    content: pageContent,
    bodyAttr: 'data-page="404"',
  });
}

/* ═══════════════════════════════════════════════════════════════════
   ASSET COPYING
   ═══════════════════════════════════════════════════════════════════ */
function copyAssets() {
  console.log(`${COLORS.gray}  Copying assets...${COLORS.reset}`);

  copyFile('css/theme.css', 'assets/css/theme.css');
  copyFile('css/style.css', 'assets/css/style.css');

  const jsFiles = ['core.js', 'articles.js', 'sections.js', 'places.js', 'time.js', 'vision.js'];
  jsFiles.forEach(f => {
    if (fs.existsSync(path.join(ROOT, 'js', f))) {
      copyFile(`js/${f}`, `assets/js/${f}`);
    }
  });

  if (fs.existsSync(path.join(ROOT, 'vendor/leaflet'))) {
    copyDir('vendor/leaflet', 'assets/vendor/leaflet');
  }

  if (fs.existsSync(path.join(ROOT, 'images'))) {
    copyDir('images', 'images', (rel) => {
      if (rel.includes('_source/')) return false;
      return true;
    });
  }

  if (fs.existsSync(path.join(ROOT, 'assets/pdfs'))) {
    copyDir('assets/pdfs', 'assets/pdfs');
  }

  const staticFiles = [
    'robots.txt',
    'manifest.json',
    'sw.js',
    'humans.txt',
  ];

  staticFiles.forEach(f => {
    if (fs.existsSync(path.join(ROOT, f))) {
      copyFile(f, f);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   STATS TRACKING
   ═══════════════════════════════════════════════════════════════════ */
const stats = {
  startTime: Date.now(),
  pages: {
    home: 0, article: 0, section: 0, place: 0,
    time: 0, vision: 0, about: 0, error: 0,
  },
  total: 0,
  warnings: [],
};

function trackPage(type) {
  stats.pages[type] = (stats.pages[type] || 0) + 1;
  stats.total++;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */
function main() {
  console.log('');
  console.log(`${COLORS.blue}${COLORS.bold}▶ Bandwar Build${COLORS.reset}`);
  console.log(`${COLORS.gray}  Root: ${ROOT}${COLORS.reset}`);
  console.log('');

  if (CLEAN) {
    cleanDist();
  } else {
    fs.mkdirSync(DIST, { recursive: true });
  }

  const data = loadAllData();
  const templates = loadAllTemplates();

  const { master, content, vision, media, categories, articles } = data;

  if (master.home?.stats) {
    master.home.stats = master.home.stats.map(stat => {
      if (stat.value === '{{articleCount}}') {
        return { ...stat, value: String(articles.length) };
      }
      return stat;
    });
  }

  console.log('');
  console.log(`${COLORS.bold}Rendering pages...${COLORS.reset}`);

  writeFile('index.html', renderHome(templates, master, content));
  trackPage('home');
  console.log(`  ${COLORS.green}✓${COLORS.reset} index.html`);

  articles.forEach(article => {
    const html = renderArticle(templates, master, content, article);
    writeFile(`article/${article.id}.html`, html);
    trackPage('article');
  });
  console.log(`  ${COLORS.green}✓${COLORS.reset} article/*.html (${articles.length} pages)`);

  const allSection = renderSection(templates, master, content, null);
  writeFile(allSection.path, allSection.html);
  trackPage('section');

  categories.forEach(category => {
    const sec = renderSection(templates, master, content, category);
    writeFile(sec.path, sec.html);
    trackPage('section');
  });
  console.log(`  ${COLORS.green}✓${COLORS.reset} section/*.html (${categories.length + 1} pages)`);

  writeFile('place.html', renderPlace(templates, master, content, media));
  trackPage('place');
  console.log(`  ${COLORS.green}✓${COLORS.reset} place.html`);

  writeFile('time.html', renderTime(templates, master, content, media));
  trackPage('time');
  console.log(`  ${COLORS.green}✓${COLORS.reset} time.html`);

  writeFile('vision.html', renderVision(templates, master, content, vision));
  trackPage('vision');
  console.log(`  ${COLORS.green}✓${COLORS.reset} vision.html`);

  writeFile('about.html', renderAbout(templates, master));
  trackPage('about');
  console.log(`  ${COLORS.green}✓${COLORS.reset} about.html`);

  writeFile('404.html', render404(templates, master));
  trackPage('error');
  console.log(`  ${COLORS.green}✓${COLORS.reset} 404.html`);

  console.log('');
  copyAssets();

  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(2);

  console.log('');
  console.log(`${COLORS.bold}═══ Build Summary ═══${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓${COLORS.reset} Total pages: ${COLORS.bold}${stats.total}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Home:      ${stats.pages.home}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Articles:  ${stats.pages.article}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Sections:  ${stats.pages.section}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Place:     ${stats.pages.place}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Time:      ${stats.pages.time}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Vision:    ${stats.pages.vision}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  About:     ${stats.pages.about}${COLORS.reset}`);
  console.log(`  ${COLORS.gray}  Error:     ${stats.pages.error}${COLORS.reset}`);
  console.log('');
  console.log(`  ${COLORS.blue}⏱  Built in ${elapsed}s${COLORS.reset}`);
  console.log(`  ${COLORS.blue}📁 Output: ${DIST}${COLORS.reset}`);
  console.log('');
  console.log(`${COLORS.green}${COLORS.bold}Build complete.${COLORS.reset}`);
  console.log('');
}

/* ═══════════════════════════════════════════════════════════════════
   WATCH MODE (dev)
   ═══════════════════════════════════════════════════════════════════ */
if (WATCH) {
  const chokidar = (() => {
    try { return require('chokidar'); } catch { return null; }
  })();

  if (chokidar) {
    console.log(`${COLORS.blue}👁  Watching for changes...${COLORS.reset}`);
    const watcher = chokidar.watch([
      'data/**/*.json',
      'templates/**/*.html',
      'css/**/*.css',
      'js/**/*.js',
    ], {
      cwd: ROOT,
      ignoreInitial: true,
    });

    watcher.on('all', (event, path) => {
      console.log(`\n${COLORS.yellow}↻ ${event}: ${path}${COLORS.reset}`);
      try {
        main();
      } catch (err) {
        console.error(`${COLORS.red}Build failed: ${err.message}${COLORS.reset}`);
      }
    });

    main();
  } else {
    console.log(`${COLORS.yellow}Watch mode requires chokidar.${COLORS.reset}`);
    main();
  }
} else {
  main();
}