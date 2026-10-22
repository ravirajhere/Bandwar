import { ChevronDown } from "lucide-react";

interface FaqProps {
  faqs: { q: string; a: string }[];
}

export function FaqAccordion({ faqs }: FaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-8">
      {/* Wikipedia Style Heading */}
      <h2 className="font-serif text-2xl text-wiki-text mb-3 pb-1 border-b border-wiki-border-light">
        Frequently Asked Questions
      </h2>
      
      {/* Clean Wikipedia-style List Box */}
      <div className="border border-wiki-border-light bg-wiki-bg divide-y divide-wiki-border-light">
        {faqs.map((faq) => (
          <details 
            key={faq.q} 
            className="group [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-4 font-bold text-[15px] text-wiki-text hover:bg-wiki-bg-alt transition-colors focus:outline-none focus-visible:bg-wiki-bg-alt">
              <span className="pr-4 leading-snug">{faq.q}</span>
              <span className="shrink-0 text-wiki-text-muted group-open:rotate-180 transition-transform duration-200">
                <ChevronDown size={18} strokeWidth={2} />
              </span>
            </summary>
            <div className="p-4 pt-1 text-[15px] text-wiki-text leading-relaxed bg-wiki-bg-alt">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}