import { getDataManager } from '../lib/data';
import Link from 'next/link';
import { BarChart3, Users, Music, Trophy, Search, Vote } from 'lucide-react';

export default async function Home() {
  const dataManager = await getDataManager();
  const stats = dataManager.getOverallStats();
  const seasonStats = dataManager.getSeasonStatistics();
  const votes = dataManager.getVotes();
  const competitors = dataManager.getCompetitors();
  const avgVotesPerSubmission = stats.totalSubmissions > 0 ? (votes.length / stats.totalSubmissions).toFixed(2) : '0.00';
  const [topArtistName, topArtistCount] = stats.mostPopularArtist || ['', 0];
  

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Hard Times Music League</h1>
        <p className="text-gray-400">Data Dashboard & Analytics</p>
      </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalSubmissions.toLocaleString()}</p>
              </div>
              <Music className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Artists</p>
                <p className="text-2xl font-bold text-green-400">{stats.uniqueArtists.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Seasons</p>
                <p className="text-2xl font-bold text-green-400">{seasonStats.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Competitors</p>
                <p className="text-2xl font-bold text-green-400">{competitors.size}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Votes</p>
                <p className="text-2xl font-bold text-green-400">{votes.length.toLocaleString()}</p>
              </div>
              <Vote className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Votes / Submission</p>
                <p className="text-2xl font-bold text-green-400">{avgVotesPerSubmission}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top Artist</p>
                <p className="text-2xl font-bold text-green-400">{topArtistName || '—'}</p>
                <p className="text-sm text-gray-400">{topArtistCount} submissions</p>
              </div>
              <Music className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/submissions" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400">Submissions</h3>
              <Music className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-400">Browse all song submissions across seasons</p>
          </Link>

          <Link href="/leaderboards" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400">Leaderboards</h3>
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-400">Overall rankings and statistics</p>
          </Link>

          <Link href="/artists" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400">Artists</h3>
              <Music className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-400">View all artists and submission counts</p>
          </Link>

          <Link href="/missing-votes" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400">Missing Votes</h3>
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-400">Track participation and missing votes</p>
          </Link>

          <Link href="/search" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-green-400">Search</h3>
              <Search className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-400">Search songs, artists, and submissions</p>
          </Link>
        </div>

        {/* Recent submissions intentionally removed per requirements */}
    </div>
  );
}