import fs from "fs";
import path from "path";
import { z } from "zod";
import { 
  MasterSchema, ArticleListSchema, MediaSchema, VisionSchema, 
  PeopleDataSchema, CategoriesDataSchema, DirectoryDataSchema, 
  MasterConfig, Article, Media, VisionData, PeopleData, CategoriesData, DirectoryData 
} from "./schema";

// ==========================================
// 1. CORE HELPERS (Optimized & Generic)
// ==========================================

// Read file synchronously (Best for Next.js SSG builds)
const readJsonFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), "data", filePath);
  try {
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found`);
    }
    const fileContent = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read or parse JSON file: data/${filePath}\n${error}`);
  }
};

// Generic validation helper to avoid code repetition
function validateData<T extends z.ZodTypeAny>(schema: T, data: unknown, fileName: string): z.infer<T> {
  const parsed = schema.safeParse(data);
  
  if (!parsed.success) {
    // Human-readable error formatting
    const errorMessages = parsed.error.issues.map(
      (issue) => `  → Field [${issue.path.join(".")}]: ${issue.message}`
    ).join("\n");
    
    throw new Error(
      `❌ Validation Failed in data/${fileName}:\n${errorMessages}\nPlease check your JSON formatting.`
    );
  }
  
  return parsed.data as z.infer<T>;
}

// ==========================================
// 2. CACHE (Performance Optimization)
// ==========================================
// Build ke time data sirf EK BAAR load hoga memory mein
let articlesCache: Article[] | null = null;

// ==========================================
// 3. DATA FETCHING FUNCTIONS
// ==========================================

export function getMasterData(): MasterConfig {
  const rawData = readJsonFile("master.json");
  return validateData(MasterSchema, rawData, "master.json");
}

export function getAllArticles(): Article[] {
  if (articlesCache) return articlesCache;

  const articlesDir = path.join(process.cwd(), "data", "articles");
  
  if (!fs.existsSync(articlesDir)) {
    throw new Error("❌ Data Error: 'data/articles' directory not found!");
  }

  const fileNames = fs.readdirSync(articlesDir);
  let allArticles: Article[] = [];

  for (const fileName of fileNames) {
    if (fileName.endsWith(".json")) {
      const rawData = readJsonFile(`articles/${fileName}`);
      const parsedData = validateData(ArticleListSchema, rawData, `articles/${fileName}`);
      allArticles = [...allArticles, ...parsedData.articles];
    }
  }

  // 🚀 SENIOR FIX: Sort articles by date (Newest first)
  // Isse Homepage par latest articles sabse upar aayenge
  allArticles.sort((a, b) => {
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  articlesCache = allArticles;
  return allArticles;
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

// 🚀 NAYA FUNCTION: Category wise articles fetch karne ke liye (Aage kaam aayega)
export function getArticlesByCategory(categoryId: string): Article[] {
  return getAllArticles().filter((a) => a.categories.includes(categoryId));
}

export function getMediaData(): Media {
  const rawData = readJsonFile("media.json");
  return validateData(MediaSchema, rawData, "media.json");
}

export function getVisionData(): VisionData {
  const rawData = readJsonFile("vision.json");
  return validateData(VisionSchema, rawData, "vision.json");
}

export function getPeopleData(): PeopleData {
  const rawData = readJsonFile("people.json");
  return validateData(PeopleDataSchema, rawData, "people.json");
}

export function getCategoriesData(): CategoriesData {
  const rawData = readJsonFile("categories.json");
  return validateData(CategoriesDataSchema, rawData, "categories.json");
}

export function getDirectoryData(): DirectoryData {
  const rawData = readJsonFile("directory.json");
  return validateData(DirectoryDataSchema, rawData, "directory.json");
}