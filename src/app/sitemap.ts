import { getAllArticles, getCategories } from '@/lib/data';
import { MetadataRoute } from 'next';
import master from '../../data/master.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = master.site.url || 'https://bandwar.vercel.app';
  const articles = getAllArticles();
  const categories = getCategories();

  const articleUrls = articles.map((article: any) => ({
    url: `${baseUrl}/article/${article.id}`,
    lastModified: article.lastUpdated ? new Date(article.lastUpdated) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat: any) => ({
    url: `${baseUrl}/section/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticPages = ['', '/section', '/about', '/people', '/place', '/time', '/vision', '/reach'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.9,
  }));

  return [...staticPages, ...categoryUrls, ...articleUrls];
}