import { ChevronDown } from "lucide-react";

interface FaqProps {
  faqs: { q: string; a: string }[];
}

export function FaqAccordion({ faqs }: FaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-12 3xl:mt-20">
      {/* Section Heading */}
      <h2 className="font-serif text-2xl md:text-3xl 3xl:text-4xl font-semibold text-ink mb-6 pb-2 border-b border-divider">
        Frequently Asked Questions
      </h2>
      
      {/* Premium Card Container */}
      <div className="bg-surface border border-divider rounded-lg shadow-sm overflow-hidden divide-y divide-divider">
        {faqs.map((faq, index) => (
          <details 
            key={index} 
            className="group [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 md:p-6 3xl:p-8 transition-colors hover:bg-canvas focus:outline-none focus-visible:bg-canvas focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-accent">
              {/* Question Text */}
              <span className="pr-4 md:pr-6 text-base md:text-lg 3xl:text-xl font-medium text-ink group-open:text-accent transition-colors leading-snug">
                {faq.q}
              </span>
              
              {/* Icon (Rotates and changes color when open) */}
              <span className="shrink-0 text-ink/40 group-open:text-accent transition-all duration-300">
                <ChevronDown 
                  size={22} 
                  strokeWidth={2} 
                  className="3xl:w-7 3xl:h-7 group-open:rotate-180 transition-transform duration-300" 
                />
              </span>
            </summary>
            
            {/* Answer Body */}
            <div className="px-5 pb-6 md:px-6 md:pb-6 3xl:px-8 3xl:pb-8 pt-0 text-[16px] md:text-[17px] 3xl:text-lg text-ink/80 leading-relaxed bg-surface">
              <div className="pt-4 border-t border-divider/50 max-w-[75ch]">
                {faq.a}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}