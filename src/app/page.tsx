import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles, getMediaData } from "@/lib/data";
import { MapPin } from "lucide-react";
import LandmarkMapWrapper from "@/components/place/LandmarkMapWrapper";

// 👇 Yahan icon.png ko import kiya hai
import iconImage from "@/app/icon.png"; 

interface MetaItem { label: string; value: string; }
interface StatItem { label: string; value: string; }

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  const allArticles = getAllArticles();
  const media = getMediaData();
  const latestArticles = allArticles.slice(0, 4);

  if (!home) return null;

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="container-custom pt-8">
        
        {/* 1. HERO SECTION (Top Image - From JSON) */}
        <section className="relative w-full rounded-2xl overflow-hidden mb-12 shadow-elevated border border-border">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <Image
            src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`}
            alt={home.hero.alt}
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 px-6 py-20 md:py-32 flex flex-col items-center text-center">
            <span className="text-brand bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium tracking-wide mb-6">
              📍 {home.hero.location}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 font-semibold max-w-4xl leading-tight">
              Welcome to <span className="text-brand">{home.hero.title}</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8">
              {home.hero.tagline}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/section" className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm">
                Read Our History
              </Link>
              <Link href="/gallery" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-lg font-medium transition-colors">
                View Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* 2. QUICK ACCESS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <Link href="/directory" className="bg-card border border-border p-6 rounded-xl shadow-card hover:shadow-elevated hover:border-brand/50 transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">Emergency</h3>
            <p className="text-sm text-muted">Doctors, Police, Ambulance</p>
          </Link>
          
          <Link href="/people" className="bg-card border border-border p-6 rounded-xl shadow-card hover:shadow-elevated hover:border-brand/50 transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">Our People</h3>
            <p className="text-sm text-muted">Legends, Leaders & Elders</p>
          </Link>

          <Link href="/section" className="bg-card border border-border p-6 rounded-xl shadow-card hover:shadow-elevated hover:border-brand/50 transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">Village Archive</h3>
            <p className="text-sm text-muted">History, Culture, Articles</p>
          </Link>
        </section>

        {/* 🚀 3. MAP SECTION */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-3xl font-semibold text-foreground flex items-center gap-2">
              <MapPin className="text-brand" size={28} /> Explore the Village Map
            </h2>
            <div className="h-px bg-border flex-grow rounded-full"></div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden h-[400px] md:h-[500px] relative z-0">
            <LandmarkMapWrapper 
              landmarks={media.landmarks || []} 
              activeLandmark={null} 
            />
          </div>
          <p className="text-center text-sm text-muted mt-4">
            Click on the markers to see the exact location of temples, schools, and landmarks in Bandwar.
          </p>
        </section>

        {/* 4. ABOUT & ARTICLES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted-background">
                <h2 className="font-serif text-xl font-semibold text-foreground m-0">
                  About {home.hero.title}
                </h2>
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 shrink-0 rounded-lg overflow-hidden border border-border-subtle shadow-sm">
                  <div className="relative w-full aspect-[4/3]">
                    {/* 👇 Yahan imported iconImage use kiya hai */}
                    <Image
                      src={iconImage} 
                      alt="About Bandwar Village"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="font-serif text-2xl mt-0 mb-4">{home.about.title}</h3>
                  {home.about.paragraphs.map((p: string, idx: number) => (
                    <p key={idx} className="text-foreground/80 leading-relaxed text-lg">
                      {p}
                    </p>
                  ))}
                  <Link href="/about" className="inline-flex items-center text-brand hover:text-brand-hover font-medium mt-4 no-underline">
                    Read full history <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Latest from the Archive
                </h2>
                <Link href="/section" className="text-brand text-sm font-medium hover:underline">
                  View all articles →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestArticles.map((article) => (
                  <Link 
                    href={`/article/${article.id}`} 
                    key={article.id}
                    className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-card hover:border-brand/30 transition-all group flex flex-col h-full"
                  >
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-brand transition-colors mb-2">
                      {article.title}
                    </h3>
                    <p className="text-muted text-sm line-clamp-3 mb-4 flex-grow">
                      {article.summary}
                    </p>
                    <span className="text-brand text-sm font-medium mt-auto">Read Article →</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR (Stats & Pullquote) */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted-background">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider m-0">
                  Village Statistics
                </h2>
              </div>
              <div className="p-5">
                <dl className="text-sm m-0 space-y-3">
                  {home.stats.map((stat: StatItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-border-subtle last:border-0 pb-3 last:pb-0">
                      <dt className="text-muted font-medium">{stat.label}</dt>
                      <dd className="text-foreground font-bold bg-muted-background px-2.5 py-1 rounded-md">
                        {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section className="bg-brand/5 border border-brand/20 rounded-xl p-6 relative overflow-hidden">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Did you know?</h3>
              <p className="text-foreground/80 text-sm leading-relaxed italic mb-4 relative z-10">
                "{home.pullquote.text}"
              </p>
              <p className="text-brand font-medium text-sm text-right m-0">— {home.pullquote.cite}</p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}