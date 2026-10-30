import { Suspense } from "react";
import { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { ShieldCheck, CheckCircle2, UserCheck } from "lucide-react";
import { getAllArticles } from "@/lib/data"; // 👈 Import kiya

export const metadata: Metadata = {
  title: "Contribute to the Archive | Bandwar Portal",
  description: "Help us keep the Bandwar portal accurate. Submit corrections, new articles, or historical photos.",
};

export default function ContributePage() {
  // 👈 Saare articles fetch kiye taaki dropdown me suggestions aayein
  const articles = getAllArticles().map(a => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    hero: a.hero
  }));

  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom max-w-6xl">
        
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            Contribute to the Village
          </h1>
          <div className="w-20 h-1 bg-brand mb-6 rounded-full mx-auto"></div>
          <p className="text-lg text-muted leading-relaxed">
            The Bandwar digital archive is built by the community. Spot an error? Have a historical photo? Let us know below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
          
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
            <Suspense fallback={<div className="text-center py-20 text-muted">Loading form...</div>}>
              {/* 👈 Articles prop pass kiye */}
              <ContributeForm articles={articles} />
            </Suspense>
          </div>

          <div className="space-y-6 sticky top-24">
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-brand" /> Editorial Review
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Every submission is reviewed manually by our village editors. If approved, it will be published within 24-48 hours.
              </p>
            </div>

            <div className="bg-muted-background border border-border rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand" /> Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-foreground/80">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Accuracy:</strong> Provide a source for historical facts.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Respect:</strong> Content must be respectful to all.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}