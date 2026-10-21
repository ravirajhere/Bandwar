import fs from "fs";
import path from "path";
import { MasterSchema, ArticleListSchema, MediaSchema, MasterConfig, Article, Media } from "./schema";

// Ye function JSON file read karta hai
const readJsonFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), "data", filePath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(fileContents);
};

// 1. Master Data (Nav, Footer, SEO)
export function getMasterData(): MasterConfig {
  const rawData = readJsonFile("master.json");
  const parsed = MasterSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("❌ master.json mein error hai:", parsed.error.format());
    throw new Error("Invalid master.json");
  }
  return parsed.data;
}

// 2. Saare Articles (education, culture, etc. se)
export function getAllArticles(): Article[] {
  const articlesDir = path.join(process.cwd(), "data", "articles");
  const fileNames = fs.readdirSync(articlesDir);
  let allArticles: Article[] = [];

  for (const fileName of fileNames) {
    if (fileName.endsWith(".json")) {
      const rawData = readJsonFile(`articles/${fileName}`);
      const parsed = ArticleListSchema.safeParse(rawData);
      
      if (!parsed.success) {
        console.error(`❌ ${fileName} mein error hai:`, parsed.error.format());
        throw new Error(`Invalid ${fileName}`);
      }
      allArticles = [...allArticles, ...parsed.data.articles];
    }
  }
  return allArticles;
}

// 3. Ek Single Article (ID ke basis par)
export function getArticleById(id: string): Article | undefined {
  const articles = getAllArticles();
  return articles.find((a) => a.id === id);
}

// 4. Media, Timeline, Map Data
export function getMediaData(): Media {
  const rawData = readJsonFile("media.json");
  const parsed = MediaSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("❌ media.json mein error hai:", parsed.error.format());
    throw new Error("Invalid media.json");
  }
  return parsed.data;
}