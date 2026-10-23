"use client";

import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";

// Custom SVG Icon Generator based on Category
const createIcon = (category: string) => {
  const colors: Record<string, string> = {
    religion: "#ea580c", // Orange for Temples
    education: "#2563eb", // Blue for Schools
    infrastructure: "#16a34a", // Green for Bank/Pumps
    landmarks: "#dc2626", // Red for Memorials
    geography: "#0284c7", // Light Blue for River
  };
  const color = colors[category] || "#52525b";

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to handle Fly-To animation
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
    <div className="h-[600px] w-full bg-wiki-bg-alt border border-wiki-border-light flex items-center justify-center text-wiki-text-muted">
      Loading Advanced Map...
    </div>
  );

  return (
    <div className="h-[600px] w-full border border-wiki-border-light overflow-hidden z-0 relative">
      <MapContainer 
        center={[25.5009, 86.1606]} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <MapController activeLandmark={activeLandmark} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Marker Clustering */}
        <MarkerClusterGroup chunkedLoading>
          {landmarks.map((place) => (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]}
              icon={createIcon(place.category)}
            >
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{place.icon}</span>
                    <h3 className="font-bold text-[15px] text-wiki-text m-0 leading-tight">
                      {place.name}
                    </h3>
                  </div>
                  
                  {place.description && (
                    <p className="text-[13px] text-wiki-text-muted mb-3 leading-snug">
                      {place.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200">
                    {place.article && (
                      <Link 
                        href={`/article/${place.article}`} 
                        className="text-[13px] text-wiki-link font-bold hover:underline"
                      >
                        Read Full Article →
                      </Link>
                    )}
                    {/* 1-Click Navigation */}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] bg-blue-50 text-blue-700 font-bold px-2 py-1.5 rounded-sm hover:bg-blue-100 text-center transition-colors"
                    >
                      📍 Get Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Custom CSS for Clustering and Popups */}
      <style>{`
        .custom-div-icon { background: transparent; border: none; }
        .leaflet-popup-content-wrapper { padding: 0; border-radius: 4px; overflow: hidden; }
        .leaflet-popup-content { margin: 12px; }
        .marker-cluster-small { background-color: rgba(37, 99, 235, 0.6) !important; }
        .marker-cluster-small div { background-color: rgba(37, 99, 235, 0.9) !important; color: white; font-weight: bold; }
        .marker-cluster-medium { background-color: rgba(234, 88, 12, 0.6) !important; }
        .marker-cluster-medium div { background-color: rgba(234, 88, 12, 0.9) !important; color: white; font-weight: bold; }
      `}</style>
    </div>
  );
}