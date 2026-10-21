import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllArticles, getCategories } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import { Metadata } from 'next';

// Har category ke liye static page generate karna
export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((cat: any) => ({
    category: cat.id,
  }));
}

// Dynamic SEO
export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categories = getCategories();
  const cat = categories.find((c: any) => c.id === params.category);
  if (!cat) return { title: 'Not Found' };

  return {
    title: `${cat.title} Articles | Bandwar Archive`,
    description: cat.description || `Browse ${cat.title} articles in the Bandwar archive.`,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const allArticles = getAllArticles();
  const categories = getCategories();
  
  const currentCategory = categories.find((c: any) => c.id === params.category);
  
  // Agar galat category URL daali toh 404 page
  if (!currentCategory) {
    notFound();
  }

  // Filter articles
  const articles = allArticles.filter((a: any) => a.categories?.includes(currentCategory.id));

  return (
    <div className="container-wide section-page" style={{ paddingBottom: '4rem' }}>
      
      <header className="section-head-page">
        <span className="eyebrow">Category</span>
        <h1 className="section-title-main">{currentCategory.icon} {currentCategory.title}</h1>
        {currentCategory.description && (
          <p className="section-intro">{currentCategory.description}</p>
        )}
        <span className="section-count">{articles.length} articles in this category</span>
      </header>

      <div className="section-filters">
        <Link href="/section" className="section-filter">
          All <span className="filter-count">{allArticles.length}</span>
        </Link>
        {categories.map((cat: any) => {
          const count = allArticles.filter((a: any) => a.categories?.includes(cat.id)).length;
          return (
            <Link 
              key={cat.id} 
              href={`/section/${cat.id}`} 
              className={`section-filter ${cat.id === currentCategory.id ? 'active' : ''}`}
            >
              {cat.icon} {cat.title} <span className="filter-count">{count}</span>
            </Link>
          );
        })}
      </div>

      {articles.length > 0 ? (
        <div className="section-grid">
          {articles.map((article: any) => (
            <ArticleCard key={article.id} article={article} categories={categories} />
          ))}
        </div>
      ) : (
        <div className="section-empty">
          <p>No articles in this category yet.</p>
          <Link href="/section" className="read-link">Browse all articles</Link>
        </div>
      )}

    </div>
  );
}