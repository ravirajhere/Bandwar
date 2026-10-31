"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Media } from "@/lib/schema";

type Photo = Media["gallery"]["photos"][0];

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // State for Touch/Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Sync state if initialIndex changes externally
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // 1. Navigation Logic
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  // 2. Background Scroll Lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => closeButtonRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // 3. Keyboard Navigation (Left, Right, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleNext, handlePrev]);

  // 4. Mobile Swipe Logic
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  
  // Safe Image Path Logic
  const imageSrc = currentPhoto.src.startsWith("http") || currentPhoto.src.startsWith("/") 
    ? currentPhoto.src 
    : `/${currentPhoto.src}`;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      {/* 🟢 HEADER (Counter & Close) */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        
        {/* 👇 Counter (Sirf tab dikhega jab 1 se zyada photos hongi) 👇 */}
        {photos.length > 1 ? (
          <div className="text-white/80 font-medium text-sm md:text-base bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            {currentIndex + 1} / {photos.length}
          </div>
        ) : (
          <div></div> // Empty div to keep flex-between layout intact
        )}

        {/* Close Button */}
        <button 
          ref={closeButtonRef}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-2.5 md:p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          onClick={onClose}
          aria-label="Close Lightbox"
        >
          <X size={24} className="md:w-6 md:h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* 🖼️ MAIN IMAGE CONTAINER */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
        onClick={onClose} // Clicking background closes
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Image wrapper to stop click propagation */}
        <div 
          className="relative w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            key={currentPhoto.id} // Key forces re-render on change
            src={imageSrc}
            alt={currentPhoto.caption}
            fill
            className="object-contain drop-shadow-2xl animate-in zoom-in-95 duration-300" 
            sizes="100vw"
            quality={95}
            priority
          />
        </div>

        {/* Desktop Navigation Arrows (Sirf tab dikhenge jab 1 se zyada photos hongi) */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-4 rounded-full backdrop-blur-md border border-white/10 transition-all z-50"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-4 rounded-full backdrop-blur-md border border-white/10 transition-all z-50"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* 📝 BOTTOM CAPTION */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex justify-center z-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
        <div 
          className="text-center max-w-3xl pointer-events-auto bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-5 rounded-2xl shadow-2xl transform transition-all animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {(currentPhoto.year || currentPhoto.category) && (
            <div className="flex items-center justify-center gap-2 mb-2">
              {currentPhoto.year && (
                <span className="bg-brand text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentPhoto.year}
                </span>
              )}
              {currentPhoto.category && (
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  {currentPhoto.category}
                </span>
              )}
            </div>
          )}
          <p className="text-white text-base md:text-lg leading-snug font-medium">
            {currentPhoto.caption}
          </p>
        </div>
      </div>
    </div>
  );
}