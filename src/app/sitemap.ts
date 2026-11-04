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
  
  // 🚀 TYPESCRIPT FIX: Cast to any to avoid "Argument of type '{}' is not assignable" error
  const siteLastUpdated = new Date((config as any).lastUpdated || Date.now());
  
  const priority = (config.sitemap?.priority || {
    home: 1.0, articles: 0.9, directory: 0.7, map: 0.8,
    gallery: 0.7, about: 0.6, legal: 0.3,
  }) as Record<string, number>;
  
  // 🚀 TYPESCRIPT FIX: Cast a and p to any for published filter
  const articles = getAllArticles().filter((a: any) => a.published !== false);
  const categories = getCategoriesData().categories;
  const people = getPeopleData().people.filter((p: any) => p.published !== false);
  const media = getMediaData();
  const contributors = getContributors();
  
  // 1. STATIC PAGES
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: priority.home, images: config.home?.hero?.image ? [`${baseUrl}/${config.home.hero.image.replace(/^\//, "")}`] : [] },
    { url: `${baseUrl}/directory`, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: priority.directory },
    { url: `${baseUrl}/gallery`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.gallery, images: media.gallery.photos.slice(0, 1000).map(p => `${baseUrl}/${p.src.split('?')[0].replace(/^\//, "")}`) },
    { url: `${baseUrl}/people`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/map`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.map },
    { url: `${baseUrl}/section`, lastModified: siteLastUpdated, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: priority.about },
    { url: `${baseUrl}/contribute`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/contributors`, lastModified: siteLastUpdated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: priority.legal },
    { url: `${baseUrl}/terms`, lastModified: siteLastUpdated, changeFrequency: 'yearly', priority: priority.legal },
  ];
  
  // 2. DYNAMIC CATEGORY PAGES (Only if they have articles)
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter(cat => articles.some(a => a.categories.includes(cat.id)))
    .map(cat => {
      const catArticles = articles.filter(a => a.categories.includes(cat.id));
      const latest = Math.max(...catArticles.map(a => new Date((a as any).dateModified || a.lastUpdated).getTime()));
      return {
        url: `${baseUrl}/section/${cat.id}`,
        lastModified: new Date(latest),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });
  
  // 3. ARTICLES (With Images)
  const articleRoutes: MetadataRoute.Sitemap = articles.map(article => {
    const images: string[] = [];
    if (article.hero) images.push(article.hero.startsWith("http") ? article.hero : `${baseUrl}/${article.hero.split('?')[0].replace(/^\//, "")}`);
    article.photos?.forEach(photo => {
      if (photo.src) images.push(photo.src.startsWith("http") ? photo.src : `${baseUrl}/${photo.src.split('?')[0].replace(/^\//, "")}`);
    });
    
    return {
      url: `${baseUrl}/article/${article.id}`,
      lastModified: new Date((article as any).dateModified || article.lastUpdated),
      changeFrequency: 'monthly',
      priority: priority.articles,
      images: images.filter(Boolean),
    };
  });
  
  // 4. PEOPLE PAGES
  const peopleRoutes: MetadataRoute.Sitemap = people.map((person: any) => ({
    url: `${baseUrl}/people/${person.id}`,
    lastModified: person.lastUpdated ? new Date(person.lastUpdated) : siteLastUpdated,
    changeFrequency: 'monthly',
    priority: 0.7,
    images: person.photo ? [`${baseUrl}/${person.photo.split('?')[0].replace(/^\//, "")}`] : [],
  }));

  // 5. CONTRIBUTORS PAGES (E-E-A-T)
  const contributorRoutes: MetadataRoute.Sitemap = contributors.map((c: any) => ({
    url: `${baseUrl}/contributors/${c.username}`,
    lastModified: siteLastUpdated,
    changeFrequency: 'monthly',
    priority: 0.5,
    images: c.photo ? [`${baseUrl}/${c.photo.split('?')[0].replace(/^\//, "")}`] : [],
  }));
  
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...peopleRoutes,
    ...contributorRoutes,
  ];
}