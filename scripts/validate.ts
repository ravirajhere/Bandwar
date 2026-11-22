import fs from "fs";
import path from "path";
import { z } from "zod";
import {
  MasterSchema,
  ArticleListSchema,
  MediaSchema,
  PeopleDataSchema,
  CategoriesDataSchema,
  DirectoryDataSchema,
  ContributorsDataSchema,
  QueueDataSchema,
  EdgesDataSchema,
  StewardshipDataSchema,
  AbsencesDataSchema,
} from "../src/lib/schema";

const dataDir = path.join(process.cwd(), "data");

console.log("\n==========================================");
console.log("🛡️  BANDWAR ARCHIVE - DATA VALIDATION ENGINE");
console.log("==========================================\n");

let totalFiles = 0;
let passedFiles = 0;
let failedFiles = 0;
let hasErrors = false;
let brokenLinksCount = 0;

const formatZodErrors = (error: z.ZodError) => {
  return error.issues.map((issue) => {
    const pathStr = issue.path.length > 0
      ? issue.path.map((p) => (typeof p === "number" ? `[${p}]` : p)).join(" → ")
      : "Root";
    return `     ❌ [${pathStr}]: ${issue.message}`;
  }).join("\n");
};

const validateFile = (fileName: string, schema: z.ZodTypeAny) => {
  totalFiles++;
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️   SKIP: ${fileName} (File not found)`);
    totalFiles--;
    return;
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    let rawData;
    try {
      rawData = JSON.parse(fileContent);
    } catch (parseError: unknown) {
      const errMsg = parseError instanceof Error ? parseError.message : "Unknown JSON syntax error";
      throw new Error(`Invalid JSON Syntax: ${errMsg}`);
    }

    const parsed = schema.safeParse(rawData);

    if (!parsed.success) {
      console.error(`❌ FAIL: ${fileName}`);
      console.error(formatZodErrors(parsed.error));
      console.log("");
      hasErrors = true;
      failedFiles++;
    } else {
      console.log(`✅ PASS: ${fileName}`);
      passedFiles++;
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ FAIL: ${fileName}`);
    console.error(`     ❌ [Syntax Error]: ${errMsg}`);
    console.log("");
    hasErrors = true;
    failedFiles++;
  }
};

// --- Phase 1: Schema Validation ---
console.log("--- Phase 1: Schema Validation ---");
validateFile("master.json", MasterSchema);
validateFile("categories.json", CategoriesDataSchema);
validateFile("people.json", PeopleDataSchema);
validateFile("media.json", MediaSchema);
validateFile("directory.json", DirectoryDataSchema);
validateFile("contributors.json", ContributorsDataSchema);
validateFile("queue.json", QueueDataSchema);
validateFile("edges.json", EdgesDataSchema);
validateFile("stewardship.json", StewardshipDataSchema);
validateFile("absences.json", AbsencesDataSchema);

const articlesDir = path.join(dataDir, "articles");
const validArticleIds = new Set<string>();
const validCategoryIds = new Set<string>();
const articleIdToFile = new Map<string, string>();
const allArticles: any[] = [];

if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("⚠️   SKIP: data/articles/ (No JSON files found)");
  } else {
    files.forEach((file) => validateFile(`articles/${file}`, ArticleListSchema));
  }
} else {
  console.error(`❌ FAIL: 'data/articles/' directory not found!`);
  hasErrors = true;
  failedFiles++;
}

// Duplicate article ID check (hard fail)
if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  const seen: Record<string, string> = {};
  files.forEach((file) => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(articlesDir, file), "utf8"));
      if (raw && Array.isArray(raw.articles)) {
        raw.articles.forEach((art: any) => {
          if (art.id) {
            if (seen[art.id]) {
              console.error(`❌ DUPLICATE ID: "${art.id}" in articles/${file} and articles/${seen[art.id]}`);
              hasErrors = true;
            } else {
              seen[art.id] = file;
            }
          }
        });
      }
    } catch (e) {
      // already caught in Phase 1
    }
  });
}

// --- Phase 2: Cross-Reference & Internal Link Validation ---
console.log("\n--- Phase 2: Cross-Reference & Internal Link Validation ---");

try {
  const catPath = path.join(dataDir, "categories.json");
  if (fs.existsSync(catPath)) {
    const catData = JSON.parse(fs.readFileSync(catPath, "utf8"));
    if (catData && Array.isArray(catData.categories)) {
      catData.categories.forEach((c: any) => {
        if (c.id) validCategoryIds.add(c.id);
      });
    }
  }
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`⚠️  Could not parse categories.json for cross-ref: ${msg}`);
}

if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".json"));
  files.forEach((file) => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(articlesDir, file), "utf8"));
      if (raw && Array.isArray(raw.articles)) {
        raw.articles.forEach((art: any) => {
          if (art.id) {
            validArticleIds.add(art.id);
            articleIdToFile.set(art.id, file);
            allArticles.push({ ...art, _file: file });
          }
        });
      }
    } catch (e) {
      // already caught in Phase 1
    }
  });

  const linkRegex = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi;

  allArticles.forEach((art) => {
    const artWarnings: string[] = [];

    if (Array.isArray(art.categories)) {
      art.categories.forEach((cat: string) => {
        if (!validCategoryIds.has(cat)) {
          artWarnings.push(`   ⚠️ [Category]: "${cat}" does not exist in categories.json`);
        }
      });
    }

    if (Array.isArray(art.related)) {
      art.related.forEach((relId: string) => {
        if (!validArticleIds.has(relId)) {
          artWarnings.push(`   ⚠️ [Related]: Article ID "${relId}" does not exist`);
        }
      });
    }

    const textToCheck: string[] = [];
    if (art.summary) textToCheck.push(art.summary);
    if (Array.isArray(art.content)) {
      art.content.forEach((block: any) => {
        if (block.text) textToCheck.push(block.text);
      });
    }

    textToCheck.forEach((text) => {
      const regex = new RegExp(linkRegex.source, linkRegex.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const targetId = match[1];
        if (!validArticleIds.has(targetId)) {
          artWarnings.push(`   ⚠️ [Wikilink]: Target ID "${targetId}" does not exist`);
        }
      }
    });

    if (artWarnings.length > 0) {
      console.warn(`⚠️ WARNINGS in ${art._file} (Article: ${art.id}):`);
      artWarnings.forEach((warn) => console.warn(warn));
      console.log("");
      brokenLinksCount += artWarnings.length;
    }
  });
}

// --- Phase 3: Advisory Reports ---
console.log("\n--- Phase 3: Advisory Reports ---");

// Image existence (summary only)
let missingImages = 0;
allArticles.forEach((art) => {
  if (art.hero && !art.hero.startsWith("http")) {
    const cleanSrc = art.hero.split("?")[0].replace(/^\//, "");
    if (!fs.existsSync(path.join(process.cwd(), "public", cleanSrc))) {
      missingImages++;
    }
  }
  if (Array.isArray(art.photos)) {
    art.photos.forEach((p: any) => {
      if (p.src && !p.src.startsWith("http")) {
        const cleanSrc = p.src.split("?")[0].replace(/^\//, "");
        if (!fs.existsSync(path.join(process.cwd(), "public", cleanSrc))) {
          missingImages++;
        }
      }
    });
  }
});

if (missingImages > 0) {
  console.warn(`⚠️  Missing image files: ${missingImages} (find via: grep in data/articles/)`);
} else if (allArticles.length > 0) {
  console.log(`✅ All article images exist`);
}

// Provenance coverage
const articlesWithProvenance = allArticles.filter((a: any) => a.provenance).length;
const coverage = allArticles.length > 0
  ? Math.round((articlesWithProvenance / allArticles.length) * 100)
  : 100;
console.log(`📊 Article provenance coverage: ${articlesWithProvenance}/${allArticles.length} (${coverage}%)`);
if (coverage < 100) {
  console.log(`   (Will increase as Phase 1 backfill runs)`);
}

// Confidence distribution
const tierCounts: Record<string, number> = {};
allArticles.forEach((a: any) => {
  const tier = a.confidence || "unverified";
  tierCounts[tier] = (tierCounts[tier] || 0) + 1;
});
if (Object.keys(tierCounts).length > 0) {
  console.log(`📊 Confidence distribution:`);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    console.log(`   ${tier}: ${count}`);
  });
}

console.log("--------------------------------------------");
console.log(`📊 SUMMARY:`);
console.log(`   Total Files Checked : ${totalFiles}`);
console.log(`   Passed Files        : ${passedFiles}`);
console.log(`   Failed Files        : ${failedFiles}`);
console.log(`   Broken Links Found  : ${brokenLinksCount} (These won't stop the build)`);
console.log("--------------------------------------------\n");

if (hasErrors) {
  console.error("🚨 VALIDATION FAILED! Please fix the SCHEMA errors above before deploying.");
  process.exit(1);
} else {
  if (brokenLinksCount > 0) {
    console.log("⚠️ Note: Broken links found, but Schema is valid. Build will continue.\n");
  } else {
    console.log("🎉 ALL DATA VALIDATED SUCCESSFULLY. Ready for deployment.\n");
  }
  process.exit(0);
}