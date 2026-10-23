"use client";

import { getMediaData } from "@/lib/data";
import { GalleryGrid } from "@/components/place/GalleryGrid";
import LandmarkMapWrapper from "@/components/place/LandmarkMapWrapper";
import { useState } from "react";

export default function PlacePage() {
  const media = getMediaData();
  const [activeLandmark, setActiveLandmark] = useState<any>(null);

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            Places & Gallery
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted leading-relaxed max-w-3xl">
            Explore the landmarks, temples, and geography of Bandwar. Click on any location to fly to it on the map.
          </p>
        </div>

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
      </div>
    </div>
  );
}