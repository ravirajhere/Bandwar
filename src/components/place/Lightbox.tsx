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
  const modalRef = useRef<HTMLDivElement>(null);
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

  // 2. Background Scroll Lock & Auto-focus
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Timeout ensures the modal is rendered before focusing
    setTimeout(() => closeButtonRef.current?.focus(), 100);
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // 3. Keyboard Navigation & Focus Trap (Accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      
      // 🚀 FOCUS TRAP LOGIC
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
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
  
  const imageSrc = currentPhoto.src.startsWith("http") || currentPhoto.src.startsWith("/") 
    ? currentPhoto.src 
    : `/${currentPhoto.src}`;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      {/* 🟢 HEADER (Counter & Close) */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-ink/90 to-transparent">
        
        {photos.length > 1 ? (
          <div className="text-white/90 font-medium text-sm md:text-base bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 tabular-nums tracking-wide">
            {currentIndex + 1} <span className="text-white/40 mx-1">/</span> {photos.length}
          </div>
        ) : (
          <div></div> 
        )}

        <button 
          ref={closeButtonRef}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-3 md:p-3.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          onClick={onClose}
          aria-label="Close Lightbox"
        >
          <X size={24} className="md:w-6 md:h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* 🖼️ MAIN IMAGE CONTAINER */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 3xl:p-20"
        onClick={onClose} 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="relative w-full h-full max-w-7xl 3xl:max-w-[2000px] max-h-[85vh] 3xl:max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            key={currentPhoto.id} 
            src={imageSrc}
            alt={currentPhoto.caption}
            fill
            className="object-contain drop-shadow-2xl animate-in zoom-in-95 duration-300" 
            sizes="100vw"
            quality={90}
            priority
          />
        </div>

        {/* Desktop Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="hidden md:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-ink/50 hover:bg-ink/80 p-3.5 xl:p-4 rounded-full backdrop-blur-md border border-white/10 transition-all z-[105] focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="hidden md:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-ink/50 hover:bg-ink/80 p-3.5 xl:p-4 rounded-full backdrop-blur-md border border-white/10 transition-all z-[105] focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* 📝 BOTTOM CAPTION */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex justify-center z-[105] bg-gradient-to-t from-ink/95 via-ink/60 to-transparent pointer-events-none">
        <div 
          className="text-center max-w-4xl 3xl:max-w-5xl pointer-events-auto bg-ink/60 backdrop-blur-xl border border-white/20 px-6 py-4 md:px-8 md:py-5 rounded-lg shadow-2xl transform transition-all animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {(currentPhoto.year || currentPhoto.category) && (
            <div className="flex items-center justify-center gap-3 mb-2.5">
              {currentPhoto.year && (
                <span className="bg-accent text-white text-[11px] md:text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  {currentPhoto.year}
                </span>
              )}
              {currentPhoto.category && (
                <span className="text-white/60 text-xs md:text-sm font-semibold uppercase tracking-wider">
                  {currentPhoto.category}
                </span>
              )}
            </div>
          )}
          <p className="text-white text-base md:text-lg 3xl:text-xl leading-relaxed font-medium">
            {currentPhoto.caption}
          </p>
        </div>
      </div>
    </div>
  );
}