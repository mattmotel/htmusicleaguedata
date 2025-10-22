'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Expand, Minimize } from 'lucide-react';

interface Round {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  season: number;
}

interface RoundsListProps {
  sortedSeasons: number[];
  roundsBySeason: Map<number, Round[]>;
}

export default function RoundsList({ sortedSeasons, roundsBySeason }: RoundsListProps) {
  // First season is open by default, rest are closed
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set(sortedSeasons.length > 0 ? [sortedSeasons[0]] : [])
  );

  const toggleSeason = (season: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(season)) {
      newExpanded.delete(season);
    } else {
      newExpanded.add(season);
    }
    setExpandedSeasons(newExpanded);
  };

  const expandAll = () => {
    setExpandedSeasons(new Set(sortedSeasons));
  };

  const collapseAll = () => {
    setExpandedSeasons(new Set());
  };

  return (
    <div className="space-y-8">
      {/* Expand/Collapse All Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={expandAll}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Expand className="w-4 h-4" />
          <span>Expand All</span>
        </button>
        <button
          onClick={collapseAll}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Minimize className="w-4 h-4" />
          <span>Collapse All</span>
        </button>
      </div>

      {/* Rounds by Season */}
      {sortedSeasons.map(season => {
        const rounds = roundsBySeason.get(season) || [];
        const isExpanded = expandedSeasons.has(season);
        
        return (
          <div key={season} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => toggleSeason(season)}
              className="w-full bg-gray-700 px-6 py-4 border-b border-gray-600 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white text-left">
                  Season {season} ({rounds.length} rounds)
                </h3>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-6 space-y-3">
                {rounds.map((round, index) => (
                  <div key={round.id} className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-emerald-400 text-gray-900 rounded-full text-sm font-bold flex-shrink-0">
                        {rounds.length - index}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {round.title || 'Untitled Round'}
                        </h3>
                        {round.description && (
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {round.description}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(round.timestamp).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

