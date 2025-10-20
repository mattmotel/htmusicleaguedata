import { getDataManager } from '../lib/data';
import { getConfig } from '../lib/config';
import ReusableDashboard from '../components/ui/ReusableDashboard';
import { createDashboardData, defaultDashboardConfig, musicLeagueMappings } from '../lib/dashboard-config';

export default async function Home() {
  const dataManager = await getDataManager();
  const config = getConfig();
  const stats = dataManager.getOverallStats();
  const seasonStats = dataManager.getSeasonStatistics();
  const votes = dataManager.getVotes();
  const competitors = dataManager.getCompetitors();

  // Prepare data for universal dashboard
  const dashboardData = {
    totalSubmissions: stats.totalSubmissions,
    uniqueArtists: stats.uniqueArtists,
    seasonsCount: seasonStats.length,
    uniqueCompetitorsCount: competitors.size,
    totalVotes: votes.length,
  };

  const dashboardConfig = {
    ...defaultDashboardConfig,
    title: config.leagueName,
    logo: config.branding.emoji,
  };

  const data = createDashboardData(
    dashboardData,
    dashboardConfig,
    musicLeagueMappings.stats,
    musicLeagueMappings.navigation
  );

  return (
    <ReusableDashboard
      data={data}
      config={dashboardConfig}
    />
  );
}