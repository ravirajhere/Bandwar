import fs from "fs";
import path from "path";
import { z } from "zod";
import { 
  MasterSchema, ArticleListSchema, MediaSchema, VisionSchema, 
  PeopleDataSchema, CategoriesDataSchema, DirectoryDataSchema, 
  MasterConfig, Article, Media, VisionData, PeopleData, CategoriesData, DirectoryData 
} from "./schema";
import { Contributor } from "./contributor"; 

// ==========================================
// 1. CORE HELPERS (Optimized & Generic)
// ==========================================
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

function validateData<T extends z.ZodTypeAny>(schema: T, data: unknown, fileName: string): z.infer<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(
      (issue) => `  → Field [${issue.path.join(".")}]: ${issue.message}`
    ).join("\n");
    throw new Error(`❌ Validation Failed in data/${fileName}:\n${errorMessages}`);
  }
  return parsed.data as z.infer<T>;
}

// ==========================================
// 2. CACHE 
// ==========================================
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
  
  if (!fs.existsSync(articlesDir)) throw new Error("❌ Data Error: 'data/articles' directory not found!");
  
  const fileNames = fs.readdirSync(articlesDir);
  let allArticles: Article[] = [];

  for (const fileName of fileNames) {
    if (fileName.endsWith(".json")) {
      const rawData = readJsonFile(`articles/${fileName}`);
      const parsedData = validateData(ArticleListSchema, rawData, `articles/${fileName}`);
      allArticles = [...allArticles, ...parsedData.articles];
    }
  }

  allArticles.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  articlesCache = allArticles;
  return allArticles;
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

export function getArticlesByCategory(categoryId: string): Article[] {
  return getAllArticles().filter((a) => a.categories.includes(categoryId));
}

export function getMediaData(): Media {
  const rawData = readJsonFile("media.json");
  const media = validateData(MediaSchema, rawData, "media.json");
  
  // ✅ MAGIC: Filter out photos whose image files don't exist in public folder
  if (media.gallery && media.gallery.photos) {
    media.gallery.photos = media.gallery.photos.filter((photo) => {
      // Agar path ke aage '/' hai toh hata do
      const cleanSrc = photo.src.startsWith("/") ? photo.src.slice(1) : photo.src;
      const imgPath = path.join(process.cwd(), "public", cleanSrc);
      
      const exists = fs.existsSync(imgPath);
      if (!exists) {
        console.log(`⚠️ Gallery Image Missing (Hidden): ${photo.src}`);
      }
      return exists; // Sirf wahi photo rakhega jo folder me sach me hai
    });
  }

  return media;
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

// ==========================================
// 4. CONTRIBUTORS DATA
// ==========================================

export function getContributors(): Contributor[] {
  const fullPath = path.join(process.cwd(), "data", "contributors.json");
  
  // Agar file abhi tak nahi bani hai, toh crash mat karo, khali array return karo
  if (!fs.existsSync(fullPath)) {
    return [];
  }

  try {
    const rawData = readJsonFile("contributors.json");
    return rawData.contributors || [];
  } catch (error) {
    console.error("Failed to read contributors.json:", error);
    return [];
  }
}

export function getContributorByUsername(username: string): Contributor | undefined {
  const contributors = getContributors();
  // Handle both "@rameshkumar" and "rameshkumar"
  const formattedUsername = username.startsWith("@") ? username : `@${username}`;
  
  return contributors.find(
    (c) => c.username.toLowerCase() === formattedUsername.toLowerCase()
  );
}

// 🚀 NAYA FUNCTION: Pichle X mahine ke contributors (Filter by joinedAt)
export function getRecentContributors(months: number = 6): Contributor[] {
  const all = getContributors();
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  return all.filter(c => {
    if (!c.joinedAt) return false;
    return new Date(c.joinedAt) >= cutoffDate;
  }).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()); // Newest first
}