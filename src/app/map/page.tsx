import { getMediaData, getMasterData } from "@/lib/data";
import { MapClient } from "./MapClient";
import { MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// 🚀 SEO FIX: Dynamic Metadata with Canonical & OG tags
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  
  const title = "Interactive Village Map";
  const description = "Explore the cartographic index of Bandwar village, Begusarai (Bihar) — temples, schools, infrastructure, and landmarks.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/map`,
      languages: {
        "en-IN": `${baseUrl}/map`,
        "x-default": `${baseUrl}/map`,
      },
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

  // 🚀 JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/map#webpage`,
        url: `${baseUrl}/map`,
        name: "Interactive Village Map — Bandwar Village Archive",
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
      {/* 🚀 JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 md:px-0 max-w-[1400px] flex-grow flex flex-col">
        
        {/* Header */}
        <div className="mb-6 shrink-0">
          <nav className="flex items-center gap-2 text-sm text-ink-muted mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
            <span className="text-ink font-medium">Village Map</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-divider pb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold flex items-center gap-3">
                <MapPin className="text-accent" size={32} aria-hidden="true" /> Cartographic Index
              </h1>
              <p className="text-ink-muted mt-2 max-w-2xl text-sm md:text-base">
                A complete spatial record of Bandwar's landmarks, institutions, and religious sites. Click on any location to view details or get directions.
              </p>
            </div>
          </div>
        </div>

        {/* Main Map Interface */}
        <div className="flex-grow">
          <MapClient landmarks={landmarks} />
        </div>

      </div>
    </div>
  );
}