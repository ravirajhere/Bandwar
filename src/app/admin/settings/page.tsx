"use client";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(j => { setData(j.data); setLoading(false); });
  }, []);
  if (loading) return <AdminShell title="Settings"><p className="text-sm text-ink-muted">Loading...</p></AdminShell>;
  if (!data) return <AdminShell title="Settings"><p className="text-sm">Not found</p></AdminShell>;

  const set = (path: string, val: string) => {
    const copy = JSON.parse(JSON.stringify(data));
    const keys = path.split(".");
    let cur = copy;
    for (let i = 0; i < keys.length - 1; i++) { if (!cur[keys[i]]) cur[keys[i]] = {}; cur = cur[keys[i]]; }
    cur[keys[keys.length - 1]] = val;
    setData(copy);
  };

  const save = async () => {
    const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
    if (!res.ok) return alert("Save failed");
    alert("Saved — Site update ho gaya");
  };

  return (
    <AdminShell title="Settings" subtitle="Homepage + Site — bina code ke">
      <div className="space-y-4 max-w-2xl">
        <div className="bg-surface border border-divider p-4 rounded-sm space-y-2">
          <h3 className="font-serif font-bold">Site</h3>
          <input value={data.site?.name || ""} onChange={e => set("site.name", e.target.value)} placeholder="Site Name" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
          <input value={data.site?.tagline || ""} onChange={e => set("site.tagline", e.target.value)} placeholder="Tagline" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
          <textarea value={data.site?.description || ""} onChange={e => set("site.description", e.target.value)} placeholder="Description" rows={2} className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
        </div>
        <div className="bg-surface border border-divider p-4 rounded-sm space-y-2">
          <h3 className="font-serif font-bold">Homepage Hero</h3>
          <input value={data.home?.hero?.title || ""} onChange={e => set("home.hero.title", e.target.value)} placeholder="Hero Title" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
          <input value={data.home?.hero?.tagline || ""} onChange={e => set("home.hero.tagline", e.target.value)} placeholder="Hero Tagline" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
          <input value={data.home?.hero?.image || ""} onChange={e => set("home.hero.image", e.target.value)} placeholder="Hero Image" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
        </div>
        <div className="bg-surface border border-divider p-4 rounded-sm space-y-2">
          <h3 className="font-serif font-bold">SEO</h3>
          <input value={data.seo?.defaultDescription || ""} onChange={e => set("seo.defaultDescription", e.target.value)} placeholder="Default Description" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
          <input value={data.seo?.ogImage || ""} onChange={e => set("seo.ogImage", e.target.value)} placeholder="OG Image" className="w-full border border-divider px-3 py-2 text-sm rounded-sm" />
        </div>
        <button onClick={save} className="bg-accent text-white px-6 py-2 text-sm font-semibold rounded-sm">Save Settings</button>
      </div>
    </AdminShell>
  );
}