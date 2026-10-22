"use client";

import { useEffect, useState } from "react";
import { Type } from "lucide-react";

export function FontSizeControls() {
  const [fontSize, setFontSize] = useState(16);

  // 1. Page load hone par localStorage se size uthana
  useEffect(() => {
    const savedSize = localStorage.getItem("bandwar-font-size");
    if (savedSize) {
      const size = parseInt(savedSize, 10);
      setFontSize(size);
      document.documentElement.style.setProperty("--base-font-size", `${size}px`);
    }
  }, []);

  // 2. Size change karne ka function
  const changeFontSize = (delta: number) => {
    const newSize = Math.min(Math.max(fontSize + delta, 14), 24); // Minimum 14px, Maximum 24px
    setFontSize(newSize);
    document.documentElement.style.setProperty("--base-font-size", `${newSize}px`);
    localStorage.setItem("bandwar-font-size", newSize.toString());
  };

  return (
    <div className="flex items-center gap-1 bg-wiki-bg-alt border border-wiki-border-light p-1">
      <span title="Adjust Website Text Size" className="flex items-center px-1 text-wiki-text-muted">
        <Type size={16} />
      </span>
      <button
        onClick={() => changeFontSize(-1)}
        title="Decrease text size"
        disabled={fontSize <= 14}
        className="px-2 py-0.5 text-wiki-text font-bold hover:bg-[#eaecf0] disabled:opacity-50 transition-colors"
      >
        A-
      </button>
      <span className="text-[12px] font-mono text-wiki-text w-6 text-center">
        {fontSize}
      </span>
      <button
        onClick={() => changeFontSize(1)}
        title="Increase text size"
        disabled={fontSize >= 24}
        className="px-2 py-0.5 text-wiki-text font-bold hover:bg-[#eaecf0] disabled:opacity-50 transition-colors"
      >
        A+
      </button>
    </div>
  );
}