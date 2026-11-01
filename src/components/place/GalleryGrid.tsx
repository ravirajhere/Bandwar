"use client";

import { useState } from "react";
import Image from "next/image";
import { Media } from "@/lib/schema";
import { Lightbox } from "./Lightbox";
import { Image as ImageIcon, Maximize2 } from "lucide-react";

type Photo = Media["gallery"]["photos"][0];
type Category = Media["gallery"]["categories"][0];

export function GalleryGrid({ photos, categories }: { photos: Photo[], categories: Category[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredPhotos = activeTab === "all" 
    ? photos 
    : photos.filter(p => p.category === activeTab);

  return (
    <div>
      {/* 🏷️ Filter Tabs (Sticky on Scroll) */}
      <div className="sticky top-16 md:top-20 3xl:top-24 z-30 bg-canvas/90 backdrop-blur-md py-4 mb-6 md:mb-8 3xl:mb-12 transition-all duration-300">
        <div className="flex overflow-x-auto gap-2 md:gap-3 scrollbar-hide pb-1">
          <button
            onClick={() => { setActiveTab("all"); setSelectedIndex(null); }}
            className={`whitespace-nowrap px-5 py-2.5 3xl:px-6 3xl:py-3 rounded-full text-sm md:text-[15px] 3xl:text-base font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === "all" 
                ? "bg-accent text-white border-accent shadow-sm" 
                : "bg-surface text-ink/70 border-divider hover:bg-canvas hover:text-ink hover:border-ink/20"
            }`}
          >
            All Photos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab(cat.id); setSelectedIndex(null); }}
              className={`whitespace-nowrap px-5 py-2.5 3xl:px-6 3xl:py-3 rounded-full text-sm md:text-[15px] 3xl:text-base font-medium transition-all duration-200 border flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeTab === cat.id 
                  ? "bg-accent text-white border-accent shadow-sm" 
                  : "bg-surface text-ink/70 border-divider hover:bg-canvas hover:text-ink hover:border-ink/20"
              }`}
            >
              <span aria-hidden="true" className="text-lg opacity-80">{cat.icon}</span>
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* 🖼️ Google Photos Style Masonry Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 3xl:columns-5 gap-4 md:gap-6 3xl:gap-8 space-y-4 md:space-y-6 3xl:space-y-8">
          {filteredPhotos.map((photo, index) => (
            <button 
              key={photo.id} 
              className="group relative w-full break-inside-avoid bg-surface rounded-lg overflow-hidden border border-divider shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-inset block text-left"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View photo: ${photo.caption}`}
            >
              {/* Image Container (Intrinsic aspect ratio maintained) */}
              <div className="relative w-full overflow-hidden bg-canvas">
                <Image
                  src={photo.src.startsWith("/") ? photo.src : `/${photo.src}`}
                  alt={photo.caption}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                />
              </div>

              {/* Hover Overlay & Icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4 3xl:p-6">
                
                {/* Expand Icon */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Maximize2 size={18} className="3xl:w-6 3xl:h-6" />
                </div>
                
                {/* Caption Info */}
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {photo.year && (
                    <span className="text-[11px] 3xl:text-xs font-bold text-white bg-ink/60 backdrop-blur-md px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block border border-white/10">
                      {photo.year}
                    </span>
                  )}
                  <p className="text-white text-sm 3xl:text-base font-medium leading-snug line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* 📭 Empty State */
        <div className="flex flex-col items-center justify-center py-24 3xl:py-32 bg-surface border border-dashed border-divider rounded-lg">
          <ImageIcon size={56} className="text-ink/20 mb-4 3xl:w-16 3xl:h-16" />
          <h3 className="text-xl 3xl:text-2xl font-serif font-semibold text-ink mb-2">No photos in this category</h3>
          <p className="text-ink/60 3xl:text-lg">We haven't added any photos here yet.</p>
        </div>
      )}

      {/* 👇 LIGHTBOX COMPONENT */}
      {selectedIndex !== null && (
        <Lightbox 
          photos={filteredPhotos} 
          initialIndex={selectedIndex} 
          onClose={() => setSelectedIndex(null)} 
        />
      )}
    </div>
  );
}