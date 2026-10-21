import Link from 'next/link';
import { getAllArticles, getCategories } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Archive | Bandwar',
  description: 'Browse all articles in the Bandwar village digital archive.',
};

export default function SectionPage() {
  const articles = getAllArticles();
  const categories = getCategories();

  return (
    <div className="container-wide section-page" style={{ paddingBottom: '4rem' }}>
      
      {/* Page Header */}
      <header className="section-head-page">
        <span className="eyebrow">The Archive</span>
        <h1 className="section-title-main">All Articles</h1>
        <p className="section-intro">
          Browse every article in the archive — history, religion, education, culture, infrastructure, and more.
        </p>
        <span className="section-count">{articles.length} articles in the archive</span>
      </header>

      {/* Category Filters */}
      <div className="section-filters">
        <Link href="/section" className="section-filter active">
          All <span className="filter-count">{articles.length}</span>
        </Link>
        {categories.map((cat: any) => {
          const count = articles.filter((a: any) => a.categories?.includes(cat.id)).length;
          return (
            <Link key={cat.id} href={`/section/${cat.id}`} className="section-filter">
              {cat.icon} {cat.title} <span className="filter-count">{count}</span>
            </Link>
          );
        })}
      </div>

      {/* Articles Grid */}
      <div className="section-grid">
        {articles.map((article: any) => (
          <ArticleCard key={article.id} article={article} categories={categories} />
        ))}
      </div>

    </div>
  );
}