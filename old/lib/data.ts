import fs from 'fs';
import path from 'path';

export interface Submission {
  spotifyUri: string;
  title: string;
  album: string;
  artist: string;
  submitterId: string;
  submitterName: string;
  created: string;
  comment: string;
  roundId: string;
  roundName: string;
  roundNumber: number;
  visible: string;
  season: number;
}

export interface Round {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  playlistUrl: string;
}

export interface Competitor {
  id: string;
  name: string;
}

export interface SeasonStats {
  season: number;
  totalSubmissions: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  uniqueRounds: number;
  usersPerRound: number;
}

export interface OverallStats {
  totalSubmissions: number;
  uniqueArtists: number;
  uniqueAlbums: number;
  uniqueRounds: number;
  averageSubmissionsPerArtist: number;
  mostPopularArtist: [string, number];
  mostPopularAlbum: [string, number];
}

class DataManager {
  private submissions: Submission[] = [];
  private rounds: Map<string, Round> = new Map();
  private competitors: Map<string, string> = new Map();
  private artistCounts: Map<string, number> = new Map();
  private albumCounts: Map<string, number> = new Map();
  private seasonStats: Map<number, {
    totalSubmissions: number;
    uniqueArtists: Set<string>;
    uniqueAlbums: Set<string>;
    rounds: Set<string>;
  }> = new Map();
  private roundNumberMappings: Map<number, Map<string, number>> = new Map();

  async loadAllData() {
    console.log('Loading Music League Data...');
    
    // Load competitors first
    await this.loadCompetitors();
    
    // Load rounds
    await this.loadRounds();
    
    // Load submissions
    await this.loadSubmissions();
    
    // Process data
    this.processData();
    
    console.log(`Loaded ${this.submissions.length} submissions across ${this.seasonStats.size} seasons`);
  }

  private async loadCompetitors() {
    for (let season = 1; season <= 24; season++) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'data', season.toString(), 'competitors.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.slice(1).forEach(line => {
          const [id, name] = this.parseCSVLine(line);
          if (id && name) {
            this.competitors.set(id, name);
          }
        });
      } catch (error) {
        console.warn(`Could not load competitors for season ${season}:`, error);
      }
    }
    console.log(`Loaded ${this.competitors.size} competitors`);
  }

  private async loadRounds() {
    for (let season = 1; season <= 24; season++) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'data', season.toString(), 'rounds.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Parse CSV properly handling multi-line fields
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < content.length; i++) {
          const char = content[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
            continue;
          }
          
          if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
            continue;
          }
          
          if (char === '\n' && !inQuotes) {
            if (currentField || currentRow.length > 0) {
              currentRow.push(currentField.trim());
              if (currentRow.some(field => field.length > 0)) {
                rows.push(currentRow);
              }
              currentRow = [];
              currentField = '';
            }
            continue;
          }
          
          currentField += char;
        }
        
        // Push last row if exists
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field.length > 0)) {
            rows.push(currentRow);
          }
        }
        
        // Create round number mapping for this season
        const roundNumberMapping = new Map<string, number>();
        let sequentialNumber = 1;
        
        // Skip header row and process data rows
        rows.slice(1).forEach(columns => {
          if (columns.length >= 2 && columns[0]?.trim()) {
            const roundId = columns[0]?.trim() || '';
            const round: Round = {
              id: roundId,
              timestamp: columns[1]?.trim() || '',
              title: columns[2]?.trim() || '',
              description: columns[3]?.trim() || '',
              playlistUrl: columns[4]?.trim() || ''
            };
            this.rounds.set(round.id, round);
            
            // Map round ID to sequential number (1, 2, 3, etc.)
            if (roundId) {
              roundNumberMapping.set(roundId, sequentialNumber);
              sequentialNumber++;
            }
          }
        });
        
        // Store the mapping for this season
        this.roundNumberMappings.set(season, roundNumberMapping);
      } catch (error) {
        console.warn(`Could not load rounds for season ${season}:`, error);
      }
    }
    console.log(`Loaded ${this.rounds.size} rounds`);
  }

  private async loadSubmissions() {
    for (let season = 1; season <= 24; season++) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'data', season.toString(), 'submissions.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        // Parse CSV properly handling multi-line fields
        const rows = this.parseCSV(content);
        
        rows.slice(1).forEach(row => {
          if (row.length >= 8 && row[0]?.startsWith('spotify:track:')) {
            const roundId = row[7]?.trim() || '';
            const round = this.rounds.get(roundId);
            const roundName = round?.title || 'Unknown Round';
            const roundNumber = this.extractRoundNumber(roundName, roundId, season);
            
            const submission: Submission = {
              spotifyUri: row[0].trim(),
              title: row[1]?.trim() || '',
              album: row[2]?.trim() || '',
              artist: row[3]?.trim() || '',
              submitterId: row[4]?.trim() || '',
              submitterName: this.competitors.get(row[4]?.trim() || '') || row[4]?.trim() || '',
              created: row[5]?.trim() || '',
              comment: row[6]?.trim() || '',
              roundId: roundId,
              roundName: roundName,
              roundNumber: roundNumber,
              visible: row[8]?.trim() || 'No',
              season
            };
            this.submissions.push(submission);
          }
        });
      } catch (error) {
        console.warn(`Could not load submissions for season ${season}:`, error);
      }
    }
    console.log(`Loaded ${this.submissions.length} submissions`);
  }

  private extractRoundNumber(roundName: string, roundId: string, season: number): number {
    // Use the pre-computed mapping for this season
    const seasonMapping = this.roundNumberMappings.get(season);
    if (seasonMapping && seasonMapping.has(roundId)) {
      const roundNumber = seasonMapping.get(roundId)!;
      return roundNumber;
    }
    
    // fallback to 1 if not found
    return 1;
  }

  private parseCSV(content: string): string[][] {
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
    
    // Add the last row if there's content
    if (current.trim() || currentRow.length > 0) {
      currentRow.push(current.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  }

  private parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let previousChar = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === '"' && previousChar !== '\\') {
        inQuotes = !inQuotes;
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        continue;
      }
      
      if ((char === '\n' || char === '\r') && !inQuotes) {
        continue;
      }
      
      current += char;
      previousChar = char;
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result.map(field => 
      field.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
    );
  }

  private processData() {
    // Process artist counts
    this.submissions.forEach(submission => {
      const artist = submission.artist.trim();
      const album = submission.album.trim();
      
      this.artistCounts.set(artist, (this.artistCounts.get(artist) || 0) + 1);
      
      if (album) {
        this.albumCounts.set(album, (this.albumCounts.get(album) || 0) + 1);
      }
    });

    // Process season statistics
    this.submissions.forEach(submission => {
      const season = submission.season;
      if (!this.seasonStats.has(season)) {
        this.seasonStats.set(season, {
          totalSubmissions: 0,
          uniqueArtists: new Set(),
          uniqueAlbums: new Set(),
          rounds: new Set()
        });
      }
      
      const stats = this.seasonStats.get(season);
      if (stats) {
        stats.totalSubmissions++;
        stats.uniqueArtists.add(submission.artist);
        if (submission.album) stats.uniqueAlbums.add(submission.album);
        if (submission.roundId) stats.rounds.add(submission.roundId);
      }
    });
  }

  // Getters
  getSubmissions(): Submission[] {
    return this.submissions;
  }

  getRounds(): Map<string, Round> {
    return this.rounds;
  }

  getCompetitors(): Map<string, string> {
    return this.competitors;
  }

  getTopArtists(limit: number = 100): [string, number][] {
    return Array.from(this.artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  getTopAlbums(limit: number = 50): [string, number][] {
    return Array.from(this.albumCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  getSeasonStatistics(): SeasonStats[] {
    const stats: SeasonStats[] = [];
    for (const [season, data] of this.seasonStats.entries()) {
      // Calculate average users per round for this season
      const seasonSubmissions = this.submissions.filter(sub => sub.season === season);
      
      // Group submissions by round to count unique users per round
      const roundUserCounts = new Map<string, Set<string>>();
      seasonSubmissions.forEach(sub => {
        if (!roundUserCounts.has(sub.roundId)) {
          roundUserCounts.set(sub.roundId, new Set());
        }
        roundUserCounts.get(sub.roundId)?.add(sub.submitterId);
      });
      
      // Calculate average users per round
      const userCountsPerRound = Array.from(roundUserCounts.values()).map(userSet => userSet.size);
      const usersPerRound = userCountsPerRound.length > 0 ? 
        Number((userCountsPerRound.reduce((sum, count) => sum + count, 0) / userCountsPerRound.length).toFixed(1)) : 0;
      
      stats.push({
        season,
        totalSubmissions: data.totalSubmissions,
        uniqueArtists: data.uniqueArtists.size,
        uniqueAlbums: data.uniqueAlbums.size,
        uniqueRounds: data.rounds.size,
        usersPerRound
      });
    }
    return stats.sort((a, b) => a.season - b.season);
  }

  getOverallStats(): OverallStats {
    const totalSubmissions = this.submissions.length;
    const uniqueArtists = this.artistCounts.size;
    const uniqueAlbums = this.albumCounts.size;
    const uniqueRounds = this.rounds.size;
    
    return {
      totalSubmissions,
      uniqueArtists,
      uniqueAlbums,
      uniqueRounds,
      averageSubmissionsPerArtist: Number((totalSubmissions / uniqueArtists).toFixed(2)),
      mostPopularArtist: this.getTopArtists(1)[0] || ['', 0],
      mostPopularAlbum: this.getTopAlbums(1)[0] || ['', 0]
    };
  }

  searchSubmissions(query: string): Submission[] {
    const lowerQuery = query.toLowerCase();
    return this.submissions.filter(sub => 
      sub.title.toLowerCase().includes(lowerQuery) ||
      sub.artist.toLowerCase().includes(lowerQuery) ||
      sub.album.toLowerCase().includes(lowerQuery) ||
      sub.submitterName.toLowerCase().includes(lowerQuery)
    );
  }

  getSubmissionsBySeason(season: number): Submission[] {
    return this.submissions.filter(sub => sub.season === season);
  }
}

// Singleton instance
let dataManager: DataManager | null = null;

export async function getDataManager(): Promise<DataManager> {
  if (!dataManager) {
    dataManager = new DataManager();
    await dataManager.loadAllData();
  }
  return dataManager;
}
