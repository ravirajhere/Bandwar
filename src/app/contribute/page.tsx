import { Suspense } from "react";
import { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { ShieldCheck, FileText, CheckCircle2, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contribute to the Archive | Bandwar Portal",
  description: "Help us keep the Bandwar portal accurate. Submit corrections, new articles, or historical photos.",
};

export default function ContributePage() {
  return (
    <div className="bg-background min-h-screen py-12 md:py-16">
      <div className="container-custom max-w-6xl">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            Contribute to the Village
          </h1>
          <div className="w-20 h-1 bg-brand mb-6 rounded-full mx-auto"></div>
          <p className="text-lg text-muted leading-relaxed">
            The Bandwar digital archive is built by the community. If you spot an error, have a historical photo, or want to share a story, submit it below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
          
          {/* Form Section */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
            <Suspense fallback={<div className="text-center py-20 text-muted">Loading form...</div>}>
              <ContributeForm />
            </Suspense>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6 sticky top-24">
            
            {/* Editorial Process */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-brand" />
                Editorial Review
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                Every submission is reviewed manually by our village editors to ensure accuracy and respect. It may take 24-48 hours for approved changes to appear live.
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-muted-background border border-border rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand" />
                Community Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-foreground/80">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Accuracy:</strong> Provide a source or proof for historical facts.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Respect:</strong> Content must be respectful to all communities.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>No Spam:</strong> Irrelevant or promotional content will be rejected.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}