import { getAllArticles, getCategoriesData, getMasterData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, FileText, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { Metadata } from "next";

// Build time pe saari categories ke pages generate karega
export async function generateStaticParams() {
  const categories = getCategoriesData().categories;
  return categories.map((cat) => ({ category: cat.id }));
}

// 🚀 SEO FIX: Dynamic Metadata with Canonical, OG, and Twitter
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolved = await params;
  const categories = getCategoriesData().categories;
  const config = getMasterData();
  const category = categories.find(c => c.id === resolved.category);
  
  if (!category) {
    return { title: "Category Not Found", robots: { index: false } };
  }
  
  const baseUrl = config.site.url;
  const url = `${baseUrl}/section/${category.id}`;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;

  return {
    title: category.title,
    description: category.description,
    alternates: {
      canonical: url,
      languages: { "en-IN": url, "x-default": url },
    },
    openGraph: {
      type: "website",
      title: `${category.title} — Bandwar Village Archive`,
      description: category.description,
      url,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${category.title} - Bandwar Village Archive` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.title} — Bandwar Village Archive`,
      description: category.description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const categories = getCategoriesData().categories;
  const config = getMasterData();
  const category = categories.find(c => c.id === resolved.category);

  if (!category) notFound();

  const baseUrl = config.site.url;
  const articles = getAllArticles().filter(a => a.categories.includes(category.id));

  // 🚀 Separate the Lead Article from the rest
  const leadArticle = articles[0];
  const remainingArticles = articles.slice(1);

  // 🚀 ADVANCED JSON-LD Schema (CollectionPage + Breadcrumb + Deep ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/section/${category.id}#webpage`,
        url: `${baseUrl}/section/${category.id}`,
        name: `${category.title} — Bandwar Village Archive`,
        description: category.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#place` },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${baseUrl}/section/${category.id}#itemlist`
        },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/section/${category.id}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Archive", "item": `${baseUrl}/section` },
          { "@type": "ListItem", "position": 3, "name": category.title, "item": `${baseUrl}/section/${category.id}` }
        ]
      },
      ...(articles.length > 0 ? [{
        "@type": "ItemList",
        "@id": `${baseUrl}/section/${category.id}#itemlist`,
        name: `${category.title} Articles`,
        description: `List of articles related to ${category.title} in Bandwar Village.`,
        numberOfItems: articles.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: articles.slice(0, 20).map((article, index) => {
          const images: string[] = [];
          const seoHero = (article as any).displayHero || article.hero;
          if (seoHero) {
            images.push(seoHero.startsWith("http") ? seoHero : `${baseUrl}/${seoHero.replace(/^\//, "")}`);
          }
          return {
            "@type": "ListItem",
            position: index + 1,
            url: `${baseUrl}/article/${article.id}`,
            name: article.title,
            ...(images.length > 0 && { 
              image: { "@type": "ImageObject", "url": images[0] }
            })
          };
        })
      }] : [])
    ]
  };

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-4 md:px-0 max-w-6xl">
        
        {/* 🏛️ Standardized Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-muted mb-8 md:mb-12" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <Link href="/section" className="hover:text-accent transition-colors">Archive</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-semibold truncate max-w-[200px] sm:max-w-none">{category.title}</span>
        </nav>

        {/* 🏛️ Archival Section Header */}
        <div className="mb-12 md:mb-16 border-b border-divider pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-accent"></span>
            <span className="text-accent font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} /> Archival Section
            </span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink font-bold tracking-tight mb-4 flex items-center gap-4">
            <span className="text-3xl md:text-4xl opacity-80">{category.icon}</span> {category.title}
          </h1>
          
          <p className="text-ink-muted text-lg leading-relaxed max-w-3xl">
            {category.description}
          </p>
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 mt-8 text-xs font-bold uppercase tracking-wider text-ink-muted">
            <span className="flex items-center gap-1.5 bg-surface border border-divider px-3 py-1.5 rounded-sm">
              <FileText size={14} className="text-accent" /> {articles.length} Records Indexed
            </span>
            <span className="flex items-center gap-1.5 bg-surface border border-divider px-3 py-1.5 rounded-sm">
              <ShieldCheck size={14} className="text-accent" /> Verified Archive
            </span>
          </div>
        </div>

        {/* 📄 The Records (Articles) */}
        {articles.length > 0 ? (
          <div className="space-y-12">
            
            {/* 🚀 1. Featured Lead Record */}
            {leadArticle && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Latest Entry</h2>
                  <div className="h-px bg-divider flex-grow"></div>
                </div>
                
                <Link href={`/article/${leadArticle.id}`} className="group flex flex-col md:flex-row bg-surface border border-divider rounded-sm overflow-hidden hover:border-accent/40 transition-colors shadow-sm">
                  <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-canvas shrink-0 border-b md:border-b-0 md:border-r border-divider">
                    <Image 
                      src={(leadArticle as any).displayHero || leadArticle.hero ? ((leadArticle as any).displayHero || leadArticle.hero).startsWith("/") ? ((leadArticle as any).displayHero || leadArticle.hero) : `/${(leadArticle as any).displayHero || leadArticle.hero}` : "/fallback.jpg"} 
                      alt={leadArticle.title} 
                      fill 
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center w-full">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
                      <span>{leadArticle.categories[0]}</span>
                      <span className="text-ink-muted">•</span>
                      <span className="text-ink-muted">{new Date(leadArticle.lastUpdated).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-ink group-hover:text-accent transition-colors leading-tight mb-4">
                      {leadArticle.title}
                    </h3>
                    <p className="text-ink-muted text-base leading-relaxed line-clamp-3 mb-6">
                      {leadArticle.summary}
                    </p>
                    <div className="mt-auto flex items-center gap-1.5 text-sm font-bold text-ink group-hover:text-accent transition-colors uppercase tracking-wider">
                      Read Full Record <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* 🚀 2. Remaining Records Grid */}
            {remainingArticles.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted">Previously Recorded</h2>
                  <div className="h-px bg-divider flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {remainingArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

          </div>
        ) : (
          /* 📭 Empty State (Formal) */
          <div className="flex flex-col items-center justify-center py-24 bg-surface border border-dashed border-divider rounded-sm text-center px-4">
            <FileText size={56} className="text-ink/10 mb-4" aria-hidden="true" />
            <h3 className="font-serif text-2xl font-bold text-ink mb-2">Catalogue Empty</h3>
            <p className="text-ink-muted text-base max-w-md mx-auto">
              There are currently no records published in the {category.title} section. Please check back later.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}