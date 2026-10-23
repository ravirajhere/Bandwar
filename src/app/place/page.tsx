import { getMediaData } from "@/lib/data";
import { PlaceClient } from "@/components/place/PlaceClient";

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
            Explore the landmarks, temples, and geography of Bandwar. Click on any location to fly to it on the map.
          </p>
        </div>

        {/* Client Component for Interactivity */}
        <PlaceClient media={media} />
        
      </div>
    </div>
  );
}