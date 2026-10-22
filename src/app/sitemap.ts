import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bandwar.vercel.app'
  
  // 1. Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ]

  // 2. Saare articles aur unki images
  const articles = getAllArticles()
  
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    // Article ki saari images collect kar rahe hain
    const articleImages: string[] = []
    
    // Hero image (agar hai toh)
    if (article.hero) {
      // Data me path 'images/...' hota hai, usme leading slash add kar rahe hain
      articleImages.push(`${baseUrl}/${article.hero.replace(/^\//, '')}`)
    }
    
    // Gallery/Photos (agar hain toh)
    if (article.photos && article.photos.length > 0) {
      article.photos.forEach((photo) => {
        articleImages.push(`${baseUrl}/${photo.src.replace(/^\//, '')}`)
      })
    }

    return {
      url: `${baseUrl}/article/${article.id}`,
      lastModified: new Date(article.lastUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      // 👇 Ye line images ko sitemap me add karti hai
      images: articleImages.length > 0 ? articleImages : undefined, 
    }
  })

  return [...routes, ...articleRoutes]
}