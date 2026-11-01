"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, FileText, User, Clock, Search, LogOut, Loader2, Rocket } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [queue, setQueue] = useState<any>({ pending: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending");
      const data = await res.json();
      setQueue({ 
        pending: data.pending?.reverse() || [], 
        approved: data.approved?.reverse() || [] 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!document.cookie.includes("admin_session=true")) router.push("/admin");
    else fetchQueue();
  }, [router]);

  const handleAction = async (editId: string, action: "approve" | "reject") => {
    setProcessing(editId);
    try {
      await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId, action })
      });
      fetchQueue(); // Refresh list
    } finally {
      setProcessing(null);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish all staged updates to the live website?")) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/publish", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Successfully published! GitHub updated. Vercel is deploying.`);
        fetchQueue();
        setActiveTab("pending");
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } finally {
      setPublishing(false);
    }
  };

  const currentList = activeTab === "pending" ? queue.pending : queue.approved;

  return (
    <div className="bg-canvas min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-divider pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">Moderation Dashboard</h1>
            <p className="text-sm text-ink-muted mt-1">Review, approve, and batch-publish contributions.</p>
          </div>
          <button onClick={() => { document.cookie = "admin_session=; path=/; max-age=0"; router.push("/admin"); }} className="mt-4 md:mt-0 text-sm text-ink-muted hover:text-red-500 flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex bg-surface border border-divider rounded-sm p-1">
            <button onClick={() => setActiveTab("pending")} className={`px-4 py-1.5 text-sm font-semibold rounded-sm ${activeTab === "pending" ? "bg-accent text-white" : "text-ink-muted"}`}>
              Pending ({queue.pending.length})
            </button>
            <button onClick={() => setActiveTab("approved")} className={`px-4 py-1.5 text-sm font-semibold rounded-sm ${activeTab === "approved" ? "bg-accent text-white" : "text-ink-muted"}`}>
              Staged ({queue.approved.length})
            </button>
          </div>

          {/* 🚀 PUBLISH BUTTON */}
          {activeTab === "approved" && queue.approved.length > 0 && (
            <button 
              onClick={handlePublish}
              disabled={publishing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm font-bold shadow-sm transition-all disabled:opacity-50 animate-in fade-in"
            >
              {publishing ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
              {publishing ? "Publishing to GitHub..." : `Publish ${queue.approved.length} Updates Live`}
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
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
                    <span className="flex items-center gap-1"><FileText size={14} className="text-accent"/> {item.type}</span>
                    <span className="text-divider">|</span>
                    <span className="font-mono text-ink">{item.contextId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-ink-muted">
                    <span className="flex items-center gap-1"><User size={14}/> {item.userName}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">Action: {item.intent}</div>
                  {item.intent === "edit" && item.jsonObj.field && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-sm">
                        <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">Field: {item.jsonObj.field}</span>
                        <p className="text-sm text-ink opacity-70">New Value: {item.jsonObj.suggestedValue}</p>
                      </div>
                    </div>
                  )}
                  {item.intent !== "edit" && (
                    <pre className="bg-canvas p-2 text-xs overflow-auto border border-divider rounded-sm">
                      {JSON.stringify(item.jsonObj, null, 2)}
                    </pre>
                  )}
                </div>

                {/* Actions (Only for Pending Tab) */}
                {activeTab === "pending" && (
                  <div className="px-4 py-3 bg-canvas/50 border-t border-divider flex justify-end gap-2">
                    <button onClick={() => handleAction(item.id, "reject")} disabled={processing === item.id} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold border border-divider bg-surface text-ink hover:bg-red-50 hover:text-red-600 rounded-sm disabled:opacity-50">
                      <XCircle size={16} /> Reject
                    </button>
                    <button onClick={() => handleAction(item.id, "approve")} disabled={processing === item.id} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-accent text-white hover:bg-accent-hover rounded-sm disabled:opacity-50">
                      {processing === item.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                      Stage for Publish
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}