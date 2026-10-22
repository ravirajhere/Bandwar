"use client";

import { useState } from "react";
import Image from "next/image";

export function PriorityCard({ data }: { data: any }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="border border-wiki-border-light bg-wiki-bg mb-8">
      
      {/* Header (Wikipedia Style) */}
      <div className="bg-[#eaecf0] border-b border-wiki-border-light p-3 sm:p-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-wiki-text text-wiki-bg text-xs font-bold px-2 py-1">
            #{data.number}
          </span>
          <h3 className="font-bold text-wiki-text text-lg m-0">{data.title}</h3>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-wiki-bg border border-wiki-border-light px-2 py-1 text-wiki-text-muted">
            Ward: {data.ward}
          </span>
          <span className="bg-wiki-bg border border-wiki-border-light px-2 py-1 text-wiki-text-muted">
            Status: {data.status}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT: Smooth Before/After Image Slider */}
        <div className="flex flex-col">
          <div className="relative w-full aspect-[4/3] border border-wiki-border-light bg-wiki-bg-alt overflow-hidden group">
            
            {/* Required Image (Background) */}
            <Image
              src={data.required.photo.startsWith("/") ? data.required.photo : `/${data.required.photo}`}
              alt="Required"
              fill
              className="object-cover"
            />
            
            {/* Current Image (Foreground with Clip) */}
            <div 
              className="absolute inset-0 z-10"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={data.present.photo.startsWith("/") ? data.present.photo : `/${data.present.photo}`}
                alt="Current"
                fill
                className="object-cover"
              />
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider font-bold">
              Current (Present)
            </div>
            <div className="absolute top-2 right-2 z-20 bg-wiki-link/90 text-white text-[10px] px-2 py-1 uppercase tracking-wider font-bold">
              Required (Vision)
            </div>

            {/* The Slider Input (Invisible but controls the clip-path) */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Drag to compare current and required images"
            />

            {/* Slider Handle (Visual) */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-wiki-border shadow-md flex items-center justify-center">
                <span className="text-wiki-text text-[10px]">↔</span>
              </div>
            </div>
          </div>
          <div className="text-[12px] text-wiki-text-muted mt-2 text-center">
            Drag the slider to compare
          </div>
        </div>

        {/* RIGHT: Text Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            <h4 className="font-bold text-wiki-text text-sm border-b border-wiki-border-light pb-1 mb-2">Reality</h4>
            <p className="text-[14px] text-wiki-text-muted leading-relaxed">{data.reality}</p>
          </div>
          <div>
            <h4 className="font-bold text-wiki-link text-sm border-b border-wiki-border-light pb-1 mb-2">Vision 2035</h4>
            <p className="text-[14px] text-wiki-text leading-relaxed">{data.vision}</p>
          </div>
        </div>

      </div>

      {/* Footer details */}
      <div className="bg-wiki-bg-alt border-t border-wiki-border-light p-3 text-[12px] text-wiki-text-muted flex flex-wrap gap-4">
        <span><strong>Scheme:</strong> {data.how.scheme}</span>
        <span><strong>Cost:</strong> {data.how.cost}</span>
        <span><strong>Authority:</strong> {data.how.authority}</span>
      </div>

    </div>
  );
}