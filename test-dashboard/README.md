# test-dashboard

A data dashboard built with Next.js and Tailwind CSS.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your data to the `public/data/` directory

3. Configure your dashboard in `dashboard.config.yaml`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

Edit `dashboard.config.yaml` to customize:
- Dashboard title and description
- Data source location
- Theme colors
- Navigation items
- View configurations

## Data Format

Place your data files in `public/data/` directory. The template expects:
- CSV files with columns: spotifyUri, title, album, artist, submitterId, created, comment, roundId, visible
- Data organized by season/group in subdirectories
- Competitors.csv, rounds.csv, submissions.csv in each season folder

## Deployment

Deploy to Vercel, Netlify, or any static hosting service:

```bash
npm run build
```
