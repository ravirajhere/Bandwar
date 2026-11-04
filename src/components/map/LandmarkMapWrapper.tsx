"use client";

import dynamic from "next/dynamic";

const LandmarkMap = dynamic(() => import("./LandmarkMap"), {
  ssr: false,
  loading: () => (
    <div 
      className="h-full w-full min-h-[400px] bg-surface border border-divider rounded-sm flex flex-col items-center justify-center text-ink/60 shadow-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading map"
    >
      <div 
        className="w-8 h-8 border-2 border-divider border-t-accent rounded-full animate-spin mb-3" 
        aria-hidden="true"
      ></div>
      <span className="font-mono text-xs tracking-wider uppercase">
        Initializing Map...
      </span>
    </div>
  )
});

interface LandmarkMapWrapperProps {
  landmarks: Array<{
    id?: string;
    title?: string;
    name?: string;
    lat: number;
    lng: number;
    icon?: string;
    description?: string;
    category?: string;
    [key: string]: any;
  }>;
  activeLandmark: string | null;
  showLegend?: boolean;
  showScale?: boolean;
}

export default function LandmarkMapWrapper({ 
  landmarks, 
  activeLandmark,
  showLegend = true,
  showScale = true
}: LandmarkMapWrapperProps) {
  return (
    <LandmarkMap 
      landmarks={landmarks} 
      activeLandmark={activeLandmark} 
      showLegend={showLegend} 
      showScale={showScale} 
    />
  );
}