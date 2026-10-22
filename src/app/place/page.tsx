import { getMediaData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import LandmarkMapWrapper from "@/components/place/LandmarkMapWrapper";

export const metadata = {
  title: "Places & Gallery | Bandwar Portal",
  description: "Explore the landmarks, temples, schools, and natural beauty of Bandwar village through our photo gallery and interactive map.",
};

export default function PlacePage() {
  const media = getMediaData();

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header (Wikipedia Style) */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            Places & Gallery
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-3xl">
            A visual journey through the village — its temples, schools, historic landmarks, and the landscapes that define it.
          </p>
        </div>

        <div className="space-y-12">
          
          {/* 1. Map Section */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-serif text-2xl text-wiki-text">Village Map</h2>
              <div className="h-px bg-wiki-border-light flex-grow"></div>
            </div>
            
            {/* Landmark Map Component */}
            <div className="border border-wiki-border-light bg-wiki-bg p-1">
              <LandmarkMapWrapper landmarks={media.landmarks || []} />
            </div>
          </section>

          {/* 2. Gallery Section */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-serif text-2xl text-wiki-text">Photo Gallery</h2>
              <div className="h-px bg-wiki-border-light flex-grow"></div>
            </div>
            
            {/* Gallery Component */}
            <GalleryGrid 
              photos={media.gallery.photos} 
              categories={media.gallery.categories} 
            />
          </section>

        </div>
      </div>
    </div>
  );
}