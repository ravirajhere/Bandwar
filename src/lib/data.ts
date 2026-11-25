import 'server-only';
import fs from "fs";
import path from "path";
import { z } from "zod";
import {
  MasterSchema, ArticleListSchema, MediaSchema,
  PeopleDataSchema, CategoriesDataSchema, DirectoryDataSchema,
  ContributorsDataSchema,
  EdgesDataSchema, StewardshipDataSchema, AbsencesDataSchema, QueueDataSchema,
  MasterConfig, Article, Media, PeopleData, CategoriesData, DirectoryData,
  Edge, EdgesData, StewardshipEntry, StewardshipData, AbsenceRecord, AbsencesData,
  QueueData, Provenance,
} from "./schema";
import { Contributor } from "./contributor";
import {
  FALLBACK_IMAGE,
  resolveHeroPath,
  imageExists,
} from "./media";

// Re-export for backward compat
export { FALLBACK_IMAGE };

// ==========================================
// 1. CORE HELPERS
// ==========================================

// TODO(phase-1): remove — superseded by resolveHeroPath() in ./media
export function getArticleImage(image?: string | null): string {
  if (!image || image.trim() === "") return FALLBACK_IMAGE;
  return image.split("?")[0];
}

// TODO(phase-1): remove — superseded by resolveHeroPath() in ./media
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
  return parsed.data;
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
  edges: null as EdgesData | null,
  stewardship: null as StewardshipData | null,
  absences: null as AbsencesData | null,
  queue: null as QueueData | null,
};

export function clearCache() {
  (Object.keys(cache) as (keyof typeof cache)[]).forEach((k) => {
    cache[k] = null;
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

      // TODO(phase-1): remove displayHero/displayImage — use resolveHeroPath(article.hero) in UI
      const safeArticles = parsedData.articles.map((art) => ({
        ...art,
        displayHero: resolveHeroPath(art.hero),
        displayImage: resolveHeroPath(art.hero),
      }));

      allArticles = [...allArticles, ...safeArticles];
    }
  }

  allArticles.sort((a, b) => {
    const aDate = a.dateModified || a.lastUpdated;
    const bDate = b.dateModified || b.lastUpdated;
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
    published: article.datePublished || article.lastUpdated,
    modified: article.dateModified || article.lastUpdated,
  };
}

export function getMediaData(): Media {
  if (cache.media) return cache.media;

  const rawData = readJsonFile("media.json");
  const media = validateData(MediaSchema, rawData, "media.json");

  const missing: string[] = [];
  if (media.gallery && media.gallery.photos) {
    media.gallery.photos = media.gallery.photos.filter((photo) => {
      const exists = imageExists(photo.src);
      if (!exists) missing.push(photo.src);
      return exists;
    });
  }
  if (missing.length > 0) {
    console.warn(`⚠️  getMediaData: ${missing.length} gallery photo(s) missing — hidden from gallery:`);
    missing.forEach((src) => console.warn(`   - ${src}`));
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
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  return all
    .filter((c) => c.joinedAt && new Date(c.joinedAt) >= cutoffDate)
    .sort((a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime());
}

// ==========================================
// 4. PHASE 0 LOADERS (new)
// ==========================================

export function getEdges(): EdgesData {
  if (cache.edges) return cache.edges;
  const fullPath = path.join(process.cwd(), "data", "edges.json");
  if (!fs.existsSync(fullPath)) {
    cache.edges = { version: "1.0", edges: [] };
    return cache.edges;
  }
  const rawData = readJsonFile("edges.json");
  cache.edges = validateData(EdgesDataSchema, rawData, "edges.json");
  return cache.edges;
}

export function getStewardshipLog(): StewardshipData {
  if (cache.stewardship) return cache.stewardship;
  const fullPath = path.join(process.cwd(), "data", "stewardship.json");
  if (!fs.existsSync(fullPath)) {
    cache.stewardship = { version: "1.0", entries: [] };
    return cache.stewardship;
  }
  const rawData = readJsonFile("stewardship.json");
  cache.stewardship = validateData(StewardshipDataSchema, rawData, "stewardship.json");
  return cache.stewardship;
}

export function getAbsences(): AbsencesData {
  if (cache.absences) return cache.absences;
  const fullPath = path.join(process.cwd(), "data", "absences.json");
  if (!fs.existsSync(fullPath)) {
    cache.absences = { version: "1.0", absences: [] };
    return cache.absences;
  }
  const rawData = readJsonFile("absences.json");
  cache.absences = validateData(AbsencesDataSchema, rawData, "absences.json");
  return cache.absences;
}

export function getQueue(): QueueData {
  if (cache.queue) return cache.queue;
  const fullPath = path.join(process.cwd(), "data", "queue.json");
  if (!fs.existsSync(fullPath)) {
    // FIXED: rejected bhi chahiye — nahi toh schema.ts wala build error aayega
    cache.queue = { pending: [], approved: [], rejected: [] };
    return cache.queue;
  }
  const rawData = readJsonFile("queue.json");
  cache.queue = validateData(QueueDataSchema, rawData, "queue.json");
  return cache.queue;
}

// ==========================================
// 5. SUGGESTIONS FOR PROFILE (new)
// Profile: contributors/[username] pe dikhane ke liye
// Source: data/queue.json hi hai — alag store nahi
// ==========================================

export type ProfileSuggestion = {
  id: string;
  articleId: string;
  articleTitle: string;
  fieldName: string;
  newValue: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  createdAt: string;
};

export function getSuggestionsFor(username: string): ProfileSuggestion[] {
  const normalized = normalizeUsername(username);
  if (!normalized) return [];

  const queue = getQueue() as any;
  const pending = Array.isArray(queue.pending) ? queue.pending : [];
  const approved = Array.isArray(queue.approved) ? queue.approved : [];
  const rejected = Array.isArray(queue.rejected) ? queue.rejected : [];

  const withStatus = [
    ...pending.map((s: any) => ({ ...s, _status: "pending" as const })),
    ...approved.map((s: any) => ({ ...s, _status: "approved" as const })),
    ...rejected.map((s: any) => ({ ...s, _status: "rejected" as const })),
  ];

  return withStatus
    .filter((s: any) => {
      const owner = normalizeUsername(s.suggestedBy || s.userUsername || s.userName || "");
      return owner === normalized;
    })
    .map((s: any) => {
      // Article ka title — contextId se, nahi mila toh contextId hi dikhao
      const article = s.contextId ? getArticleById(String(s.contextId)) : undefined;
      // FIXED: _status ko priority do — s.status me kabhi "staged" bhi aa jata hai
      // FIXED: reason me rejectedReason bhi — nahi toh Reject ka reason khali dikhega
      const status = s._status as ProfileSuggestion["status"];
      return {
        id: String(s.id || `${s.contextId}-${s.timestamp}`),
        articleId: String(s.contextId || ""),
        articleTitle: article?.title || String(s.contextId || "Unknown"),
        fieldName: String(s.field || s.type || "Suggestion"),
        newValue: String(s.newValue ?? s.suggestedValue ?? ""),
        status,
        reason: String(s.reason || s.rejectedReason || s.rejectReason || ""),
        createdAt: String(s.timestamp || s.createdAt || s.submittedAt || ""),
      } as ProfileSuggestion;
    })
    .sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));
}

// ==========================================
// 6. GRAPH & PROVENANCE HELPERS (new)
// ==========================================

export function getConnections(entityId: string): Edge[] {
  const { edges } = getEdges();
  return edges.filter((e) => e.from === entityId || e.to === entityId);
}

export function getStewardshipFor(entityId: string): StewardshipEntry[] {
  const { entries } = getStewardshipLog();
  return entries
    .filter((e) => e.entityId === entityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getAbsencesFor(entityId: string): AbsenceRecord[] {
  const { absences } = getAbsences();
  return absences.filter((a) => a.entityId === entityId);
}

export function getProvenanceFor(entityId: string): Provenance | undefined {
  const article = getArticleById(entityId);
  if (article) return article.provenance;

  const person = getPeopleData().people.find((p) => p.id === entityId);
  if (person) return person.provenance;

  const directoryItem = getDirectoryData().items.find((i) => i.id === entityId);
  if (directoryItem) return directoryItem.provenance;

  return undefined;
}