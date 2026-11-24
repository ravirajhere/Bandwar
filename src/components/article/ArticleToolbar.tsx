"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2, Square, Printer, Share2,
  Play, Pause, X, SkipBack, SkipForward
} from "lucide-react";

interface ContentBlock {
  heading: string;
  text: string;
}

interface ArticleToolbarProps {
  title: string;
  summary: string;
  contentBlocks: ContentBlock[];
}

export function ArticleToolbar({ title, summary, contentBlocks }: ArticleToolbarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);
  const playingRef = useRef(false);

  const sections = [
    { heading: "Introduction", text: `${title}. ${summary}` },
    ...contentBlocks,
  ];
  const total = sections.length;
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    playingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    indexRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((index: number) => {
    if (index >= total) {
      stop();
      return;
    }
    indexRef.current = index;
    setCurrentIndex(index);

    const section = sections[index];
    const utterance = new SpeechSynthesisUtterance(`${section.heading}. ${section.text}`);
    utterance.lang = "en-IN";
    utterance.rate = 1;

    utterance.onend = () => {
      if (!playingRef.current) return;
      speak(index + 1);
    };
    utterance.onerror = () => stop();

    window.speechSynthesis.speak(utterance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, stop]);

  const handlePlay = () => {
    window.speechSynthesis.cancel();
    playingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    speak(0);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleSkip = (dir: "next" | "prev") => {
    const next = dir === "next"
      ? Math.min(indexRef.current + 1, total - 1)
      : Math.max(indexRef.current - 1, 0);
    window.speechSynthesis.cancel();
    // Agar paused tha toh paused hi rahe, warna bolna continue kare
    if (playingRef.current && !isPaused) {
      speak(next);
    } else {
      indexRef.current = next;
      setCurrentIndex(next);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this article about ${title} on the Bandwar Village Archive: `;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch { /* user cancelled */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, "_blank");
  };

  const isActive = isPlaying || isPaused;

  return (
    <>
      {/* Main Toolbar — Suggest button jaisa hi style */}
      <div className="no-print flex items-center gap-2">
        <button
          type="button"
          onClick={isActive ? stop : handlePlay}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-accent hover:border-accent text-xs font-semibold border border-divider rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isActive ? "Stop reading" : "Listen to this article"}
        >
          {isActive ? <Square size={13} fill="currentColor" aria-hidden="true" /> : <Volume2 size={13} aria-hidden="true" />}
          {isActive ? "Reading..." : "Listen"}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-ink text-xs font-semibold border border-divider rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Print this article"
        >
          <Printer size={13} aria-hidden="true" /> Print
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-ink text-xs font-semibold border border-divider rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Share this article"
        >
          <Share2 size={13} aria-hidden="true" /> Share
        </button>
      </div>

      {/* Minimal Player */}
      {isActive && (
        <div
          className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[520px] z-50 bg-ink text-white rounded-sm shadow-2xl border border-white/10 p-3 no-print"
          role="region"
          aria-label="Audio Player"
        >
          <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0" aria-live="polite">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">
                {currentIndex + 1} of {total}
              </p>
              <p className="text-sm font-semibold truncate">
                {sections[currentIndex]?.heading || "Introduction"}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => handleSkip("prev")} disabled={currentIndex === 0} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Previous section">
                <SkipBack size={16} fill="currentColor" aria-hidden="true" />
              </button>
              <button type="button" onClick={handlePauseResume} className="p-2.5 bg-accent hover:bg-accent-hover rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label={isPaused ? "Resume" : "Pause"}>
                {isPaused ? <Play size={16} fill="currentColor" aria-hidden="true" /> : <Pause size={16} fill="currentColor" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => handleSkip("next")} disabled={currentIndex === total - 1} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Next section">
                <SkipForward size={16} fill="currentColor" aria-hidden="true" />
              </button>
              <button type="button" onClick={stop} className="p-2 hover:bg-white/10 rounded-full ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Close player">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}