import { notFound } from 'next/navigation';
import { getArticle, getAllArticles } from '@/lib/data';
import Link from 'next/link';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} | Bandwar Archive`,
    description: article.summary,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  return (
    <article className="container-text py-12">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <p className="text-lg text-gray-600 mb-8">{article.summary}</p>

      <div className="article-body">
        {article.content.map((section, idx) => (
          <section key={idx} className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{section.heading}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </div>

      {article.faqs && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">FAQs</h2>
          {article.faqs.map((faq, i) => (
            <details key={i} className="mb-2 border p-4 rounded">
              <summary className="font-bold">{faq.q}</summary>
              <p className="mt-2">{faq.a}</p>
            </details>
          ))}
        </div>
      )}
    </article>
  );
}