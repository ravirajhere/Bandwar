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
              title={displayLabel}
              // ✅ Senior Fix: Naye tokens (text-brand) aur accessible focus ring use kiya hai
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