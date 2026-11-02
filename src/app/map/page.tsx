import { getMediaData } from "@/lib/data";
import { MapClient } from "./MapClient";
import { MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Map | Bandwar Portal",
  description: "Explore the cartographic index of Bandwar village — temples, schools, infrastructure, and landmarks.",
};

export default function MapPage() {
  const media = getMediaData();
  const landmarks = media.landmarks || [];

  return (
    <div className="bg-canvas min-h-screen py-8 md:py-12 flex flex-col">
      <div className="container mx-auto px-4 md:px-0 max-w-[1400px] flex-grow flex flex-col">
        
        {/* Header */}
        <div className="mb-6 shrink-0">
          <nav className="flex items-center gap-2 text-sm text-ink-muted mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight size={14} className="text-divider shrink-0" />
            <span className="text-ink font-medium">Village Map</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-divider pb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-ink font-bold flex items-center gap-3">
                <MapPin className="text-accent" size={32} /> Cartographic Index
              </h1>
              <p className="text-ink-muted mt-2 max-w-2xl text-sm md:text-base">
                A complete spatial record of Bandwar's landmarks, institutions, and religious sites. Click on any location to view details or get directions.
              </p>
            </div>
          </div>
        </div>

        {/* Main Map Interface */}
        <div className="flex-grow">
          <MapClient landmarks={landmarks} />
        </div>

      </div>
    </div>
  );
}