"use client";

import { useState } from "react";
import Image from "next/image";
import { MoveHorizontal, CheckCircle2, ShieldAlert } from "lucide-react";

export function PriorityCard({ data }: { data: any }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-elevated transition-shadow duration-300 overflow-hidden mb-8 group">
      
      {/* 🏛️ Header */}
      <div className="bg-muted-background border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-brand text-white text-sm font-bold px-2.5 py-1 rounded-md shadow-sm">
            #{data.number}
          </span>
          <h3 className="font-serif font-bold text-foreground text-xl sm:text-2xl m-0">
            {data.title}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-background border border-border px-3 py-1.5 rounded-full font-semibold text-foreground/80 flex items-center gap-1.5">
            📍 Ward: {data.ward}
          </span>
          <span className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border ${
            data.status.toLowerCase().includes("complete") 
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400" 
              : "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400"
          }`}>
            {data.status.toLowerCase().includes("complete") ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
            {data.status}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 🖼️ LEFT: Before/After Image Slider */}
        <div className="flex flex-col">
          <div className="relative w-full aspect-[4/3] rounded-xl border border-border bg-muted-background overflow-hidden group/slider shadow-inner">
            
            {/* Required Image (Background - Vision) */}
            <Image
              src={data.required.photo.startsWith("/") ? data.required.photo : `/${data.required.photo}`}
              alt="Required Vision"
              fill
              className="object-cover"
            />
            
            {/* Current Image (Foreground with Clip - Present) */}
            <div 
              className="absolute inset-0 z-10"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={data.present.photo.startsWith("/") ? data.present.photo : `/${data.present.photo}`}
                alt="Current Reality"
                fill
                className="object-cover"
              />
            </div>

            {/* Labels (Glassmorphism) */}
            <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1.5 rounded-md uppercase tracking-wider font-bold border border-white/20 shadow-sm">
              Present Day
            </div>
            <div className="absolute top-3 right-3 z-20 bg-brand/80 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1.5 rounded-md uppercase tracking-wider font-bold border border-white/20 shadow-sm">
              Vision 2035
            </div>

            {/* Invisible Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Drag to compare current and required images"
            />

            {/* Slider Handle (Premium Look) */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.6)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-brand shadow-lg flex items-center justify-center text-brand">
                <MoveHorizontal size={16} strokeWidth={3} />
              </div>
            </div>
          </div>
          <div className="text-xs font-medium text-muted mt-3 text-center flex items-center justify-center gap-2">
            <MoveHorizontal size={14} /> Drag to compare
          </div>
        </div>

        {/* 📝 RIGHT: Text Details */}
        <div className="flex flex-col justify-center space-y-6">
          
          {/* Reality Box */}
          <div className="relative pl-4 border-l-2 border-red-500/50">
            <h4 className="font-serif font-bold text-foreground text-lg mb-1 flex items-center gap-2">
              Reality (Aaj)
            </h4>
            <p className="text-foreground/75 text-[15px] leading-relaxed">
              {data.reality}
            </p>
          </div>

          {/* Vision Box */}
          <div className="relative pl-4 border-l-2 border-brand">
            <h4 className="font-serif font-bold text-brand text-lg mb-1 flex items-center gap-2">
              Vision 2035 (Kal)
            </h4>
            <p className="text-foreground text-[15px] leading-relaxed font-medium">
              {data.vision}
            </p>
          </div>

        </div>

      </div>

      {/* 📊 Footer Details (Data Grid) */}
      <div className="bg-muted-background border-t border-border p-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-muted font-semibold uppercase tracking-wider mb-0.5">Scheme</span>
          <span className="font-medium text-foreground">{data.how.scheme}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted font-semibold uppercase tracking-wider mb-0.5">Estimated Cost</span>
          <span className="font-medium text-foreground">{data.how.cost}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted font-semibold uppercase tracking-wider mb-0.5">Authority</span>
          <span className="font-medium text-foreground">{data.how.authority}</span>
        </div>
      </div>

    </div>
  );
}