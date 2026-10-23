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
    title: `${category.title} | Bandwar Portal`,
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
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Breadcrumb (Wikipedia Style) */}
        <nav className="flex items-center gap-2 text-[13px] text-wiki-text-muted mb-6">
          <Link href="/" className="hover:text-wiki-link hover:underline">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/section" className="hover:text-wiki-link hover:underline">Archive</Link>
          <span aria-hidden="true">›</span>
          <span className="text-wiki-text font-bold">{category.title}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl" aria-hidden="true">{category.icon}</span>
            <h1 className="font-serif text-3xl md:text-4xl text-wiki-text">
              {category.title}
            </h1>
          </div>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-3xl">
            {category.description}
          </p>
          <div className="mt-3">
            <span className="bg-wiki-bg-alt border border-wiki-border-light text-wiki-text-muted text-[12px] font-bold px-2 py-1">
              {articles.length} {articles.length === 1 ? "Article" : "Articles"}
            </span>
          </div>
        </div>

        {/* Articles List (Using 2 columns for the horizontal ArticleCard) */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-wiki-border-light bg-wiki-bg-alt">
            <div className="text-4xl mb-3" aria-hidden="true">📝</div>
            <h3 className="font-bold text-wiki-text mb-1">No articles found</h3>
            <p className="text-wiki-text-muted text-[14px]">There are currently no articles in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
}