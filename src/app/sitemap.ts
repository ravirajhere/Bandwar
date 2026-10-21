import { getAllArticles } from '@/lib/data';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bandwar.vercel.app'; // Apna domain daalna
  const articles = getAllArticles();

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/article/${article.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/section`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...articleUrls,
  ];
}