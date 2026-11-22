"use client";

import React, { useState } from "react";
import { Article } from "@/lib/schema";
import { ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface VerifyClientProps {
  articles: Article[];
  sources: any[];
}

export function VerifyClient({ articles, sources }: VerifyClientProps) {
  const router = useRouter();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [tier, setTier] = useState("community");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [notes, setNotes] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !verifiedBy) return alert("Please enter who verified this.");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: selectedArticle.id,
          tier,
          verifiedBy,
          sourceId,
          notes,
          method: "document" // Can be made dynamic
        }),
      });

      if (res.ok) {
        alert("Article verified successfully!");
        setSelectedArticle(null);
        router.refresh(); // Refresh data
      } else {
        alert("Failed to verify.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="bg-surface border border-divider p-10 text-center rounded-sm">
        <CheckCircle2 size={40} className="mx-auto text-[#1F7A3D] mb-4" />
        <h3 className="text-xl font-bold text-ink mb-2">All caught up!</h3>
        <p className="text-ink-muted">Every article in the archive has a verified source.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* List of unverified articles */}
      <div className="md:col-span-2 space-y-4">
        {articles.map((article) => (
          <div 
            key={article.id} 
            className={`bg-surface border p-4 rounded-sm flex items-center justify-between cursor-pointer transition-colors ${selectedArticle?.id === article.id ? 'border-accent ring-1 ring-accent' : 'border-divider hover:border-accent/50'}`}
            onClick={() => setSelectedArticle(article)}
          >
            <div>
              <h4 className="font-bold text-ink">{article.title}</h4>
              <p className="text-xs text-ink-muted mt-1 uppercase tracking-wider">{article.categories.join(', ')}</p>
            </div>
            <ChevronRight size={18} className={selectedArticle?.id === article.id ? "text-accent" : "text-ink-muted"} />
          </div>
        ))}
      </div>

      {/* Verification Form Sidebar */}
      <div className="md:col-span-1">
        {selectedArticle ? (
          <form onSubmit={handleVerify} className="bg-surface border border-accent p-6 rounded-sm sticky top-6">
            <h3 className="font-serif text-lg font-bold text-ink mb-4">Verify Data</h3>
            <p className="text-sm text-ink-muted mb-6 pb-4 border-b border-divider">You are verifying: <strong>{selectedArticle.title}</strong></p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Trust Tier</label>
                <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full border border-divider p-2 text-sm bg-canvas">
                  <option value="community">Community (2+ Residents)</option>
                  <option value="elder">Elder-Validated</option>
                  <option value="archival">Archival (Document/Record)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Verified By (Name/Role)</label>
                <input required type="text" value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="e.g., Village Elder or Archivist" className="w-full border border-divider p-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Source (Optional)</label>
                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full border border-divider p-2 text-sm bg-canvas">
                  <option value="">-- No specific source document --</option>
                  {sources.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-divider p-2 text-sm" placeholder="Any specific context for this verification..."></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-white p-2.5 font-bold text-sm rounded-sm hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> {isSubmitting ? "Verifying..." : "Confirm Verification"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-canvas border border-dashed border-divider p-8 text-center rounded-sm sticky top-6">
            <ShieldCheck size={32} className="mx-auto text-ink-muted mb-3" />
            <p className="text-sm text-ink-muted">Select an article from the list to verify its provenance and confidence tier.</p>
          </div>
        )}
      </div>
    </div>
  );
}
