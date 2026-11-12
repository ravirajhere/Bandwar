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
  
  // 🚀 SEO FIX 1: Never use future dates. Google flags them as spam.
  const getSafeDate = (dateStr?: string | Date) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    const now = new Date();
    return d > now ? now : d; // Agar date future mein hai, toh aaj ki date dikhao
  };

  const siteLastUpdated = getSafeDate((config as any).lastUpdated);
  
  const priority = (config.sitemap?.priority || {
    home: 1.0, articles: 0.9, directory: 0.7, map: 0.8,
    gallery: 0.7, about: 0.6, legal: 0.3,
  }) as Record<string, number>;
  
  const articles = getAllArticles().filter((a: any) => a.published !== false);
  const categories = getCategoriesData().categories;
  
  // 🚀 SEO FIX 2: Exclude "Thin Content" (Khokhle profiles). 
  // Sirf wahi log sitemap mein jayenge jinka bio 20 characters se lamba hai aur placeholder nahi hai.
  const people = getPeopleData().people.filter((p: any) => {
    if (p.published === false) return false;
    if (!p.bio || p.bio.length < 20) return false;
    if (p.bio.includes("currently being compiled")) return false;
    return true;
  });

  const media = getMediaData();
  const contributors = getContributors();
  
  // 🚀 SEO FIX 3: Fallback image ko sitemap se hatao (Google ko fake images nahi chahiye)
  const cleanImage = (img: string) => {
    if (!img) return "";
    const clean = img.split('?')[0].replace(/^\//, "");
    if (clean === "fallback.jpg") return "";
    return img.startsWith("http") ? img : `${baseUrl}/${clean}`;
  };

  // ============ 1. STATIC PAGES ============
  const staticRoutes: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      lastModified: siteLastUpdated, 
      changeFrequency: 'weekly', 
      priority: priority.home, 
      images: config.home?.hero?.image ? [cleanImage(config.home.hero.image)].filter(Boolean) : [] 
    },
    { url: `${baseUrl}/directory`, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: priority.directory },
    { url: `${baseUrl}/gallery`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.gallery, images: media.gallery.photos.slice(0, 1000).map(p => cleanImage(p.src)).filter(Boolean) },
    { url: `${baseUrl}/people`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/map`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.map },
    { url: `${baseUrl}/section`, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.about },
    { url: `${baseUrl}/contribute`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/contributors`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: priority.legal },
    { url: `${baseUrl}/terms`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: priority.legal },
  ];
  
  // ============ 2. DYNAMIC CATEGORY PAGES ============
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
  
  // ============ 3. ARTICLES ============
  const articleRoutes: MetadataRoute.Sitemap = articles.map(article => {
    const rawImages: string[] = [];
    
    if (article.hero) rawImages.push(cleanImage(article.hero));
    article.photos?.forEach(photo => {
      if (photo.src) rawImages.push(cleanImage(photo.src));
    });
    
    const uniqueImages = Array.from(new Set(rawImages)).filter(Boolean);
    
    return {
      url: `${baseUrl}/article/${article.id}`,
      lastModified: getSafeDate((article as any).dateModified || article.lastUpdated),
      changeFrequency: 'monthly',
      priority: priority.articles,
      images: uniqueImages,
    };
  });
  
  // ============ 4. PEOPLE PAGES ============
  const peopleRoutes: MetadataRoute.Sitemap = people.map((person: any) => ({
    url: `${baseUrl}/people/${person.id}`,
    lastModified: getSafeDate(person.lastUpdated),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: person.photo ? [cleanImage(person.photo)].filter(Boolean) : [],
  }));

  // ============ 5. CONTRIBUTORS PAGES ============
  const contributorRoutes: MetadataRoute.Sitemap = contributors.map((c: any) => ({
    url: `${baseUrl}/contributors/${encodeURIComponent(c.username)}`,
    lastModified: siteLastUpdated,
    changeFrequency: 'monthly',
    priority: 0.5,
    images: c.photo ? [cleanImage(c.photo)].filter(Boolean) : [],
  }));
  
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...peopleRoutes,
    ...contributorRoutes,
  ];
}