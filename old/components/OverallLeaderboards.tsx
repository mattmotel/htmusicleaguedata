'use client';

import { useState } from 'react';
import { Submission } from '@/lib/data';
import { Trophy, Medal, Award, Star, Users, Calendar, Music } from 'lucide-react';

interface Vote {
  spotifyUri: string;
  voterId: string;
  voterName: string;
  created: string;
  pointsAssigned: number;
  comment: string;
  roundId: string;
}

interface OverallLeaderboardsProps {
  submissions: Submission[];
  votes: Vote[];
}

export default function OverallLeaderboards({ submissions, votes }: OverallLeaderboardsProps) {
  // Group votes by submission
  const votesBySubmission = votes.reduce((acc, vote) => {
    if (!acc[vote.spotifyUri]) {
      acc[vote.spotifyUri] = [];
    }
    acc[vote.spotifyUri].push(vote);
    return acc;
  }, {} as Record<string, Vote[]>);

  // Calculate points for each submission
  const submissionsWithPoints = submissions.map(submission => {
    const submissionVotes = votesBySubmission[submission.spotifyUri] || [];
    const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
    return {
      ...submission,
      totalPoints,
      voteCount: submissionVotes.length
    };
  });

  // Calculate submitter stats
  const submitterStats = submissionsWithPoints.reduce((acc, submission) => {
    const submitterId = submission.submitterId;
    const submitterName = submission.submitterName;
    
    if (!acc[submitterId]) {
      acc[submitterId] = {
        id: submitterId,
        name: submitterName,
        totalSubmissions: 0,
        totalPoints: 0,
        seasons: new Set<number>(),
        averagePoints: 0
      };
    }
    
    acc[submitterId].totalSubmissions++;
    acc[submitterId].totalPoints += submission.totalPoints;
    acc[submitterId].seasons.add(submission.season);
    
    return acc;
  }, {} as Record<string, {
    id: string;
    name: string;
    totalSubmissions: number;
    totalPoints: number;
    seasons: Set<number>;
    averagePoints: number;
  }>);

  // Calculate averages and sort
  Object.values(submitterStats).forEach(stats => {
    stats.averagePoints = stats.totalPoints / stats.totalSubmissions;
  });

  const sortedSubmitters = Object.values(submitterStats)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate artist stats
  const artistStats = submissionsWithPoints.reduce((acc, submission) => {
    const artist = submission.artist;
    
    if (!acc[artist]) {
      acc[artist] = {
        name: artist,
        totalSubmissions: 0,
        totalPoints: 0,
        seasons: new Set<number>(),
        averagePoints: 0
      };
    }
    
    acc[artist].totalSubmissions++;
    acc[artist].totalPoints += submission.totalPoints;
    acc[artist].seasons.add(submission.season);
    
    return acc;
  }, {} as Record<string, {
    name: string;
    totalSubmissions: number;
    totalPoints: number;
    seasons: Set<number>;
    averagePoints: number;
  }>);

  // Calculate averages and sort
  Object.values(artistStats).forEach(stats => {
    stats.averagePoints = stats.totalPoints / stats.totalSubmissions;
  });

  const sortedArtists = Object.values(artistStats)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate season stats
  const seasonStats = submissionsWithPoints.reduce((acc, submission) => {
    const season = submission.season;
    
    if (!acc[season]) {
      acc[season] = {
        season,
        totalSubmissions: 0,
        totalPoints: 0,
        uniqueSubmitters: new Set<string>(),
        uniqueArtists: new Set<string>()
      };
    }
    
    acc[season].totalSubmissions++;
    acc[season].totalPoints += submission.totalPoints;
    acc[season].uniqueSubmitters.add(submission.submitterId);
    acc[season].uniqueArtists.add(submission.artist);
    
    return acc;
  }, {} as Record<number, {
    season: number;
    totalSubmissions: number;
    totalPoints: number;
    uniqueSubmitters: Set<string>;
    uniqueArtists: Set<string>;
  }>);

  const sortedSeasons = Object.values(seasonStats)
    .sort((a, b) => b.season - a.season);

  // State for active tab
  const [activeTab, setActiveTab] = useState<'submitters' | 'artists' | 'seasons'>('submitters');

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm text-gray-400">{index + 1}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('submitters')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'submitters'
              ? 'border-green-400 text-green-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Submitters</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('artists')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'artists'
              ? 'border-green-400 text-green-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span>Artists</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('seasons')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'seasons'
              ? 'border-green-400 text-green-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Seasons</span>
          </div>
        </button>
      </div>

      {/* Submitters Leaderboard */}
      {activeTab === 'submitters' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-400">Top Submitters</h2>
          <div className="grid gap-4">
            {sortedSubmitters.slice(0, 20).map((submitter, index) => (
              <div
                key={submitter.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRankIcon(index)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {submitter.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{submitter.totalSubmissions} submissions</span>
                        <span>{submitter.seasons.size} seasons</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="text-xl font-bold">{submitter.totalPoints}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {submitter.averagePoints.toFixed(1)} avg
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artists Leaderboard */}
      {activeTab === 'artists' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-400">Top Artists</h2>
          <div className="grid gap-4">
            {sortedArtists.slice(0, 20).map((artist, index) => (
              <div
                key={artist.name}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRankIcon(index)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{artist.totalSubmissions} submissions</span>
                        <span>{artist.seasons.size} seasons</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="text-xl font-bold">{artist.totalPoints}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {artist.averagePoints.toFixed(1)} avg
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasons Leaderboard */}
      {activeTab === 'seasons' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-400">Season Statistics</h2>
          <div className="grid gap-4">
            {sortedSeasons.map((season, index) => (
              <div
                key={season.season}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getRankIcon(index)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Season {season.season}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{season.totalSubmissions} submissions</span>
                        <span>{season.uniqueSubmitters.size} submitters</span>
                        <span>{season.uniqueArtists.size} artists</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="text-xl font-bold">{season.totalPoints}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {(season.totalPoints / season.totalSubmissions).toFixed(1)} avg
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

