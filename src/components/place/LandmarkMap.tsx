"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditLocationModal } from "./EditLocationModal"; // 👈 Naya Import

// 🎨 Custom SVG Icon Generator
const createIcon = (category: string, iconEmoji?: string) => {
  const colors: Record<string, string> = {
    religion: "#ea580c",
    education: "#2563eb",
    infrastructure: "#16a34a",
    landmarks: "#dc2626",
    geography: "#0284c7",
  };
  const color = colors[category] || "#52525b";

  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        background-color: ${color}; 
        width: 32px; height: 32px; 
        border-radius: 50% 50% 50% 0; 
        transform: rotate(-45deg); 
        border: 3px solid white; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">
          ${iconEmoji || ""}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function MapController({ activeLandmark }: { activeLandmark: any }) {
  const map = useMap();
  useEffect(() => {
    if (activeLandmark) {
      map.flyTo([activeLandmark.lat, activeLandmark.lng], 17, { duration: 1.5 });
    }
  }, [activeLandmark, map]);
  return null;
}

export default function LandmarkMap({ landmarks, activeLandmark }: { landmarks: any[], activeLandmark: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-full min-h-[400px] w-full bg-muted-background border border-border flex items-center justify-center text-muted">
      Loading Satellite Map...
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden z-0 relative">
      <MapContainer 
        center={[25.5009, 86.1606]} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <MapController activeLandmark={activeLandmark} />

        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <MarkerClusterGroup chunkedLoading>
          {landmarks.map((place) => (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]}
              icon={createIcon(place.category, place.icon)}
            >
              <Popup>
                <div className="min-w-[220px] max-w-[260px] p-1">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl shrink-0 mt-0.5">{place.icon || "📍"}</span>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-foreground leading-tight m-0">
                        {place.name || place.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-brand uppercase tracking-wider">
                        {place.category}
                      </span>
                    </div>
                  </div>
                  
                  {place.description && (
                    <p className="text-sm text-foreground/80 mb-3 leading-snug">
                      {place.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
                    {place.article && (
                      <Link 
                        href={`/article/${place.article}`} 
                        className="text-sm text-brand font-semibold hover:underline flex items-center gap-1"
                      >
                        Read Full Article →
                      </Link>
                    )}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-brand hover:bg-brand-hover text-white font-medium px-3 py-2 rounded-lg text-center transition-colors shadow-sm"
                    >
                      Get Directions
                    </a>
                    
                    {/* 👇 Naya Button: Wrong Location Suggest */}
                    <EditLocationModal 
                      landmarkName={place.name || place.title} 
                      currentLat={place.lat} 
                      currentLng={place.lng} 
                    />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <style>{`
        .custom-map-pin { background: transparent; border: none; }
        .marker-cluster-small { background-color: rgba(22, 101, 52, 0.6) !important; }
        .marker-cluster-small div { background-color: #166534 !important; color: white; font-weight: bold; }
        .marker-cluster-medium { background-color: rgba(202, 138, 4, 0.6) !important; }
        .marker-cluster-medium div { background-color: #ca8a04 !important; color: white; font-weight: bold; }
        .leaflet-container { z-index: 0; }
        
        /* Popup close button ko thoda premium banaya hai */
        .leaflet-popup-close-button {
          color: #64748b !important;
          padding: 8px !important;
        }
      `}</style>
    </div>
  );
}