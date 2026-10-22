import { MetadataRoute } from 'next';
import { getMasterData, getAllArticles, getMediaData } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Base URL config se utha rahe hain
  const master = getMasterData();
  const baseUrl = master.site.url.replace(/\/$/, ''); // Trailing slash remove

  // 2. Main Static Pages (Wikipedia style categories)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/place`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/people`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/time`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/reach`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/vision`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/section`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/contribute`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // 3. Articles aur unki images
  const articles = getAllArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    const imageSet = new Set<string>();
    
    if (article.hero) {
      imageSet.add(`${baseUrl}/${article.hero.replace(/^\//, '')}`);
    }
    
    if (article.photos && article.photos.length > 0) {
      article.photos.forEach((photo) => {
        imageSet.add(`${baseUrl}/${photo.src.replace(/^\//, '')}`);
      });
    }

    const uniqueImages = Array.from(imageSet);
    // Date parse error se bachne ke liye fallback
    const lastModDate = article.lastUpdated ? new Date(article.lastUpdated) : new Date();

    return {
      url: `${baseUrl}/article/${article.id}`,
      lastModified: isNaN(lastModDate.getTime()) ? new Date() : lastModDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: uniqueImages.length > 0 ? uniqueImages : undefined, 
    };
  });

  // 4. Gallery Images ko map karna (Place page ke andar)
  // Yeh Google ko batayega ki gallery ki photos kahan hain
  let galleryImages: string[] = [];
  try {
    const media = getMediaData();
    if (media.gallery && media.gallery.photos) {
      galleryImages = media.gallery.photos.map(
        (photo) => `${baseUrl}/${photo.src.replace(/^\//, '')}`
      );
    }
  } catch (e) {
    console.error("Sitemap Error: Could not read media data for images.");
  }

  return [
    ...staticRoutes,
    ...articleRoutes,
    // Agar gallery images hain, toh unhe /place route ke sath link kar dete hain
    ...(galleryImages.length > 0 ? [{
      url: `${baseUrl}/place`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: galleryImages
    }] : [])
  ];
}