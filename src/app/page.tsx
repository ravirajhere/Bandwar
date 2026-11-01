import Image from "next/image";
import Link from "next/link";
import { getMasterData, getAllArticles, getMediaData } from "@/lib/data";
import { MapPin, Clock, ShieldCheck, ArrowRight, PhoneCall, Users, BookOpen } from "lucide-react";
import LandmarkMapWrapper from "@/components/place/LandmarkMapWrapper";

import iconImage from "@/app/icon.png"; 

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
            1. HERO SECTION (NYT / Britannica Inspired)
            ========================================= */}
        <section className="relative w-full rounded-sm overflow-hidden mb-12 md:mb-16 border border-divider">
          <div className="absolute inset-0 bg-ink/70 z-10"></div>
          <Image
            src={home.hero.image.startsWith("/") ? home.hero.image : `/${home.hero.image}`}
            alt={home.hero.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="relative z-20 px-6 py-20 md:py-32 lg:py-40 3xl:py-56 flex flex-col items-center text-center">
            <span className="text-white bg-ink/50 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-sm text-sm font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
              <MapPin size={14} /> {home.hero.location}
            </span>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl 3xl:text-8xl text-white mb-6 font-bold max-w-4xl leading-tight">
              {home.hero.title}
            </h1>
            <p className="text-white/90 text-lg md:text-xl lg:text-2xl 3xl:text-3xl max-w-3xl mb-10 leading-relaxed text-pretty">
              {home.hero.tagline}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Link 
                href="/section" 
                className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Explore the Archive
              </Link>
              <Link 
                href="/gallery" 
                className="bg-surface hover:bg-canvas text-ink border border-divider px-8 py-3.5 rounded-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================
            2. QUICK ACCESS (GOV.UK / GitHub Inspired)
            ========================================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-24">
          <Link href="/directory" className="bg-surface border border-divider p-6 rounded-sm hover:border-accent transition-colors group flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className="w-10 h-10 bg-canvas border border-divider rounded-sm flex items-center justify-center shrink-0 group-hover:bg-accent/5 transition-colors">
              <PhoneCall size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink mb-1 group-hover:text-accent transition-colors">Emergency Directory</h3>
              <p className="text-sm text-ink-muted">Doctors, Police, Ambulance & Services</p>
            </div>
          </Link>
          
          <Link href="/people" className="bg-surface border border-divider p-6 rounded-sm hover:border-accent transition-colors group flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className="w-10 h-10 bg-canvas border border-divider rounded-sm flex items-center justify-center shrink-0 group-hover:bg-accent/5 transition-colors">
              <Users size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink mb-1 group-hover:text-accent transition-colors">People of Bandwar</h3>
              <p className="text-sm text-ink-muted">Legends, Leaders & Notable Figures</p>
            </div>
          </Link>

          <Link href="/section" className="bg-surface border border-divider p-6 rounded-sm hover:border-accent transition-colors group flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className="w-10 h-10 bg-canvas border border-divider rounded-sm flex items-center justify-center shrink-0 group-hover:bg-accent/5 transition-colors">
              <BookOpen size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink mb-1 group-hover:text-accent transition-colors">Historical Archive</h3>
              <p className="text-sm text-ink-muted">History, Culture & Detailed Articles</p>
            </div>
          </Link>
        </section>

        {/* =========================================
            3. MAP SECTION (Wikipedia / Meta Inspired)
            ========================================= */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink flex items-center gap-2">
              <MapPin className="text-accent" size={24} /> Explore the Village Map
            </h2>
            <div className="h-px bg-divider flex-grow"></div>
          </div>
          
          <div className="bg-surface border border-divider rounded-sm overflow-hidden h-[400px] md:h-[500px] 3xl:h-[700px] relative z-0">
            <LandmarkMapWrapper 
              landmarks={media.landmarks || []} 
              activeLandmark={null} 
            />
          </div>
          <p className="text-center text-sm text-ink-muted mt-3">
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
            <section className="bg-surface border border-divider rounded-sm">
              <div className="px-5 py-3 border-b border-divider bg-canvas/50 flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-sm"></div>
                <h2 className="font-serif text-lg font-bold text-ink m-0 uppercase tracking-wide">
                  About {home.hero.title}
                </h2>
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                <div className="w-full md:w-1/3 shrink-0 rounded-sm overflow-hidden border border-divider">
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
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <h3 className="font-serif text-xl md:text-2xl mt-0 mb-3 text-ink font-bold">{home.about.title}</h3>
                  {home.about.paragraphs.map((p: string, idx: number) => (
                    <p key={idx} className="text-ink/80 leading-relaxed mb-4">
                      {p}
                    </p>
                  ))}
                  <Link 
                    href="/about" 
                    className="inline-flex items-center text-accent hover:text-accent-hover font-semibold mt-2 no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    Read full history <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Recently Updated Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
                  <Clock size={20} className="text-accent" /> Recently Updated
                </h2>
                <Link 
                  href="/section" 
                  className="text-accent text-sm font-semibold hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  View all articles <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestArticles.map((article) => (
                  <Link 
                    href={`/article/${article.id}`} 
                    key={article.id}
                    className="bg-surface border border-divider rounded-sm p-5 hover:border-accent transition-colors group flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent transition-colors mb-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-ink-muted text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                      {article.summary}
                    </p>
                    
                    {/* Trust Badge (Date & Editor Name) */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted mt-auto pt-3 border-t border-divider">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-accent/70" />
                        {article.lastUpdated}
                      </span>
                      {article.lastEditedBy && (
                        <>
                          <span className="text-divider">•</span>
                          <span className="flex items-center gap-1 text-accent font-medium">
                            <ShieldCheck size={12} />
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
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Statistics Infobox (Wikipedia Style) */}
            <section className="bg-surface border border-divider rounded-sm">
              <div className="px-5 py-3 border-b border-divider bg-canvas/50">
                <h2 className="font-serif font-bold text-ink text-sm tracking-widest uppercase m-0">
                  Village Statistics
                </h2>
              </div>
              <div className="p-5">
                <dl className="text-sm m-0 space-y-3">
                  {home.stats.map((stat: StatItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-divider/50 last:border-0 pb-2 last:pb-0">
                      <dt className="text-ink-muted font-medium">{stat.label}</dt>
                      <dd className="text-ink font-bold bg-canvas border border-divider px-2 py-0.5 rounded-sm">
                        {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Editorial Pullquote (NYT Style) */}
            <section className="bg-canvas border border-divider border-l-4 border-l-accent rounded-sm p-6">
              <h3 className="font-serif text-lg font-bold text-ink mb-3">Did you know?</h3>
              <blockquote className="text-ink/80 text-base italic leading-relaxed mb-4 m-0 p-0 border-none">
                "{home.pullquote.text}"
              </blockquote>
              <p className="text-accent font-semibold text-sm text-right m-0 uppercase tracking-wider">
                — {home.pullquote.cite}
              </p>
            </section>
            
          </aside>
        </div>

      </div>
    </div>
  );
}