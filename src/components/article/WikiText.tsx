import Link from "next/link";
import React from "react";

interface WikiTextProps {
  text: string;
  validIds?: string[]; 
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

          // Check karein ki article exist karta hai ya nahi
          const isMissing = validSet && !validSet.has(id);

          if (isMissing) {
            // 🔴 RED LINK (Article nahi hai - Standard Wiki Feature)
            return (
              <Link 
                key={index} 
                href={`/contribute?new=${id}`} 
                title={`${displayLabel} (Page not found. Click to suggest)`}
                className="text-red-600 dark:text-red-400 font-medium underline decoration-red-500/30 dark:decoration-red-400/30 underline-offset-4 hover:decoration-red-600 dark:hover:decoration-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-sm"
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
              className="text-accent visited:text-accent-visited font-medium underline decoration-accent/30 underline-offset-4 hover:decoration-accent hover:text-accent-hover transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-sm"
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