/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — VALIDATE (Relaxed)
   Informational checks · Never blocks build
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const results = {
  errors: [],
  warnings: [],
  passed: 0,
};

function error(rule, file, message) {
  results.errors.push({ rule, file, message });
}

function warning(rule, file, message) {
  results.warnings.push({ rule, file, message });
}

function pass() {
  results.passed++;
}

/* ─── LOAD MASTER ─── */
let master;
try {
  master = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/master.json'), 'utf8'));
} catch (err) {
  console.error(`${COLORS.red}✗ Cannot load master.json: ${err.message}${COLORS.reset}`);
  process.exit(1);
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 1: Required files exist (only truly essential)
   ═══════════════════════════════════════════════════════════════════ */
function validateRequiredFiles() {
  const required = [
    'data/master.json',
    'data/content.json',
    'data/vision.json',
    'data/media.json',
    'css/theme.css',
    'css/style.css',
    'js/core.js',
    'scripts/build.cjs',
  ];

  const missing = required.filter(f => !fs.existsSync(path.join(ROOT, f)));

  if (missing.length === 0) {
    pass();
  } else {
    missing.forEach(f => {
      error('requiredFiles', f, 'Essential file missing');
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 2: Master has required fields
   ═══════════════════════════════════════════════════════════════════ */
function validateMasterFields() {
  const required = [
    'site.name',
    'site.url',
    'site.description',
    'village.name',
    'brand.colors.primary',
    'brand.fonts.display',
  ];

  function getPath(obj, pathStr) {
    return pathStr.split('.').reduce((acc, key) => acc && acc[key], obj);
  }

  const missing = required.filter(field => {
    const value = getPath(master, field);
    return value === undefined || value === null || value === '';
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
   RULE 3: Content JSON is valid (informational)
   ═══════════════════════════════════════════════════════════════════ */
function validateContent() {
  let content;
  try {
    content = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/content.json'), 'utf8'));
  } catch (err) {
    error('content', 'data/content.json', `Parse error: ${err.message}`);
    return;
  }

  const articles = content.articles || [];
  const categories = content.categories || [];

  if (articles.length === 0) {
    warning('content', 'data/content.json', 'No articles found');
  }

  if (categories.length === 0) {
    warning('content', 'data/content.json', 'No categories found');
  }

  // Check each article has minimal fields
  articles.forEach(article => {
    if (!article.id) {
      error('content', 'data/content.json', `Article missing id`);
    }
    if (!article.title) {
      warning('content', 'data/content.json', `Article "${article.id}" missing title`);
    }
    if (!article.summary) {
      warning('content', 'data/content.json', `Article "${article.id}" missing summary`);
    }
  });

  pass();
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 4: Image paths resolve (warning only)
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
      `${missing.length} image path(s) not found (will 404 on live site)`);
    missing.slice(0, 5).forEach(msg => {
      warning('imagePaths', '', msg);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   RULE 5: No inline CSS in templates (warning only)
   ═══════════════════════════════════════════════════════════════════ */
function validateNoInlineCSS() {
  const templatesDir = path.join(ROOT, 'templates');
  if (!fs.existsSync(templatesDir)) return;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        return;
      }
      if (!entry.name.endsWith('.html')) return;
      const content = fs.readFileSync(full, 'utf8');
      const styles = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
      if (styles.length > 0) {
        const rel = path.relative(ROOT, full);
        warning('inlineCSS', rel, `${styles.length} inline <style> block(s)`);
      }
    });
  }

  walk(templatesDir);
  pass();
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
    results.errors.slice(0, 20).forEach(e => {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${COLORS.gray}${e.file}${COLORS.reset} — ${e.message}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log(`${COLORS.yellow}${COLORS.bold}⚠ Warnings (${results.warnings.length})${COLORS.reset}`);
    results.warnings.slice(0, 20).forEach(w => {
      console.log(`  ${COLORS.yellow}⚠${COLORS.reset} ${COLORS.gray}${w.file}${COLORS.reset} — ${w.message}`);
    });
    if (results.warnings.length > 20) {
      console.log(`  ${COLORS.gray}... and ${results.warnings.length - 20} more${COLORS.reset}`);
    }
    console.log('');
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
  validateContent();
  validateImagePaths();
  validateNoInlineCSS();

  printReport();

  // ⚠️ NEVER fail — informational only
  console.log(`${COLORS.green}${COLORS.bold}Validation complete (informational).${COLORS.reset}`);
  console.log('');
  process.exit(0);
}

main();