import { notFound } from "next/navigation";
import { getAllArticles, getArticleById, getMasterData, getCategoriesData } from "@/lib/data"; 
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
import { ArticleToolbar } from "@/components/article/ArticleToolbar"; 
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { UniversalEditModal } from "@/components/shared/UniversalEditModal";
import { MobileTOC } from "@/components/article/MobileTOC"; 
import { ArticleHeroImage } from "@/components/article/ArticleHeroImage"; 
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
    <article className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-20 relative">
      
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

      <div className="container mx-auto px-4 md:px-0 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] 3xl:grid-cols-[320px_minmax(0,1fr)_400px] gap-8 xl:gap-10 3xl:gap-16">
        
        {/* LEFT COLUMN (Desktop TOC) */}
        <aside className="hidden lg:block no-print">
          <div className="sticky top-28 bg-surface border border-divider rounded-lg shadow-sm p-5 3xl:p-6 text-sm overflow-hidden">
            <h4 className="font-serif font-semibold text-ink mb-4 pb-3 border-b border-divider text-lg 3xl:text-xl">
              Contents
            </h4>
            <ul className="space-y-2 3xl:space-y-3">
              {article.content.map((block: { heading: string }, index: number) => (
                <li key={index}>
                  <a 
                    href={`#${generateAnchorId(block.heading)}`}
                    className="group flex items-start gap-2.5 text-ink/70 hover:text-accent transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-0.5"
                  >
                    <span className="text-ink/40 group-hover:text-accent/70 mt-0.5 tabular-nums">{index + 1}.</span>
                    <span className="3xl:text-base">{block.heading}</span>
                  </a>
                </li>
              ))}
              {article.faqs && article.faqs.length > 0 && (
                <li>
                  <a href="#faqs" className="group flex items-start gap-2.5 text-ink/70 hover:text-accent transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-0.5">
                    <span className="text-ink/40 group-hover:text-accent/70 mt-0.5 tabular-nums">{article.content.length + 1}.</span>
                    <span className="3xl:text-base">FAQs</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* MIDDLE COLUMN (Main Content) */}
        <div className="min-w-0 article-body-wrapper">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm 3xl:text-base text-ink/60 mb-6 no-print flex-wrap">
            <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">Home</Link>
            <ChevronRight size={14} className="text-divider shrink-0" />
            <Link href={`/section`} className="capitalize hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              {article.categories[0]}
            </Link>
            <ChevronRight size={14} className="text-divider shrink-0" />
            <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-none">{article.title}</span>
          </nav>

          <header className="mb-8 3xl:mb-12">
            {/* Article Title */}
            <div className="flex items-start gap-2 md:gap-3 group">
              <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-3 leading-[1.15] font-semibold tracking-tight">
                {article.title}
              </h1>
              <div className="mt-1 md:mt-2 no-print opacity-50 group-hover:opacity-100 transition-opacity">
                <UniversalEditModal fieldName="Article Title" currentValue={article.title} contextId={article.id} contextType="Article" variant="icon" />
              </div>
            </div>
            
            {/* Subtitle */}
            <div className="flex items-start gap-2 mb-6 group">
              <p className="text-lg md:text-xl 3xl:text-2xl text-ink/70 leading-relaxed font-light m-0">
                {article.subtitle}
              </p>
              <div className="mt-1 no-print opacity-50 group-hover:opacity-100 transition-opacity">
                <UniversalEditModal fieldName="Article Subtitle" currentValue={article.subtitle} contextId={article.id} contextType="Article" variant="icon" />
              </div>
            </div>

            {/* Metadata & Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-divider mb-8 no-print">
              <div className="flex items-center gap-2">
                {article.lastEditedBy ? (
                  <div className="flex items-center gap-1.5 bg-surface text-accent px-3 py-1.5 rounded-md text-[13px] 3xl:text-sm font-medium border border-divider shadow-sm">
                    <ShieldCheck size={16} className="3xl:w-5 3xl:h-5" />
                    <span>Verified by {article.lastEditedBy} on {article.lastUpdated}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-ink/60 text-[13px] 3xl:text-sm font-medium bg-canvas px-3 py-1.5 rounded-md border border-divider">
                    <Calendar size={16} className="3xl:w-5 3xl:h-5" />
                    <span>Last updated on {article.lastUpdated}</span>
                  </div>
                )}
              </div>
              <ArticleToolbar title={article.title} contentText={fullContentText} />
            </div>
            
            {/* Hero Image */}
            {article.hero && (
              <ArticleHeroImage 
                hero={article.hero}
                title={article.title}
                articleId={article.id}
                altText={article.photos?.[0]?.imageAlt || article.title}
              />
            )}

            {/* Summary */}
            <div className="flex items-start gap-2 group mt-6">
              <p className="text-lg md:text-xl 3xl:text-2xl text-ink/90 leading-relaxed font-medium m-0 border-l-4 border-accent pl-4">
                {article.summary}
              </p>
              <div className="mt-1 no-print opacity-50 group-hover:opacity-100 transition-opacity">
                <UniversalEditModal fieldName="Article Summary" currentValue={article.summary} contextId={article.id} contextType="Article" variant="icon" />
              </div>
            </div>
          </header>

          <div className="flow-root">
            {/* Infobox on Mobile/Tablet */}
            {article.infobox && (
              <div className="xl:hidden mb-10 print-infobox">
                <Infobox data={article.infobox} title={article.title} articleId={article.id} />
              </div>
            )}

            {/* Main Content Blocks */}
            <div className="space-y-10 3xl:space-y-14">
              {article.content.map((block: { heading: string, text: string }, index: number) => (
                <section key={index} id={generateAnchorId(block.heading)} className="scroll-mt-28 group/section">
                  <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl text-ink mb-4 pb-2 border-b border-divider font-semibold">
                    {block.heading}
                  </h2>
                  <div className="text-ink/80 text-[17px] md:text-[18px] 3xl:text-[1.25rem] leading-[1.8] prose prose-lg dark:prose-invert max-w-none">
                    <WikiText text={block.text} validIds={validArticleIds} />
                    <div className="inline-block mt-2 not-prose no-print opacity-50 hover:opacity-100 transition-opacity">
                      <UniversalEditModal fieldName={`Paragraph: ${block.heading}`} currentValue={block.text} contextId={article.id} contextType="Article" variant="inline" />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div id="faqs" className="scroll-mt-28 mt-16 3xl:mt-24">
            {article.faqs && article.faqs.length > 0 && (
              <FaqAccordion faqs={article.faqs} />
            )}
          </div>

          {/* Categories */}
          <div className="mt-16 3xl:mt-24 pt-8 border-t border-divider no-print">
            <h3 className="text-sm 3xl:text-base font-bold text-ink/50 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span> Explore Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {article.categories.map((catId) => {
                const cat = categoriesData.find(c => c.id === catId);
                return (
                  <Link
                    key={catId}
                    href={`/section/${catId}`}
                    className="inline-flex items-center gap-2 bg-surface hover:bg-canvas border border-divider px-4 py-2.5 rounded-md text-sm 3xl:text-base font-semibold text-ink transition-all duration-200 shadow-sm hover:shadow hover:border-accent/40 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="text-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">{cat?.icon || "📁"}</span>
                    <span>{cat?.title || catId}</span>
                    <ChevronRight size={16} className="text-ink/40 group-hover:text-accent transition-colors ml-1" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 3xl:mt-16 pt-8 border-t border-divider no-print">
              <h3 className="font-serif text-2xl 3xl:text-3xl font-semibold text-ink mb-6">Read Next</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 3xl:gap-6">
                {relatedArticles.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/article/${rel.id}`}
                    className="bg-surface border border-divider rounded-lg p-5 3xl:p-6 hover:shadow-md hover:border-accent/40 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <h4 className="font-serif text-lg 3xl:text-xl font-semibold text-ink group-hover:text-accent transition-colors mb-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-ink/60 text-sm 3xl:text-base line-clamp-2">{rel.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Backlinks (Mentions In) */}
          {backlinks.length > 0 && (
            <div className="mt-12 3xl:mt-16 pt-8 border-t border-divider no-print">
              <h3 className="font-serif text-xl 3xl:text-2xl font-semibold text-ink mb-4 flex items-center gap-2">
                <Link2 size={20} className="text-accent" /> Mentioned In
              </h3>
              <p className="text-sm 3xl:text-base text-ink/60 mb-4">
                This article is referenced in the following pages:
              </p>
              <ul className="space-y-2 3xl:space-y-3">
                {backlinks.map((link) => (
                  <li key={link.id}>
                    <Link 
                      href={`/article/${link.id}`}
                      className="text-accent hover:text-accent-hover hover:underline text-[15px] 3xl:text-base font-medium flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0"></span>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contribute CTA */}
          <div className="mt-12 3xl:mt-16 bg-canvas border border-divider rounded-lg p-6 sm:p-8 text-center no-print">
            <h3 className="font-serif text-xl 3xl:text-2xl font-semibold text-ink mb-2">
              Something else is incorrect?
            </h3>
            <p className="text-ink/70 text-sm md:text-base mb-6">
              If you have more details or found a mistake not covered by the edit buttons, let us know.
            </p>
            <Link 
              href={`/contribute?page=${article.id}`} 
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-md font-medium hover:bg-accent-hover transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Edit3 size={18} /> Suggest a General Edit
            </Link>
          </div>

          {/* Footer Metadata */}
          <div className="mt-8 pt-6 border-t border-divider text-sm 3xl:text-base text-ink/50 flex flex-col md:flex-row justify-between items-center gap-2">
            <span>Last updated: {article.lastUpdated}</span>
            <span>Source: {config.site.name}</span>
          </div>
        </div>

        {/* RIGHT COLUMN (Infobox) */}
        <aside className="hidden xl:block no-print">
          <div className="sticky top-28">
            {article.infobox && <Infobox data={article.infobox} title={article.title} articleId={article.id} />}
          </div>
        </aside>

      </div>
    </article>
  );
}