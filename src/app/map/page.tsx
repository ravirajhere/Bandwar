import { getMediaData, getMasterData } from "@/lib/data";
import { MapClient } from "./MapClient";
import { MapPin, ChevronRight, Compass, Layers, Info, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// 🚀 SEO FIX: Dynamic Metadata
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  
  const title = "Cartographic Index | Village Map";
  const description = "Explore the spatial archive of Bandwar village, Begusarai (Bihar) — an index of temples, schools, infrastructure, and historical landmarks.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/map`,
      languages: { "en-IN": `${baseUrl}/map`, "x-default": `${baseUrl}/map` },
    },
    openGraph: {
      type: "website",
      title: `${title} — Bandwar Village Archive`,
      description,
      url: `${baseUrl}/map`,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Cartographic Index - Bandwar Archive" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Bandwar Village Archive`,
      description,
      images: [ogImage],
    },
  };
}

export default function MapPage() {
  const media = getMediaData();
  const config = getMasterData();
  const baseUrl = config.site.url;
  const landmarks = media.landmarks || [];

  // Group landmarks by category for the index
  const categories = Array.from(new Set(landmarks.map(l => l.category || "Other"))).map(cat => ({
    name: cat,
    count: landmarks.filter(l => (l.category || "Other") === cat).length
  }));

  // 🚀 JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/map#webpage`,
        url: `${baseUrl}/map`,
        name: "Cartographic Index — Bandwar Village Archive",
        description: "Explore the cartographic index of Bandwar village — temples, schools, infrastructure, and landmarks.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Village Map", "item": `${baseUrl}/map` }
        ]
      }
    ]
  };

  return (
    <div className="bg-canvas min-h-screen py-8 md:py-12 flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-4 md:px-0 max-w-[1500px] flex-grow flex flex-col">
        
        {/* 🚀 Editorial Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium">Cartographic Index</span>
        </nav>

        {/* 🚀 Atlas Header */}
        <div className="mb-10 border-b border-divider pb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-px bg-accent"></span>
            <span className="text-accent font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Compass size={14} /> Spatial Archive
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink font-bold tracking-tight mb-4">
            The Cartographic Index
          </h1>
          <p className="text-ink-muted text-lg md:text-xl max-w-3xl leading-relaxed">
            A complete spatial record of Bandwar's landmarks, institutions, and religious sites. Navigate the map to explore the physical geography of the village.
          </p>
        </div>

        {/* 🚀 Atlas Layout (Sidebar + Map) */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start h-full">
          
          {/* Left Sidebar: The Index */}
          <aside className="bg-surface border border-divider rounded-sm overflow-hidden hidden lg:flex flex-col h-[75vh] sticky top-24">
            
            <div className="p-5 border-b border-divider bg-canvas/50">
              <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2 m-0">
                <Layers size={18} className="text-accent" /> Atlas Legend
              </h2>
            </div>

            <div className="p-5 flex-grow overflow-y-auto">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-4">Categories Indexed</h3>
              <ul className="space-y-3 m-0 p-0 list-none">
                {categories.map(cat => (
                  <li key={cat.name} className="flex items-center justify-between border-b border-divider/50 pb-2 last:border-0">
                    <span className="text-sm font-medium text-ink capitalize">{cat.name}</span>
                    <span className="text-xs font-bold bg-canvas border border-divider px-2 py-0.5 rounded-sm">{cat.count}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-divider">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-3 flex items-center gap-1">
                  <Info size={12} /> How to use
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed m-0">
                  Click on any numbered marker on the map to view the landmark's details. You can zoom and drag the map to explore different areas of Bandwar.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Area: The Map */}
          <div className="flex flex-col w-full h-full">
            {/* Map Container with sharp border */}
            <div className="bg-surface border border-divider rounded-sm overflow-hidden w-full h-[60vh] lg:h-[75vh] relative z-0 shadow-sm">
              <MapClient landmarks={landmarks} />
            </div>
            
            {/* Map Footer / Attribution */}
            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted px-1">
              <span>© Bandwar Village Archive — Cartographic Division</span>
              <span className="flex items-center gap-1"><MapIcon size={12}/> OpenStreetMap Contributors</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}