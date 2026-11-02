"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, ScaleControl, ZoomControl, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditLocationModal } from "./EditLocationModal";
import { MapLegend } from "./MapLegend";
import { ArrowUpRight, Navigation } from "lucide-react";

// 🏛️ Formal Category Config (Numbers + Muted Colors, No Emoji)
const CATEGORY_CONFIG: Record<string, { number: string; color: string; label: string }> = {
  religion: { number: "1", color: "#7C2D12", label: "Temple / Religious" },
  education: { number: "2", color: "#1E3A8A", label: "Education" },
  infrastructure: { number: "3", color: "#166534", label: "Infrastructure" },
  landmarks: { number: "4", color: "#991B1B", label: "Historical Landmark" },
  geography: { number: "5", color: "#075985", label: "Natural / Geography" },
};

// 📍 Formal Square Pin (No Emoji, Category Number)
const createIcon = (category: string) => {
  const config = CATEGORY_CONFIG[category] || { number: "•", color: "#334155" };
  
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        background-color: ${config.color};
        width: 22px; height: 22px;
        border: 2px solid var(--bg-surface);
        display: flex; align-items: center; justify-content: center;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 10px;
        font-weight: 700;
        color: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      ">
        ${config.number}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
};

// 🔍 Coordinate Tracker
function CoordinateDisplay({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMove(center.lat, center.lng);
    },
  });
  return null;
}

// 🎯 Controller for Panning (No FlyTo animation — instant)
function MapController({ activeLandmark }: { activeLandmark: any }) {
  const map = useMap();
  useEffect(() => {
    if (activeLandmark) {
      map.setView([activeLandmark.lat, activeLandmark.lng], 17, { animate: false });
    }
  }, [activeLandmark, map]);
  return null;
}

interface LandmarkMapProps {
  landmarks: any[];
  activeLandmark?: any;
  showLegend?: boolean;
  showScale?: boolean;
}

export default function LandmarkMap({ 
  landmarks, 
  activeLandmark, 
  showLegend = true,
  showScale = true 
}: LandmarkMapProps) {
  const [mounted, setMounted] = useState(false);
  const [centerCoords, setCenterCoords] = useState({ lat: 25.5009, lng: 86.1606 });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="h-full min-h-[400px] w-full bg-surface border border-divider flex items-center justify-center text-ink/60 text-sm">
      Loading cartographic data...
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden z-0 relative">
      
      <MapContainer 
        center={[25.5009, 86.1606]} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        className="z-0"
      >
        <MapController activeLandmark={activeLandmark} />
        <CoordinateDisplay onMove={(lat, lng) => setCenterCoords({ lat, lng })} />

        <TileLayer
          attribution='Satellite: Esri | Archive: Bandwar Village'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {showScale && <ScaleControl position="bottomright" imperial={false} />}
        <ZoomControl position="topright" />

        <MarkerClusterGroup chunkedLoading>
          {landmarks.map((place) => (
            <Marker 
              key={place.id || place.name} 
              position={[place.lat, place.lng]}
              icon={createIcon(place.category)}
            >
              <Popup className="custom-archive-popup" maxWidth={300}>
                <div className="min-w-[260px] p-0">
                  
                  {/* Formal Category Label */}
                  <div className="text-[9px] font-bold text-ink/50 uppercase tracking-[0.15em] mb-1 pb-1 border-b border-divider">
                    {CATEGORY_CONFIG[place.category]?.label || "Location"}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-serif font-bold text-base text-ink leading-tight m-0 mb-1.5 mt-1">
                    {place.name || place.title}
                  </h3>
                  
                  {/* Coordinates (Formal Data) */}
                  <div className="text-[9px] font-mono text-ink/40 mb-2 pb-2 border-b border-divider tracking-wide">
                    {place.lat.toFixed(5)}°N · {place.lng.toFixed(5)}°E
                  </div>
                  
                  {place.description && (
                    <p className="text-[12px] text-ink/70 mb-3 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                  
                  {/* Actions (Formal List, No Buttons Everywhere) */}
                  <div className="space-y-1.5 pt-1">
                    {place.article && (
                      <Link 
                        href={`/article/${place.article}`} 
                        className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1"
                      >
                        Read full article <ArrowUpRight size={10} />
                      </Link>
                    )}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1"
                    >
                      <Navigation size={10} /> Get directions
                    </a>
                    <EditLocationModal 
                      landmarkName={place.name || place.title} 
                      contextId={place.id || place.name || "unknown-landmark"} 
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

      {/* Formal Legend (bottom-left) */}
      {showLegend && <MapLegend categories={CATEGORY_CONFIG} />}

      {/* Coordinate Readout (bottom-right, above scale bar) */}
      <div className="absolute bottom-12 right-2 z-[400] bg-surface/95 backdrop-blur-sm border border-divider rounded-sm px-2 py-1 shadow-sm pointer-events-none">
        <div className="text-[9px] font-mono text-ink/60 leading-tight text-right">
          <div>{centerCoords.lat.toFixed(5)}°N</div>
          <div>{centerCoords.lng.toFixed(5)}°E</div>
        </div>
      </div>

      <style>{`
        .custom-map-pin { background: transparent; border: none; }
        
        /* Formal Cluster Colors (Muted Charcoal) */
        .marker-cluster-small { background-color: rgba(32, 33, 34, 0.5) !important; }
        .marker-cluster-small div { 
          background-color: #202122 !important; 
          color: white; 
          font-weight: 600; 
          font-family: Georgia, serif; 
        }
        
        .marker-cluster-medium { background-color: rgba(32, 33, 34, 0.6) !important; }
        .marker-cluster-medium div { 
          background-color: #202122 !important; 
          color: white; 
          font-weight: 600; 
          font-family: Georgia, serif; 
        }
        
        .leaflet-container { 
          z-index: 0; 
          font-family: inherit;
          background: var(--bg-canvas);
        }
        
        /* Formal Popup */
        .leaflet-popup-content-wrapper {
          border-radius: 2px !important;
          border: 1px solid var(--border-divider) !important;
          background-color: var(--bg-surface) !important;
          color: var(--text-ink) !important;
          padding: 0 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-content { 
          margin: 12px 14px !important; 
          line-height: 1.4 !important;
        }
        .leaflet-popup-tip {
          background-color: var(--bg-surface) !important;
          border: 1px solid var(--border-divider) !important;
          box-shadow: none !important;
        }
        .leaflet-popup-close-button { 
          color: var(--text-ink-muted) !important; 
          padding: 8px !important; 
          font-size: 18px !important;
        }
        .leaflet-popup-close-button:hover {
          color: var(--text-ink) !important;
        }
        
        /* Formal Scale Bar */
        .leaflet-control-scale {
          margin-bottom: 8px !important;
          margin-right: 8px !important;
        }
        .leaflet-control-scale-line {
          background-color: var(--bg-surface) !important;
          border-color: var(--border-divider) !important;
          color: var(--text-ink) !important;
          font-family: 'IBM Plex Mono', monospace !important;
          font-size: 9px !important;
          padding: 1px 4px !important;
          line-height: 1.2 !important;
        }
        
        /* Formal Zoom Controls */
        .leaflet-control-zoom {
          border-radius: 2px !important;
          border: 1px solid var(--border-divider) !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          background-color: var(--bg-surface) !important;
          color: var(--text-ink) !important;
          border-bottom: 1px solid var(--border-divider) !important;
          font-family: Georgia, serif !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: var(--bg-canvas) !important;
        }
      `}</style>
    </div>
  );
}