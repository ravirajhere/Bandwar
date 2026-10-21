import Link from 'next/link';
import { getAllArticles, getCategories, getMasterData } from '@/lib/data';
import master from '../../../data/master.json';

export default function HomePage() {
  const articles = getAllArticles();
  const categories = getCategories();
  const recent = articles.slice(0, 6); // Top 6 recent

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container-wide">
          <h1>{master.home.hero.title}</h1>
          <p>{master.home.hero.tagline}</p>
        </div>
      </section>

      {/* Categories */}
      <section className="container-wide py-12">
        <h2 className="text-2xl font-bold mb-6">Explore by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/section/${cat.id}`} className="category-tile p-4 border rounded">
              <div className="text-2xl">{cat.icon}</div>
              <h3 className="font-bold">{cat.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Articles */}
      <section className="container-wide py-12">
        <h2 className="text-2xl font-bold mb-6">Recent Additions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`} className="border rounded p-4 hover:shadow-lg transition">
              <h3 className="text-xl font-bold">{article.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{article.summary.slice(0, 100)}...</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}