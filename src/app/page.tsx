import Link from 'next/link';
import master from '../../data/master.json';
import { getAllArticles, getCategories } from '@/lib/data';

export default function Home() {
  // Data fetching
  const articles = getAllArticles();
  const categories = getCategories();
  
  // Latest 3 articles (Professional Grid ke liye)
  const featuredArticles = articles.slice(0, 3);
  
  // Data mapping
  const hero = master.home?.hero || {};
  const stats = master.home?.stats || [];
  const pullquote = master.home?.pullquote;
  const about = master.home?.about;

  return (
    <>
      {/* 1. HERO SECTION (Full Impact) */}
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow" style={{ color: 'var(--c-base)' }}>
            {hero.location || 'Begusarai, Bihar'}
          </div>
          <h1>{hero.title || 'Bandwar Village Archive'}</h1>
          <p className="hero-tagline">{hero.tagline}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/section" className="btn btn-primary" style={{ background: 'var(--c-base)', color: 'var(--c-primary)', borderColor: 'var(--c-base)' }}>
              Explore the Archive
            </Link>
            <Link href="/place" className="btn" style={{ borderColor: 'var(--c-base)', color: 'var(--c-base)' }}>
              View Map
            </Link>
          </div>
        </div>
      </section>

      <div className="container-wide">
        {/* 2. STATS BAR (Clean & Minimal) */}
        {stats.length > 0 && (
          <section className="section-sm" style={{ borderBottom: '1px solid var(--c-border-soft)' }}>
            <div className="stats-row">
              {stats.map((stat: any, i: number) => (
                <div className="stat-item" key={i}>
                  <span className="stat-value">
                    {stat.value === '{{articleCount}}' ? articles.length : stat.value}
                  </span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. FEATURED ARTICLES (Modern Grid Layout) */}
        <section className="section">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Latest from the Archive</h2>
              <p className="section-intro" style={{ marginBottom: 0 }}>Fresh stories, histories, and memories.</p>
            </div>
            <Link href="/section" className="read-link">View all →</Link>
          </div>
          
          <div className="section-grid">
            {featuredArticles.map((article: any) => {
              const cat = categories.find((c: any) => c.id === article.categories?.[0]);
              return (
                <Link href={`/article/${article.id}`} className="section-card" key={article.id}>
                  <div className="section-card-img">
                    {/* Fallback Image logic */}
                    <img 
                      src={article.hero || '/images/placeholder.jpg'} 
                      alt={article.title} 
                      loading="lazy" 
                    />
                  </div>
                  <div className="section-card-body">
                    <div className="section-card-cat">
                      {cat?.icon} {cat?.title || 'Archive'}
                    </div>
                    <h3 className="section-card-title">{article.title}</h3>
                    <p className="section-card-summary">
                      {article.summary?.substring(0, 100)}...
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. MANIFESTO BANNER (Vision Highlight) */}
        <section className="manifesto-banner">
          <div className="banner-inner">
            <div className="banner-text">
              <span className="eyebrow">Bandwar 2036</span>
              <h3>A non-political manifesto for the village</h3>
              <p>15 priorities · 10-year roadmap · Download the PDF</p>
            </div>
            <div className="banner-actions">
              <Link href="/vision" className="btn btn-primary">
                View Vision
              </Link>
            </div>
          </div>
        </section>

        {/* 5. EXPLORE CATEGORIES (Clean Grid) */}
        {categories.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">Explore by Category</h2>
            </div>
            <div className="category-tiles">
              {categories.map((cat: any) => {
                const count = articles.filter((a: any) => a.categories?.includes(cat.id)).length;
                return (
                  <Link href={`/section/${cat.id}`} className="category-tile" key={cat.id}>
                    <div className="category-tile-icon">{cat.icon || '📁'}</div>
                    <div className="category-tile-title">{cat.title}</div>
                    <div className="category-tile-count">{count} {count === 1 ? 'article' : 'articles'}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. PULLQUOTE & ABOUT (Editorial Touch) */}
        {pullquote && (
          <div className="pullquote">
            <blockquote>"{pullquote.text}"</blockquote>
            <cite>{pullquote.cite}</cite>
          </div>
        )}

        {about && (
          <section className="section container-text" style={{ textAlign: 'center', paddingBottom: '6rem' }}>
            <span className="eyebrow">{about.eyebrow || 'About the Archive'}</span>
            <h2 className="section-title" style={{ margin: '0 auto 1.5rem' }}>{about.title}</h2>
            <div style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text-muted)', lineHeight: '1.8' }}>
              {about.paragraphs?.[0]}
            </div>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/about" className="btn">Read our full story</Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}