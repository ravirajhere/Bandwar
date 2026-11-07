"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, CheckCircle2, UploadCloud } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useContributorGate } from "@/hooks/useContributorGate";

type ContentType = "article" | "image" | "directory" | "person";

interface AddContentModalProps {
  type: ContentType;
  customButtonText?: string;
  categories?: { id: string; title: string }[]; 
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

// 🚀 Safe Slugify
const slugify = (text: string) => {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
};

export function AddContentModal({ type, customButtonText, categories = [] }: AddContentModalProps) {
  const { toast } = useToast();
  const { submitWithGate, registrationModal } = useContributorGate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 🚀 STRICT VALIDATION: Prevent empty submissions
    if (type === "article" && liveTitle.length < 3) return toast("Title must be at least 3 characters.", "error");
    if (type === "image" && liveTitle.length < 3) return toast("Caption must be at least 3 characters.", "error");

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("attachment") as File;

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

    if (showCustomCat && customCategory.trim()) {
      const slug = slugify(customCategory);
      formData.set("Category", slug);
      formData.set("customCategory", customCategory.trim());
    }

    // 🚀 STRICT ID GENERATION
    let generatedId = "";
    if (type === "article") generatedId = slugify(liveTitle);
    else if (type === "image") generatedId = `photo-${Date.now()}`; // Gallery gets photo-timestamp
    else if (type === "person") generatedId = `person-${slugify(liveTitle)}`;
    else generatedId = `dir-${Date.now()}`;

    // Normalize Types
    const typeMap: Record<string, string> = {
      article: "Article Submission",
      person: "Person Submission",
      directory: "Directory Submission",
      image: "Gallery Image"
    };
    
    formData.append("type", typeMap[type]);
    formData.append("contextId", generatedId);
    formData.append("targetType", type === "image" ? "gallery" : type); // 🚀 Explicit mapping

    await submitWithGate(formData, async (data) => {
      try {
        const res = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const resData = await res.json();
        
        if (resData.success) {
          setIsSuccess(true);
          toast("Submitted successfully for review.", "success");
          setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => { 
              setIsSuccess(false); 
              setFileName(""); 
              setLiveTitle(""); 
              setShowCustomCat(false);
              setCustomCategory("");
            }, 300);
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

  const CategorySelector = ({ label, id }: { label: string, id: string }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">{label} <span className="text-red-500">*</span></label>
      <select 
        id={id}
        name={showCustomCat ? "" : "Category"} 
        required={!showCustomCat} 
        onChange={(e) => setShowCustomCat(e.target.value === "custom")}
        className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none cursor-pointer focus:ring-2 focus:ring-accent/20"
      >
        <option value="">Select...</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.title}</option>
        ))}
        <option value="custom" className="font-bold text-accent">+ Create Custom Category</option>
      </select>
      
      {showCustomCat && (
        <input 
          type="text" 
          placeholder="Enter new category name..." 
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          required
          aria-label="Custom category name"
          className="w-full h-11 px-4 rounded-sm border border-accent bg-canvas text-ink text-sm focus:border-accent outline-none animate-in fade-in focus:ring-2 focus:ring-accent/20" 
        />
      )}
    </div>
  );

  const activeConfig = {
    article: {
      title: "Submit New Article",
      btnText: "Submit Article",
      fields: (
        <div className="space-y-4">
          <div>
            <label htmlFor="article-title" className="block text-sm font-semibold text-ink mb-1.5">Article Title <span className="text-red-500">*</span></label>
            <input id="article-title" type="text" name="Article Title" required minLength={3} onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. History of Bandwar" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <CategorySelector label="Category" id="article-category" />
          <div>
            <label htmlFor="article-story" className="block text-sm font-semibold text-ink mb-1.5">Story / Details <span className="text-red-500">*</span></label>
            <textarea id="article-story" name="Story" required placeholder="Write the full story or details here..." rows={5} className="w-full px-4 py-3 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none resize-y focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label htmlFor="article-image" className="block text-sm font-semibold text-ink mb-1.5">Hero Image <span className="text-ink-muted font-normal">(Optional)</span></label>
            <div className="border-2 border-dashed border-divider rounded-sm p-4 text-center hover:bg-canvas relative cursor-pointer focus-within:ring-2 focus-within:ring-accent/20">
              <input id="article-image" type="file" name="attachment" accept="image/*" aria-label="Upload Article Hero Image" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud size={20} className="text-accent mx-auto mb-1" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">{fileName ? fileName : "Click to upload image"}</p>
            </div>
          </div>
        </div>
      )
    },
    image: {
      title: "Upload Gallery Photograph",
      btnText: "Submit Photograph",
      fields: (
        <div className="space-y-4">
          <div>
            <label htmlFor="photo-title" className="block text-sm font-semibold text-ink mb-1.5">Photo Caption <span className="text-red-500">*</span></label>
            <input id="photo-title" type="text" name="Photo Title" required minLength={3} onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. Old Thakurbari" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <CategorySelector label="Category" id="photo-category" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="photo-year" className="block text-sm font-semibold text-ink mb-1.5">Year</label>
              <input id="photo-year" type="text" name="Year" placeholder="e.g. 1995" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
          </div>
          <div className="border-2 border-dashed border-divider rounded-sm p-6 text-center hover:bg-canvas relative cursor-pointer focus-within:ring-2 focus-within:ring-accent/20">
            <input id="photo-image" type="file" name="attachment" accept="image/*" required aria-label="Upload Gallery Photograph" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud size={28} className={`mx-auto mb-2 ${fileName ? 'text-green-500' : 'text-accent'}`} aria-hidden="true" />
            <p className="text-sm font-medium text-ink">{fileName ? fileName : "Click to select photograph"}</p>
          </div>
        </div>
      )
    },
    directory: {
      title: "Add Directory Listing",
      btnText: "Submit Listing",
      fields: (
        <div className="space-y-4">
          <div>
            <label htmlFor="directory-name" className="block text-sm font-semibold text-ink mb-1.5">Name <span className="text-red-500">*</span></label>
            <input id="directory-name" type="text" name="Name" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. Ganesh Medical Store" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <CategorySelector label="Category" id="directory-category" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="directory-phone" className="block text-sm font-semibold text-ink mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input id="directory-phone" type="tel" name="Phone Number" required placeholder="10-digit number" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label htmlFor="directory-address" className="block text-sm font-semibold text-ink mb-1.5">Address <span className="text-ink-muted font-normal">(Optional)</span></label>
              <input id="directory-address" type="text" name="Address" placeholder="e.g. Main Road" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
          </div>
        </div>
      )
    },
    person: {
      title: "Add Notable Person",
      btnText: "Submit Profile",
      fields: (
        <div className="space-y-4">
          <div>
            <label htmlFor="person-name" className="block text-sm font-semibold text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input id="person-name" type="text" name="Full Name" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. Late Ram Prasad Singh" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label htmlFor="person-role" className="block text-sm font-semibold text-ink mb-1.5">Role / Designation <span className="text-red-500">*</span></label>
            <input id="person-role" type="text" name="Role" required placeholder="e.g. Freedom Fighter" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="person-dob" className="block text-sm font-semibold text-ink mb-1.5">Date of Birth</label>
              <input id="person-dob" type="text" name="Date of Birth" placeholder="e.g. 1915" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label htmlFor="person-dod" className="block text-sm font-semibold text-ink mb-1.5">Date of Death</label>
              <input id="person-dod" type="text" name="Date of Death" placeholder="If applicable" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
          </div>
          <div>
            <label htmlFor="person-bio" className="block text-sm font-semibold text-ink mb-1.5">Biography <span className="text-red-500">*</span></label>
            <textarea id="person-bio" name="Biography" required placeholder="Provide a detailed account..." rows={4} className="w-full px-4 py-3 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none resize-y focus:ring-2 focus:ring-accent/20" />
          </div>
          <div>
            <label htmlFor="person-image" className="block text-sm font-semibold text-ink mb-1.5">Profile Photo <span className="text-ink-muted font-normal">(Optional)</span></label>
            <div className="border-2 border-dashed border-divider rounded-sm p-4 text-center hover:bg-canvas relative cursor-pointer focus-within:ring-2 focus-within:ring-accent/20">
              <input id="person-image" type="file" name="attachment" accept="image/*" aria-label="Upload Person Profile Photo" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud size={20} className="text-accent mx-auto mb-1" aria-hidden="true" />
              <p className="text-sm font-medium text-ink">{fileName ? fileName : "Click to upload photo"}</p>
            </div>
          </div>
        </div>
      )
    }
  }[type];

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)} 
        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-sm font-medium transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Plus size={18} aria-hidden="true" />
        {customButtonText || `Add ${type}`}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in no-print"
          role="dialog"
          aria-modal="true"
          aria-label={activeConfig.title}
        >
          <div className="bg-surface w-full max-w-xl rounded-sm shadow-xl overflow-hidden border border-divider flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50 shrink-0">
              <h2 className="font-serif font-bold text-ink text-lg">{activeConfig.title}</h2>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                disabled={isSubmitting} 
                className="p-2 bg-surface border border-divider rounded-sm hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" aria-hidden="true" />
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
                <button type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting || isCompressing} className="px-4 py-2 rounded-sm border border-divider text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Cancel</button>
                <button 
                  type="submit" 
                  form={`add-form-${type}`} 
                  disabled={isSubmitting || isCompressing || liveTitle.length < 3} 
                  className="px-5 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2 rounded-sm font-semibold text-sm disabled:opacity-50 min-w-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {isSubmitting || isCompressing ? (
                    <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {isCompressing ? "Compressing..." : "Submitting..."}</>
                  ) : (
                    activeConfig.btnText
                  )}
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