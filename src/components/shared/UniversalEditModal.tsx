"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UniversalEditModalProps {
  fieldName: string;       
  currentValue: string;    
  contextId: string;       
  contextType: string;     
  variant?: "icon" | "inline"; 
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
  
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lock background scroll & Auto-focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Handle Escape key & Focus Trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape" && !isSubmitting) {
        handleClose();
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'input, textarea, button'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // API Payload Preparation
    formData.append("type", contextType);
    formData.append("contextId", contextId);
    formData.append("field", fieldName);
    formData.append("currentValue", currentValue);
    formData.append("suggestedValue", suggestedValue);
    
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
        toast("Edit suggestion submitted successfully.", "success");
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => { 
            setIsSuccess(false); 
            setSuggestedValue(""); 
          }, 300);
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
      {variant === "icon" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center p-1.5 text-ink/40 hover:text-accent hover:bg-accent/10 rounded-md transition-all ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent no-print"
          title={`Suggest an edit for ${fieldName}`}
          aria-label={`Suggest an edit for ${fieldName}`}
        >
          <Pencil size={14} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink/50 hover:text-accent hover:bg-accent/10 px-2.5 py-1 rounded-md transition-all ml-2 align-baseline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent no-print"
          title={`Suggest an edit for ${fieldName}`}
        >
          <Pencil size={12} /> Suggest Edit
        </button>
      )}

      {/* 🪟 Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200 no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div 
            ref={modalRef}
            className="bg-surface w-full max-w-xl rounded-lg shadow-2xl overflow-hidden border border-divider flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            
            {/* Header */}
            <div className="flex justify-between items-start p-5 sm:p-6 border-b border-divider bg-canvas/50 shrink-0">
              <div>
                <h2 id="edit-modal-title" className="font-serif font-bold text-ink text-xl">
                  Suggest an Edit
                </h2>
                <p className="text-sm text-ink/60 mt-1">
                  {contextType} &bull; <span className="text-accent font-medium">{fieldName}</span>
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
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-grow">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">Contribution Received</h3>
                  <p className="text-sm text-ink/70 max-w-sm mx-auto leading-relaxed">
                    Thank you for your submission. The editorial team will review this information for accuracy before publishing.
                  </p>
                </div>
              ) : (
                <form id="universal-edit-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Current Value (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-ink/50 uppercase tracking-wider mb-2">
                      Current Information
                    </label>
                    <div className="w-full px-4 py-3 rounded-md border border-divider bg-canvas text-ink/60 text-sm max-h-[120px] overflow-y-auto cursor-not-allowed leading-relaxed">
                      {currentValue || "No data currently available."}
                    </div>
                  </div>

                  {/* New Value (Textarea) */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      Proposed Update <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      ref={textareaRef}
                      required
                      rows={4}
                      value={suggestedValue}
                      onChange={(e) => setSuggestedValue(e.target.value)}
                      placeholder="Enter the accurate information here..." 
                      className="w-full px-4 py-3 rounded-md border border-divider bg-surface text-ink text-sm resize-y focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all leading-relaxed" 
                    />
                  </div>

                  <div className="pt-5 border-t border-divider space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-1">Contributor Details</h4>
                      <p className="text-xs text-ink/50 mb-4">This information is kept strictly confidential and used only for verification.</p>
                      
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
                          placeholder="e.g. Official record, Local resident, Personal knowledge" 
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
                  form="universal-edit-form"
                  disabled={isSubmitting}
                  className="px-6 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 rounded-md font-semibold transition-all shadow-sm disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Contribution"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}