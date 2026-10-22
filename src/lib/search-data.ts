import { getAllArticles } from "./data";

export type SearchItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
};

export function getSearchIndex(): SearchItem[] {
  const index: SearchItem[] = [];

  // Sirf Articles ko search index mein daal rahe hain
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

  return index;
}