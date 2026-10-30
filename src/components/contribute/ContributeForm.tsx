"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send, CheckCircle2, Search, X } from "lucide-react";

// Type definitions
type ArticleOption = { id: string; title: string; summary: string; hero?: string };

export function ContributeForm({ articles }: { articles: ArticleOption[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form States
  const [contributionType, setContributionType] = useState("correction");
  const [errorField, setErrorField] = useState("title");
  
  // Auto-suggest States
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-fill "Current Text"
  const [currentText, setCurrentText] = useState("");

  const searchParams = useSearchParams();

  // URL parameters handle karna (agar kisi article page se aaya hai)
  useEffect(() => {
    const pageId = searchParams.get("page");
    if (pageId) {
      const found = articles.find(a => a.id === pageId);
      if (found) setSelectedArticle(found);
    }
  }, [searchParams, articles]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Jab bhi field ya article change ho, current text update karo
  useEffect(() => {
    if (!selectedArticle) {
      setCurrentText("");
      return;
    }

    if (errorField === "title") {
      setCurrentText(selectedArticle.title);
    } else if (errorField === "description") {
      setCurrentText(selectedArticle.summary);
    } else {
      setCurrentText(""); // Infobox ya contact ke liye manual type karna padega
    }
  }, [selectedArticle, errorField]);

  const filteredArticles = searchQuery.length > 0 
    ? articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE"); // 👈 Apni Web3Forms key daalein
    formData.append("subject", `New Contribution: ${contributionType.toUpperCase()}`);
    
    // Page URL auto-fill
    if (selectedArticle) {
      formData.set("page_url", `/article/${selectedArticle.id}`);
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) setIsSuccess(true);
      else alert("Something went wrong.");
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
        <p className="text-muted mb-6">Your contribution has been sent for editorial review.</p>
        <button onClick={() => setIsSuccess(false)} className="text-brand font-medium hover:underline bg-brand/10 px-6 py-2 rounded-lg">
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">1. Your Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Your Name (Optional)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none" />
          <input type="text" name="contact" placeholder="Contact Number / Email" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none" />
        </div>
      </div>

      {/* 2. What to change */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">2. What needs to be changed?</h3>
        
        <select name="contribution_type" value={contributionType} onChange={(e) => setContributionType(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none">
          <option value="correction">Correction (Edit existing info)</option>
          <option value="new_article">New Article / History</option>
          <option value="photo">Historical Photo</option>
          <option value="directory">Directory Info (Doctor, Shop)</option>
        </select>

        {/* 🚀 AUTOCOMPLETE SEARCH (Sirf Correction ya Photo ke liye) */}
        {(contributionType === "correction" || contributionType === "photo") && (
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-foreground mb-1.5">Search the Article / Page</label>
            {selectedArticle ? (
              <div className="flex items-center justify-between bg-brand/10 border border-brand/30 px-4 py-3 rounded-lg">
                <span className="font-semibold text-brand text-sm">{selectedArticle.title}</span>
                <button type="button" onClick={() => { setSelectedArticle(null); setSearchQuery(""); }} className="text-brand hover:bg-brand/20 p-1 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Type 2-3 letters of the article name..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                {/* Dropdown Results */}
                {showDropdown && searchQuery.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map(article => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => { setSelectedArticle(article); setShowDropdown(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-muted-background border-b border-border-subtle last:border-0 transition-colors"
                        >
                          <p className="font-semibold text-foreground text-sm">{article.title}</p>
                          <p className="text-xs text-muted line-clamp-1">{article.summary}</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted">No article found for "{searchQuery}"</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. The Details */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">3. The Details</h3>
        
        {contributionType === "correction" && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Which field has the error?</label>
              <select name="error_field" value={errorField} onChange={(e) => setErrorField(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none">
                <option value="title">Title / Heading</option>
                <option value="description">Description / Paragraph</option>
                <option value="infobox">InfoBox Data (Numbers, Codes)</option>
                <option value="contact">Contact Info</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Current Text (Auto-filled)</label>
                {/* 👈 Yahan auto-filled current text aayega */}
                <textarea 
                  name="current_info" 
                  value={currentText} 
                  readOnly={errorField === "title" || errorField === "description"}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder={selectedArticle ? "Auto-filled..." : "Please select an article above first"}
                  className={`w-full px-4 py-2.5 rounded-lg border border-border outline-none transition-all ${errorField === "title" || errorField === "description" ? "bg-muted-background text-muted cursor-not-allowed" : "bg-background focus:ring-2 focus:ring-brand"}`}
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Suggested (Correct) Text</label>
                <textarea name="suggested_info" rows={3} placeholder="What should it say..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none"></textarea>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Additional Message</label>
          <textarea name="message" rows={2} placeholder="Explain your changes..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none resize-y"></textarea>
        </div>
      </div>

      {/* 4. Verification */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">4. Verification</h3>
        <input type="text" name="source" placeholder="Source / Proof (e.g., Website link, Book name)" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand outline-none" />
      </div>

      <button type="submit" disabled={isSubmitting || !selectedArticle && (contributionType === "correction" || contributionType === "photo")} className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6">
        {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : <><Send size={20} /> Submit Contribution</>}
      </button>
    </form>
  );
}