import fs from 'fs';
import path from 'path';

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

const defaultConfig: AppConfig = {
  leagueName: process.env.SITE_NAME || 'Hard Times Music League',
  baseDataDir: process.env.BASE_DATA_DIR || path.join(process.cwd(), 'public', 'data'),
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

function tryLoadJson(filePath: string): unknown | null {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Failed to load config file at ${filePath}:`, err);
  }
  return null;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  // Load external config files in priority order
  // 1) config/config.json
  // 2) public/data/config.json
  const projectRoot = process.cwd();
  const candidates = [
    path.join(projectRoot, 'config', 'config.json'),
    path.join(projectRoot, 'public', 'data', 'config.json'),
  ];

  let fileConfig: Partial<AppConfig> = {};
  for (const file of candidates) {
    const loaded = tryLoadJson(file);
    if (loaded && typeof loaded === 'object') {
      fileConfig = { ...fileConfig, ...(loaded as Partial<AppConfig>) };
    }
  }

  // Merge: defaults <- fileConfig <- ENV overrides already reflected in defaults
  const merged: AppConfig = {
    ...defaultConfig,
    ...fileConfig,
    branding: { ...defaultConfig.branding, ...(fileConfig.branding || {}) },
    limits: { ...defaultConfig.limits, ...(fileConfig.limits || {}) },
    csvSchema: { ...defaultConfig.csvSchema, ...(fileConfig.csvSchema || {}) },
    features: { ...defaultConfig.features, ...(fileConfig.features || {}) },
  };

  cachedConfig = merged;
  return merged;
}


