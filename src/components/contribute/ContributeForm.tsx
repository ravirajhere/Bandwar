"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export function ContributeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Web3Forms Access Key
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Yahan apni key daalein
    formData.append("subject", "New Contribution for Bandwar Portal");
    formData.append("from_name", "Bandwar Website Visitor");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send size={32} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Dhanyawad! (Thank You)</h2>
        <p className="text-muted">Your contribution has been sent to the village editors for review.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-brand font-medium hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Row 1: Name & Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Your Name (Optional)</label>
          <input 
            type="text" 
            name="name" 
            placeholder="e.g. Ramesh Kumar" 
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact Number / Email</label>
          <input 
            type="text" 
            name="contact" 
            placeholder="So we can reach you" 
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all"
          />
        </div>
      </div>

      {/* Row 2: Type of Contribution */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">What are you contributing?</label>
        <select 
          name="contribution_type" 
          required
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all"
        >
          <option value="correction">Correction / Edit an existing page</option>
          <option value="new_article">New Article / History</option>
          <option value="photo">Historical Photo / Gallery</option>
          <option value="directory">Update Directory Info (Doctor, Shop, etc.)</option>
          <option value="other">Other Suggestion</option>
        </select>
      </div>

      {/* Row 3: Page URL (Auto-filled) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Which page is this about? (Optional)</label>
        <input 
          type="text" 
          name="page_url" 
          placeholder="e.g. /article/snk-high-school-bandwar" 
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all text-sm"
        />
      </div>

      {/* Row 4: Details */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Details / Message</label>
        <textarea 
          name="message" 
          required
          rows={5}
          placeholder="Please explain what needs to be changed or added. Be as detailed as possible..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all resize-y"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <><Loader2 size={20} className="animate-spin" /> Sending...</>
        ) : (
          <><Send size={20} /> Submit Contribution</>
        )}
      </button>
    </form>
  );
}