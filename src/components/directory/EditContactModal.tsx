"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast"; 

interface EditContactModalProps {
  itemName: string;
  itemId: string; 
  currentPhone: string;
}

export function EditContactModal({ itemName, itemId, currentPhone }: EditContactModalProps) {
  const { toast } = useToast(); 

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  
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
    
    // API Route (telegram-submit) payload
    formData.append("type", "Directory Contact Update");
    formData.append("contextId", itemId);
    formData.append("Item Name", itemName);
    formData.append("field", "Phone Number");
    formData.append("currentValue", currentPhone);
    formData.append("suggestedValue", newPhone);
    
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
        toast("Contact update submitted for review.", "success"); 
        setNewPhone(""); 
        
        setTimeout(() => {
          handleClose();
        }, 3500);
      } else {
        toast(data.details || "Submission failed. Please try again.", "error"); 
      }
    } catch (error) {
      toast("Network error. Please verify your connection.", "error"); 
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
      {/* 🖊️ Trigger Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center p-1.5 text-ink/40 hover:text-accent hover:bg-accent/10 rounded-md transition-all ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent no-print"
        title="Suggest an update for this number"
        aria-label="Edit Phone Number"
      >
        <Pencil size={13} />
      </button>

      {/* 🪟 Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200 no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <div 
            ref={modalRef}
            className="bg-surface w-full max-w-md rounded-lg shadow-2xl overflow-hidden border border-divider flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b border-divider bg-canvas/50 shrink-0">
              <div>
                <h2 id="contact-modal-title" className="font-serif font-bold text-ink text-lg">
                  Suggest Contact Update
                </h2>
                <p className="text-sm text-ink/60 mt-1 truncate max-w-[250px] sm:max-w-[300px]">
                  {itemName}
                </p>
              </div>
              <button 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="text-ink/40 hover:text-ink p-2 bg-surface border border-divider rounded-md transition-colors shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0 ml-2"
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
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">Update Received</h3>
                  <p className="text-sm text-ink/70 max-w-sm mx-auto leading-relaxed">
                    Thank you. The new contact information has been sent to the editorial team for verification.
                  </p>
                </div>
              ) : (
                <form id="contact-update-form" onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Current Value */}
                  <div>
                    <label className="block text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">
                      Current Number
                    </label>
                    <input 
                      type="text" 
                      disabled 
                      value={currentPhone || "Not available"} 
                      className="w-full h-11 px-4 rounded-md border border-divider bg-canvas text-ink/60 text-sm cursor-not-allowed" 
                    />
                  </div>

                  {/* New Value */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">
                      New Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number..." 
                      className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm font-medium focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
                    />
                  </div>

                  <div className="pt-4 border-t border-divider space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-1">Contributor Details</h4>
                      <p className="text-xs text-ink/50 mb-4">This information is kept strictly confidential.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Full Name <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="submitter_name" 
                            required
                            placeholder="e.g. Ramesh Kumar" 
                            className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
                          />
                        </div>
                        
                        {/* Contact */}
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Contact No. <span className="text-ink/40 font-normal">(Optional)</span></label>
                          <input 
                            type="tel" 
                            name="submitter_contact" 
                            placeholder="For verification" 
                            className="w-full h-11 px-4 rounded-md border border-divider bg-surface text-ink text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
                          />
                        </div>
                      </div>

                      {/* Source / Reason */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-ink mb-1.5">Source of Information <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="source_reason" 
                          required
                          placeholder="e.g. I am the owner / Official record" 
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
                  form="contact-update-form"
                  disabled={isSubmitting || !newPhone}
                  className="px-6 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 rounded-md font-semibold transition-all shadow-sm disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Update"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}