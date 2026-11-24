import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getMasterData,
  getAllArticles,
  getMediaData,
  getAbsences,
  getEdges,
} from "@/lib/data";
import {
  MapPin,
  ArrowRight,
  MoveRight,
  GitBranch,
  ArrowUpRight,
  FileQuestion,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { ConfidenceBadge } from "@/components/article/ConfidenceBadge";

const LandmarkMapWrapper = dynamic(
  () => import("@/components/map/LandmarkMapWrapper"),
  { ssr: false, loading: () => <div className="h-[350px] bg-surface animate-pulse" /> }
);

interface StatItem {
  label: string;
  value: string;
}

const FALLBACK_HERO = "/images/geography/burhi-gandak-river-dawn-bandwar.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const heroImage = config.home?.hero?.image || FALLBACK_HERO;
  const ogImage = `${baseUrl}/${heroImage.replace(/^\//, "")}`;
  const description =
    config.seo?.defaultDescription ||
    "Explore the history, temples, schools, and daily life of Bandwar village, Begusarai (Bihar). A community-built digital archive.";

  return {
    title: { absolute: "Bandwar Village Archive — Begusarai, Bihar" },
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
      languages: { "en-IN": "/", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      title: "Bandwar Village Archive — Begusarai, Bihar",
      description,
      url: baseUrl,
      siteName: "Bandwar Village Archive",
      locale: "en_IN",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.home?.hero?.alt || "Bandwar Village",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bandwar Village Archive — Begusarai, Bihar",
      description,
      images: [ogImage],
    },
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const config = getMasterData();
  const home = config.home;
  if (!home) return null;

  const allArticles = getAllArticles();
  const media = getMediaData();
  const absences = getAbsences().absences;
  const edges = getEdges().edges;
  const baseUrl = config.site.url;

  const sortedArticles = [...allArticles].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  const leadArticle = sortedArticles[0];
  const recentArticles = sortedArticles.slice(1, 5);

  const featuredEdge =
    edges.find((e) => e.description && e.type === "educational-pipeline") || edges[0];
  const sourceArticle = featuredEdge
    ? allArticles.find((a) => a.id === featuredEdge.from)
    : null;
  const targetArticle = featuredEdge
    ? allArticles.find((a) => a.id === featuredEdge.to)
    : null;

  const verifiedCount = allArticles.filter(
    (a) => a.confidence && a.confidence !== "unverified"
  ).length;
  const sourcedPct =
    allArticles.length > 0
      ? Math.round((verifiedCount / allArticles.length) * 100)
      : 0;

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Bandwar Village Archive",
        inLanguage: "en-IN",
      },
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/#webpage`,
        url: baseUrl,
        name: "Bandwar Village Archive — Begusarai, Bihar",
        description: config.seo?.defaultDescription || config.site.description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/#latest-articles`,
        name: "Recently Updated Articles",
        numberOfItems: sortedArticles.slice(0, 5).length,
        itemListElement: sortedArticles.slice(0, 5).map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${baseUrl}/article/${a.id}`,
          name: a.title,
          dateModified: a.lastUpdated,
        })),
      },
    ],
  };

  return (
    <div className="bg-canvas min-h-screen pb-16 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <main className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* 1. HERO */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center pt-6 md:pt-10 pb-12 md:pb-16 border-b border-divider">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 mb-6 text-accent font-bold text-xs uppercase tracking-[0.18em]">
              <span aria-hidden="true" className="w-8 h-px bg-accent" />
              <MapPin size={14} aria-hidden="true" />
              {home.hero.location}
            </p>

            <h1 className="font-serif text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl text-ink font-bold tracking-tight mb-6">
              {home.hero.title}
            </h1>

            <p className="text-ink-muted text-lg md:text-xl leading-relaxed mb-8 border-l-2 border-accent/30 pl-4">
              {home.hero.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/section"
                className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-sm font-semibold text-sm transition-colors inline-flex items-center gap-2"
              >
                Explore the Archive <MoveRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="text-ink hover:text-accent font-semibold text-sm transition-colors inline-flex items-center gap-2 py-3 px-3"
              >
                About the Project
              </Link>
            </div>

            {/* Trust Bar — first viewport proof */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink-muted border-t border-divider pt-4">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-accent" aria-hidden="true" />
                {allArticles.length} Records
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-accent" aria-hidden="true" />
                {sourcedPct}% Verified or Sourced
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-accent" aria-hidden="true" />
                Updated {leadArticle ? formatDate(leadArticle.lastUpdated) : "—"}
              </span>
            </div>
          </div>

          <figure className="relative w-full aspect-[4/3] lg:aspect-[4/3.4] bg-surface border border-divider p-2 rounded-sm shadow-sm">
            <div className="relative w-full h-full overflow-hidden rounded-sm">
              <Image
                src={
                  home.hero.image.startsWith("/")
                    ? home.hero.image
                    : `/${home.hero.image}`
                }
                alt={home.hero.alt || "Bandwar Village, Begusarai"}
                fill
                className="object-cover"
                priority
                fetchPriority="high"
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <figcaption className="absolute bottom-4 left-4 right-4 bg-surface/95 backdrop-blur-md p-3 border border-divider rounded-sm flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink/70 text-center sm:text-left">
                Bandwar, on the banks of the Burhi Gandak.
              </span>
              <ConfidenceBadge tier="archival" className="scale-90 shrink-0" />
            </figcaption>
          </figure>
        </header>

        {/* 2. INDEX NAV */}
        <nav
          aria-label="Primary archive sections"
          className="mb-16 md:mb-20 grid grid-cols-1 md:grid-cols-3 border-b border-divider divide-y md:divide-y-0 md:divide-x divide-divider"
        >
          {[
            {
              href: "/directory",
              title: "Village Directory",
              desc: "Emergency contacts & local services",
            },
            {
              href: "/people",
              title: "People of Bandwar",
              desc: "Martyrs, leaders & notable figures",
            },
            {
              href: "/gallery",
              title: "Photo Archive",
              desc: "Visual memories & heritage",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group py-6 md:py-7 px-2 md:px-6 flex items-center justify-between gap-4 hover:bg-surface transition-colors"
            >
              <div>
                <h2 className="font-serif font-bold text-xl text-ink group-hover:text-accent transition-colors">
                  {item.title}
                </h2>
                <p className="text-sm text-ink-muted mt-1">{item.desc}</p>
              </div>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="text-ink/20 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0"
              />
            </Link>
          ))}
        </nav>

        {/* 3. MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 space-y-16">
            {/* Lead Story */}
            {leadArticle && (
              <section aria-labelledby="latest-heading">
                <div className="flex items-center gap-4 mb-6">
                  <h2
                    id="latest-heading"
                    className="text-xs font-bold uppercase tracking-[0.18em] text-accent"
                  >
                    Latest Record
                  </h2>
                  <div aria-hidden="true" className="h-px bg-divider flex-grow" />
                </div>

                <Link
                  href={`/article/${leadArticle.id}`}
                  className="group flex flex-col md:flex-row gap-6 md:gap-8 items-start"
                >
                  <div className="relative w-full md:w-1/2 aspect-[4/3] bg-surface border border-divider rounded-sm overflow-hidden shrink-0">
                    <Image
                      src={
                        leadArticle.hero
                          ? leadArticle.hero.startsWith("/")
                            ? leadArticle.hero
                            : `/${leadArticle.hero}`
                          : "/fallback.jpg"
                      }
                      alt={leadArticle.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="flex items-center gap-3 text-xs text-accent font-bold uppercase tracking-wider mb-3">
                      <span>{leadArticle.categories?.[0]}</span>
                      <span aria-hidden="true" className="w-1 h-1 rounded-full bg-divider" />
                      <time dateTime={leadArticle.lastUpdated}>
                        {formatDate(leadArticle.lastUpdated)}
                      </time>
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink group-hover:text-accent transition-colors leading-tight mb-3">
                      {leadArticle.title}
                    </h3>
                    <p className="text-ink-muted text-base leading-relaxed line-clamp-3 mb-4">
                      {leadArticle.summary}
                    </p>
                    <span className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                      Read full article <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* Historical Thread */}
            {featuredEdge && sourceArticle && targetArticle && (
              <section
                aria-labelledby="thread-heading"
                className="bg-surface border border-divider p-6 md:p-8 rounded-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <GitBranch size={16} className="text-accent" aria-hidden="true" />
                  <h2
                    id="thread-heading"
                    className="text-xs font-bold uppercase tracking-[0.18em] text-accent"
                  >
                    Historical Thread
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <Link
                    href={`/article/${sourceArticle.id}`}
                    className="flex-1 group text-center md:text-right w-full"
                  >
                    <h3 className="font-serif text-xl font-bold text-ink group-hover:text-accent transition-colors">
                      {sourceArticle.title}
                    </h3>
                    <p className="text-sm text-ink-muted mt-1">
                      Est. {sourceArticle.infobox?.["Established"]?.value || "Historical"}
                    </p>
                  </Link>

                  <div className="shrink-0 bg-canvas px-4 py-2 border border-divider rounded-full text-xs font-semibold text-ink-muted inline-flex items-center gap-2">
                    <MoveRight size={14} className="text-accent" aria-hidden="true" />
                    {featuredEdge.label || "Connection"}
                  </div>

                  <Link
                    href={`/article/${targetArticle.id}`}
                    className="flex-1 group text-center md:text-left w-full"
                  >
                    <h3 className="font-serif text-xl font-bold text-ink group-hover:text-accent transition-colors">
                      {targetArticle.title}
                    </h3>
                    <p className="text-sm text-ink-muted mt-1">
                      Est. {targetArticle.infobox?.["Established"]?.value || "Historical"}
                    </p>
                  </Link>
                </div>

                {featuredEdge.description && (
                  <p className="text-sm text-ink-muted text-center mt-6 pt-4 border-t border-divider/50 italic">
                    “{featuredEdge.description}”
                  </p>
                )}
              </section>
            )}

            {/* Archive Grid */}
            <section aria-labelledby="more-heading">
              <div className="flex items-center gap-4 mb-6">
                <h2
                  id="more-heading"
                  className="text-xs font-bold uppercase tracking-[0.18em] text-accent"
                >
                  More from the Archive
                </h2>
                <div aria-hidden="true" className="h-px bg-divider flex-grow" />
                <Link href="/section" className="text-sm font-semibold text-ink hover:text-accent shrink-0">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {recentArticles.map((article) => (
                  <article key={article.id} className="flex flex-col h-full border-t border-divider pt-4">
                    <div className="text-[11px] text-accent font-bold uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
                      <span>{article.categories?.[0]}</span>
                      <ConfidenceBadge
                        tier={article.confidence || "unverified"}
                        className="scale-90 origin-right shrink-0"
                      />
                    </div>
                    <Link href={`/article/${article.id}`} className="group">
                      <h3 className="font-serif text-xl font-bold text-ink group-hover:text-accent transition-colors leading-snug mb-2">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-ink-muted text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
                      {article.summary}
                    </p>
                    <time dateTime={article.lastUpdated} className="text-xs text-ink-muted">
                      {formatDate(article.lastUpdated)}
                    </time>
                  </article>
                ))}
              </div>
            </section>

            {/* Absences */}
            {absences.length > 0 && (
              <section
                aria-labelledby="missing-heading"
                className="border border-dashed border-accent/40 bg-accent/5 rounded-sm p-6"
              >
                <div className="flex items-start gap-4">
                  <FileQuestion className="w-8 h-8 text-accent shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <h2 id="missing-heading" className="font-serif text-xl font-bold text-ink mb-2">
                      What is still missing?
                    </h2>
                    <p className="text-ink-muted text-sm mb-4">
                      An honest archive documents its own gaps. We are actively
                      searching for the following records:
                    </p>
                    <ul className="space-y-3">
                      {absences.slice(0, 2).map((absence) => (
                        <li key={absence.id} className="flex items-start gap-2 text-sm">
                          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          <span className="text-ink">{absence.description}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contribute"
                      className="inline-flex items-center gap-1 text-accent font-semibold text-sm mt-4 hover:underline"
                    >
                      Help us find these <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* About */}
            <section aria-labelledby="about-heading" className="bg-surface border border-divider p-6 md:p-8 rounded-sm">
              <h2 id="about-heading" className="font-serif text-2xl font-bold text-ink mb-4">
                {home.about.title}
              </h2>
              <div className="space-y-4 text-ink/80 leading-relaxed text-[15px] md:text-base">
                {home.about.paragraphs.map((p: string, idx: number) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-divider">
                <Link
                  href="/about"
                  className="inline-flex items-center text-accent hover:text-accent-hover font-semibold text-sm group"
                >
                  Read the full history
                  <MoveRight size={16} aria-hidden="true" className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-10">
            <section aria-labelledby="facts-heading">
              <h3 id="facts-heading" className="text-xs font-bold uppercase tracking-[0.18em] text-accent mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="w-1.5 h-1.5 bg-accent" />
                Village Facts
              </h3>
              <dl className="text-sm m-0 border-t border-divider">
                {home.stats.map((stat: StatItem, idx: number) => (
                  <div key={idx} className="flex justify-between items-center gap-4 border-b border-divider py-3">
                    <dt className="text-ink-muted">{stat.label}</dt>
                    <dd className="text-ink font-bold font-mono">
                      {stat.value === "{{articleCount}}" ? allArticles.length : stat.value}
                    </dd>
                  </div>
                ))}
                <div className="flex justify-between items-center border-b border-divider py-3 bg-[#1F7A3D]/5 -mx-2 px-2">
                  <dt className="text-[#1F7A3D] flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={14} aria-hidden="true" /> Archive Sourced
                  </dt>
                  <dd className="text-[#1F7A3D] font-bold font-mono">{sourcedPct}%</dd>
                </div>
              </dl>
            </section>

            <section aria-label="Quote" className="border-l-2 border-accent pl-5 py-2">
              <blockquote className="text-xl font-serif font-bold text-ink italic leading-snug mb-3">
                “{home.pullquote.text}”
              </blockquote>
              <p className="text-ink-muted text-xs font-bold uppercase tracking-widest m-0">
                — {home.pullquote.cite}
              </p>
            </section>

            <section aria-labelledby="map-heading" className="hidden lg:block">
              <div className="flex items-center justify-between mb-4">
                <h3 id="map-heading" className="text-xs font-bold uppercase tracking-[0.18em] text-accent flex items-center gap-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 bg-accent" />
                  Cartographic Index
                </h3>
                <Link href="/map" className="text-xs font-semibold text-ink hover:text-accent">
                  Open Map
                </Link>
              </div>
              <div className="bg-surface border border-divider rounded-sm overflow-hidden h-[350px] relative z-0">
                <LandmarkMapWrapper
                  landmarks={media.landmarks || []}
                  activeLandmark={null}
                  showLegend={false}
                  showScale={false}
                />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}