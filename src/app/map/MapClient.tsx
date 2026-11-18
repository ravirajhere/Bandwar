"use client";

import { useState } from "react";
import LandmarkMapWrapper from "@/components/map/LandmarkMapWrapper";
import { MapIndex, IndexLandmark } from "@/components/map/MapIndex";
import { Map as MapIcon, List } from "lucide-react";

interface MapClientProps {
  landmarks: IndexLandmark[];
}

export function MapClient({ landmarks }: MapClientProps) {
  const [activeLandmark, setActiveLandmark] = useState<IndexLandmark | null>(null);
  // 🚀 Mobile View State: Default map dikhega
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:h-[calc(100vh-200px)] lg:min-h-[600px]">
      
      {/* 🚀 Mobile Tabs (Sirf mobile par dikhega) */}
      <div className="lg:hidden flex items-center bg-surface border border-divider rounded-sm p-1 mb-2 shrink-0">
        <button
          onClick={() => setMobileView("map")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-sm transition-colors ${
            mobileView === "map" ? "bg-accent text-white shadow-sm" : "text-ink-muted hover:bg-canvas"
          }`}
        >
          <MapIcon size={16} /> Map View
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-sm transition-colors ${
            mobileView === "list" ? "bg-accent text-white shadow-sm" : "text-ink-muted hover:bg-canvas"
          }`}
        >
          <List size={16} /> Landmark Index
        </button>
      </div>

      {/* Left Sidebar: Index (List) */}
      <div className={`w-full lg:w-[320px] h-[60vh] lg:h-full shrink-0 ${
        mobileView === "list" ? "block" : "hidden lg:block"
      }`}>
        <MapIndex 
          landmarks={landmarks} 
          activeLandmarkId={activeLandmark?.id || null} 
          onSelect={(l) => {
            setActiveLandmark(l);
            // 🚀 Mobile par list se select karne par auto-switch to Map
            setMobileView("map"); 
          }} 
        />
      </div>

      {/* Right Side: Map */}
      <div className={`w-full h-[60vh] lg:h-full border border-divider rounded-sm overflow-hidden shadow-sm relative z-0 ${
        mobileView === "map" ? "block" : "hidden lg:block"
      }`}>
        <LandmarkMapWrapper 
          landmarks={landmarks} 
          activeLandmark={activeLandmark} 
          showLegend={true}
          showScale={true}
        />
      </div>

    </div>
  );
}