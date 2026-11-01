"use client";

import { useState } from "react";
import Image from "next/image";
import { MoveHorizontal, CheckCircle2, ShieldAlert, MapPin } from "lucide-react";
import { UniversalEditModal } from "@/components/shared/UniversalEditModal";

export function PriorityCard({ data }: { data: any }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="bg-surface border border-divider rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden mb-8 group">
      
      {/* 📌 Header */}
      <div className="bg-canvas/50 border-b border-divider p-4 sm:p-5 3xl:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-accent text-white text-sm 3xl:text-base font-bold px-2.5 py-1 3xl:px-3 3xl:py-1.5 rounded-md shadow-sm">
            #{data.number}
          </span>
          <h3 className="font-serif font-bold text-ink text-lg sm:text-xl 3xl:text-2xl m-0 leading-tight">
            {data.title}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs 3xl:text-sm items-center">
          {/* Ward Badge */}
          <span className="bg-surface border border-divider px-3 py-1.5 rounded-md font-semibold text-ink/80 flex items-center gap-1.5 shadow-sm">
            <MapPin size={14} className="text-accent/70 3xl:w-4 3xl:h-4" /> Ward: {data.ward}
          </span>
          
          {/* Status Badge with Edit */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${
            data.status.toLowerCase().includes("complete") 
              ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400" 
              : "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400"
          }`}>
            <span className="px-2 py-1 font-semibold flex items-center gap-1.5 3xl:text-sm">
              {data.status.toLowerCase().includes("complete") ? <CheckCircle2 size={14} className="3xl:w-4 3xl:h-4" /> : <ShieldAlert size={14} className="3xl:w-4 3xl:h-4" />}
              {data.status}
            </span>
            <div className="opacity-50 hover:opacity-100 transition-opacity">
              <UniversalEditModal fieldName="Status" currentValue={data.status} contextId={data.id} contextType="Vision 2035" variant="icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 3xl:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 3xl:gap-12">
        
        {/* 🖼️ LEFT: Before/After Image Slider */}
        <div className="flex flex-col">
          <div className="relative w-full aspect-[4/3] rounded-lg border border-divider bg-canvas overflow-hidden shadow-sm">
            {/* Vision Image (Background) */}
            <Image 
              src={data.required.photo.startsWith("/") ? data.required.photo : `/${data.required.photo}`} 
              alt="Required Vision" 
              fill 
              className="object-cover" 
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            
            {/* Present Image (Foreground with clip-path) */}
            <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
              <Image 
                src={data.present.photo.startsWith("/") ? data.present.photo : `/${data.present.photo}`} 
                alt="Current Reality" 
                fill 
                className="object-cover" 
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            {/* Labels */}
            <div className="absolute top-3 left-3 z-20 bg-ink/70 backdrop-blur-md text-white text-[10px] 3xl:text-xs px-2.5 py-1.5 rounded uppercase tracking-wider font-bold border border-white/20 shadow-sm">
              Present Day
            </div>
            <div className="absolute top-3 right-3 z-20 bg-accent/90 backdrop-blur-md text-white text-[10px] 3xl:text-xs px-2.5 py-1.5 rounded uppercase tracking-wider font-bold border border-white/20 shadow-sm">
              Vision 2035
            </div>
            
            {/* Invisible Range Input */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPosition} 
              onChange={handleSliderChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 focus-visible:outline-none" 
              aria-label="Drag to compare present and vision" 
            />
            
            {/* Slider Line & Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 3xl:w-12 3xl:h-12 bg-surface rounded-full border-2 border-accent shadow-md flex items-center justify-center text-accent">
                <MoveHorizontal size={18} strokeWidth={2.5} className="3xl:w-6 3xl:h-6" />
              </div>
            </div>
          </div>
          
          <div className="text-xs 3xl:text-sm font-medium text-ink/50 mt-3 text-center flex items-center justify-center gap-2">
            <MoveHorizontal size={14} className="3xl:w-5 3xl:h-5" /> Drag to compare
          </div>
        </div>

        {/* 📝 RIGHT: Text Details */}
        <div className="flex flex-col justify-center space-y-6 3xl:space-y-8">
          
          {/* Reality Section */}
          <div className="relative pl-4 border-l-4 border-red-500/50">
            <h4 className="font-serif font-bold text-ink text-base 3xl:text-lg mb-2 flex items-center gap-2">
              Present Reality
            </h4>
            <p className="text-ink/75 text-sm md:text-[15px] 3xl:text-lg leading-relaxed m-0">
              {data.reality}
              <span className="inline-block ml-1 not-prose no-print opacity-50 hover:opacity-100 transition-opacity align-middle">
                <UniversalEditModal fieldName="Reality" currentValue={data.reality} contextId={data.id} contextType="Vision 2035" variant="icon" />
              </span>
            </p>
          </div>

          {/* Vision Section */}
          <div className="relative pl-4 border-l-4 border-accent">
            <h4 className="font-serif font-bold text-accent text-base 3xl:text-lg mb-2 flex items-center gap-2">
              Vision 2035
            </h4>
            <p className="text-ink text-sm md:text-[15px] 3xl:text-lg leading-relaxed font-medium m-0">
              {data.vision}
              <span className="inline-block ml-1 not-prose no-print opacity-50 hover:opacity-100 transition-opacity align-middle">
                <UniversalEditModal fieldName="Vision 2035" currentValue={data.vision} contextId={data.id} contextType="Vision 2035" variant="icon" />
              </span>
            </p>
          </div>

        </div>
      </div>

      {/* 📊 Footer Details */}
      <div className="bg-canvas/50 border-t border-divider p-4 sm:px-6 3xl:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 3xl:gap-6 text-sm 3xl:text-base">
        <div className="flex flex-col">
          <span className="text-[11px] 3xl:text-xs text-ink/50 font-bold uppercase tracking-wider mb-1">Scheme</span>
          <span className="font-medium text-ink">{data.how.scheme}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] 3xl:text-xs text-ink/50 font-bold uppercase tracking-wider mb-1">Estimated Cost</span>
          <span className="font-medium text-ink">{data.how.cost}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] 3xl:text-xs text-ink/50 font-bold uppercase tracking-wider mb-1">Authority</span>
          <span className="font-medium text-ink">{data.how.authority}</span>
        </div>
      </div>

    </div>
  );
}