import { MetadataRoute } from 'next';
import {
  getMasterData,
  getAllArticles,
  getPeopleData,
  getCategoriesData,
  getMediaData,
  getContributors,
} from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const now = new Date();

  // Returns a valid Date capped at "now", or undefined if input is missing/invalid
  const safeDate = (input?: string | Date): Date | undefined => {
    if (!input) return undefined;
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) return undefined;
    return parsed > now ? now : parsed;
  };

  // Only include lastModified when we actually have real data
  const withLM = (d?: Date): { lastModified?: Date } => (d ? { lastModified: d } : {});

  // Site-level date — optional, so builds don't look "fresh" unnecessarily
  const siteLastUpdated = safeDate((config as any).lastUpdated);

  const priority = (config.sitemap?.priority || {
    home: 1.0,
    articles: 0.9,
    directory: 0.7,
    map: 0.8,
    gallery: 0.7,
    about: 0.6,
    people: 0.7,
    legal: 0.3,
  }) as Record<string, number>;

  // ---------- DATA ----------
  const articles = getAllArticles().filter((a: any) => a.published !== false);
  const categories = getCategoriesData()?.categories ?? [];
  const people = (getPeopleData()?.people ?? []).filter((p: any) => {
    if (p.published === false) return false;
    if (!p.bio || p.bio.length < 20) return false;
    if (p.bio.includes("currently being compiled")) return false;
    return true;
  });
  const media = getMediaData();
  const contributors = getContributors() ?? [];

  // ---------- IMAGE UTILS ----------

  const cleanImage = (img: string): string => {
    if (!img) return "";
    const noQuery = img.split('?')[0];
    const path = noQuery.replace(/^\//, "");
    if (path === "fallback.jpg" || noQuery.endsWith("/fallback.jpg")) return "";
    return noQuery.startsWith("http") ? noQuery : `${baseUrl}/${path}`;
  };

  // ✅ Per-URL dedup only — do NOT share across URLs
  const getUniqueImages = (rawImages: string[]): string[] => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const img of rawImages) {
      const cleaned = cleanImage(img);
      if (cleaned && !seen.has(cleaned)) {
        seen.add(cleaned);
        unique.push(cleaned);
      }
    }
    return unique;
  };

  // ---------- 1. ARTICLES (first — highest priority for images) ----------
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    const rawImages: string[] = [];
    if (article.hero) rawImages.push(article.hero);
    article.photos?.forEach((photo: any) => {
      if (photo?.src) rawImages.push(photo.src);
    });

    const slug = (article as any).slug || article.id;

    return {
      url: `${baseUrl}/article/${encodeURIComponent(slug)}`,
      lastModified: safeDate(
        (article as any).dateModified || article.lastUpdated || (article as any).date
      ),
      changeFrequency: 'monthly',
      priority: priority.articles,
      images: getUniqueImages(rawImages),
    };
  });

  // ---------- 2. STATIC PAGES ----------
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      ...withLM(siteLastUpdated),
      changeFrequency: 'weekly',
      priority: priority.home,
      images: config.home?.hero?.image
        ? getUniqueImages([config.home.hero.image])
        : [],
    },
    {
      url: `${baseUrl}/gallery`,
      ...withLM(siteLastUpdated),
      changeFrequency: 'monthly',
      priority: priority.gallery,
      images: getUniqueImages((media?.gallery?.photos ?? []).map((p: any) => p.src)),
    },
    { url: `${baseUrl}/directory`,    ...withLM(siteLastUpdated), changeFrequency: 'weekly',  priority: priority.directory },
    { url: `${baseUrl}/people`,       ...withLM(siteLastUpdated), changeFrequency: 'monthly', priority: priority.people },
    { url: `${baseUrl}/map`,          ...withLM(siteLastUpdated), changeFrequency: 'monthly', priority: priority.map },
    { url: `${baseUrl}/section`,      ...withLM(siteLastUpdated), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/about`,        ...withLM(siteLastUpdated), changeFrequency: 'monthly', priority: priority.about },
    { url: `${baseUrl}/contribute`,   ...withLM(siteLastUpdated), changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${baseUrl}/contributors`, ...withLM(siteLastUpdated), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`,      ...withLM(siteLastUpdated), changeFrequency: 'yearly',  priority: priority.legal },
    { url: `${baseUrl}/terms`,        ...withLM(siteLastUpdated), changeFrequency: 'yearly',  priority: priority.legal },
  ];

  // ---------- 3. CATEGORY PAGES ----------
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((cat: any) => articles.some((a: any) => a.categories?.includes(cat.id)))
    .map((cat: any) => {
      const catArticles = articles.filter((a: any) => a.categories?.includes(cat.id));
      const latest = catArticles.length
        ? Math.max(
            ...catArticles.map((a: any) =>
              (safeDate((a as any).dateModified || a.lastUpdated || (a as any).date) ?? now).getTime()
            )
          )
        : (siteLastUpdated?.getTime() ?? now.getTime());

      return {
        url: `${baseUrl}/section/${encodeURIComponent(cat.id)}`,
        lastModified: new Date(latest),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });

  // ---------- 4. PEOPLE ----------
  const peopleRoutes: MetadataRoute.Sitemap = people.map((person: any) => ({
    url: `${baseUrl}/people/${encodeURIComponent(person.id)}`,
    lastModified: safeDate(person.lastUpdated),
    changeFrequency: 'monthly',
    priority: priority.people,
    images: person.photo ? getUniqueImages([person.photo]) : [],
  }));

  // ---------- 5. CONTRIBUTORS ----------
  const contributorRoutes: MetadataRoute.Sitemap = contributors.map((c: any) => ({
    url: `${baseUrl}/contributors/${encodeURIComponent(c.username)}`,
    ...withLM(siteLastUpdated),
    changeFrequency: 'monthly',
    priority: 0.5,
    images: c.photo ? getUniqueImages([c.photo]) : [],
  }));

  // ---------- RETURN ----------
  return [
    ...articleRoutes,
    ...staticRoutes,
    ...categoryRoutes,
    ...peopleRoutes,
    ...contributorRoutes,
  ];
}