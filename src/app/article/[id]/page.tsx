import { notFound } from "next/navigation";
import { getAllArticles, getArticleById } from "@/lib/data";
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
import { ArticleToolbar } from "@/components/article/ArticleToolbar"; // 👈 Naya Import
import Image from "next/image";
import Link from "next/link";

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ id: article.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.id);
  
  if (!article) return { title: "Not Found" };

  return {
    title: `${article.title} | Bandwar Portal`,
    description: article.summary.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.hero ? [{ url: `/${article.hero}`, width: 1200, height: 630, alt: article.title }] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.id);

  if (!article) notFound();

  // 1. SEO Expert: FAQ Schema
  const faqJsonLd = article.faqs && article.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map((faq: { q: string, a: string }) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a }
    }))
  } : null;

  // 2. UX Expert: Generate ID for Table of Contents
  const generateAnchorId = (heading: string) => 
    heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // 3. TTS Expert: Extract all text for "Listen to Article" feature
  const fullContentText = `${article.summary}. ` + article.content.map((block: any) => `${block.heading}. ${block.text}`).join(" ");

  return (
    // Wikipedia Style 3-Column Grid
    <article className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px] gap-8">
      
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* 🟢 LEFT COLUMN: Table of Contents (Classic Wikipedia Box) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 bg-wiki-bg-alt border border-wiki-border p-4 text-sm">
          <h4 className="font-bold text-wiki-text mb-3 text-center">
            Contents
          </h4>
          <ul className="space-y-1.5 text-wiki-link">
            {article.content.map((block: { heading: string }, index: number) => (
              <li key={index}>
                <a 
                  href={`#${generateAnchorId(block.heading)}`}
                  className="block hover:underline leading-tight"
                >
                  <span className="text-wiki-text-muted mr-2">{index + 1}.</span>
                  {block.heading}
                </a>
              </li>
            ))}
            {article.faqs && article.faqs.length > 0 && (
              <li>
                <a href="#faqs" className="block hover:underline leading-tight">
                  <span className="text-wiki-text-muted mr-2">
                    {article.content.length + 1}.
                  </span>
                  FAQs
                </a>
              </li>
            )}
          </ul>
        </div>
      </aside>

      {/* 🟢 MIDDLE COLUMN: Main Article Content (Wrapped for Font Size Adjuster) */}
      <div className="min-w-0 article-body-wrapper">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-wiki-text-muted mb-4">
          <Link href="/" className="hover:text-wiki-link hover:underline">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/section`} className="capitalize hover:text-wiki-link hover:underline">
            {article.categories[0]}
          </Link>
        </nav>

        {/* Header (Wikipedia Style: Title + Underline) */}
        <header className="mb-6">
          <h1 className="font-serif text-4xl md:text-5xl text-wiki-text mb-2 leading-tight">
            {article.title}
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-4"></div>
          
          <p className="text-lg text-wiki-text-muted mb-6 italic">
            {article.subtitle}
          </p>

          {/* 👇 TOOLBAR ADDED HERE 👇 */}
          <div className="no-print">
            <ArticleToolbar title={article.title} contentText={fullContentText} />
          </div>
          
          {article.hero && (
            <div className="relative w-full h-[250px] md:h-[350px] border border-wiki-border-light mb-6">
              <Image
                src={`/${article.hero}`}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Lead Paragraph (Wikipedia keeps it clean) */}
          <p className="text-base md:text-lg text-wiki-text leading-relaxed mb-6">
            {article.summary}
          </p>
        </header>

        {/* Content & Infobox Container (Infobox ko right float karne ke liye) */}
        <div className="flow-root">
          {/* Mobile par Infobox upar dikhega, Desktop par Right column me chala jayega */}
          {article.infobox && (
            <div className="xl:hidden mb-6">
              <Infobox data={article.infobox} title={article.title} />
            </div>
          )}

          {/* Article Content Blocks */}
          <div className="space-y-6">
            {article.content.map((block: { heading: string, text: string }, index: number) => (
              <section key={index} id={generateAnchorId(block.heading)} className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-wiki-text mb-3 pb-1 border-b border-wiki-border-light">
                  {block.heading}
                </h2>
                <div className="text-wiki-text text-base md:text-[17px] leading-relaxed">
                  <WikiText text={block.text} />
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" className="scroll-mt-24 mt-10">
          {article.faqs && article.faqs.length > 0 && (
            <FaqAccordion faqs={article.faqs} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-4 border-t border-wiki-border-light text-xs text-wiki-text-muted flex flex-col md:flex-row justify-between items-center gap-2">
          <span>Last updated: {article.lastUpdated}</span>
          <span>Source: Bandwar Village Portal</span>
        </div>
      </div>

      {/* 🟢 RIGHT COLUMN: Infobox (Classic Wikipedia Data Sheet) */}
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          {article.infobox && <Infobox data={article.infobox} title={article.title} />}
        </div>
      </aside>

    </article>
  );
}