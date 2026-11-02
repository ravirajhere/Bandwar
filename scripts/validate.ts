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

console.log("\n🛡️  ==========================================");
console.log("🔍  BANDWAR ARCHIVE - DATA VALIDATION ENGINE");
console.log("============================================\n");

let totalFiles = 0;
let passedFiles = 0;
let failedFiles = 0;
let hasErrors = false;

// Senior Dev Tip: Human-readable Zod Error Formatter
const formatZodErrors = (error: z.ZodError) => {
  return error.issues.map((issue) => {
    const pathStr = issue.path.length > 0 ? issue.path.join(" → ") : "Root";
    return `     ❌ [${pathStr}]: ${issue.message}`;
  }).join("\n");
};

const validateFile = (fileName: string, schema: z.ZodTypeAny) => {
  totalFiles++;
  const filePath = path.join(dataDir, fileName);
  
  // 1. Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️   SKIP: ${fileName} (File not found)`);
    totalFiles--; // Skip doesn't count as total
    return;
  }
  
  try {
    // 2. Read and Parse JSON (Catches syntax errors like missing commas)
    const fileContent = fs.readFileSync(filePath, "utf8");
    let rawData;
    try {
      rawData = JSON.parse(fileContent);
    } catch (parseError: unknown) {
      const errMsg = parseError instanceof Error ? parseError.message : "Unknown JSON syntax error";
      throw new Error(`Invalid JSON Syntax: ${errMsg}`);
    }

    // 3. Zod Validation
    const parsed = schema.safeParse(rawData);

    if (!parsed.success) {
      console.error(`❌ FAIL: ${fileName}`);
      console.error(formatZodErrors(parsed.error));
      console.log(""); // Empty line for spacing
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

// ==========================================
// Execution Pipeline
// ==========================================

// 1. Root JSON Files
validateFile("master.json", MasterSchema);
validateFile("categories.json", CategoriesDataSchema);
validateFile("people.json", PeopleDataSchema);
validateFile("media.json", MediaSchema);
validateFile("directory.json", DirectoryDataSchema); // 🚀 Naya Validation Added

// 2. Articles Directory
const articlesDir = path.join(dataDir, "articles");
if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith(".json"));
  
  if (files.length === 0) {
    console.log("⚠️   SKIP: data/articles/ (No JSON files found)");
  } else {
    files.forEach(file => {
      validateFile(`articles/${file}`, ArticleListSchema);
    });
  }
} else {
  console.error(`❌ FAIL: 'data/articles/' directory not found!`);
  hasErrors = true;
  failedFiles++;
}

// ==========================================
// Final Report
// ==========================================
console.log("--------------------------------------------");
console.log(`📊 SUMMARY:`);
console.log(`   Total Files Checked : ${totalFiles}`);
console.log(`   Passed              : ${passedFiles}`);
console.log(`   Failed              : ${failedFiles}`);
console.log("--------------------------------------------\n");

if (hasErrors) {
  console.error("🚨 VALIDATION FAILED! Push mat karo. Pehle upar wale errors ko theek karo.");
  process.exit(1); // Stops the build process
} else {
  console.log("🎉 100% PERFECT! Tumhara data deploy karne ke liye ekdum tayyar hai.");
  process.exit(0);
}