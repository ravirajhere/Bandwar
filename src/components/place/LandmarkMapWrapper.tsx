"use client";

import dynamic from "next/dynamic";

const LandmarkMap = dynamic(() => import("./LandmarkMap"), {
  ssr: false,
  loading: () => (
    // ✅ Naye design tokens use kiye hain
    <div className="h-full min-h-[400px] w-full bg-muted-background border border-border rounded-xl flex flex-col items-center justify-center text-muted">
      <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin mb-4"></div>
      <span className="font-medium text-sm">Loading Satellite Map...</span>
    </div>
  )
});

export default function LandmarkMapWrapper({ landmarks, activeLandmark }: { landmarks: any[], activeLandmark: any }) {
  return <LandmarkMap landmarks={landmarks} activeLandmark={activeLandmark} />;
}