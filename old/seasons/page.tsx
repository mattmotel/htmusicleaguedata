import { getDataManager } from '@/lib/data';
import SeasonsTable from '@/components/SeasonsTable';

export default async function SeasonsPage() {
  const dataManager = await getDataManager();
  const seasonStats = dataManager.getSeasonStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Seasons Overview</h1>
        <p className="text-gray-400">Statistics for all 24 seasons of the Hard Times Music League</p>
      </div>

      <SeasonsTable seasons={seasonStats} />
    </div>
  );
}
