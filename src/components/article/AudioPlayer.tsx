"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, Gauge } from "lucide-react";

interface AudioPlayerProps {
  title: string;
  summary: string;
  content: { heading: string; text: string }[];
}

export function AudioPlayer({ title, summary, content }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeText, setActiveText] = useState("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const prepareText = () => {
    // 1. Title
    // 2. Summary
    // 3. Content blocks
    const fullText = `${title}. ${summary}. ` + content.map(c => `${c.heading}. ${c.text}`).join(" ");
    return fullText;
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

    // Start fresh
    synthRef.current.cancel();
    const text = prepareText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; // Professional English (Indian accent) or "hi-IN" for Hindi
    utterance.rate = speed;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveText("");
    };

    utteranceRef.current = utterance;
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
    
    // If already playing, restart with new speed
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
          <p className="text-xs text-ink-muted">Narrated in English (Browser TTS)</p>
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