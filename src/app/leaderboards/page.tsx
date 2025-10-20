'use client';

import { useEffect, useState } from 'react';
import { Trophy, Users, Music, Star } from 'lucide-react';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';
import ArtistsModal from '../../components/ArtistsModal';

interface LeaderboardData {
  topSubmitters: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
  }>;
  topSubmittersByAverage: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
  }>;
  topArtists: [string, number][];
  topAlbums: [string, number][];
  topAlbumsDetailed?: Array<{ album: string; count: number; artists: string[] }>; 
  topArtistsByVotes: Array<{
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submissionCount: number;
  }>;
  topSongsByVotes: Array<{
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submitter: string;
    season: number;
    round: number;
    allSeasonsRounds: string;
  }>;
  topSongsSingleSubmission: Array<{
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submitter: string;
    season: number;
    round: number;
    allSeasonsRounds: string;
  }>;
}

export default function LeaderboardsPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [showArtistsModal, setShowArtistsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/leaderboards');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const leaderboardData = await response.json();
        setData(leaderboardData);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Overall Leaderboards
            </h1>
            <p className="text-lg text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayedArtists = data.topArtists.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Overall Leaderboards
            </h1>
            <p className="text-lg text-slate-300">
              Rankings across all seasons for submitters, artists, albums, and vote performance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Top Artists with View All */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Music className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Artists</h2>
            </div>
            {data.topArtists.length > 20 && (
              <a
                href="/artists"
                className="text-sm text-green-400 hover:text-green-300 underline"
              >
                View All {data.topArtists.length.toLocaleString()}
              </a>
            )}
          </div>
          
          <div className="space-y-3">
            {displayedArtists.map(([artist, count], index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{artist}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-400 whitespace-nowrap">{count}</p>
                  <p className="text-sm text-gray-400">submissions</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Albums */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Top Albums</h2>
          </div>
          
          <div className="space-y-3">
            {(data.topAlbumsDetailed && data.topAlbumsDetailed.length > 0
              ? data.topAlbumsDetailed.map((row) => [row.album, row.count] as [string, number])
              : data.topAlbums
            ).map(([album, count], index) => {
              const artists = data.topAlbumsDetailed?.find(a => a.album === album)?.artists || [];
              return (
                <div key={album} className="p-3 bg-gray-700 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{album}</p>
                        {artists.length > 0 && (
                          <p className="text-xs text-gray-400">{artists.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-green-400 whitespace-nowrap">{count}</p>
                      <p className="text-sm text-gray-400">submissions</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SimpleGlassCard>

        {/* Most Votes per Artist */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Music className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Most Votes per Artist</h2>
          </div>

          <div className="space-y-3">
            {data.topArtistsByVotes.map((artist, index) => (
              <div key={artist.artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{artist.artist}</p>
                    <p className="text-sm text-gray-400">{artist.submissionCount} submissions</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-400 whitespace-nowrap">{artist.totalVotes}</p>
                  <p className="text-sm text-gray-400 whitespace-nowrap">{artist.totalPoints} pts</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Most Votes per Song */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Most Votes per Song</h2>
          </div>

          <div className="space-y-3">
            {data.topSongsByVotes.map((song, index) => (
              <div key={`${song.title}-${song.artist}`} className="p-4 bg-gray-700 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-lg">{song.title}</p>
                      <p className="text-sm text-gray-300 mb-2">by {song.artist}</p>
                      <div className="space-y-1">
                        {song.allSeasonsRounds.split(', ').map((submission, subIndex) => (
                          <p key={subIndex} className="text-xs text-gray-400">
                            {submission}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-green-400 text-lg">{song.totalVotes}</p>
                    <p className="text-xs text-gray-400">unique voters</p>
                    <p className="font-bold text-green-400 text-lg mt-1">{song.totalPoints}</p>
                    <p className="text-xs text-gray-400">total pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Most Votes per Song (Single Submission Only) */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Most Votes (Single Submission)</h2>
          </div>

          <div className="space-y-3">
            {data.topSongsSingleSubmission.map((song, index) => (
              <div key={`${song.title}-${song.artist}`} className="p-4 bg-gray-700 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-lg">{song.title}</p>
                      <p className="text-sm text-gray-300 mb-2">by {song.artist}</p>
                      <p className="text-xs text-gray-400">{song.allSeasonsRounds}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-bold text-green-400 text-lg">{song.totalPoints}</p>
                    <p className="text-xs text-gray-400">total pts</p>
                    <p className="font-bold text-green-400 text-lg mt-1">{song.totalVotes}</p>
                    <p className="text-xs text-gray-400">unique voters</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Submitters by Average Points */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Highest Average Points</h2>
          </div>
          
          <div className="space-y-3">
            {data.topSubmittersByAverage.map((submitter, index) => (
              <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{submitter.name}</p>
                    <p className="text-sm text-gray-400">{submitter.submissions} submissions across {submitter.seasons.length} seasons</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{submitter.averagePoints} avg pts</p>
                  <p className="text-sm text-gray-400">{submitter.totalPoints} total pts</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>

        {/* Top Submitters - MOVED TO BOTTOM */}
        <SimpleGlassCard variant="elevated" size="lg">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-bold text-green-400">Top Submitters</h2>
          </div>
          
          <div className="space-y-3">
            {data.topSubmitters.map((submitter, index) => (
              <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{submitter.name}</p>
                    <p className="text-sm text-gray-400">{submitter.submissions} submissions across {submitter.seasons.length} seasons</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{submitter.totalPoints} pts</p>
                  <p className="text-sm text-gray-400">{submitter.averagePoints} avg/sub</p>
                </div>
              </div>
            ))}
          </div>
        </SimpleGlassCard>
      </div>

          {/* Artists Modal */}
          <ArtistsModal
            isOpen={showArtistsModal}
            onClose={() => setShowArtistsModal(false)}
            artists={data.topArtists}
          />
        </div>
      </div>
    </div>
  );
}