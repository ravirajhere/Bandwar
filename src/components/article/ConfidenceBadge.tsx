import React from 'react';
import { ConfidenceTier } from '@/lib/schema';
import { confidenceLabel, confidenceIcon } from '@/lib/provenance';

interface ConfidenceBadgeProps {
  tier?: ConfidenceTier;
  className?: string;
}

export function ConfidenceBadge({ tier = 'unverified', className = '' }: ConfidenceBadgeProps) {
  // Colors mapping based on your master.json tiers
  const colorMap: Record<string, string> = {
    unverified: 'bg-[#A64B2A]/10 text-[#A64B2A] border-[#A64B2A]/20',
    community: 'bg-[#7C2D12]/10 text-[#7C2D12] border-[#7C2D12]/20',
    elder: 'bg-[#1F7A3D]/10 text-[#1F7A3D] border-[#1F7A3D]/20',
    archival: 'bg-[#1F7A3D]/10 text-[#1F7A3D] border-[#1F7A3D]/20',
    contested: 'bg-[#A64B2A]/10 text-[#A64B2A] border-[#A64B2A]/20',
  };

  const activeClass = colorMap[tier] || colorMap.unverified;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border tracking-wide uppercase ${activeClass} ${className}`}
      title={`Status: ${confidenceLabel(tier)}`}
    >
      <span aria-hidden="true">{confidenceIcon(tier)}</span>
      {confidenceLabel(tier)}
    </span>
  );
}