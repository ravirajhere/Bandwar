import { notFound } from "next/navigation";
import { getAllArticles, getArticleById, getMasterData } from "@/lib/data";
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
import { ArticleToolbar } from "@/components/article/ArticleToolbar"; 
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { ImageUpdateButton } from "@/components/shared/ImageUpdateButton"; 
import { UniversalEditModal } from "@/components/shared/UniversalEditModal";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Edit3 } from "lucide-react"; 

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ id: article.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.id);
  const config = getMasterData();
  
  if (!article) return { title: "Not Found" };

  const ogImage = article.hero 
    ? (article.hero.startsWith("/") ? article.hero : `/${article.hero}`) 
    : "/icon.png";

  return {
    title: article.metaTitle || `${article.title} | ${config.site.name}`,
    description: article.metaDescription || article.summary.slice(0, 160),
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.summary,
      url: `${config.site.url}/article/${article.id}`,
      siteName: config.site.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
      type: "article",
      publishedTime: article.lastUpdated,
      modifiedTime: article.lastUpdated,
    },
    alternates: {
      canonical: `${config.site.url}/article/${article.id}`,
    }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.id);
  const allArticles = getAllArticles();
  const config = getMasterData(); 

  if (!article) notFound();

  const baseUrl = config.site.url;
  const articleUrl = `${baseUrl}/article/${article.id}`;
  
  const imageUrl = article.hero 
    ? (article.hero.startsWith("http") ? article.hero : `${baseUrl}/${article.hero.startsWith("/") ? article.hero.slice(1) : article.hero}`) 
    : `${baseUrl}/icon.png`;

  const categoryTitle = article.categories[0].charAt(0).toUpperCase() + article.categories[0].slice(1);

  // ==========================================
  // 🚀 2026 SEO: Advanced Structured Data (JSON-LD)
  // ==========================================
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
    "headline": article.title,
    "description": article.summary,
    "image": [imageUrl],
    "author": { "@type": "Organization", "name": config.site.name, "url": baseUrl },
    "publisher": {
      "@type": "Organization",
      "name": config.site.name,
      "logo": { "@type": "ImageObject", "url": `${baseUrl}/icon.png` }
    },
    "datePublished": article.lastUpdated,
    "dateModified": article.lastUpdated
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": categoryTitle, "item": `${baseUrl}/section/${article.categories[0]}` },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": articleUrl }
    ]
  };

  const faqJsonLd = article.faqs && article.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map((faq: { q: string, a: string }) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a }
    }))
  } : null;

  const combinedJsonLd = [articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean);

  const generateAnchorId = (heading: string) => 
    heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const fullContentText = `${article.summary}. ` + article.content.map((block: { heading: string, text: string }) => `${block.heading}. ${block.text}`).join(" ");

  const relatedArticles = article.related?.map(id => allArticles.find(a => a.id === id)).filter(Boolean) || [];

  return (
    <article className="bg-background min-h-screen py-10 md:py-16 relative">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedJsonLd) }}
      />

      <ReadingProgress />

      {/* 🖨️ PRINT-ONLY HEADER */}
      <div className="hidden print-only mb-8 pb-4 border-b-2 border-black">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold font-serif m-0">{config.site.name}</h1>
            <p className="text-sm m-0 mt-1">{baseUrl.replace("https://", "")}</p>
          </div>
          <div className="text-sm text-right">
            <p className="m-0">Printed Document</p>
            <p className="m-0">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="container-custom grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-8 xl:gap-12">
        
        {/* LEFT COLUMN */}
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

        {/* MIDDLE COLUMN */}
        <div className="min-w-0 article-body-wrapper">
          
          <nav className="flex items-center gap-2 text-sm text-muted mb-6 no-print flex-wrap">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <ChevronRight size={14} className="text-border" />
            <Link href={`/section`} className="capitalize hover:text-brand transition-colors">
              {article.categories[0]}
            </Link>
            <ChevronRight size={14} className="text-border" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{article.title}</span>
          </nav>

          <header className="mb-8">
            
            {/* 🚀 TITLE WITH EDIT */}
            <div className="flex items-start gap-2 md:gap-3 group">
              <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-3 leading-tight font-semibold tracking-tight">
                {article.title}
              </h1>
              <div className="mt-1 md:mt-2 no-print">
                <UniversalEditModal 
                  fieldName="Article Title" 
                  currentValue={article.title} 
                  contextId={article.id} 
                  contextType="Article" 
                  variant="icon" 
                />
              </div>
            </div>
            
            {/* 🚀 SUBTITLE WITH EDIT */}
            <div className="flex items-start gap-2 mb-6 group">
              <p className="text-lg md:text-xl text-muted leading-relaxed font-light m-0">
                {article.subtitle}
              </p>
              <div className="mt-1 no-print">
                <UniversalEditModal 
                  fieldName="Article Subtitle" 
                  currentValue={article.subtitle} 
                  contextId={article.id} 
                  contextType="Article" 
                  variant="icon" 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-border mb-8 no-print">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar size={16} />
                <span>Updated: {article.lastUpdated}</span>
              </div>
              <ArticleToolbar title={article.title} contentText={fullContentText} />
            </div>
            
            {/* 🚀 HERO IMAGE */}
            {article.hero && (
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-card mb-10 bg-muted-background group">
                <Image
                  src={article.hero.startsWith("/") ? article.hero : `/${article.hero}`}
                  alt={article.photos?.[0]?.imageAlt || article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
                <ImageUpdateButton contextName={`Article: ${article.title}`} />
              </div>
            )}

            {/* 🚀 SUMMARY WITH EDIT */}
            <div className="flex items-start gap-2 group">
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed font-medium m-0">
                {article.summary}
              </p>
              <div className="mt-1 no-print">
                <UniversalEditModal 
                  fieldName="Article Summary" 
                  currentValue={article.summary} 
                  contextId={article.id} 
                  contextType="Article" 
                  variant="icon" 
                />
              </div>
            </div>
          </header>

          <div className="flow-root">
            {/* 🖨️ Mobile & Print Infobox (Ab 'hidden' nahi hai) */}
            {article.infobox && (
              <div className="xl:hidden mb-8 print-infobox">
                <Infobox data={article.infobox} title={article.title} articleId={article.id} />
              </div>
            )}

            <div className="space-y-10">
              {article.content.map((block: { heading: string, text: string }, index: number) => (
                <section key={index} id={generateAnchorId(block.heading)} className="scroll-mt-28 group/section">
                  <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4 pb-2 border-b border-border-subtle font-semibold">
                    {block.heading}
                  </h2>
                  <div className="text-foreground/80 text-[17px] md:text-[18px] leading-[1.8] prose prose-lg dark:prose-invert max-w-none">
                    <WikiText text={block.text} />
                    
                    {/* 🚀 INLINE EDIT FOR PARAGRAPH */}
                    <div className="inline-block mt-2 not-prose no-print">
                      <UniversalEditModal 
                        fieldName={`Paragraph: ${block.heading}`} 
                        currentValue={block.text} 
                        contextId={article.id} 
                        contextType="Article" 
                        variant="inline" 
                      />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div id="faqs" className="scroll-mt-28 mt-16">
            {article.faqs && article.faqs.length > 0 && (
              <FaqAccordion faqs={article.faqs} />
            )}
          </div>

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

          {/* Bottom generic edit box */}
          <div className="mt-12 bg-muted-background border border-border rounded-xl p-6 sm:p-8 text-center no-print">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Something else is incorrect?
            </h3>
            <p className="text-muted mb-6">
              If you have more details or found a mistake not covered by the edit buttons, let us know.
            </p>
            <Link 
              href={`/contribute?page=${article.id}`} 
              className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-hover transition-colors shadow-sm"
            >
              <Edit3 size={18} /> Suggest a General Edit
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-sm text-muted flex flex-col md:flex-row justify-between items-center gap-2">
            <span>Last updated: {article.lastUpdated}</span>
            <span>Source: {config.site.name}</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="hidden xl:block no-print">
          <div className="sticky top-28">
            {/* 🖨️ Desktop Infobox */}
            {article.infobox && <Infobox data={article.infobox} title={article.title} articleId={article.id} />}
          </div>
        </aside>

      </div>
    </article>
  );
}