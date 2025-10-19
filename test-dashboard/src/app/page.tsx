import { getDataManager } from '@/lib/data';
import StatsCards from '@/components/StatsCards';
import RecentSubmissions from '@/components/RecentSubmissions';

export default async function Home() {
  const dataManager = await getDataManager();
  const stats = dataManager.getOverallStats();
  const recentSubmissions = dataManager.getSubmissions()
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">🥾 Hard Times Music League Data</h1>
        <p className="text-gray-400">A collection of submissions from the Hard Times Music League</p>
      </div>

      <StatsCards stats={stats} />
      
      <RecentSubmissions submissions={recentSubmissions} />
    </div>
  );
}