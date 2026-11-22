import { getAllArticles, getMasterData } from "@/lib/data";
import { VerifyClient } from "@/components/admin/VerifyClient";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default async function AdminVerifyPage() {
  const allArticles = getAllArticles();
  const master = getMasterData();
  
  // Filter only unverified articles
  const unverifiedArticles = allArticles.filter(a => !a.confidence || a.confidence === 'unverified');
  
  // Get source registry for dropdown
  const sources = master.sourceRegistry?.sources || [];

  return (
    <div className="min-h-screen bg-canvas p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-ink-muted hover:text-accent flex items-center gap-1 mb-2">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="text-accent" /> Verification Queue
            </h1>
            <p className="text-ink-muted mt-1">Review and upgrade unverified knowledge.</p>
          </div>
          <div className="bg-surface border border-divider px-4 py-2 rounded-sm text-sm">
            Pending: <strong className="text-accent">{unverifiedArticles.length}</strong>
          </div>
        </div>

        <VerifyClient articles={unverifiedArticles} sources={sources} />
      </div>
    </div>
  );
}
