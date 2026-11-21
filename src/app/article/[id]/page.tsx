import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMasterData, getAllArticles, getMediaData } from "@/lib/data";
import { ChevronRight, MapPin, Clock, ShieldCheck, Share2, Printer, Bookmark, CalendarDays, User } from "lucide-react";
import { ArticleAudioPlayer } from "@/components/article/ArticleAudioPlayer";

interface Contributor { username?: string; displayName?: string; bio?: string; photoUrl?: string; role?: string; }

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const allArticles = getAllArticles();
  const article = allArticles.find((a) => a.id === params.id);
  const config = getMasterData();
  if (!article) return { title: "Not Found — Bandwar Village Archive" };

  const baseUrl = config.site.url;
  const author = (config.contributors || []).find((c: any) => c.username === article.author) as Contributor | undefined;
  const heroImage = article.hero ? `${baseUrl}/${article.hero.replace(/^\//, "")}` : `${baseUrl}/images/geography/burhi-gandak-river-dawn-bandwar.jpg`;
  const articleUrl = `${baseUrl}/article/${article.id}`;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: articleUrl, languages: { "en-IN": articleUrl, "x-default": articleUrl } },
    keywords: [...(article.tags || []), article.title, ...article.categories, "Bandwar", "Begusarai", "Bihar"],
    authors: [{ name: author?.displayName || article.author, url: author?.username ? `${baseUrl}/contributors/${author.username}` : undefined }],
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: articleUrl,
      siteName: "Bandwar Village Archive",
      locale: "en_IN",
      publishedTime: article.publishedDate || article.lastUpdated,
      modifiedTime: article.lastUpdated,
      authors: [author?.displayName || article.author],
      tags: article.tags,
      section: article.categories[0] || "History",
      images: [{ url: heroImage, width: 1200, height: 630, alt: article.heroAlt || article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [heroImage],
    },
  };
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const config = getMasterData();
  const allArticles = getAllArticles();
  const article = allArticles.find((a) => a.id === params.id);
  if (!article) notFound();

  const baseUrl = config.site.url;
  const articleUrl = `${baseUrl}/article/${article.id}`;
  const author = (config.contributors || []).find((c: any) => c.username === article.author) as Contributor | undefined;
  const authorName = author?.displayName || article.author;
  const heroImage = article.hero ? (article.hero.startsWith("/") ? article.hero : `/${article.hero}`) : "/fallback.jpg";

  const relatedArticles = (article.related || []).map((id: string) => allArticles.find((a) => a.id === id)).filter(Boolean) as typeof allArticles;
  const autoRelated = allArticles
    .filter((a) => a.id !== article.id && a.categories.some((c) => article.categories.includes(c)))
    .slice(0, 3);
  const finalRelated = relatedArticles.length > 0 ? relatedArticles : autoRelated;

  const headings = article.headings || [];
  const toc = headings.map((h: any) => ({ id: h.id, text: h.text, level: h.level || 2 }));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: article.title,
        description: article.summary,
        image: { "@type": "ImageObject", url: `${baseUrl}${heroImage}`, width: 1200, height: 630, caption: article.heroAlt || article.title },
        datePublished: article.publishedDate || article.lastUpdated,
        dateModified: article.lastUpdated,
        inLanguage: "en-IN",
        author: { "@id": `${baseUrl}/contributors/${article.author}#person` },
        publisher: { "@id": `${baseUrl}/#organization` },
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        articleSection: article.categories,
        keywords: article.tags?.join(", "),
        wordCount: article.body?.split(/\s+/).length || 0,
        speakableSpecification: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".article-body-wrapper p"] },
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/contributors/${article.author}#person`,
        name: authorName,
        jobTitle: author?.role || "Community Contributor",
        description: author?.bio || `${authorName} is a contributor to the Bandwar Village Archive.`,
        ...(author?.photoUrl ? { image: `${baseUrl}${author.photoUrl}` } : {}),
        ...(author?.username ? { url: `${baseUrl}/contributors/${author.username}` } : {}),
        memberOf: { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          { "@type": "ListItem", position: 2, name: article.categories[0] || "Archive", item: `${baseUrl}/section/${article.categories[0]?.toLowerCase()}` },
          { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
        ],
      },
      ...(article.faq && article.faq.length > 0
        ? [{ "@type": "FAQPage", mainEntity: article.faq.map((f: any) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }]
        : []),
    ],
  };

  return (
    <article className="bg-canvas min-h-screen pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Reading Progress — Top Tier: patla + accent */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-divider/50 z-progress">
        <div id="reading-progress" className="h-full bg-accent w-0 transition-[width] duration-100"></div>
      </div>

      <div className="container mx-auto px-4 md:px-0 max-w-7xl pt-6 md:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-6">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/section/${article.categories[0]?.toLowerCase()}`} className="hover:text-accent">{article.categories[0]}</Link>
          <ChevronRight size={12} />
          <span className="text-ink truncate max-w-[200px] md:max-w-md">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="chip">{article.categories[0]}</span>
            {article.verified && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-pill">
                <ShieldCheck size={13} /> Verified
              </span>
            )}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.1] text-balance mb-4">{article.title}</h1>
          <p className="text-lg text-ink-muted leading-relaxed text-pretty">{article.summary}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-muted mt-6">
            <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {new Date(article.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="w-1 h-1 rounded-full bg-divider" />
            <span className="flex items-center gap-1.5"><Clock size={13} /> {article.readingTime || "5 min read"}</span>
            <span className="w-1 h-1 rounded-full bg-divider" />
            <span className="flex items-center gap-1.5"><User size={13} /> {authorName}</span>
          </div>
        </header>

        {/* Hero — Full Bleed */}
        <div className="hero-frame relative w-full max-w-5xl mx-auto aspect-[16/9] mb-10">
          <Image src={heroImage} alt={article.heroAlt || article.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 80vw" />
          {article.heroCaption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              <p className="text-xs text-white/90 text-center m-0">{article.heroCaption}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          {/* TOC — Sticky + Active */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <h2 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">On this page</h2>
              <nav className="space-y-2.5 relative">
                {toc.map((h: any) => (
                  <a key={h.id} href={`#${h.id}`} data-toc-link={h.id} className={`toc-link relative block text-sm ${h.level === 3 ? "pl-4" : ""}`}>
                    {h.text}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-divider flex gap-2">
                <button className="btn-ghost !px-3 !py-2 border border-divider" aria-label="Share"><Share2 size={16} /></button>
                <button className="btn-ghost !px-3 !py-2 border border-divider" aria-label="Print" onClick={() => window.print()}><Printer size={16} /></button>
                <button className="btn-ghost !px-3 !py-2 border border-divider" aria-label="Save"><Bookmark size={16} /></button>
              </div>
            </div>
          </aside>

          {/* Body */}
          <div className="lg:col-span-6">
            {article.audioUrl && <ArticleAudioPlayer src={article.audioUrl} title={article.title} />}
            <div className="article-body-wrapper prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.bodyHtml || article.body || "" }} />

            {/* Author Box — E-E-A-T Top Tier */}
            <div className="card p-6 mt-12 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center shrink-0 overflow-hidden">
                {author?.photoUrl ? (
                  <Image src={author.photoUrl} alt={authorName} width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <User size={20} className="text-accent" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-1">Written by</p>
                <Link href={author?.username ? `/contributors/${author.username}` : "#"} className="font-serif font-bold text-lg text-ink hover:text-accent">{authorName}</Link>
                <p className="text-sm text-ink-muted leading-relaxed mt-1">{author?.bio || "Community contributor to the Bandwar Village Archive."}</p>
                <p className="text-xs text-ink-subtle mt-2">Last reviewed: {new Date(article.lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} • Source: Community records & field interviews</p>
              </div>
            </div>
          </div>

          {/* Right Rail */}
          <aside className="lg:col-span-3 space-y-8">
            {article.infobox && (
              <div className="card print-infobox p-5">
                <h3 className="font-serif font-bold text-lg mb-4 pb-3 border-b border-divider">{article.infobox.title || "Quick Facts"}</h3>
                <dl className="space-y-3 text-sm m-0">
                  {Object.entries(article.infobox).filter(([k]) => k !== "title").map(([k, v]: any) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-ink-muted capitalize">{k.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="text-ink font-medium text-right">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {article.location && (
              <div className="card p-5">
                <h3 className="font-serif font-bold text-lg mb-2 flex items-center gap-2"><MapPin size={16} className="text-accent" /> Location</h3>
                <p className="text-sm text-ink-muted m-0">{article.location}</p>
              </div>
            )}
          </aside>
        </div>

        {/* Related */}
        {finalRelated.length > 0 && (
          <section className="max-w-7xl mx-auto mt-16 pt-10 border-t border-divider">
            <h2 className="font-serif text-2xl font-bold mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalRelated.map((r) => (
                <Link key={r.id} href={`/article/${r.id}`} className="card card-hover p-5 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent mb-2">{r.categories[0]}</span>
                  <h3 className="font-serif font-bold text-lg leading-snug mb-2">{r.title}</h3>
                  <p className="text-sm text-ink-muted line-clamp-3 flex-grow">{r.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}