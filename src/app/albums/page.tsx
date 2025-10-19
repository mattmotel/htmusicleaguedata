import { getDataManager } from '@/lib/data';
import AlbumsTable from '@/components/AlbumsTable';

export default async function AlbumsPage() {
  const dataManager = await getDataManager();
  const topAlbums = dataManager.getTopAlbums(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Top Albums</h1>
        <p className="text-gray-400">Most submitted albums across all seasons</p>
      </div>

      <AlbumsTable albums={topAlbums} />
    </div>
  );
}
