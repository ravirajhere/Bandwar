"use client";

import { useState } from "react";
import { Pencil, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast"; // 👈 Naya Import

interface EditContactModalProps {
  itemName: string;
  currentPhone: string;
}

export function EditContactModal({ itemName, currentPhone }: EditContactModalProps) {
  const { toast } = useToast(); // 👈 Hook call kiya

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key yahan daalein
    formData.append("subject", `Update Phone Request: ${itemName}`);
    formData.append("from_name", "Bandwar Portal Visitor");
    formData.append("item_name", itemName);
    formData.append("old_phone", currentPhone);
    formData.append("new_phone", newPhone);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Number update request sent successfully!", "success"); // 👈 TOAST ADDED
        setNewPhone("");
        // Auto close after 2.5 seconds
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => setIsSuccess(false), 300);
        }, 2500);
      } else {
        toast("Something went wrong. Please try again.", "error"); // 👈 ALERT REPLACED
      }
    } catch (error) {
      toast("Error sending request. Please check your connection.", "error"); // 👈 ALERT REPLACED
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
      {/* 🖊️ Pencil Edit Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="ml-1.5 inline-flex items-center justify-center p-1.5 text-muted hover:text-brand hover:bg-brand/10 rounded-md transition-all"
        title="Suggest an update for this number"
        aria-label="Edit Phone Number"
      >
        <Pencil size={13} />
      </button>

      {/* 🪟 Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-border">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted-background">
              <h3 className="font-serif font-semibold text-foreground text-sm">Update Contact Info</h3>
              <button onClick={handleClose} className="text-muted hover:text-foreground p-1 rounded-md transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3 animate-bounce" />
                  <h4 className="text-base font-bold text-foreground mb-1">Dhanyawad!</h4>
                  <p className="text-xs text-muted">Your update has been sent to the editor for review.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-foreground/80 leading-snug">
                    Suggest a new number for <strong className="text-foreground">{itemName}</strong>.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Current Number</label>
                    <input 
                      type="text" 
                      disabled 
                      value={currentPhone || "Not available"} 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-muted-background text-muted text-sm cursor-not-allowed" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">New Number</label>
                    <input 
                      type="tel" 
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter new number..." 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none text-sm font-medium" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newPhone}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 text-sm mt-2"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Submit Update"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}