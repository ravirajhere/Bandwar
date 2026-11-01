"use client";

import { useState } from "react";
import { Pencil, X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useContributorGate } from "@/hooks/useContributorGate";

// 🚀 Image Compression
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
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
          else reject(new Error("Compression failed"));
        }, "image/jpeg", 0.8);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export function ImageUpdateButton({ 
  contextName, 
  contextId, 
  currentImage,
  targetType = "article" 
}: { 
  contextName: string; 
  contextId: string; 
  currentImage?: string;
  targetType?: "article" | "person";
}) {
  const { toast } = useToast();
  const { submitWithGate, registrationModal } = useContributorGate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("attachment") as File;

    if (imageFile && imageFile.size > 0) {
      try {
        const compressed = await compressImage(imageFile);
        formData.set("image", compressed);
      } catch (err) {
        toast("Image compression failed.", "error");
        setIsSubmitting(false);
        return;
      }
    }

    formData.append("type", "Image Update Suggestion");
    formData.append("contextId", contextId);
    formData.append("Context Name", contextName);
    formData.append("currentImagePath", currentImage || "Unknown");
    formData.append("targetType", targetType);

    await submitWithGate(formData, async (data) => {
      try {
        const res = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const resData = await res.json();
        
        if (resData.success) {
          setIsSuccess(true);
          toast("Photo submitted for review.", "success");
          setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => { setIsSuccess(false); setFileName(""); }, 300);
          }, 3000);
        } else {
          toast(resData.error || "Failed to send photo.", "error");
        }
      } catch {
        toast("Network error.", "error");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }} 
        className="absolute top-4 right-4 z-20 bg-ink/70 hover:bg-accent text-white p-2.5 rounded-sm backdrop-blur-md transition-all shadow-md no-print"
        title="Suggest a new photo"
      >
        <Pencil size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm no-print">
          <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl border border-divider flex flex-col">
            
            <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50">
              <div>
                <h2 className="font-serif font-bold text-ink text-lg">Update Photograph</h2>
                <p className="text-sm text-ink-muted mt-1 truncate">{contextName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 border border-divider rounded-sm hover:bg-canvas">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-serif font-bold text-ink">Photo Received</h3>
                  <p className="text-sm text-ink-muted mt-1">The editorial team will review this image.</p>
                </div>
              ) : (
                <form id="image-update-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-2 border-dashed border-divider rounded-sm p-6 text-center hover:bg-canvas transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      name="attachment" 
                      accept="image/*" 
                      required 
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <UploadCloud size={28} className={`mx-auto mb-2 ${fileName ? 'text-green-500' : 'text-accent'}`} />
                    <p className="text-sm font-medium text-ink truncate px-4">
                      {fileName ? fileName : "Click to select an image"}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">JPG, PNG (Auto-compressed)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Source of Photograph <span className="text-red-500">*</span></label>
                    <input type="text" name="source_reason" required placeholder="e.g. Old family album" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
                  </div>
                </form>
              )}
            </div>

            {!isSuccess && (
              <div className="p-4 border-t border-divider bg-canvas/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-divider rounded-sm text-sm">Cancel</button>
                <button type="submit" form="image-update-form" disabled={isSubmitting || !fileName} className="px-5 py-2 bg-accent text-white rounded-sm font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : "Submit for Review"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {registrationModal}
    </>
  );
}