import fs from "fs";
import path from "path";
import { z } from "zod";
import { 
  MasterSchema, ArticleListSchema, MediaSchema, 
  PeopleDataSchema, CategoriesDataSchema, DirectoryDataSchema,
  ContributorsDataSchema,
  MasterConfig, Article, Media, PeopleData, CategoriesData, DirectoryData,
} from "./schema";
import { Contributor } from "./contributor";

// ==========================================
// 1. CORE HELPERS
// ==========================================

export const FALLBACK_IMAGE = "/fallback.jpg";

export function getArticleImage(image?: string | null): string {
  if (!image || image.trim() === "") return FALLBACK_IMAGE;
  return image.split("?")[0];
}

export function getMediaImage(src?: string | null): string {
  if (!src || src.trim() === "") return FALLBACK_IMAGE;
  return src.split("?")[0];
}

const readJsonFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), "data", filePath);
  try {
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found at data/${filePath}`);
    }
    const fileContent = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Failed to read or parse data/${filePath}: ${msg}`);
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

function normalizeUsername(u: string): string {
  return u.replace(/^@/, "").toLowerCase().trim();
}

// ==========================================
// 2. IN-MEMORY CACHE
// ==========================================
const cache = {
  articles: null as Article[] | null,
  master: null as MasterConfig | null,
  media: null as Media | null,
  people: null as PeopleData | null,
  categories: null as CategoriesData | null,
  directory: null as DirectoryData | null,
  contributors: null as Contributor[] | null,
};

export function clearCache() {
  (Object.keys(cache) as (keyof typeof cache)[]).forEach((k) => {
    (cache as any)[k] = null;
  });
}

// ==========================================
// 3. DATA FETCHING FUNCTIONS
// ==========================================

export function getMasterData(): MasterConfig {
  if (cache.master) return cache.master;
  const rawData = readJsonFile("master.json");
  cache.master = validateData(MasterSchema, rawData, "master.json");
  return cache.master;
}

export function getAllArticles(): Article[] {
  if (cache.articles) return cache.articles;
  
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
      
      // ✅ SAFE IMAGE CHECKER: Original data untouched, creates 'displayHero' for UI
      const safeArticles = parsedData.articles.map((art: any) => {
        let updatedArt = { ...art };
        
        // 1. Check hero for DISPLAY
        let needsHeroFallback = false;
        if (updatedArt.hero && !updatedArt.hero.startsWith("http")) {
          const cleanSrc = updatedArt.hero.split("?")[0].replace(/^\//, "");
          const imgPath = path.join(process.cwd(), "public", cleanSrc);
          if (!fs.existsSync(imgPath)) needsHeroFallback = true;
        } else if (!updatedArt.hero) {
          needsHeroFallback = true;
        }
        updatedArt.displayHero = needsHeroFallback ? FALLBACK_IMAGE : updatedArt.hero;

        // 2. Check image for DISPLAY
        let needsImgFallback = false;
        if (updatedArt.image && !updatedArt.image.startsWith("http")) {
          const cleanSrc = updatedArt.image.split("?")[0].replace(/^\//, "");
          const imgPath = path.join(process.cwd(), "public", cleanSrc);
          if (!fs.existsSync(imgPath)) needsImgFallback = true;
        } else if (!updatedArt.image) {
           needsImgFallback = true;
        }
        updatedArt.displayImage = needsImgFallback ? FALLBACK_IMAGE : updatedArt.image;

        return updatedArt;
      });

      allArticles = [...allArticles, ...safeArticles];
    }
  }

  allArticles.sort((a, b) => {
    const aDate = (a as any).dateModified || a.lastUpdated;
    const bDate = (b as any).dateModified || b.lastUpdated;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
  
  cache.articles = allArticles;
  return allArticles;
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

export function getArticlesByCategory(categoryId: string): Article[] {
  return getAllArticles().filter(
    (a) => Array.isArray(a.categories) && a.categories.includes(categoryId)
  );
}

export function getArticleDates(article: Article): { published: string; modified: string } {
  return {
    published: (article as any).datePublished || article.lastUpdated,
    modified: (article as any).dateModified || article.lastUpdated,
  };
}

export function getMediaData(): Media {
  if (cache.media) return cache.media;
  
  const rawData = readJsonFile("media.json");
  const media = validateData(MediaSchema, rawData, "media.json");
  
  if (media.gallery && media.gallery.photos) {
    media.gallery.photos = media.gallery.photos.filter((photo) => {
      const pathWithoutQuery = photo.src.split("?")[0];
      const cleanSrc = pathWithoutQuery.startsWith("/")
        ? pathWithoutQuery.slice(1)
        : pathWithoutQuery;
      const imgPath = path.join(process.cwd(), "public", cleanSrc);
      
      const exists = fs.existsSync(imgPath);
      if (!exists) {
        console.log(`⚠️ Gallery Image Missing (Hidden): ${photo.src}`);
      }
      return exists;
    });
  }

  cache.media = media;
  return media;
}

export function getPeopleData(): PeopleData {
  if (cache.people) return cache.people;
  const rawData = readJsonFile("people.json");
  cache.people = validateData(PeopleDataSchema, rawData, "people.json");
  return cache.people;
}

export function getCategoriesData(): CategoriesData {
  if (cache.categories) return cache.categories;
  const rawData = readJsonFile("categories.json");
  cache.categories = validateData(CategoriesDataSchema, rawData, "categories.json");
  return cache.categories;
}

export function getDirectoryData(): DirectoryData {
  if (cache.directory) return cache.directory;
  const rawData = readJsonFile("directory.json");
  cache.directory = validateData(DirectoryDataSchema, rawData, "directory.json");
  return cache.directory;
}

export function getContributors(): Contributor[] {
  if (cache.contributors) return cache.contributors;
  
  const fullPath = path.join(process.cwd(), "data", "contributors.json");
  if (!fs.existsSync(fullPath)) {
    cache.contributors = [];
    return [];
  }
  
  const rawData = readJsonFile("contributors.json");
  const parsed = validateData(ContributorsDataSchema, rawData, "contributors.json");
  
  cache.contributors = parsed.contributors as unknown as Contributor[];
  return cache.contributors;
}

export function getAllContributors(): Contributor[] {
  return getContributors();
}

export function getContributorByUsername(username: string): Contributor | undefined {
  const normalized = normalizeUsername(username);
  return getContributors().find(
    (c) => normalizeUsername(c.username) === normalized
  );
}

export function getRecentContributors(months: number = 6): Contributor[] {
  const all = getContributors();
  const cutoffDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);

  return all
    .filter((c) => c.joinedAt && new Date(c.joinedAt) >= cutoffDate)
    .sort((a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime());
}