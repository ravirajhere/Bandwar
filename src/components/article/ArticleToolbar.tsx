"use client";

import { useState, useEffect } from "react";
import { 
  Volume2, Square, Printer, Share2, 
  Play, Pause, X, Gauge, SkipBack, SkipForward 
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
  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Sections: Introduction (title + summary) + all content blocks
  const sections = [
    { heading: "Introduction", text: `${title}. ${summary}` },
    ...contentBlocks,
  ];
  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex];
  const progressPercent = totalSections > 0 ? (currentSectionIndex / totalSections) * 100 : 0;

  // 🔹 Load available English voices
  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      // Filter English-only voices
      const englishVoices = all.filter(v => v.lang.toLowerCase().startsWith("en"));
      setVoices(englishVoices);

      // Set default voice (prefer en-IN → en-GB → en-US)
      if (!selectedVoice && englishVoices.length > 0) {
        const preferred =
          englishVoices.find(v => v.lang === "en-IN") ||
          englishVoices.find(v => v.lang === "en-GB") ||
          englishVoices.find(v => v.lang === "en-US") ||
          englishVoices[0];
        setSelectedVoice(preferred.name);
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  // 🔹 Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 🔹 Keyboard shortcut (Space = Play/Pause, Esc = Stop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying && !isPaused) return;
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handlePauseResume();
      } else if (e.code === "Escape") {
        handleStop();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isPaused, currentSectionIndex]);

  // 🔹 Speak a single section
  const speakSection = (index: number) => {
    if (index >= totalSections) {
      handleStop();
      return;
    }

    const section = sections[index];
    const text = `${section.heading}. ${section.text}`;
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onend = () => {
      const nextIndex = index + 1;
      if (nextIndex < totalSections) {
        setCurrentSectionIndex(nextIndex);
        speakSection(nextIndex);
      } else {
        handleStop();
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentSectionIndex(0);
    speakSection(0);
  };

  const handlePauseResume = () => {
    if (!isPlaying && !isPaused) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionIndex(0);
  };

  const handleSkip = (direction: "next" | "prev") => {
    window.speechSynthesis.cancel();
    const newIndex = direction === "next"
      ? Math.min(currentSectionIndex + 1, totalSections - 1)
      : Math.max(currentSectionIndex - 1, 0);
    setCurrentSectionIndex(newIndex);
    if (isPlaying && !isPaused) {
      setTimeout(() => speakSection(newIndex), 100);
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakSection(currentSectionIndex), 100);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakSection(currentSectionIndex), 100);
    }
  };

  // 🔹 Share
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this article about ${title} on the Bandwar Village Archive: `;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, "_blank");
  };

  return (
    <>
      {/* Main Toolbar */}
      <div className="no-print bg-surface border border-divider rounded-lg shadow-sm grid grid-cols-3 sm:flex sm:items-center gap-2 p-1.5 sm:p-2 w-full sm:w-auto">
        
        {/* Listen Button */}
        <button
          type="button"
          onClick={isPlaying || isPaused ? handleStop : handlePlay}
          title={isPlaying ? "Stop reading" : "Listen to this article in English"}
          aria-label={isPlaying ? "Stop reading" : "Listen to this article"}
          className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-sm sm:text-base font-semibold transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            isPlaying || isPaused
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-canvas border-divider text-ink hover:bg-accent hover:text-white hover:border-accent"
          }`}
        >
          {isPlaying || isPaused ? (
            <Square size={18} fill="currentColor" aria-hidden="true" />
          ) : (
            <Volume2 size={20} aria-hidden="true" />
          )}
          <span className="truncate">
            {isPlaying || isPaused ? "Reading..." : "Listen"}
          </span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={() => window.print()}
          title="Print this article"
          aria-label="Print this article"
          className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-canvas border border-divider rounded-md text-sm sm:text-base font-medium text-ink/80 hover:bg-surface hover:text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Printer size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Print</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          title="Share this article"
          aria-label="Share this article"
          className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-canvas border border-divider rounded-md text-sm sm:text-base font-medium text-ink/80 hover:bg-surface hover:text-ink hover:border-ink/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Share2 size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Floating Audio Player */}
      {(isPlaying || isPaused) && (
        <div 
          className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[640px] z-50 bg-ink text-white rounded-lg shadow-2xl border border-white/10 p-3 md:p-4 animate-in slide-in-from-bottom-4 duration-300 no-print"
          role="region"
          aria-label="Audio Player"
        >
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Section Info */}
            <div className="flex-grow min-w-0" aria-live="polite">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5 font-medium">
                Reading {currentSectionIndex + 1} of {totalSections}
              </p>
              <p className="text-sm font-semibold truncate">
                {currentSection?.heading || "Introduction"}
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleSkip("prev")}
                disabled={currentSectionIndex === 0}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Previous section"
              >
                <SkipBack size={16} fill="currentColor" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handlePauseResume}
                className="p-2.5 bg-accent hover:bg-accent-hover rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play size={16} fill="currentColor" aria-hidden="true" /> : <Pause size={16} fill="currentColor" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => handleSkip("next")}
                disabled={currentSectionIndex === totalSections - 1}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Next section"
              >
                <SkipForward size={16} fill="currentColor" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="p-2 hover:bg-white/10 rounded-full transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close player"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Settings Row */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/10">
            {/* Speed Control */}
            <div className="flex items-center gap-1.5">
              <Gauge size={12} className="text-white/40" aria-hidden="true" />
              <span className="text-[10px] text-white/50 uppercase tracking-wide">Speed:</span>
              {[0.75, 1, 1.25, 1.5].map(r => (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRateChange(r)}
                  aria-label={`Set reading speed to ${r}x`}
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    rate === r
                      ? "bg-accent text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            {/* Voice Selector (only if multiple English voices) */}
            {voices.length > 1 && (
              <div className="flex items-center gap-1.5 flex-grow min-w-[200px]">
                <label htmlFor="voice-select" className="text-[10px] text-white/50 uppercase tracking-wide whitespace-nowrap">Voice:</label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="flex-grow bg-white/10 border border-white/20 text-white text-[11px] rounded px-2 py-1 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {voices.map(v => (
                    <option key={v.name} value={v.name} className="bg-ink text-white">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Keyboard Hint (Desktop only) */}
          <p className="hidden md:block text-[10px] text-white/30 mt-2 text-center">
            Space to pause/resume • Esc to stop
          </p>
        </div>
      )}
    </>
  );
}