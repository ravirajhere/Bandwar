import { getAllArticles, getCategoriesData, getMasterData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";
import { ChevronRight, Library, FileText, ArrowRight, BookOpen, PenLine } from "lucide-react";
import { Metadata } from "next";
import { AddContentModal } from "@/components/shared/AddContentModal";

// 🚀 SEO FIX: Dynamic Metadata
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  
  const title = "Archive Index";
  const description = "The complete directory of articles for Bandwar village — history, temples, schools, culture, and daily life.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/section`,
      languages: { "en-IN": `${baseUrl}/section`, "x-default": `${baseUrl}/section` },
    },
    openGraph: {
      type: "website",
      title: `${title} — Bandwar Village Archive`,
      description,
      url: `${baseUrl}/section`,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Archive Index - Bandwar Village Archive" }],
    },
    twitter: { card: "summary_large_image", title: `${title} — Bandwar Village Archive`, description, images: [ogImage] },
  };
}

export default function SectionPage() {
  const articles = getAllArticles();
  const categories = getCategoriesData().categories;
  const config = getMasterData();
  const baseUrl = config.site.url;

  // Count articles per category
  const getCount = (catId: string) => articles.filter(a => a.categories.includes(catId)).length;

  // The first article becomes the "Latest Additions" lead
  const latestArticle = articles[0];
  const remainingArticles = articles.slice(1);

  // 🚀 SEO FIX: JSON-LD Schema (CollectionPage + ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/section#webpage`,
        url: `${baseUrl}/section`,
        name: "Archive Index — Bandwar Village Archive",
        description: "The complete directory of articles for Bandwar village.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Archive", "item": `${baseUrl}/section` }
        ]
      },
      ...(articles.length > 0 ? [{
        "@type": "ItemList",
        "@id": `${baseUrl}/section#itemlist`,
        name: "All Articles",
        numberOfItems: articles.length,
        itemListElement: articles.slice(0, 20).map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}/article/${article.id}`,
          name: article.title
        }))
      }] : [])
    ]
  };

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        
        {/* 🏛️ Editorial Header */}
        <div className="mb-12 md:mb-16 border-b border-divider pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-accent"></span>
            <span className="text-accent font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Library size={14} /> The Directory
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink mb-4 font-bold tracking-tight">
                Archive Index
              </h1>
              <p className="text-ink-muted text-lg leading-relaxed">
                The complete digital record of Bandwar. Browse the historical, cultural, and spatial archives preserved by the community.
              </p>
            </div>
            
            {/* Formal Write Button */}
            <div className="shrink-0">
              <AddContentModal 
                type="article" 
                customButtonText="Submit an Article" 
                categories={categories.map(c => ({ id: c.id, title: c.title }))} 
              />
            </div>
          </div>
        </div>

        {/* =========================================
            📚 The Ledger: Category Index
           ========================================= */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent"></div> Browse by Category
            </h2>
          </div>
          
          {/* Formal Grid Layout for Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-divider rounded-sm overflow-hidden bg-surface">
            {categories.map((cat) => {
              const count = getCount(cat.id);
              const isDisabled = count === 0;

              const commonClasses = `group relative border-b border-r border-divider p-4 transition-colors flex items-center justify-between ${
                isDisabled ? "bg-canvas opacity-60" : "hover:bg-canvas focus-visible:outline-none focus-visible:bg-canvas"
              }`;

              const content = (
                <>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-sm bg-canvas border border-divider flex items-center justify-center shrink-0 text-xl">
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-serif font-bold text-base leading-tight truncate ${isDisabled ? "text-ink/50" : "text-ink group-hover:text-accent transition-colors"}`}>
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-ink-muted mt-0.5 font-medium uppercase tracking-wider">
                        {count} {count === 1 ? "Record" : "Records"}
                      </p>
                    </div>
                  </div>
                  
                  {!isDisabled && (
                    <ArrowRight size={16} className="text-ink/20 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                  )}
                </>
              );

              if (isDisabled) return <div key={cat.id} className={commonClasses}>{content}</div>;
              return <Link key={cat.id} href={`/section/${cat.id}`} className={commonClasses}>{content}</Link>;
            })}
          </div>
        </section>

        {/* =========================================
            📄 The Records: Latest & All Articles
           ========================================= */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-divider">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent"></div> Recently Recorded
            </h2>
            <span className="text-xs font-bold text-ink-muted bg-surface border border-divider px-2 py-1 rounded-sm">
              {articles.length} TOTAL ENTRIES
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-divider rounded-sm">
              <FileText size={48} className="text-ink/20 mb-4" aria-hidden="true" />
              <h3 className="text-lg font-serif font-bold text-ink mb-1">No records found</h3>
              <p className="text-ink-muted text-sm">Articles added by the editor will appear here.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* 🚀 Lead Article (Featured) */}
              {latestArticle && (
                <div className="bg-surface border border-divider rounded-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center hover:border-accent/40 transition-colors">
                  <div className="w-full md:w-1/3 shrink-0 aspect-[4/3] relative rounded-sm overflow-hidden border border-divider bg-canvas">
                    <img 
                      src={latestArticle.hero ? (latestArticle.hero.startsWith("/") ? latestArticle.hero : `/${latestArticle.hero}`) : "/fallback.jpg"} 
                      alt={latestArticle.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex flex-col h-full w-full">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
                      <span className="bg-accent/10 px-2 py-1 rounded-sm">Latest Entry</span>
                      <span className="text-ink-muted">•</span>
                      <span className="text-ink-muted">{latestArticle.categories[0]}</span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-3 leading-tight">
                      {latestArticle.title}
                    </h3>
                    <p className="text-ink-muted text-base leading-relaxed line-clamp-3 mb-6">
                      {latestArticle.summary}
                    </p>
                    <Link href={`/article/${latestArticle.id}`} className="inline-flex items-center text-sm font-bold text-accent hover:text-accent-hover group mt-auto">
                      Read Full Record <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}

              {/* 🚀 Remaining Articles Grid (Standardized Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {remainingArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}