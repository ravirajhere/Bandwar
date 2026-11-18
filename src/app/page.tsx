import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles, getMediaData } from "@/lib/data";
import { MapPin, Clock, ShieldCheck, ArrowRight, PhoneCall, Users, BookOpen, MoveRight } from "lucide-react";
import LandmarkMapWrapper from "@/components/map/LandmarkMapWrapper";

interface StatItem { label: string; value: string; }

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const heroImage = config.home?.hero?.image || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg";
  const ogImage = `${baseUrl}/${heroImage.replace(/^\//, "")}`;

  return {
    title: { absolute: "Bandwar Village Archive — Begusarai, Bihar" },
    description: config.seo?.defaultDescription || "Explore the history, temples, schools, and daily life of Bandwar village, Begusarai (Bihar). A community-built digital archive.",
    alternates: {
      canonical: "/",
      languages: { "en-IN": "/", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      title: "Bandwar Village Archive — Begusarai, Bihar",
      description: config.seo?.defaultDescription || "The community-built digital archive of Bandwar village, Begusarai (Bihar).",
      url: baseUrl,
      siteName: "Bandwar Village Archive",
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: config.home?.hero?.alt || "Bandwar Village" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bandwar Village Archive — Begusarai, Bihar",
      description: "The community-built digital archive of Bandwar village, Begusarai (Bihar).",
      images: [ogImage],
    },
  };
}

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  const allArticles = getAllArticles();
  const media = getMediaData();
  const baseUrl = config.site.url;
  
  // Sort by latest
  const sortedArticles = [...allArticles].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  
  // The first one becomes the Lead Story, the rest are secondary
  const leadArticle = sortedArticles[0];
  const recentArticles = sortedArticles.slice(1, 5);

  if (!home) return null;

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl,
        name: "Bandwar Village Archive — Begusarai, Bihar",
        description: config.seo?.defaultDescription || config.site.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#place` },
        inLanguage: "en-IN",
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/#latest-articles`,
        name: "Recently Updated Articles",
        numberOfItems: sortedArticles.slice(0, 5).length,
        itemListElement: sortedArticles.slice(0, 5).map((a, i) => ({
          "@type": "ListItem", position: i + 1, url: `${baseUrl}/article/${a.id}`, name: a.title,
        })),
      },
    ],
  };

  return (
    <div className="bg-canvas min-h-screen pb-16 md:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      
      <div className="container mx-auto px-4 md:px-0 pt-6 md:pt-10 max-w-7xl">
        
        {/* 🚀 1. THE EDITORIAL HERO (Split Layout) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-24 border-b border-divider pb-12 md:pb-20">
          
          {/* Left: Typography */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-accent"></span>
              <span className="text-accent font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> {home.hero.location}
              </span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl 3xl:text-8xl text-ink font-bold leading-[1.05] tracking-tight mb-6">
              {home.hero.title}
            </h1>
            
            <p className="text-ink-muted text-lg md:text-xl leading-relaxed mb-8 border-l-2 border-accent/30 pl-4">
              {home.hero.tagline}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/section" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-sm font-semibold text-sm transition-colors flex items-center gap-2">
                Explore the Archive <MoveRight size={16} />
              </Link>
              <Link href="/about" className="text-ink hover:text-accent font-semibold text-sm transition-colors flex items-center gap-2 py-3 px-2">
                About the Project
              </Link>
            </div>
          </div>

          {/* Right: Hero Image (No dark overlay, clean frame) */}
          <div className="relative w-full aspect-[4/3] lg:aspect-square bg-surface border border-divider p-2 rounded-sm shadow-sm">
            <div className="relative w-full h-full overflow-hidden rounded-sm">
              <Image 
                src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`} 
                alt={home.hero.alt} 
                fill 
                className="object-cover" 
                priority 
                sizes="(max-width: 1024px) 100vw, 50vw" 
              />
            </div>
            {/* Subtle caption */}
            <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-sm p-3 border border-divider rounded-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/70 text-center m-0">The village of Bandwar, situated on the banks of the Burhi Gandak river.</p>
            </div>
          </div>
        </section>

        {/* 🚀 2. THE INDEX BAR (Replacing App Buttons) */}
        <section className="mb-16 md:mb-24 grid grid-cols-1 md:grid-cols-3 border-y border-divider divide-y md:divide-y-0 md:divide-x divide-divider">
          <Link href="/directory" className="group py-6 md:py-8 px-6 flex items-center justify-between hover:bg-surface transition-colors">
            <div>
              <h3 className="font-serif font-bold text-xl text-ink group-hover:text-accent transition-colors">Village Directory</h3>
              <p className="text-sm text-ink-muted mt-1">Emergency contacts & local services</p>
            </div>
            <ArrowRight size={20} className="text-ink/20 group-hover:text-accent transition-colors" />
          </Link>
          
          <Link href="/people" className="group py-6 md:py-8 px-6 flex items-center justify-between hover:bg-surface transition-colors">
            <div>
              <h3 className="font-serif font-bold text-xl text-ink group-hover:text-accent transition-colors">People of Bandwar</h3>
              <p className="text-sm text-ink-muted mt-1">Martyrs, leaders & notable figures</p>
            </div>
            <ArrowRight size={20} className="text-ink/20 group-hover:text-accent transition-colors" />
          </Link>

          <Link href="/gallery" className="group py-6 md:py-8 px-6 flex items-center justify-between hover:bg-surface transition-colors">
            <div>
              <h3 className="font-serif font-bold text-xl text-ink group-hover:text-accent transition-colors">Photo Archive</h3>
              <p className="text-sm text-ink-muted mt-1">Visual memories & heritage</p>
            </div>
            <ArrowRight size={20} className="text-ink/20 group-hover:text-accent transition-colors" />
          </Link>
        </section>

        {/* 🚀 3. MAIN CONTENT GRID (Articles & Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* LEFT COLUMN: News & Articles */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Featured Lead Story */}
            {leadArticle && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Latest Record</h2>
                  <div className="h-px bg-divider flex-grow"></div>
                </div>
                
                <Link href={`/article/${leadArticle.id}`} className="group flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <div className="relative w-full md:w-1/2 aspect-[4/3] bg-surface border border-divider rounded-sm overflow-hidden shrink-0">
                    <Image 
                      src={leadArticle.hero ? (leadArticle.hero.startsWith("/") ? leadArticle.hero : `/${leadArticle.hero}`) : "/fallback.jpg"} 
                      alt={leadArticle.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 text-xs text-accent font-bold uppercase tracking-wider mb-3">
                      <span>{leadArticle.categories[0]}</span>
                      <span className="w-1 h-1 rounded-full bg-divider"></span>
                      <time dateTime={leadArticle.lastUpdated}>{new Date(leadArticle.lastUpdated).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</time>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink group-hover:text-accent transition-colors leading-tight mb-3">
                      {leadArticle.title}
                    </h3>
                    <p className="text-ink-muted text-base leading-relaxed line-clamp-3 mb-4">
                      {leadArticle.summary}
                    </p>
                    <div className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                      Read full article <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Recent Articles Grid */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent">More from the Archive</h2>
                <div className="h-px bg-divider flex-grow"></div>
                <Link href="/section" className="text-sm font-semibold text-ink hover:text-accent">View All</Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {recentArticles.map((article) => (
                  <Link href={`/article/${article.id}`} key={article.id} className="group flex flex-col h-full border-t border-divider pt-4">
                    <div className="text-[11px] text-accent font-bold uppercase tracking-wider mb-2">{article.categories[0]}</div>
                    <h3 className="font-serif text-xl font-bold text-ink group-hover:text-accent transition-colors leading-snug mb-2">
                      {article.title}
                    </h3>
                    <p className="text-ink-muted text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-ink-muted mt-auto">
                      <time dateTime={article.lastUpdated}>{new Date(article.lastUpdated).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</time>
                      <span className="flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* About Section (Refined) */}
            <section className="bg-surface border border-divider p-6 md:p-8 rounded-sm">
              <h2 className="font-serif text-2xl font-bold text-ink mb-4">{home.about.title}</h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-ink/80 leading-relaxed">
                {home.about.paragraphs.map((p: string, idx: number) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-divider">
                <Link href="/about" className="inline-flex items-center text-accent hover:text-accent-hover font-semibold text-sm group">
                  Read the full history <MoveRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Stats Table */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent"></div> Village Facts
              </h3>
              <dl className="text-sm m-0 border-t border-divider">
                {home.stats.map((stat: StatItem, idx: number) => (
                  <div key={idx} className="flex justify-between items-center border-b border-divider py-3">
                    <dt className="text-ink-muted">{stat.label}</dt>
                    <dd className="text-ink font-bold font-mono">
                      {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Pullquote (Editorial style) */}
            <section className="border-l-2 border-accent pl-5 py-2">
              <blockquote className="text-xl font-serif font-bold text-ink italic leading-snug mb-3">
                &ldquo;{home.pullquote.text}&rdquo;
              </blockquote>
              <p className="text-ink-muted text-xs font-bold uppercase tracking-widest m-0">
                — {home.pullquote.cite}
              </p>
            </section>

            {/* Map (Moved to Sidebar for Desktop, Bottom for Mobile) */}
            <section className="hidden lg:block">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent"></div> Cartographic Index
                </h3>
                <Link href="/map" className="text-xs font-semibold text-ink hover:text-accent">Open Map</Link>
              </div>
              <div className="bg-surface border border-divider rounded-sm overflow-hidden h-[350px] relative z-0">
                <LandmarkMapWrapper landmarks={media.landmarks || []} activeLandmark={null} showLegend={false} showScale={false} />
              </div>
            </section>
          </aside>
        </div>

        {/* Mobile Map (Sirf mobile par dikhega) */}
        <section className="mt-12 lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Cartographic Index</h3>
            <Link href="/map" className="text-xs font-semibold text-ink hover:text-accent">Open Full Map</Link>
          </div>
          <div className="bg-surface border border-divider rounded-sm overflow-hidden h-[400px] relative z-0">
            <LandmarkMapWrapper landmarks={media.landmarks || []} activeLandmark={null} showLegend={false} showScale={false} />
          </div>
        </section>

      </div>
    </div>
  );
}