"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, CheckCircle2, UploadCloud, FileImage } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useContributorGate } from "@/hooks/useContributorGate";

type ContentType = "article" | "image" | "directory" | "person";

interface AddContentModalProps {
  type: ContentType;
  customButtonText?: string;
}

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

const generateFileName = (title: string) => {
  if (!title) return "";
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") + "-bandwar.jpg";
};

export function AddContentModal({ type, customButtonText }: AddContentModalProps) {
  const { toast } = useToast();
  const { submitWithGate, registrationModal } = useContributorGate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [suggestedFileName, setSuggestedFileName] = useState("");

  useEffect(() => {
    if (type === "image") setSuggestedFileName(generateFileName(liveTitle));
  }, [liveTitle, type]);

  const activeConfig = {
    article: {
      title: "Submit New Article",
      btnText: "Submit Article for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Article Title <span className="text-red-500">*</span></label>
            <input type="text" name="Article Title" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. History of Bandwar" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
            <select name="Category" required className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none cursor-pointer">
              <option value="">Select Category...</option>
              <option value="history">History</option>
              <option value="culture">Culture</option>
              <option value="education">Education</option>
              <option value="religion">Religion & Temples</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Story / Details <span className="text-red-500">*</span></label>
            <textarea name="Story" required placeholder="Write the full story or details here..." rows={5} className="w-full px-4 py-3 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none resize-y" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Hero Image <span className="text-ink-muted font-normal">(Optional)</span></label>
            <div className="border-2 border-dashed border-divider rounded-sm p-4 text-center hover:bg-canvas relative cursor-pointer">
              <input type="file" name="attachment" accept="image/*" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud size={20} className="text-accent mx-auto mb-1" />
              <p className="text-sm font-medium text-ink">{fileName ? fileName : "Click to upload image"}</p>
            </div>
          </div>
        </div>
      )
    },
    image: {
      title: "Upload Gallery Photograph",
      btnText: "Submit Photograph for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Photo Caption <span className="text-red-500">*</span></label>
            <input type="text" name="Photo Title" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. Old Thakurbari" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
              <select name="Category" required className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none cursor-pointer">
                <option value="">Select...</option>
                <option value="temples">Temples</option>
                <option value="festivals">Festivals</option>
                <option value="nature">Nature & River</option>
                <option value="daily-life">Village Life</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Year</label>
              <input type="text" name="Year" placeholder="e.g. 1995" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
            </div>
          </div>
          <div className="border-2 border-dashed border-divider rounded-sm p-6 text-center hover:bg-canvas relative cursor-pointer">
            <input type="file" name="attachment" accept="image/*" required onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud size={28} className={`mx-auto mb-2 ${fileName ? 'text-green-500' : 'text-accent'}`} />
            <p className="text-sm font-medium text-ink">{fileName ? fileName : "Click to select photograph"}</p>
          </div>
          {suggestedFileName && (
            <div className="bg-canvas border border-divider rounded-sm p-3 flex items-start gap-2">
              <FileImage size={16} className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase block mb-0.5">Suggested Filename</span>
                <span className="text-xs font-mono text-ink break-all">{suggestedFileName}</span>
              </div>
            </div>
          )}
          <input type="hidden" name="Suggested File Name" value={suggestedFileName} />
        </div>
      )
    },
    directory: {
      title: "Add Directory Listing",
      btnText: "Submit Listing for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Name <span className="text-red-500">*</span></label>
            <input type="text" name="Name" required placeholder="e.g. Ganesh Medical Store" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
              <select name="Category" required className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none cursor-pointer">
                <option value="">Select...</option>
                <option value="shops">Shops</option>
                <option value="health">Health</option>
                <option value="government">Government</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input type="tel" name="Phone Number" required placeholder="10-digit number" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Address <span className="text-ink-muted font-normal">(Optional)</span></label>
            <input type="text" name="Address" placeholder="e.g. Main Road, Bandwar" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>
        </div>
      )
    },
    person: {
      title: "Add Notable Person",
      btnText: "Submit Profile for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="Full Name" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. Late Ram Prasad Singh" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Role / Designation <span className="text-red-500">*</span></label>
            <input type="text" name="Role" required placeholder="e.g. Freedom Fighter" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Date of Birth</label>
              <input type="text" name="Date of Birth" placeholder="e.g. 1915" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Date of Death</label>
              <input type="text" name="Date of Death" placeholder="If applicable" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Biography <span className="text-red-500">*</span></label>
            <textarea name="Biography" required placeholder="Provide a detailed account..." rows={4} className="w-full px-4 py-3 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none resize-y" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Profile Photo <span className="text-ink-muted font-normal">(Optional)</span></label>
            <div className="border-2 border-dashed border-divider rounded-sm p-4 text-center hover:bg-canvas relative cursor-pointer">
              <input type="file" name="attachment" accept="image/*" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud size={20} className="text-accent mx-auto mb-1" />
              <p className="text-sm font-medium text-ink">{fileName ? fileName : "Click to upload photo"}</p>
            </div>
          </div>
        </div>
      )
    }
  }[type];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("attachment") as File;

    // 🚀 Compress Image
    if (imageFile && imageFile.size > 0) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(imageFile);
        formData.set("image", compressed);
      } catch (err) {
        toast("Image compression failed.", "error");
        setIsSubmitting(false);
        setIsCompressing(false);
        return;
      } finally {
        setIsCompressing(false);
      }
    }

    // 🚀 Add context for backend
    const typeMap: Record<string, string> = {
      article: "Article Submission",
      person: "Person Submission",
      directory: "Directory Submission",
      image: "Image Upload"
    };

    // Naya item hai, toh ID title/name se generate karenge (backend JSON update ke liye)
    const generatedId = liveTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    formData.append("type", typeMap[type]);
    formData.append("contextId", generatedId || "new-item");
    formData.append("targetType", type); // article, person, directory, image

    await submitWithGate(formData, async (data) => {
      try {
        const res = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const resData = await res.json();
        
        if (resData.success) {
          setIsSuccess(true);
          toast("Submitted successfully for review.", "success");
          setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => { setIsSuccess(false); setFileName(""); setLiveTitle(""); }, 300);
          }, 3000);
        } else {
          toast(resData.error || "Submission failed.", "error");
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
        onClick={() => setIsOpen(true)} 
        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-sm font-medium transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Plus size={18} />
        {customButtonText || `Add ${type}`}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-surface w-full max-w-xl rounded-sm shadow-xl overflow-hidden border border-divider flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50 shrink-0">
              <h2 className="font-serif font-bold text-ink text-lg">{activeConfig.title}</h2>
              <button onClick={() => setIsOpen(false)} disabled={isSubmitting} className="p-2 bg-surface border border-divider rounded-sm hover:bg-canvas">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">Submission Received</h3>
                  <p className="text-sm text-ink-muted">The editorial team will review this shortly.</p>
                </div>
              ) : (
                <form id={`add-form-${type}`} onSubmit={handleSubmit}>
                  {activeConfig.fields}
                </form>
              )}
            </div>

            {!isSuccess && (
              <div className="p-4 border-t border-divider bg-canvas/50 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting || isCompressing} className="px-4 py-2 rounded-sm border border-divider text-sm font-medium hover:bg-surface">Cancel</button>
                <button 
                  type="submit" 
                  form={`add-form-${type}`} 
                  disabled={isSubmitting || isCompressing} 
                  className="px-5 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2 rounded-sm font-semibold text-sm disabled:opacity-50 min-w-[140px]"
                >
                  {isSubmitting || isCompressing ? (
                    <><Loader2 size={16} className="animate-spin" /> {isCompressing ? "Compressing..." : "Submitting..."}</>
                  ) : (
                    activeConfig.btnText
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚀 Auth Modal */}
      {registrationModal}
    </>
  );
}