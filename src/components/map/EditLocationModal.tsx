"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MapPinOff, X, Loader2, CheckCircle2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useContributorGate } from "@/hooks/useContributorGate";

// 🚀 MapTracker function
function MapTracker({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const map = useMap();
  useMapEvents({ 
    moveend() { 
      const c = map.getCenter(); 
      onCenterChange(c.lat, c.lng); 
    } 
  });
  return null;
}

interface EditLocationModalProps {
  landmarkName: string;
  contextId: string;
  currentLat: number;
  currentLng: number;
}

export function EditLocationModal({ landmarkName, contextId, currentLat, currentLng }: EditLocationModalProps) {
  const { toast } = useToast();
  const { submitWithGate, registrationModal } = useContributorGate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [center, setCenter] = useState({ lat: currentLat, lng: currentLng });
  
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // 🚀 A11Y & UX FIX: Body scroll lock and focus management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // 🚀 Format coordinates as a single string for the standard edit flow
    const newCoords = `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`;
    const oldCoords = `${currentLat}, ${currentLng}`;

    formData.append("type", "Landmark Location Update");
    formData.append("contextId", contextId);
    formData.append("targetType", "landmark");
    formData.append("field", "Coordinates");
    formData.append("currentValue", oldCoords);
    formData.append("suggestedValue", newCoords);
    formData.append("currentImagePath", "Unknown");

    await submitWithGate(formData, async (data) => {
      try {
        const res = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const resData = await res.json();
        
        if (resData.success) {
          setIsSuccess(true);
          toast("Location update submitted.", "success");
          setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => setIsSuccess(false), 300);
          }, 3000);
        } else {
          toast(resData.error || "Failed to send request.", "error");
        }
      } catch {
        toast("Network error.", "error");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm no-print animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Suggest Location Correction"
    >
      <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl border border-divider flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50">
          <div>
            <h2 className="font-serif font-bold text-ink text-lg flex items-center gap-2">
              <MapPinOff size={18} className="text-accent" aria-hidden="true" /> Suggest Location Correction
            </h2>
            <p className="text-sm text-ink-muted mt-1 truncate max-w-[250px]">{landmarkName}</p>
          </div>
          <button 
            ref={closeButtonRef}
            type="button" 
            onClick={() => setIsOpen(false)} 
            className="p-2 border border-divider rounded-sm hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col">
          {isSuccess ? (
            <div className="text-center py-16">
              <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-lg font-serif font-bold text-ink">Location Update Received</h3>
              <p className="text-sm text-ink-muted mt-1">The editorial team will review this.</p>
            </div>
          ) : (
            <form id="edit-location-form" onSubmit={handleSubmit} className="flex flex-col h-full">
              
              {/* Map Area */}
              <div className="relative flex-grow min-h-[300px] bg-canvas">
                <MapContainer 
                  center={[currentLat, currentLng]} 
                  zoom={16} 
                  style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }} 
                  zoomControl={false}
                  aria-label="Interactive map to adjust location"
                >
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                  <MapTracker onCenterChange={(lat, lng) => setCenter({ lat, lng })} />
                </MapContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] z-[400] pointer-events-none drop-shadow-2xl" aria-hidden="true">
                  <MapPin size={36} className="text-accent fill-accent" />
                </div>
              </div>

              {/* Data & Info */}
              <div className="p-5 overflow-y-auto border-t border-divider space-y-4 bg-surface">
                <div className="flex justify-between items-center bg-canvas p-3 border border-divider rounded-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink/50 block mb-0.5">New Coordinates</span>
                    <span className="text-xs font-mono text-ink font-semibold">{center.lat.toFixed(6)}, {center.lng.toFixed(6)}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setCenter({ lat: currentLat, lng: currentLng })} 
                    className="text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
                  >
                    Reset Map
                  </button>
                </div>

                <div>
                  <label htmlFor="source_reason" className="block text-sm font-semibold text-ink mb-1.5">
                    Source of Information <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="source_reason"
                    type="text" 
                    name="source_reason" 
                    required 
                    placeholder="e.g. I am a local resident" 
                    autoComplete="off"
                    className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" 
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {!isSuccess && (
          <div className="p-4 border-t border-divider bg-canvas/50 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="px-4 py-2 border border-divider rounded-sm text-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="edit-location-form" 
              disabled={isSubmitting || (center.lat === currentLat && center.lng === currentLng)} 
              className="px-5 py-2 bg-accent text-white rounded-sm font-semibold text-sm flex items-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Submitting...</>
              ) : (
                "Confirm Location"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }} 
        className="text-[11px] text-accent font-semibold hover:underline flex items-center gap-1 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        aria-label={`Report wrong location for ${landmarkName}`}
      >
        <MapPinOff size={12} aria-hidden="true" /> Report wrong location
      </button>
      {isOpen && mounted ? createPortal(modalContent, document.body) : null}
      {registrationModal}
    </>
  );
}