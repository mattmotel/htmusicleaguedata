import { getDataManager } from '@/lib/data';
import MissingVotes from '@/components/MissingVotes';

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

// Load competitors data
async function loadCompetitors() {
  const fs = require('fs');
  const path = require('path');
  
  const competitors: Record<string, string> = {};
  
  for (let season = 1; season <= 24; season++) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'data', season.toString(), 'competitors.csv');
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      lines.slice(1).forEach((line: string) => {
        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        if (columns.length >= 2) {
          competitors[columns[0]] = columns[1];
        }
      });
    } catch (error) {
      console.warn(`Could not load competitors for season ${season}:`, error);
    }
  }
  
  return competitors;
}

export default async function MissingVotesPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();
  const votes = await loadVotes();
  const competitors = await loadCompetitors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Missing Votes</h1>
        <p className="text-gray-400">
          Track who missed votes in each round and participation rates
        </p>
      </div>

      <MissingVotes submissions={submissions} votes={votes} competitors={competitors} />
    </div>
  );
}
