import { getMediaData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import LandmarkMapWrapper from "@/components/place/LandmarkMapWrapper"; // 👈 Naya wrapper import

export const metadata = {
  title: "Places & Gallery | Bandwar Archive",
  description: "Explore the landmarks, temples, schools, and natural beauty of Bandwar village through our photo gallery and interactive map.",
};

export default function PlacePage() {
  const media = getMediaData();

  return (
    <div className="bg-[#f7f5ef] min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-[#1f3d2f] text-[#f7f5ef] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Places & Gallery
          </h1>
          <p className="text-lg text-[#f7f5ef]/80 max-w-2xl mx-auto">
            A visual journey through the village — its temples, schools, historic landmarks, and the landscapes that define it.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">
        
        {/* 1. Map Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-3xl font-bold text-[#1a1a18]">Village Map</h2>
            <div className="h-px bg-[#1a1a18]/20 flex-grow"></div>
          </div>
          {/* 👇 Wrapper use kar rahe hain 👇 */}
          <LandmarkMapWrapper landmarks={media.landmarks || []} />
        </section>

        {/* 2. Gallery Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-3xl font-bold text-[#1a1a18]">Photo Gallery</h2>
            <div className="h-px bg-[#1a1a18]/20 flex-grow"></div>
          </div>
          <GalleryGrid 
            photos={media.gallery.photos} 
            categories={media.gallery.categories} 
          />
        </section>

      </div>
    </div>
  );
}