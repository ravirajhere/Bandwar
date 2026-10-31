"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PlusCircle, X, Loader2, CheckCircle2, MapPin, Navigation } from "lucide-react";
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

export function AddLandmarkModal() {
  const { toast } = useToast(); 
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [center, setCenter] = useState({ lat: 25.5009, lng: 86.1606 }); // Bandwar default
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFlyTo({ lat: position.coords.latitude, lng: position.coords.longitude, zoom: 18 });
          toast("Location found!", "success"); 
        },
        () => toast("Could not get your location.", "error") 
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("type", "New Landmark Suggestion");
    formData.append("latitude", center.lat.toFixed(6));
    formData.append("longitude", center.lng.toFixed(6));
    formData.append("Google Maps Link", `https://www.google.com/maps?q=${center.lat.toFixed(6)},${center.lng.toFixed(6)}`);

    try {
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Landmark sent to Telegram!", "success"); 
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => setIsSuccess(false), 300);
        }, 3000);
      } else {
        toast(data.details || "Something went wrong.", "error"); 
      }
    } catch (error) {
      toast("Error sending request. Check your connection.", "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background shrink-0">
          <h3 className="font-serif font-semibold text-foreground text-sm flex items-center gap-2 truncate pr-4">
            <PlusCircle size={16} className="text-brand shrink-0" />
            Suggest New Landmark
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1.5 bg-background rounded-md transition-colors shadow-sm shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-0 flex flex-col flex-grow relative h-full sm:h-auto">
          {isSuccess ? (
            <div className="text-center py-20 px-6">
              <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
              <h4 className="text-xl font-bold text-foreground mb-2">Dhanyawad!</h4>
              <p className="text-sm text-muted">New landmark suggestion sent to the editor.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow h-full sm:h-auto">
              
              {/* Map Area for selecting location */}
              <div className="relative flex-grow min-h-[250px] sm:min-h-[200px] bg-muted-background">
                <MapContainer 
                  center={[center.lat, center.lng]} 
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

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[400] pointer-events-none drop-shadow-2xl">
                  <div className="relative flex flex-col items-center">
                    <div className="bg-brand text-white p-2.5 rounded-full shadow-lg border-2 border-white mb-1">
                      <MapPin size={26} />
                    </div>
                    <div className="w-2 h-2 bg-black/50 rounded-full blur-[1px]"></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="absolute bottom-4 right-4 z-[400] bg-background p-3 rounded-full shadow-lg border border-border text-foreground hover:text-brand transition-colors"
                >
                  <Navigation size={20} />
                </button>
              </div>

              {/* Form Details */}
              <div className="p-4 bg-card border-t border-border shrink-0 sm:rounded-b-2xl space-y-3">
                <input type="text" name="Landmark Name" required placeholder="Landmark Name (e.g., Shiv Mandir)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />
                
                <select name="Category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm">
                  <option value="">Select Category...</option>
                  <option value="religion">Temple / Religious</option>
                  <option value="education">School / Education</option>
                  <option value="infrastructure">Infrastructure (Bank, Pump)</option>
                  <option value="landmarks">Historical Landmark</option>
                  <option value="geography">Nature / River</option>
                </select>

                <input type="text" name="Description" placeholder="Short Description (Optional)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />
                
                <input type="text" name="submitterName" placeholder="Your Name (For Credit)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Submit New Landmark"}
                </button>
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
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-[400] bg-background text-foreground hover:text-brand px-4 py-2.5 rounded-full shadow-lg border border-border transition-colors flex items-center gap-2 text-sm font-semibold"
      >
        <PlusCircle size={18} /> Add Landmark
      </button>

      {isOpen && mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}