"use client";

import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";

interface MapIndexProps {
  landmarks: any[];
  activeLandmarkId: string | null;
  onSelect: (landmark: any) => void;
}

export function MapIndex({ landmarks, activeLandmarkId, onSelect }: MapIndexProps) {
  const [search, setSearch] = useState("");

  const filteredLandmarks = useMemo(() => {
    return landmarks
      .filter(l => {
        const name = l.name || l.title || "";
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const nameA = (a.name || a.title || "").toLowerCase();
        const nameB = (b.name || b.title || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [landmarks, search]);

  return (
    <div className="flex flex-col h-full bg-surface border border-divider rounded-sm">
      
      {/* Header & Search */}
      <div className="p-4 border-b border-divider bg-canvas/50 shrink-0">
        <h2 className="font-serif font-bold text-ink text-lg mb-3">Landmark Index</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" size={14} />
          <input
            type="text"
            placeholder="Filter locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-divider rounded-sm text-xs focus:outline-none focus:border-accent text-ink"
          />
        </div>
      </div>

      {/* Index List */}
      <div className="overflow-y-auto flex-grow p-2 space-y-0.5 custom-scrollbar">
        {filteredLandmarks.length === 0 ? (
          <p className="text-center text-xs text-ink-muted py-8">No locations found.</p>
        ) : (
          filteredLandmarks.map((l) => {
            const name = l.name || l.title;
            const isActive = activeLandmarkId === l.id;

            return (
              <button
                key={l.id || name}
                onClick={() => onSelect(l)}
                className={`w-full text-left flex items-start gap-2.5 p-2 rounded-sm transition-colors border-l-2 ${
                  isActive 
                    ? "bg-accent/5 border-accent text-accent" 
                    : "border-transparent text-ink hover:bg-canvas hover:text-accent"
                }`}
              >
                <MapPin size={14} className={`shrink-0 mt-0.5 ${isActive ? "text-accent" : "text-ink/30"}`} />
                <div className="min-w-0">
                  <div className={`text-sm font-semibold leading-tight truncate ${isActive ? "text-accent" : ""}`}>
                    {name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-ink/50 mt-0.5">
                    {l.category}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-divider bg-canvas shrink-0 text-center">
        <p className="text-[10px] text-ink/50 uppercase tracking-wider">
          {filteredLandmarks.length} Locations Mapped
        </p>
      </div>
    </div>
  );
}