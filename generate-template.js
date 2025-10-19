#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];

if (!projectName) {
  console.log('Usage: node generate-template.js <project-name>');
  console.log('Example: node generate-template.js my-data-dashboard');
  process.exit(1);
}

console.log(`🚀 Generating template: ${projectName}`);

// Create project directory
const projectDir = path.join(process.cwd(), projectName);
if (fs.existsSync(projectDir)) {
  console.error(`❌ Directory ${projectName} already exists`);
  process.exit(1);
}

fs.mkdirSync(projectDir, { recursive: true });

// Copy our working components
const filesToCopy = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/app/submissions/page.tsx',
  'src/app/artists/page.tsx',
  'src/app/albums/page.tsx',
  'src/app/seasons/page.tsx',
  'src/app/search/page.tsx',
  'src/app/api/search/route.ts',
  'src/components/Navigation.tsx',
  'src/components/StatsCards.tsx',
  'src/components/RecentSubmissions.tsx',
  'src/components/SubmissionsTable.tsx',
  'src/components/ArtistsTable.tsx',
  'src/components/AlbumsTable.tsx',
  'src/components/SeasonsTable.tsx',
  'src/lib/data.ts',
  'src/lib/config.ts',
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  '.gitignore',
  '.cursorrules'
];

// Create directory structure
const dirs = [
  'src/app',
  'src/app/submissions',
  'src/app/artists',
  'src/app/albums',
  'src/app/seasons',
  'src/app/search',
  'src/app/api/search',
  'src/components',
  'src/lib',
  'public/data'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
});

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.join(process.cwd(), file);
  const destPath = path.join(projectDir, file);
  
  if (fs.existsSync(srcPath)) {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    
    // Copy file
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied: ${file}`);
  } else {
    console.log(`⚠️  Skipped: ${file} (not found)`);
  }
});

// Copy template .gitignore
const templateGitignore = path.join(process.cwd(), 'template.gitignore');
const destGitignore = path.join(projectDir, '.gitignore');
if (fs.existsSync(templateGitignore)) {
  fs.copyFileSync(templateGitignore, destGitignore);
  console.log(`✅ Copied: .gitignore (template)`);
}

// Create dashboard.config.yaml
const dashboardConfig = `# Dashboard Configuration
title: "${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"
description: "A data dashboard for ${projectName}"

# Data Source
dataSource: "./public/data/"

# Theme
theme:
  primary: "blue-400"
  background: "gray-900"
  accent: "green-400"
  text: "white"
  cards: "gray-800"
  borders: "gray-700"

# Navigation
navigation:
  - label: "Overview"
    href: "/"
    icon: "BarChart3"
  - label: "All Data"
    href: "/submissions"
    icon: "List"
  - label: "Categories"
    href: "/artists"
    icon: "Mic"
  - label: "Items"
    href: "/albums"
    icon: "Disc3"
  - label: "Groups"
    href: "/seasons"
    icon: "Calendar"
  - label: "Search"
    href: "/search"
    icon: "Search"

# Views Configuration
views:
  overview:
    stats:
      - field: "totalSubmissions"
        label: "Total Items"
        color: "blue-400"
      - field: "uniqueArtists"
        label: "Unique Categories"
        color: "green-400"
      - field: "uniqueAlbums"
        label: "Unique Items"
        color: "purple-400"
      - field: "uniqueRounds"
        label: "Groups"
        color: "orange-400"
    recentItems:
      - field: "submissions"
        limit: 10
        sortBy: "created"
        sortOrder: "desc"

  submissions:
    title: "All Data"
    description: "All data items"
    groupBy: "season"
    sortBy: "roundNumber"
    columns:
      - field: "title"
        label: "Name"
        sortable: true
      - field: "artist"
        label: "Category"
        sortable: true
      - field: "album"
        label: "Subcategory"
        sortable: true
      - field: "roundName"
        label: "Group"
        sortable: true
      - field: "submitterName"
        label: "Source"
        sortable: true
      - field: "spotifyUri"
        label: "Link"
        type: "link"

  artists:
    title: "Top Categories"
    description: "Most common categories"
    limit: 100
    columns:
      - field: "rank"
        label: "Rank"
      - field: "name"
        label: "Category"
        icon: "Mic"
      - field: "count"
        label: "Count"

  albums:
    title: "Top Items"
    description: "Most common items"
    limit: 50
    columns:
      - field: "rank"
        label: "Rank"
      - field: "name"
        label: "Item"
        icon: "Disc3"
      - field: "count"
        label: "Count"

  seasons:
    title: "Groups Overview"
    description: "Statistics for all groups"
    columns:
      - field: "season"
        label: "Group"
      - field: "totalSubmissions"
        label: "Items"
      - field: "uniqueArtists"
        label: "Categories"
      - field: "uniqueAlbums"
        label: "Subcategories"
      - field: "uniqueRounds"
        label: "Subgroups"
      - field: "usersPerRound"
        label: "Sources per Subgroup"
        color: "orange-400"

  search:
    title: "Search Data"
    description: "Search through all data"
    searchFields: ["title", "artist", "album", "submitterName"]
    resultsColumns:
      - field: "title"
        label: "Name"
      - field: "artist"
        label: "Category"
      - field: "album"
        label: "Subcategory"
      - field: "season"
        label: "Group"
      - field: "submitterName"
        label: "Source"
      - field: "spotifyUri"
        label: "Link"
        type: "link"
`;

fs.writeFileSync(path.join(projectDir, 'dashboard.config.yaml'), dashboardConfig);

// Create README
const readme = `# ${projectName}

A data dashboard built with Next.js and Tailwind CSS.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Add your data to the \`public/data/\` directory

3. Configure your dashboard in \`dashboard.config.yaml\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

Edit \`dashboard.config.yaml\` to customize:
- Dashboard title and description
- Data source location
- Theme colors
- Navigation items
- View configurations

## Data Format

Place your data files in \`public/data/\` directory. The template expects:
- CSV files with columns: spotifyUri, title, album, artist, submitterId, created, comment, roundId, visible
- Data organized by season/group in subdirectories
- Competitors.csv, rounds.csv, submissions.csv in each season folder

## Deployment

Deploy to Vercel, Netlify, or any static hosting service:

\`\`\`bash
npm run build
\`\`\`
`;

fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

console.log(`✅ Template generated: ${projectName}`);
console.log(`📁 Location: ${projectDir}`);
console.log(`🚀 Next steps:`);
console.log(`   cd ${projectName}`);
console.log(`   npm install`);
console.log(`   npm run dev`);
console.log(`   Add your data to public/data/`);
console.log(`   Configure dashboard.config.yaml`);
