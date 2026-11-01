import { notFound } from "next/navigation";
import { getAllArticles, getArticleById, getMasterData, getCategoriesData } from "@/lib/data"; 
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
import { ArticleToolbar } from "@/components/article/ArticleToolbar"; 
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { MobileTOC } from "@/components/article/MobileTOC"; 
import { ArticleHeroImage } from "@/components/article/ArticleHeroImage"; 
import { EditableText } from "@/components/editor/EditableText"; 
import { EditableParagraph } from "@/components/editor/EditableParagraph"; // 🚀 Naya Paragraph Editor
import Link from "next/link";
import { Calendar, ChevronRight, Edit3, Link2, ShieldCheck } from "lucide-react"; 

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
  const categoriesData = getCategoriesData().categories; 

  if (!article) notFound();

  const baseUrl = config.site.url;
  const articleUrl = `${baseUrl}/article/${article.id}`;
  
  const imageUrl = article.hero 
    ? (article.hero.startsWith("http") ? article.hero : `${baseUrl}/${article.hero.startsWith("/") ? article.hero.slice(1) : article.hero}`) 
    : `${baseUrl}/icon.png`;

  const categoryTitle = article.categories[0].charAt(0).toUpperCase() + article.categories[0].slice(1);

  const validArticleIds = allArticles.map(a => a.id);

  const backlinks = allArticles.filter(a => {
    if (a.id === article.id) return false;
    return a.content.some(block => {
      const regex = new RegExp(`\\[\\[${article.id}(\\|.*?)?\\]\\]`, 'i');
      return regex.test(block.text);
    });
  });

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
    <article className="bg-canvas min-h-screen py-6 md:py-10 3xl:py-16 relative font-sans">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedJsonLd) }}
      />

      <ReadingProgress />

      <MobileTOC 
        content={article.content} 
        hasFaqs={!!(article.faqs && article.faqs.length > 0)} 
      />

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

      <div className="container mx-auto px-4 md:px-0 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px] 3xl:grid-cols-[300px_minmax(0,1fr)_380px] gap-8 xl:gap-12 3xl:gap-16">
        
        {/* LEFT COLUMN (Desktop TOC - Wikipedia Style) */}
        <aside className="hidden lg:block no-print">
          <div className="sticky top-24 bg-surface border border-divider p-4 3xl:p-5 text-sm">
            <h4 className="font-bold text-ink mb-3 pb-2 border-b border-divider text-xs uppercase tracking-wider">
              Contents
            </h4>
            <ul className="space-y-1.5">
              {article.content.map((block: { heading: string }, index: number) => (
                <li key={index}>
                  <a 
                    href={`#${generateAnchorId(block.heading)}`}
                    className="group flex items-start gap-2 text-ink-muted hover:text-accent transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-0.5"
                  >
                    <span className="text-ink/30 font-mono text-xs mt-0.5">{index + 1}.</span>
                    <span className="3xl:text-[15px]">{block.heading}</span>
                  </a>
                </li>
              ))}
              {article.faqs && article.faqs.length > 0 && (
                <li>
                  <a href="#faqs" className="group flex items-start gap-2 text-ink-muted hover:text-accent transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-0.5">
                    <span className="text-ink/30 font-mono text-xs mt-0.5">{article.content.length + 1}.</span>
                    <span className="3xl:text-[15px]">FAQs</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* MIDDLE COLUMN (Main Content) */}
        <div className="min-w-0 article-body-wrapper">
          
          {/* Breadcrumb (Strict & Compact) */}
          <nav className="flex items-center gap-2 text-[13px] text-ink-muted mb-6 no-print flex-wrap">
            <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Home</Link>
            <ChevronRight size={12} className="text-divider shrink-0" />
            <Link href={`/section/${article.categories[0]}`} className="capitalize hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              {categoryTitle}
            </Link>
            <ChevronRight size={12} className="text-divider shrink-0" />
            <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-none">{article.title}</span>
          </nav>

          <header className="mb-8 border-b border-divider pb-6">
            {/* 🚀 Article Title (In-Place Editing) */}
            <div className="mb-3">
              <EditableText
                initialValue={article.title}
                contextId={article.id}
                contextType="Article"
                fieldName="Article Title"
                as="h1"
                className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink leading-[1.1] font-bold tracking-tight"
              />
            </div>
            
            {/* 🚀 Subtitle (In-Place Editing) */}
            <div className="mb-5">
              <EditableText
                initialValue={article.subtitle}
                contextId={article.id}
                contextType="Article"
                fieldName="Article Subtitle"
                as="p"
                className="text-lg md:text-xl text-ink-muted leading-relaxed font-normal m-0"
              />
            </div>

            {/* Metadata & Toolbar (Strict Flat layout) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-3 text-[13px]">
                {article.lastEditedBy ? (
                  <div className="flex items-center gap-1.5 text-ink font-medium">
                    <ShieldCheck size={16} className="text-accent" />
                    <span>Verified by {article.lastEditedBy}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-ink-muted font-medium">
                    <Calendar size={16} />
                    <span>Updated on {article.lastUpdated}</span>
                  </div>
                )}
                {article.lastEditedBy && (
                  <>
                    <span className="text-divider">|</span>
                    <span className="text-ink-muted flex items-center gap-1.5">
                      <Calendar size={14} /> {article.lastUpdated}
                    </span>
                  </>
                )}
              </div>
              <ArticleToolbar title={article.title} contentText={fullContentText} />
            </div>
          </header>

          {/* Hero Image */}
          {article.hero && (
            <div className="mb-8">
              <ArticleHeroImage 
                hero={article.hero}
                title={article.title}
                articleId={article.id}
                altText={article.photos?.[0]?.imageAlt || article.title}
              />
            </div>
          )}

          {/* 🚀 Lead Paragraph (Summary) - Inline Editing */}
          <div className="mb-10">
            <EditableParagraph
              initialValue={article.summary}
              contextId={article.id}
              contextType="Article"
              fieldName="Article Summary"
              className="text-lg md:text-xl 3xl:text-[1.35rem] text-ink leading-relaxed font-medium"
            />
          </div>

          <div className="flow-root">
            {/* Infobox on Mobile/Tablet */}
            {article.infobox && (
              <div className="xl:hidden mb-10 print-infobox">
                <Infobox data={article.infobox} title={article.title} articleId={article.id} />
              </div>
            )}

            {/* 🚀 Main Content Blocks - Inline Editing */}
            <div className="space-y-8 3xl:space-y-12">
              {article.content.map((block: { heading: string, text: string }, index: number) => (
                <section key={index} id={generateAnchorId(block.heading)} className="scroll-mt-24">
                  <div className="border-b border-divider pb-2 mb-4">
                    <h2 className="font-serif text-2xl 3xl:text-3xl text-ink font-bold m-0">
                      {block.heading}
                    </h2>
                  </div>
                  <EditableParagraph
                    initialValue={block.text}
                    contextId={article.id}
                    contextType="Article"
                    fieldName={`Paragraph: ${block.heading}`}
                    className="text-ink/90 text-base md:text-[17px] 3xl:text-[1.15rem] leading-[1.8] prose prose-lg dark:prose-invert max-w-[75ch]"
                    renderer={(text) => <WikiText text={text} validIds={validArticleIds} />}
                  />
                </section>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div id="faqs" className="scroll-mt-24 mt-12 3xl:mt-16">
            {article.faqs && article.faqs.length > 0 && (
              <FaqAccordion faqs={article.faqs} />
            )}
          </div>

          {/* Categories (Strict List) */}
          <div className="mt-12 3xl:mt-16 pt-6 border-t border-divider no-print">
            <h3 className="text-xs 3xl:text-sm font-bold text-ink-muted uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.categories.map((catId) => {
                const cat = categoriesData.find(c => c.id === catId);
                return (
                  <Link
                    key={catId}
                    href={`/section/${catId}`}
                    className="inline-flex items-center gap-1.5 bg-surface border border-divider px-2.5 py-1 text-xs 3xl:text-sm font-medium text-ink-muted hover:text-accent hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span>{cat?.title || catId}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Related Articles (Grid) */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 3xl:mt-16 pt-8 border-t border-divider no-print">
              <h3 className="font-serif text-xl 3xl:text-2xl font-bold text-ink mb-4">Read Next</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/article/${rel.id}`}
                    className="bg-surface border border-divider p-4 hover:border-accent transition-colors flex flex-col group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <h4 className="font-serif text-base 3xl:text-lg font-bold text-ink group-hover:text-accent transition-colors mb-1 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-ink-muted text-sm line-clamp-2">{rel.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Backlinks (Mentions In) */}
          {backlinks.length > 0 && (
            <div className="mt-12 3xl:mt-16 pt-6 border-t border-divider no-print">
              <h3 className="font-bold text-xs 3xl:text-sm text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Link2 size={14} /> Mentioned In
              </h3>
              <ul className="space-y-1.5 pl-1">
                {backlinks.map((link) => (
                  <li key={link.id}>
                    <Link 
                      href={`/article/${link.id}`}
                      className="text-accent hover:underline text-sm 3xl:text-base font-medium flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      <span className="w-1 h-1 bg-ink/20 rounded-full shrink-0"></span>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contribute CTA */}
          <div className="mt-12 3xl:mt-16 bg-surface border border-divider p-6 text-center no-print">
            <h3 className="font-serif text-lg font-bold text-ink mb-1">
              Something is incorrect?
            </h3>
            <p className="text-ink-muted text-sm mb-4">
              If you have additional details, let us know.
            </p>
            <Link 
              href={`/contribute?page=${article.id}`} 
              className="inline-flex items-center gap-2 bg-canvas border border-divider text-ink px-4 py-2 text-sm font-semibold hover:border-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Edit3 size={14} /> Suggest an Edit
            </Link>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 pt-4 border-t border-divider text-xs text-ink-muted flex flex-col md:flex-row justify-between items-center gap-2">
            <span>Last updated: {article.lastUpdated}</span>
            <span>Source: {config.site.name}</span>
          </div>
        </div>

        {/* RIGHT COLUMN (Infobox) */}
        <aside className="hidden xl:block no-print">
          <div className="sticky top-24">
            {article.infobox && <Infobox data={article.infobox} title={article.title} articleId={article.id} />}
          </div>
        </aside>

      </div>
    </article>
  );
}