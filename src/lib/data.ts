import fs from "fs";
import path from "path";
import { 
  MasterSchema, ArticleListSchema, MediaSchema, VisionSchema, 
  PeopleDataSchema, CategoriesDataSchema,
  MasterConfig, Article, Media, VisionData, PeopleData, CategoriesData
} from "./schema";

const readJsonFile = (filePath: string) => {
  const fullPath = path.join(process.cwd(), "data", filePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
};

export function getMasterData(): MasterConfig {
  const rawData = readJsonFile("master.json");
  const parsed = MasterSchema.safeParse(rawData);
  if (!parsed.success) throw new Error("Invalid master.json: " + JSON.stringify(parsed.error.format()));
  return parsed.data;
}

export function getAllArticles(): Article[] {
  const articlesDir = path.join(process.cwd(), "data", "articles");
  const fileNames = fs.readdirSync(articlesDir);
  let allArticles: Article[] = [];
  for (const fileName of fileNames) {
    if (fileName.endsWith(".json")) {
      const rawData = readJsonFile(`articles/${fileName}`);
      const parsed = ArticleListSchema.safeParse(rawData);
      if (!parsed.success) throw new Error(`Invalid ${fileName}: ` + JSON.stringify(parsed.error.format()));
      allArticles = [...allArticles, ...parsed.data.articles];
    }
  }
  return allArticles;
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

export function getMediaData(): Media {
  const rawData = readJsonFile("media.json");
  const parsed = MediaSchema.safeParse(rawData);
  if (!parsed.success) throw new Error("Invalid media.json: " + JSON.stringify(parsed.error.format()));
  return parsed.data;
}

export function getVisionData(): VisionData {
  const rawData = readJsonFile("vision.json");
  const parsed = VisionSchema.safeParse(rawData);
  if (!parsed.success) throw new Error("Invalid vision.json: " + JSON.stringify(parsed.error.format()));
  return parsed.data;
}

export function getPeopleData(): PeopleData {
  const rawData = readJsonFile("people.json");
  const parsed = PeopleDataSchema.safeParse(rawData);
  if (!parsed.success) throw new Error("Invalid people.json: " + JSON.stringify(parsed.error.format()));
  return parsed.data;
}

// 👇 Naya function
export function getCategoriesData(): CategoriesData {
  const rawData = readJsonFile("categories.json");
  const parsed = CategoriesDataSchema.safeParse(rawData);
  if (!parsed.success) throw new Error("Invalid categories.json: " + JSON.stringify(parsed.error.format()));
  return parsed.data;
}