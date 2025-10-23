// Reusable Dashboard Configuration System
import { getHomepageItems } from './navigation-config';

export interface DashboardConfig {
  title: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  layout: {
    gridCols: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    spacing: string;
  };
  features: {
    animations: boolean;
    glassMorphism: boolean;
    liquidDesign: boolean;
    darkMode: boolean;
  };
}

export interface StatCardConfig {
  id: string;
  title: string;
  value: number;
  icon: string;
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'pink';
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  interactive?: boolean;
  onClick?: string;
}

export interface NavigationCardConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'pink' | 'yellow';
}

export interface DashboardData {
  stats: StatCardConfig[];
  navigation: NavigationCardConfig[];
  metadata: {
    lastUpdated: string;
    dataSource: string;
    version: string;
  };
}

// Default configuration for Music League
export const defaultDashboardConfig: DashboardConfig = {
  title: 'Hard Times Music League',
  description: 'Data Dashboard & Analytics',
  theme: {
    primary: '#10b981',
    secondary: '#6366f1',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
  },
  layout: {
    gridCols: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 5,
    },
    spacing: '1.5rem',
  },
  features: {
    animations: true,
    glassMorphism: true,
    liquidDesign: true,
    darkMode: true,
  },
};

// Helper function to create dashboard data from any data source
export function createDashboardData(
  data: Record<string, unknown>,
  config: DashboardConfig,
  statMappings: Array<{
    key: string;
    title: string;
    icon: string;
    color: StatCardConfig['color'];
    description?: string;
  }>,
  navMappings: Array<{
    key: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    color: NavigationCardConfig['color'];
  }>
): DashboardData {
  const stats: StatCardConfig[] = statMappings.map((mapping) => ({
    id: mapping.key,
    title: mapping.title,
    value: typeof data[mapping.key] === 'number' ? data[mapping.key] as number : 0,
    icon: mapping.icon,
    color: mapping.color,
    description: mapping.description,
  }));

  const navigation: NavigationCardConfig[] = navMappings.map((mapping) => ({
    id: mapping.key,
    title: mapping.title,
    description: mapping.description,
    href: mapping.href,
    icon: mapping.icon,
    color: mapping.color,
  }));

  return {
    stats,
    navigation,
    metadata: {
      lastUpdated: new Date().toISOString(),
      dataSource: 'music-league-api',
      version: '1.0.0',
    },
  };
}

// Predefined configurations for common use cases
export const musicLeagueMappings = {
  stats: [
    {
      key: 'totalSubmissions',
      title: 'Total Submissions',
      icon: 'Music',
      color: 'emerald' as const,
      description: 'Songs submitted across all seasons',
    },
    {
      key: 'uniqueArtists',
      title: 'Unique Artists',
      icon: 'TrendingUp',
      color: 'blue' as const,
      description: 'Distinct artists featured',
    },
    {
      key: 'seasonsCount',
      title: 'Seasons',
      icon: 'Trophy',
      color: 'purple' as const,
      description: 'Competition seasons completed',
    },
    {
      key: 'uniqueCompetitorsCount',
      title: 'Unique Competitors',
      icon: 'Users',
      color: 'orange' as const,
      description: 'Total participants across all seasons',
    },
    {
      key: 'totalVotes',
      title: 'Total Votes',
      icon: 'Vote',
      color: 'pink' as const,
      description: 'Votes cast across all seasons',
    },
  ],
  navigation: getHomepageItems().map(item => ({
    key: item.id,
    title: item.label,
    description: item.description,
    href: item.href,
    icon: item.icon,
    color: item.color,
  })),
};
