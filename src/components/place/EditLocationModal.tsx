"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinOff, X, Loader2, CheckCircle2, Search, Navigation, MapPin } from "lucide-react";

// 🎯 Map Center Tracker
function MapTracker({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

// 🗺️ Map Controller (Fly to location)
function MapFlyer({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }, [lat, lng, zoom, map]);
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
  
  // Location States
  const [center, setCenter] = useState({ lat: currentLat, lng: currentLng });
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Search Logic (OpenStreetMap Nominatim API)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    setFlyTo({ lat: parseFloat(result.lat), lng: parseFloat(result.lon), zoom: 17 });
    setShowResults(false);
    setSearchQuery(result.display_name);
  };

  // 📍 Get Current Location (GPS)
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFlyTo({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude, 
            zoom: 18 
          });
        },
        () => alert("Could not get your location. Please check browser permissions.")
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key daalein
    formData.append("subject", `Location Fix Required: ${landmarkName}`);
    formData.append("from_name", "Bandwar Map Visitor");
    
    // Core Data
    formData.append("landmark_name", landmarkName);
    formData.append("old_coordinates", `${currentLat}, ${currentLng}`);
    formData.append("new_lat", center.lat.toFixed(6));
    formData.append("new_lng", center.lng.toFixed(6));
    
    // Aapke liye direct Google Maps Link
    formData.append("google_maps_link", `https://www.google.com/maps?q=${center.lat.toFixed(6)},${center.lng.toFixed(6)}`);

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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full mt-1 text-xs flex items-center justify-center gap-1.5 text-muted hover:text-red-500 transition-colors py-1 rounded"
      >
        <MapPinOff size={14} /> Location is wrong?
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Full screen on mobile, modal on desktop */}
          <div className="bg-card w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background shrink-0">
              <h3 className="font-serif font-semibold text-foreground text-sm flex items-center gap-2">
                <MapPinOff size={16} className="text-red-500" />
                Fix Location: {landmarkName}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1.5 bg-background rounded-md transition-colors shadow-sm">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-0 flex flex-col flex-grow relative h-full sm:h-auto">
              {isSuccess ? (
                <div className="text-center py-20 px-6">
                  <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-xl font-bold text-foreground mb-2">Dhanyawad!</h4>
                  <p className="text-sm text-muted">Exact location has been sent to the editor for review.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow h-full sm:h-auto">
                  
                  {/* 🗺️ Map Container (Full height on mobile) */}
                  <div className="relative flex-grow min-h-[350px] sm:min-h-[300px] bg-muted-background">
                    <MapContainer 
                      center={[currentLat, currentLng]} 
                      zoom={16} 
                      style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
                      scrollWheelZoom={true}
                      zoomControl={false} // Hide default zoom to look clean
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      />
                      <MapTracker onCenterChange={(lat, lng) => setCenter({ lat, lng })} />
                      {flyTo && <MapFlyer lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
                    </MapContainer>

                    {/* 📌 Center Fixed Pin (Uber Style) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[400] pointer-events-none drop-shadow-2xl">
                      <div className="relative flex flex-col items-center">
                        <div className="bg-brand text-white p-2 rounded-full shadow-lg border-2 border-white mb-1">
                          <MapPin size={24} />
                        </div>
                        <div className="w-2 h-2 bg-black/40 rounded-full blur-[1px]"></div>
                      </div>
                    </div>

                    {/* 🔍 Search Bar (Overlay) */}
                    <div className="absolute top-4 left-4 right-4 z-[400]" ref={searchRef}>
                      <div className="relative shadow-lg rounded-xl overflow-hidden bg-background border border-border">
                        <form onSubmit={handleSearch} className="flex items-center">
                          <Search className="ml-3 text-muted shrink-0" size={18} />
                          <input 
                            type="text" 
                            placeholder="Search area, village, landmark..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent px-3 py-3 text-sm outline-none text-foreground"
                          />
                          <button type="submit" className="bg-brand/10 text-brand px-4 py-3 text-sm font-semibold hover:bg-brand/20 transition-colors">
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                          </button>
                        </form>
                        
                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {searchResults.map((res, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => selectSearchResult(res)}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted-background border-b border-border-subtle last:border-0 line-clamp-2"
                              >
                                {res.display_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🎯 GPS Button (Overlay) */}
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="absolute bottom-6 right-4 z-[400] bg-background p-3 rounded-full shadow-lg border border-border text-foreground hover:text-brand hover:bg-muted-background transition-colors"
                      title="Locate me"
                    >
                      <Navigation size={20} />
                    </button>
                  </div>

                  {/* 📝 Bottom Action Area */}
                  <div className="p-4 bg-card border-t border-border shrink-0 sm:rounded-b-2xl">
                    
                    {/* Live Coordinates */}
                    <div className="flex items-center justify-between text-xs mb-4 bg-muted-background p-2.5 rounded-lg border border-border">
                      <div>
                        <span className="text-muted block text-[10px] uppercase tracking-wider font-semibold mb-0.5">New Coordinates</span>
                        <span className="font-mono text-brand font-bold">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFlyTo({lat: currentLat, lng: currentLng, zoom: 16})}
                        className="text-muted hover:text-foreground text-[11px] underline"
                      >
                        Reset Map
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        name="note" 
                        placeholder="Any specific detail? (Optional)" 
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                      />
                      <button 
                        type="submit" 
                        disabled={isSubmitting || (center.lat === currentLat && center.lng === currentLng)}
                        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-sm"
                      >
                        {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Confirm Exact Location"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}