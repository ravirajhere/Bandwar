"use client";

import { useState } from "react";
import { Plus, X, Loader2, CheckCircle2, UploadCloud } from "lucide-react";
import { useToast } from "@/components/ui/Toast"; // 👈 Naya Import

type ContentType = "article" | "image" | "directory" | "person";

interface AddContentModalProps {
  type: ContentType;
  customButtonText?: string;
}

export function AddContentModal({ type, customButtonText }: AddContentModalProps) {
  const { toast } = useToast(); // 👈 Hook call kiya

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  // Dynamic config based on type
  const config = {
    article: {
      title: "Suggest New Article",
      desc: "Have a story or history to share? Write it here.",
      btnText: "Submit Article for Review",
      fields: (
        <>
          <input type="text" name="article_title" required placeholder="Article Title" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <select name="article_category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3">
            <option value="">Select Category...</option>
            <option value="history">History</option>
            <option value="culture">Culture</option>
            <option value="education">Education</option>
            <option value="religion">Religion & Temples</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
          <input type="text" name="article_image_link" placeholder="Image Link (Google Drive/URL) - Optional" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <textarea name="article_summary" required placeholder="Write the full story or details here..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3 resize-y" />
          <input type="text" name="author_name" required placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
        </>
      )
    },
    image: {
      title: "Upload Gallery Photo",
      desc: "Add a historical or recent photo to the village gallery.",
      btnText: "Send Photo for Review",
      fields: (
        <>
          <input type="text" name="image_title" required placeholder="Photo Caption / Title (e.g., Old Thakurbari in 1990)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <select name="image_category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3">
            <option value="">Select Category...</option>
            <option value="temples">Temples</option>
            <option value="festivals">Festivals & Culture</option>
            <option value="nature">Nature & River</option>
            <option value="people">Village Life</option>
          </select>
          <input type="text" name="image_year" placeholder="Year of photo (e.g., 1995) - Optional" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted-background transition-colors relative cursor-pointer mb-3">
            <input type="file" name="attachment" accept="image/*" required onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <UploadCloud size={24} className="text-brand mx-auto mb-1" />
            <p className="text-sm font-medium text-foreground">{fileName ? fileName : "Click to select image"}</p>
            <p className="text-[11px] text-muted mt-0.5">Max 5MB (JPG, PNG)</p>
          </div>
        </>
      )
    },
    directory: {
      title: "Add New Directory Entry",
      desc: "Add a new shop, doctor, or emergency service.",
      btnText: "Submit for Verification",
      fields: (
        <>
          <input type="text" name="dir_name" required placeholder="Name (e.g., Ganesh Medical Store)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <select name="dir_category" required className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3">
            <option value="">Select Category...</option>
            <option value="shops">Shops & Markets</option>
            <option value="health">Health & Medical</option>
            <option value="government">Government</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities (Bijli, Pani)</option>
          </select>
          <input type="tel" name="dir_phone" required placeholder="Phone Number" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <input type="text" name="dir_address" placeholder="Address / Landmark (Optional)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <input type="text" name="dir_timing" placeholder="Timing (e.g., 9 AM - 8 PM) - Optional" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
        </>
      )
    },
    person: {
      title: "Add a Person to Archive",
      desc: "Add a profile of a notable person, elder, or leader.",
      btnText: "Submit Profile for Review",
      fields: (
        <>
          <input type="text" name="person_name" required placeholder="Full Name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <input type="text" name="person_role" required placeholder="Role (e.g., Freedom Fighter, Doctor)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" name="person_dob" placeholder="DOB (e.g., 1965)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />
            <input type="text" name="person_dod" placeholder="Death Date (if any)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" />
          </div>
          <input type="text" name="person_image_link" placeholder="Photo Link (URL) - Optional" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3" />
          <textarea name="person_bio" required placeholder="Short Biography / Life Journey..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm mb-3 resize-y" />
        </>
      )
    }
  };

  const activeConfig = config[type];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key daalein
    formData.append("subject", `New Community Contribution: ${type.toUpperCase()}`);
    formData.append("from_name", "Bandwar Portal Contributor");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Submission sent successfully! Editor will review it soon.", "success"); // 👈 TOAST ADDED
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => { setIsSuccess(false); setFileName(""); }, 300);
        }, 3000);
      } else {
        toast("Something went wrong. Please try again.", "error"); // 👈 ALERT REPLACED
      }
    } catch (error) {
      toast("Error submitting data. Check your connection.", "error"); // 👈 ALERT REPLACED
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
      >
        <Plus size={18} />
        {customButtonText || `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background shrink-0">
              <div>
                <h3 className="font-serif font-semibold text-foreground text-base">{activeConfig.title}</h3>
                <p className="text-xs text-muted mt-0.5">{activeConfig.desc}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground p-1.5 bg-background rounded-md transition-colors shadow-sm shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-grow">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-xl font-bold text-foreground mb-2">Dhanyawad!</h4>
                  <p className="text-sm text-muted px-4">Your submission has been sent to the editor. It will appear on the website after approval.</p>
                </div>
              ) : (
                <form id={`add-form-${type}`} onSubmit={handleSubmit} className="space-y-1">
                  {activeConfig.fields}
                </form>
              )}
            </div>

            {/* Footer (Submit Button) */}
            {!isSuccess && (
              <div className="p-4 border-t border-border bg-muted-background shrink-0">
                <button 
                  type="submit" 
                  form={`add-form-${type}`}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : activeConfig.btnText}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}