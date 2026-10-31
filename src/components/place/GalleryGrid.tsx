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
      <div className="sticky top-20 z-30 bg-background/90 backdrop-blur-md py-4 mb-6">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide">
          <button
            onClick={() => { setActiveTab("all"); setSelectedIndex(null); }}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[15px] font-medium transition-all duration-200 border ${
              activeTab === "all" 
                ? "bg-brand text-white border-brand shadow-sm" 
                : "bg-card text-foreground/70 border-border hover:bg-muted-background hover:text-foreground"
            }`}
          >
            All Photos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab(cat.id); setSelectedIndex(null); }}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[15px] font-medium transition-all duration-200 border flex items-center gap-2 ${
                activeTab === cat.id 
                  ? "bg-brand text-white border-brand shadow-sm" 
                  : "bg-card text-foreground/70 border-border hover:bg-muted-background hover:text-foreground"
              }`}
            >
              <span aria-hidden="true" className="text-lg">{cat.icon}</span>
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* 🖼️ Google Photos Style Masonry Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {filteredPhotos.map((photo, index) => (
            <button 
              key={photo.id} 
              className="group relative w-full break-inside-avoid bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-elevated transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand block text-left"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View photo: ${photo.caption}`}
            >
              {/* Image Container (Intrinsic aspect ratio maintained) */}
              <div className="relative w-full overflow-hidden bg-muted-background">
                <Image
                  src={photo.src.startsWith("/") ? photo.src : `/${photo.src}`}
                  alt={photo.caption}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Hover Overlay & Icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4">
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                  <Maximize2 size={16} />
                </div>
                
                {/* Caption (Only visible on hover) */}
                <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {photo.year && (
                    <span className="text-[11px] font-bold text-brand bg-brand/20 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">
                      {photo.year}
                    </span>
                  )}
                  <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* 📭 Empty State */
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed border-border rounded-2xl">
          <ImageIcon size={56} className="text-muted opacity-20 mb-4" />
          <h3 className="text-xl font-serif font-semibold text-foreground mb-2">No photos here yet</h3>
          <p className="text-muted">We haven't added photos to this category.</p>
        </div>
      )}

      {/* 👇 LIGHTBOX COMPONENT (Updated to pass the whole array and current index) 👇 */}
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