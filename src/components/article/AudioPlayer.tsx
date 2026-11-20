"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, Gauge } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface AudioPlayerProps {
  title: string;
  summary: string;
  content: { heading: string; text: string }[];
}

export function AudioPlayer({ title, summary, content }: AudioPlayerProps) {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // 🚀 SMART VOICE SELECTION LOGIC
  const getBestVoice = () => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    
    if (language === "hi" || language === "an") {
      // Hindi ke liye best voice dhoondhein
      return voices.find(v => v.lang.includes("hi-IN")) || 
             voices.find(v => v.lang.includes("hi")) || null;
    } else {
      // English ke liye best Indian voice dhoondhein (Google/Microsoft natural voices)
      return voices.find(v => v.lang.includes("en-IN")) || 
             voices.find(v => v.name.includes("Google UK English Female")) ||
             voices.find(v => v.lang.includes("en")) || null;
    }
  };

  const prepareText = () => {
    // Agar future mein aapke paas Hindi/Angika ka content aata hai, 
    // toh yahan language ke hisaab se text select karein.
    return `${title}. ${summary}. ` + content.map(c => `${c.heading}. ${c.text}`).join(" ");
  };

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    synthRef.current.cancel();
    const text = prepareText();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 🚀 Apply Best Voice
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.lang = language === "hi" || language === "an" ? "hi-IN" : "en-IN";
    utterance.rate = speed;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.8, 1, 1.2, 1.5];
    const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSpeed(newSpeed);
    
    if (isPlaying) {
      if (synthRef.current) synthRef.current.cancel();
      setIsPlaying(false);
      setTimeout(() => handlePlay(), 100);
    }
  };

  return (
    <div className="bg-surface border border-divider rounded-sm p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-8 no-print">
      
      {/* Left: Play/Pause Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button 
          onClick={handlePlay}
          className="w-12 h-12 bg-accent hover:bg-accent-hover text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>

        {isPlaying && (
          <button 
            onClick={handleStop}
            className="w-10 h-10 bg-canvas border border-divider hover:bg-surface text-ink-muted rounded-full flex items-center justify-center shrink-0 transition-colors"
            aria-label="Stop audio"
          >
            <Square size={16} fill="currentColor" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Volume2 size={16} className="text-accent" />
            <span className="text-sm font-bold text-ink uppercase tracking-wider">Listen to this article</span>
          </div>
          <p className="text-xs text-ink-muted capitalize">
            Narrated in {language === 'hi' || language === 'an' ? 'Hindi' : 'English'} (Browser TTS)
          </p>
        </div>
      </div>

      {/* Right: Speed & Progress */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        <button 
          onClick={handleSpeedChange}
          className="flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-ink bg-canvas border border-divider px-2.5 py-1.5 rounded-sm transition-colors"
          title="Change playback speed"
        >
          <Gauge size={14} />
          {speed}x
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Playing</span>
          </div>
        )}
      </div>
    </div>
  );
}