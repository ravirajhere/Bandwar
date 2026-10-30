import { getMediaData } from "@/lib/data";
import { PlaceClient } from "@/components/place/PlaceClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Places & Gallery | Bandwar Portal",
  description: "Explore the landmarks, temples, schools, and natural beauty of Bandwar village through our photo gallery and interactive map.",
};

export default function PlacePage() {
  const media = getMediaData();

  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom">
        
        {/* 🏛️ Page Header (Premium Style) */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            Places & Gallery
          </h1>
          {/* Decorative Brand Line */}
          <div className="w-20 h-1 bg-brand mb-6 rounded-full"></div>
          
          <p className="text-lg text-muted leading-relaxed">
            Explore the landmarks, temples, and geography of Bandwar. Click on any location to fly to it on the map, or browse through the village's visual memories in the gallery.
          </p>
        </div>

        {/* Client Component for Interactivity (Map + Gallery) */}
        <PlaceClient media={media} />
        
      </div>
    </div>
  );
}