"use client";

import { useState, useEffect } from "react";
import { Volume2, Square, Printer, Share2 } from "lucide-react";

export function ArticleToolbar({ title, contentText }: { title: string; contentText: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 1. Voice load karna
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 2. Text to Speech Logic
  const handleListen = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${title}. ${contentText}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.lang === "hi" || v.lang.startsWith("hi"));
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = hindiVoice.lang;
    } else {
      const indianEnglish = voices.find(v => v.lang === "en-IN");
      if (indianEnglish) {
        utterance.voice = indianEnglish;
        utterance.lang = indianEnglish.lang;
      } else {
        utterance.lang = "hi-IN"; 
      }
    }
    
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

  // 3. Share Logic
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = `Check out this article about ${title} on the Bandwar Portal: `;

      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: text,
            url: url,
          });
          return; 
        } catch (error) {
          console.log("Error sharing:", error);
        }
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, "_blank");
    }
  };

  // 4. Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print bg-surface border border-divider rounded-lg shadow-sm grid grid-cols-3 sm:flex sm:items-center gap-2 p-1.5 sm:p-2 w-full sm:w-auto">
      
      {/* 🔊 Listen Button (Primary Action) */}
      <button 
        onClick={handleListen}
        title={isSpeaking ? "Stop reading" : "Listen to this article"}
        aria-label={isSpeaking ? "Stop reading" : "Listen to this article"}
        className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-sm sm:text-base font-semibold transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
          isSpeaking 
            ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" 
            : "bg-canvas border-divider text-ink hover:bg-accent hover:text-white hover:border-accent"
        }`}
      >
        {isSpeaking ? <Square size={18} fill="currentColor" className="3xl:w-6 3xl:h-6" /> : <Volume2 size={20} className="3xl:w-6 3xl:h-6" />}
        <span className="truncate">{isSpeaking ? "Stop" : "Listen"}</span>
        <span className="hidden xl:inline text-xs opacity-60 font-normal ml-1">(हिंदी)</span>
      </button>

      {/* 🖨️ Print Button */}
      <button 
        onClick={handlePrint}
        title="Print this article"
        aria-label="Print this article"
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-canvas border border-divider rounded-md text-sm sm:text-base font-medium text-ink/80 hover:bg-surface hover:text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Printer size={18} className="3xl:w-6 3xl:h-6" /> 
        <span className="hidden sm:inline">Print</span>
      </button>

      {/* 📤 Share Button */}
      <button 
        onClick={handleShare}
        title="Share this article"
        aria-label="Share this article"
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-canvas border border-divider rounded-md text-sm sm:text-base font-medium text-ink/80 hover:bg-surface hover:text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Share2 size={18} className="3xl:w-6 3xl:h-6" /> 
        <span className="hidden sm:inline">Share</span>
      </button>

    </div>
  );
}