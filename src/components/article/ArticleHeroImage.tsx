"use client";

import { useState, KeyboardEvent } from "react";
import Image from "next/image";
import { ImageUpdateButton } from "@/components/shared/ImageUpdateButton";
import { Lightbox } from "@/components/place/Lightbox";

interface ArticleHeroImageProps {
  hero: string;
  title: string;
  articleId: string;
  altText: string;
}

export function ArticleHeroImage({ hero, title, articleId, altText }: ArticleHeroImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const photoData = [{
    id: articleId,
    src: hero,
    caption: title,
    category: "article",
    year: new Date().getFullYear().toString(),
  }];

  // 🚀 Accessibility: Keyboard/TV Remote se open karne ke liye
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsLightboxOpen(true);
    }
  };

  return (
    <>
      <div className="relative w-full aspect-video md:aspect-[21/9] 3xl:aspect-[24/9] rounded-lg overflow-hidden shadow-md mb-10 bg-canvas group border border-divider">
        
        {/* 🖼️ Image Container (Clickable for Lightbox) */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Open image in fullscreen"
          className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent/50"
          onClick={() => setIsLightboxOpen(true)}
          onKeyDown={handleKeyDown}
        >
          <Image
            src={hero.startsWith("/") ? hero : `/${hero}`}
            alt={altText}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            priority
          />
          
          {/* Hover Overlay Hint */}
          <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-white text-sm font-medium bg-ink/80 px-5 py-2.5 rounded-md backdrop-blur-md border border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-all duration-300">
              View Full Size
            </span>
          </div>
        </div>

        {/* 🖊️ Edit Button (Z-index zyada hai, isliye click karne par Lightbox nahi khulega) */}
        <div className="absolute top-4 right-4 z-10 no-print opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <ImageUpdateButton 
            contextName={`Article: ${title}`} 
            contextId={articleId} 
            currentImage={hero} 
          />
        </div>
      </div>

      {/* Lightbox Render */}
      {isLightboxOpen && (
        <Lightbox 
          photos={photoData} 
          initialIndex={0} 
          onClose={() => setIsLightboxOpen(false)} 
        />
      )}
    </>
  );
}