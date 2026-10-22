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

  // 2. Saare articles aur unki unique images
  const articles = getAllArticles()
  
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    // Ek temporary set banate hain taaki duplicate image URLs na aayein
    const imageSet = new Set<string>()
    
    // Hero image (agar hai toh)
    if (article.hero) {
      imageSet.add(`${baseUrl}/${article.hero.replace(/^\//, '')}`)
    }
    
    // Gallery/Photos (agar hain toh)
    if (article.photos && article.photos.length > 0) {
      article.photos.forEach((photo) => {
        imageSet.add(`${baseUrl}/${photo.src.replace(/^\//, '')}`)
      })
    }

    // Set ko wapas Array me convert karte hain
    const uniqueImages = Array.from(imageSet)

    return {
      url: `${baseUrl}/article/${article.id}`,
      lastModified: new Date(article.lastUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: uniqueImages.length > 0 ? uniqueImages : undefined, 
    }
  })

  return [...routes, ...articleRoutes]
}