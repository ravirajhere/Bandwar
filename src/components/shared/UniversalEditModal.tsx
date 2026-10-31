"use client";

import { useState } from "react";
import { Pencil, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UniversalEditModalProps {
  fieldName: string;       // Jaise: "Article Title", "Students Count"
  currentValue: string;    // Jo abhi website par likha hai
  contextId: string;       // Jaise: "snk-high-school-bandwar"
  contextType: string;     // Jaise: "Article", "Person Profile", "Vision 2030"
  variant?: "icon" | "inline"; // 'icon' = pencil button, 'inline' = [✏️ Edit] text
}

export function UniversalEditModal({ 
  fieldName, 
  currentValue, 
  contextId, 
  contextType,
  variant = "icon" 
}: UniversalEditModalProps) {
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [suggestedValue, setSuggestedValue] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const userName = formData.get("submitter_name") as string;
    const sourceReason = formData.get("source_reason") as string;

    try {
      // 👇 Telegram API Route par request bhej rahe hain 👇
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextId,
          fieldName,
          currentValue,
          suggestedValue,
          userName: userName || "Anonymous",
          sourceReason,
          contextType,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Suggestion sent to Telegram!", "success");
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => { 
            setIsSuccess(false); 
            setSuggestedValue(""); 
          }, 300);
        }, 2500);
      } else {
        toast("Failed to send. Please try again.", "error");
      }
    } catch (error) {
      toast("Error sending request. Check connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setTimeout(() => setIsSuccess(false), 300);
    }
  };

  return (
    <>
      {/* 🖊️ Trigger Button (Icon OR Inline) */}
      {variant === "icon" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center p-1.5 text-muted hover:text-brand hover:bg-brand/10 rounded-md transition-all ml-1.5"
          title={`Suggest edit for ${fieldName}`}
        >
          <Pencil size={13} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-brand hover:bg-brand/10 px-1.5 py-0.5 rounded transition-all ml-2 align-baseline font-medium"
          title={`Suggest edit for ${fieldName}`}
        >
          <Pencil size={12} /> Edit
        </button>
      )}

      {/* 🪟 Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background shrink-0">
              <div>
                <h3 className="font-serif font-semibold text-foreground text-base">
                  Suggest Correction
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {contextType} • <span className="text-brand font-medium">{fieldName}</span>
                </p>
              </div>
              <button onClick={handleClose} className="text-muted hover:text-foreground p-1.5 bg-background rounded-md transition-colors shadow-sm">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-grow">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-xl font-bold text-foreground mb-2">Dhanyawad!</h4>
                  <p className="text-sm text-muted px-4">Your suggestion has been sent to the editor.</p>
                </div>
              ) : (
                <form id="universal-edit-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Current Text (On Website)
                    </label>
                    <div className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted-background text-muted text-sm opacity-80 cursor-not-allowed max-h-[100px] overflow-y-auto custom-scrollbar">
                      {currentValue || "No data currently"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Suggested Correction <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      required
                      rows={3}
                      value={suggestedValue}
                      onChange={(e) => setSuggestedValue(e.target.value)}
                      placeholder="Write the correct information here..." 
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm resize-y" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Your Name (Optional)</label>
                      <input 
                        type="text" 
                        name="submitter_name" 
                        placeholder="e.g. Ramesh" 
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Source / Reason</label>
                      <input 
                        type="text" 
                        name="source_reason" 
                        placeholder="e.g. Official record" 
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm" 
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {!isSuccess && (
              <div className="p-4 border-t border-border bg-muted-background shrink-0">
                <button 
                  type="submit" 
                  form="universal-edit-form"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Submit Suggestion"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}