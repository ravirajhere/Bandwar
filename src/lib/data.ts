import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const dataDir = path.join(rootDir, 'data');

export function getMasterData() {
  const raw = fs.readFileSync(path.join(dataDir, 'master.json'), 'utf-8');
  return JSON.parse(raw);
}

export function getAllArticles() {
  const articlesDir = path.join(dataDir, 'articles');
  if (!fs.existsSync(articlesDir)) return [];
  
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
  let allArticles: any[] = []; // <--- Yahan fix kiya gaya hai

  files.forEach(file => {
    const raw = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.articles && Array.isArray(parsed.articles)) {
      allArticles.push(...parsed.articles);
    }
  });
  
  return allArticles.sort((a: any, b: any) => {
    const dateA = a.datePublished || a.lastUpdated || '';
    const dateB = b.datePublished || b.lastUpdated || '';
    return dateB.localeCompare(dateA);
  });
}

export function getArticle(id: string) {
  const articles = getAllArticles();
  return articles.find((a: any) => a.id === id);
}

export function getCategories() {
  const raw = fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf-8');
  return JSON.parse(raw).categories || [];
}