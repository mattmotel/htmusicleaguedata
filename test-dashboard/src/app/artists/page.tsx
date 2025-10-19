import { getDataManager } from '@/lib/data';
import ArtistsTable from '@/components/ArtistsTable';

export default async function ArtistsPage() {
  const dataManager = await getDataManager();
  const topArtists = dataManager.getTopArtists(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Top Artists</h1>
        <p className="text-gray-400">Most submitted artists across all seasons</p>
      </div>

      <ArtistsTable artists={topArtists} />
    </div>
  );
}
