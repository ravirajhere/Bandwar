"use client";

import { useState, useEffect } from "react";
import { Pencil, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useContributorGate } from "@/hooks/useContributorGate";

interface EditContactModalProps {
  itemName: string;
  itemId: string;
  currentPhone: string;
}

export function EditContactModal({ itemName, itemId, currentPhone }: EditContactModalProps) {
  const { toast } = useToast();
  const { submitWithGate, registrationModal } = useContributorGate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("type", "Directory Contact Update");
    formData.append("contextId", itemId);
    formData.append("field", "Phone Number");
    formData.append("currentValue", currentPhone);
    formData.append("suggestedValue", newPhone);

    // 🚀 Use the Gate
    await submitWithGate(formData, async (data) => {
      try {
        const res = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const resData = await res.json();
        
        if (resData.success) {
          setIsSuccess(true);
          toast("Contact update submitted.", "success");
          setTimeout(() => {
            setIsOpen(false);
            setTimeout(() => { setIsSuccess(false); setNewPhone(""); }, 300);
          }, 3000);
        } else {
          toast(resData.error || "Failed to send request.", "error");
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
        className="inline-flex items-center justify-center p-1.5 text-ink/40 hover:text-accent hover:bg-accent/10 rounded-sm transition-all ml-1 no-print"
        title="Suggest an update for this number"
      >
        <Pencil size={14} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-surface w-full max-w-md rounded-sm shadow-xl border border-divider flex flex-col">
            
            <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50">
              <div>
                <h2 className="font-serif font-bold text-ink text-lg">Update Contact</h2>
                <p className="text-sm text-ink-muted mt-1 truncate">{itemName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 border border-divider rounded-sm hover:bg-canvas">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-serif font-bold text-ink">Update Received</h3>
                  <p className="text-sm text-ink-muted mt-1">The new number has been sent for review.</p>
                </div>
              ) : (
                <form id="edit-contact-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Current Number</label>
                    <input type="text" disabled value={currentPhone} className="w-full h-11 px-4 rounded-sm border border-divider bg-canvas text-ink-muted text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">New Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      required 
                      value={newPhone} 
                      onChange={(e) => setNewPhone(e.target.value)} 
                      placeholder="Enter 10-digit number"
                      className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Source of Information <span className="text-red-500">*</span></label>
                    <input type="text" name="source_reason" required placeholder="e.g. I am the owner" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
                  </div>
                </form>
              )}
            </div>

            {!isSuccess && (
              <div className="p-4 border-t border-divider bg-canvas/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-divider rounded-sm text-sm">Cancel</button>
                <button type="submit" form="edit-contact-form" disabled={isSubmitting || !newPhone} className="px-5 py-2 bg-accent text-white rounded-sm font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Submit Update"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 🚀 Render Auth Modal */}
      {registrationModal}
    </>
  );
}