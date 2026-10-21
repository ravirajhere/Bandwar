/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — IMAGE OPTIMIZER (v2.0 with Auto-Cleanup)
   Converts images to WebP + AVIF, generates responsive sizes,
   cleans up orphaned files, and updates all data JSON files.
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* ─────────────── CONFIG ─────────────── */
const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'images');
const CACHE_FILE = path.join(ROOT, '.image-cache.json');
const IMAGE_EXTENSIONS = /\.(jpe?g|png)$/i;
const SKIP_FOLDERS = ['icons'];  // PWA icons ko skip karo

const ARGS = process.argv.slice(2);
const CLEAN = ARGS.includes('--clean');
const DRY_RUN = ARGS.includes('--dry-run');
const VERBOSE = ARGS.includes('--verbose');
const ONLY_WEBP = ARGS.includes('--only-webp');
const ONLY_AVIF = ARGS.includes('--only-avif');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

/* ─────────────── SHARP CHECK ─────────────── */
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('');
  console.error(`${COLORS.red}${COLORS.bold}✗ sharp is not installed${COLORS.reset}`);
  console.error(`\n  Install it first:\n    ${COLORS.blue}npm install --save-dev sharp${COLORS.reset}\n`);
  process.exit(1);
}

/* ─────────────── LOAD MASTER ─────────────── */
function loadMaster() {
  const full = path.join(ROOT, 'data/master.json');
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    console.error(`${COLORS.red}✗ Failed to load master.json: ${err.message}${COLORS.reset}`);
    process.exit(1);
  }
}

const master = loadMaster();
const IMAGE_SEO = master.imageSEO || {};

const CONFIG = {
  widths: IMAGE_SEO.responsiveWidths || [400, 800, 1200, 1600],
  jpgQuality: IMAGE_SEO.defaultQuality || 82,
  webpQuality: IMAGE_SEO.webpQuality || 78,
  avifQuality: IMAGE_SEO.avifQuality || 65,
  generateWebP: !ONLY_AVIF && (IMAGE_SEO.generateWebP !== false),
  generateAVIF: !ONLY_WEBP && (IMAGE_SEO.generateAVIF !== false),
  generateResponsive: IMAGE_SEO.generateResponsive !== false,
};

/* ─────────────── CACHE ─────────────── */
let cache = {
  version: 1,
  files: {},  // { 'images/foo.jpg': { hash, mtime, outputs: [...] } }
};

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (!cache.files) cache.files = {};
    }
  } catch (err) {
    console.warn(`${COLORS.yellow}⚠ Cache corrupted, starting fresh${COLORS.reset}`);
    cache = { version: 1, files: {} };
  }
}

function saveCache() {
  if (DRY_RUN) return;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

function fileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function isCached(relPath, hash) {
  const entry = cache.files[relPath];
  if (!entry) return false;
  return entry.hash === hash && entry.outputs.every(f => 
    fs.existsSync(path.join(ROOT, f))
  );
}

/* ✅ NEW: Auto-delete orphaned generated images */
function cleanupOrphanedImages(dir) {
  let deletedCount = 0;
  if (!fs.existsSync(dir)) return 0;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      deletedCount += cleanupOrphanedImages(fullPath);
      return;
    }

    const ext = path.extname(entry.name).toLowerCase();
    
    // Hum sirf generated files check kar rahe hain
    const isGenerated = ext === '.webp' || ext === '.avif' || /-\d+\.(jpe?g|png)$/i.test(entry.name);
    
    if (isGenerated) {
      // Original base name nikaalo (e.g., bandwar-hero-400.webp -> bandwar-hero)
      let baseName = entry.name.replace(/-\d+\.(webp|avif|jpe?g|png)$/i, ''); 
      baseName = baseName.replace(/\.(webp|avif|jpe?g|png)$/i, ''); 

      // Check karo ki kya original source exist karta hai?
      const hasJpg = fs.existsSync(path.join(dir, `${baseName}.jpg`)) || fs.existsSync(path.join(dir, `${baseName}.JPG`));
      const hasPng = fs.existsSync(path.join(dir, `${baseName}.png`)) || fs.existsSync(path.join(dir, `${baseName}.PNG`));
      const hasJpeg = fs.existsSync(path.join(dir, `${baseName}.jpeg`)) || fs.existsSync(path.join(dir, `${baseName}.JPEG`));

      // Agar original source nahi hai, toh delete kar do
      if (!hasJpg && !hasPng && !hasJpeg) {
        if (!DRY_RUN) fs.unlinkSync(fullPath);
        if (VERBOSE) console.log(`  ${COLORS.yellow}🗑️  Deleted orphaned: ${entry.name}${COLORS.reset}`);
        deletedCount++;
      }
    }
  });
  
  return deletedCount;
}

/* ✅ NEW: Remove deleted files from cache */
function pruneCache() {
  let pruned = 0;
  Object.keys(cache.files).forEach(relPath => {
    if (!fs.existsSync(path.join(ROOT, relPath))) {
      delete cache.files[relPath];
      pruned++;
    }
  });
  return pruned;
}

/* ─────────────── SCAN IMAGES ─────────────── */
function scanImages() {
  const results = [];
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`${COLORS.red}✗ images/ folder not found${COLORS.reset}`);
    process.exit(1);
  }

  function walk(dir, base = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(entry => {
      const full = path.join(dir, entry.name);
      const rel = base ? `${base}/${entry.name}` : entry.name;
      const relFromRoot = `images/${rel}`;

      if (entry.isDirectory()) {
        if (SKIP_FOLDERS.includes(entry.name)) return;
        if (entry.name.startsWith('_')) return;
        walk(full, rel);
        return;
      }

      // Only process JPG/PNG, skip already-optimized variants
      if (!IMAGE_EXTENSIONS.test(entry.name)) return;
      if (/-\d+\.(jpe?g|png)$/i.test(entry.name)) return;

      results.push({
        absPath: full,
        relPath: relFromRoot,
        dir: path.dirname(full),
        name: entry.name.replace(IMAGE_EXTENSIONS, ''),
      });
    });
  }

  walk(IMAGES_DIR);
  return results;
}

/* ─────────────── OPTIMIZE SINGLE IMAGE ─────────────── */
async function optimizeImage(image, stats) {
  const { absPath, relPath, dir, name } = image;

  const hash = fileHash(absPath);
  if (isCached(relPath, hash)) {
    stats.skipped++;
    return;
  }

  const originalSize = fs.statSync(absPath).size;
  stats.originalBytes += originalSize;
  const outputs = [];

  try {
    const metadata = await sharp(absPath).metadata();
    const { width: origWidth = 0 } = metadata;

    // 1. WEBP
    if (CONFIG.generateWebP) {
      const outPath = path.join(dir, `${name}.webp`);
      const relOut = `${path.dirname(relPath)}/${name}.webp`;
      if (!DRY_RUN) await sharp(absPath).webp({ quality: CONFIG.webpQuality, effort: 4 }).toFile(outPath);
      
      const size = DRY_RUN ? 0 : fs.statSync(outPath).size;
      outputs.push(relOut);
      stats.webpCount++;
      stats.webpSaved += (originalSize - size);
    }

    // 2. AVIF
    if (CONFIG.generateAVIF) {
      const outPath = path.join(dir, `${name}.avif`);
      const relOut = `${path.dirname(relPath)}/${name}.avif`;
      if (!DRY_RUN) await sharp(absPath).avif({ quality: CONFIG.avifQuality, effort: 4 }).toFile(outPath);
      
      const size = DRY_RUN ? 0 : fs.statSync(outPath).size;
      outputs.push(relOut);
      stats.avifCount++;
      stats.avifSaved += (originalSize - size);
    }

    // 3. RESPONSIVE VARIANTS
    if (CONFIG.generateResponsive && origWidth > 0) {
      for (const w of CONFIG.widths) {
        if (w >= origWidth) continue;
        const resizedName = `${name}-${w}`;
        
        // JPG
        const jpgPath = path.join(dir, `${resizedName}.jpg`);
        if (!DRY_RUN) await sharp(absPath).resize({ width: w }).jpeg({ quality: CONFIG.jpgQuality, progressive: true, mozjpeg: true }).toFile(jpgPath);
        outputs.push(`${path.dirname(relPath)}/${resizedName}.jpg`);

        // WebP
        if (CONFIG.generateWebP) {
          const webpPath = path.join(dir, `${resizedName}.webp`);
          if (!DRY_RUN) await sharp(absPath).resize({ width: w }).webp({ quality: CONFIG.webpQuality, effort: 4 }).toFile(webpPath);
          outputs.push(`${path.dirname(relPath)}/${resizedName}.webp`);
        }

        // AVIF
        if (CONFIG.generateAVIF) {
          const avifPath = path.join(dir, `${resizedName}.avif`);
          if (!DRY_RUN) await sharp(absPath).resize({ width: w }).avif({ quality: CONFIG.avifQuality, effort: 4 }).toFile(avifPath);
          outputs.push(`${path.dirname(relPath)}/${resizedName}.avif`);
        }

        stats.responsiveCount += CONFIG.generateWebP ? 2 : 1;
      }
    }

    // 4. UPDATE CACHE
    cache.files[relPath] = { hash, outputs, originalSize };
    stats.processed++;

    if (!VERBOSE) {
      console.log(`  ${COLORS.green}✓${COLORS.reset} 🎨 ${relPath} ${COLORS.dim}(${outputs.length} outputs)${COLORS.reset}`);
    } else {
      console.log(`  ${COLORS.green}✓${COLORS.reset} 🎨 ${relPath}`);
    }

  } catch (err) {
    stats.errors++;
    console.error(`  ${COLORS.red}✗${COLORS.reset} ${relPath} — ${err.message}`);
  }
}

/* ─────────────── VERIFY OUTPUT ─────────────── */
function verifyOutputs() {
  let missing = 0;
  let present = 0;

  Object.entries(cache.files).forEach(([relPath, entry]) => {
    entry.outputs.forEach(out => {
      if (!fs.existsSync(path.join(ROOT, out))) missing++;
      else present++;
    });
  });

  if (missing > 0) {
    console.log(`\n  ${COLORS.red}✗ ${missing} files missing (they will be regenerated next run)${COLORS.reset}`);
  }
}

/* ─────────────── REPORT ─────────────── */
function printReport(stats, elapsed) {
  console.log('');
  console.log(`${COLORS.bold}═══ Image Optimization Summary ═══${COLORS.reset}`);
  console.log(`  Processed:       ${COLORS.green}${stats.processed}${COLORS.reset}`);
  console.log(`  Skipped:         ${COLORS.gray}${stats.skipped}${COLORS.reset}`);
  if (stats.errors > 0) console.log(`  Errors:          ${COLORS.red}${stats.errors}${COLORS.reset}`);
  
  if (CONFIG.generateWebP) console.log(`  WebP Generated:  ${stats.webpCount} files`);
  if (CONFIG.generateAVIF) console.log(`  AVIF Generated:  ${stats.avifCount} files`);
  if (CONFIG.generateResponsive) console.log(`  Responsive:      ${stats.responsiveCount} variants`);
  
  const totalOutputs = stats.webpCount + stats.avifCount + stats.responsiveCount;
  console.log(`\n  ${COLORS.bold}Total outputs:   ${COLORS.blue}${totalOutputs} files${COLORS.reset}`);
  console.log(`  Time:            ${COLORS.blue}${elapsed}s${COLORS.reset}\n`);
}

/* ─────────────── MAIN ─────────────── */
async function main() {
  const startTime = Date.now();
  console.log(`\n${COLORS.blue}${COLORS.bold}▶ Bandwar Image Optimizer v2.0${COLORS.reset}\n`);

  if (CLEAN) {
    console.log(`${COLORS.yellow}Cleaning cache...${COLORS.reset}`);
    if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
    console.log(`  ${COLORS.green}✓${COLORS.reset} Cache wiped\n`);
    if (ARGS.length === 1) return;
  }

  loadCache();

  // ✅ 1. Prune old cache entries
  const pruned = pruneCache();

  // ✅ 2. Delete orphaned files
  console.log(`${COLORS.bold}Scanning for orphaned images...${COLORS.reset}`);
  const orphaned = cleanupOrphanedImages(IMAGES_DIR);
  if (orphaned > 0) console.log(`  ${COLORS.green}✓${COLORS.reset} Deleted ${orphaned} orphaned files`);
  else console.log(`  ${COLORS.gray}None found${COLORS.reset}`);
  if (pruned > 0) console.log(`  ${COLORS.green}✓${COLORS.reset} Pruned ${pruned} entries from cache`);

  console.log(`\n${COLORS.bold}Scanning source images...${COLORS.reset}`);
  const images = scanImages();
  console.log(`  ${COLORS.green}✓${COLORS.reset} Found ${images.length} source images\n`);

  const stats = { processed: 0, skipped: 0, errors: 0, originalBytes: 0, webpCount: 0, webpSaved: 0, avifCount: 0, avifSaved: 0, responsiveCount: 0 };

  console.log(`${COLORS.bold}Processing...${COLORS.reset}`);
  for (const image of images) {
    await optimizeImage(image, stats);
    if ((stats.processed + stats.skipped) % 20 === 0) saveCache();
  }

  saveCache();
  if (!DRY_RUN && stats.processed > 0) verifyOutputs();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  printReport(stats, elapsed);
  console.log(`${COLORS.green}${COLORS.bold}Done.${COLORS.reset}\n`);
}

main().catch(err => {
  console.error(`\n${COLORS.red}✗ Optimizer failed: ${err.message}${COLORS.reset}\n`);
  process.exit(1);
});