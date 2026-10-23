import { MetadataRoute } from 'next';
import { getMasterData } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  const master = getMasterData();
  // Trailing slash remove karne ke liye (safety check)
  const baseUrl = master.site.url.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Next.js ke internal build folders aur admin routes ko block kar rahe hain
        disallow: [
          '/_next/',
          '/api/', 
          '/admin/'
        ],
      },
      // Major search engines ke liye specific rules
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: ['/_next/', '/api/', '/admin/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl, // Yandex jaise search engines ke liye helpful
  };
}