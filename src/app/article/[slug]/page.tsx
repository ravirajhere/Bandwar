import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), 'data/articles');
  let articles: any[] = [];
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.articles) articles = [...articles, ...parsed.articles];
    });
  }
  return articles.map((a: any) => ({ slug: a.id }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Article: {params.slug}</h1>
      <p>Article content will be loaded here.</p>
    </div>
  );
}