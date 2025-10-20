This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Adding a New Season

Data is loaded from `public/data/<seasonNumber>/` at build/runtime. To add Season 25 (or any future season):

1. Create a new folder:
   - `public/data/25/`
2. Add four CSV files inside it (same headers/format as prior seasons):
   - `competitors.csv`
   - `rounds.csv`
   - `submissions.csv`
   - `votes.csv`
3. No code changes are required. The app now auto-discovers all numeric subfolders in `public/data/` and loads them.
4. Run locally to verify:
   - `npm run dev` and visit the pages
5. Commit and deploy.

Notes:
- CSV parsing handles multi-line fields and quotes.
- If a CSV is missing, it will be skipped with a warning.

## Per-League Customization

You can run this app for any Music League by configuring a few knobs. There are two sources of configuration: ENV variables (for environment-specific or secret values) and a JSON config file (portable, versionable defaults).

### 1) ENV variables (optional)

Create a `.env.local` with any of the following:

```
SITE_NAME=My Music League
BASE_DATA_DIR=public/data
CACHE_TTL_SECONDS=300
ENABLE_DEBUG_PAGES=false
```

- `SITE_NAME`: League name for metadata and UX
- `BASE_DATA_DIR`: Root folder where CSV season folders live (default `public/data`)
- `CACHE_TTL_SECONDS`: Optional cache TTL for future API caching
- `ENABLE_DEBUG_PAGES`: Toggle debug endpoints/pages

### 2) JSON config (optional)

Place a config file at one of these locations (first found wins):

- `config/config.json`
- `public/data/config.json`

Example `config/config.json`:

```json
{
  "leagueName": "Hard Times Music League",
  "baseDataDir": "public/data",
  "cacheTtlSeconds": 300,
  "seasonDiscovery": "auto",
  "branding": { "emoji": "🥾", "primaryColor": "green-400" },
  "limits": { "topArtists": 20, "topAlbums": 20, "topSongs": 20 },
  "csvSchema": {},
  "features": { "debugPages": false, "artistsPage": true }
}
```

Fields:
- **leagueName**: Display name of the league
- **baseDataDir**: Data root (absolute or relative) where season folders live
- **cacheTtlSeconds**: Optional cache TTL for server-side caches
- **seasonDiscovery**: `"auto"` (scan numeric subfolders) or `{ "seasons": [1,2,3] }` to pin seasons
- **branding**: `{ emoji, primaryColor }` for light-touch branding
- **limits**: Leaderboard limits (top N)
- **csvSchema**: Optional column remaps if export headers differ
- **features**: Feature toggles (e.g., debug pages, artists page)

Merging order:
1. Built-in defaults
2. JSON config (if present)
3. ENV overrides (already applied in defaults)

With this setup, you can drop a new league’s CSVs under `public/data/<season>/` and optionally a `config.json` to customize branding, limits, or season discovery without code changes.
