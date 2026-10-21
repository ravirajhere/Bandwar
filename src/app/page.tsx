import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  
  // Latest articles fetch kar rahe hain (Home page ke liye top 3)
  const allArticles = getAllArticles();
  const latestArticles = allArticles.slice(0, 3);

  if (!home) return null;

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`}
            alt={home.hero.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/90 via-[#1a1a18]/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <span className="inline-block py-1 px-3 rounded-full bg-[#a64b2a]/20 border border-[#a64b2a]/50 text-[#f7f5ef] text-sm font-medium tracking-widest uppercase mb-6 backdrop-blur-sm">
            {home.hero.location}
          </span>
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            {home.hero.title}
          </h1>
          <p className="text-lg md:text-2xl text-[#f7f5ef]/90 leading-relaxed font-light max-w-3xl mx-auto drop-shadow-md">
            {home.hero.tagline}
          </p>
        </div>
      </section>

      {/* 2. META STRIP (Lat/Lng, Population etc.) */}
      <section className="bg-[#1f3d2f] text-[#f7f5ef] py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center md:justify-between gap-4 text-sm font-medium tracking-wide">
          {home.meta.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[#a64b2a]">•</span>
              <span className="opacity-70">{item.label}:</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[#a64b2a] font-medium tracking-widest uppercase text-sm mb-4">
            {home.about.eyebrow}
          </h2>
          <h3 className="font-serif text-3xl md:text-5xl font-bold text-[#1a1a18] mb-8">
            {home.about.title}
          </h3>
          <div className="space-y-6 text-lg text-[#1a1a18]/80 leading-relaxed text-left md:text-center">
            {home.about.paragraphs.map((p: string, idx: number) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
          
          <div className="mt-12">
            <Link 
              href={home.cta.href}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#1f3d2f] text-white font-medium rounded-lg hover:bg-[#152c21] transition-colors shadow-lg"
            >
              {home.cta.label} →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PULLQUOTE */}
      <section className="py-20 bg-[#efece4] border-y border-[#1a1a18]/10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <blockquote className="font-serif text-2xl md:text-4xl leading-snug text-[#1a1a18] italic mb-6">
            "{home.pullquote.text}"
          </blockquote>
          <cite className="text-sm font-medium tracking-widest uppercase text-[#a64b2a] not-italic">
            — {home.pullquote.cite}
          </cite>
        </div>
      </section>

      {/* 5. STATS */}
      <section className="py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {home.stats.map((stat: any, idx: number) => (
            <div key={idx} className="p-6 border border-[#1a1a18]/10 rounded-2xl bg-white shadow-sm">
              <div className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a18] mb-2">
                {/* Agar articleCount placeholder hai toh actual count dikhao */}
                {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
              </div>
              <div className="text-sm font-medium tracking-wide text-[#1a1a18]/60 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LATEST ARTICLES SECTION (Naya Section) */}
      <section className="py-20 px-4 bg-[#f7f5ef] border-t border-[#1a1a18]/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[#a64b2a] font-medium tracking-widest uppercase text-sm mb-2">
                From the Archive
              </h2>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#1a1a18]">
                Latest Articles
              </h3>
            </div>
            <Link href="/section" className="hidden md:inline-flex text-[#1f3d2f] font-bold hover:underline items-center gap-1">
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-8 text-center md:hidden">
            <Link href="/section" className="inline-flex px-6 py-3 bg-[#1f3d2f] text-white font-medium rounded-lg hover:bg-[#152c21] transition-colors">
              View all articles
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}