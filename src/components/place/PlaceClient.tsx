"use client";

import { useState } from "react";
import { Media } from "@/lib/schema";
import { GalleryGrid } from "./GalleryGrid";
import LandmarkMapWrapper from "./LandmarkMapWrapper";

export function PlaceClient({ media }: { media: Media }) {
  const [activeLandmark, setActiveLandmark] = useState<any>(null);

  return (
    <div className="space-y-12">
      
      {/* 1. Map Section (Split View) */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-serif text-2xl text-wiki-text">Interactive Map</h2>
          <div className="h-px bg-wiki-border-light flex-grow"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Landmark List */}
          <div className="w-full lg:w-[300px] shrink-0 border border-wiki-border-light bg-wiki-bg-alt max-h-[600px] overflow-y-auto">
            <div className="p-3 border-b border-wiki-border-light bg-wiki-header sticky top-0 z-10">
              <h3 className="font-bold text-[14px] text-wiki-text m-0">Locations Directory</h3>
            </div>
            <ul className="divide-y divide-wiki-border-light">
              {media.landmarks?.map((place: any) => (
                <li key={place.id}>
                  <button
                    onClick={() => setActiveLandmark(place)}
                    className={`w-full text-left p-3 hover:bg-wiki-bg transition-colors flex items-start gap-2 ${
                      activeLandmark?.id === place.id ? "bg-wiki-bg border-l-4 border-wiki-link" : ""
                    }`}
                  >
                    <span className="text-lg mt-0.5">{place.icon}</span>
                    <div>
                      <div className="font-bold text-[14px] text-wiki-text">{place.name}</div>
                      <div className="text-[12px] text-wiki-text-muted capitalize">{place.category}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: The Map */}
          <div className="flex-grow border border-wiki-border-light bg-wiki-bg">
            <LandmarkMapWrapper landmarks={media.landmarks || []} activeLandmark={activeLandmark} />
          </div>
        </div>
      </section>

      {/* 2. Gallery Section */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-serif text-2xl text-wiki-text">Photo Gallery</h2>
          <div className="h-px bg-wiki-border-light flex-grow"></div>
        </div>
        <GalleryGrid 
          photos={media.gallery.photos} 
          categories={media.gallery.categories} 
        />
      </section>

    </div>
  );
}