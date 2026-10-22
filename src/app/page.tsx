import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles } from "@/lib/data";

interface MetaItem { label: string; value: string; }
interface StatItem { label: string; value: string; }

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  const allArticles = getAllArticles();
  const latestArticles = allArticles.slice(0, 4);

  if (!home) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      
      {/* WIKIPEDIA STYLE HEADER / WELCOME BANNER */}
      <div className="border border-wiki-border bg-wiki-bg-alt p-6 md:p-8 text-center mb-8">
        <h1 className="font-serif text-3xl md:text-5xl text-wiki-text mb-2">
          Welcome to <span className="font-bold">{home.hero.title}</span>
        </h1>
        <p className="text-wiki-text-muted text-lg md:text-xl max-w-3xl mx-auto">
          {home.hero.tagline}
        </p>
        <div className="mt-4 text-sm text-wiki-text-muted">
          The community-built digital portal of {home.hero.location}.
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

        {/* LEFT COLUMN (Main Content: About & Articles) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* 1. About Section */}
          <section className="border border-wiki-border bg-wiki-bg p-0">
            <div className="bg-wiki-header border-b border-wiki-border px-4 py-2">
              <h2 className="font-bold text-wiki-text m-0 text-base">
                About the Village
              </h2>
            </div>
            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
              {home.hero.image && (
                <div className="w-full md:w-[250px] shrink-0 border border-wiki-border-light">
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`}
                      alt={home.hero.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 250px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="p-1 text-[11px] text-wiki-text-muted text-center bg-wiki-bg-alt border-t border-wiki-border-light">
                    {home.hero.alt}
                  </div>
                </div>
              )}
              <div className="text-wiki-text text-[15px] leading-relaxed">
                <h3 className="font-serif text-2xl mb-2">{home.about.title}</h3>
                {home.about.paragraphs.map((p: string, idx: number) => (
                  <p key={idx} className="mb-3">{p}</p>
                ))}
                <Link 
                  href={home.cta.href}
                  className="text-wiki-link hover:underline font-bold text-sm"
                >
                  Read more about the village →
                </Link>
              </div>
            </div>
          </section>

          {/* 2. Latest Articles */}
          <section className="border border-wiki-border bg-wiki-bg p-0">
            <div className="bg-wiki-header border-b border-wiki-border px-4 py-2 flex justify-between items-center">
              <h2 className="font-bold text-wiki-text m-0 text-base">
                From the Archive
              </h2>
              <Link href="/section" className="text-wiki-link text-xs hover:underline">
                View all
              </Link>
            </div>
            <div className="p-4 md:p-6">
              <ul className="list-disc pl-5 space-y-3 text-[15px] text-wiki-text">
                {latestArticles.map((article) => (
                  <li key={article.id}>
                    <Link href={`/article/${article.id}`} className="text-wiki-link hover:underline font-bold">
                      {article.title}
                    </Link>
                    <span className="text-wiki-text-muted ml-2">
                      — {article.summary.slice(0, 100)}...
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (Sidebar: Quick Access, Stats) */}
        <div className="md:col-span-4 space-y-6">

          {/* 3. Quick Access (Events link removed) */}
          <section className="border border-wiki-border bg-wiki-bg p-0">
            <div className="bg-wiki-header border-b border-wiki-border px-4 py-2">
              <h2 className="font-bold text-wiki-text m-0 text-base">
                Quick Access
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-[15px]">
                <li>
                  <Link href="/directory" className="text-wiki-link hover:underline flex items-center gap-2">
                    <span className="text-red-600 font-bold">●</span> Emergency & Directory
                  </Link>
                </li>
                <li>
                  <Link href="/place" className="text-wiki-link hover:underline flex items-center gap-2">
                    <span className="text-blue-600 font-bold">●</span> Places & Map
                  </Link>
                </li>
                <li>
                  <Link href="/section" className="text-wiki-link hover:underline flex items-center gap-2">
                    <span className="text-green-600 font-bold">●</span> All Articles
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Stats */}
          <section className="border border-wiki-border bg-wiki-bg p-0">
            <div className="bg-wiki-header border-b border-wiki-border px-4 py-2">
              <h2 className="font-bold text-wiki-text m-0 text-base">
                Village Statistics
              </h2>
            </div>
            <div className="p-4">
              <dl className="text-sm m-0">
                {home.stats.map((stat: StatItem, idx: number) => (
                  <div key={idx} className="flex border-b border-wiki-border-light last:border-0 py-2">
                    <dt className="w-1/2 text-wiki-text-muted font-medium">{stat.label}</dt>
                    <dd className="w-1/2 text-wiki-text font-bold">
                      {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* 5. Meta Information */}
          <section className="border border-wiki-border bg-wiki-bg-alt p-4 text-sm text-wiki-text-muted">
            <h3 className="font-bold text-wiki-text mb-2">Did you know?</h3>
            <p className="m-0 text-[13px] leading-relaxed">
              {home.pullquote.text} 
              <br/><br/>
              <span className="font-bold text-wiki-text">— {home.pullquote.cite}</span>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}