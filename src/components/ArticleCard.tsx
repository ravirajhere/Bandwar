import Link from 'next/link';

export default function ArticleCard({ article, categories }: { article: any, categories: any[] }) {
  const cat = categories.find((c) => c.id === article.categories?.[0]);
  
  // Image path handle karna (agar '/' missing ho)
  const imageSrc = article.hero 
    ? (article.hero.startsWith('/') ? article.hero : `/${article.hero}`) 
    : '/images/placeholder.jpg';

  return (
    <Link href={`/article/${article.id}`} className="section-card">
      <div className="section-card-img">
        <img src={imageSrc} alt={article.title} loading="lazy" />
      </div>
      <div className="section-card-body">
        {cat && (
          <div className="section-card-cat">
            {cat.icon} {cat.title}
          </div>
        )}
        <h3 className="section-card-title">{article.title}</h3>
        {article.subtitle && <div className="section-card-sub">{article.subtitle}</div>}
        <p className="section-card-summary">
          {article.summary ? (article.summary.length > 120 ? article.summary.substring(0, 120) + '...' : article.summary) : ''}
        </p>
      </div>
    </Link>
  );
}