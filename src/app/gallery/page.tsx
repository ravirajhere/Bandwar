import { getMediaData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import { Metadata } from "next";
import { Camera, UploadCloud, ChevronRight, Image as ImageIcon } from "lucide-react";
import { AddContentModal } from "@/components/shared/AddContentModal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Photo Gallery | Bandwar Portal",
  description: "Explore the visual memories, festivals, and heritage of Bandwar village through our photo gallery.",
};

export default function GalleryPage() {
  const media = getMediaData();
  const photoCount = media.gallery.photos.length;

  return (
    <div className="bg-canvas min-h-screen py-8 md:py-12 3xl:py-16">
      
      {/* 🚀 Immersive Layout for Gallery */}
      <div className="container mx-auto max-w-[1600px] px-4 md:px-0">
        
        {/* 🏛️ Breadcrumbs (Strict) */}
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-6 no-print" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
            Home
          </Link>
          <ChevronRight size={14} className="text-divider shrink-0" />
          <span className="text-ink font-medium">Gallery</span>
        </nav>

        {/* 🏛️ Page Header (Wikimedia / GitHub Inspired) */}
        <div className="border-b border-divider pb-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="text-accent" size={28} />
              <h1 className="font-serif text-3xl md:text-4xl 3xl:text-5xl text-ink font-bold tracking-tight">
                Village Gallery
              </h1>
            </div>
            
            <p className="text-base 3xl:text-lg text-ink-muted leading-relaxed max-w-2xl mt-3">
              A visual archive of Bandwar — from historic temples and vibrant festivals to the quiet moments of everyday life. Explore our collective memory.
            </p>
          </div>
          
          {/* Action Button (Utility Style) */}
          <div className="shrink-0 pt-1">
            <AddContentModal 
              type="image" 
              customButtonText="Upload Photograph" 
            />
          </div>
        </div>

        {/* 📊 Archive Stats */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold text-ink-muted uppercase tracking-wider">
          <ImageIcon size={16} className="text-accent" />
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