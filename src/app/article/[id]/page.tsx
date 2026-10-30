import { notFound } from "next/navigation";
import { getAllArticles, getArticleById } from "@/lib/data";
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
import { ArticleToolbar } from "@/components/article/ArticleToolbar"; 
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

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
  const allArticles = getAllArticles();

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

  // 3. TTS Expert: Extract all text
  const fullContentText = `${article.summary}. ` + article.content.map((block: { heading: string, text: string }) => `${block.heading}. ${block.text}`).join(" ");

  // 4. Senior Addition: Get Related Articles
  const relatedArticles = article.related?.map(id => allArticles.find(a => a.id === id)).filter(Boolean) || [];

  return (
    <article className="bg-background min-h-screen py-10 md:py-16">
      <div className="container-custom grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-8 xl:gap-12">
        
        {faqJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        )}

        {/* 🟢 LEFT COLUMN: Table of Contents (Desktop Only) */}
        <aside className="hidden lg:block no-print">
          <div className="sticky top-28 bg-card border border-border rounded-xl shadow-sm p-5 text-sm overflow-hidden">
            <h4 className="font-serif font-semibold text-foreground mb-4 pb-3 border-b border-border text-lg">
              Contents
            </h4>
            <ul className="space-y-2">
              {article.content.map((block: { heading: string }, index: number) => (
                <li key={index}>
                  <a 
                    href={`#${generateAnchorId(block.heading)}`}
                    className="group flex items-start gap-2 text-foreground/70 hover:text-brand transition-colors leading-snug"
                  >
                    <span className="text-muted group-hover:text-brand mt-0.5">{index + 1}.</span>
                    <span>{block.heading}</span>
                  </a>
                </li>
              ))}
              {article.faqs && article.faqs.length > 0 && (
                <li>
                  <a href="#faqs" className="group flex items-start gap-2 text-foreground/70 hover:text-brand transition-colors leading-snug">
                    <span className="text-muted group-hover:text-brand mt-0.5">{article.content.length + 1}.</span>
                    <span>FAQs</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* 🟢 MIDDLE COLUMN: Main Article Content */}
        <div className="min-w-0 article-body-wrapper">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-6 no-print flex-wrap">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <ChevronRight size={14} className="text-border" />
            <Link href={`/section`} className="capitalize hover:text-brand transition-colors">
              {article.categories[0]}
            </Link>
            <ChevronRight size={14} className="text-border" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{article.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-3 leading-tight font-semibold tracking-tight">
              {article.title}
            </h1>
            
            <p className="text-lg md:text-xl text-muted mb-6 leading-relaxed font-light">
              {article.subtitle}
            </p>

            {/* Meta & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-border mb-8 no-print">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar size={16} />
                <span>Updated: {article.lastUpdated}</span>
              </div>
              <ArticleToolbar title={article.title} contentText={fullContentText} />
            </div>
            
            {/* Hero Image (Premium Cover) */}
            {article.hero && (
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-card mb-10 bg-muted-background">
                <Image
                  src={article.hero.startsWith("/") ? article.hero : `/${article.hero}`}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
              </div>
            )}

            {/* Lead Paragraph */}
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed font-medium">
              {article.summary}
            </p>
          </header>

          {/* Content & Infobox Container */}
          <div className="flow-root">
            
            {/* Mobile Infobox */}
            {article.infobox && (
              <div className="xl:hidden mb-8 print-infobox">
                <Infobox data={article.infobox} title={article.title} />
              </div>
            )}

            {/* Article Content Blocks */}
            <div className="space-y-10">
              {article.content.map((block: { heading: string, text: string }, index: number) => (
                <section key={index} id={generateAnchorId(block.heading)} className="scroll-mt-28">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4 pb-2 border-b border-border-subtle font-semibold">
                    {block.heading}
                  </h2>
                  <div className="text-foreground/80 text-[17px] md:text-[18px] leading-[1.8] prose prose-lg dark:prose-invert max-w-none">
                    <WikiText text={block.text} />
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div id="faqs" className="scroll-mt-28 mt-16">
            {article.faqs && article.faqs.length > 0 && (
              <FaqAccordion faqs={article.faqs} />
            )}
          </div>

          {/* 🚀 Senior Addition: Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border no-print">
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">Read Next</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/article/${rel.id}`}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-card hover:border-brand/30 transition-all group"
                  >
                    <h4 className="font-serif text-lg font-semibold text-foreground group-hover:text-brand transition-colors mb-2">
                      {rel.title}
                    </h4>
                    <p className="text-muted text-sm line-clamp-2">{rel.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-12 pt-6 border-t border-border text-sm text-muted flex flex-col md:flex-row justify-between items-center gap-2">
            <span>Last updated: {article.lastUpdated}</span>
            <span>Source: Bandwar Village Portal</span>
          </div>
        </div>

        {/* 🟢 RIGHT COLUMN: Infobox (Desktop Only) */}
        <aside className="hidden xl:block no-print">
          <div className="sticky top-28">
            {article.infobox && <Infobox data={article.infobox} title={article.title} />}
          </div>
        </aside>

      </div>
    </article>
  );
}