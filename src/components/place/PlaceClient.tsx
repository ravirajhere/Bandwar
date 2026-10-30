"use client";

import { useState } from "react";
import { Media } from "@/lib/schema";
import { GalleryGrid } from "./GalleryGrid";
import LandmarkMapWrapper from "./LandmarkMapWrapper";
import { MapPin } from "lucide-react";

// 🛡️ TypeScript Type Extraction (No more 'any')
type LandmarkType = NonNullable<Media["landmarks"]>[number];

export function PlaceClient({ media }: { media: Media }) {
  const [activeLandmark, setActiveLandmark] = useState<LandmarkType | null>(
    media.landmarks && media.landmarks.length > 0 ? media.landmarks[0] : null
  );

  return (
    <div className="space-y-16">
      
      {/* =========================================
          1. Map Section (Premium Explorer Layout)
         ========================================= */}
      <section>
        <div className="mb-6 flex items-center gap-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
            Interactive Map
          </h2>
          <div className="h-px bg-border flex-grow rounded-full"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* 📱 Mobile Map (Top) / Desktop Map (Right) */}
          <div className="flex-grow order-1 lg:order-2 bg-card border border-border rounded-xl shadow-card overflow-hidden h-[400px] lg:h-[600px] relative z-0">
            <LandmarkMapWrapper 
              landmarks={media.landmarks || []} 
              activeLandmark={activeLandmark} 
            />
          </div>

          {/* 🖥️ Locations Directory (Mobile: Bottom / Desktop: Left) */}
          <div className="w-full lg:w-[320px] shrink-0 order-2 lg:order-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden max-h-[400px] lg:max-h-[600px]">
            <div className="p-4 border-b border-border bg-muted-background shrink-0">
              <h3 className="font-serif font-semibold text-foreground m-0 flex items-center gap-2">
                <MapPin size={18} className="text-brand" /> 
                Explore Locations
              </h3>
            </div>
            
            <ul className="overflow-y-auto divide-y divide-border-subtle flex-grow custom-scrollbar">
              {!media.landmarks || media.landmarks.length === 0 ? (
                <li className="p-6 text-center text-muted text-sm">No landmarks added yet.</li>
              ) : (
                media.landmarks.map((place) => {
                  const isActive = activeLandmark?.id === place.id;
                  return (
                    <li key={place.id}>
                      <button
                        onClick={() => setActiveLandmark(place)}
                        className={`w-full text-left p-4 transition-all duration-200 flex items-start gap-3 group ${
                          isActive 
                            ? "bg-brand/5 border-l-4 border-brand" 
                            : "hover:bg-muted-background border-l-4 border-transparent"
                        }`}
                      >
                        {/* Icon Badge */}
                        <div className={`p-2 rounded-full shrink-0 transition-colors ${
                          isActive ? "bg-brand/20 text-brand" : "bg-muted-background text-muted group-hover:text-foreground"
                        }`}>
                          <span className="text-base leading-none block">{place.icon || "📍"}</span>
                        </div>
                        
                        <div className="min-w-0 pt-0.5">
                          <div className={`font-semibold text-[15px] truncate ${
                            isActive ? "text-brand" : "text-foreground group-hover:text-brand"
                          }`}>
                            {place.name}
                          </div>
                          <div className="text-[13px] text-muted capitalize mt-0.5">
                            {place.category}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================
          2. Gallery Section
         ========================================= */}
      <section>
        <div className="mb-6 flex items-center gap-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
            Photo Gallery
          </h2>
          <div className="h-px bg-border flex-grow rounded-full"></div>
        </div>
        
        <GalleryGrid 
          photos={media.gallery.photos} 
          categories={media.gallery.categories} 
        />
      </section>

    </div>
  );
}