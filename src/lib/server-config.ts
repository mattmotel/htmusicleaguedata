// Server-side configuration loader with file system access
import fs from 'fs';
import path from 'path';
import { AppConfig } from './config';

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

export function loadServerConfig(): Partial<AppConfig> {
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

  return fileConfig;
}
