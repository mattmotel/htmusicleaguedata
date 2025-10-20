'use client';

import { AlertCircle, CheckCircle, ChevronDown, ChevronRight, Expand, Minimize } from 'lucide-react';
import { useState } from 'react';
import { Submission } from '../lib/data';

interface ParticipationData {
  season: number;
  roundNumber: number;
  roundName: string;
  submissions: Submission[];
  voters: Set<string>;
  expectedVoters: Set<string>;
  missingVoters: string[];
  participationRate: number;
}

interface MissingVotesTableProps {
  participationData: Map<string, ParticipationData>;
  competitors: Map<string, string>;
}

export default function MissingVotesTable({ participationData, competitors }: MissingVotesTableProps) {
  // Group data by season
  const dataBySeason = new Map<number, ParticipationData[]>();
  
  participationData.forEach((data) => {
    if (!dataBySeason.has(data.season)) {
      dataBySeason.set(data.season, []);
    }
    dataBySeason.get(data.season)!.push(data);
  });

  // Sort seasons and rounds within each season
  dataBySeason.forEach((seasonData) => {
    seasonData.sort((a, b) => a.roundNumber - b.roundNumber);
  });

  const seasons = Array.from(dataBySeason.keys()).sort((a, b) => b - a);
  
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set([seasons[0]])
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
    setExpandedSeasons(new Set(seasons));
  };

  const collapseAll = () => {
    setExpandedSeasons(new Set());
  };

  return (
    <div className="space-y-8">
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

      {seasons.map((season) => {
        const isExpanded = expandedSeasons.has(season);
        const seasonData = dataBySeason.get(season)!;
        const totalRounds = seasonData.length;
        const roundsWithMissing = seasonData.filter(data => data.missingVoters.length > 0).length;
        const avgParticipation = seasonData.reduce((sum, data) => sum + data.participationRate, 0) / totalRounds;

        return (
          <div key={season} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button 
              onClick={() => toggleSeason(season)} 
              className="w-full bg-gray-700 px-6 py-4 border-b border-gray-600 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">
                    Season {season} ({totalRounds} rounds)
                  </h3>
                  <p className="text-sm text-gray-400">
                    {roundsWithMissing} rounds with missing votes • {avgParticipation.toFixed(1)}% avg participation
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="p-6 space-y-4">
                {seasonData.map((data) => (
                  <div key={`${data.season}-${data.roundNumber}`} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{data.roundName}</h4>
                        <p className="text-gray-400">{data.submissions.length} submissions</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${data.participationRate === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {data.participationRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-400">participation</p>
                      </div>
                    </div>

                    {data.missingVoters.length > 0 ? (
                      <div className="bg-gray-600 rounded-lg p-4">
                        <h5 className="text-md font-semibold text-yellow-400 mb-3">Missing Votes</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {data.missingVoters.map(voterId => {
                            const voterName = competitors.get(voterId) || voterId;
                            return (
                              <div key={voterId} className="flex items-center p-2 bg-gray-500 rounded">
                                <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                                <span className="text-sm text-white">{voterName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-600 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                          <span className="text-green-400 font-medium">All participants voted!</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Expected Voters:</p>
                        <p className="text-white">{data.expectedVoters.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Actual Voters:</p>
                        <p className="text-white">{data.voters.size}</p>
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
