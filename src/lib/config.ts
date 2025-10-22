// Server-safe configuration system
export interface BrandingConfig {
  emoji: string;
  primaryColor: string; // Tailwind color token e.g., "green-400"
}

export interface LimitsConfig {
  topArtists: number;
  topAlbums: number;
  topSongs: number;
}

export interface CsvSchemaConfig {
  // Optional column name overrides for portability across export variants
  submissions?: Record<string, string>;
  votes?: Record<string, string>;
  rounds?: Record<string, string>;
  competitors?: Record<string, string>;
}

export interface FeaturesConfig {
  debugPages: boolean;
  artistsPage: boolean;
}

export interface AppConfig {
  leagueName: string;
  baseDataDir: string; // Absolute or project-relative path to data root
  cacheTtlSeconds: number;
  seasonDiscovery: 'auto' | { seasons: number[] };
  branding: BrandingConfig;
  limits: LimitsConfig;
  csvSchema: CsvSchemaConfig;
  features: FeaturesConfig;
}

// Default configuration - no file system access needed
const defaultConfig: AppConfig = {
  leagueName: process.env.SITE_NAME || 'Hard Times Music League',
  baseDataDir: process.env.BASE_DATA_DIR || (typeof process !== 'undefined' && process.cwd ? `${process.cwd()}/public/data` : 'public/data'),
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 300),
  seasonDiscovery: 'auto',
  branding: {
    emoji: '🥾',
    primaryColor: 'green-400',
  },
  limits: {
    topArtists: 20,
    topAlbums: 20,
    topSongs: 20,
  },
  csvSchema: {},
  features: {
    debugPages: String(process.env.ENABLE_DEBUG_PAGES || 'false').toLowerCase() === 'true',
    artistsPage: true,
  },
};

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  // For now, just return the default config
  // File-based config loading can be added later if needed
  cachedConfig = defaultConfig;
  return cachedConfig;
}