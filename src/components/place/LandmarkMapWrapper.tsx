"use client";

import dynamic from "next/dynamic";

const LandmarkMap = dynamic(() => import("./LandmarkMap"), {
  ssr: false,
  loading: () => (
    // ✅ Loading State with New Design Tokens & Accessibility
    <div 
      className="h-full min-h-[400px] 3xl:min-h-[700px] w-full bg-surface border border-divider rounded-lg flex flex-col items-center justify-center text-ink/60 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-10 h-10 3xl:w-14 3xl:h-14 border-4 border-divider border-t-accent rounded-full animate-spin mb-4 3xl:mb-6"></div>
      <span className="font-medium text-sm 3xl:text-lg tracking-wide">Initializing Village Map...</span>
    </div>
  )
});

export default function LandmarkMapWrapper({ landmarks, activeLandmark }: { landmarks: any[], activeLandmark: any }) {
  return <LandmarkMap landmarks={landmarks} activeLandmark={activeLandmark} />;
}