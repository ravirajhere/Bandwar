"use client";

import { useState } from "react";
import Image from "next/image";
import { Media } from "@/lib/schema";

type Photo = Media["gallery"]["photos"][0];
type Category = Media["gallery"]["categories"][0];

export function GalleryGrid({ photos, categories }: { photos: Photo[], categories: Category[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredPhotos = activeTab === "all" 
    ? photos 
    : photos.filter(p => p.category === activeTab);

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border ${
              activeTab === cat.id 
                ? "bg-[#1f3d2f] text-white border-[#1f3d2f]" 
                : "bg-white text-[#1a1a18] border-[#1a1a18]/10 hover:border-[#1f3d2f]/50"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.title}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-[#efece4]">
            <Image
              src={`/${photo.src}`}
              alt={photo.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-xs font-bold text-[#a64b2a] mb-1">{photo.year}</span>
              <p className="text-white text-sm font-medium leading-tight">{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>
      
      {filteredPhotos.length === 0 && (
        <p className="text-center text-[#1a1a18]/50 py-12">Is category mein abhi koi photo nahi hai.</p>
      )}
    </div>
  );
}