import { getMediaData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import { Metadata } from "next";
import { Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Photo Gallery | Bandwar Portal",
  description: "Explore the visual memories, festivals, and heritage of Bandwar village through our photo gallery.",
};

export default function GalleryPage() {
  const media = getMediaData();

  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom">
        
        {/* 🏛️ Premium Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            Village Gallery
          </h1>
          <div className="w-20 h-1 bg-brand mb-6 rounded-full mx-auto"></div>
          <p className="text-lg text-muted leading-relaxed">
            A visual archive of Bandwar — from historic temples and festivals to everyday life. Click any photo to view in full size.
          </p>
        </div>

        {/* Gallery Grid (Ab full width me aayega) */}
        <GalleryGrid 
          photos={media.gallery.photos} 
          categories={media.gallery.categories} 
        />
        
      </div>
    </div>
  );
}