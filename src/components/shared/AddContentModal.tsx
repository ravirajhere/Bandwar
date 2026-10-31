"use client";

import { useState, useEffect } from "react"; // 👈 useEffect import kiya
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
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-")         // Replace spaces with hyphens
      .replace(/-+/g, "-")          // Remove multiple hyphens
      + "-bandwar.jpg"              // Add suffix
  );
};

export function AddContentModal({ type, customButtonText }: AddContentModalProps) {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  
  // 👇 Naya State: Live File Name Preview ke liye
  const [liveTitle, setLiveTitle] = useState("");
  const [suggestedFileName, setSuggestedFileName] = useState("");

  useEffect(() => {
    if (type === "image") {
      setSuggestedFileName(generateFileName(liveTitle));
    }
  }, [liveTitle, type]);

  const config = {
    // ... (article, directory, person config same rahega) ...
    // (Isko chhota karne ke liye maine sirf image wala part highlight kiya hai, baaki aap waise hi rakhein)
    article: {
      title: "Suggest New Article",
      desc: "Have a story or history to share? Write it here.",
      btnText: "Submit Article for Review",
      fields: (
        <>
          <input type="text" name="Article Title" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="Article Title" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <select name="Category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3">
            <option value="">Select Category...</option>
            <option value="history">History</option>
            <option value="culture">Culture</option>
            <option value="education">Education</option>
            <option value="religion">Religion & Temples</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
          <textarea name="Story" required placeholder="Write the full story or details here..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3 resize-y" />
          <input type="text" name="Submitter Name" required placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
        </>
      )
    },
    image: {
      title: "Upload Gallery Photo",
      desc: "Add a historical or recent photo to the village gallery.",
      btnText: "Send Photo for Review",
      fields: (
        <>
          {/* 👇 Yahan onChange add kiya taaki live title mile 👇 */}
          <input type="text" name="Photo Title" required onChange={(e) => setLiveTitle(e.target.value)} placeholder="Photo Caption / Title (e.g., Old Thakurbari)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <select name="Category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3">
            <option value="">Select Category...</option>
            <option value="temples">Temples</option>
            <option value="festivals">Festivals & Culture</option>
            <option value="nature">Nature & River</option>
            <option value="people">Village Life</option>
          </select>
          <input type="text" name="Year" placeholder="Year of photo (e.g., 1995) - Optional" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted-background transition-colors relative cursor-pointer mb-3">
            <input type="file" name="attachment" accept="image/*" required onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud size={24} className="text-brand mx-auto mb-1" />
            <p className="text-sm font-medium text-foreground">{fileName ? fileName : "Click to select image"}</p>
            <p className="text-[11px] text-muted mt-0.5">Auto-compressed before sending</p>
          </div>

          {/* 🪄 NAYA: Live File Name Preview */}
          {suggestedFileName && (
            <div className="bg-brand/5 border border-brand/20 rounded-lg p-3 flex items-start gap-2 mb-3">
              <FileImage size={16} className="text-brand shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-0.5">Suggested File Name</span>
                <span className="text-sm font-mono text-brand font-medium break-all">{suggestedFileName}</span>
              </div>
            </div>
          )}

          {/* Hidden input to pass suggested name to FormData */}
          <input type="hidden" name="Suggested File Name" value={suggestedFileName} />

          <input type="text" name="Submitter Name" required placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
        </>
      )
    },
    directory: {
      title: "Add New Directory Entry",
      desc: "Add a new shop, doctor, or emergency service.",
      btnText: "Submit for Verification",
      fields: (
        <>
          <input type="text" name="Name" required placeholder="Name (e.g., Ganesh Medical Store)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <select name="Category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3">
            <option value="">Select Category...</option>
            <option value="shops">Shops & Markets</option>
            <option value="health">Health & Medical</option>
            <option value="government">Government</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities (Bijli, Pani)</option>
          </select>
          <input type="tel" name="Phone Number" required placeholder="Phone Number" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <input type="text" name="Address" placeholder="Address / Landmark (Optional)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <input type="text" name="Submitter Name" required placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
        </>
      )
    },
    person: {
      title: "Add a Person to Archive",
      desc: "Add a profile of a notable person, elder, or leader.",
      btnText: "Submit Profile for Review",
      fields: (
        <>
          <input type="text" name="Full Name" required placeholder="Full Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <input type="text" name="Role" required placeholder="Role (e.g., Freedom Fighter, Doctor)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" name="Date of Birth" placeholder="DOB (e.g., 1965)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />
            <input type="text" name="Date of Death" placeholder="Death Date (if any)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />
          </div>
          <textarea name="Biography" required placeholder="Short Biography / Life Journey..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3 resize-y" />
          <input type="text" name="Submitter Name" required placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
        </>
      )
    }
  };

  const activeConfig = config[type];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // 📸 Image Compression Logic
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
        toast("Submission sent to Telegram successfully!", "success");
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => { setIsSuccess(false); setFileName(""); setLiveTitle(""); }, 300);
        }, 3000);
      } else {
        toast(data.details || "Failed to send. Please try again.", "error");
      }
    } catch (error) {
      toast("Error sending request. Check connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
      >
        <Plus size={18} />
        {customButtonText || `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background shrink-0">
              <div>
                <h3 className="font-serif font-semibold text-foreground text-base">{activeConfig.title}</h3>
                <p className="text-xs text-muted mt-0.5">{activeConfig.desc}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1.5 bg-background rounded-md transition-colors shadow-sm shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-grow">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-xl font-bold text-foreground mb-2">Dhanyawad!</h4>
                  <p className="text-sm text-muted px-4">Your submission has been sent to Telegram for review.</p>
                </div>
              ) : (
                <form id={`add-form-${type}`} onSubmit={handleSubmit} className="space-y-1">
                  {activeConfig.fields}
                </form>
              )}
            </div>

            {!isSuccess && (
              <div className="p-4 border-t border-border bg-muted-background shrink-0">
                <button 
                  type="submit" 
                  form={`add-form-${type}`}
                  disabled={isSubmitting || isCompressing}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-sm"
                >
                  {isSubmitting || isCompressing ? (
                    <><Loader2 size={18} className="animate-spin" /> {isCompressing ? "Compressing Image..." : "Sending..."}</>
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