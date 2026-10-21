import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticle, getAllArticles, getCategories } from '@/lib/data';
import { Metadata } from 'next';

// 1. Next.js ko batate hain ki saare articles ke static pages banao
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.id,
  }));
}

// 2. Har article ke liye dynamic SEO Metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = getArticle(params.slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} | Bandwar Archive`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.hero ? [article.hero] : [],
      type: 'article',
    }
  };
}

// 3. Helper function: [[id|label]] ko clickable link mein convert karne ke liye
const renderTextWithLinks = (text: string, allArticles: any[]) => {
  if (!text) return null;
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  
  return parts.map((part, i) => {
    const match = part.match(/\[\[([^|]+)\|([^\]]+)\]\]/);
    if (match) {
      const id = match[1].trim();
      const label = match[2].trim();
      const exists = allArticles.some((a: any) => a.id === id);
      
      if (exists) {
        return <Link key={i} href={`/article/${id}`} className="inline-link">{label}</Link>;
      }
      return <span key={i}>{label}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

// 4. Main Article Page Component
export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  const allArticles = getAllArticles();
  const categories = getCategories();

  if (!article) {
    notFound(); // 404 page agar article na mile
  }

  const primaryCategory = categories.find((c: any) => c.id === article.categories?.[0]);

  return (
    <article className="article-page">
      {/* Hero Image Section */}
      {article.hero && (
        <figure className="article-hero">
          <img src={article.hero} alt={article.title} fetchPriority="high" />
        </figure>
      )}

      {/* Article Intro (Title & Category) */}
      <header className="article-intro container-text">
        <div className="article-eyebrow">
          <span>{primaryCategory?.icon} {primaryCategory?.title || 'Archive'}</span>
          <span className="dot"></span>
          <span>
            {Math.max(1, Math.ceil((article.content?.reduce((acc: number, curr: any) => acc + (curr.text ? curr.text.split(' ').length : 0), 0) || 0) / 200))} min read
          </span>
        </div>
        
        <h1 className="article-title">{article.title}</h1>
        
        {article.subtitle && (
          <p className="article-subtitle">{article.subtitle}</p>
        )}
      </header>

      {/* Facts / Infobox Grid */}
      {article.infobox && Object.keys(article.infobox).length > 0 && (
        <div className="container-wide">
          <div className="article-facts">
            <div className="article-facts-grid">
              {Object.entries(article.infobox).map(([label, value], i) => (
                <div className="article-fact" key={i}>
                  <span className="article-fact-label">{label}</span>
                  <span className="article-fact-value">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lead Summary */}
      <div className="container-text">
        <p className="article-lead" style={{ fontSize: 'var(--fs-md)', color: 'var(--c-text)', fontStyle: 'italic', borderLeft: '4px solid var(--c-accent)', paddingLeft: '1rem', marginBottom: '2rem' }}>
          {renderTextWithLinks(article.summary, allArticles)}
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="container-text article-body">
        {article.content?.map((section: any, index: number) => (
          <section className="article-section" key={index}>
            <span className="article-section-num">
              {String(index + 1).padStart(2, '0')} / {String(article.content.length).padStart(2, '0')}
            </span>
            <h2>{section.heading}</h2>
            <p>{renderTextWithLinks(section.text, allArticles)}</p>
          </section>
        ))}
      </div>

      {/* FAQs Section */}
      {article.faqs && article.faqs.length > 0 && (
        <section className="container-text article-faqs">
          <h2 className="article-faqs-title">
            Frequently Asked Questions
            <small>{article.faqs.length} questions</small>
          </h2>
          <div className="article-faqs-list">
            {article.faqs.map((faq: any, i: number) => (
              <details className="article-faq" key={i} open={i === 0}>
                <summary className="article-faq-q">
                  <span>{faq.q}</span>
                  <span className="article-faq-icon">+</span>
                </summary>
                <div className="article-faq-a">
                  <p>{renderTextWithLinks(faq.a, allArticles)}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Photos Gallery */}
      {article.photos && article.photos.length > 0 && (
        <section className="container-wide article-photos">
          <h2 className="article-photos-title">
            Photographs
            <small>{article.photos.length} images</small>
          </h2>
          <div className="article-photos-grid">
            {article.photos.map((photo: any, i: number) => (
              <figure className="article-photo" key={i}>
                <img src={photo.src} alt={photo.caption || article.title} loading="lazy" />
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="container-text">
          <div className="article-tags">
            <span className="article-tags-label">Topics</span>
            {article.tags.map((tag: string, i: number) => (
              <Link href={`/section?q=${encodeURIComponent(tag)}`} className="article-tag" key={i}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back / Next Navigation */}
      <div className="container-wide" style={{ marginTop: '4rem', paddingBottom: '2rem', borderTop: '1px solid var(--c-border-strong)', paddingTop: '2rem' }}>
        <Link href="/section" className="read-link">
          ← Back to Full Archive
        </Link>
      </div>
    </article>
  );
}