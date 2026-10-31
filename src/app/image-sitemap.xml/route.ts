import { getMasterData, getAllArticles, getMediaData, getPeopleData } from "@/lib/data";

// Helper to escape XML special characters
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  const config = getMasterData();
  const baseUrl = config.site.url;

  // 1. Data Fetch karein
  const articles = getAllArticles();
  const media = getMediaData();
  const people = getPeopleData().people;

  let urlEntries = "";

  // 2. Articles ki Images
  articles.forEach((article) => {
    if (article.hero) {
      const imageUrl = article.hero.startsWith("http") 
        ? article.hero 
        : `${baseUrl}/${article.hero.startsWith("/") ? article.hero.slice(1) : article.hero}`;
      
      urlEntries += `
        <url>
          <loc>${baseUrl}/article/${article.id}</loc>
          <image:image>
            <image:loc>${imageUrl}</image:loc>
            <image:title>${escapeXml(article.title)}</image:title>
            <image:caption>${escapeXml(article.subtitle || article.summary)}</image:caption>
          </image:image>
        </url>`;
    }
  });

  // 3. Gallery ki Images
  if (media.gallery && media.gallery.photos) {
    // Hum saari gallery images ko ek hi page (/gallery) par declare karenge
    let galleryEntries = "";
    media.gallery.photos.forEach((photo) => {
      const imageUrl = photo.src.startsWith("http")
        ? photo.src
        : `${baseUrl}/${photo.src.startsWith("/") ? photo.src.slice(1) : photo.src}`;
      
      galleryEntries += `
          <image:image>
            <image:loc>${imageUrl}</image:loc>
            <image:title>${escapeXml(photo.caption)}</image:title>
            <image:caption>${escapeXml(photo.caption + " - Bandwar Village")}</image:caption>
          </image:image>`;
    });

    if (galleryEntries) {
      urlEntries += `
        <url>
          <loc>${baseUrl}/gallery</loc>
          ${galleryEntries}
        </url>`;
    }
  }

  // 4. People ki Profile Images
  people.forEach((person) => {
    if (person.photo) {
      const imageUrl = person.photo.startsWith("http")
        ? person.photo
        : `${baseUrl}/${person.photo.startsWith("/") ? person.photo.slice(1) : person.photo}`;
      
      urlEntries += `
        <url>
          <loc>${baseUrl}/people/${person.id}</loc>
          <image:image>
            <image:loc>${imageUrl}</image:loc>
            <image:title>${escapeXml(person.name)}</image:title>
            <image:caption>${escapeXml(person.role + " from Bandwar")}</image:caption>
          </image:image>
        </url>`;
    }
  });

  // 5. XML String Generate Karein
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${urlEntries}
</urlset>`;

  // 6. Response return karein
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}