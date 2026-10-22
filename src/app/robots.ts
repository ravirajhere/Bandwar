import { MetadataRoute } from 'next';
import { getMasterData } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  const master = getMasterData();
  const baseUrl = master.site.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Next.js ke internal build folders ko crawl karne ki zaroorat nahi hoti
        disallow: [
          '/_next/',
          '/api/', 
          '/admin/'
        ],
      },
      // Specific rules for major search engines (optional but good practice)
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: ['/_next/', '/api/', '/admin/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl, // Kuch search engines (like Yandex) ke liye helpful hota hai
  };
}