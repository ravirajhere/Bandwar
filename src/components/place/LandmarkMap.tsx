"use client";

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";

// Next.js mein Leaflet ke default icons nahi dikhte, isliye custom icon bana rahe hain
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LandmarkMap({ landmarks }: { landmarks: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state (Wikipedia Style)
  if (!mounted) return (
    <div className="h-[500px] bg-wiki-bg-alt border border-wiki-border-light flex items-center justify-center text-wiki-text-muted">
      Loading Map...
    </div>
  );

  return (
    // Sharp borders, no rounded corners, Wiki styling
    <div className="h-[500px] w-full border border-wiki-border-light overflow-hidden z-0 relative">
      <MapContainer 
        center={[25.5009, 86.1606]} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        {/* 🛰️ Layer Control: Street vs Satellite */}
        <LayersControl position="topright">
          
          {/* 1. Default Street Map */}
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* 2. Satellite View (High Quality) */}
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        {/* Markers */}
        {landmarks.map((place) => (
          <Marker 
            key={place.id || place.name} 
            position={[place.lat, place.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-center font-sans">
                {place.icon && <div className="text-2xl mb-1">{place.icon}</div>}
                <h3 className="font-bold text-[15px] text-wiki-text m-0 leading-tight">
                  {place.name}
                </h3>
                {place.description && (
                  <p className="text-[13px] text-wiki-text-muted mt-1 mb-2 leading-snug">
                    {place.description}
                  </p>
                )}
                {place.article && (
                  <Link 
                    href={`/article/${place.article}`} 
                    className="inline-block text-[13px] text-wiki-link font-bold hover:underline mt-1"
                  >
                    Read Article →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}