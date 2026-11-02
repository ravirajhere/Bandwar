"use client";

import { useState } from "react";
import LandmarkMapWrapper from "@/components/map/LandmarkMapWrapper";
import { MapIndex } from "@/components/map/MapIndex";

export function MapClient({ landmarks }: { landmarks: any[] }) {
  const [activeLandmark, setActiveLandmark] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 md:gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* Left Sidebar: Index */}
      <div className="h-full">
        <MapIndex 
          landmarks={landmarks} 
          activeLandmarkId={activeLandmark?.id} 
          onSelect={(l) => setActiveLandmark(l)} 
        />
      </div>

      {/* Right Side: Map */}
      <div className="h-full border border-divider rounded-sm overflow-hidden shadow-sm">
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