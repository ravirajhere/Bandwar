"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPinOff, X, Loader2, CheckCircle2, Search, Navigation, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/Toast"; 

function MapTracker({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

function MapFlyer({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }, [lat, lng, zoom, map]);
  return null;
}

interface EditLocationModalProps {
  landmarkName: string;
  contextId: string; // 👈 Naya Prop: JSON generate karne ke liye (e.g., "shaheed-dwar")
  currentLat: number;
  currentLng: number;
}

export function EditLocationModal({ landmarkName, contextId, currentLat, currentLng }: EditLocationModalProps) {
  const { toast } = useToast(); 

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [center, setCenter] = useState({ lat: currentLat, lng: currentLng });
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      toast("Failed to search location. Try again.", "error"); 
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    setFlyTo({ lat: parseFloat(result.lat), lng: parseFloat(result.lon), zoom: 17 });
    setShowResults(false);
    setSearchQuery(result.display_name);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFlyTo({ lat: position.coords.latitude, lng: position.coords.longitude, zoom: 18 });
          toast("Location found!", "success"); 
        },
        () => toast("Could not get your location. Check permissions.", "error") 
      );
    } else {
      toast("Geolocation is not supported by this browser.", "error"); 
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // 👇 Telegram API ke liye zaroori data append karna 👇
    formData.append("type", "Map Location Update");
    formData.append("contextId", contextId); // JSON generator isko use karega
    formData.append("Landmark Name", landmarkName);
    formData.append("old_lat", currentLat.toString());
    formData.append("old_lng", currentLng.toString());
    formData.append("new_lat", center.lat.toFixed(6));
    formData.append("new_lng", center.lng.toFixed(6));
    formData.append("Google Maps Link", `https://www.google.com/maps?q=${center.lat.toFixed(6)},${center.lng.toFixed(6)}`);

    // User ka naam (Credit ke liye)
    const submittedName = formData.get("submitter_name") as string;
    formData.append("submitterName", submittedName || "Anonymous Visitor");

    try {
      // 📱 Telegram par bhej rahe hain
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Location updated successfully! Sent to Telegram.", "success"); 
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => setIsSuccess(false), 300);
        }, 3000);
      } else {
        toast(data.details || "Something went wrong. Please try again.", "error"); 
      }
    } catch (error) {
      toast("Error sending request. Check your connection.", "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal ka content
  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background shrink-0">
          <h3 className="font-serif font-semibold text-foreground text-sm flex items-center gap-2 truncate pr-4">
            <MapPinOff size={16} className="text-red-500 shrink-0" />
            Fix Location: {landmarkName}
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1.5 bg-background rounded-md transition-colors shadow-sm shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-0 flex flex-col flex-grow relative h-full sm:h-auto">
          {isSuccess ? (
            <div className="text-center py-20 px-6">
              <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
              <h4 className="text-xl font-bold text-foreground mb-2">Dhanyawad!</h4>
              <p className="text-sm text-muted">Exact location has been sent to the editor's Telegram.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow h-full sm:h-auto">
              
              {/* Map Container */}
              <div className="relative flex-grow min-h-[300px] sm:min-h-[250px] bg-muted-background">
                <MapContainer 
                  center={[currentLat, currentLng]} 
                  zoom={16} 
                  style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
                  scrollWheelZoom={true}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                  <MapTracker onCenterChange={(lat, lng) => setCenter({ lat, lng })} />
                  {flyTo && <MapFlyer lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
                </MapContainer>

                {/* Fixed Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[400] pointer-events-none drop-shadow-2xl">
                  <div className="relative flex flex-col items-center">
                    <div className="bg-brand text-white p-2.5 rounded-full shadow-lg border-2 border-white mb-1">
                      <MapPin size={26} />
                    </div>
                    <div className="w-2 h-2 bg-black/50 rounded-full blur-[1px]"></div>
                  </div>
                </div>

                {/* Search Bar */}
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
                      <button type="submit" className="bg-brand/10 text-brand px-4 py-3 text-sm font-semibold hover:bg-brand/20 transition-colors shrink-0">
                        {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                      </button>
                    </form>
                    
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {searchResults.map((res, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectSearchResult(res)}
                            className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted-background border-b border-border-subtle last:border-0 line-clamp-2"
                          >
                            {res.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* GPS Button */}
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="absolute bottom-6 right-4 z-[400] bg-background p-3.5 rounded-full shadow-lg border border-border text-foreground hover:text-brand hover:bg-muted-background transition-colors"
                  title="Locate me"
                >
                  <Navigation size={22} />
                </button>
              </div>

              {/* Bottom Action Area */}
              <div className="p-4 bg-card border-t border-border shrink-0 sm:rounded-b-2xl">
                <div className="flex items-center justify-between text-xs mb-3 bg-muted-background p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-muted block text-[10px] uppercase tracking-wider font-semibold mb-1">New Coordinates</span>
                    <span className="font-mono text-brand font-bold text-sm">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFlyTo({lat: currentLat, lng: currentLng, zoom: 16})}
                    className="text-muted hover:text-foreground text-xs underline font-medium"
                  >
                    Reset Map
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    name="submitter_name" 
                    placeholder="Your Name (For Credit) - Optional" 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                  />
                  <input 
                    type="text" 
                    name="Source / Reason" 
                    placeholder="Any specific detail? (Optional)" 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting || (center.lat === currentLat && center.lng === currentLng)}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-sm"
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
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full mt-1 text-xs flex items-center justify-center gap-1.5 text-muted hover:text-red-500 transition-colors py-1 rounded"
      >
        <MapPinOff size={14} /> Location is wrong?
      </button>

      {isOpen && mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}