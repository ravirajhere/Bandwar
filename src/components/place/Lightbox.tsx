"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface LightboxProps {
  photo: {
    src: string;
    caption: string;
    year?: string;
  } | null;
  onClose: () => void;
}

export function Lightbox({ photo, onClose }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 1. Background Scroll Rokna
  useEffect(() => {
    if (photo) {
      document.body.style.overflow = "hidden";
      // Focus the close button when opened for accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [photo]);

  // 2. 'Escape' dabane par band hona
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (photo) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, onClose]);

  if (!photo) return null;

  // 🛡️ Safe Image Path Logic (Handles both internal and external links)
  const imageSrc = photo.src.startsWith("http") || photo.src.startsWith("/") 
    ? photo.src 
    : `/${photo.src}`;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image Viewer"
    >
      {/* ❌ Premium Close Button */}
      <button 
        ref={closeButtonRef}
        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-2.5 md:p-3 rounded-full transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        onClick={onClose}
        aria-label="Close Lightbox"
      >
        <X size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
      </button>

      {/* 🖼️ Main Image Container */}
      <div 
        className="relative w-full max-w-7xl h-[65vh] md:h-[80vh] flex items-center justify-center" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
      >
        <Image
          src={imageSrc}
          alt={photo.caption}
          fill
          className="object-contain drop-shadow-2xl" 
          sizes="100vw"
          quality={95}
          priority
        />
      </div>

      {/* 📝 Premium Glassmorphism Caption Box */}
      <div 
        className="mt-6 text-center max-w-4xl bg-black/50 backdrop-blur-lg border border-white/10 p-4 md:p-6 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.year && (
          <span className="inline-block bg-white/10 text-white/90 text-[11px] md:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            {photo.year}
          </span>
        )}
        <p className="text-white/90 text-base md:text-lg leading-relaxed font-medium">
          {photo.caption}
        </p>
      </div>
    </div>
  );
}