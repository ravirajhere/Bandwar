import { getAllArticles, getCategoriesData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";
import { ChevronRight, Library } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Pages | Bandwar Village",
  description: "The complete directory of articles for Bandwar village — history, temples, schools, culture, and daily life.",
};

export default function SectionPage() {
  const articles = getAllArticles();
  const categories = getCategoriesData().categories;

  // Count articles per category
  const getCount = (catId: string) => articles.filter(a => a.categories.includes(catId)).length;

  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom">
        
        {/* 🏛️ Page Header (Premium Style) */}
        <div className="mb-12 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            All Pages
          </h1>
          <div className="w-20 h-1 bg-brand mb-6 rounded-full"></div>
          <p className="text-lg text-muted leading-relaxed">
            The complete digital archive of Bandwar. Every article, photograph, and fact — kept by the village, for the record.
          </p>
        </div>

        {/* =========================================
            Category Tiles Section
           ========================================= */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground m-0 flex items-center gap-2">
              <Library size={22} className="text-brand" />
              Browse by Category
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = getCount(cat.id);
              const isDisabled = count === 0;

              return (
                <Link
                  key={cat.id}
                  href={isDisabled ? "#" : `/section/${cat.id}`}
                  className={`group relative bg-card border border-border rounded-xl p-5 transition-all duration-300 flex items-center gap-4 ${
                    isDisabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:border-brand/50 hover:shadow-card hover:-translate-y-0.5"
                  }`}
                  aria-disabled={isDisabled}
                  tabIndex={isDisabled ? -1 : 0}
                >
                  {/* Icon Badge */}
                  <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors ${
                    isDisabled 
                      ? "bg-muted-background" 
                      : "bg-brand/10 group-hover:bg-brand/20"
                  }`}>
                    {cat.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-grow">
                    <h3 className={`font-serif font-semibold text-[15px] leading-tight mb-1 truncate ${
                      isDisabled ? "text-muted" : "text-foreground group-hover:text-brand transition-colors"
                    }`}>
                      {cat.title}
                    </h3>
                    <p className="text-xs text-muted font-medium">
                      {count} {count === 1 ? "page" : "pages"}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isDisabled && (
                    <ChevronRight 
                      size={18} 
                      className="shrink-0 text-muted group-hover:text-brand transition-all transform group-hover:translate-x-0.5" 
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* =========================================
            All Articles Section
           ========================================= */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground m-0">
              All Articles
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
            <span className="text-sm text-muted bg-muted-background px-3 py-1 rounded-full font-medium whitespace-nowrap">
              {articles.length} total
            </span>
          </div>
          
          {/* Empty State */}
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-xl">
              <Library size={48} className="text-muted opacity-30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No articles yet</h3>
              <p className="text-muted text-[15px]">Articles added by the editor will appear here.</p>
            </div>
          ) : (
            /* Grid Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}