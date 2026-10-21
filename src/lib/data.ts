import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export function getMasterData() {
  const raw = fs.readFileSync(path.join(dataDir, 'master.json'), 'utf-8');
  return JSON.parse(raw);
}

export function getAllArticles() {
  const articlesDir = path.join(dataDir, 'articles');
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
  let allArticles = [];
  
  files.forEach(file => {
    const raw = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.articles) {
      allArticles = [...allArticles, ...parsed.articles];
    }
  });
  return allArticles;
}

export function getArticle(id: string) {
  const articles = getAllArticles();
  return articles.find(a => a.id === id);
}