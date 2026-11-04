"use client";

import { useState, useEffect } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Handle short pages where scroll height is 0
      if (scrollHeight > 0) {
        const scrolled = (currentScroll / scrollHeight) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled)));
      } else {
        setProgress(0);
      }
      ticking = false;
    };

    const onScroll = () => {
      // 🚀 PERFORMANCE FIX: Throttle scroll events using requestAnimationFrame
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initialize progress on mount
    updateScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // 🚀 A11Y FIX: aria-hidden="true" because it's purely a visual indicator
    <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent no-print" aria-hidden="true">
      <div 
        className="h-full bg-accent transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}