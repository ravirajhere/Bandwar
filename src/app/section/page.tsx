import { getAllArticles, getCategoriesData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";

export const metadata = {
  title: "All Pages | Bandwar Village",
  description: "The complete directory of articles for Bandwar village — history, temples, schools, culture, and daily life.",
};

export default function SectionPage() {
  const articles = getAllArticles();
  const categories = getCategoriesData().categories;

  // Count articles per category
  const getCount = (catId: string) => articles.filter(a => a.categories.includes(catId)).length;

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            All Pages
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted">
            Every article, photograph, and fact — kept by the village, for the record.
          </p>
        </div>

        {/* Categories Section (Simple Wiki Boxes) */}
        <div className="mb-10">
          <h2 className="font-bold text-lg text-wiki-text mb-4">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const count = getCount(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/section/${cat.id}`}
                  className={`border border-wiki-border-light bg-wiki-bg-alt p-3 flex items-center gap-3 transition-colors ${
                    count === 0 
                      ? "opacity-50 pointer-events-none" 
                      : "hover:bg-[#eaecf0] hover:border-wiki-border"
                  }`}
                >
                  <div className="text-2xl" aria-hidden="true">{cat.icon}</div>
                  <div>
                    <h3 className="font-bold text-wiki-link text-[15px] hover:underline leading-tight">
                      {cat.title}
                    </h3>
                    <p className="text-[12px] text-wiki-text-muted mt-0.5">{count} pages</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All Articles Section (Wikipedia List Style) */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-bold text-lg text-wiki-text">All Articles</h2>
            <div className="h-px bg-wiki-border-light flex-grow"></div>
            <span className="text-[13px] text-wiki-text-muted">{articles.length} total</span>
          </div>
          
          {/* Using single column for mobile, and 2 columns for desktop to keep the list readable */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}