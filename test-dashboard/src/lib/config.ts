import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface DashboardConfig {
  title: string;
  description: string;
  dataSource: string;
  theme: {
    primary: string;
    background: string;
    accent: string;
    text: string;
    cards: string;
    borders: string;
  };
  navigation: Array<{
    label: string;
    href: string;
    icon: string;
  }>;
  views: {
    overview: {
      stats: Array<{
        field: string;
        label: string;
        color: string;
      }>;
      recentItems: Array<{
        field: string;
        limit: number;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
      }>;
    };
    submissions: {
      title: string;
      description: string;
      groupBy: string;
      sortBy: string;
      columns: Array<{
        field: string;
        label: string;
        sortable?: boolean;
        type?: string;
      }>;
    };
    artists: {
      title: string;
      description: string;
      limit: number;
      columns: Array<{
        field: string;
        label: string;
        icon?: string;
      }>;
    };
    albums: {
      title: string;
      description: string;
      limit: number;
      columns: Array<{
        field: string;
        label: string;
        icon?: string;
      }>;
    };
    seasons: {
      title: string;
      description: string;
      columns: Array<{
        field: string;
        label: string;
        color?: string;
      }>;
    };
    search: {
      title: string;
      description: string;
      searchFields: string[];
      resultsColumns: Array<{
        field: string;
        label: string;
        type?: string;
      }>;
    };
  };
}

let config: DashboardConfig | null = null;

export function getDashboardConfig(): DashboardConfig {
  if (config) {
    return config;
  }

  try {
    const configPath = path.join(process.cwd(), 'dashboard.config.yaml');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    config = yaml.load(configFile) as DashboardConfig;
    return config;
  } catch (error) {
    console.warn('Could not load dashboard config, using defaults:', error);
    // Return default config that matches current implementation
    return {
      title: "Hard Times Music League Data",
      description: "A collection of submissions from the Hard Times Music League",
      dataSource: "./public/data/",
      theme: {
        primary: "green-400",
        background: "gray-900",
        accent: "blue-400",
        text: "white",
        cards: "gray-800",
        borders: "gray-700"
      },
      navigation: [
        { label: "Overview", href: "/", icon: "BarChart3" },
        { label: "All Submissions", href: "/submissions", icon: "List" },
        { label: "Artists", href: "/artists", icon: "Mic" },
        { label: "Albums", href: "/albums", icon: "Disc3" },
        { label: "Seasons", href: "/seasons", icon: "Calendar" },
        { label: "Search", href: "/search", icon: "Search" }
      ],
      views: {
        overview: {
          stats: [
            { field: "totalSubmissions", label: "Total Submissions", color: "green-400" },
            { field: "uniqueArtists", label: "Unique Artists", color: "blue-400" },
            { field: "uniqueAlbums", label: "Unique Albums", color: "purple-400" },
            { field: "uniqueRounds", label: "Rounds", color: "orange-400" }
          ],
          recentItems: [
            { field: "submissions", limit: 10, sortBy: "created", sortOrder: "desc" }
          ]
        },
        submissions: {
          title: "All Submissions",
          description: "All submissions across all seasons",
          groupBy: "season",
          sortBy: "roundNumber",
          columns: [
            { field: "title", label: "Song", sortable: true },
            { field: "artist", label: "Artist", sortable: true },
            { field: "album", label: "Album", sortable: true },
            { field: "roundName", label: "Round", sortable: true },
            { field: "submitterName", label: "Submitter", sortable: true },
            { field: "spotifyUri", label: "Play", type: "link" }
          ]
        },
        artists: {
          title: "Top Artists",
          description: "Most submitted artists across all seasons",
          limit: 100,
          columns: [
            { field: "rank", label: "Rank" },
            { field: "name", label: "Artist", icon: "Mic" },
            { field: "count", label: "Submissions" }
          ]
        },
        albums: {
          title: "Top Albums",
          description: "Most submitted albums across all seasons",
          limit: 50,
          columns: [
            { field: "rank", label: "Rank" },
            { field: "name", label: "Album", icon: "Disc3" },
            { field: "count", label: "Submissions" }
          ]
        },
        seasons: {
          title: "Seasons Overview",
          description: "Statistics for all seasons",
          columns: [
            { field: "season", label: "Season" },
            { field: "totalSubmissions", label: "Submissions" },
            { field: "uniqueArtists", label: "Unique Artists" },
            { field: "uniqueAlbums", label: "Unique Albums" },
            { field: "uniqueRounds", label: "Rounds" },
            { field: "usersPerRound", label: "Users per Round", color: "orange-400" }
          ]
        },
        search: {
          title: "Search Submissions",
          description: "Search through all submissions by song, artist, album, or submitter",
          searchFields: ["title", "artist", "album", "submitterName"],
          resultsColumns: [
            { field: "title", label: "Song" },
            { field: "artist", label: "Artist" },
            { field: "album", label: "Album" },
            { field: "season", label: "Season" },
            { field: "submitterName", label: "Submitter" },
            { field: "spotifyUri", label: "Play", type: "link" }
          ]
        }
      }
    };
  }
}
