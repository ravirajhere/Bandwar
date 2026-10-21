import { MetadataRoute } from 'next';
import { getAllArticles, getCategoriesData, getMasterData } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const master = getMasterData();
  const baseUrl = master.site.url;
  const articles = getAllArticles();
  const categories = getCategoriesData().categories;

  // Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/section`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/people`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/vision`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/time`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/place`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/contribute`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Category Pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/section/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Article Pages
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.id}`,
    lastModified: new Date(article.lastUpdated),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}