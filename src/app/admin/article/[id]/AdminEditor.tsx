"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Article, Category } from "@/lib/schema";
import AdminShell from "@/app/admin/AdminShell";
import { Loader2, ArrowRight, ArrowUp, ArrowDown, Trash2, Eye, Image as ImageIcon, AlertTriangle } from "lucide-react";

export default function AdminEditor({ initialArticle, allCategories }: { initialArticle: Article; allCategories: Category[] }) {
  const [article, setArticle] = useState(initialArticle);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // ✅ Unsaved warning — galti se back / reload pe data nahi jayega
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const update = (patch: Partial<Article>) => { setArticle(a => ({ ...a, ...patch })); setIsDirty(true); };
  const updateContent = (i: number, field: "heading" | "text", value: string) => {
    const content = [...article.content];
    content[i] = { ...content[i], [field]: value };
    update({ content });
  };
  const moveSection = (i: number, dir: -1 | 1) => {
    const content = [...article.content];
    const j = i + dir;
    if (j < 0 || j >= content.length) return;
    [content[i], content[j]] = [content[j], content[i]];
    update({ content });
  };

  async function save(publish: boolean) {
    setSaving(true); setMsg("");
    const payload = { ...article, status: publish ? "published" : "draft", published: publish, lastUpdated: new Date().toISOString(), dateModified: new Date().toISOString() };
    const res = await fetch(`/api/admin/article/${article.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (res.ok) setIsDirty(false);
    setMsg(res.ok ? (publish ? "🎉 Published — GitHub updated. Vercel is deploying." : "✅ Draft saved — Public ko nahi dikhega") : `❌ ${data.error}`);
  }

  // ✅ Word count + Reading time
  const totalWords = article.content.reduce((acc, b) => acc + (b.heading + " " + b.text).split(/\s+/).filter(Boolean).length, 0);
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  const inputCls = "w-full bg-surface border border-divider rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent";
  const labelCls = "text-xs font-bold text-ink uppercase tracking-wider block mb-1.5";

  return (
    <AdminShell title={`Edit — ${article.title}`} subtitle="Direct page pe edit karo, Save Draft ya Publish karo.">
      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/article/${article.id}`} target="_blank" className="flex items-center gap-1 text-sm font-semibold text-ink hover:text-accent">
            View Public Page <ArrowRight size={16} />
          </Link>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${article.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{article.status || "draft"}</span>
          {isDirty && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase flex items-center gap-1"><AlertTriangle size={12} /> Unsaved</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className="px-4 py-1.5 text-sm font-semibold border border-divider bg-surface text-ink rounded-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => save(true)} disabled={saving} className="flex items-center gap-2 px-6 py-1.5 text-sm font-semibold bg-accent text-white rounded-sm disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} Publish
          </button>
        </div>
      </div>

      {msg && <p className="mb-4 bg-surface border border-divider rounded-sm p-3 text-sm text-ink">{msg}</p>}

      {/* STATS BAR */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface border border-divider rounded-sm p-3 text-center"><p className="text-xl font-serif font-bold">{totalWords}</p><p className="text-[10px] font-bold text-ink-muted uppercase">Words</p></div>
        <div className="bg-surface border border-divider rounded-sm p-3 text-center"><p className="text-xl font-serif font-bold">{readingTime} min</p><p className="text-[10px] font-bold text-ink-muted uppercase">Reading Time</p></div>
        <div className="bg-surface border border-divider rounded-sm p-3 text-center"><p className="text-xl font-serif font-bold">{article.content.length}</p><p className="text-[10px] font-bold text-ink-muted uppercase">Sections</p></div>
      </div>

      <div className="space-y-4">
        <div className="bg-surface border border-divider rounded-sm p-4">
          <label className={labelCls}>Title</label>
          <input value={article.title} onChange={e => update({ title: e.target.value })} className={`${inputCls} font-serif text-xl font-bold`} />
          <label className={`${labelCls} mt-4`}>Subtitle</label>
          <input value={article.subtitle} onChange={e => update({ subtitle: e.target.value })} className={inputCls} />
          <label className={`${labelCls} mt-4`}>Summary</label>
          <textarea value={article.summary} onChange={e => update({ summary: e.target.value })} rows={4} className={inputCls} />
        </div>

        {/* ✅ NEW: META — Slug / Author / Confidence / Hero Image */}
        <div className="bg-surface border border-divider rounded-sm p-4">
          <h3 className="font-serif font-bold text-ink mb-3">Meta & SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Slug / ID (URL)</label>
              <input value={article.id} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              <p className="text-[11px] text-ink-muted mt-1">Slug change nahi hoga — URL toot jayega.</p>
            </div>
            <div>
              <label className={labelCls}>Author</label>
              <input value={(article as any).author || ""} onChange={e => update({ author: e.target.value } as any)} className={inputCls} placeholder="Author name" />
            </div>
            <div>
              <label className={labelCls}>Confidence / Trust</label>
              <select value={(article as any).confidence || "unverified"} onChange={e => update({ confidence: e.target.value } as any)} className={inputCls}>
                <option value="unverified">Unverified</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="verified">Verified</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Hero Image URL</label>
              <input value={(article as any).image || (article as any).heroImage || ""} onChange={e => update({ image: e.target.value, heroImage: e.target.value } as any)} className={inputCls} placeholder="/images/..." />
            </div>
          </div>
          {((article as any).image || (article as any).heroImage) && (
            <div className="mt-3 border border-divider p-2 bg-canvas rounded-sm">
              <p className="text-[10px] font-bold text-ink-muted uppercase mb-2 flex items-center gap-1"><ImageIcon size={12} /> Hero Preview</p>
              <img src={(article as any).image || (article as any).heroImage} alt="Hero" className="w-full max-h-64 object-cover rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>

        <div className="bg-surface border border-divider rounded-sm p-4">
          <label className={labelCls}>Categories (min 1)</label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(c => {
              const active = article.categories.includes(c.id);
              return <button key={c.id} onClick={() => update({ categories: active ? article.categories.filter(x => x !== c.id) : [...article.categories, c.id] })} className={`px-4 py-1.5 text-sm font-semibold rounded-sm border ${active ? "bg-accent text-white border-accent" : "bg-canvas border-divider text-ink-muted"}`}>{c.title}</button>;
            })}
          </div>
          <label className={`${labelCls} mt-4`}>Tags (comma se)</label>
          <input value={article.tags.join(", ")} onChange={e => update({ tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className={inputCls} />
        </div>

        {article.content.map((block, i) => (
          <div key={i} className="bg-surface border border-divider rounded-sm overflow-hidden">
            <div className="bg-canvas/50 border-b border-divider px-4 py-2.5 flex justify-between items-center">
              <span className="text-xs font-bold text-ink uppercase">Section {i + 1} • {block.text.split(/\s+/).filter(Boolean).length} words</span>
              <div className="flex gap-1">
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="p-1 border border-divider rounded-sm disabled:opacity-30" title="Up"><ArrowUp size={14} /></button>
                <button onClick={() => moveSection(i, 1)} disabled={i === article.content.length - 1} className="p-1 border border-divider rounded-sm disabled:opacity-30" title="Down"><ArrowDown size={14} /></button>
                <button onClick={() => { if (confirm("Ye section delete karna hai?")) update({ content: article.content.filter((_, j) => j !== i) }); }} className="p-1 border border-divider rounded-sm text-red-500" title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <input value={block.heading} onChange={e => updateContent(i, "heading", e.target.value)} className={`${inputCls} font-serif font-bold`} placeholder="Heading" />
              <textarea value={block.text} onChange={e => updateContent(i, "text", e.target.value)} rows={8} className={inputCls} placeholder="Section text..." />
            </div>
          </div>
        ))}

        <button onClick={() => update({ content: [...article.content, { heading: "New Section", text: "" }] })} className="w-full py-2.5 text-sm font-semibold border border-divider bg-surface text-ink rounded-sm">+ Add Section</button>

        <div className="flex justify-between items-center pt-2">
          <Link href="/admin/dashboard" className="text-sm font-semibold text-ink-muted hover:text-ink">← Back to Dashboard</Link>
          <div className="flex gap-2">
            <button onClick={() => save(false)} disabled={saving} className="px-4 py-1.5 text-sm font-semibold border border-divider bg-surface rounded-sm disabled:opacity-50">Save Draft</button>
            <button onClick={() => save(true)} disabled={saving} className="px-6 py-1.5 text-sm font-semibold bg-accent text-white rounded-sm disabled:opacity-50 flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish All At Once</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}