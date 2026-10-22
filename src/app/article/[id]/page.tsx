import { notFound } from "next/navigation";
import { getAllArticles, getArticleById } from "@/lib/data";
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
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
    title: `${article.title} | Bandwar Archive`,
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

  // 2. UX Expert: Generate ID for Table of Contents (URL friendly)
  const generateAnchorId = (heading: string) => 
    heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <article className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
      
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* 🟢 LEFT SIDEBAR: Table of Contents (Desktop only) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <h4 className="font-bold text-primary mb-4 uppercase tracking-wider text-sm border-b border-primary/10 pb-2">
            Contents
          </h4>
          <ul className="space-y-2 text-sm text-primary/70 border-l-2 border-primary/10">
            {article.content.map((block: { heading: string }, index: number) => (
              <li key={index}>
                <a 
                  href={`#${generateAnchorId(block.heading)}`}
                  className="block py-1 pl-4 hover:text-warn hover:border-l-2 hover:border-warn transition-all -ml-[2px]"
                >
                  {block.heading}
                </a>
              </li>
            ))}
            {article.faqs && article.faqs.length > 0 && (
              <li>
                <a href="#faqs" className="block py-1 pl-4 hover:text-warn hover:border-l-2 hover:border-warn transition-all -ml-[2px]">
                  FAQs
                </a>
              </li>
            )}
          </ul>
        </div>
      </aside>

      {/* 🟢 MAIN CONTENT AREA */}
      <div className="flex-grow max-w-4xl min-w-0">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-primary/60 mb-6 font-medium">
          <Link href="/" className="hover:text-warn transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/${article.categories[0]}`} className="capitalize hover:text-warn transition-colors">
            {article.categories[0]}
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-warn font-medium mb-6">
            {article.subtitle}
          </p>
          
          {article.hero && (
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden mb-8 shadow-sm">
              <Image
                src={`/${article.hero}`}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px" // 👈 Performance Fix
                className="object-cover"
                priority
              />
            </div>
          )}

          <p className="text-lg md:text-xl text-primary/80 leading-relaxed font-medium bg-surface p-6 rounded-lg border-l-4 border-accent">
            {article.summary}
          </p>
        </header>

        {/* Content & Infobox */}
        {/* 3. Layout Expert: flow-root prevents text from wrapping under floated Infobox */}
        <div className="flow-root text-primary leading-relaxed">
          {article.infobox && <Infobox data={article.infobox} title={article.title} />}

          <div className="space-y-8">
            {article.content.map((block: { heading: string, text: string }, index: number) => (
              <section key={index} id={generateAnchorId(block.heading)} className="scroll-mt-24">
                <h2 className="font-serif text-2xl font-bold text-primary mb-4 border-b border-primary/10 pb-2">
                  {block.heading}
                </h2>
                <p className="text-base md:text-lg">
                  <WikiText text={block.text} />
                </p>
              </section>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" className="scroll-mt-24 mt-12">
          {article.faqs && article.faqs.length > 0 && (
            <FaqAccordion faqs={article.faqs} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-6 border-t border-primary/10 text-sm text-primary/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>Last updated: {article.lastUpdated}</span>
          <span className="font-medium">Bandwar Village Archive</span>
        </div>
      </div>
    </article>
  );
}