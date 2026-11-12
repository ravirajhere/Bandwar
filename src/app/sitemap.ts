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
  
  const getSafeDate = (dateStr?: string | Date) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    const now = new Date();
    return d > now ? now : d;
  };

  const siteLastUpdated = getSafeDate((config as any).lastUpdated);
  
  const priority = (config.sitemap?.priority || {
    home: 1.0, articles: 0.9, directory: 0.7, map: 0.8,
    gallery: 0.7, about: 0.6, legal: 0.3,
  }) as Record<string, number>;
  
  const articles = getAllArticles().filter((a: any) => a.published !== false);
  const categories = getCategoriesData().categories;
  const people = getPeopleData().people.filter((p: any) => {
    if (p.published === false) return false;
    if (!p.bio || p.bio.length < 20) return false;
    if (p.bio.includes("currently being compiled")) return false;
    return true;
  });

  const media = getMediaData();
  const contributors = getContributors();
  
  // 🚀 Global Set to track added images and prevent duplicates
  const addedImages = new Set<string>();

  const cleanImage = (img: string) => {
    if (!img) return "";
    const clean = img.split('?')[0].replace(/^\//, "");
    if (clean === "fallback.jpg") return "";
    return img.startsWith("http") ? img : `${baseUrl}/${clean}`;
  };

  const getUniqueImages = (rawImages: string[]) => {
    const unique: string[] = [];
    rawImages.forEach(img => {
      const cleaned = cleanImage(img);
      if (cleaned && !addedImages.has(cleaned)) {
        addedImages.add(cleaned);
        unique.push(cleaned);
      }
    });
    return unique;
  };

  // ==========================================
  // 🚀 1. ARTICLES FIRST (Highest Priority for Images)
  // ==========================================
  // Hum pehle articles scan karenge. Agar koi image Article Hero mein hai, 
  // toh woh pehle 'addedImages' Set mein chali jayegi.
  const articleRoutes: MetadataRoute.Sitemap = articles.map(article => {
    const rawImages: string[] = [];
    
    // Hero ko sabse pehle uthayenge
    if (article.hero) rawImages.push(article.hero);
    
    // Uske baad article ki baaki photos
    article.photos?.forEach(photo => {
      if (photo.src) rawImages.push(photo.src);
    });
    
    return {
      url: `${baseUrl}/article/${article.id}`,
      lastModified: getSafeDate((article as any).dateModified || article.lastUpdated),
      changeFrequency: 'monthly',
      priority: priority.articles,
      images: getUniqueImages(rawImages), // Article URL claim karega image ko
    };
  });

  // ==========================================
  // 🚀 2. STATIC PAGES (Home & Gallery)
  // ==========================================
  // Ab jab Gallery scan hogi, toh jo images Article Hero mein use ho chuki hain, 
  // woh Set mein hain, isliye Gallery unko skip kar degi.
  const staticRoutes: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      lastModified: siteLastUpdated, 
      changeFrequency: 'weekly', 
      priority: priority.home, 
      images: config.home?.hero?.image ? getUniqueImages([config.home.hero.image]) : [] 
    },
    { 
      url: `${baseUrl}/gallery`, 
      lastModified: siteLastUpdated, 
      changeFrequency: 'monthly', 
      priority: priority.gallery, 
      // Sirf wahi images aayengi jo kisi article mein nahi hain (Gallery exclusive)
      images: getUniqueImages(media.gallery.photos.map(p => p.src)) 
    },
    { url: `${baseUrl}/directory`, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: priority.directory },
    { url: `${baseUrl}/people`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/map`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.map },
    { url: `${baseUrl}/section`, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.about },
    { url: `${baseUrl}/contribute`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/contributors`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: priority.legal },
    { url: `${baseUrl}/terms`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: priority.legal },
  ];
  
  // ==========================================
  // 3. DYNAMIC CATEGORY PAGES
  // ==========================================
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter(cat => articles.some(a => a.categories.includes(cat.id)))
    .map(cat => {
      const catArticles = articles.filter(a => a.categories.includes(cat.id));
      const latest = Math.max(...catArticles.map(a => getSafeDate((a as any).dateModified || a.lastUpdated).getTime()));
      return {
        url: `${baseUrl}/section/${cat.id}`,
        lastModified: new Date(latest),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });
  
  // ==========================================
  // 4. PEOPLE PAGES
  // ==========================================
  const peopleRoutes: MetadataRoute.Sitemap = people.map((person: any) => ({
    url: `${baseUrl}/people/${person.id}`,
    lastModified: getSafeDate(person.lastUpdated),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: person.photo ? getUniqueImages([person.photo]) : [],
  }));

  // ==========================================
  // 5. CONTRIBUTORS PAGES
  // ==========================================
  const contributorRoutes: MetadataRoute.Sitemap = contributors.map((c: any) => ({
    url: `${baseUrl}/contributors/${encodeURIComponent(c.username)}`,
    lastModified: siteLastUpdated,
    changeFrequency: 'monthly',
    priority: 0.5,
    images: c.photo ? getUniqueImages([c.photo]) : [],
  }));
  
  // Return array
  return [
    ...articleRoutes,     // Articles sabse pehle
    ...staticRoutes,      // Uske baad static pages (Gallery)
    ...categoryRoutes,
    ...peopleRoutes,
    ...contributorRoutes,
  ];
}