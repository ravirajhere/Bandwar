import { 
  getAllArticles, 
  getPeopleData, 
  getDirectoryData, 
  getMediaData 
} from "./data";

export type SearchItem = {
  id: string;
  title: string;
  description: string;
  type: "Article" | "Person" | "Contact" | "Place";
  url: string;
};

export function getSearchIndex(): SearchItem[] {
  const index: SearchItem[] = [];

  // 1. Articles (History, Culture, etc.)
  try {
    getAllArticles().forEach(a => index.push({
      id: `article-${a.id}`,
      title: a.title,
      description: a.summary,
      type: "Article",
      url: `/article/${a.id}`
    }));
  } catch (e) { 
    console.error("Error reading articles for search", e); 
  }

  // 2. People (Mahant ji, Freedom Fighters, Leaders)
  try {
    getPeopleData().people.forEach(p => index.push({
      id: `person-${p.id}`,
      title: p.name,
      description: `${p.role}${p.locality ? ` • ${p.locality}` : ""}`, // Role + Locality
      type: "Person",
      url: `/people/${p.id}`
    }));
  } catch (e) { 
    console.error("Error reading people for search", e); 
  }

  // 3. Directory (Emergency, Doctors, Shops, Utilities)
  try {
    getDirectoryData().items.forEach(d => index.push({
      id: `directory-${d.id}`,
      title: d.name,
      description: d.description || `${d.categoryId} contact${d.address ? ` • ${d.address}` : ""}`,
      type: "Contact",
      url: `/directory` // Filhaal sab directory page par le ja rahe hain
    }));
  } catch (e) { 
    console.error("Error reading directory for search", e); 
  }

  // 4. Places & Landmarks (Temples, Schools, Map locations)
  try {
    const media = getMediaData();
    
    // Landmarks ko index karein
    if (media.landmarks) {
      media.landmarks.forEach(place => index.push({
        id: `place-${place.id || place.name}`,
        title: place.name || place.title || "Landmark",
        description: place.description || `A landmark in ${place.category}`,
        type: "Place",
        url: `/place` // Filhaal sab place page par le ja rahe hain
      }));
    }

    // Gallery photos ko bhi index karein (caption ke through)
    media.gallery.photos.forEach(photo => index.push({
      id: `photo-${photo.id}`,
      title: photo.caption,
      description: `Photo from ${photo.year} • ${photo.category}`,
      type: "Place",
      url: `/place`
    }));

  } catch (e) { 
    console.error("Error reading media for search", e); 
  }

  return index;
}