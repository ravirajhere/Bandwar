import { MetadataRoute } from 'next';
import { getMasterData } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  const config = getMasterData();
  const baseUrl = config.site.url;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 🚫 In pages ko Google search mein nahi dikhna chahiye
      disallow: [
        '/contribute', // Form page ki search mein zaroorat nahi
        '/api/',       // API routes
        '/search',     // Internal search results (Spam se bachne ke liye)
      ],
    },
    // 🗺️ Dono Sitemaps Google ko bata diye hain
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`
    ],
  };
}