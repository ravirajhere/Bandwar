"use client";

import { useState } from "react";
import { Pencil, X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";

interface ImageUpdateButtonProps {
  contextName: string; // Jaise "S.N.K. High School" ya "Mahant Surendra Das"
  currentImage?: string; // Optional: Agar current image dikhana hai modal me
}

export function ImageUpdateButton({ contextName, currentImage }: ImageUpdateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key yahan daalein
    formData.append("subject", `New Image Upload for: ${contextName}`);
    formData.append("from_name", "Bandwar Portal Image Contributor");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
      } else {
        alert("Failed to upload. File might be too large (Max 5MB).");
      }
    } catch (error) {
      alert("Error submitting image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setFileName("");
    }, 300);
  };

  return (
    <>
      {/* 🖊️ The Pencil Button */}
      <button
        onClick={(e) => {
          e.preventDefault(); // Agar image link ke andar hai toh page change na ho
          setIsOpen(true);
        }}
        className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-brand text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg group-hover:opacity-100 opacity-0 md:opacity-100"
        title="Suggest a new photo for this"
        aria-label="Update Image"
      >
        <Pencil size={18} />
      </button>

      {/* 🪟 The Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted-background">
              <h3 className="font-serif font-semibold text-foreground">Suggest New Photo</h3>
              <button onClick={handleClose} className="text-muted hover:text-foreground transition-colors p-1 rounded-md">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-foreground mb-2">Photo Sent Successfully!</h4>
                  <p className="text-sm text-muted mb-6">Thank you. The editor will review and upload it soon.</p>
                  <button onClick={handleClose} className="bg-brand text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-hover">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-muted mb-4">
                    Do you have a better or older photo for <strong className="text-foreground">{contextName}</strong>? Upload it below.
                  </p>

                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted-background transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      name="attachment" 
                      accept="image/*" 
                      required
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={32} className="text-brand mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {fileName ? fileName : "Click to select an image"}
                    </p>
                    <p className="text-xs text-muted mt-1">JPG, PNG or WebP (Max 5MB)</p>
                  </div>

                  {/* Caption/Context */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Where did you get this photo?</label>
                    <input 
                      type="text" 
                      name="source" 
                      placeholder="e.g., Old family album, taken in 1990" 
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none" 
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !fileName}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : "Send Photo to Editor"}
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