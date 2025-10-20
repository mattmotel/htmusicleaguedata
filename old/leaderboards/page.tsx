import { getDataManager } from '@/lib/data';
import OverallLeaderboards from '@/components/OverallLeaderboards';

// Parse CSV properly handling multi-line fields
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let current = '';
  let inQuotes = false;
  let previousChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"' && previousChar !== '\\') {
      inQuotes = !inQuotes;
      current += char;
      previousChar = char;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      currentRow.push(current.trim());
      current = '';
      previousChar = char;
      continue;
    }
    
    if ((char === '\n' || char === '\r') && !inQuotes) {
      currentRow.push(current.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      current = '';
      previousChar = char;
      continue;
    }
    
    current += char;
    previousChar = char;
  }
  
  // Handle last field if no newline at end
  if (current.trim() || currentRow.length > 0) {
    currentRow.push(current.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }
  
  return rows;
}

// Load votes data from CSV files
async function loadVotes() {
  const fs = require('fs');
  const path = require('path');
  
  const votes: any[] = [];
  
  for (let season = 1; season <= 24; season++) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', season.toString(), 'votes.csv');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse CSV properly handling multi-line fields
      const rows = parseCSV(content);
      
      rows.slice(1).forEach((row: string[]) => {
        if (row.length >= 6) {
          votes.push({
            spotifyUri: row[0],
            voterId: row[1],
            voterName: row[1], // We'll need to map this to actual names
            created: row[2],
            pointsAssigned: parseInt(row[3]) || 0,
            comment: row[4],
            roundId: row[5]
          });
        }
      });
    } catch (error) {
      console.warn(`Could not load votes for season ${season}:`, error);
    }
  }
  
  return votes;
}

export default async function LeaderboardsPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();
  const votes = await loadVotes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Overall Leaderboards</h1>
        <p className="text-gray-400">
          Rankings across all seasons for submitters, artists, and seasons
        </p>
      </div>

      <OverallLeaderboards submissions={submissions} votes={votes} />
    </div>
  );
}
