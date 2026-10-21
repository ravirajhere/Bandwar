import Link from "next/link";
import React from "react";

interface WikiTextProps {
  text: string;
}

export function WikiText({ text }: WikiTextProps) {
  // Regex: [[id|label]] ya [[id]] ko pakadne ke liye
  const parts = text.split(/(\[\[.*?\]\])/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          // Brackets hata rahe hain
          const innerText = part.slice(2, -2);
          // Check kar rahe hain ki pipe (|) hai ya nahi
          const [id, label] = innerText.split("|");
          const displayLabel = label || id.replace(/-/g, " "); // Agar label nahi hai toh id ko sundar banayenge

          return (
            <Link 
              key={index} 
              href={`/article/${id}`} // Humara route structure
              className="text-[#1f3d2f] font-medium underline decoration-[#a64b2a]/30 hover:decoration-[#a64b2a] underline-offset-4 transition-colors"
            >
              {displayLabel}
            </Link>
          );
        }
        // Agar normal text hai toh waisa hi render karo
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}