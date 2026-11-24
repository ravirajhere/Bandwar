"use client";
import { useState } from "react";
import type { Article, Category } from "@/lib/schema";

export default function AdminEditor({ initialArticle, allCategories }: {
  initialArticle: Article;
  allCategories: Category[];
}) {
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
    const payload = {
      ...article,
      status: publish ? "published" : "draft",
      published: publish,
      lastUpdated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    const res = await fetch(`/api/admin/article/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    setMsg(res.ok ? (publish ? "✅ Published — Public page live ho gaya" : "✅ Draft saved — Public ko nahi dikhega") : `❌ ${data.error}`);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      {/* ADMIN HEADER — Ye hi tera Full Access Bar hai */}
      <div style={{ position: "sticky", top: 0, background: "#111", color: "#fff", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <b>ADMIN — {article.id}</b>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => save(false)} disabled={saving} style={{ padding: "8px 14px", borderRadius: 8, background: "#fff", color: "#111" }}>
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => save(true)} disabled={saving} style={{ padding: "8px 14px", borderRadius: 8, background: "#1D4ED8", color: "#fff" }}>
            Publish
          </button>
        </div>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {/* TITLE / SUBTITLE / SUMMARY — Direct Page Pe Edit */}
      <label>Title</label>
      <input value={article.title} onChange={e => update({ title: e.target.value })} style={{ width: "100%", fontSize: 32, fontWeight: 800, padding: 10, marginBottom: 12 }} />

      <label>Subtitle</label>
      <input value={article.subtitle} onChange={e => update({ subtitle: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 12 }} />

      <label>Summary</label>
      <textarea value={article.summary} onChange={e => update({ summary: e.target.value })} rows={4} style={{ width: "100%", padding: 10, marginBottom: 16 }} />

      {/* CATEGORIES + TAGS */}
      <label>Categories (min 1)</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {allCategories.map(c => {
          const active = article.categories.includes(c.id);
          return (
            <button key={c.id} onClick={() => {
              const categories = active ? article.categories.filter(x => x !== c.id) : [...article.categories, c.id];
              update({ categories });
            }} style={{ padding: "6px 12px", borderRadius: 20, background: active ? "#1D4ED8" : "#eee", color: active ? "#fff" : "#111" }}>
              {c.title}
            </button>
          );
        })}
      </div>

      <label>Tags (comma se alag karo)</label>
      <input value={article.tags.join(", ")} onChange={e => update({ tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} style={{ width: "100%", padding: 10, marginBottom: 24 }} />

      {/* CONTENT — Har Section Edit */}
      <h2>Content</h2>
      {article.content.map((block, i) => (
        <div key={i} style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <input value={block.heading} onChange={e => updateContent(i, "heading", e.target.value)} placeholder="Heading" style={{ width: "100%", fontWeight: 700, padding: 8, marginBottom: 8 }} />
          <textarea value={block.text} onChange={e => updateContent(i, "text", e.target.value)} rows={8} style={{ width: "100%", padding: 8 }} />
          <button onClick={() => update({ content: article.content.filter((_, j) => j !== i) })} style={{ marginTop: 8, color: "red" }}>Remove Section</button>
        </div>
      ))}
      <button onClick={() => update({ content: [...article.content, { heading: "New Section", text: "" }] })} style={{ padding: "10px 16px", borderRadius: 8, background: "#111", color: "#fff" }}>+ Add Section</button>

      <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
        <a href={`/article/${article.id}`} target="_blank" style={{ padding: "10px 16px", border: "1px solid #111", borderRadius: 8 }}>View Public Page ↗</a>
        <button onClick={() => save(false)} disabled={saving} style={{ padding: "10px 16px", borderRadius: 8, background: "#fff", border: "1px solid #ccc" }}>Save Draft</button>
        <button onClick={() => save(true)} disabled={saving} style={{ padding: "10px 16px", borderRadius: 8, background: "#1D4ED8", color: "#fff" }}>Publish All At Once</button>
      </div>
    </div>
  );
}