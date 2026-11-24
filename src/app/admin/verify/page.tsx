import { getAllArticles, getMasterData } from "@/lib/data";
import { VerifyClient } from "@/components/admin/VerifyClient";
import AdminShell from "@/app/admin/AdminShell";

export default async function AdminVerifyPage() {
  const allArticles = getAllArticles();
  const master = getMasterData();
  
  // Filter only unverified articles
  const unverifiedArticles = allArticles.filter(a => !a.confidence || a.confidence === 'unverified');
  
  // Get source registry for dropdown
  const sources = master.sourceRegistry?.sources || [];

  return (
    <AdminShell title="Verification Queue" subtitle="Review and upgrade unverified knowledge.">
      {/* Pending Count — Dashboard ke banner jaisa */}
      <div className="flex justify-between items-center mb-6 bg-surface border border-divider rounded-sm p-4">
        <p className="text-sm text-ink-muted">
          Unverified articles jo abhi trust tier upgrade ka wait kar rahe hain.
        </p>
        <div className="bg-canvas border border-divider px-4 py-2 rounded-sm text-sm shrink-0">
          Pending: <strong className="text-accent">{unverifiedArticles.length}</strong>
        </div>
      </div>

      <VerifyClient articles={unverifiedArticles} sources={sources} />
    </AdminShell>
  );
}