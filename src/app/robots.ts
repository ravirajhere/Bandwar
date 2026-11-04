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
          '/admin',  // Admin panel block
          '/api/',   // API routes block
          // '/_next/' 🚀 HATA DIYA HAI taaki Google CSS/JS load kar sake
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}