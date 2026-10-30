"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinOff, X, Loader2, CheckCircle2, Move } from "lucide-react";

// 📌 Custom Draggable Pin Icon
const draggableIcon = L.divIcon({
  className: "custom-drag-pin",
  html: `<div style="
      background-color: #166534; 
      width: 36px; height: 36px; 
      border-radius: 50%; 
      border: 4px solid white; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      cursor: grab;
  ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
      </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// 🗺️ Map Event Handler (Jab user map par click kare)
function MapEvents({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// 🔄 Map ko naye location par move karna
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

interface EditLocationModalProps {
  landmarkName: string;
  currentLat: number;
  currentLng: number;
}

export function EditLocationModal({ landmarkName, currentLat, currentLng }: EditLocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Naye coordinates ki state
  const [newLat, setNewLat] = useState(currentLat);
  const [newLng, setNewLng] = useState(currentLng);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key daalein
    formData.append("subject", `Location Fix Required: ${landmarkName}`);
    formData.append("from_name", "Bandwar Map Visitor");
    
    // Original aur New Coordinates aapko email me milenge
    formData.append("landmark_name", landmarkName);
    formData.append("old_lat", currentLat.toString());
    formData.append("old_lng", currentLng.toString());
    formData.append("new_lat", newLat.toFixed(6));
    formData.append("new_lng", newLng.toFixed(6));

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => setIsSuccess(false), 300);
        }, 3000);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Error sending request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🖊️ Trigger Button in Map Popup */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full mt-1 text-xs flex items-center justify-center gap-1.5 text-muted hover:text-red-500 transition-colors py-1 rounded"
      >
        <MapPinOff size={14} /> Location is wrong?
      </button>

      {/* 🪟 Advanced Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background">
              <h3 className="font-serif font-semibold text-foreground text-sm flex items-center gap-2">
                <MapPinOff size={16} className="text-red-500" />
                Suggest Exact Location
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1 rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-lg font-bold text-foreground mb-2">Dhanyawad!</h4>
                  <p className="text-sm text-muted">Your location correction has been sent to the editor for review.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-foreground/80">
                    Drag the <strong className="text-brand">Green Pin</strong> or tap anywhere on the map to set the exact location of <strong>{landmarkName}</strong>.
                  </p>

                  {/* 🗺️ Interactive Map Area */}
                  <div className="relative w-full h-[250px] rounded-xl overflow-hidden border border-border shadow-inner">
                    <MapContainer 
                      center={[newLat, newLng]} 
                      zoom={16} 
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      />
                      <MapEvents onLocationChange={(lat, lng) => { setNewLat(lat); setNewLng(lng); }} />
                      <MapUpdater lat={newLat} lng={newLng} />
                      <Marker 
                        position={[newLat, newLng]} 
                        icon={draggableIcon} 
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            setNewLat(position.lat);
                            setNewLng(position.lng);
                          }
                        }}
                      />
                    </MapContainer>
                    
                    {/* Overlay instructions */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-none">
                      <Move size={12} /> Drag pin to correct spot
                    </div>
                  </div>

                  {/* Coordinates Display */}
                  <div className="bg-muted-background border border-border rounded-lg p-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted block mb-1">Original (Wrong)</span>
                      <span className="font-mono text-red-500 line-through">{currentLat.toFixed(4)}, {currentLng.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-muted block mb-1">New (Correct)</span>
                      <span className="font-mono text-brand font-bold">{newLat.toFixed(4)}, {newLng.toFixed(4)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Additional Note (Optional)</label>
                    <input 
                      type="text" 
                      name="note" 
                      placeholder="E.g., The temple gate is actually on the main road." 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || (newLat === currentLat && newLng === currentLng)}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50 text-sm mt-2"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Submit Exact Location"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}