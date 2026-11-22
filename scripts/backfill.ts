import fs from 'fs';
import path from 'path';
import { ArticleSchema } from '../src/lib/schema';

const dataDir = path.join(process.cwd(), 'data');
const articlesDir = path.join(dataDir, 'articles');
const stewardshipFile = path.join(dataDir, 'stewardship.json');

console.log("🚀 Starting Phase 0 Data Backfill...\n");

// 1. Read Stewardship Log
let stewardship: any = { version: "1.0", entries: [] };
if (fs.existsSync(stewardshipFile)) {
  stewardship = JSON.parse(fs.readFileSync(stewardshipFile, 'utf8'));
}

let migratedArticlesCount = 0;
let newStewardshipEntriesCount = 0;

const now = new Date().toISOString();
const systemActor = "system-backfill";

// 2. Process Articles
if (!fs.existsSync(articlesDir)) {
  console.error("❌ articles directory not found!");
  process.exit(1);
}

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(articlesDir, file);
  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileModified = false;

  if (rawData && Array.isArray(rawData.articles)) {
    rawData.articles = rawData.articles.map((art: any) => {
      let changed = false;

      // Add Confidence if missing
      if (!art.confidence) {
        art.confidence = "unverified";
        changed = true;
      }

      // Add Provenance if missing
      if (!art.provenance) {
        art.provenance = {
          method: "inferred",
          notes: "Legacy archive data. Pending editorial verification.",
          verifiedAt: art.lastUpdated || now
        };
        changed = true;
      }

      // Generate Stewardship entry
      if (changed) {
        // Check if stewardship entry already exists to prevent duplicates
        const exists = stewardship.entries.find((e: any) => e.entityId === art.id && e.action === "created");
        if (!exists) {
          stewardship.entries.push({
            id: `stew-${art.id}-${Date.now()}`,
            entityId: art.id,
            entityType: "article",
            action: "created",
            tier: "unverified",
            role: "system",
            actor: systemActor,
            method: "automated-migration",
            notes: "Initial import from legacy schema.",
            timestamp: now
          });
          newStewardshipEntriesCount++;
        }
        migratedArticlesCount++;
        fileModified = true;
      }

      return art;
    });

    // Validate against schema before saving
    const parsed = ArticleSchema.safeParse(rawData.articles[0]);
    if (!parsed.success) {
      console.warn(`⚠️  Warning: Schema validation would fail for ${file} after migration. Skipping write to avoid corruption.`);
      continue;
    }

    if (fileModified) {
      fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2), 'utf8');
      console.log(`✅ Migrated: articles/${file}`);
    }
  }
}

// 3. Save Stewardship Log
if (newStewardshipEntriesCount > 0) {
  fs.writeFileSync(stewardshipFile, JSON.stringify(stewardship, null, 2), 'utf8');
  console.log(`✅ Saved ${newStewardshipEntriesCount} entries to stewardship.json`);
}

console.log(`\n🎉 Backfill Complete!`);
console.log(`   Articles Updated: ${migratedArticlesCount}`);
console.log(`   Stewardship Entries Created: ${newStewardshipEntriesCount}`);
console.log(`\nRun "npm run validate" to ensure everything is green.`);