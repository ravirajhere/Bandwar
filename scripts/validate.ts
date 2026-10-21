import fs from "fs";
import path from "path";
import { 
  MasterSchema, ArticleListSchema, MediaSchema, 
  VisionSchema, PeopleDataSchema, CategoriesDataSchema 
} from "../src/lib/schema";

const dataDir = path.join(process.cwd(), "data");

console.log("🔍 JSON Data Validation shuru ho raha hai...\n");

let hasErrors = false;

const validateFile = (fileName: string, schema: any) => {
  try {
    const filePath = path.join(dataDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File nahi mili: ${fileName} (Skip kar rahe hain)`);
      return;
    }
    
    const rawData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const parsed = schema.safeParse(rawData);

    if (!parsed.success) {
      console.error(`❌ ERROR in ${fileName}:`);
      console.error(parsed.error.format());
      hasErrors = true;
    } else {
      console.log(`✅ ${fileName} — Perfect!`);
    }
  } catch (error: any) {
    console.error(`❌ JSON Format Error in ${fileName}: ${error.message}`);
    hasErrors = true;
  }
};

// Root files check karo
validateFile("master.json", MasterSchema);
validateFile("categories.json", CategoriesDataSchema);
validateFile("people.json", PeopleDataSchema);
validateFile("vision.json", VisionSchema);
validateFile("media.json", MediaSchema);

// Articles folder check karo
const articlesDir = path.join(dataDir, "articles");
if (fs.existsSync(articlesDir)) {
  const files = fs.readdirSync(articlesDir);
  files.forEach(file => {
    if (file.endsWith(".json")) {
      validateFile(`articles/${file}`, ArticleListSchema);
    }
  });
}

console.log("\n----------------------------------------");
if (hasErrors) {
  console.error("🚨 Validation FAILED! Vercel par deploy karne se pehle in errors ko theek karein.");
  process.exit(1); // Exit code 1 ka matlab error
} else {
  console.log("🎉 Sab kuch sahi hai! Tera data deploy karne ke liye ready hai.");
}