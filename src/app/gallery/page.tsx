import { getMediaData, getMasterData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import { Metadata } from "next";
import { Camera, ChevronRight, Image as ImageIcon } from "lucide-react";
import { AddContentModal } from "@/components/shared/AddContentModal";
import Link from "next/link";

// 🚀 SEO FIX: Dynamic Metadata with Canonical & OG tags
export async function generateMetadata(): Promise<Metadata> {
  const config = getMasterData();
  const baseUrl = config.site.url;
  const ogImage = `${baseUrl}${config.seo?.ogImage || "/images/geography/burhi-gandak-river-dawn-bandwar.jpg"}`;
  
  const title = "Village Gallery";
  const description = "Explore the visual memories, festivals, and heritage of Bandwar village through our photo gallery.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/gallery`,
      languages: {
        "en-IN": `${baseUrl}/gallery`,
        "x-default": `${baseUrl}/gallery`,
      },
    },
    openGraph: {
      type: "website",
      title: `${title} — Bandwar Village Archive`,
      description,
      url: `${baseUrl}/gallery`,
      siteName: config.site.name,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Village Gallery - Bandwar Archive" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Bandwar Village Archive`,
      description,
      images: [ogImage],
    },
  };
}

export default function GalleryPage() {
  const media = getMediaData();
  const config = getMasterData();
  const baseUrl = config.site.url;
  const photoCount = media.gallery.photos.length;

  // 🚀 Dynamic categories for the upload form (excluding "All")
  const uploadCategories = media.gallery.categories
    .filter((c) => c.id !== "all")
    .map((c) => ({ id: c.id, title: c.title }));

  // 🚀 JSON-LD Schema (Helps Google Images rank the photos)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/gallery#webpage`,
        url: `${baseUrl}/gallery`,
        name: "Village Gallery — Bandwar Village Archive",
        description: "Explore the visual memories, festivals, and heritage of Bandwar village through our photo gallery.",
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Gallery", "item": `${baseUrl}/gallery` }
        ]
      },
      {
        "@type": "ImageGallery",
        "@id": `${baseUrl}/gallery#gallery`,
        name: "Bandwar Village Photo Archive",
        // 🚀 SEO TIP: We only send top 20 images to schema to keep the HTML payload light.
        associatedMedia: media.gallery.photos.slice(0, 20).map(photo => ({
          "@type": "ImageObject",
          contentUrl: `${baseUrl}/${photo.src.split('?')[0].replace(/^\//, "")}`,
          name: photo.caption,
          description: photo.caption,
          ...(photo.year && { uploadDate: `${photo.year}-01-01` })
        }))
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

      {/* 🚀 Immersive Layout for Gallery */}
      <div className="container mx-auto max-w-[1600px] px-4 md:px-0">
        
        {/* 🏛️ Breadcrumbs (Strict) */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6 no-print" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
            Home
          </Link>
          <ChevronRight size={14} className="text-divider shrink-0" aria-hidden="true" />
          <span className="text-ink font-medium">Gallery</span>
        </nav>

        {/* 🏛️ Page Header */}
        <div className="border-b border-divider pb-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="text-accent" size={28} aria-hidden="true" />
              <h1 className="font-serif text-3xl md:text-4xl 3xl:text-5xl text-ink font-bold tracking-tight">
                Village Gallery
              </h1>
            </div>
            
            <p className="text-base 3xl:text-lg text-ink-muted leading-relaxed max-w-2xl mt-3">
              A visual archive of Bandwar — from historic temples and vibrant festivals to the quiet moments of everyday life. Explore our collective memory.
            </p>
          </div>
          
          {/* 🚀 Action Button (Dynamic Categories passed) */}
          <div className="shrink-0 pt-1">
            <AddContentModal 
              type="image" 
              customButtonText="Upload Photograph" 
              categories={uploadCategories}
            />
          </div>
        </div>

        {/* 📊 Archive Stats */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold text-ink-muted uppercase tracking-wider">
          <ImageIcon size={16} className="text-accent" aria-hidden="true" />
          <span>{photoCount} Photographs in Archive</span>
        </div>

        {/* Gallery Grid (Main Content) */}
        <GalleryGrid 
          photos={media.gallery.photos} 
          categories={media.gallery.categories} 
        />
        
      </div>
    </div>
  );
}