import { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { ShieldCheck, FileText, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contribute to the Archive | Bandwar Portal",
  description: "Help us keep the Bandwar portal accurate. Submit corrections, new articles, historical photos, or suggestions.",
};

export default function ContributePage() {
  return (
    <div className="bg-background min-h-screen py-12 md:py-20">
      <div className="container-custom max-w-5xl">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            Contribute to the Village
          </h1>
          <div className="w-20 h-1 bg-brand mb-6 rounded-full mx-auto"></div>
          <p className="text-lg text-muted leading-relaxed">
            This portal belongs to the people of Bandwar. If you spot a mistake, have an old photo, or want to write about the village, let us know below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          
          {/* Form Section */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
            <ContributeForm />
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <div className="bg-muted-background border border-border rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand" />
                Our Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-foreground/80">
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Accuracy:</strong> Please provide proof or a reliable source if you are submitting a historical fact.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Respect:</strong> Content must be respectful to all communities, castes, and religions.</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={16} className="text-brand shrink-0 mt-0.5" />
                  <span><strong>Photos:</strong> If submitting images, mention where and when they were taken.</span>
                </li>
              </ul>
            </div>

            <div className="bg-brand/5 border border-brand/20 rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                <FileText size={20} className="text-brand" />
                How it works?
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Your submission goes directly to our village editors. We review every request manually. If approved, it will be published on the website within 24-48 hours.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}