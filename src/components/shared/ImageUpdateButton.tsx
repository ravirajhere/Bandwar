"use client";

import { useState } from "react";
import { Pencil, X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast"; 

interface ImageUpdateButtonProps {
  contextName: string; 
  contextId: string; // 👈 Naya Prop: JSON generate karne ke liye (e.g., "snk-high-school-bandwar")
  currentImage?: string; 
}

// 🖼️ Image Compression Function
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxWidth = 1200; 

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Image compression failed"));
            }
          },
          "image/jpeg",
          0.8 
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export function ImageUpdateButton({ contextName, contextId, currentImage }: ImageUpdateButtonProps) {
  const { toast } = useToast(); 

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // 📸 Image Compression
    const imageFile = formData.get("attachment") as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const compressedFile = await compressImage(imageFile);
        formData.delete("attachment"); 
        formData.append("image", compressedFile);
      } catch (error) {
        console.error("Compression failed", error);
      }
    }

    // 👇 Telegram API ke liye zaroori data (JSON generate karne ke liye)
    formData.append("type", "Image Update Suggestion");
    formData.append("contextId", contextId);
    formData.append("Context Name", contextName);
    
    // User ka naam (Credit ke liye)
    const submittedName = formData.get("submitter_name") as string;
    formData.append("submitterName", submittedName || "Anonymous Visitor");

    try {
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Photo sent to Telegram! Editor will review it.", "success");
      } else {
        toast(data.details || "Failed to send photo.", "error");
      }
    } catch (error) {
      toast("Error submitting image. Please check your connection.", "error");
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
          e.preventDefault(); 
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
                  <p className="text-sm text-muted mb-6">Thank you. The photo has been sent to the editor's Telegram.</p>
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
                    <p className="text-xs text-muted mt-1">JPG, PNG or WebP (Auto-compressed)</p>
                  </div>

                  {/* Caption/Context */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Where did you get this photo?</label>
                    <input 
                      type="text" 
                      name="source_reason" 
                      placeholder="e.g., Old family album, taken in 1990" 
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none" 
                    />
                  </div>

                  {/* Your Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Your Name (For Credit)</label>
                    <input 
                      type="text" 
                      name="submitter_name" 
                      placeholder="e.g., Ramesh Kumar" 
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none" 
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !fileName}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Compressing & Sending...</> : "Send Photo to Editor"}
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