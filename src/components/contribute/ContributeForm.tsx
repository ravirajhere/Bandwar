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
      // 📱 Telegram API Route par bhej rahe hain
      const response = await fetch("/api/telegram-submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        toast("Message sent to Telegram!", "success");
        setTimeout(() => {
          setIsSuccess(false);
          setMessage(""); // Success ke baad message clear kar dein
        }, 3000);
      } else {
        toast(data.details || "Something went wrong. Please try again.", "error");
      }
    } catch (error) {
      toast("Error sending message. Check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Dhanyawad!</h2>
        <p className="text-muted">Your message has been sent to the village editors.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-brand font-medium hover:underline bg-brand/10 px-6 py-2 rounded-lg"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Your Name (Optional)</label>
          <input 
            type="text" 
            name="Your Name" 
            placeholder="e.g. Ramesh Kumar" 
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Contact (Email/Phone)</label>
          <input 
            type="text" 
            name="Contact" 
            placeholder="So we can reply to you" 
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Your Message</label>
        <textarea 
          name="Message" 
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your feedback, suggestion, or general query here..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all resize-y"
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-sm disabled:opacity-70"
      >
        {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : <><Send size={20} /> Send Message</>}
      </button>
    </form>
  );
}