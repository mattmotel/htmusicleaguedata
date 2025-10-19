#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2];

if (!projectName) {
  console.log('Usage: node create-dashboard.js <project-name>');
  console.log('Example: node create-dashboard.js my-data-dashboard');
  process.exit(1);
}

console.log(`🚀 Creating dashboard: ${projectName}`);

// Create project directory
const projectDir = path.join(process.cwd(), projectName);
if (fs.existsSync(projectDir)) {
  console.error(`❌ Directory ${projectName} already exists`);
  process.exit(1);
}

fs.mkdirSync(projectDir, { recursive: true });

// Create basic Next.js structure
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`;

const packageJson = {
  "name": projectName,
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "15.5.6",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "lucide-react": "^0.546.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/js-yaml": "^4.0.9",
    "typescript": "^5",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.5.6"
  }
};

// Create basic structure
const structure = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/components/Navigation.tsx',
  'src/components/StatsCards.tsx',
  'src/components/DataTable.tsx',
  'src/lib/config.ts',
  'src/lib/data.ts',
  'dashboard.config.yaml',
  'next.config.js',
  'package.json',
  'tailwind.config.js',
  'tsconfig.json'
];

// Create directories
fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
fs.mkdirSync(path.join(projectDir, 'src/app'), { recursive: true });
fs.mkdirSync(path.join(projectDir, 'src/components'), { recursive: true });
fs.mkdirSync(path.join(projectDir, 'src/lib'), { recursive: true });
fs.mkdirSync(path.join(projectDir, 'public'), { recursive: true });
fs.mkdirSync(path.join(projectDir, 'public/data'), { recursive: true });

// Write package.json
fs.writeFileSync(
  path.join(projectDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Write next.config.js
fs.writeFileSync(path.join(projectDir, 'next.config.js'), nextConfig);

// Write dashboard.config.yaml
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
  - label: "Data"
    href: "/data"
    icon: "List"
  - label: "Search"
    href: "/search"
    icon: "Search"

# Views Configuration
views:
  overview:
    stats:
      - field: "total"
        label: "Total Items"
        color: "blue-400"
      - field: "unique"
        label: "Unique Items"
        color: "green-400"
    recentItems:
      - field: "data"
        limit: 10
        sortBy: "created"
        sortOrder: "desc"

  data:
    title: "All Data"
    description: "All data items"
    groupBy: "category"
    sortBy: "name"
    columns:
      - field: "name"
        label: "Name"
        sortable: true
      - field: "category"
        label: "Category"
        sortable: true
      - field: "value"
        label: "Value"
        sortable: true

  search:
    title: "Search Data"
    description: "Search through all data"
    searchFields: ["name", "category", "description"]
    resultsColumns:
      - field: "name"
        label: "Name"
      - field: "category"
        label: "Category"
      - field: "value"
        label: "Value"
`;

fs.writeFileSync(path.join(projectDir, 'dashboard.config.yaml'), dashboardConfig);

// Write README
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

Place your data files in \`public/data/\` directory. Supported formats:
- CSV files
- JSON files
- API endpoints

## Deployment

Deploy to Vercel, Netlify, or any static hosting service:

\`\`\`bash
npm run build
\`\`\`
`;

fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

console.log(`✅ Dashboard created: ${projectName}`);
console.log(`📁 Location: ${projectDir}`);
console.log(`🚀 Next steps:`);
console.log(`   cd ${projectName}`);
console.log(`   npm install`);
console.log(`   npm run dev`);
console.log(`   Add your data to public/data/`);
console.log(`   Configure dashboard.config.yaml`);
