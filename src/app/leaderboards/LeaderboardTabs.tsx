'use client';

import { useState } from 'react';
import { Trophy, Users, Music, Star, BarChart3, TrendingUp } from 'lucide-react';
import SimpleGlassCard from '../../components/ui/SimpleGlassCard';

interface LeaderboardData {
  topSubmitters: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
    equivalizedAveragePoints: number;
  }>;
  topSubmittersByAverage: Array<{
    id: string;
    name: string;
    submissions: number;
    seasons: number[];
    totalPoints: number;
    averagePoints: number;
    equivalizedAveragePoints: number;
  }>;
  topArtists: [string, number][];
  topAlbums: [string, number][];
  topAlbumsDetailed?: Array<{ album: string; count: number; artists: string[] }>; 
  topAlbumsByVotes: Array<{
    album: string;
    totalVotes: number;
    totalPoints: number;
    submissionCount: number;
    artists: string[];
  }>;
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
  topNormalizedSubmitters: Array<{
    submitterId: string;
    submitterName: string;
    seasons: number[];
    totalVotesReceived: number;
    normalizedScore: number;
    missedVotes: number;
  }>;
}

interface LeaderboardTabsProps {
  data: LeaderboardData;
}

export default function LeaderboardTabs({ data }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState('artists');

  return (
    <>
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('artists')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'artists'
              ? 'bg-emerald-400 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Music className="inline w-4 h-4 mr-2" />
          Artists
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'albums'
              ? 'bg-emerald-400 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <BarChart3 className="inline w-4 h-4 mr-2" />
          Albums
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'songs'
              ? 'bg-emerald-400 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Star className="inline w-4 h-4 mr-2" />
          Songs
        </button>
        <button
          onClick={() => setActiveTab('submitters')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'submitters'
              ? 'bg-emerald-400 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Users className="inline w-4 h-4 mr-2" />
          Submitters
        </button>
        <button
          onClick={() => setActiveTab('point-average')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'point-average'
              ? 'bg-emerald-400 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <TrendingUp className="inline w-4 h-4 mr-2" />
          Point Average
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Artists */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Music className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-green-400">Most Submissions by Artist</h2>
              </div>
            </div>
            
            <div className="space-y-3">
              {data.topArtists.slice(0, 20).map(([artist, count], index) => (
                <div key={artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{count} submissions</p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>

          {/* Top Artists by Votes */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-blue-400">Most Votes by Artist</h2>
            </div>
            
            <div className="space-y-3">
              {data.topArtistsByVotes.slice(0, 20).map((artist, index) => (
                <div key={artist.artist} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{artist.artist}</p>
                      <p className="text-sm text-gray-400">{artist.submissionCount} submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{artist.totalVotes} votes</p>
                    <p className="text-sm text-gray-400">{artist.totalPoints} points</p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>
        </div>
      )}

      {activeTab === 'albums' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most Submissions by Album */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-purple-400">Most Submissions by Album</h2>
            </div>
            
            <div className="space-y-3">
              {data.topAlbums.slice(0, 20).map(([album, count], index) => {
                const artists = data.topAlbumsDetailed?.find(a => a.album === album)?.artists || [];
                return (
                  <div key={album} className="p-3 bg-gray-700 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{album}</p>
                          <p className="text-sm text-gray-400">{artists.join(', ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-400">{count} submissions</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SimpleGlassCard>

          {/* Most Votes by Album */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-blue-400">Most Votes by Album</h2>
            </div>
            
            <div className="space-y-3">
              {data.topAlbumsByVotes.slice(0, 20).map((album, index) => {
                const artistText = album.artists.length > 0 ? album.artists.join(', ') : 'Unknown Artist';
                
                return (
                  <div key={album.album} className="p-3 bg-gray-700 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{album.album}</p>
                          <p className="text-sm text-gray-400">{artistText}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400">{album.totalVotes} votes</p>
                        <p className="text-sm text-gray-400">{album.totalPoints} points</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SimpleGlassCard>
        </div>
      )}

      {activeTab === 'songs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most Votes per Song */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">Most Votes per Song</h2>
            </div>
            
            <div className="space-y-3">
              {data.topSongsByVotes.slice(0, 20).map((song, index) => (
                <div key={`${song.title}-${song.season}`} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist} • S{song.season} • {song.submitter}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400">{song.totalVotes} votes</p>
                    <p className="text-sm text-gray-400">{song.totalPoints} points</p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>

          {/* Most Votes (Single Submission) */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-orange-400 mr-3" />
              <h2 className="text-2xl font-bold text-orange-400">Most Votes (Single Submission)</h2>
            </div>
            
            <div className="space-y-3">
              {data.topSongsSingleSubmission.slice(0, 20).map((song, index) => (
                <div key={`${song.title}-${song.season}`} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-gray-400">{song.artist} • S{song.season} • {song.submitter}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-400">{song.totalVotes} votes</p>
                    <p className="text-sm text-gray-400">{song.totalPoints} points</p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>
        </div>
      )}

      {activeTab === 'submitters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Submitters by Total Points */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Submitters</h2>
            </div>
            
            <div className="space-y-3">
              {data.topSubmitters.map((submitter, index) => (
                <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
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

          {/* Most Submissions by Submitter */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Most Submissions</h2>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              Submitters with the most total submissions
            </p>
            
            <div className="space-y-3">
              {data.topSubmitters.slice(0, 20).map((submitter, index) => (
                <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{submitter.name}</p>
                      <p className="text-sm text-gray-400">{submitter.seasons.length} seasons</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{submitter.submissions} submissions</p>
                    <p className="text-sm text-gray-400">{submitter.totalPoints} total points</p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>
        </div>
      )}

      {activeTab === 'point-average' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Highest Average Points */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Highest Average Points</h2>
            </div>
            
            <div className="space-y-3">
              {data.topSubmittersByAverage.map((submitter, index) => (
                <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
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

          {/* Highest Equivalized Average Points */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-blue-400">Highest Equivalized Average Points</h2>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              Normalized to 30-point system to compare across different voting systems
            </p>
            
            <div className="space-y-3">
              {data.topSubmittersByAverage.map((submitter, index) => (
                <div key={submitter.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{submitter.name}</p>
                      <p className="text-sm text-gray-400">{submitter.submissions} submissions across {submitter.seasons.length} seasons</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{submitter.equivalizedAveragePoints} equiv avg pts</p>
                    <p className="text-sm text-gray-400">{submitter.averagePoints} raw avg pts</p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>
        </div>
      )}
    </>
  );
}
