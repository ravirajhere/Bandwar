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
      {/* 🏷️ Filter Tabs (Strict Toolbar) */}
      <div className="sticky top-16 md:top-20 3xl:top-24 z-30 bg-canvas border-b border-divider py-3 mb-6">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide">
          <button
            onClick={() => { setActiveTab("all"); setSelectedIndex(null); }}
            className={`whitespace-nowrap px-4 py-1.5 rounded-sm text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === "all" 
                ? "bg-accent text-white border-accent" 
                : "bg-surface text-ink-muted border-divider hover:bg-canvas hover:text-ink"
            }`}
          >
            All Photos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab(cat.id); setSelectedIndex(null); }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-sm text-sm font-medium transition-colors border flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeTab === cat.id 
                  ? "bg-accent text-white border-accent" 
                  : "bg-surface text-ink-muted border-divider hover:bg-canvas hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className="opacity-80">{cat.icon}</span>
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* 🖼️ Strict Masonry Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 3xl:columns-5 gap-3 md:gap-4 space-y-3 md:space-y-4">
          {filteredPhotos.map((photo, index) => (
            <button 
              key={photo.id} 
              className="group relative w-full break-inside-avoid bg-surface rounded-sm overflow-hidden border border-divider hover:border-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent block text-left"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View photo: ${photo.caption}`}
            >
              {/* Image Container */}
              <div className="relative w-full overflow-hidden bg-canvas">
                <Image
                  src={photo.src.startsWith("/") ? photo.src : `/${photo.src}`}
                  alt={photo.caption}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                />
              </div>

              {/* Clean Hover Overlay (No gradients) */}
              <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex flex-col justify-between p-3">
                
                {/* Top Right Icon */}
                <div className="flex justify-end">
                  <Maximize2 size={16} className="text-white/70" />
                </div>
                
                {/* Bottom Caption */}
                <div>
                  {photo.year && (
                    <span className="text-[10px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider mb-1 inline-block">
                      {photo.year}
                    </span>
                  )}
                  <p className="text-white text-xs md:text-sm font-medium leading-snug line-clamp-2 m-0">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* 📭 Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-divider rounded-sm">
          <ImageIcon size={48} className="text-ink/20 mb-3" />
          <h3 className="text-lg font-serif font-bold text-ink mb-1">No photographs found</h3>
          <p className="text-ink-muted text-sm">There are no photos in this category yet.</p>
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