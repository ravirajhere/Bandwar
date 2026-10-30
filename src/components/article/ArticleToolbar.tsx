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
    
    // Hindi Voice Select karne ka logic
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
    
    utterance.rate = 0.9; // Seniors ke liye speed slow
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

  // 3. Share Logic (Native Share API with WhatsApp fallback)
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = `Check out this article about ${title} on the Bandwar Portal: `;

      // 🚀 2026 Standard: Native Share Sheet (Works on Mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: text,
            url: url,
          });
          return; // Native share successful
        } catch (error) {
          console.log("Error sharing:", error);
        }
      }

      // Fallback to WhatsApp (Desktop or unsupported browsers)
      window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, "_blank");
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print bg-card border border-border rounded-xl shadow-sm flex flex-wrap items-center gap-2 sm:gap-3 p-2 sm:p-3">
      
      {/* 🔊 Listen Button (Primary Action) */}
      <button 
        onClick={handleListen}
        title={isSpeaking ? "Stop reading" : "Listen to this article in Hindi"}
        aria-label={isSpeaking ? "Stop reading" : "Listen to this article"}
        className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 border ${
          isSpeaking 
            ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 animate-pulse" 
            : "bg-brand/10 border-brand/20 text-brand hover:bg-brand hover:text-white"
        }`}
      >
        {isSpeaking ? <Square size={18} fill="currentColor" /> : <Volume2 size={20} />}
        {isSpeaking ? "Stop Reading" : "Listen (हिंदी)"}
      </button>

      {/* 🖨️ Print Button */}
      <button 
        onClick={handlePrint}
        title="Print this article"
        aria-label="Print this article"
        className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted-background border border-border rounded-lg text-sm sm:text-base font-medium text-foreground/80 hover:bg-border hover:text-foreground transition-colors"
      >
        <Printer size={18} /> Print
      </button>

      {/* 📤 Share Button */}
      <button 
        onClick={handleShare}
        title="Share this article"
        aria-label="Share this article"
        className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted-background border border-border rounded-lg text-sm sm:text-base font-medium text-foreground/80 hover:bg-border hover:text-foreground transition-colors"
      >
        <Share2 size={18} /> Share
      </button>

    </div>
  );
}