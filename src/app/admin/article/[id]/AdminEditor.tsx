"use client";
import { useState } from "react";
import Link from "next/link";
import type { Article, Category } from "@/lib/schema";
import AdminShell from "@/app/admin/AdminShell";
import { Loader2, ArrowRight } from "lucide-react";

export default function AdminEditor({ initialArticle, allCategories }: { initialArticle: Article; allCategories: Category[] }) {
  const [article, setArticle] = useState(initialArticle);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const update = (patch: Partial<Article>) => setArticle(a => ({ ...a, ...patch }));
  const updateContent = (i: number, field: "heading" | "text", value: string) => {
    const content = [...article.content];
    content[i] = { ...content[i], [field]: value };
    update({ content });
  };

  async function save(publish: boolean) {
    setSaving(true); setMsg("");
    const payload = { ...article, status: publish ? "published" : "draft", published: publish, lastUpdated: new Date().toISOString(), dateModified: new Date().toISOString() };
    const res = await fetch(`/api/admin/article/${article.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    setMsg(res.ok ? (publish ? "🎉 Published — GitHub updated. Vercel is deploying." : "✅ Draft saved — Public ko nahi dikhega") : `❌ ${data.error}`);
  }

  const inputCls = "w-full bg-surface border border-divider rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent";
  const labelCls = "text-xs font-bold text-ink uppercase tracking-wider block mb-1.5";

  return (
    <AdminShell title={`Edit — ${article.title}`} subtitle="Direct page pe edit karo, Save Draft ya Publish karo.">
      {/* TOP ACTION BAR — Dashboard ke Publish button jaisa */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <Link href={`/article/${article.id}`} target="_blank" className="flex items-center gap-1 text-sm font-semibold text-ink hover:text-accent">
          View Public Page <ArrowRight size={16} />
        </Link>
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

      <div className="space-y-4">
        <div className="bg-surface border border-divider rounded-sm p-4">
          <label className={labelCls}>Title</label>
          <input value={article.title} onChange={e => update({ title: e.target.value })} className={`${inputCls} font-serif text-xl font-bold`} />
          <label className={`${labelCls} mt-4`}>Subtitle</label>
          <input value={article.subtitle} onChange={e => update({ subtitle: e.target.value })} className={inputCls} />
          <label className={`${labelCls} mt-4`}>Summary</label>
          <textarea value={article.summary} onChange={e => update({ summary: e.target.value })} rows={4} className={inputCls} />
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
              <span className="text-xs font-bold text-ink uppercase">Section {i + 1}</span>
              <button onClick={() => update({ content: article.content.filter((_, j) => j !== i) })} className="text-xs font-semibold text-red-500">Remove</button>
            </div>
            <div className="p-4 space-y-3">
              <input value={block.heading} onChange={e => updateContent(i, "heading", e.target.value)} className={`${inputCls} font-serif font-bold`} placeholder="Heading" />
              <textarea value={block.text} onChange={e => updateContent(i, "text", e.target.value)} rows={8} className={inputCls} />
            </div>
          </div>
        ))}

        <button onClick={() => update({ content: [...article.content, { heading: "New Section", text: "" }] })} className="w-full py-2.5 text-sm font-semibold border border-divider bg-surface text-ink rounded-sm">+ Add Section</button>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => save(false)} className="px-4 py-1.5 text-sm font-semibold border border-divider bg-surface rounded-sm">Save Draft</button>
          <button onClick={() => save(true)} className="px-6 py-1.5 text-sm font-semibold bg-accent text-white rounded-sm">Publish All At Once</button>
        </div>
      </div>
    </AdminShell>
  );
}