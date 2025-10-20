import { getDataManager } from '../../lib/data';
import Link from 'next/link';
import { Music, List } from 'lucide-react';

export default async function ArtistsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();

  const artistCounts = new Map<string, number>();
  submissions.forEach(submission => {
    const artist = submission.artist;
    artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
  });

  const artists = Array.from(artistCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">All Artists</h1>
          <p className="text-gray-400">{artists.length.toLocaleString()} artists across all seasons</p>
        </div>
        <Link href="/leaderboards" className="text-sm text-green-400 hover:text-green-300 underline flex items-center">
          <List className="w-4 h-4 mr-2" /> Back to Leaderboards
        </Link>
      </div>

      <div className="space-y-2">
        {artists.map(([artist, count], index) => (
          <div key={artist} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                {index + 1}
              </div>
              <div className="flex items-center">
                <Music className="w-4 h-4 text-green-400 mr-2" />
                <p className="font-medium text-white">{artist}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-400">{count}</p>
              <p className="text-sm text-gray-400">submissions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

