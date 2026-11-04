import Link from "next/link";
import Image from "next/image";
import { getPeopleData, getMasterData } from "@/lib/data";
import { AddContentModal } from "@/components/shared/AddContentModal";
import { MapPin, User, ArrowRight, ChevronRight, BookMarked } from "lucide-react"; 
import { Metadata } from "next";

// 🚀 SEO FIX: Dynamic Metadata with Canonical & OG tags
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  
  const title = "The People of Bandwar";
  const description = "Notable personalities, elders, leaders, and legends from Bandwar village, Begusarai (Bihar).";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/people`,
      languages: {
        "en-IN": `${baseUrl}/people`,
        "x-default": `${baseUrl}/people`,
      },
    },
    openGraph: {
      type: "website",
      title: `${title} — Bandwar Village Archive`,
      description,
      url: `${baseUrl}/people`,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "The People of Bandwar - Village Archive" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Bandwar Village Archive`,
      description,
      images: [ogImage],
    },
  };
}

export default function PeoplePage() {
  const data = getPeopleData();
  const config = getMasterData();
  const baseUrl = config.site.url;

  // 🚀 JSON-LD Schema (WebPage + Breadcrumb + ItemList for E-E-A-T)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/people#webpage`,
        url: `${baseUrl}/people`,
        name: "The People of Bandwar — Bandwar Village Archive",
        description: "Notable personalities, elders, leaders, and legends from Bandwar village.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "People", "item": `${baseUrl}/people` }
        ]
      },
      ...(data.people.length > 0 ? [{
        "@type": "ItemList",
        "@id": `${baseUrl}/people#itemlist`,
        name: "People of Bandwar",
        numberOfItems: data.people.length,
        itemListElement: data.people.map((person, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}/people/${person.id}`,
          name: person.name
        }))
      }] : [])
    ]
  };

  return (
    <div className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-16">
      {/* 🚀 JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 md:px-0">
        
        {/* 🏛️ Breadcrumb (Strict) */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6 no-print" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
            Home
          </Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium">People</span>
        </nav>

        {/* 🏛️ Page Header (Encyclopedic Style) */}
        <div className="border-b border-divider pb-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <User className="text-accent" size={28} aria-hidden="true" />
              <h1 className="font-serif text-3xl md:text-4xl 3xl:text-5xl text-ink font-bold tracking-tight">
                The People of Bandwar
              </h1>
            </div>
            
            <p className="text-base 3xl:text-lg text-ink-muted leading-relaxed mt-3">
              A comprehensive record of the notable personalities, elders, leaders, and legends who have shaped our village's history, culture, and identity.
            </p>
          </div>
          
          {/* Action Button */}
          <div className="shrink-0 pt-1">
            <AddContentModal 
              type="person" 
              customButtonText="Add a Person" 
            />
          </div>
        </div>

        {/* 📊 Directory Stats */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold text-ink-muted uppercase tracking-wider">
          <BookMarked size={16} className="text-accent" aria-hidden="true" />
          <span>{data.people.length} Profiles in Archive</span>
        </div>

        {/* 👥 People Directory Grid */}
        {data.people.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface border border-dashed border-divider rounded-sm">
            <User size={48} className="text-ink/20 mb-4 3xl:w-16 3xl:h-16" aria-hidden="true" />
            <h3 className="text-lg 3xl:text-xl font-serif font-bold text-ink mb-1">No profiles found</h3>
            <p className="text-ink-muted text-sm 3xl:text-base">The archive currently has no person profiles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-4 3xl:gap-6">
            {data.people.map((person) => {
              // 🚀 SEO FIX: Strip query strings for Next.js Image
              const cleanPhotoSrc = person.photo ? (person.photo.startsWith("/") ? person.photo : `/${person.photo}`).split('?')[0] : null;

              return (
                <Link 
                  href={`/people/${person.id}`} 
                  key={person.id}
                  className="group flex flex-col bg-surface border border-divider rounded-sm hover:border-accent transition-colors duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {/* Photo Section */}
                  <div className="relative w-full aspect-[4/3] bg-canvas border-b border-divider overflow-hidden">
                    {cleanPhotoSrc ? (
                      <Image
                        src={cleanPhotoSrc}
                        alt={person.photoAlt || person.name}
                        fill
                        className="object-cover object-top filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-canvas text-ink/10">
                        <User size={48} className="3xl:w-16 3xl:h-16" aria-hidden="true" />
                      </div>
                    )}
                    
                    {/* Deceased Badge (Flat & Formal) */}
                    {person.deathDate && (
                      <div className="absolute top-0 right-0 bg-ink/80 backdrop-blur-sm text-white text-[9px] 3xl:text-[10px] px-2 py-1 uppercase tracking-widest font-bold">
                        In Memoriam
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 3xl:p-5 flex flex-col flex-grow">
                    <div className="mb-2">
                      <h2 className="font-serif text-lg 3xl:text-xl font-bold text-ink group-hover:text-accent transition-colors leading-tight line-clamp-1">
                        {person.name}
                      </h2>
                      
                      {/* Lifespan */}
                      {(person.dob || person.deathDate) && (
                        <p className="text-[11px] 3xl:text-xs text-ink-muted font-medium mt-1">
                          {person.dob && person.deathDate 
                            ? `${person.dob} – ${person.deathDate}` 
                            : person.dob 
                              ? `Born: ${person.dob}` 
                              : `Died: ${person.deathDate}`}
                        </p>
                      )}
                    </div>

                    {/* Roles / Titles */}
                    <p className="text-accent font-semibold text-[12px] 3xl:text-sm mb-2 line-clamp-1 uppercase tracking-wide">
                      {person.role}
                    </p>
                    
                    {/* Bio */}
                    <p className="text-ink-muted text-[13px] 3xl:text-sm leading-relaxed mb-4 line-clamp-3">
                      {person.bio}
                    </p>
                    
                    {/* Footer Info (Locality & Read More) */}
                    <div className="mt-auto pt-3 border-t border-divider flex items-center justify-between">
                      <div className="flex items-center text-[11px] 3xl:text-xs text-ink-muted font-medium">
                        <MapPin size={12} className="mr-1 text-accent shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">{person.locality || "Bandwar"}</span>
                      </div>
                      
                      {/* Read More Arrow */}
                      <span className="text-accent text-[11px] 3xl:text-xs font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                        Read <ArrowRight size={12} className="ml-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}