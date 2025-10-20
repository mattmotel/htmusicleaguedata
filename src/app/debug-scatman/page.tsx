'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ScatmanData {
  artist: string;
  submissionCount: number;
  totalVotes: number;
  totalPoints: number;
  possibleMatches: string[];
  submissions: Array<{
    title: string;
    album: string;
    submitter: string;
    season: number;
    round: number;
    roundName: string;
    spotifyUri: string;
    voteCount: number;
    totalPoints: number;
    votes: Array<{
      voter: string;
      points: number;
      comment: string;
    }>;
  }>;
}

export default function DebugScatmanPage() {
  const [data, setData] = useState<ScatmanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/debug-scatman');
        if (!response.ok) {
          throw new Error('Failed to fetch Scatman data');
        }
        const scatmanData = await response.json();
        setData(scatmanData);
      } catch (error) {
        console.error('Error loading Scatman data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Scatman Evidence</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Scatman Evidence</h1>
          <p className="text-gray-400">No data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/leaderboards" className="text-green-400 hover:text-green-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Scatman Evidence</h1>
          <p className="text-gray-400">Detailed breakdown for &quot;Scatman John, Lou Bega&quot;</p>
        </div>
      </div>

      {/* Possible Matches */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Possible Artist Matches</h2>
        <p className="text-gray-400 mb-4">Found {data.possibleMatches.length} artists that might match &quot;Scatman John, Lou Bega&quot;:</p>
        {data.possibleMatches.length > 0 ? (
          <div className="space-y-2">
            {data.possibleMatches.map((artist) => (
              <div key={artist} className="bg-gray-700 rounded p-3">
                <p className="font-medium text-white">{artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No matching artists found</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Total Submissions</p>
            <p className="text-2xl font-bold text-green-400">{data.submissionCount}</p>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Total Votes</p>
            <p className="text-2xl font-bold text-green-400">{data.totalVotes}</p>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <p className="text-gray-400 text-sm">Total Points</p>
            <p className="text-2xl font-bold text-green-400">{data.totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Detailed Submissions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-400">Individual Submissions</h2>
        {data.submissions.map((submission) => (
          <div key={submission.spotifyUri} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{submission.title}</h3>
                <p className="text-gray-300">Album: {submission.album}</p>
                <p className="text-gray-400">Submitted by: {submission.submitter}</p>
                <p className="text-gray-400">Season {submission.season}, Round {submission.round} - {submission.roundName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{submission.totalPoints}</p>
                <p className="text-sm text-gray-400">total points</p>
                <p className="text-lg font-bold text-green-400 mt-1">{submission.voteCount}</p>
                <p className="text-sm text-gray-400">votes</p>
              </div>
            </div>

            {/* Individual Votes */}
            {submission.votes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-300 mb-3">Individual Votes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {submission.votes.map((vote) => (
                    <div key={`${vote.voter}-${vote.points}`} className="bg-gray-700 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{vote.voter}</p>
                          {vote.comment && (
                            <p className="text-sm text-gray-400 italic">&quot;{vote.comment}&quot;</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">{vote.points} pts</p>
                        </div>
                      </div>
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
}
