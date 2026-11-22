import React from 'react';
import Link from 'next/link';
import { ArrowRight, Link2, Users, GitBranch } from 'lucide-react';

interface EntityChipProps {
  id: string;
  title: string;
  type: string; // Edge type (influence, educational-pipeline, etc.)
  label?: string; // Custom label (e.g., "Students progress to")
  direction: 'from' | 'to'; // Which way is the connection
}

export function EntityChip({ id, title, type, label, direction }: EntityChipProps) {
  // Map edge types to icons
  const Icon = () => {
    switch (type) {
      case 'educational-pipeline': return <GitBranch size={14} className="text-accent/70" />;
      case 'influence': return <ArrowRight size={14} className="text-accent/70" />;
      case 'kinship': return <Users size={14} className="text-accent/70" />;
      default: return <Link2 size={14} className="text-accent/70" />;
    }
  };

  return (
    <Link 
      href={`/article/${id}`}
      className="group inline-flex items-center gap-2 bg-surface border border-divider hover:border-accent px-3 py-1.5 rounded-full text-sm transition-colors"
      title={label || type}
    >
      <Icon />
      <span className="font-medium text-ink group-hover:text-accent transition-colors truncate max-w-[200px] sm:max-w-[300px]">
        {title}
      </span>
      {direction === 'from' && (
        <ArrowRight size={12} className="text-ink-muted/50 rotate-180" />
      )}
      {direction === 'to' && (
        <ArrowRight size={12} className="text-ink-muted/50" />
      )}
    </Link>
  );
}