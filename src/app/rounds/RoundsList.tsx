'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Round {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  season: number;
}

interface RoundsListProps {
  sortedSeasons: number[];
  roundsBySeason: Map<number, Round[]>;
}

export default function RoundsList({ sortedSeasons, roundsBySeason }: RoundsListProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([sortedSeasons[0]]));

  const toggleSeason = (season: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(season)) {
      newExpanded.delete(season);
    } else {
      newExpanded.add(season);
    }
    setExpandedSeasons(newExpanded);
  };

  return (
    <div className="space-y-4">
      {sortedSeasons.map(season => {
        const rounds = roundsBySeason.get(season) || [];
        const isExpanded = expandedSeasons.has(season);
        
        return (
          <div key={season} className="border border-gray-600/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSeason(season)}
              className="w-full p-4 bg-gray-700/30 hover:bg-gray-700/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-emerald-400">
                  Season {season}
                </h2>
                <span className="text-gray-400 text-sm">
                  {rounds.length} rounds
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {isExpanded && (
              <div className="p-4 space-y-3">
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
