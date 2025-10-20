import { getDataManager } from '../lib/data';
import Link from 'next/link';
import { Users, Music, Trophy, Search, Vote } from 'lucide-react';
import HomeDashboard from '../components/HomeDashboard';

export default async function Home() {
  const dataManager = await getDataManager();
  const stats = dataManager.getOverallStats();
  const seasonStats = dataManager.getSeasonStatistics();
  const votes = dataManager.getVotes();
  const competitors = dataManager.getCompetitors();
  const [topArtistName, topArtistCount] = stats.mostPopularArtist || ['', 0];

  const competitorsList = Array.from(competitors.entries()).map(([id, name]) => ({ id, name }));
  

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Hard Times Music League</h1>
        <p className="text-gray-400">Data Dashboard & Analytics</p>
      </div>

        {/* Stats Overview - client component */}
        <HomeDashboard
          totalSubmissions={stats.totalSubmissions}
          uniqueArtists={stats.uniqueArtists}
          seasonsCount={seasonStats.length}
          uniqueCompetitors={competitors.size}
          totalVotes={votes.length}
          competitorsList={competitorsList}
        />

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