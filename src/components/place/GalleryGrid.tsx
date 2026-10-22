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
      {/* Filter Tabs (Wikipedia Style Boxes) */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-wiki-border-light pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 text-[14px] border transition-colors ${
            activeTab === "all" 
              ? "bg-wiki-bg-alt font-bold border-wiki-border text-wiki-text" 
              : "bg-wiki-bg border-wiki-border-light text-wiki-link hover:bg-wiki-bg-alt"
          }`}
        >
          All Photos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-3 py-1.5 text-[14px] border transition-colors flex items-center gap-1.5 ${
              activeTab === cat.id 
                ? "bg-wiki-bg-alt font-bold border-wiki-border text-wiki-text" 
                : "bg-wiki-bg border-wiki-border-light text-wiki-link hover:bg-wiki-bg-alt"
            }`}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.title}
          </button>
        ))}
      </div>

      {/* Photo Grid (Wikipedia Thumb Style) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id} 
            className="border border-wiki-border-light bg-wiki-bg-alt flex flex-col hover:border-wiki-border transition-colors"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] bg-wiki-bg border-b border-wiki-border-light overflow-hidden">
              <Image
                src={`/${photo.src}`}
                alt={photo.caption}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            
            {/* Caption Box (Always Visible for Seniors) */}
            <div className="p-2.5 flex-grow flex flex-col justify-start">
              {photo.year && (
                <span className="text-[11px] font-bold text-wiki-text-muted uppercase tracking-wider mb-1">
                  {photo.year}
                </span>
              )}
              <p className="text-[13px] text-wiki-text leading-snug">
                {photo.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="text-center border border-dashed border-wiki-border-light py-12 text-wiki-text-muted text-[15px]">
          No photos found in this category.
        </div>
      )}
    </div>
  );
}