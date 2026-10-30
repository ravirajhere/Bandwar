import { ChevronDown } from "lucide-react";

interface FaqProps {
  faqs: { q: string; a: string }[];
}

export function FaqAccordion({ faqs }: FaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-12">
      {/* Section Heading */}
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 pb-2 border-b border-border">
        Frequently Asked Questions
      </h2>
      
      {/* Premium Card Container */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border-subtle">
        {faqs.map((faq) => (
          <details 
            key={faq.q} 
            className="group [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 transition-colors hover:bg-muted-background/50 focus:outline-none focus-visible:bg-muted-background/50">
              {/* Question Text */}
              <span className="pr-6 text-base md:text-lg font-semibold text-foreground group-open:text-brand transition-colors leading-snug">
                {faq.q}
              </span>
              
              {/* Icon (Rotates and changes color when open) */}
              <span className="shrink-0 text-muted group-open:text-brand group-open:rotate-180 transition-all duration-300 bg-muted-background group-open:bg-brand/10 p-1.5 rounded-full">
                <ChevronDown size={20} strokeWidth={2.5} />
              </span>
            </summary>
            
            {/* Answer Body */}
            <div className="px-5 pb-6 md:px-6 md:pb-6 pt-0 text-[16px] md:text-[17px] text-foreground/80 leading-relaxed bg-card">
              <div className="pt-2 border-t border-border-subtle/50">
                {faq.a}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}