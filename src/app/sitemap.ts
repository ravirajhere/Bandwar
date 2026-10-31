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
      url: `${baseUrl}/reach`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vision`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
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
  const articles = getAllArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.id}`,
    lastModified: new Date(article.lastUpdated), // Article ki actual last updated date use ki
    changeFrequency: 'monthly',
    priority: 0.9, // Articles high priority
  }));

  // 4. DYNAMIC PEOPLE PAGES (`/people/[id]`)
  const people = getPeopleData().people;
  const peopleRoutes: MetadataRoute.Sitemap = people.map((person) => ({
    url: `${baseUrl}/people/${person.id}`,
    lastModified: new Date(), // Agar future me lastUpdated add karein toh wo use karein
    changeFrequency: 'yearly', // People ki profile jaldi nahi badalti
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