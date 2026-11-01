"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, X, UploadCloud, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast"; 

interface ImageUpdateButtonProps {
  contextName: string; 
  contextId: string; 
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
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock scroll & Handle Escape Key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting]);

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

    // API Payload for Telegram
    formData.append("type", "Image Update Suggestion");
    formData.append("contextId", contextId);
    formData.append("Context Name", contextName);
    formData.append("currentImagePath", currentImage || "Unknown Path");
    
    const submittedName = formData.get("submitter_name") as string;
    formData.append("submitterName", submittedName || "Anonymous Contributor");

    try {
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Image submitted successfully.", "success");
        setTimeout(() => {
          handleClose();
        }, 3500);
      } else {
        toast(data.details || "Submission failed. Please try again.", "error");
      }
    } catch (error) {
      toast("Network error. Please check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setTimeout(() => {
        setIsSuccess(false);
        setFileName("");
      }, 300);
    }
  };

  return (
    <>
      {/* 🖊️ Trigger Button */}
      <button
        onClick={(e) => {
          e.preventDefault(); 
          setIsOpen(true);
        }}
        className="absolute top-4 right-4 z-20 bg-ink/60 hover:bg-accent text-white p-2.5 rounded-md backdrop-blur-md transition-all shadow-md group-hover:opacity-100 opacity-0 md:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white no-print"
        title="Suggest an image update"
        aria-label="Update Image"
      >
        <Pencil size={16} />
      </button>

      {/* 🪟 Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200 no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
        >
          <div 
            ref={modalRef}
            className="bg-surface w-full max-w-lg rounded-lg shadow-2xl overflow-hidden border border-divider flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b border-divider bg-canvas/50 shrink-0">
              <div>
                <h2 id="image-modal-title" className="font-serif font-bold text-ink text-lg">
                  Suggest Image Update
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  For <span className="text-accent font-medium">{contextName}</span>
                </p>
              </div>
              <button 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="text-ink/40 hover:text-ink p-2 bg-surface border border-divider rounded-md transition-colors shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-grow">
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">Image Submitted Successfully</h3>
                  <p className="text-sm text-ink/70 max-w-sm mx-auto leading-relaxed">
                    Thank you for your contribution. The editorial team will review this photograph before publishing.
                  </p>
                </div>
              ) : (
                <form id="image-update-form" onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-sm text-ink/70 leading-relaxed mb-4">
                    Do you have a higher quality or historical photograph of this? Upload it below. By submitting, you confirm you have the right to share this image.
                  </p>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Upload Photograph <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-divider rounded-lg p-6 text-center hover:bg-canvas transition-colors relative cursor-pointer group">
                      <input 
                        type="file" 
                        name="attachment" 
                        accept="image/*" 
                        required
                        onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <UploadCloud size={28} className={`mx-auto mb-2 transition-colors ${fileName ? 'text-green-500' : 'text-accent'}`} />
                      <p className="text-sm font-medium text-ink truncate px-4">
                        {fileName ? fileName : "Click to select an image"}
                      </p>
                      <p className="text-xs text-ink/50 mt-1">JPG, PNG or WebP (Auto-compressed)</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-divider space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">
                        Source of Photograph <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="source_reason" 
                        required
                        placeholder="e.g. Family album, taken in 1990, local archive" 
                        className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">
                          Contributor Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="submitter_name" 
                          required
                          placeholder="e.g. Ramesh Kumar" 
                          className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">
                          Contact No. <span className="text-ink/40 font-normal">(Optional)</span>
                        </label>
                        <input 
                          type="tel" 
                          name="submitter_contact" 
                          placeholder="For verification" 
                          className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {!isSuccess && (
              <div className="p-5 border-t border-divider bg-canvas/50 shrink-0 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-md border border-divider bg-surface text-ink font-medium hover:bg-canvas transition-colors disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="image-update-form"
                  disabled={isSubmitting || !fileName}
                  className="px-6 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 rounded-md font-semibold transition-all shadow-sm disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Submit Photograph"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}