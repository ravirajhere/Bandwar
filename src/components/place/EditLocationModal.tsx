"use client";

import { useState } from "react";
import { MapPinOff, X, Loader2, CheckCircle2 } from "lucide-react";

interface EditLocationModalProps {
  landmarkName: string;
  currentLat: number;
  currentLng: number;
}

export function EditLocationModal({ landmarkName, currentLat, currentLng }: EditLocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key daalein
    formData.append("subject", `Location Correction: ${landmarkName}`);
    formData.append("from_name", "Bandwar Map Visitor");
    formData.append("landmark_name", landmarkName);
    formData.append("current_coordinates", `${currentLat}, ${currentLng}`);

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
        }, 2500);
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
      {/* 🖊️ Trigger Button (Map Popup ke andar dikhega) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 text-xs flex items-center justify-center gap-1.5 text-muted hover:text-red-500 transition-colors py-1 rounded"
      >
        <MapPinOff size={14} /> Wrong location?
      </button>

      {/* 🪟 Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-border">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background">
              <h3 className="font-serif font-semibold text-foreground text-sm flex items-center gap-2">
                <MapPinOff size={16} className="text-red-500" />
                Suggest Location Fix
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1 rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3 animate-bounce" />
                  <h4 className="text-base font-bold text-foreground mb-1">Dhanyawad!</h4>
                  <p className="text-xs text-muted">Your location correction has been sent to the editor.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{landmarkName}</h4>
                    <p className="text-xs text-muted mt-1">Current marker is at: <span className="font-mono">{currentLat}, {currentLng}</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Correct Location Details <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="suggestion" 
                      required
                      rows={3}
                      placeholder="E.g., 'This is showing in the river. The actual temple is near the main road, opposite the school.' Or paste a Google Maps link here." 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm resize-y" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Your Name (Optional)</label>
                    <input 
                      type="text" 
                      name="visitor_name" 
                      placeholder="e.g. Ramesh" 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 text-sm mt-2"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Submit Correction"}
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