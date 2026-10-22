"use client";

import { useState, useEffect } from "react";
import { Volume2, Square, Printer, Share2 } from "lucide-react";

export function ArticleToolbar({ title, contentText }: { title: string; contentText: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  return (
    <div className="no-print border border-wiki-border-light bg-wiki-bg-alt flex flex-wrap items-center gap-2 p-2 mb-6 text-[13px] text-wiki-text">
      
      {/* Listen Button */}
      <button 
        onClick={handleListen}
        title={isSpeaking ? "Stop reading" : "Listen to this article"}
        className={`flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
          isSpeaking 
            ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-bold" 
            : "bg-wiki-bg border-wiki-border-light hover:bg-wiki-header"
        }`}
      >
        {isSpeaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={16} />}
        {isSpeaking ? "Stop Reading" : "Listen"}
      </button>

      {/* Print Button */}
      <button 
        onClick={handlePrint}
        title="Print this article"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-wiki-bg border border-wiki-border-light hover:bg-wiki-header transition-colors"
      >
        <Printer size={16} /> Print
      </button>

      {/* Share Button */}
      <button 
        onClick={handleShare}
        title="Share on WhatsApp"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-wiki-bg border border-wiki-border-light hover:bg-wiki-header transition-colors"
      >
        <Share2 size={16} /> WhatsApp
      </button>

    </div>
  );
}