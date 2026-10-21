import { MetadataRoute } from 'next';
import master from '../../data/master.json';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = master.site.url || 'https://bandwar.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}