import { Suspense } from "react";
import { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";
import { Pencil, MapPin, Phone, PlusCircle, MessageSquare, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Contribute & Feedback | Bandwar Portal",
  description: "Learn how to contribute to the Bandwar portal using our inline editing system, or send a general message to the editors.",
};

export default function ContributePage() {
  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0 max-w-5xl 3xl:max-w-6xl">
        
        {/* 🏛️ Header */}
        <div className="mb-12 md:mb-16 text-center max-w-2xl 3xl:max-w-3xl mx-auto">
          <div className="w-16 h-16 3xl:w-20 3xl:h-20 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <BookOpen size={32} className="3xl:w-10 3xl:h-10" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight">
            How to Contribute
          </h1>
          <div className="w-20 h-1 bg-accent mb-6 rounded-full mx-auto"></div>
          <p className="text-base md:text-lg 3xl:text-xl text-ink/70 leading-relaxed text-pretty">
            This portal is a community-maintained archive. We have streamlined the process so you can contribute directly without filling out long forms.
          </p>
        </div>

        {/* 📖 The Guide Grid (Formal User Manual) */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-serif text-2xl 3xl:text-3xl font-semibold text-ink">
              Using the Inline Editing Tools
            </h2>
            <div className="h-px bg-divider flex-grow rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 3xl:gap-8">
            {/* Guide Item 1 */}
            <div className="bg-surface border border-divider p-6 3xl:p-8 rounded-lg shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider text-accent rounded-lg flex items-center justify-center shrink-0">
                <Pencil size={22} className="3xl:w-7 3xl:h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">Text Corrections</h3>
                <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed">
                  Notice a typo or factual error in an Article or Profile? Simply click the <Pencil size={14} className="inline text-accent mx-1" /> icon next to the text to submit a correction.
                </p>
              </div>
            </div>

            {/* Guide Item 2 */}
            <div className="bg-surface border border-divider p-6 3xl:p-8 rounded-lg shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider text-accent rounded-lg flex items-center justify-center shrink-0">
                <Phone size={22} className="3xl:w-7 3xl:h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">Directory Updates</h3>
                <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed">
                  If a phone number, address, or shop timing has changed, locate it in the Directory and click the <Pencil size={14} className="inline text-accent mx-1" /> icon to update the listing.
                </p>
              </div>
            </div>

            {/* Guide Item 3 */}
            <div className="bg-surface border border-divider p-6 3xl:p-8 rounded-lg shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider text-accent rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={22} className="3xl:w-7 3xl:h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">Map Locations</h3>
                <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed">
                  If a landmark marker is inaccurate, open it on the map and select "Location is wrong?" to adjust the coordinates to the correct spot.
                </p>
              </div>
            </div>

            {/* Guide Item 4 */}
            <div className="bg-surface border border-divider p-6 3xl:p-8 rounded-lg shadow-sm flex items-start gap-5">
              <div className="w-12 h-12 3xl:w-14 3xl:h-14 bg-canvas border border-divider text-accent rounded-lg flex items-center justify-center shrink-0">
                <PlusCircle size={22} className="3xl:w-7 3xl:h-7" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-lg 3xl:text-xl mb-2">Adding New Content</h3>
                <p className="text-ink/70 text-sm md:text-base 3xl:text-lg leading-relaxed">
                  To add a new person, article, or photograph, look for the <strong className="text-accent">"Add New"</strong> button available on the respective archive pages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 📝 General Message Form */}
        <div className="max-w-3xl 3xl:max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 3xl:w-16 3xl:h-16 bg-surface border border-divider text-ink rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageSquare size={24} className="3xl:w-8 3xl:h-8 text-accent" />
            </div>
            <h2 className="font-serif text-2xl 3xl:text-3xl font-semibold text-ink">Submit General Feedback</h2>
            <p className="text-ink/60 text-sm md:text-base 3xl:text-lg mt-2">
              If your update does not fit the inline edit buttons, please use the form below to contact the editorial team.
            </p>
          </div>
          
          <div className="bg-surface border border-divider rounded-lg shadow-sm p-6 md:p-8 3xl:p-10">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 3xl:w-12 3xl:h-12 border-4 border-divider border-t-accent rounded-full animate-spin mb-4"></div>
                <p className="text-ink/50 font-medium text-sm 3xl:text-base">Loading form...</p>
              </div>
            }>
              <ContributeForm />
            </Suspense>
          </div>
        </div>

      </div>
    </div>
  );
}