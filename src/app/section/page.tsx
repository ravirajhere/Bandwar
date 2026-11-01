import { getAllArticles, getCategoriesData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";
import { ChevronRight, Library, FileText } from "lucide-react";
import { Metadata } from "next";
import { AddContentModal } from "@/components/shared/AddContentModal";

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
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0 max-w-7xl 3xl:max-w-[1600px]">
        
        {/* 🏛️ Page Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight text-balance">
              All Pages
            </h1>
            
            {/* Decorative Accent Line */}
            <div className="w-16 md:w-20 h-1 bg-accent mb-6 rounded-full"></div>
            
            <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty">
              The complete digital archive of Bandwar. Every article, photograph, and fact — kept by the village, for the record.
            </p>
          </div>
          
          {/* 🚀 Write an Article Button (Dynamic Categories passed) */}
          <div className="shrink-0 pb-2 3xl:pb-4">
            <AddContentModal 
              type="article" 
              customButtonText="Write an Article" 
              categories={categories.map(c => ({ id: c.id, title: c.title }))} 
            />
          </div>
        </div>

        {/* =========================================
            📚 Category Tiles Section
           ========================================= */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="font-serif text-2xl 3xl:text-3xl font-semibold text-ink m-0 flex items-center gap-2">
              <Library size={22} className="text-accent 3xl:w-7 3xl:h-7" />
              Browse by Category
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-4 3xl:gap-6">
            {categories.map((cat) => {
              const count = getCount(cat.id);
              const isDisabled = count === 0;

              return (
                <Link
                  key={cat.id}
                  href={isDisabled ? "#" : `/section/${cat.id}`}
                  className={`group relative bg-surface border border-divider rounded-lg p-5 3xl:p-6 transition-all duration-300 flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isDisabled 
                      ? "opacity-60 cursor-not-allowed" 
                      : "hover:border-accent/40 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                  aria-disabled={isDisabled}
                  tabIndex={isDisabled ? -1 : 0}
                >
                  {/* Icon Badge */}
                  <div className={`shrink-0 w-12 h-12 3xl:w-14 3xl:h-14 rounded-md flex items-center justify-center text-2xl 3xl:text-3xl transition-colors border border-divider ${
                    isDisabled 
                      ? "bg-canvas" 
                      : "bg-canvas group-hover:bg-accent/5"
                  }`}>
                    {cat.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-grow">
                    <h3 className={`font-serif font-semibold text-[15px] 3xl:text-lg leading-tight mb-1 truncate ${
                      isDisabled ? "text-ink/50" : "text-ink group-hover:text-accent transition-colors"
                    }`}>
                      {cat.title}
                    </h3>
                    <p className="text-xs 3xl:text-sm text-ink/50 font-medium">
                      {count} {count === 1 ? "page" : "pages"}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isDisabled && (
                    <ChevronRight 
                      size={18} 
                      className="shrink-0 text-ink/40 group-hover:text-accent transition-all transform group-hover:translate-x-0.5 3xl:w-5 3xl:h-5" 
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* =========================================
            📄 All Articles Section
           ========================================= */}
        <section>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="font-serif text-2xl 3xl:text-3xl font-semibold text-ink m-0 flex items-center gap-2">
              <FileText size={22} className="text-accent 3xl:w-7 3xl:h-7" />
              All Articles
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
            <span className="text-sm 3xl:text-base text-ink/60 bg-surface border border-divider px-3 py-1 rounded-md font-medium whitespace-nowrap shadow-sm">
              {articles.length} total
            </span>
          </div>
          
          {/* Empty State */}
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-divider rounded-lg">
              <Library size={48} className="text-ink/20 mb-4 3xl:w-16 3xl:h-16" />
              <h3 className="text-lg 3xl:text-xl font-semibold text-ink mb-1">No articles yet</h3>
              <p className="text-ink/60 text-sm md:text-base 3xl:text-lg">Articles added by the editor will appear here.</p>
            </div>
          ) : (
            /* Grid Layout (Mobile: 1, Tablet/Desktop: 2, TV: 3) */
            <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-5 md:gap-6 3xl:gap-8">
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