'use client';

import { useState } from 'react';
import { Submission } from '@/lib/data';
import { ChevronDown, ChevronRight, Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface Vote {
  spotifyUri: string;
  voterId: string;
  voterName: string;
  created: string;
  pointsAssigned: number;
  comment: string;
  roundId: string;
}

interface MissingVotesProps {
  submissions: Submission[];
  votes: Vote[];
  competitors: Record<string, string>;
}

export default function MissingVotes({ submissions, votes, competitors }: MissingVotesProps) {
  // Group submissions by season and round
  const submissionsBySeasonAndRound = submissions.reduce((acc, submission) => {
    if (!acc[submission.season]) {
      acc[submission.season] = {};
    }
    if (!acc[submission.season][submission.roundNumber]) {
      acc[submission.season][submission.roundNumber] = [];
    }
    acc[submission.season][submission.roundNumber].push(submission);
    return acc;
  }, {} as Record<number, Record<number, Submission[]>>);

  // Group votes by round
  const votesByRound = votes.reduce((acc, vote) => {
    if (!acc[vote.roundId]) {
      acc[vote.roundId] = [];
    }
    acc[vote.roundId].push(vote);
    return acc;
  }, {} as Record<string, Vote[]>);

  // Get all competitors for a season
  const getSeasonCompetitors = (season: number) => {
    const seasonSubmissions = submissionsBySeasonAndRound[season];
    if (!seasonSubmissions) return [];
    
    const competitors = new Set<string>();
    Object.values(seasonSubmissions).flat().forEach(submission => {
      competitors.add(submission.submitterId);
    });
    return Array.from(competitors);
  };

  // Get voters for a specific round
  const getRoundVoters = (roundId: string) => {
    const roundVotes = votesByRound[roundId] || [];
    return new Set(roundVotes.map(vote => vote.voterId));
  };

  // Find missing votes for a round
  const getMissingVotes = (season: number, roundNumber: number) => {
    const seasonCompetitors = getSeasonCompetitors(season);
    const roundSubmissions = submissionsBySeasonAndRound[season]?.[roundNumber] || [];
    
    if (roundSubmissions.length === 0) return [];
    
    const roundId = roundSubmissions[0].roundId;
    const roundVoters = getRoundVoters(roundId);
    
    return seasonCompetitors.filter(competitorId => !roundVoters.has(competitorId));
  };

  // Sort seasons (latest first)
  const seasons = Object.keys(submissionsBySeasonAndRound)
    .map(Number)
    .sort((a, b) => b - a);

  // State for expanded sections
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set([seasons[0]]) // First season expanded by default
  );
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());

  const toggleSeason = (season: number) => {
    setExpandedSeasons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(season)) {
        newSet.delete(season);
      } else {
        newSet.add(season);
      }
      return newSet;
    });
  };

  const toggleRound = (season: number, roundNumber: number) => {
    const key = `${season}-${roundNumber}`;
    setExpandedRounds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSeasons(new Set(seasons));
    const allRounds = new Set<string>();
    seasons.forEach(season => {
      Object.keys(submissionsBySeasonAndRound[season]).forEach(roundNumber => {
        allRounds.add(`${season}-${roundNumber}`);
      });
    });
    setExpandedRounds(allRounds);
  };

  const collapseAll = () => {
    setExpandedSeasons(new Set());
    setExpandedRounds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Expand/Collapse All Buttons */}
      <div className="flex gap-4">
        <button
          onClick={expandAll}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Collapse All
        </button>
      </div>

      {seasons.map((season) => {
        const isSeasonExpanded = expandedSeasons.has(season);
        const seasonSubmissions = submissionsBySeasonAndRound[season];
        const rounds = Object.keys(seasonSubmissions)
          .map(Number)
          .sort((a, b) => a - b);

        return (
          <div key={season} className="border border-gray-700 rounded-lg overflow-hidden">
            {/* Season Header */}
            <div
              className="bg-gray-800 p-4 cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => toggleSeason(season)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSeasonExpanded ? (
                    <ChevronDown className="w-5 h-5 text-green-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-green-400" />
                  )}
                  <h2 className="text-xl font-bold text-green-400">
                    Season {season}
                  </h2>
                  <span className="text-sm text-gray-400">
                    ({Object.values(seasonSubmissions).flat().length} submissions)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{rounds.length} rounds</span>
                </div>
              </div>
            </div>

            {/* Season Content */}
            {isSeasonExpanded && (
              <div className="bg-gray-900">
                {rounds.map((roundNumber) => {
                  const roundSubmissions = seasonSubmissions[roundNumber];
                  const firstSubmission = roundSubmissions[0];
                  const isRoundExpanded = expandedRounds.has(`${season}-${roundNumber}`);
                  const missingVotes = getMissingVotes(season, roundNumber);
                  const seasonCompetitors = getSeasonCompetitors(season);
                  const participationRate = ((seasonCompetitors.length - missingVotes.length) / seasonCompetitors.length * 100).toFixed(1);

                  return (
                    <div key={roundNumber} className="border-b border-gray-700 last:border-b-0">
                      {/* Round Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                        onClick={() => toggleRound(season, roundNumber)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isRoundExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-blue-400" />
                            )}
                            <span className="text-lg font-semibold text-blue-400">
                              Round {roundNumber}
                            </span>
                            <span className="text-sm text-gray-300">
                              {firstSubmission.roundName}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{roundSubmissions.length} submissions</span>
                            <div className="flex items-center gap-1">
                              {missingVotes.length === 0 ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                              )}
                              <span>{participationRate}% participation</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Round Content */}
                      {isRoundExpanded && (
                        <div className="px-4 pb-4">
                          <div className="space-y-4">
                            {/* Participation Summary */}
                            <div className="bg-gray-800 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="w-5 h-5 text-blue-400" />
                                <h4 className="text-lg font-semibold text-blue-400">
                                  Participation Summary
                                </h4>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Total Competitors:</span>
                                  <span className="ml-2 text-white">{seasonCompetitors.length}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Voted:</span>
                                  <span className="ml-2 text-green-400">{seasonCompetitors.length - missingVotes.length}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Missing Votes:</span>
                                  <span className="ml-2 text-red-400">{missingVotes.length}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Participation Rate:</span>
                                  <span className="ml-2 text-blue-400">{participationRate}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Missing Votes List */}
                            {missingVotes.length > 0 && (
                              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertTriangle className="w-5 h-5 text-red-400" />
                                  <h4 className="text-lg font-semibold text-red-400">
                                    Missing Votes ({missingVotes.length})
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  {missingVotes.map((competitorId, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm text-red-300"
                                    >
                                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                      <span>{competitors[competitorId] || competitorId}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* All Voted List */}
                            {missingVotes.length < seasonCompetitors.length && (
                              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <h4 className="text-lg font-semibold text-green-400">
                                    Voted ({seasonCompetitors.length - missingVotes.length})
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  {seasonCompetitors
                                    .filter(competitorId => !missingVotes.includes(competitorId))
                                    .map((competitorId, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm text-green-300"
                                    >
                                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                      <span>{competitors[competitorId] || competitorId}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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

