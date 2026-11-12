import { MetadataRoute } from 'next';
import { getMasterData } from '@/lib/data';

export default function robots(): MetadataRoute.Robots {
  const config = getMasterData();
  const baseUrl = config.site.url;

  return {
    rules: [
      {
        // 🌍 1. General Crawlers: Sab kuch allow hai, sirf admin/api block hai
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',  // Security: Admin panel
          '/api/',   // Security: Internal APIs
        ],
      },
      {
        // 🖼️ 2. Google Image Bot (Image SEO)
        // Google Images mein sabse pehle aane ke liye explicit permission
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/', // Sirf images folder allow
          '/',        // Baaki site bhi allow
        ],
        disallow: [
          '/admin',
          '/api/',
        ],
      },
      {
        // 🖼️ 3. Bing Image Bot (Microsoft Image Search)
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
        ],
      },
      {
        // 🧠 4. AI & LLM Bots (Open Data Philosophy)
        // Taaki AI Overviews, ChatGPT, Claude aapke data ko reference kar sake
        userAgent: [
          'Google-Extended', // Google AI Overviews (SGE)
          'GPTBot',          // OpenAI (ChatGPT)
          'CCBot',           // Common Crawl (Research)
          'ClaudeBot',       // Anthropic (Claude AI)
          'Applebot-Extended',// Apple Intelligence
          'PerplexityBot'    // Perplexity AI
        ],
        allow: '/', // Pura data khula hai!
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}