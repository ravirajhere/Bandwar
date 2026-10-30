"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export function ContributeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [defaultUrl, setDefaultUrl] = useState("");
  const [contributionType, setContributionType] = useState("correction"); // Default type
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageId = searchParams.get("page");
    const personId = searchParams.get("person");
    
    if (pageId) {
      setDefaultUrl(`/article/${pageId}`);
    } else if (personId) {
      setDefaultUrl(`/people/${personId}`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key yahan daalein
    formData.append("subject", `New Contribution: ${contributionType.toUpperCase()}`);
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
          <CheckCircle2 size={40} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Dhanyawad! (Thank You)</h2>
        <p className="text-muted mb-6">Your contribution has been sent to the village editors for review.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="text-brand font-medium hover:underline bg-brand/10 px-6 py-2 rounded-lg"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECTION 1: Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">1. Your Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
            <input type="text" name="name" placeholder="e.g. Ramesh Kumar" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Contact (Email/Phone)</label>
            <input type="text" name="contact" placeholder="So we can credit you" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* SECTION 2: What & Where */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">2. What needs to be changed?</h3>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Type of Contribution</label>
          <select 
            name="contribution_type" 
            value={contributionType}
            onChange={(e) => setContributionType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all"
          >
            <option value="correction">Correction (Edit existing info)</option>
            <option value="new_article">New Article / History</option>
            <option value="photo">Historical Photo</option>
            <option value="directory">Directory Info (Doctor, Shop)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Page URL / Location</label>
          <input 
            type="text" 
            name="page_url" 
            defaultValue={defaultUrl}
            placeholder="e.g. /article/snk-high-school" 
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all text-sm text-muted"
          />
        </div>
      </div>

      {/* SECTION 3: Specific Details (Dynamic) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">3. The Details</h3>
        
        {/* Agar Correction hai toh yeh dikhega */}
        {contributionType === "correction" && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Which field has the error?</label>
              <select name="error_field" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all">
                <option value="title">Title / Heading</option>
                <option value="description">Description / Paragraph</option>
                <option value="infobox">InfoBox Data (Numbers, Codes)</option>
                <option value="contact">Contact Info</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Current (Wrong) Text</label>
                <textarea name="current_info" rows={2} placeholder="What is currently written..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Suggested (Correct) Text</label>
                <textarea name="suggested_info" rows={2} placeholder="What should it say..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all"></textarea>
              </div>
            </div>
          </>
        )}

        {/* Agar Photo hai */}
        {contributionType === "photo" && (
          <div className="bg-muted-background p-4 rounded-lg border border-border-subtle text-sm text-muted mb-4">
            <strong>Note:</strong> Aap direct yahan photo upload nahi kar sakte. Kripya photo ka link (Google Drive/WhatsApp) neeche message me daalein, ya photo ko seedha editor ke email par bhejein.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Additional Message (Optional)</label>
          <textarea name="message" rows={3} placeholder="Explain your contribution in detail..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all resize-y"></textarea>
        </div>
      </div>

      {/* SECTION 4: Verification */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">4. Verification</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Source / Proof (Highly Recommended)</label>
          <input type="text" name="source" placeholder="e.g. Book name, website link, or 'I am a local resident'" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none transition-all" />
          <p className="text-xs text-muted mt-1.5">Providing a source helps our editors approve your request faster.</p>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-6">
        {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : <><Send size={20} /> Submit Contribution</>}
      </button>
    </form>
  );
}