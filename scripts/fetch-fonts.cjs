/* ═══════════════════════════════════════════════════════════════════
   BANDWAR — FETCH FONTS
   Downloads woff2 files from fontsource CDN (jsDelivr)
   Run once locally OR via GitHub Actions.
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(ROOT, 'fonts');

const FONTS = [
  {
    name: 'fraunces-latin-wght-normal.woff2',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces@5/files/fraunces-latin-wght-normal.woff2'
  },
  {
    name: 'fraunces-latin-wght-italic.woff2',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces@5/files/fraunces-latin-wght-italic.woff2'
  },
  {
    name: 'inter-latin-wght-normal.woff2',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5/files/inter-latin-wght-normal.woff2'
  },
  {
    name: 'ibm-plex-mono-latin-400-normal.woff2',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-400-normal.woff2'
  },
  {
    name: 'ibm-plex-mono-latin-500-normal.woff2',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-500-normal.woff2'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  fs.mkdirSync(FONTS_DIR, { recursive: true });

  for (const font of FONTS) {
    const dest = path.join(FONTS_DIR, font.name);
    process.stdout.write(`  ↓ ${font.name} ... `);
    try {
      await download(font.url, dest);
      const size = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`✓ (${size} KB)`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
    }
  }
  console.log('\nDone. Fonts saved to fonts/');
}

main();