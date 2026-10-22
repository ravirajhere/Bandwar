"use client";

import { useEffect } from "react";
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
  // 1. Background Scroll Rokna (Jab lightbox khula ho)
  useEffect(() => {
    if (photo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [photo]);

  // 2. 'Escape' dabane par band hona (Keyboard users ke liye)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8"
      onClick={onClose} // Background par click karne se band ho jaye
      role="dialog"
      aria-modal="true"
    >
      {/* Close Button */}
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors z-10"
        onClick={onClose}
        aria-label="Close Lightbox"
      >
        <X size={32} />
      </button>

      {/* Image Container */}
      <div 
        className="relative w-full max-w-6xl h-[60vh] sm:h-[75vh]" 
        onClick={(e) => e.stopPropagation()} // Image par click karne se na band ho
      >
        <Image
          src={`/${photo.src}`}
          alt={photo.caption}
          fill
          className="object-contain" // Photo apna shape maintain karegi
          sizes="100vw"
          quality={90} // Thoda high quality jab user zoom kare
          priority
        />
      </div>

      {/* Caption (Image ke neeche) */}
      <div 
        className="mt-4 text-center max-w-4xl bg-black/60 p-4 border border-white/10 rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.year && (
          <span className="text-gray-400 text-sm font-bold block mb-1 uppercase tracking-wider">
            {photo.year}
          </span>
        )}
        <p className="text-white text-base sm:text-lg leading-relaxed">
          {photo.caption}
        </p>
      </div>
    </div>
  );
}