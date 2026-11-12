import fs from "fs";
import path from "path";
import { z } from "zod";
import { 
  MasterSchema, 
  ArticleListSchema, 
  MediaSchema, 
  PeopleDataSchema, 
  CategoriesDataSchema,
  DirectoryDataSchema 
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
    const pathStr = issue.path.length > 0 ? issue.path.join(" → ") : "Root";
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
      hasErrors = true; // Yeh build fail karega (Kyunki JSON structure kharab hai)
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
validateFile("contributors.json", z.object({ contributors: z.array(z.any()) })); 

const articlesDir = path.join(dataDir, "articles");
const validArticleIds = new Set<string>();
const validCategoryIds = new Set<string>();
const allArticles: any[] = [];

if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("⚠️   SKIP: data/articles/ (No JSON files found)");
  } else {
    files.forEach(file => validateFile(`articles/${file}`, ArticleListSchema));
  }
} else {
  console.error(`❌ FAIL: 'data/articles/' directory not found!`);
  hasErrors = true;
  failedFiles++;
}

// --- Phase 2: Cross-Reference Validation (SOFT CHECKS) ---
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
} catch (e) {}

if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith(".json"));
  files.forEach(file => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(articlesDir, file), "utf8"));
      if (raw && Array.isArray(raw.articles)) {
        raw.articles.forEach((art: any) => {
          if (art.id) {
            validArticleIds.add(art.id);
            allArticles.push({ ...art, _file: file });
          }
        });
      }
    } catch (e) {}
  });

  const linkRegex = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi;

  allArticles.forEach((art) => {
    const artWarnings: string[] = [];
    
    // Check Categories
    if (Array.isArray(art.categories)) {
      art.categories.forEach((cat: string) => {
        if (!validCategoryIds.has(cat)) artWarnings.push(`   ⚠️ [Category]: "${cat}" does not exist in categories.json`);
      });
    }

    // Check Related IDs
    if (Array.isArray(art.related)) {
      art.related.forEach((relId: string) => {
        if (!validArticleIds.has(relId)) artWarnings.push(`   ⚠️ [Related]: Article ID "${relId}" does not exist`);
      });
    }

    // Check Wikilinks
    const textToCheck: string[] = [];
    if (art.summary) textToCheck.push(art.summary);
    if (Array.isArray(art.content)) art.content.forEach((block: any) => { if (block.text) textToCheck.push(block.text); });
    
    textToCheck.forEach((text) => {
      let match;
      while ((match = linkRegex.exec(text)) !== null) {
        const targetId = match[1];
        if (!validArticleIds.has(targetId)) artWarnings.push(`   ⚠️ [Wikilink]: Target ID "${targetId}" does not exist`);
      }
    });

    if (artWarnings.length > 0) {
      // Yahan hasErrors = true NAHI kiya gaya hai. Build fail nahi hoga.
      console.warn(`⚠️ WARNINGS in ${art._file} (Article: ${art.id}):`);
      artWarnings.forEach(warn => console.warn(warn));
      console.log("");
      brokenLinksCount += artWarnings.length;
    }
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
  console.error("🚨 VALIDATION FAILED! Please fix the SCHEMA errors above (JSON syntax or missing fields) before deploying.");
  process.exit(1); // Sirf JSON kharab hone par build fail hoga
} else {
  if (brokenLinksCount > 0) {
    console.log("⚠️ Note: Broken links found, but Schema is valid. Build will continue.\n");
  } else {
    console.log("🎉 ALL DATA VALIDATED SUCCESSFULLY. Ready for deployment.\n");
  }
  process.exit(0); // Links tootne par bhi build PASS ho jayega
}