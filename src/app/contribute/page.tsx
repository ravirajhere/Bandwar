import { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { Pencil, Image as ImageIcon, MapPin, Phone, PlusCircle, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contribute & Feedback | Bandwar Portal",
  description: "Learn how to contribute to the Bandwar portal using our inline editing system, or send a general message to the editors.",
};

export default function ContributePage() {
  return (
    <div className="bg-background min-h-screen py-12 md:py-20">
      <div className="container-custom max-w-5xl">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 font-semibold tracking-tight">
            How to Contribute
          </h1>
          <div className="w-20 h-1 bg-brand mb-6 rounded-full mx-auto"></div>
          <p className="text-lg text-muted leading-relaxed">
            This portal belongs to the people of Bandwar. We have made it incredibly easy to update information. You don't need to fill long forms anymore.
          </p>
        </div>

        {/* The Guide Grid */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
            Look for the Edit Icons
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Guide Item 1 */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                <Pencil size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Text Corrections</h3>
                <p className="text-muted text-sm leading-relaxed">
                  See a typo or wrong fact in an Article or Profile? Just click the <Pencil size={12} className="inline text-brand" /> icon next to the text to suggest a correction.
                </p>
              </div>
            </div>

            {/* Guide Item 2 */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Directory Updates</h3>
                <p className="text-muted text-sm leading-relaxed">
                  If a doctor's number or a shop's address changed, find it in the Directory and click the <Pencil size={12} className="inline text-brand" /> icon.
                </p>
              </div>
            </div>

            {/* Guide Item 3 */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Map Locations</h3>
                <p className="text-muted text-sm leading-relaxed">
                  If a marker is wrong on the village map, open it and click "Location is wrong?" to drag the map to the exact spot.
                </p>
              </div>
            </div>

            {/* Guide Item 4 */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                <PlusCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Add New Content</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Want to add a new person, article, or photo? Look for the green <strong className="text-brand">"Add New"</strong> button on the respective pages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* General Message Form */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-muted-background text-foreground rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">Still have something to say?</h2>
            <p className="text-muted mt-2">If your update doesn't fit the edit buttons, send a general message below.</p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
            <ContributeForm />
          </div>
        </div>

      </div>
    </div>
  );
}