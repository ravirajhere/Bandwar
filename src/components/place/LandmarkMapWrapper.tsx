"use client";

import dynamic from "next/dynamic";

const LandmarkMap = dynamic(() => import("./LandmarkMap"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-[#efece4] animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

export default function LandmarkMapWrapper({ landmarks }: { landmarks: any[] }) {
  return <LandmarkMap landmarks={landmarks} />;
}