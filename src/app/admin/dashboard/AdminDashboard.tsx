"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/app/admin/AdminShell";
import {
  CheckCircle2, XCircle, FileText, User, Clock,
  Loader2, Image as ImageIcon, Rocket,
  ShieldCheck, ArrowRight, FilePlus2, Users, Images, Activity, BookOpen, Eye
} from "lucide-react";

interface Stats {
  totalArticles: number;
  published: number;
  drafts: number;
  unverified: number;
  people: number;
  contributors: number;
  gallery: number;
  updatedThisWeek: number;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  confidence: string;
  lastUpdated: string;
  lastEditedBy: string;
}

interface AdminDashboardProps {
  pendingVerificationCount: number;
  stats: Stats;
  recentArticles: RecentArticle[];
}

export function AdminDashboard({ pendingVerificationCount, stats, recentArticles }: AdminDashboardProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<any>({ pending: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [authError, setAuthError] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending", { credentials: "same-origin" });
      if (res.status === 401 || res.status === 403) { router.replace("/admin"); return; }
      if (!res.ok) throw new Error("Failed to load queue");
      const data = await res.json();
      setQueue({ pending: [...(data.pending || [])].reverse(), approved: [...(data.approved || [])].reverse() });
      setAuthError(false);
    } catch (err) { console.error(err); setAuthError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleAction = async (editId: string, action: "approve" | "reject") => {
    setProcessing(editId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ editId, action }),
      });
      if (res.status === 401) { router.replace("/admin"); return; }
      await fetchQueue();
    } catch (err) { console.error(err); alert("Action failed. Please try again."); }
    finally { setProcessing(null); }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish all staged updates to the live website?")) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/publish", { method: "POST", credentials: "same-origin" });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      if (data.success) { alert("🎉 Successfully published! GitHub updated. Vercel is deploying."); await fetchQueue(); setActiveTab("pending"); }
      else alert(`❌ Failed: ${data.error}`);
    } catch (error: any) { alert(`❌ Error: ${error.message}`); }
    finally { setPublishing(false); }
  };

  const currentList = activeTab === "pending" ? queue.pending : queue.approved;

  // --- PHASE 2: COMMAND CENTER CARDS ---
  const cards = [
    { label: "Total Articles", value: stats.totalArticles, sub: `${stats.published} published • ${stats.drafts} draft`, icon: BookOpen },
    { label: "Pending Review", value: queue.pending.length, sub: "Approve / Reject karo", icon: FileText },
    { label: "Staged for Publish", value: queue.approved.length, sub: "Publish dabao, live hoga", icon: Rocket },
    { label: "Unverified", value: stats.unverified, sub: "Trust upgrade chahiye", icon: ShieldCheck },
    { label: "People", value: stats.people, sub: `${stats.contributors} contributors`, icon: Users },
    { label: "Gallery Photos", value: stats.gallery, sub: `${stats.updatedThisWeek} updated this week`, icon: Images },
  ];

  return (
    <AdminShell title="Moderation Dashboard" subtitle="Review, approve, and batch-publish contributions.">
      {/* COMMAND CENTER — STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-divider rounded-sm p-4">
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">{c.label}</p>
              <c.icon size={18} className="text-accent" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink mt-1">{c.value}</p>
            <p className="text-xs text-ink-muted mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS + RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-divider rounded-sm p-4">
          <h3 className="font-serif font-bold text-ink mb-3 flex items-center gap-2"><FilePlus2 size={18} className="text-accent" /> Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/admin/verify" className="flex justify-between items-center text-sm font-semibold text-ink hover:text-accent border border-divider rounded-sm px-3 py-2">Verify Queue <ArrowRight size={16} /></Link>
            <a href="#queue" className="flex justify-between items-center text-sm font-semibold text-ink hover:text-accent border border-divider rounded-sm px-3 py-2">Review Pending ({queue.pending.length}) <ArrowRight size={16} /></a>
            <button onClick={handlePublish} disabled={publishing || queue.approved.length === 0} className="w-full flex justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-sm text-sm font-bold">
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />} Publish {queue.approved.length} Staged
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-surface border border-divider rounded-sm p-4">
          <h3 className="font-serif font-bold text-ink mb-3 flex items-center gap-2"><Activity size={18} className="text-accent" /> Recently Updated Articles</h3>
          {recentArticles.length === 0 ? <p className="text-sm text-ink-muted">Koi recent update nahi.</p> : (
            <div className="divide-y divide-divider">
              {recentArticles.map((a) => (
                <div key={a.id} className="py-2.5 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/article/${a.id}`} className="text-sm font-semibold text-ink hover:text-accent truncate block">{a.title}</Link>
                    <p className="text-xs text-ink-muted">By {a.lastEditedBy} • {new Date(a.lastUpdated).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${a.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{a.status}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${a.confidence === "verified" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"}`}>{a.confidence}</span>
                    <Link href={`/admin/article/${a.id}`} className="text-xs font-semibold text-accent flex items-center gap-1 ml-1"><Eye size={14} /> Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VERIFICATION QUEUE BANNER — same as before */}
      <Link href="/admin/verify" className="group block mb-8 bg-surface border border-divider hover:border-accent rounded-sm p-4 transition-colors relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 p-2.5 rounded-full text-accent group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                Verification Queue
                {pendingVerificationCount > 0 && (
                  <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {pendingVerificationCount} Pending
                  </span>
                )}
              </h3>
              <p className="text-sm text-ink-muted mt-0.5">Review unverified knowledge and upgrade trust tiers.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-ink group-hover:text-accent transition-colors shrink-0">
            Open Queue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      <div id="queue" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 scroll-mt-8">
        <div className="flex bg-surface border border-divider rounded-sm p-1">
          <button onClick={() => setActiveTab("pending")} className={`px-4 py-1.5 text-sm font-semibold rounded-sm ${activeTab === "pending" ? "bg-accent text-white" : "text-ink-muted"}`}>
            Pending ({queue.pending.length})
          </button>
          <button onClick={() => setActiveTab("approved")} className={`px-4 py-1.5 text-sm font-semibold rounded-sm ${activeTab === "approved" ? "bg-accent text-white" : "text-ink-muted"}`}>
            Staged ({queue.approved.length})
          </button>
        </div>
        {activeTab === "approved" && queue.approved.length > 0 && (
          <button onClick={handlePublish} disabled={publishing} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm font-bold shadow-sm transition-all disabled:opacity-50">
            {publishing ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
            {publishing ? "Publishing..." : `Publish ${queue.approved.length} Updates Live`}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
      ) : authError ? (
        <div className="text-center py-20 bg-surface border border-divider rounded-sm">
          <h3 className="text-lg font-serif text-ink">Session expired</h3>
          <p className="text-sm text-ink-muted mt-1">Please log in again.</p>
          <button onClick={() => router.replace("/admin")} className="mt-4 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-sm">Return to Login</button>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-divider rounded-sm">
          <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3 opacity-50" />
          <h3 className="text-lg font-serif text-ink">No items {activeTab === "pending" ? "pending" : "staged"}!</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((item: any) => (
            <div key={item.id} className="bg-surface border border-divider rounded-sm overflow-hidden">
              <div className="bg-canvas/50 border-b border-divider px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3 text-xs font-medium text-ink-muted">
                  <span className="flex items-center gap-1"><FileText size={14} className="text-accent" /> {item.type}</span>
                  <span className="text-divider">|</span>
                  <span className="font-mono text-ink">{item.contextId}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-ink-muted">
                  <span className="flex items-center gap-1"><User size={14} /> {item.userName} ({item.userUsername})</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col md:flex-row gap-6">
                {item.pendingImageUrl && (
                  <div className="w-full md:w-64 shrink-0 border border-divider p-2 bg-canvas rounded-sm">
                    <div className="text-[10px] font-bold text-ink-muted uppercase mb-2 flex items-center gap-1">
                      <ImageIcon size={12} /> New Image Preview
                    </div>
                    <img src={item.pendingImageUrl} alt="Pending" className="w-full h-auto object-cover rounded-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(item.pendingImageUrl, "_blank")} />
                    <p className="text-xs text-ink-muted mt-2">Target: {item.targetType === "person" ? "People Profile" : "Article Hero"}</p>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">
                    Action: {item.intent} ({item.field || "Image Update"})
                  </div>
                  {item.field && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-sm">
                        <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">Old {item.field}</span>
                        <p className="text-sm text-ink opacity-70 line-through break-words">{item.oldValue || "Empty"}</p>
                      </div>
                      <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-sm">
                        <span className="text-[10px] font-bold text-green-600 uppercase block mb-1">New {item.field}</span>
                        <p className="text-sm text-ink font-medium break-words">{item.newValue}</p>
                      </div>
                    </div>
                  )}
                  {item.sourceReason && <p className="text-sm text-ink-muted mt-3 italic">Source: &ldquo;{item.sourceReason}&rdquo;</p>}
                </div>
              </div>
              {activeTab === "pending" && (
                <div className="px-4 py-3 bg-canvas/50 border-t border-divider flex justify-end gap-2">
                  <button onClick={() => handleAction(item.id, "reject")} disabled={processing === item.id} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold border border-divider bg-surface text-ink hover:bg-red-50 hover:text-red-600 rounded-sm disabled:opacity-50">
                    <XCircle size={16} /> Reject
                  </button>
                  <button onClick={() => handleAction(item.id, "approve")} disabled={processing === item.id} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-accent text-white hover:bg-accent-hover rounded-sm disabled:opacity-50">
                    {processing === item.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Stage for Publish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}