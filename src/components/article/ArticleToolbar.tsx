"use client";

import { useState, useEffect } from "react";
import { Volume2, Square, Printer, Share2, Type } from "lucide-react";

export function ArticleToolbar({ title, contentText }: { title: string; contentText: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState(100); // 100% default

  // Text to Speech Logic
  const handleListen = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = `${title}. ${contentText}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    utterance.rate = 0.9; 
    utterance.pitch = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Share via WhatsApp
  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = `Check out this article about ${title} on the Bandwar Portal: `;
      window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, "_blank");
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Font Size Adjuster
  const changeFontSize = (delta: number) => {
    setFontSize((prev) => Math.min(Math.max(prev + delta, 80), 150));
  };

  return (
    <div className="no-print border border-wiki-border-light bg-wiki-bg-alt flex flex-wrap items-center justify-between p-2 mb-6 text-[13px] text-wiki-text">
      
      {/* Left Side: Utility Tools */}
      <div className="flex items-center gap-2 flex-wrap">
        
        {/* Listen Button */}
        <button 
          onClick={handleListen}
          title={isSpeaking ? "Stop reading" : "Listen to this article"}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
            isSpeaking 
              ? "bg-red-50 border-red-300 text-red-700 font-bold" 
              : "bg-wiki-bg border-wiki-border-light hover:bg-[#eaecf0]"
          }`}
        >
          {isSpeaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={16} />}
          {isSpeaking ? "Stop Reading" : "Listen"}
        </button>

        {/* Print Button */}
        <button 
          onClick={handlePrint}
          title="Print this article"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-wiki-bg border border-wiki-border-light hover:bg-[#eaecf0] transition-colors"
        >
          <Printer size={16} /> Print
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          title="Share on WhatsApp"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-wiki-bg border border-wiki-border-light hover:bg-[#eaecf0] transition-colors"
        >
          <Share2 size={16} /> WhatsApp
        </button>
      </div>

      {/* Right Side: Font Size Adjuster */}
      <div className="flex items-center gap-2 border-l border-wiki-border-light pl-3 ml-2 mt-2 sm:mt-0">
        {/* 👇 Yahan span ka use kiya hai title ke liye 👇 */}
        <span title="Adjust Text Size" className="flex items-center">
          <Type size={16} className="text-wiki-text-muted" />
        </span>
        
        <button 
          onClick={() => changeFontSize(-10)} 
          title="Decrease text size"
          className="px-2 py-1 bg-wiki-bg border border-wiki-border-light hover:bg-[#eaecf0] font-bold"
        >
          A-
        </button>
        <span className="font-mono text-[12px] w-8 text-center">{fontSize}%</span>
        <button 
          onClick={() => changeFontSize(10)} 
          title="Increase text size"
          className="px-2 py-1 bg-wiki-bg border border-wiki-border-light hover:bg-[#eaecf0] font-bold"
        >
          A+
        </button>
      </div>

      {/* Hidden style tag to dynamically apply font size to the article container */}
      <style>{`
        .article-body-wrapper { font-size: ${fontSize}%; transition: font-size 0.2s ease; }
      `}</style>
    </div>
  );
}