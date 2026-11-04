import { getAllArticles, getCategoriesData, getMasterData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";
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
    title: category.title, // Layout template will append "— Bandwar Village Archive"
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

  // 🚀 SEO FIX: JSON-LD Schema (CollectionPage + Breadcrumb + ItemList)
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
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
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
      {/* 🚀 JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 md:px-0 max-w-7xl 3xl:max-w-[1600px]">
        
        {/* 🏛️ Breadcrumb (Standardized) */}
        <nav className="flex flex-wrap items-center gap-2 text-sm 3xl:text-base text-ink/60 mb-8 md:mb-10 no-print" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <Link href="/section" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Archive</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-semibold truncate max-w-[200px] sm:max-w-none">{category.title}</span>
        </nav>

        {/* 🏛️ Page Header */}
        <div className="mb-10 md:mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 3xl:w-20 3xl:h-20 bg-surface border border-divider text-2xl 3xl:text-4xl rounded-lg flex items-center justify-center shadow-sm shrink-0" aria-hidden="true">
              {category.icon}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink font-semibold tracking-tight text-balance">
              {category.title}
            </h1>
          </div>
          
          {/* Decorative Accent Line */}
          <div className="w-16 md:w-20 h-1 bg-accent mb-6 rounded-full"></div>
          
          <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed max-w-3xl text-pretty mb-6">
            {category.description}
          </p>
          
          {/* Article Count Badge */}
          <div className="inline-flex items-center gap-2 bg-surface border border-divider text-ink/70 text-xs 3xl:text-sm font-bold px-3 py-1.5 rounded-md shadow-sm uppercase tracking-wider">
            <FolderOpen size={14} className="text-accent 3xl:w-4 3xl:h-4" aria-hidden="true" />
            {articles.length} {articles.length === 1 ? "Article" : "Articles"}
          </div>
        </div>

        {/* 📄 Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-5 md:gap-6 3xl:gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          /* 📭 Empty State */
          <div className="flex flex-col items-center justify-center py-24 bg-surface border border-dashed border-divider rounded-lg text-center px-4">
            <FileText size={56} className="text-ink/20 mb-4 3xl:w-20 3xl:h-20" aria-hidden="true" />
            <h3 className="font-serif text-xl 3xl:text-2xl font-bold text-ink mb-2">No articles found</h3>
            <p className="text-ink/60 text-sm md:text-base 3xl:text-lg max-w-md mx-auto">
              There are currently no articles published in this category. Please check back later.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}