/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — IMAGE OPTIMIZER
   Converts images to WebP + AVIF, generates responsive sizes,
   and updates all data JSON files with the new paths.
   
   What it does:
     1. Reads master.json imageSEO config
     2. Scans images/ folder (recursive)
     3. For each image:
        - Converts to WebP (quality 78)
        - Converts to AVIF (quality 65)
        - Generates responsive widths (400/800/1200/1600)
        - Skips if already optimized (hash check)
     4. Reports stats (files, savings)
   
   Usage:
     node scripts/optimize-images.cjs                  # Full run
     node scripts/optimize-images.cjs --clean          # Wipe optimized cache
     node scripts/optimize-images.cjs --dry-run        # Show what would happen
     node scripts/optimize-images.cjs --verbose        # Detailed output
     node scripts/optimize-images.cjs --only-webp      # Skip AVIF
     node scripts/optimize-images.cjs --only-avif      # Skip WebP
   
   Dependencies:
     npm install --save-dev sharp
   
   Note:
     Original .jpg/.png files are PRESERVED as fallback.
     New files are written alongside with new extensions.
     
     Example:
       images/culture/shivala.jpg
       images/culture/shivala.webp          ← new
       images/culture/shivala.avif          ← new
       images/culture/shivala-400.jpg       ← new
       images/culture/shivala-400.webp      ← new
       images/culture/shivala-800.jpg       ← new
       images/culture/shivala-800.webp      ← new
       images/culture/shivala-1200.jpg      ← new
       images/culture/shivala-1200.webp     ← new
       images/culture/shivala-1600.jpg      ← new
       images/culture/shivala-1600.webp     ← new
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
const SKIP_FOLDERS = ['icons'];  // PWA icons ko skip karo (chhoti files, different purpose)

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
  console.error('');
  console.error(`  Install it first:`);
  console.error(`    ${COLORS.blue}npm install --save-dev sharp${COLORS.reset}`);
  console.error('');
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
        if (entry.name.startsWith('_')) return;  // _source, _draft, etc.
        walk(full, rel);
        return;
      }

      // Only process JPG/PNG, skip already-optimized variants
      if (!IMAGE_EXTENSIONS.test(entry.name)) return;
      if (/-\d+\.(jpe?g|png)$/i.test(entry.name)) return;  // Skip responsive variants

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

  // ─── Hash check ───
  const hash = fileHash(absPath);
  if (isCached(relPath, hash)) {
    stats.skipped++;
    if (VERBOSE) {
      console.log(`  ${COLORS.gray}↷${COLORS.reset} ${relPath} ${COLORS.dim}(cached)${COLORS.reset}`);
    }
    return;
  }

  // ─── Original stats ───
  const originalSize = fs.statSync(absPath).size;
  stats.originalBytes += originalSize;

  const outputs = [];

  try {
    const metadata = await sharp(absPath).metadata();
    const { width: origWidth = 0, height: origHeight = 0 } = metadata;

    // ─── 1. FULL-SIZE WEBP ───
    if (CONFIG.generateWebP) {
      const outPath = path.join(dir, `${name}.webp`);
      const relOut = `${path.dirname(relPath)}/${name}.webp`;
      
      if (!DRY_RUN) {
        await sharp(absPath)
          .webp({ quality: CONFIG.webpQuality, effort: 4 })
          .toFile(outPath);
      }
      const size = DRY_RUN ? 0 : fs.statSync(outPath).size;
      outputs.push(relOut);
      stats.webpCount++;
      stats.webpBytes += size;
      stats.webpSaved += originalSize - size;

      if (VERBOSE) {
        const pct = ((1 - size / originalSize) * 100).toFixed(0);
        console.log(`    ${COLORS.green}✓${COLORS.reset} ${relOut} ${COLORS.dim}(-${pct}%)${COLORS.reset}`);
      }
    }

    // ─── 2. FULL-SIZE AVIF ───
    if (CONFIG.generateAVIF) {
      const outPath = path.join(dir, `${name}.avif`);
      const relOut = `${path.dirname(relPath)}/${name}.avif`;
      
      if (!DRY_RUN) {
        await sharp(absPath)
          .avif({ quality: CONFIG.avifQuality, effort: 4 })
          .toFile(outPath);
      }
      const size = DRY_RUN ? 0 : fs.statSync(outPath).size;
      outputs.push(relOut);
      stats.avifCount++;
      stats.avifBytes += size;
      stats.avifSaved += originalSize - size;

      if (VERBOSE) {
        const pct = ((1 - size / originalSize) * 100).toFixed(0);
        console.log(`    ${COLORS.green}✓${COLORS.reset} ${relOut} ${COLORS.dim}(-${pct}%)${COLORS.reset}`);
      }
    }

    // ─── 3. RESPONSIVE VARIANTS ───
    if (CONFIG.generateResponsive && origWidth > 0) {
      for (const w of CONFIG.widths) {
        // Skip if width larger than original
        if (w >= origWidth) continue;

        const resizedName = `${name}-${w}`;
        
        // JPG responsive
        const jpgPath = path.join(dir, `${resizedName}.jpg`);
        const relJpg = `${path.dirname(relPath)}/${resizedName}.jpg`;
        if (!DRY_RUN) {
          await sharp(absPath)
            .resize({ width: w, withoutEnlargement: true })
            .jpeg({ quality: CONFIG.jpgQuality, progressive: true, mozjpeg: true })
            .toFile(jpgPath);
        }
        outputs.push(relJpg);

        // WebP responsive
        if (CONFIG.generateWebP) {
          const webpPath = path.join(dir, `${resizedName}.webp`);
          const relWebp = `${path.dirname(relPath)}/${resizedName}.webp`;
          if (!DRY_RUN) {
            await sharp(absPath)
              .resize({ width: w, withoutEnlargement: true })
              .webp({ quality: CONFIG.webpQuality, effort: 4 })
              .toFile(webpPath);
          }
          outputs.push(relWebp);
        }

        // AVIF responsive
        if (CONFIG.generateAVIF) {
          const avifPath = path.join(dir, `${resizedName}.avif`);
          const relAvif = `${path.dirname(relPath)}/${resizedName}.avif`;
          if (!DRY_RUN) {
            await sharp(absPath)
              .resize({ width: w, withoutEnlargement: true })
              .avif({ quality: CONFIG.avifQuality, effort: 4 })
              .toFile(avifPath);
          }
          outputs.push(relAvif);
        }

        stats.responsiveCount += CONFIG.generateWebP ? 2 : 1;
      }
    }

    // ─── 4. UPDATE CACHE ───
    cache.files[relPath] = {
      hash,
      mtime: fs.statSync(absPath).mtime.toISOString(),
      outputs,
      originalSize,
      width: origWidth,
      height: origHeight,
    };

    stats.processed++;

    if (!VERBOSE) {
      const icon = '🎨';
      const sizeKB = (originalSize / 1024).toFixed(0);
      console.log(`  ${COLORS.green}✓${COLORS.reset} ${icon} ${relPath} ${COLORS.dim}(${sizeKB} KB → ${outputs.length} outputs)${COLORS.reset}`);
    }

  } catch (err) {
    stats.errors++;
    console.error(`  ${COLORS.red}✗${COLORS.reset} ${relPath} — ${err.message}`);
  }
}

/* ─────────────── VERIFY OUTPUT ─────────────── */
function verifyOutputs() {
  console.log('');
  console.log(`${COLORS.bold}Verifying outputs...${COLORS.reset}`);

  let missing = 0;
  let present = 0;

  Object.entries(cache.files).forEach(([relPath, entry]) => {
    entry.outputs.forEach(out => {
      if (!fs.existsSync(path.join(ROOT, out))) {
        missing++;
        console.log(`  ${COLORS.red}✗ Missing: ${out}${COLORS.reset}`);
      } else {
        present++;
      }
    });
  });

  console.log(`  ${COLORS.green}✓${COLORS.reset} ${present} files present`);
  if (missing > 0) {
    console.log(`  ${COLORS.red}✗ ${missing} files missing${COLORS.reset}`);
  }
  return missing === 0;
}

/* ─────────────── REPORT ─────────────── */
function printReport(stats, elapsed) {
  console.log('');
  console.log(`${COLORS.bold}═══ Image Optimization Summary ═══${COLORS.reset}`);
  console.log('');

  // Processing
  console.log(`  ${COLORS.bold}Processing${COLORS.reset}`);
  console.log(`    Total scanned:   ${stats.totalScanned}`);
  console.log(`    ${COLORS.green}Processed:       ${stats.processed}${COLORS.reset}`);
  console.log(`    ${COLORS.gray}Skipped (cached): ${stats.skipped}${COLORS.reset}`);
  if (stats.errors > 0) {
    console.log(`    ${COLORS.red}Errors:          ${stats.errors}${COLORS.reset}`);
  }

  console.log('');

  // WebP
  if (CONFIG.generateWebP) {
    const saved = stats.webpSaved;
    const orig = stats.originalBytes;
    const pct = orig > 0 ? ((saved / orig) * 100).toFixed(1) : '0';
    console.log(`  ${COLORS.bold}WebP${COLORS.reset}`);
    console.log(`    Generated:       ${stats.webpCount} files`);
    console.log(`    ${COLORS.green}Saved:           ${formatBytes(saved)} (${pct}% smaller)${COLORS.reset}`);
  }

  console.log('');

  // AVIF
  if (CONFIG.generateAVIF) {
    const saved = stats.avifSaved;
    const orig = stats.originalBytes;
    const pct = orig > 0 ? ((saved / orig) * 100).toFixed(1) : '0';
    console.log(`  ${COLORS.bold}AVIF${COLORS.reset}`);
    console.log(`    Generated:       ${stats.avifCount} files`);
    console.log(`    ${COLORS.green}Saved:           ${formatBytes(saved)} (${pct}% smaller)${COLORS.reset}`);
  }

  console.log('');

  // Responsive
  if (CONFIG.generateResponsive) {
    console.log(`  ${COLORS.bold}Responsive${COLORS.reset}`);
    console.log(`    Generated:       ${stats.responsiveCount} variants`);
    console.log(`    Widths:          ${CONFIG.widths.join(', ')}px`);
  }

  console.log('');

  // Totals
  const totalOutputs = stats.webpCount + stats.avifCount + stats.responsiveCount;
  console.log(`  ${COLORS.bold}Total outputs:   ${COLORS.blue}${totalOutputs} files${COLORS.reset}`);
  console.log(`  ${COLORS.bold}Time:            ${COLORS.blue}${elapsed}s${COLORS.reset}`);
  console.log('');

  // Errors
  if (stats.errors > 0) {
    console.log(`  ${COLORS.red}${COLORS.bold}⚠ ${stats.errors} errors — check output above${COLORS.reset}`);
    console.log('');
  }

  // Dry run note
  if (DRY_RUN) {
    console.log(`  ${COLORS.yellow}${COLORS.bold}⚠ DRY RUN — no files were written${COLORS.reset}`);
    console.log('');
  }
}

/* ─────────────── FORMAT BYTES ─────────────── */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/* ─────────────── MAIN ─────────────── */
async function main() {
  const startTime = Date.now();

  console.log('');
  console.log(`${COLORS.blue}${COLORS.bold}▶ Bandwar Image Optimizer${COLORS.reset}`);
  console.log(`${COLORS.gray}  Root: ${ROOT}${COLORS.reset}`);
  console.log('');

  // ─── CLEAN MODE ───
  if (CLEAN) {
    console.log(`${COLORS.yellow}Cleaning cached files...${COLORS.reset}`);
    let deleted = 0;
    if (fs.existsSync(CACHE_FILE)) {
      const oldCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      Object.values(oldCache.files || {}).forEach(entry => {
        (entry.outputs || []).forEach(out => {
          const full = path.join(ROOT, out);
          if (fs.existsSync(full)) {
            fs.unlinkSync(full);
            deleted++;
          }
        });
      });
      fs.unlinkSync(CACHE_FILE);
    }
    console.log(`  ${COLORS.green}✓${COLORS.reset} Deleted ${deleted} files`);
    console.log('');
    if (ARGS.length === 1) {
      console.log(`${COLORS.gray}Run again without --clean to rebuild.${COLORS.reset}`);
      console.log('');
      return;
    }
  }

  // ─── LOAD CACHE ───
  loadCache();

  // ─── CONFIG DISPLAY ───
  console.log(`${COLORS.bold}Config${COLORS.reset}`);
  console.log(`  WebP:        ${CONFIG.generateWebP ? `${COLORS.green}✓${COLORS.reset} (q=${CONFIG.webpQuality})` : `${COLORS.gray}✗${COLORS.reset}`}`);
  console.log(`  AVIF:        ${CONFIG.generateAVIF ? `${COLORS.green}✓${COLORS.reset} (q=${CONFIG.avifQuality})` : `${COLORS.gray}✗${COLORS.reset}`}`);
  console.log(`  Responsive:  ${CONFIG.generateResponsive ? `${COLORS.green}✓${COLORS.reset} [${CONFIG.widths.join(', ')}]` : `${COLORS.gray}✗${COLORS.reset}`}`);
  console.log(`  Cache:       ${Object.keys(cache.files).length} entries`);
  console.log('');

  // ─── SCAN ───
  console.log(`${COLORS.bold}Scanning images/...${COLORS.reset}`);
  const images = scanImages();
  console.log(`  ${COLORS.green}✓${COLORS.reset} Found ${images.length} source images`);
  console.log('');

  // ─── STATS ───
  const stats = {
    totalScanned: images.length,
    processed: 0,
    skipped: 0,
    errors: 0,
    originalBytes: 0,
    webpCount: 0,
    webpBytes: 0,
    webpSaved: 0,
    avifCount: 0,
    avifBytes: 0,
    avifSaved: 0,
    responsiveCount: 0,
  };

  // ─── PROCESS ───
  console.log(`${COLORS.bold}Processing...${COLORS.reset}`);
  for (const image of images) {
    await optimizeImage(image, stats);
    // Save cache periodically (in case of crash)
    if ((stats.processed + stats.skipped) % 20 === 0) {
      saveCache();
    }
  }

  // ─── SAVE CACHE ───
  saveCache();

  // ─── VERIFY ───
  if (!DRY_RUN && stats.processed > 0) {
    verifyOutputs();
  }

  // ─── REPORT ───
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  printReport(stats, elapsed);

  console.log(`${COLORS.green}${COLORS.bold}Image optimization complete.${COLORS.reset}`);
  console.log('');

  // ─── HINTS ───
  if (!DRY_RUN && stats.processed > 0) {
    console.log(`${COLORS.gray}Next steps:${COLORS.reset}`);
    console.log(`${COLORS.gray}  1. Run: ${COLORS.reset}${COLORS.blue}node scripts/build.cjs --clean${COLORS.reset}`);
    console.log(`${COLORS.gray}  2. Commit new .webp/.avif files to Git${COLORS.reset}`);
    console.log(`${COLORS.gray}  3. Deploy via Vercel${COLORS.reset}`);
    console.log('');
  }
}

main().catch(err => {
  console.error('');
  console.error(`${COLORS.red}${COLORS.bold}✗ Optimizer failed:${COLORS.reset}`);
  console.error(`${COLORS.red}  ${err.message}${COLORS.reset}`);
  if (VERBOSE) {
    console.error('');
    console.error(err.stack);
  }
  console.error('');
  process.exit(1);
});