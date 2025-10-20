'use client';

import { useState } from 'react';
import { Submission } from '@/lib/data';
import { ChevronDown, ChevronRight, Users, Star, MessageSquare } from 'lucide-react';

interface Vote {
  spotifyUri: string;
  voterId: string;
  voterName: string;
  created: string;
  pointsAssigned: number;
  comment: string;
  roundId: string;
}

interface VotingRollupProps {
  submissions: Submission[];
  votes: Vote[];
}

export default function VotingRollup({ submissions, votes }: VotingRollupProps) {
  // Group votes by submission
  const votesBySubmission = votes.reduce((acc, vote) => {
    if (!acc[vote.spotifyUri]) {
      acc[vote.spotifyUri] = [];
    }
    acc[vote.spotifyUri].push(vote);
    return acc;
  }, {} as Record<string, Vote[]>);

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

  // Sort seasons (latest first)
  const seasons = Object.keys(submissionsBySeasonAndRound)
    .map(Number)
    .sort((a, b) => b - a);

  // State for expanded sections
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set([seasons[0]]) // First season expanded by default
  );
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

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

  const toggleSubmission = (submissionId: string) => {
    setExpandedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSeasons(new Set(seasons));
    const allRounds = new Set<string>();
    const allSubmissions = new Set<string>();
    seasons.forEach(season => {
      Object.keys(submissionsBySeasonAndRound[season]).forEach(roundNumber => {
        allRounds.add(`${season}-${roundNumber}`);
        submissionsBySeasonAndRound[season][Number(roundNumber)].forEach(submission => {
          allSubmissions.add(submission.spotifyUri);
        });
      });
    });
    setExpandedRounds(allRounds);
    setExpandedSubmissions(allSubmissions);
  };

  const collapseAll = () => {
    setExpandedSeasons(new Set());
    setExpandedRounds(new Set());
    setExpandedSubmissions(new Set());
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
                          </div>
                        </div>
                      </div>

                      {/* Round Content */}
                      {isRoundExpanded && (
                        <div className="px-4 pb-4">
                          <div className="space-y-3">
                            {roundSubmissions.map((submission, index) => {
                              const submissionVotes = votesBySubmission[submission.spotifyUri] || [];
                              const isSubmissionExpanded = expandedSubmissions.has(submission.spotifyUri);
                              const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);

                              return (
                                <div
                                  key={index}
                                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-medium text-white">
                                          {submission.title}
                                        </h4>
                                        <span className="text-sm text-gray-400">
                                          by {submission.artist}
                                        </span>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                          <Star className="w-4 h-4" />
                                          <span className="text-sm font-medium">{totalPoints}</span>
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-300 mb-2">
                                        Album: {submission.album}
                                      </div>
                                      <div className="text-sm text-gray-400 mb-3">
                                        Submitted by: {submission.submitterName}
                                      </div>
                                      
                                      {/* Voting Summary */}
                                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                        <div className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          <span>{submissionVotes.length} votes</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4" />
                                          <span>{totalPoints} total points</span>
                                        </div>
                                      </div>

                                      {/* Votes Details */}
                                      {submissionVotes.length > 0 && (
                                        <div className="mt-3">
                                          <button
                                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                                            onClick={() => toggleSubmission(submission.spotifyUri)}
                                          >
                                            {isSubmissionExpanded ? (
                                              <ChevronDown className="w-4 h-4" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4" />
                                            )}
                                            <span className="text-sm font-medium">
                                              View {submissionVotes.length} votes
                                            </span>
                                          </button>

                                          {isSubmissionExpanded && (
                                            <div className="mt-3 space-y-2">
                                              {submissionVotes.map((vote, voteIndex) => (
                                                <div
                                                  key={voteIndex}
                                                  className="bg-gray-700 rounded-lg p-3"
                                                >
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-medium text-white">
                                                        {vote.voterName}
                                                      </span>
                                                      <div className="flex items-center gap-1 text-yellow-400">
                                                        <Star className="w-3 h-3" />
                                                        <span className="text-sm">{vote.pointsAssigned}</span>
                                                      </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                      {new Date(vote.created).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                  
                                                  {vote.comment && (
                                                    <div className="mt-2 p-2 bg-gray-600 rounded">
                                                      <div className="flex items-center gap-1 mb-1">
                                                        <MessageSquare className="w-3 h-3 text-green-400" />
                                                        <span className="text-xs font-medium text-green-400">
                                                          Comment
                                                        </span>
                                                      </div>
                                                      <p className="text-xs text-gray-300">
                                                        {vote.comment}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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

