import { MetadataRoute } from 'next';
import { getMasterData, getAllArticles, getPeopleData, getCategoriesData } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const config = getMasterData();
  const baseUrl = config.site.url;

  // 1. STATIC PAGES (Jo hamesha rahenge)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Homepage ki priority sabse zyada
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // Directory bahut important hai
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/people`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/map`, // 🚀 NAYA: Reach ki jagah Map add kiya
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/section`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 2. DYNAMIC CATEGORY PAGES (`/section/[id]`)
  const categories = getCategoriesData().categories;
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/section/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. DYNAMIC ARTICLE PAGES (`/article/[id]`)
  // Ye automatically naye IDs use karega kyunki data.ts naye JSON padh raha hai
  const articles = getAllArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.id}`,
    lastModified: new Date(article.lastUpdated), 
    changeFrequency: 'monthly',
    priority: 0.9, 
  }));

  // 4. DYNAMIC PEOPLE PAGES (`/people/[id]`)
  const people = getPeopleData().people;
  const peopleRoutes: MetadataRoute.Sitemap = people.map((person) => ({
    url: `${baseUrl}/people/${person.id}`,
    lastModified: new Date(), 
    changeFrequency: 'yearly', 
    priority: 0.7,
  }));

  // Combine all routes
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...peopleRoutes,
  ];
}