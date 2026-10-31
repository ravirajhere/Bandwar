import Link from "next/link";
import React from "react";

interface WikiTextProps {
  text: string;
  validIds?: string[]; // 👈 Naya Prop: Existing articles ki list
}

export function WikiText({ text, validIds }: WikiTextProps) {
  // Regex to match [[id|label]] or [[id]]
  const parts = text.split(/(\[\[.*?\]\])/g);
  
  // Valid IDs ko Set me convert kiya taaki check karna fast ho
  const validSet = validIds ? new Set(validIds) : null;

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const innerText = part.slice(2, -2);
          const [rawId, rawLabel] = innerText.split("|");
          
          const id = rawId.trim();
          
          const defaultLabel = id
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()); 
          
          const displayLabel = rawLabel ? rawLabel.trim() : defaultLabel;

          // 👇 Check karein ki article exist karta hai ya nahi
          const isMissing = validSet && !validSet.has(id);

          if (isMissing) {
            // 🔴 RED LINK (Article nahi hai)
            return (
              <Link 
                key={index} 
                href={`/contribute?new=${id}`} // Direct Contribute page par bhejenge
                title={`${displayLabel} (Page not found. Click to suggest)`}
                className="text-red-500 dark:text-red-400 font-medium underline decoration-red-500/40 underline-offset-4 hover:decoration-red-500 hover:text-red-600 dark:hover:text-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background rounded-sm"
              >
                {displayLabel}
              </Link>
            );
          }

          // 🟢 NORMAL LINK (Article exist karta hai)
          return (
            <Link 
              key={index} 
              href={`/article/${id}`} 
              title={displayLabel}
              className="text-brand visited:text-brand-visited font-medium underline decoration-brand/30 underline-offset-4 hover:decoration-brand hover:text-brand-hover transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-background rounded-sm"
            >
              {displayLabel}
            </Link>
          );
        }
        // Render normal text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}