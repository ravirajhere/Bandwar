"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditLocationModal } from "./EditLocationModal"; 
import { AddLandmarkModal } from "./AddLandmarkModal"; 

// 🎨 Custom SVG Icon Generator (Muted, Formal Colors)
const createIcon = (category: string, iconEmoji?: string) => {
  const colors: Record<string, string> = {
    religion: "#b45309",        // Amber-700
    education: "#1d4ed8",       // Blue-700
    infrastructure: "#15803d",  // Green-700
    landmarks: "#b91c1c",       // Red-700
    geography: "#0369a1",       // Sky-700
  };
  const color = colors[category] || "#334155"; // Slate-700

  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        background-color: ${color}; width: 34px; height: 34px; 
        border-radius: 50% 50% 50% 0; transform: rotate(-45deg); 
        border: 3px solid var(--bg-surface); box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 15px; line-height: 1;">${iconEmoji || "📍"}</span>
      </div>
    `,
    iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -34],
  });
};

// 🎬 Controller for Fly-To Animation
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

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="h-full min-h-[400px] w-full bg-surface border border-divider flex items-center justify-center text-ink/60">
      Initializing Satellite Map...
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden z-0 relative">
      
      <AddLandmarkModal />

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
              <Popup className="custom-archive-popup">
                <div className="min-w-[240px] max-w-[280px] 3xl:min-w-[320px] 3xl:max-w-[380px] p-1">
                  
                  {/* Popup Header */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <span className="text-xl 3xl:text-2xl shrink-0 mt-0.5">{place.icon || "📍"}</span>
                    <div>
                      <h3 className="font-serif font-bold text-base 3xl:text-lg text-ink leading-tight m-0">
                        {place.name || place.title}
                      </h3>
                      <span className="text-[10px] 3xl:text-xs font-semibold text-accent uppercase tracking-wider mt-0.5 block">
                        {place.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Popup Description */}
                  {place.description && (
                    <p className="text-[13px] 3xl:text-sm text-ink/80 mb-3 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                  
                  {/* Popup Actions */}
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-divider">
                    {place.article && (
                      <Link 
                        href={`/article/${place.article}`} 
                        className="text-[13px] 3xl:text-sm text-accent font-semibold hover:text-accent-hover hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                      >
                        Read Full Article →
                      </Link>
                    )}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] 3xl:text-sm bg-accent hover:bg-accent-hover text-white font-medium px-3 py-2 rounded-md text-center transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Get Directions
                    </a>
                    
                    <div className="flex justify-center mt-1">
                      <EditLocationModal 
                        landmarkName={place.name || place.title} 
                        contextId={place.id || place.name || "unknown-landmark"} 
                        currentLat={place.lat} 
                        currentLng={place.lng} 
                      />
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <style>{`
        .custom-map-pin { background: transparent; border: none; }
        
        /* Cluster Colors matching new theme */
        .marker-cluster-small { background-color: rgba(22, 101, 52, 0.6) !important; }
        .marker-cluster-small div { background-color: #166534 !important; color: white; font-weight: bold; }
        
        .marker-cluster-medium { background-color: rgba(202, 138, 4, 0.6) !important; }
        .marker-cluster-medium div { background-color: #ca8a04 !important; color: white; font-weight: bold; }
        
        .leaflet-container { z-index: 0; }
        
        /* Popup Close Button Color */
        .leaflet-popup-close-button { 
          color: var(--text-ink-muted) !important; 
          padding: 12px !important; 
          transition: color 0.2s ease;
        }
        .leaflet-popup-close-button:hover {
          color: var(--text-ink) !important;
        }
      `}</style>
    </div>
  );
}