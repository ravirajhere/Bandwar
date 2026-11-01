import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles, getMediaData } from "@/lib/data";
import { MapPin, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import LandmarkMapWrapper from "@/components/place/LandmarkMapWrapper";

import iconImage from "@/app/icon.png"; 

interface MetaItem { label: string; value: string; }
interface StatItem { label: string; value: string; }

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  const allArticles = getAllArticles();
  const media = getMediaData();
  
  // Data.ts me articles pehle se lastUpdated ke hisaab se sort hote hain (Newest first)
  const latestArticles = allArticles.slice(0, 4);

  if (!home) return null;

  return (
    <div className="bg-canvas min-h-screen pb-16 md:pb-24">
      <div className="container mx-auto px-4 md:px-0 pt-6 md:pt-10">
        
        {/* =========================================
            1. HERO SECTION (Grand & Formal)
            ========================================= */}
        <section className="relative w-full rounded-lg md:rounded-xl overflow-hidden mb-12 md:mb-16 shadow-md border border-divider">
          <div className="absolute inset-0 bg-ink/60 z-10"></div>
          <Image
            src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`}
            alt={home.hero.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="relative z-20 px-6 py-20 md:py-32 lg:py-40 3xl:py-56 flex flex-col items-center text-center">
            <span className="text-white bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm md:text-base font-medium tracking-wide mb-6">
              📍 {home.hero.location}
            </span>
            <h1 className="font-serif text-fluid-4xl md:text-6xl 3xl:text-7xl text-white mb-6 font-semibold max-w-4xl leading-tight">
              Welcome to <span className="text-white/90 italic">{home.hero.title}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl lg:text-2xl 3xl:text-3xl max-w-3xl mb-10 leading-relaxed">
              {home.hero.tagline}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Link 
                href="/section" 
                className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-md font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Read Our History
              </Link>
              <Link 
                href="/gallery" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================
            2. QUICK ACCESS (Clean & Official)
            ========================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-24">
          <Link href="/directory" className="bg-surface border border-divider p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all group flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className="w-14 h-14 bg-canvas border border-divider rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl" aria-hidden="true">🚨</span>
            </div>
            <h3 className="font-serif font-bold text-lg md:text-xl text-ink mb-2">Emergency</h3>
            <p className="text-sm md:text-base text-ink/70">Doctors, Police, Ambulance</p>
          </Link>
          
          <Link href="/people" className="bg-surface border border-divider p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all group flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className="w-14 h-14 bg-canvas border border-divider rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl" aria-hidden="true">👥</span>
            </div>
            <h3 className="font-serif font-bold text-lg md:text-xl text-ink mb-2">Our People</h3>
            <p className="text-sm md:text-base text-ink/70">Legends, Leaders & Elders</p>
          </Link>

          <Link href="/section" className="bg-surface border border-divider p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all group flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className="w-14 h-14 bg-canvas border border-divider rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl" aria-hidden="true">📚</span>
            </div>
            <h3 className="font-serif font-bold text-lg md:text-xl text-ink mb-2">Village Archive</h3>
            <p className="text-sm md:text-base text-ink/70">History, Culture, Articles</p>
          </Link>
        </section>

        {/* =========================================
            3. MAP SECTION
            ========================================= */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink flex items-center gap-3">
              <MapPin className="text-accent" size={28} /> Explore the Village Map
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="bg-surface border border-divider rounded-lg md:rounded-xl shadow-sm overflow-hidden h-[400px] md:h-[500px] 3xl:h-[700px] relative z-0">
            <LandmarkMapWrapper 
              landmarks={media.landmarks || []} 
              activeLandmark={null} 
            />
          </div>
          <p className="text-center text-sm md:text-base text-ink/60 mt-4 max-w-2xl mx-auto">
            Click on the markers to see the exact location of temples, schools, and landmarks in Bandwar.
          </p>
        </section>

        {/* =========================================
            4. ABOUT & ARTICLES GRID
            ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: About & Articles */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* About Section */}
            <section className="bg-surface border border-divider rounded-lg md:rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-divider bg-canvas/50">
                <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink m-0">
                  About {home.hero.title}
                </h2>
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div className="w-full md:w-1/3 shrink-0 rounded-md overflow-hidden border border-divider shadow-sm">
                  <div className="relative w-full aspect-[4/3]">
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
                  <h3 className="font-serif text-xl md:text-2xl mt-0 mb-3 text-ink">{home.about.title}</h3>
                  {home.about.paragraphs.map((p: string, idx: number) => (
                    <p key={idx} className="text-ink/80 leading-relaxed text-base md:text-lg mb-4">
                      {p}
                    </p>
                  ))}
                  <Link 
                    href="/about" 
                    className="inline-flex items-center text-accent hover:text-accent-hover font-medium mt-2 no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    Read full history <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Recently Updated Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink flex items-center gap-2">
                  <Clock size={24} className="text-accent" /> Recently Updated
                </h2>
                <Link 
                  href="/section" 
                  className="text-accent text-sm md:text-base font-medium hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  View all articles <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {latestArticles.map((article) => (
                  <Link 
                    href={`/article/${article.id}`} 
                    key={article.id}
                    className="bg-surface border border-divider rounded-lg p-5 md:p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all group flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <h3 className="font-serif text-lg md:text-xl font-semibold text-ink group-hover:text-accent transition-colors mb-3 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-ink/70 text-sm md:text-base line-clamp-3 mb-5 flex-grow leading-relaxed">
                      {article.summary}
                    </p>
                    
                    {/* Trust Badge (Date & Editor Name) */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-ink/60 font-medium mt-auto pt-4 border-t border-divider">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-accent/70" />
                        {article.lastUpdated}
                      </span>
                      {article.lastEditedBy && (
                        <>
                          <span className="text-divider">•</span>
                          <span className="flex items-center gap-1.5 text-accent/80">
                            <ShieldCheck size={14} />
                            By {article.lastEditedBy}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sidebar (Stats & Pullquote) */}
          <aside className="lg:col-span-4 space-y-6 md:space-y-8">
            
            {/* Statistics Infobox */}
            <section className="bg-surface border border-divider rounded-lg shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-divider bg-canvas/50">
                <h2 className="font-serif font-bold text-ink text-sm tracking-wider uppercase m-0">
                  Village Statistics
                </h2>
              </div>
              <div className="p-5 md:p-6">
                <dl className="text-sm md:text-base m-0 space-y-4">
                  {home.stats.map((stat: StatItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-divider last:border-0 pb-3 last:pb-0">
                      <dt className="text-ink/70 font-medium">{stat.label}</dt>
                      <dd className="text-ink font-bold bg-canvas border border-divider px-3 py-1 rounded-md">
                        {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Editorial Pullquote */}
            <section className="bg-canvas border-l-4 border-accent rounded-r-lg p-6 md:p-8 shadow-sm">
              <h3 className="font-serif text-lg md:text-xl font-semibold text-ink mb-3">Did you know?</h3>
              <p className="text-ink/80 text-base italic leading-relaxed mb-4">
                "{home.pullquote.text}"
              </p>
              <p className="text-accent font-medium text-sm text-right m-0">— {home.pullquote.cite}</p>
            </section>
            
          </aside>
        </div>

      </div>
    </div>
  );
}