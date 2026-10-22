import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles } from "@/lib/data";
import { ArticleCard } from "@/components/article/ArticleCard";

// 1. TypeScript Expert: Strict Types
interface MetaItem { label: string; value: string; }
interface StatItem { label: string; value: string; }

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  const allArticles = getAllArticles();
  const latestArticles = allArticles.slice(0, 3);

  if (!home) return null;

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[85svh] min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`}
            alt={home.hero.alt}
            fill
            sizes="100vw" // 👈 Performance: Mobile par fast load hoga
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 md:mt-20">
          <span className="inline-block py-1 px-3 rounded-full bg-warn/20 border border-warn/50 text-paper text-sm font-medium tracking-widest uppercase mb-6 backdrop-blur-sm">
            {home.hero.location}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            {home.hero.title}
          </h1>
          <p className="text-lg md:text-2xl text-paper/90 leading-relaxed font-light max-w-3xl mx-auto drop-shadow-md">
            {home.hero.tagline}
          </p>
        </div>
      </section>

      {/* 2. META STRIP */}
      <section className="bg-accent text-paper py-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center md:justify-between gap-4 text-sm font-medium tracking-wide">
          {home.meta.map((item: MetaItem, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-warn">•</span>
              <span className="opacity-80">{item.label}:</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section className="py-20 px-4 bg-paper">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-warn font-bold tracking-widest uppercase text-sm mb-4">
            {home.about.eyebrow}
          </h2>
          <h3 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-8">
            {home.about.title}
          </h3>
          <div className="space-y-6 text-lg text-primary/80 leading-relaxed text-left md:text-center">
            {home.about.paragraphs.map((p: string, idx: number) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
          
          <div className="mt-12">
            <Link 
              href={home.cta.href}
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-medium rounded-lg hover:bg-primary transition-colors shadow-lg"
            >
              {home.cta.label} →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PULLQUOTE */}
      <section className="py-20 bg-surface border-y border-primary/10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <blockquote className="font-serif text-2xl md:text-4xl leading-snug text-primary italic mb-6">
            "{home.pullquote.text}"
          </blockquote>
          <cite className="text-sm font-bold tracking-widest uppercase text-warn not-italic">
            — {home.pullquote.cite}
          </cite>
        </div>
      </section>

      {/* 5. STATS */}
      <section className="py-20 px-4 max-w-6xl mx-auto w-full bg-paper">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {home.stats.map((stat: StatItem, idx: number) => (
            <div key={idx} className="p-6 border border-primary/10 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
              </div>
              <div className="text-sm font-medium tracking-wide text-primary/60 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LATEST ARTICLES */}
      <section className="py-20 px-4 bg-surface border-t border-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-warn font-bold tracking-widest uppercase text-sm mb-2">
                From the Archive
              </h2>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-primary">
                Latest Articles
              </h3>
            </div>
            <Link href="/section" className="hidden md:inline-flex text-accent font-bold hover:text-warn transition-colors items-center gap-1">
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/section" className="inline-flex px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-primary transition-colors">
              View all articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}