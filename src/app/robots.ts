import { MetadataRoute } from 'next';
import { getMasterData } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  const master = getMasterData();
  const baseUrl = master.site.url;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}