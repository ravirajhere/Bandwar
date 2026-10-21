"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

  if (!mounted) return <div className="h-[500px] bg-[#efece4] animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>;

  // Village center roughly: 25.5009, 86.1606
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-[#1a1a18]/10 shadow-sm z-0 relative">
      <MapContainer 
        center={[25.5009, 86.1606]} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {landmarks.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="text-center font-sans">
                <div className="text-2xl mb-1">{place.icon}</div>
                <h3 className="font-bold text-sm text-[#1a1a18]">{place.name}</h3>
                <p className="text-xs text-[#1a1a18]/70 mt-1 mb-2">{place.description}</p>
                {place.article && (
                  <Link href={`/article/${place.article}`} className="text-xs text-[#a64b2a] font-bold hover:underline">
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