import { 
  getAllArticles, 
  getPeopleData, 
  getDirectoryData, 
  getMediaData 
} from "./data";

// 🚀 SEO FIX: Aligned types with SearchModal.tsx UI labels
export type SearchItem = {
  id: string;
  title: string;
  description: string;
  type: "article" | "person" | "directory" | "landmark" | "photo";
  url: string;
};

export function getSearchIndex(): SearchItem[] {
  const index: SearchItem[] = [];

  // 1. Articles (History, Culture, etc.)
  try {
    getAllArticles().forEach(a => index.push({
      id: `article-${a.id}`,
      title: a.title,
      description: a.summary.slice(0, 160),
      type: "article",
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
      description: `${p.role || "Community Member"}${p.locality ? ` • ${p.locality}` : ""}`,
      type: "person",
      url: `/people/${p.id}`
    }));
  } catch (e) { 
    console.error("Error reading people for search", e); 
  }

  // 3. Directory (Emergency, Doctors, Shops, Utilities)
  try {
    const dirData = getDirectoryData();
    const catMap = new Map(dirData.categories.map(c => [c.id, c.title]));

    dirData.items.forEach(d => {
      const catName = catMap.get(d.categoryId) || "Service";
      index.push({
        id: `directory-${d.id}`,
        title: d.name,
        description: d.description || `${catName}${d.address ? ` • ${d.address}` : ""}`,
        type: "directory",
        url: `/directory`
      });
    });
  } catch (e) { 
    console.error("Error reading directory for search", e); 
  }

  // 4. Places, Landmarks & Photos
  try {
    const media = getMediaData();
    
    // Landmarks
    if (media.landmarks) {
      media.landmarks.forEach(place => {
        const placeName = place.name || place.title || "Landmark";
        const placeCat = place.category || "Location";
        
        index.push({
          id: `landmark-${place.id || placeName}`,
          title: placeName,
          description: place.description || `A ${placeCat} in Bandwar`,
          type: "landmark",
          url: `/map` // 🚀 FIXED: Landmarks are explored on the Map page
        });
      });
    }

    // Gallery photos
    media.gallery.photos.forEach(photo => {
      const galleryCat = media.gallery.categories.find(c => c.id === photo.category)?.title || photo.category;
      
      index.push({
        id: `photo-${photo.id}`,
        title: photo.caption,
        description: `Photograph from ${photo.year || "Archive"} • ${galleryCat}`,
        type: "photo",
        url: `/gallery` // 🚀 FIXED: Photos are explored in the Gallery page
      });
    });

  } catch (e) { 
    console.error("Error reading media for search", e); 
  }

  return index;
}