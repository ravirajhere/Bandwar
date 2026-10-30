"use client";

import { useState } from "react";
import Image from "next/image";
import { Media } from "@/lib/schema";
import { Lightbox } from "./Lightbox";
import { Image as ImageIcon } from "lucide-react";

type Photo = Media["gallery"]["photos"][0];
type Category = Media["gallery"]["categories"][0];

export function GalleryGrid({ photos, categories }: { photos: Photo[], categories: Category[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = activeTab === "all" 
    ? photos 
    : photos.filter(p => p.category === activeTab);

  return (
    <div>
      {/* 🏷️ Filter Tabs (Modern Pills) */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab("all")}
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
            onClick={() => setActiveTab(cat.id)}
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

      {/* 🖼️ Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
        {filteredPhotos.map((photo) => (
          <button 
            key={photo.id} 
            className="group flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-elevated transition-all duration-300 overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => setSelectedPhoto(photo)}
            aria-label={`View photo: ${photo.caption}`}
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted-background">
              <Image
                src={photo.src.startsWith("/") ? photo.src : `/${photo.src}`}
                alt={photo.caption}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Premium Hover Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                 <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                   <ImageIcon size={24} />
                 </div>
              </div>
            </div>
            
            {/* Caption Area */}
            <div className="p-4 flex-grow flex flex-col justify-start border-t border-border-subtle bg-card w-full">
              {photo.year && (
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider mb-1.5">
                  {photo.year}
                </span>
              )}
              <p className="text-[15px] text-foreground font-medium leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                {photo.caption}
              </p>
            </div>
          </button>
        ))}
      </div>
      
      {/* 📭 Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-xl">
          <ImageIcon size={48} className="text-muted opacity-30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No photos here yet</h3>
          <p className="text-muted text-[15px]">We haven't added photos to this category.</p>
        </div>
      )}

      {/* 👇 LIGHTBOX COMPONENT 👇 */}
      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}