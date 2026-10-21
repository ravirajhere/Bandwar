import { getAllArticles, getCategoriesData } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";
import { notFound } from "next/navigation";
import Link from "next/link";

// Build time pe saari categories ke pages generate karega
export async function generateStaticParams() {
  const categories = getCategoriesData().categories;
  return categories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const categories = getCategoriesData().categories;
  const category = categories.find(c => c.id === resolved.category);
  
  if (!category) return { title: "Not Found" };
  
  return {
    title: `${category.title} | Bandwar Archive`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const categories = getCategoriesData().categories;
  const category = categories.find(c => c.id === resolved.category);

  if (!category) notFound();

  const articles = getAllArticles().filter(a => a.categories.includes(category.id));

  return (
    <div className="bg-[#f7f5ef] min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#1a1a18]/50 mb-8">
          <Link href="/" className="hover:text-[#1f3d2f]">Home</Link>
          <span>/</span>
          <Link href="/section" className="hover:text-[#1f3d2f]">Archive</Link>
          <span>/</span>
          <span className="text-[#1a1a18] font-medium">{category.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-12 border-b border-[#1a1a18]/10 pb-8">
          <div className="text-5xl mb-4">{category.icon}</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a18] mb-3">
            {category.title}
          </h1>
          <p className="text-lg text-[#1a1a18]/60 max-w-2xl">
            {category.description}
          </p>
          <p className="mt-4 text-sm font-bold text-[#a64b2a] uppercase tracking-wider">
            {articles.length} {articles.length === 1 ? "Article" : "Articles"}
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#1a1a18]/20">
            <div className="text-5xl mb-4">📝</p>
            <h3 className="font-serif text-xl font-bold text-[#1a1a18] mb-2">No articles yet</h3>
            <p className="text-[#1a1a18]/60">Is category mein abhi koi article nahi hai.</p>
          </div>
        )}

      </div>
    </div>
  );
}