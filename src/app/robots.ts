import { MetadataRoute } from 'next';
import { getMasterData } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  const config = getMasterData();
  const baseUrl = config.site.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',  // 🚀 SECURITY: Block admin panel
          '/api/',   // 🚀 SECURITY: Block APIs
          '/_next/', // Next.js internal assets
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}