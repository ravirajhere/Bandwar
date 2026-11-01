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
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      
      {/* 🚀 Immersive Layout: Container ko thoda wide kiya hai taaki photos bade dikhein */}
      <div className="container mx-auto max-w-[1600px] px-4 md:px-0">
        
        {/* 🏛️ Premium Header (Formal Archive Vibe) */}
        <div className="mb-12 3xl:mb-20 text-center max-w-4xl mx-auto">
          
          {/* Icon Badge */}
          <div className="w-16 h-16 3xl:w-20 3xl:h-20 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Camera size={32} className="3xl:w-10 3xl:h-10" />
          </div>
          
          {/* Title & Decorative Line */}
          <h1 className="font-serif text-4xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight">
            Village Gallery
          </h1>
          <div className="w-24 h-1 bg-accent mb-6 rounded-full mx-auto"></div>
          
          {/* Description */}
          <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed mb-8 max-w-2xl 3xl:max-w-3xl mx-auto text-pretty">
            A visual archive of Bandwar — from historic temples and vibrant festivals to the quiet moments of everyday life. Explore our collective memory.
          </p>
          
          {/* Action Button */}
          <div className="flex justify-center">
            <AddContentModal 
              type="image" 
              customButtonText="Upload a Photo to Archive" 
            />
          </div>
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