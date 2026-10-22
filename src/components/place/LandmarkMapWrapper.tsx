"use client";

import dynamic from "next/dynamic";

const LandmarkMap = dynamic(() => import("./LandmarkMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-wiki-bg-alt border border-wiki-border-light flex items-center justify-center text-wiki-text-muted text-[15px]">
      Loading Map...
    </div>
  )
});

export default function LandmarkMapWrapper({ landmarks }: { landmarks: any[] }) {
  return <LandmarkMap landmarks={landmarks} />;
}