import { getMediaData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import { Metadata } from "next";
import { Camera, UploadCloud } from "lucide-react";
import { AddContentModal } from "@/components/shared/AddContentModal";

export const metadata: Metadata = {
  title: "Photo Gallery | Bandwar Portal",
  description: "Explore the visual memories, festivals, and heritage of Bandwar village through our photo gallery.",
};

export default function GalleryPage() {
  const media = getMediaData();

  return (
    <div className="bg-background min-h-screen py-10 md:py-16">
      {/* 🚀 Immersive Layout: Container ko thoda wide kiya hai taaki photos bade dikhein */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* 🏛️ Premium Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Camera size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 font-semibold tracking-tight">
            Village Gallery
          </h1>
          <div className="w-24 h-1.5 bg-brand mb-6 rounded-full mx-auto"></div>
          <p className="text-lg text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
            A visual archive of Bandwar — from historic temples and festivals to everyday life. Immerse yourself in our memories.
          </p>
          
          <div className="flex justify-center">
            <AddContentModal 
              type="image" 
              customButtonText="Upload a Photo to Gallery" 
            />
          </div>
        </div>

        {/* Gallery Grid (Yahan asli magic hoga) */}
        <GalleryGrid 
          photos={media.gallery.photos} 
          categories={media.gallery.categories} 
        />
        
      </div>
    </div>
  );
}