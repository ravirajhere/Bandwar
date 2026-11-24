"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Cat = { id: string; title: string; icon: string; description?: string };
type Block = { heading: string; text: string };
type Faq = { q: string; a: string };
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `article-${Date.now()}`;
const emptyForm = () => ({ title: "", subtitle: "", categories: ["culture"] as string[], summary: "", hero: "", infoboxText: "", content: [{ heading: "Overview", text: "" }] as Block[], faqs: [] as Faq[], tagsText: "", relatedText: "", status: "published" });

export default function ArticlesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [filterCat, setFilterCat] = useState("culture");
  const [articles, setArticles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [del, setDel] = useState<any>(null);
  const [delConfirm, setDelConfirm] = useState("");

  const load = async (cat: string) => {
    setLoading(true);
    const r = await fetch(`/api/admin/articles?category=${cat}`);
    const j = await r.json();
    setArticles(j.articles || []); setCats(j.categories || []); setLoading(false);
  };
  useEffect(() => { load(filterCat); }, [filterCat]);

  const post = async (body: any) => {
    const res = await fetch("/api/admin/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json(); if (!res.ok) { alert(j.error || "Failed"); return false; } return true;
  };
  const parseInfobox = (t: string) => { const obj: any = {}; t.split("\n").forEach(l => { const i = l.indexOf(":"); if (i > 0) obj[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }); return obj; };
  const toInfoboxText = (o: any) => Object.entries(o || {}).map(([k, v]) => `${k}: ${v}`).join("\n");

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setShow(true); };
  const openEdit = (a: any) => {
    setEditingId(a.id);
    setForm({ title: a.title, subtitle: a.subtitle || "", categories: a.categories?.length ? a.categories : [filterCat], summary: a.summary || "", hero: a.hero || "", infoboxText: toInfoboxText(a.infobox), content: a.content?.length ? a.content : [{ heading: "Overview", text: "" }], faqs: a.faqs || [], tagsText: (a.tags || []).join(", "), relatedText: (a.related || []).join(", "), status: a.status || "published" });
    setShow(true);
  };
  const toggleCat = (id: string) => { setForm(f => f.categories.includes(id) ? { ...f, categories: f.categories.filter(c => c !== id) } : { ...f, categories: [...f.categories, id] }); };

  const save = async () => {
    if (!form.title.trim()) return alert("Title zaroori hai");
    if (form.categories.length === 0) return alert("Kam se kam 1 category tick karo — pehli wali primary hogi");
    const payload: any = {
      title: form.title, subtitle: form.subtitle, categories: form.categories, summary: form.summary, hero: form.hero || "/fallback.jpg",
      photos: form.hero ? [{ src: form.hero.replace(/^\//, ""), caption: form.title, imageAlt: form.title }] : [],
      infobox: parseInfobox(form.infoboxText), lastUpdated: new Date().toISOString().slice(0, 10),
      content: form.content.filter(c => c.heading || c.text), faqs: form.faqs.filter(f => f.q || f.a),
      tags: form.tagsText.split(",").map(s => s.trim()).filter(Boolean), related: form.relatedText.split(",").map(s => s.trim()).filter(Boolean),
      location: { lat: 25.5008, lng: 86.1608 }, status: form.status, lastEditedBy: "Bandwar Editor",
    };
    if (editingId) {
      const res = await fetch(`/api/admin/article/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, id: editingId, datePublished: new Date().toISOString().slice(0, 10) }) });
      const j = await res.json(); if (!res.ok) return alert(j.error || "Edit failed — Validation fail ho toh saare required field bhare hai ya nahi check karo");
    } else {
      const ok = await post({ action: "add", category: filterCat, ...payload, id: slugify(form.title) });
      if (!ok) return;
    }
    setShow(false); load(filterCat);
  };

  const doDelete = async () => {
    if (!del || delConfirm.trim() !== del.id) return alert("ID sahi se type karo");
    const ok = await post({ action: "delete", id: del.id, category: filterCat });
    if (ok) { setDel(null); load(filterCat); }
  };
  const filtered = articles.filter(a => `${a.title} ${a.summary}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell title="Articles" subtitle={`${articles.length} articles in ${filterCat} • Pehli tick ki hui category = primary file`}>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-divider bg-surface px-3 py-2 text-sm rounded-sm">{cats.map(c => <option key={c.id} value={c.id}>{c.title} ({c.id})</option>)}</select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title..." className="flex-1 min-w-[180px] border border-divider bg-surface px-3 py-2 text-sm rounded-sm" />
        <button onClick={openAdd} className="bg-accent text-white px-4 py-2 text-sm font-semibold rounded-sm">+ New Article</button>
      </div>
      {loading ? <p className="text-sm text-ink-muted">Loading...</p> : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="bg-surface border border-divider rounded-sm px-4 py-3 flex justify-between gap-3">
              <div><p className="text-sm font-semibold">{a.title} <span className="text-xs font-normal px-1.5 py-0.5 rounded-sm bg-canvas border border-divider ml-1">{a.status || "published"}</span></p><p className="text-xs text-ink-muted">{(a.categories || []).join(" • ")} • {a.datePublished} • {a.content?.length || 0} sections • {a.faqs?.length || 0} FAQs</p><p className="text-xs mt-1 line-clamp-2">{a.summary}</p></div>
              <div className="flex gap-2 shrink-0 items-start"><button onClick={() => openEdit(a)} className="border border-divider px-3 py-1 text-xs font-semibold rounded-sm">Edit</button><button onClick={() => { setDel(a); setDelConfirm(""); }} className="border border-red-200 text-red-600 px-3 py-1 text-xs font-semibold rounded-sm">Delete</button></div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-ink-muted">Is category me koi article nahi.</p>}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShow(false)}>
          <div className="bg-surface w-full max-w-2xl rounded-sm p-5 my-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-bold">{editingId ? "Edit Article" : "New Article"}</h3>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" />
            <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-2"><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="border border-divider bg-surface px-3 py-2 text-sm rounded-sm"><option value="published">Published</option><option value="draft">Draft</option></select><span className="text-xs text-ink-muted self-center">Draft = public ko nahi dikhega</span></div>
            <p className="text-xs font-semibold mt-3 mb-1">Categories — pehli tick = primary file:</p>
            <div className="flex flex-wrap gap-2">{cats.map(c => (<label key={c.id} className="flex items-center gap-1 text-xs border border-divider px-2 py-1 rounded-sm"><input type="checkbox" checked={form.categories.includes(c.id)} onChange={() => toggleCat(c.id)} /> {c.title}</label>))}</div>
            <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Summary — 2-3 line" rows={3} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" />
            <input value={form.hero} onChange={e => setForm({ ...form, hero: e.target.value })} placeholder="Hero image — /images/culture/xxx.jpg" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <textarea value={form.infoboxText} onChange={e => setForm({ ...form, infoboxText: e.target.value })} placeholder={"Infobox — ek line me ek:\nType: Religious fair\nDuration: 2-3 days"} rows={3} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <p className="text-xs font-semibold mt-3">Content Sections:</p>
            {form.content.map((b, i) => (
              <div key={i} className="border border-divider rounded-sm p-2 mt-2">
                <input value={b.heading} onChange={e => { const c = [...form.content]; c[i].heading = e.target.value; setForm({ ...form, content: c }); }} placeholder="Heading" className="w-full border border-divider px-2 py-1 text-sm rounded-sm" />
                <textarea value={b.text} onChange={e => { const c = [...form.content]; c[i].text = e.target.value; setForm({ ...form, content: c }); }} placeholder="Text — [[id|link text]] se dusre article link kar sakte ho" rows={4} className="w-full border border-divider px-2 py-1 text-sm rounded-sm mt-1" />
                <button onClick={() => setForm({ ...form, content: form.content.filter((_, j) => j !== i) })} className="text-xs text-red-600 mt-1">Remove section</button>
              </div>
            ))}
            <button onClick={() => setForm({ ...form, content: [...form.content, { heading: "", text: "" }] })} className="text-xs border border-divider px-3 py-1 rounded-sm mt-2">+ Add Section</button>
            <p className="text-xs font-semibold mt-3">FAQs:</p>
            {form.faqs.map((f, i) => (
              <div key={i} className="border border-divider rounded-sm p-2 mt-2">
                <input value={f.q} onChange={e => { const x = [...form.faqs]; x[i].q = e.target.value; setForm({ ...form, faqs: x }); }} placeholder="Question" className="w-full border border-divider px-2 py-1 text-sm rounded-sm" />
                <textarea value={f.a} onChange={e => { const x = [...form.faqs]; x[i].a = e.target.value; setForm({ ...form, faqs: x }); }} placeholder="Answer" rows={2} className="w-full border border-divider px-2 py-1 text-sm rounded-sm mt-1" />
                <button onClick={() => setForm({ ...form, faqs: form.faqs.filter((_, j) => j !== i) })} className="text-xs text-red-600 mt-1">Remove FAQ</button>
              </div>
            ))}
            <button onClick={() => setForm({ ...form, faqs: [...form.faqs, { q: "", a: "" }] })} className="text-xs border border-divider px-3 py-1 rounded-sm mt-2">+ Add FAQ</button>
            <input value={form.tagsText} onChange={e => setForm({ ...form, tagsText: e.target.value })} placeholder="Tags — comma se alag" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-3" />
            <input value={form.relatedText} onChange={e => setForm({ ...form, relatedText: e.target.value })} placeholder="Related article IDs — comma se alag" className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={save} className="flex-1 bg-accent text-white py-2 text-sm font-semibold rounded-sm">Save Article</button><button onClick={() => setShow(false)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}
      {del && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface w-full max-w-md rounded-sm p-5">
            <h3 className="font-bold text-red-600">⚠️ Permanent Delete?</h3>
            <p className="text-sm mt-2">{del.title} — hamesha ke liye delete hoga. Koi Trash / Undo nahi.</p>
            <p className="text-sm mt-3">ID type karo: <b>{del.id}</b></p>
            <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)} placeholder={del.id} className="w-full border border-divider px-3 py-2 text-sm rounded-sm mt-2" />
            <div className="flex gap-2 mt-4"><button onClick={doDelete} className="flex-1 bg-red-600 text-white py-2 text-sm font-semibold rounded-sm">Delete Permanently</button><button onClick={() => setDel(null)} className="px-4 border border-divider py-2 text-sm rounded-sm">Cancel</button></div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}