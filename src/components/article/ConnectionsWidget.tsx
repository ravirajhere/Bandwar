import React from 'react';
import { Edge } from '@/lib/schema';
import { EntityChip } from '../shared/EntityChip';

interface ConnectionsWidgetProps {
  connections: Edge[];
  currentArticleId: string;
  allArticles: any[]; // Pass all articles to resolve titles
}

export function ConnectionsWidget({ connections, currentArticleId, allArticles }: ConnectionsWidgetProps) {
  if (!connections || connections.length === 0) return null;

  // Group connections by type
  const grouped = connections.reduce((acc, edge) => {
    if (!acc[edge.type]) acc[edge.type] = [];
    acc[edge.type].push(edge);
    return acc;
  }, {} as Record<string, Edge[]>);

  // Get article title by ID
  const getArticleTitle = (id: string) => {
    const article = allArticles.find(a => a.id === id);
    return article ? article.title : id;
  };

  // Format edge type for display (e.g., "educational-pipeline" -> "Educational Pipeline")
  const formatType = (type: string) => 
    type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="mt-12 3xl:mt-16 pt-8 border-t border-divider no-print">
      <h3 className="font-serif text-xl 3xl:text-2xl font-bold text-ink mb-6">Connections</h3>
      
      <div className="space-y-6">
        {Object.entries(grouped).map(([type, edges]) => (
          <div key={type} className="bg-surface/50 border border-divider rounded-lg p-4">
            <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
              {formatType(type)}
            </h4>
            <div className="flex flex-wrap gap-2">
              {edges.map((edge) => {
                const isFrom = edge.from === currentArticleId;
                const targetId = isFrom ? edge.to : edge.from;
                
                return (
                  <EntityChip 
                    key={edge.id}
                    id={targetId}
                    title={getArticleTitle(targetId)}
                    type={edge.type}
                    label={edge.label}
                    direction={isFrom ? 'to' : 'from'}
                  />
                );
              })}
            </div>
            {/* Show description if any edge has it */}
            {edges.map(edge => edge.description).filter(Boolean).map((desc, i) => (
              <p key={i} className="text-xs text-ink-muted mt-3 leading-relaxed italic">
                "{desc}"
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}