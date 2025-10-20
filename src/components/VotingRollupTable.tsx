'use client';

import { Vote, Users, Star, ChevronDown, ChevronRight, Expand, Minimize } from 'lucide-react';
import { useState } from 'react';
import { Submission } from '../lib/data';

interface SubmissionWithVotes extends Submission {
  votes: any[];
  totalPoints: number;
  voteCount: number;
}

interface VotingRollupTableProps {
  submissionsBySeason: Map<number, Map<number, Submission[]>>;
  votes: any[];
}

export default function VotingRollupTable({ submissionsBySeason, votes }: VotingRollupTableProps) {
  const seasons = Array.from(submissionsBySeason.keys()).sort((a, b) => b - a);
  
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
        const roundsMap = submissionsBySeason.get(season)!;
        const totalRounds = roundsMap.size;
        const totalSubmissions = Array.from(roundsMap.values()).reduce((sum, submissions) => sum + submissions.length, 0);

        return (
          <div key={season} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button 
              onClick={() => toggleSeason(season)} 
              className="w-full bg-gray-700 px-6 py-4 border-b border-gray-600 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">
                    Season {season} ({totalRounds} rounds, {totalSubmissions} submissions)
                  </h3>
                  <p className="text-sm text-gray-400">Click to expand/collapse</p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="p-6 space-y-6">
                {Array.from(roundsMap.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([roundNumber, roundSubmissions]) => {
                    const roundName = roundSubmissions[0]?.roundName || `Round ${roundNumber}`;
                    const roundSubmissionsWithVotes = roundSubmissions
                      .map(submission => {
                        const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
                        const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
                        const voteCount = submissionVotes.length;
                        
                        return {
                          ...submission,
                          votes: submissionVotes,
                          totalPoints,
                          voteCount
                        };
                      })
                      .sort((a, b) => b.totalPoints - a.totalPoints)
                      .slice(0, 20); // Limit to top 20 submissions per round

                    return (
                      <div key={roundNumber} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">{roundName}</h4>
                          <span className="text-sm text-gray-400">{roundSubmissions.length} submissions</span>
                        </div>
                        
                        <div className="space-y-3">
                          {roundSubmissionsWithVotes.map((submission, index) => (
                            <div key={submission.spotifyUri} className="bg-gray-600 rounded p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <div className="flex items-center justify-center w-6 h-6 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">{submission.title}</p>
                                      <p className="text-sm text-gray-300">by {submission.artist}</p>
                                      {submission.album && (
                                        <p className="text-xs text-gray-400">Album: {submission.album}</p>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-400">Submitted by: {submission.submitterName}</p>
                                  {submission.comment && (
                                    <div className="mt-2 p-2 bg-gray-500 rounded text-xs text-gray-200">
                                      &quot;{submission.comment}&quot;
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right ml-4">
                                  <div className="flex items-center mb-1">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="text-lg font-bold text-green-400">{submission.totalPoints}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-400">
                                    <Vote className="h-3 w-3 mr-1" />
                                    {submission.voteCount} votes
                                  </div>
                                </div>
                              </div>
                              
                              {submission.votes.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-500">
                                  <h5 className="text-sm font-medium text-gray-300 mb-2">Votes:</h5>
                                  <div className="space-y-1">
                                    {submission.votes.map((vote, voteIndex) => (
                                      <div key={voteIndex} className="flex items-center justify-between text-xs bg-gray-500 rounded px-2 py-1">
                                        <div className="flex items-center">
                                          <Users className="h-3 w-3 mr-1 text-gray-400" />
                                          <span className="text-gray-300">{vote.voterName}</span>
                                          {vote.comment && (
                                            <span className="text-gray-400 ml-2">&quot;{vote.comment}&quot;</span>
                                          )}
                                        </div>
                                        <span className="font-medium text-green-400">{vote.pointsAssigned} pts</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
