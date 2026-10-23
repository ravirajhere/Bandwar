import Link from "next/link";
import React from "react";

interface WikiTextProps {
  text: string;
}

export function WikiText({ text }: WikiTextProps) {
  // Regex to match [[id|label]] or [[id]]
  const parts = text.split(/(\[\[.*?\]\])/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const innerText = part.slice(2, -2);
          const [rawId, rawLabel] = innerText.split("|");
          
          // 1. Trim spaces to prevent broken links
          const id = rawId.trim();
          
          // 2. Smart Label Logic: If no label, capitalize the ID text
          const defaultLabel = id
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()); 
          
          const displayLabel = rawLabel ? rawLabel.trim() : defaultLabel;

          return (
            <Link 
              key={index} 
              href={`/article/${id}`} 
              title={displayLabel} // Wikipedia-style tooltip on hover
              // 3. Exact Wikipedia link styling:
              // - Standard wiki blue color (text-wiki-link)
              // - Visited state (visited:text-wiki-link-visited)
              // - No underline by default, underline on hover
              // - Accessible focus ring for keyboard users
              // - Added focus:ring-offset-wiki-bg for perfect Dark Mode support
              className="text-wiki-link visited:text-wiki-link-visited hover:underline focus:outline-none focus:ring-2 focus:ring-wiki-link focus:ring-offset-1 focus:ring-offset-wiki-bg rounded-sm transition-colors"
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