"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PlusCircle, X, Loader2, CheckCircle2, MapPin, Navigation, Mail } from "lucide-react";
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
          toast("Current location acquired.", "success"); 
        },
        () => toast("Unable to retrieve your location.", "error") 
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
        toast("Landmark submitted successfully.", "success"); 
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => setIsSuccess(false), 300);
        }, 3500);
      } else {
        toast(data.details || "Submission failed.", "error"); 
      }
    } catch (error) {
      toast("Network error. Please try again.", "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 bg-ink/80 backdrop-blur-sm animate-in fade-in duration-200 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-landmark-title"
    >
      <div className="bg-surface w-full h-full sm:h-auto sm:max-w-xl md:max-w-2xl sm:rounded-lg shadow-2xl overflow-hidden border border-divider flex flex-col sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50 shrink-0">
          <h3 id="add-landmark-title" className="font-serif font-bold text-ink text-lg flex items-center gap-2 truncate pr-4">
            <PlusCircle size={18} className="text-accent shrink-0" />
            Suggest a New Landmark
          </h3>
          <button 
            onClick={() => setIsOpen(false)} 
            disabled={isSubmitting}
            className="text-ink/50 hover:text-ink p-2 bg-surface border border-divider rounded-md transition-colors shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-0 flex flex-col flex-grow relative overflow-hidden">
          {isSuccess ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
              </div>
              <h4 className="text-xl font-serif font-bold text-ink mb-2">Landmark Suggestion Received</h4>
              <p className="text-sm text-ink/70 max-w-sm mx-auto leading-relaxed">
                Thank you. The editorial team will review this new location and add it to the village map.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              
              {/* 🗺️ Map Area */}
              <div className="relative flex-grow min-h-[250px] sm:min-h-[300px] bg-canvas shrink-0">
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

                {/* Center Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[400] pointer-events-none drop-shadow-2xl">
                  <div className="relative flex flex-col items-center">
                    <div className="bg-accent text-white p-2.5 rounded-full shadow-lg border-2 border-white mb-1">
                      <MapPin size={26} />
                    </div>
                    <div className="w-2 h-2 bg-ink/50 rounded-full blur-[1px]"></div>
                  </div>
                </div>

                {/* Current Location Button */}
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="absolute bottom-4 right-4 z-[400] bg-surface p-3 rounded-md shadow-md border border-divider text-ink/70 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  title="Use my current location"
                >
                  <Navigation size={20} />
                </button>
              </div>

              {/* 📝 Form Details */}
              <div className="p-5 overflow-y-auto bg-surface border-t border-divider flex-grow custom-scrollbar space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Landmark Name <span className="text-red-500">*</span></label>
                    <input type="text" name="Landmark Name" required placeholder="e.g. Shiv Mandir" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select name="Category" required className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer">
                      <option value="">Select Category...</option>
                      <option value="religion">Temple / Religious</option>
                      <option value="education">School / Education</option>
                      <option value="infrastructure">Infrastructure (Bank, Pump)</option>
                      <option value="landmarks">Historical Landmark</option>
                      <option value="geography">Nature / River</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Description <span className="text-ink/40 font-normal">(Optional)</span></label>
                  <input type="text" name="Description" placeholder="Brief description of the place..." className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                </div>
                
                {/* 🛡️ Verification Details */}
                <div className="pt-4 border-t border-divider space-y-4">
                  <p className="text-xs text-ink/50">Contributor details are kept strictly confidential.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Your Name <span className="text-red-500">*</span></label>
                      <input type="text" name="submitterName" required placeholder="e.g. Ramesh Kumar" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Email Address <span className="text-ink/40 font-normal">(Optional)</span></label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                        <input type="email" name="submitterEmail" placeholder="For verification" className="w-full h-11 pl-10 pr-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Source of Information <span className="text-red-500">*</span></label>
                    <input type="text" name="source_reason" required placeholder="e.g. I am a local resident / visited this place" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
                  </div>
                </div>

              </div>

              {/* Footer Button */}
              <div className="p-4 bg-canvas/50 border-t border-divider shrink-0">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-3 rounded-md font-semibold transition-all shadow-sm disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Landmark Suggestion"}
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
        className="absolute top-4 right-4 z-[400] bg-surface text-ink hover:text-accent px-4 py-2.5 rounded-md shadow-md border border-divider transition-all flex items-center gap-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent no-print"
      >
        <PlusCircle size={18} className="text-accent" /> Add Landmark
      </button>

      {isOpen && mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}