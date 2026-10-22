import { ChevronDown } from "lucide-react";

interface FaqProps {
  faqs: { q: string; a: string }[];
}

export function FaqAccordion({ faqs }: FaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-12 border-t border-primary/10 pt-10">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details 
            key={faq.q} 
            className="group bg-white border border-primary/10 rounded-xl overflow-hidden shadow-sm transition-all duration-200 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-primary hover:bg-surface/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset">
              <span className="pr-4 text-base md:text-lg">{faq.q}</span>
              <span className="shrink-0 text-warn bg-warn/10 p-1.5 rounded-full group-open:rotate-180 transition-transform duration-300">
                <ChevronDown size={18} strokeWidth={2.5} />
              </span>
            </summary>
            <div className="px-5 pb-5 pt-2 text-primary/80 text-base leading-relaxed border-t border-primary/5 bg-surface/20">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}