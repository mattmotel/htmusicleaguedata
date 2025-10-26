'use client';

import Link from 'next/link';
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
  topSubmittersByEquivalizedAverage: Array<{
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
    submissions: Array<{
      submitter: string;
      season: number;
      round: number;
      votes: number;
      points: number;
      spotifyUri: string;
    }>;
  }>;
  topSongsSingleSubmission: Array<{
    title: string;
    artist: string;
    totalVotes: number;
    totalPoints: number;
    submissions: Array<{
      submitter: string;
      season: number;
      round: number;
      votes: number;
      points: number;
      spotifyUri: string;
    }>;
  }>;
  topNormalizedSubmitters: Array<{
    submitterId: string;
    submitterName: string;
    seasons: number[];
    totalVotesReceived: number;
    normalizedScore: number;
    missedVotes: number;
  }>;
  bestSeasonPerformances: Array<{
    submitterName: string;
    season: number;
    rawScore: number;
    normalizedScore: number;
    normalizationFactor: number;
    submissions: number;
  }>;
}

interface LeaderboardTabsProps {
  data: LeaderboardData;
  currentTab: string;
}

export default function LeaderboardTabs({ data, currentTab }: LeaderboardTabsProps) {
  return (
    <>
      {/* Tabs */}
      <div className="overflow-x-auto scrollbar-hide mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex border-b border-gray-600 min-w-max md:min-w-0">
        <Link
          href="/leaderboards/artists"
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            currentTab === 'artists'
              ? 'border-emerald-400 text-emerald-400 bg-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
          }`}
        >
          <Music className="w-4 h-4 mr-2" />
          Artists
        </Link>
        <Link
          href="/leaderboards/albums"
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            currentTab === 'albums'
              ? 'border-emerald-400 text-emerald-400 bg-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Albums
        </Link>
        <Link
          href="/leaderboards/songs"
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            currentTab === 'songs'
              ? 'border-emerald-400 text-emerald-400 bg-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
          }`}
        >
          <Star className="w-4 h-4 mr-2" />
          Songs
        </Link>
        <Link
          href="/leaderboards/submitters"
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            currentTab === 'submitters'
              ? 'border-emerald-400 text-emerald-400 bg-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Submitters
        </Link>
        <Link
          href="/leaderboards/point-average"
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            currentTab === 'point-average'
              ? 'border-emerald-400 text-emerald-400 bg-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Point Average
        </Link>
        <Link
          href="/leaderboards/best-seasons"
          className={`flex items-center px-6 py-3 font-medium transition-colors border-b-2 ${
            currentTab === 'best-seasons'
              ? 'border-emerald-400 text-emerald-400 bg-gray-800'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
          }`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Best Seasons
        </Link>
        </div>
      </div>

      {/* Tab Content */}
      {currentTab === 'artists' && (
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

      {currentTab === 'albums' && (
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

      {currentTab === 'songs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most Votes per Song */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">Most Votes per Song</h2>
            </div>
            
            <div className="space-y-4">
              {data.topSongsByVotes.slice(0, 20).map((song, index) => (
                <div key={`${song.title}-${song.artist}`} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">{song.title}</p>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-400 text-xl">{song.totalPoints} points</p>
                      <p className="text-sm text-gray-400">{song.totalVotes} votes total</p>
                    </div>
                  </div>
                  <div className="space-y-1 ml-11 border-l-2 border-gray-600 pl-3">
                    {song.submissions.map((sub, subIndex) => (
                      <div key={`${sub.spotifyUri}-${sub.season}-${sub.round}-${sub.submitter}`} className="py-1">
                        <p className="text-sm text-gray-300">
                          S{sub.season}, Round {sub.round} • {sub.submitter}
                        </p>
                      </div>
                    ))}
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
              {data.topSongsSingleSubmission.slice(0, 20).map((song, index) => {
                const sub = song.submissions[0];
                return (
                  <div key={sub.spotifyUri} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-400 text-gray-900 rounded-full text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{song.title}</p>
                        <p className="text-sm text-gray-400">{song.artist} • S{sub.season}, Round {sub.round} • {sub.submitter}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-400">{sub.points} points</p>
                      <p className="text-sm text-gray-400">{sub.votes} votes</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SimpleGlassCard>
        </div>
      )}

      {currentTab === 'submitters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Submitters by Total Points */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-3">
              <Trophy className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Top Submitters</h2>
            </div>
            <p className="text-gray-400 mb-8 text-sm">
              Most total points earned
            </p>
            
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
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Users className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-green-400">Most Submissions</h2>
              </div>
              <p className="text-gray-400 text-sm ml-9">
                Submitters with the most total submissions
              </p>
            </div>
            
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

      {currentTab === 'point-average' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Highest Average Points */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-3">
              <Star className="h-6 w-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-green-400">Highest Average Points</h2>
            </div>
            <p className="text-gray-400 mb-8 text-sm">
              Average points per submission (min. 3 submissions)
            </p>
            
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
            <div className="flex items-center mb-3">
              <Star className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-blue-400">Highest Equivalized Average Points</h2>
            </div>
            <p className="text-gray-400 mb-8 text-sm">
              Normalized to 30-point system
            </p>
            
            <div className="space-y-3">
              {data.topSubmittersByEquivalizedAverage.map((submitter, index) => (
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

      {currentTab === 'best-seasons' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Highest Normalized Season Scores */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-3">
              <Trophy className="h-6 w-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">Highest Normalized Season Scores</h2>
            </div>
            <p className="text-gray-400 mb-8 text-sm">
              Normalized to 30-point system
            </p>
            
            <div className="space-y-3">
              {data.bestSeasonPerformances.map((performance, index) => (
                <div key={`${performance.submitterName}-${performance.season}-norm`} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3 flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-400 text-gray-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-orange-700 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{performance.submitterName}</p>
                      <p className="text-sm text-gray-400">
                        Season {performance.season} • {performance.submissions} submissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400">{Math.round(performance.normalizedScore)} pts</p>
                    <p className="text-sm text-gray-400">
                      {performance.rawScore} raw • {performance.normalizationFactor.toFixed(1)}x
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SimpleGlassCard>

          {/* Highest Raw Season Scores */}
          <SimpleGlassCard variant="elevated" size="lg">
            <div className="flex items-center mb-3">
              <Star className="h-6 w-6 text-orange-400 mr-3" />
              <h2 className="text-2xl font-bold text-orange-400">Highest Raw Season Scores</h2>
            </div>
            <p className="text-gray-400 mb-8 text-sm">
              Raw points (not normalized)
            </p>
            
            <div className="space-y-3">
              {[...data.bestSeasonPerformances].sort((a, b) => b.rawScore - a.rawScore).map((performance, index) => (
                <div key={`${performance.submitterName}-${performance.season}-raw`} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3 flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-400 text-gray-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-orange-700 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{performance.submitterName}</p>
                      <p className="text-sm text-gray-400">
                        Season {performance.season} • {performance.submissions} submissions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-400">{performance.rawScore} pts</p>
                    <p className="text-sm text-gray-400">
                      {Math.round(performance.normalizedScore)} norm • {performance.normalizationFactor.toFixed(1)}x
                    </p>
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
