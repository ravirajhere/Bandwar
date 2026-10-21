interface FaqProps {
  faqs: { q: string; a: string }[];
}

export function FaqAccordion({ faqs }: FaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-12 border-t border-[#1a1a18]/10 pt-8">
      <h2 className="font-serif text-2xl font-bold text-[#1a1a18] mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <details 
            key={index} 
            className="group bg-white border border-[#1a1a18]/10 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-[#1a1a18] hover:bg-[#f7f5ef] transition-colors">
              <span>{faq.q}</span>
              <span className="text-[#a64b2a] group-open:rotate-180 transition-transform duration-200">
                ▼
              </span>
            </summary>
            <div className="p-4 pt-0 text-[#1a1a18]/80 text-sm leading-relaxed border-t border-[#1a1a18]/5">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}