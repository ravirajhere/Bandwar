"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Loader2, CheckCircle2, UploadCloud, FileImage } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type ContentType = "article" | "image" | "directory" | "person";

interface AddContentModalProps {
  type: ContentType;
  customButtonText?: string;
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

// 🪄 SEO Slug Generator Function
const generateFileName = (title: string) => {
  if (!title) return "";
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") 
      .replace(/\s+/g, "-")         
      .replace(/-+/g, "-")          
      + "-bandwar.jpg"              
  );
};

export function AddContentModal({ type, customButtonText }: AddContentModalProps) {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [liveTitle, setLiveTitle] = useState("");
  const [suggestedFileName, setSuggestedFileName] = useState("");
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock scroll & Handle Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting]);

  useEffect(() => {
    if (type === "image") {
      setSuggestedFileName(generateFileName(liveTitle));
    }
  }, [liveTitle, type]);

  // 🏛️ Shared Verification Fields (Ensures complete data is captured)
  const VerificationFields = () => (
    <div className="pt-5 mt-5 border-t border-divider space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-ink mb-1">Contributor Verification</h4>
        <p className="text-xs text-ink/50 mb-4">This information is kept strictly confidential and used only to verify accuracy.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="Submitter Name" required placeholder="e.g. Ramesh Kumar" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Contact No. <span className="text-ink/40 font-normal">(Optional)</span></label>
            <input type="tel" name="Submitter Contact" placeholder="For verification" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-ink mb-1.5">Source of Information <span className="text-red-500">*</span></label>
          <input type="text" name="Source / Reason" required placeholder="e.g. Personal knowledge, Official record, Local resident" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
        </div>
      </div>
    </div>
  );

  const config = {
    article: {
      title: "Submit New Article",
      desc: "Contribute historical, cultural, or general information for the village archive.",
      btnText: "Submit Article for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Article Title <span className="text-red-500">*</span></label>
            <input type="text" name="Article Title" required placeholder="e.g. History of the Old Temple" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
            <select name="Category" required className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer">
              <option value="">Select Category...</option>
              <option value="history">History</option>
              <option value="culture">Culture</option>
              <option value="education">Education</option>
              <option value="religion">Religion & Temples</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full Story / Details <span className="text-red-500">*</span></label>
            <textarea name="Story" required placeholder="Provide detailed information here..." rows={5} className="w-full px-4 py-3 rounded-md border border-divider bg-surface text-ink text-sm resize-y focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <VerificationFields />
        </div>
      )
    },
    image: {
      title: "Upload Archive Photo",
      desc: "Add a historical or contemporary photograph to the village gallery.",
      btnText: "Submit Photo for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Photo Title / Caption <span className="text-red-500">*</span></label>
            <input type="text" name="Photo Title" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="e.g. Aerial view of Bandwar (1995)" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
              <select name="Category" required className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer">
                <option value="">Select...</option>
                <option value="temples">Temples</option>
                <option value="festivals">Festivals</option>
                <option value="nature">Nature & River</option>
                <option value="daily-life">Village Life</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Year</label>
              <input type="text" name="Year" placeholder="e.g. 1995" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
            </div>
          </div>
          
          <div className="border-2 border-dashed border-divider rounded-lg p-6 text-center hover:bg-canvas transition-colors relative cursor-pointer">
            <input type="file" name="attachment" accept="image/*" required onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud size={28} className="text-accent mx-auto mb-2" />
            <p className="text-sm font-semibold text-ink">{fileName ? fileName : "Click to select photograph"}</p>
            <p className="text-xs text-ink/50 mt-1">Images are automatically compressed.</p>
          </div>

          {suggestedFileName && (
            <div className="bg-canvas border border-divider rounded-md p-3 flex items-start gap-2.5">
              <FileImage size={16} className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-ink/50 uppercase tracking-wider block mb-0.5">System Filename</span>
                <span className="text-xs font-mono text-ink font-medium break-all">{suggestedFileName}</span>
              </div>
            </div>
          )}

          <input type="hidden" name="Suggested File Name" value={suggestedFileName} />
          <VerificationFields />
        </div>
      )
    },
    directory: {
      title: "Add Directory Listing",
      desc: "Register a new shop, medical facility, or essential service.",
      btnText: "Submit Listing for Verification",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Entity Name <span className="text-red-500">*</span></label>
            <input type="text" name="Name" required placeholder="e.g. Ganesh Medical Store" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
            <select name="Category" required className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer">
              <option value="">Select Category...</option>
              <option value="shops">Shops & Markets</option>
              <option value="health">Health & Medical</option>
              <option value="government">Government</option>
              <option value="transport">Transport</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" name="Phone Number" required placeholder="10-digit number" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Timing <span className="text-ink/40 font-normal">(Optional)</span></label>
              <input type="text" name="Timing" placeholder="e.g. 9 AM - 8 PM" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Address / Landmark <span className="text-ink/40 font-normal">(Optional)</span></label>
            <input type="text" name="Address" placeholder="e.g. Main Road, near Bus Stand" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <VerificationFields />
        </div>
      )
    },
    person: {
      title: "Add Notable Person",
      desc: "Create a profile for a respected elder, leader, or historical figure.",
      btnText: "Submit Profile for Review",
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="Full Name" required placeholder="e.g. Late Ram Prasad Singh" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Role / Designation <span className="text-red-500">*</span></label>
            <input type="text" name="Role" required placeholder="e.g. Freedom Fighter, Social Worker" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Date of Birth</label>
              <input type="text" name="Date of Birth" placeholder="e.g. 1915" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Date of Death</label>
              <input type="text" name="Date of Death" placeholder="If applicable" className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Biography / Life Journey <span className="text-red-500">*</span></label>
            <textarea name="Biography" required placeholder="Provide a detailed account of their life and contributions..." rows={4} className="w-full px-4 py-3 rounded-md border border-divider bg-surface text-ink text-sm resize-y focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
          </div>
          <VerificationFields />
        </div>
      )
    }
  };

  const activeConfig = config[type];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const imageFile = formData.get("attachment") as File;
    if (imageFile && imageFile.size > 0) {
      setIsCompressing(true);
      try {
        const compressedFile = await compressImage(imageFile);
        formData.delete("attachment"); 
        formData.append("image", compressedFile); 
      } catch (error) {
        console.error("Compression failed", error);
        formData.delete("attachment");
        formData.append("image", imageFile);
      } finally {
        setIsCompressing(false);
      }
    }

    formData.append("type", `New ${type.charAt(0).toUpperCase() + type.slice(1)}`);

    try {
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Submission sent for review.", "success");
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => { 
            setIsSuccess(false); 
            setFileName(""); 
            setLiveTitle(""); 
          }, 300);
        }, 3500);
      } else {
        toast(data.details || "Submission failed. Please try again.", "error");
      }
    } catch (error) {
      toast("Network error. Check connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-md font-medium transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Plus size={18} />
        {customButtonText || `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200 no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
        >
          <div 
            ref={modalRef}
            className="bg-surface w-full max-w-xl rounded-lg shadow-2xl overflow-hidden border border-divider flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            
            {/* Header */}
            <div className="flex justify-between items-start p-5 sm:p-6 border-b border-divider bg-canvas/50 shrink-0">
              <div>
                <h2 id="add-modal-title" className="font-serif font-bold text-ink text-xl">
                  {activeConfig.title}
                </h2>
                <p className="text-sm text-ink/60 mt-1 max-w-md">{activeConfig.desc}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                disabled={isSubmitting}
                className="text-ink/40 hover:text-ink p-2 bg-surface border border-divider rounded-md transition-colors shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0 ml-4"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-grow">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">Submission Received</h3>
                  <p className="text-sm text-ink/70 max-w-sm mx-auto leading-relaxed">
                    Thank you for contributing to the archive. The editorial team will review this information for accuracy before publishing.
                  </p>
                </div>
              ) : (
                <form id={`add-form-${type}`} onSubmit={handleSubmit}>
                  {activeConfig.fields}
                </form>
              )}
            </div>

            {/* Footer */}
            {!isSuccess && (
              <div className="p-5 border-t border-divider bg-canvas/50 shrink-0 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-md border border-divider bg-surface text-ink font-medium hover:bg-canvas transition-colors disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form={`add-form-${type}`}
                  disabled={isSubmitting || isCompressing}
                  className="px-6 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 rounded-md font-semibold transition-all shadow-sm disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {isSubmitting || isCompressing ? (
                    <><Loader2 size={18} className="animate-spin" /> {isCompressing ? "Processing..." : "Submitting..."}</>
                  ) : (
                    activeConfig.btnText
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}