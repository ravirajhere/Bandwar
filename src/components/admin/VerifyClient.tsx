"use client";

import React, { useState, useMemo } from "react";
import { Article } from "@/lib/schema";
import { ShieldCheck, CheckCircle2, ChevronRight, Search, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VerifyClientProps {
  articles: Article[];
  sources: any[];
}

export function VerifyClient({ articles, sources }: VerifyClientProps) {
  const router = useRouter();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // ✅ PHASE 5: Search + Category Filter + Bulk Select
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form State
  const [tier, setTier] = useState("community");
  const [method, setMethod] = useState("document");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [notes, setNotes] = useState("");

  const categories = useMemo(() => {
    const s = new Set<string>();
    articles.forEach(a => a.categories?.forEach(c => s.add(c)));
    return Array.from(s).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter(a => {
      if (catFilter !== "all" && !a.categories?.includes(catFilter)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q);
    });
  }, [articles, search, catFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const resetForm = () => { setVerifiedBy(""); setSourceId(""); setNotes(""); };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !verifiedBy.trim()) return alert("Please enter who verified this.");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: selectedArticle.id, tier, verifiedBy: verifiedBy.trim(), sourceId, notes, method }),
      });
      if (res.ok) {
        alert("✅ Article verified successfully!");
        setSelectedArticle(null);
        resetForm();
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(`❌ Failed: ${d.error || "Verify failed"}`);
      }
    } catch (err) { console.error(err); alert("Error occurred."); }
    finally { setIsSubmitting(false); }
  };

  // ✅ BULK: Ek hi form se selected sab verify — API ek-ek karke call hoga, GitHub pe alag-alag commit jayega (safe)
  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return alert("Pehle article select karo.");
    if (!verifiedBy.trim()) return alert("Pehle 'Verified By' bharo — bulk me wahi sab pe lagega.");
    if (!confirm(`${selectedIds.size} article ek saath verify karna hai? Tier: ${tier}, Method: ${method}`)) return;
    setBulkSubmitting(true);
    let ok = 0, fail = 0;
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await fetch("/api/admin/verify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: id, tier, verifiedBy: verifiedBy.trim(), sourceId, notes, method }),
        });
        if (res.ok) ok++; else fail++;
      } catch { fail++; }
    }
    setBulkSubmitting(false);
    setSelectedIds(new Set());
    resetForm();
    alert(`Bulk done — ✅ ${ok} verified, ❌ ${fail} failed`);
    router.refresh();
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

  // Tier se confidence kya banega — admin ko pehle se pata chale
  const tierInfo: Record<string, string> = {
    community: "→ Confidence: medium",
    elder: "→ Confidence: verified",
    archival: "→ Confidence: verified + Archival badge",
  };

  return (
    <div>
      {/* SEARCH + FILTER + BULK BAR */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-surface border border-divider rounded-sm px-3">
          <Search size={16} className="text-ink-muted shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search unverified article..." className="w-full py-2 text-sm bg-transparent outline-none" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-surface border border-divider rounded-sm px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {selectedIds.size > 0 && (
          <button onClick={handleBulkVerify} disabled={bulkSubmitting} className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-sm disabled:opacity-50 flex items-center gap-2">
            {bulkSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Bulk Verify ({selectedIds.size})
          </button>
        )}
      </div>
      <p className="text-xs text-ink-muted mb-4">Showing {filtered.length} / {articles.length} • Tick karke Bulk Verify kar sakta hai, ya ek pe click karke single verify.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List */}
        <div className="md:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <p className="bg-surface border border-divider p-6 text-center text-sm text-ink-muted rounded-sm">Koi result nahi — search / filter clear karke dekho.</p>
          ) : filtered.map((article) => (
            <div
              key={article.id}
              className={`bg-surface border p-4 rounded-sm flex items-center justify-between gap-3 transition-colors ${selectedArticle?.id === article.id ? 'border-accent ring-1 ring-accent' : 'border-divider hover:border-accent/50'}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input type="checkbox" checked={selectedIds.has(article.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(article.id); }} onClick={(e) => e.stopPropagation()} className="w-4 h-4 mt-1 shrink-0 cursor-pointer" />
                <div className="min-w-0 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                  <h4 className="font-bold text-ink truncate">{article.title}</h4>
                  <p className="text-xs text-ink-muted mt-1 uppercase tracking-wider">{article.categories.join(', ')}</p>
                  {article.summary && <p className="text-xs text-ink-muted mt-1 line-clamp-2">{article.summary}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/article/${article.id}`} target="_blank" onClick={(e) => e.stopPropagation()} className="p-1.5 text-ink-muted hover:text-accent" title="View public"><Eye size={16} /></Link>
                <button onClick={() => setSelectedArticle(article)} className="p-1.5"><ChevronRight size={18} className={selectedArticle?.id === article.id ? "text-accent" : "text-ink-muted"} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Form Sidebar */}
        <div className="md:col-span-1">
          {selectedArticle || selectedIds.size > 0 ? (
            <form onSubmit={handleVerify} className="bg-surface border border-accent p-6 rounded-sm sticky top-6">
              <h3 className="font-serif text-lg font-bold text-ink mb-1">Verify Data</h3>
              <p className="text-sm text-ink-muted mb-4 pb-4 border-b border-divider">
                {selectedArticle ? <>Verifying: <strong>{selectedArticle.title}</strong></> : <><strong>{selectedIds.size} articles</strong> bulk verify honge</>}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Trust Tier</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full border border-divider p-2 text-sm bg-canvas">
                    <option value="community">Community (2+ Residents)</option>
                    <option value="elder">Elder-Validated</option>
                    <option value="archival">Archival (Document/Record)</option>
                  </select>
                  <p className="text-[11px] text-accent mt-1 font-semibold">{tierInfo[tier]}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Verification Method</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border border-divider p-2 text-sm bg-canvas">
                    <option value="document">Document / Record dekha</option>
                    <option value="elder">Elder se baat hui</option>
                    <option value="community">Community se confirm hua</option>
                    <option value="field">Field Visit / Photo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Verified By (Name/Role) *</label>
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
                <button type="submit" disabled={isSubmitting || !selectedArticle} className="w-full bg-accent text-white p-2.5 font-bold text-sm rounded-sm hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <ShieldCheck size={16} /> {isSubmitting ? "Verifying..." : "Confirm Verification"}
                </button>
                {selectedIds.size > 0 && (
                  <button type="button" onClick={handleBulkVerify} disabled={bulkSubmitting} className="w-full border border-accent text-accent p-2.5 font-bold text-sm rounded-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {bulkSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Bulk Verify ({selectedIds.size})
                  </button>
                )}
                <button type="button" onClick={() => { setSelectedArticle(null); setSelectedIds(new Set()); resetForm(); }} className="w-full text-xs font-semibold text-ink-muted py-1">Clear Selection</button>
              </div>
            </form>
          ) : (
            <div className="bg-canvas border border-dashed border-divider p-8 text-center rounded-sm sticky top-6">
              <ShieldCheck size={32} className="mx-auto text-ink-muted mb-3" />
              <p className="text-sm text-ink-muted">Select an article from the list to verify its provenance and confidence tier. Ya checkbox se multiple select karke Bulk Verify karo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}