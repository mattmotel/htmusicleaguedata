import { getDataManager } from '../../lib/data';
import { Music } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import PageHeader from '../../components/ui/PageHeader';

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
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="All Artists"
            description={`${artists.length.toLocaleString()} artists across all seasons`}
          />

          {/* Artists List */}
          <GlassCard variant="elevated" size="lg">
            <div className="space-y-3">
              {artists.map(([artist, count], index) => (
                <div key={artist} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-400 to-emerald-500 text-gray-900 rounded-full text-sm font-bold mr-4 shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex items-center">
                      <Music className="w-5 h-5 text-emerald-400 mr-3" />
                      <p className="font-medium text-white text-lg">{artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-xl">{count}</p>
                    <p className="text-sm text-gray-400">submissions</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

