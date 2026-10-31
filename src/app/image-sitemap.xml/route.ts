import { getMasterData, getAllArticles, getMediaData, getPeopleData } from "@/lib/data";
import fs from "fs";
import path from "path";

// Helper to escape XML special characters
const escapeXml = (unsafe: string) => {
  if (!unsafe) return "";
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

// 🛡️ Helper: Check karega ki image public folder mein exist karti hai ya nahi
const checkImageExists = (src: string): boolean => {
  if (!src) return false;
  // Agar external URL hai (http se shuru hota hai), toh assume karein ki valid hai
  if (src.startsWith("http")) return true;
  
  // Path ko clean karein (aage ka slash hata dein)
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
  const imgPath = path.join(process.cwd(), "public", cleanSrc);
  
  return fs.existsSync(imgPath);
};

export async function GET() {
  const config = getMasterData();
  const baseUrl = config.site.url;

  const articles = getAllArticles();
  const media = getMediaData();
  const people = getPeopleData().people;

  let urlEntries = "";

  // 1. Articles ki Images (Sirf wahi jo exist karti hain)
  articles.forEach((article) => {
    if (article.hero && checkImageExists(article.hero)) {
      const imageUrl = `${baseUrl}/${article.hero.startsWith("/") ? article.hero.slice(1) : article.hero}`;
      
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

  // 2. Gallery ki Images (Sirf wahi jo exist karti hain)
  if (media.gallery && media.gallery.photos) {
    let galleryEntries = "";
    media.gallery.photos.forEach((photo) => {
      // 👇 Yahan hum check kar rahe hain
      if (checkImageExists(photo.src)) {
        const imageUrl = `${baseUrl}/${photo.src.startsWith("/") ? photo.src.slice(1) : photo.src}`;
        
        galleryEntries += `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(photo.caption)}</image:title>
      <image:caption>${escapeXml(photo.caption + " - Bandwar Village")}</image:caption>
    </image:image>`;
      }
    });

    if (galleryEntries) {
      urlEntries += `
  <url>
    <loc>${baseUrl}/gallery</loc>${galleryEntries}
  </url>`;
    }
  }

  // 3. People ki Profile Images (Sirf wahi jo exist karti hain)
  people.forEach((person) => {
    if (person.photo && checkImageExists(person.photo)) {
      const imageUrl = `${baseUrl}/${person.photo.startsWith("/") ? person.photo.slice(1) : person.photo}`;
      
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

  // 4. XML String Generate Karein
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}