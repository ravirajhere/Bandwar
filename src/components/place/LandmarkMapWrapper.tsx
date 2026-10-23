"use client";

import dynamic from "next/dynamic";

const LandmarkMap = dynamic(() => import("./LandmarkMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-wiki-bg-alt border border-wiki-border-light flex items-center justify-center text-wiki-text-muted">
      Loading Map Engine...
    </div>
  )
});

export default function LandmarkMapWrapper({ landmarks, activeLandmark }: { landmarks: any[], activeLandmark: any }) {
  return <LandmarkMap landmarks={landmarks} activeLandmark={activeLandmark} />;
}