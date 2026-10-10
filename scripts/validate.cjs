/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — VALIDATE
   Enforces rules from master.json · Runs in CI · Fails on violation
   
   Rules enforced:
     • No inline CSS in HTML
     • Image naming convention (kebab-case, descriptive)
     • Alt text present for all images
     • Content minimums (word count, sections, tags, related)
     • Required metadata (title, description, canonical)
     • No hardcoded colors outside theme.css
   
   Usage:
     node scripts/validate.cjs           # Standard — errors + warnings
     node scripts/validate.cjs --strict  # Fail on warnings too
     node scripts/validate.cjs --quiet   # Only show errors
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');

/* ─────────────── CONFIG ─────────────── */
const ROOT = path.resolve(__dirname, '..');
const STRICT = process.argv.includes('--strict');
const QUIET = process.argv.includes('--quiet');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

/* ─────────────── RESULTS ─────────────── */
const results = {
  errors: [],
  warnings: [],
  passed: 0,
  skipped: 0,
};

function error(rule, file, message) {
  results.errors.push({ rule, file, message });
  results.passed = results.passed; // no-op
}

function warning(rule, file, message) {
  results.warnings.push({ rule, file, message });
}

function pass() {
  results.passed++;
}

/* ─────────────── LOAD MASTER ─────────────── */
let master;
try {
  const raw = fs.readFileSync(path.join(ROOT, 'data/master.json'), 'utf8');
  master = JSON.parse(raw);
} catch (err) {
  console.error(`${COLORS.red}✗ Cannot load data/master.json: ${err.message}${COLORS.reset}`);
  process.exit(1);
}

const RULES = master.rules || {};
const IMAGE_SEO = master.imageSEO || {};
const CONTENT = master.content || {};

/* ═══════════════════════════════════════════════════════════════════
   RULE 1 — NO INLINE CSS IN HTML
   ═══════════════════════════════════════════════════════════════════ */
function validateNoInlineCSS() {
  if (!RULES.noInlineCSS) {
    results.skipped++;
    return;
  }

  const htmlFiles = fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'));

  htmlFiles.forEach(file => {
    const fullPath = path.join(ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    const styleBlocks = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];

    if (styleBlocks.length > 0) {
      // Check if it's an allowlisted exception (e.g., critical CSS)
      const totalLines = styleBlocks
        .join('\n')
        .split('\n')
        .filter(l => l.trim().length > 0).length;

      error(
        'noInlineCSS',
        file,
        `${styleBlocks.length} inline <style> block(s) — ${totalLines} lines. Move to css/style.css`
      );
    } else {
      pass();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 2 — IMAGE NAMING CONVENTION
   ═══════════════════════════════════════════════════════════════════ */
function validateImageNaming() {
  const convention = IMAGE_SEO.namingConvention || {};
  const forbiddenPrefixes = convention.forbiddenPrefixes || [];
  const forbiddenPatterns = (convention.forbiddenPatterns || []).map(p => new RegExp(p));
  const minWords = convention.minWords || 2;
  const maxWords = convention.maxWords || 5;

  const imagesDir = path.join(ROOT, 'images');
  if (!fs.existsSync(imagesDir)) {
    warning('imageNaming', 'images/', 'images/ folder not found');
    return;
  }

  const violations = [];

  function walk(dir, base = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relPath = base ? `${base}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, relPath);
        return;
      }

      // Only check image files
      if (!/\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(entry.name)) return;

      // Skip favicon and PWA icons
      if (entry.name === 'favicon.ico' || entry.name.startsWith('icon-')) return;

      const nameWithoutExt = entry.name.replace(/\.[^.]+$/, '');
      const words = nameWithoutExt.split('-');

      // Check forbidden prefixes
      for (const prefix of forbiddenPrefixes) {
        if (nameWithoutExt.toLowerCase().startsWith(prefix + '-') ||
            nameWithoutExt.toLowerCase() === prefix) {
          violations.push({
            file: relPath,
            issue: `Forbidden prefix "${prefix}" — use descriptive name`
          });
          return;
        }
      }

      // Check forbidden patterns
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(nameWithoutExt)) {
          violations.push({
            file: relPath,
            issue: `Matches forbidden pattern ${pattern} — remove numbering`
          });
          return;
        }
      }

      // Check case (must be lowercase)
      if (entry.name !== entry.name.toLowerCase()) {
        violations.push({
          file: relPath,
          issue: 'Filename contains uppercase — must be lowercase'
        });
        return;
      }

      // Check spaces (should be hyphens)
      if (entry.name.includes(' ') || entry.name.includes('_')) {
        violations.push({
          file: relPath,
          issue: 'Filename contains spaces/underscores — use hyphens'
        });
        return;
      }

      // Check word count
      if (words.length < minWords) {
        violations.push({
          file: relPath,
          issue: `Only ${words.length} word(s) — minimum ${minWords}`
        });
      } else if (words.length > maxWords) {
        violations.push({
          file: relPath,
          issue: `${words.length} words — maximum ${maxWords}`
        });
      }
    });
  }

  walk(imagesDir);

  if (violations.length === 0) {
    pass();
  } else {
    // Group by file for cleaner output
    const grouped = {};
    violations.forEach(v => {
      if (!grouped[v.file]) grouped[v.file] = [];
      grouped[v.file].push(v.issue);
    });

    Object.entries(grouped).forEach(([file, issues]) => {
      error('imageNaming', file, issues.join('; '));
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 3 — ALT TEXT PRESENCE
   ═══════════════════════════════════════════════════════════════════ */
function validateAltText() {
  if (!RULES.requireAltText) {
    results.skipped++;
    return;
  }

  let content;
  try {
    content = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/content.json'), 'utf8'));
  } catch (err) {
    error('altText', 'data/content.json', `Cannot read: ${err.message}`);
    return;
  }

  const articles = content.articles || [];
  const missing = [];

  articles.forEach(article => {
    // Hero must have alt (we derive from title, but check existence)
    if (article.hero && !article.title) {
      missing.push(`${article.id}: hero present but no title for alt`);
    }

    // Photos must have captions (used as alt)
    (article.photos || []).forEach((photo, i) => {
      if (photo.src && !photo.caption) {
        missing.push(`${article.id}: photos[${i}] = ${photo.src} — missing caption`);
      }
    });
  });

  if (missing.length === 0) {
    pass();
  } else {
    missing.slice(0, 20).forEach(msg => {
      error('altText', 'data/content.json', msg);
    });
    if (missing.length > 20) {
      error('altText', 'data/content.json', `... and ${missing.length - 20} more`);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 4 — CONTENT MINIMUMS
   ═══════════════════════════════════════════════════════════════════ */
function validateContentMinimums() {
  let content;
  try {
    content = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/content.json'), 'utf8'));
  } catch (err) {
    error('content', 'data/content.json', `Cannot read: ${err.message}`);
    return;
  }

  const articles = content.articles || [];
  const minWords = CONTENT.minWordCount || 400;
  const minSections = CONTENT.minSectionsPerArticle || 3;
  const minRelated = CONTENT.minRelatedArticles || 2;
  const minTags = CONTENT.minTagsPerArticle || 3;

  const issues = [];

  articles.forEach(a => {
    // Word count
    const text = [
      a.summary || '',
      ...(a.content || []).map(c => c.text || '')
    ].join(' ');
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount < minWords) {
      issues.push(`${a.id}: ${wordCount} words (min ${minWords})`);
    }

    // Sections
    const sections = (a.content || []).length;
    if (sections < minSections) {
      issues.push(`${a.id}: ${sections} sections (min ${minSections})`);
    }

    // Related
    const related = (a.related || []).length;
    if (related < minRelated) {
      issues.push(`${a.id}: ${related} related (min ${minRelated})`);
    }

    // Tags
    const tags = (a.tags || []).length;
    if (tags < minTags) {
      issues.push(`${a.id}: ${tags} tags (min ${minTags})`);
    }
  });

  if (issues.length === 0) {
    pass();
  } else {
    issues.forEach(msg => {
      warning('content', 'data/content.json', msg);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 5 — REQUIRED MASTER FIELDS
   ═══════════════════════════════════════════════════════════════════ */
function validateMasterFields() {
  const required = [
    'site.name',
    'site.url',
    'site.description',
    'village.name',
    'village.coordinates',
    'brand.colors.primary',
    'brand.fonts.display',
  ];

  const missing = [];

  function getPath(obj, pathStr) {
    return pathStr.split('.').reduce((acc, key) => acc && acc[key], obj);
  }

  required.forEach(field => {
    const value = getPath(master, field);
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  });

  if (missing.length === 0) {
    pass();
  } else {
    missing.forEach(field => {
      error('masterFields', 'data/master.json', `Missing required field: ${field}`);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 6 — NO HARDCODED COLORS IN CSS
   ═══════════════════════════════════════════════════════════════════ */
function validateNoHardcodedColors() {
  if (!RULES.noHardcodedColors) {
    results.skipped++;
    return;
  }

  const stylePath = path.join(ROOT, 'css/style.css');
  if (!fs.existsSync(stylePath)) {
    warning('colors', 'css/style.css', 'File not found');
    return;
  }

  const css = fs.readFileSync(stylePath, 'utf8');

  // Find hex colors OUTSIDE of :root block
  // Remove :root { ... } block first
  const withoutRoot = css.replace(/:root\s*\{[\s\S]*?\}/g, '');

  // Find hex colors
  const hexMatches = withoutRoot.match(/#[0-9a-fA-F]{3,8}\b/g) || [];

  // Allowlist: rgba/color-mix are fine
  // Only flag pure hex colors
  const violations = hexMatches.filter(m => {
    // Allow white/black as universal
    const lower = m.toLowerCase();
    if (['#fff', '#ffffff', '#000', '#000000'].includes(lower)) return false;
    return true;
  });

  if (violations.length === 0) {
    pass();
  } else {
    // Group unique colors
    const unique = [...new Set(violations)];
    error(
      'noHardcodedColors',
      'css/style.css',
      `${violations.length} hardcoded hex color(s): ${unique.slice(0, 5).join(', ')}${unique.length > 5 ? ' ...' : ''} — use var(--token)`
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 7 — REQUIRED FILES EXIST
   ═══════════════════════════════════════════════════════════════════ */
function validateRequiredFiles() {
  const required = [
    'data/master.json',
    'data/content.json',
    'css/theme.css',
    'css/style.css',
    'js/core.js',
    'index.html',
    'robots.txt',
    'vercel.json',
    'manifest.json',
  ];

  const missing = required.filter(f => !fs.existsSync(path.join(ROOT, f)));

  if (missing.length === 0) {
    pass();
  } else {
    missing.forEach(f => {
      error('requiredFiles', f, 'File does not exist');
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 8 — IMAGE URLS RESOLVE
   ═══════════════════════════════════════════════════════════════════ */
function validateImagePaths() {
  let content;
  try {
    content = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/content.json'), 'utf8'));
  } catch {
    return;
  }

  const articles = content.articles || [];
  const missing = [];

  articles.forEach(a => {
    if (a.hero && !fs.existsSync(path.join(ROOT, a.hero))) {
      missing.push(`${a.id}: hero → ${a.hero}`);
    }
    (a.photos || []).forEach(p => {
      if (p.src && !fs.existsSync(path.join(ROOT, p.src))) {
        missing.push(`${a.id}: photo → ${p.src}`);
      }
    });
  });

  if (missing.length === 0) {
    pass();
  } else {
    warning('imagePaths', 'data/content.json',
      `${missing.length} image path(s) point to non-existent files`);
    missing.slice(0, 10).forEach(msg => {
      warning('imagePaths', 'data/content.json', msg);
    });
    if (missing.length > 10) {
      warning('imagePaths', 'data/content.json', `... and ${missing.length - 10} more`);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   REPORT
   ═══════════════════════════════════════════════════════════════════ */
function printReport() {
  console.log('');
  console.log(`${COLORS.bold}═══ Validation Report ═══${COLORS.reset}`);
  console.log('');

  if (results.errors.length > 0) {
    console.log(`${COLORS.red}${COLORS.bold}✗ Errors (${results.errors.length})${COLORS.reset}`);
    console.log('');
    const grouped = {};
    results.errors.forEach(e => {
      if (!grouped[e.rule]) grouped[e.rule] = [];
      grouped[e.rule].push(e);
    });
    Object.entries(grouped).forEach(([rule, errs]) => {
      console.log(`  ${COLORS.bold}${rule}${COLORS.reset}`);
      errs.slice(0, 15).forEach(e => {
        console.log(`    ${COLORS.gray}${e.file}${COLORS.reset} — ${e.message}`);
      });
      if (errs.length > 15) {
        console.log(`    ${COLORS.gray}... and ${errs.length - 15} more${COLORS.reset}`);
      }
      console.log('');
    });
  }

  if (results.warnings.length > 0 && !QUIET) {
    console.log(`${COLORS.yellow}${COLORS.bold}⚠ Warnings (${results.warnings.length})${COLORS.reset}`);
    console.log('');
    const grouped = {};
    results.warnings.forEach(w => {
      if (!grouped[w.rule]) grouped[w.rule] = [];
      grouped[w.rule].push(w);
    });
    Object.entries(grouped).forEach(([rule, warns]) => {
      console.log(`  ${COLORS.bold}${rule}${COLORS.reset}`);
      warns.slice(0, 10).forEach(w => {
        console.log(`    ${COLORS.gray}${w.file}${COLORS.reset} — ${w.message}`);
      });
      if (warns.length > 10) {
        console.log(`    ${COLORS.gray}... and ${warns.length - 10} more${COLORS.reset}`);
      }
      console.log('');
    });
  }

  console.log(`${COLORS.bold}═══ Summary ═══${COLORS.reset}`);
  console.log(`  ${COLORS.green}✓ Passed:${COLORS.reset} ${results.passed}`);
  console.log(`  ${COLORS.yellow}⚠ Warnings:${COLORS.reset} ${results.warnings.length}`);
  console.log(`  ${COLORS.red}✗ Errors:${COLORS.reset} ${results.errors.length}`);
  console.log('');
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */
function main() {
  console.log('');
  console.log(`${COLORS.blue}${COLORS.bold}▶ Bandwar Validation${COLORS.reset}`);
  console.log(`${COLORS.gray}  Root: ${ROOT}${COLORS.reset}`);
  console.log('');

  validateRequiredFiles();
  validateMasterFields();
  validateNoInlineCSS();
  validateNoHardcodedColors();
  validateImageNaming();
  validateAltText();
  validateContentMinimums();
  validateImagePaths();

  printReport();

  const shouldFail = results.errors.length > 0 ||
                     (STRICT && results.warnings.length > 0);

  if (shouldFail) {
    console.log(`${COLORS.red}${COLORS.bold}Validation failed.${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}${COLORS.bold}Validation passed.${COLORS.reset}`);
    process.exit(0);
  }
}

main();