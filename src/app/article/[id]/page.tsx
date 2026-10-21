import { notFound } from "next/navigation";
import { getAllArticles, getArticleById } from "@/lib/data";
import { WikiText } from "@/components/article/WikiText";
import { Infobox } from "@/components/article/Infobox";
import { FaqAccordion } from "@/components/article/FaqAccordion";
import Image from "next/image";

// 1. Next.js ko batate hain ki kitne articles hain (SSG ke liye)
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    id: article.id,
  }));
}

// 2. Google ke liye Dynamic SEO Meta Tags
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
      images: article.hero ? [{ url: `/${article.hero}` }] : [],
    },
  };
}

// 3. Main Page Component
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = getArticleById(resolvedParams.id);

  if (!article) {
    notFound(); // Agar galat URL daala toh 404 page dikhega
  }

  // FAQ Schema for Google Rich Results
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Injecting JSON-LD Schema */}
      {article.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Breadcrumbs & Category */}
      <div className="flex items-center gap-2 text-sm text-[#1a1a18]/60 mb-6">
        <span>Archive</span>
        <span>›</span>
        <span className="capitalize">{article.categories[0]}</span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a18] mb-3">
          {article.title}
        </h1>
        <p className="text-xl text-[#a64b2a] font-medium mb-6">
          {article.subtitle}
        </p>
        
        {article.hero && (
          <div className="relative w-full h-[300px] md:h-[450px] rounded-xl overflow-hidden mb-8">
            <Image
              src={`/${article.hero}`}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <p className="text-lg text-[#1a1a18]/80 leading-relaxed font-medium bg-[#efece4]/50 p-6 rounded-lg border-l-4 border-[#1f3d2f]">
          {article.summary}
        </p>
      </header>

      {/* Main Content Area */}
      <div className="relative">
        {/* Infobox floats right on desktop */}
        {article.infobox && <Infobox data={article.infobox} title={article.title} />}

        {/* Article Body */}
        <div className="text-[#1a1a18] leading-relaxed space-y-8">
          {article.content.map((block, index) => (
            <section key={index}>
              <h2 className="font-serif text-2xl font-bold text-[#1a1a18] mb-4 border-b border-[#1a1a18]/10 pb-2">
                {block.heading}
              </h2>
              <p className="text-base md:text-lg">
                {/* Yahan humara WikiText parser kaam kar raha hai */}
                <WikiText text={block.text} />
              </p>
            </section>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <FaqAccordion faqs={article.faqs} />

      {/* Last Updated */}
      <div className="mt-12 pt-6 border-t border-[#1a1a18]/10 text-sm text-[#1a1a18]/50 flex justify-between items-center">
        <span>Last updated: {article.lastUpdated}</span>
        <span>Bandwar Village Archive</span>
      </div>
    </article>
  );
}