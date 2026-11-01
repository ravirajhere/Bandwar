"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function ContributeForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // URL Parameter check karke message auto-fill karna (Red Links ke liye)
  useEffect(() => {
    const newArticleId = searchParams.get("new");
    if (newArticleId) {
      const formattedTitle = newArticleId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      
      setMessage(`I would like to suggest creating a new article for: "${formattedTitle}".\n\nHere are the details I know:\n`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Telegram message format ke liye type add kar rahe hain
    formData.append("type", "General Feedback / Message");

    try {
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Message submitted successfully.", "success");
        setTimeout(() => {
          setIsSuccess(false);
          setMessage(""); 
        }, 3500);
      } else {
        toast(data.details || "Submission failed. Please try again.", "error");
      }
    } catch (error) {
      toast("Network error. Check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🏛️ Formal Success State
  if (isSuccess) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 3xl:w-20 3xl:h-20 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 size={32} className="3xl:w-10 3xl:h-10" />
        </div>
        <h2 className="font-serif text-2xl 3xl:text-3xl font-bold text-ink mb-2">Message Received</h2>
        <p className="text-sm md:text-base 3xl:text-lg text-ink/70 max-w-md mx-auto leading-relaxed">
          Thank you for your feedback. The editorial team has received your message and will review it shortly.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-sm md:text-base font-semibold text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 px-6 py-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Submit another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 3xl:gap-6">
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="Your Name" 
            required
            placeholder="e.g. Ramesh Kumar" 
            className="w-full h-11 3xl:h-14 px-4 rounded-md border border-divider bg-surface text-ink text-sm 3xl:text-base focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            Contact <span className="text-ink/40 font-normal">(Optional)</span>
          </label>
          <input 
            type="text" 
            name="Contact" 
            placeholder="Email or Phone number" 
            className="w-full h-11 3xl:h-14 px-4 rounded-md border border-divider bg-surface text-ink text-sm 3xl:text-base focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-2">
          Message or Feedback <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="Message" 
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Provide your detailed feedback, suggestion, or query here..."
          className="w-full px-4 py-3 rounded-md border border-divider bg-surface text-ink text-sm 3xl:text-base focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-y leading-relaxed"
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white h-12 3xl:h-14 rounded-md font-semibold text-sm 3xl:text-base transition-all shadow-sm disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {isSubmitting ? (
          <><Loader2 size={18} className="animate-spin 3xl:w-6 3xl:h-6" /> Submitting...</>
        ) : (
          <><Send size={18} className="3xl:w-5 3xl:h-5" /> Submit Message</>
        )}
      </button>
    </form>
  );
}