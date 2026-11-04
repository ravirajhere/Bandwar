import { getDirectoryData, getMasterData } from "@/lib/data";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { Metadata } from "next";
import { AddContentModal } from "@/components/shared/AddContentModal";
import Link from "next/link";
import { ChevronRight, Phone, ShieldAlert } from "lucide-react";

// 🚀 SEO FIX: Dynamic Metadata with Canonical & OG tags
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  
  const title = "Village Directory";
  const description = "Find emergency contacts, doctors, shops, and government offices in Bandwar, Begusarai (Bihar). A community-maintained directory.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/directory`,
      languages: {
        "en-IN": `${baseUrl}/directory`,
        "x-default": `${baseUrl}/directory`,
      },
    },
    openGraph: {
      type: "website",
      title: `${title} — Bandwar Village Archive`,
      description,
      url: `${baseUrl}/directory`,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Village Directory - Bandwar Archive" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Bandwar Village Archive`,
      description,
      images: [ogImage],
    },
  };
}

export default function DirectoryPage() {
  const data = getDirectoryData();
  const config = getMasterData();
  const baseUrl = config.site.url;

  // 🚀 Dynamic categories for the form
  const dynamicCategories = data.categories.map(c => ({ id: c.id, title: c.title }));

  // 🚀 JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/directory#webpage`,
        url: `${baseUrl}/directory`,
        name: "Village Directory — Bandwar Village Archive",
        description: "Find emergency contacts, doctors, shops, and government offices in Bandwar.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Directory", "item": `${baseUrl}/directory` }
        ]
      }
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
        
        {/* 🏛️ Breadcrumbs (Strict & Flat) */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
            Home
          </Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium">Directory</span>
        </nav>

        {/* 🏛️ Page Header (Wikipedia / GOV.UK Inspired) */}
        <div className="border-b border-divider pb-6 mb-8 md:mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="text-accent" size={28} aria-hidden="true" />
              <h1 className="font-serif text-3xl md:text-4xl 3xl:text-5xl text-ink font-bold tracking-tight">
                Village Directory
              </h1>
            </div>
            
            <p className="text-base 3xl:text-lg text-ink-muted leading-relaxed max-w-2xl mt-3">
              A comprehensive, community-maintained guide to essential services in Bandwar. Locate emergency contacts, medical facilities, local shops, and government offices. 
            </p>
          </div>
          
          {/* 🚀 Action Button (Dynamic Categories passed) */}
          <div className="shrink-0 pt-1">
            <AddContentModal 
              type="directory" 
              customButtonText="Add New Entry" 
              categories={dynamicCategories}
            />
          </div>
        </div>

        {/* ⚠️ Notice Banner */}
        <div className="bg-surface border border-divider p-3 mb-8 flex items-start gap-3">
          <ShieldAlert size={18} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-ink-muted m-0">
            <strong className="text-ink font-semibold">Note:</strong> Information in this directory is maintained by the village community. If you notice an incorrect phone number or address, please use the edit icon next to the listing to suggest a correction.
          </p>
        </div>

        {/* Client Component for Interactivity (Search, Filter, List) */}
        <DirectoryClient items={data.items} categories={data.categories} />
        
      </div>
    </div>
  );
}