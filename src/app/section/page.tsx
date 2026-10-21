import { getAllArticles, getCategoriesData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import Link from "next/link";

export const metadata = {
  title: "Archive | Bandwar Village",
  description: "The complete archive of Bandwar village — history, temples, schools, culture, and daily life.",
};

export default function SectionPage() {
  const articles = getAllArticles();
  const categories = getCategoriesData().categories;

  // Har category ke andar kitne articles hain, wo gin rahe hain
  const getCount = (catId: string) => articles.filter(a => a.categories.includes(catId)).length;

  return (
    <div className="bg-[#f7f5ef] min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a18] mb-4">The Archive</h1>
          <p className="text-lg text-[#1a1a18]/60 max-w-2xl mx-auto">
            Every article, every photograph, every fact — kept by the village, for the record.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-[#1a1a18] mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const count = getCount(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/section/${cat.id}`}
                  className={`p-4 rounded-xl bg-white border border-[#1a1a18]/10 hover:border-[#1f3d2f] hover:shadow-md transition-all group ${count === 0 ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <h3 className="font-bold text-[#1a1a18] group-hover:text-[#1f3d2f] mb-1">{cat.title}</h3>
                  <p className="text-xs text-[#1a1a18]/60">{count} articles</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* All Articles */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#1a1a18]">All Articles</h2>
            <div className="h-px bg-[#1a1a18]/20 flex-grow"></div>
            <span className="text-sm font-medium text-[#1a1a18]/50">{articles.length} total</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}