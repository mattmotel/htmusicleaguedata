import fs from 'fs';
import path from 'path';
import { parseCSV } from './csv-parser';
import { getConfig } from './config';
// import { loadServerConfig } from './server-config';

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

export interface Vote {
  spotifyUri: string;
  voterId: string;
  voterName: string;
  created: string;
  pointsAssigned: number;
  comment: string;
  roundId: string;
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
  private votes: Vote[] = [];
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
    
    // Load votes
    await this.loadVotes();
    
    // Process data
    this.processData();
    
    console.log(`Loaded ${this.submissions.length} submissions and ${this.votes.length} votes across ${this.seasonStats.size} seasons`);
  }

  private getSeasonNumbers(): number[] {
    const config = getConfig();
    const dataRoot = config.baseDataDir;
    const discovery = config.seasonDiscovery;
    if (typeof discovery === 'object' && 'seasons' in discovery) {
      const seasons = (discovery as { seasons: number[] }).seasons
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
      return seasons;
    }
    try {
      const entries = fs.readdirSync(dataRoot, { withFileTypes: true });
      const seasons = entries
        .filter((e) => e.isDirectory())
        .map((e) => Number(e.name))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
      return seasons;
    } catch (err) {
      console.warn('Could not read seasons from public/data. Falling back to 1..24', err);
      return Array.from({ length: 24 }, (_, i) => i + 1);
    }
  }

  private async loadCompetitors() {
    const seasons = this.getSeasonNumbers();
    for (const season of seasons) {
      try {
        const filePath = path.join(getConfig().baseDataDir, season.toString(), 'competitors.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        const rows = parseCSV(content);
        
        rows.slice(1).forEach(row => {
          if (row.length >= 2 && row[0]?.trim() && row[1]?.trim()) {
            this.competitors.set(row[0].trim(), row[1].trim());
          }
        });
      } catch (error) {
        console.warn(`Could not load competitors for season ${season}:`, error);
      }
    }
    console.log(`Loaded ${this.competitors.size} competitors`);
  }

  private async loadRounds() {
    const seasons = this.getSeasonNumbers();
    for (const season of seasons) {
      try {
        const filePath = path.join(getConfig().baseDataDir, season.toString(), 'rounds.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        const rows = parseCSV(content);
        
        // Create round number mapping for this season
        const roundNumberMapping = new Map<string, number>();
        let sequentialNumber = 1;
        
        // Skip header row and process data rows
        rows.slice(1).forEach(row => {
          if (row.length >= 2 && row[0]?.trim()) {
            const roundId = row[0].trim();
            const round: Round = {
              id: roundId,
              timestamp: row[1]?.trim() || '',
              title: row[2]?.trim() || '',
              description: row[3]?.trim() || '',
              playlistUrl: row[4]?.trim() || ''
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
    const seasons = this.getSeasonNumbers();
    for (const season of seasons) {
      try {
        const filePath = path.join(getConfig().baseDataDir, season.toString(), 'submissions.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        const rows = parseCSV(content);
        
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

  private async loadVotes() {
    const seasons = this.getSeasonNumbers();
    // Season 1, Round 1 ID - this round had 10 point max instead of 20
    const SEASON_1_ROUND_1_ID = '2bfbcc13a47c4b0e8f5978b95a2fad65';
    
    for (const season of seasons) {
      try {
        const filePath = path.join(getConfig().baseDataDir, season.toString(), 'votes.csv');
        const content = fs.readFileSync(filePath, 'utf-8');
        const rows = parseCSV(content);
        
        rows.slice(1).forEach(row => {
          if (row.length >= 6 && row[0]?.startsWith('spotify:track:')) {
            const roundId = row[5]?.trim() || '';
            let pointsAssigned = parseInt(row[3]) || 0;
            
            // Apply 2x multiplier to Season 1, Round 1 to normalize with other rounds
            if (season === 1 && roundId === SEASON_1_ROUND_1_ID) {
              pointsAssigned = pointsAssigned * 2;
            }
            
            const vote: Vote = {
              spotifyUri: row[0].trim(),
              voterId: row[1]?.trim() || '',
              voterName: this.competitors.get(row[1]?.trim() || '') || row[1]?.trim() || '',
              created: row[2]?.trim() || '',
              pointsAssigned: pointsAssigned,
              comment: row[4]?.trim() || '',
              roundId: roundId,
              season
            };
            this.votes.push(vote);
          }
        });
      } catch (error) {
        console.warn(`Could not load votes for season ${season}:`, error);
      }
    }
    console.log(`Loaded ${this.votes.length} votes`);
  }

  private extractRoundNumber(roundName: string, roundId: string, season: number): number {
    // Use the pre-computed mapping for this season
    const seasonMapping = this.roundNumberMappings.get(season);
    if (seasonMapping && seasonMapping.has(roundId)) {
      return seasonMapping.get(roundId)!;
    }
    
    // fallback to 1 if not found
    return 1;
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

  getVotes(): Vote[] {
    return this.votes;
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
    const lowerQuery = query.toLowerCase().trim();
    
    // Create a word boundary regex for better matching
    // \b ensures we match whole words, not substrings
    const wordBoundaryRegex = new RegExp(`\\b${lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    
    const results = this.submissions.filter(sub => {
      const title = sub.title.toLowerCase();
      const artist = sub.artist.toLowerCase();
      const album = sub.album.toLowerCase();
      const submitter = sub.submitterName.toLowerCase();
      
      // Check for matches
      return title.includes(lowerQuery) ||
             artist.includes(lowerQuery) ||
             album.includes(lowerQuery) ||
             submitter.includes(lowerQuery);
    });
    
    // Sort results: exact/word boundary matches first, then substring matches
    return results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const aArtist = a.artist.toLowerCase();
      const aAlbum = a.album.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const bArtist = b.artist.toLowerCase();
      const bAlbum = b.album.toLowerCase();
      
      // Exact match score (higher is better)
      const aExact = (aTitle === lowerQuery ? 100 : 0) + 
                     (aArtist === lowerQuery ? 100 : 0) + 
                     (aAlbum === lowerQuery ? 50 : 0);
      const bExact = (bTitle === lowerQuery ? 100 : 0) + 
                     (bArtist === lowerQuery ? 100 : 0) + 
                     (bAlbum === lowerQuery ? 50 : 0);
      
      if (aExact !== bExact) return bExact - aExact;
      
      // Word boundary match score
      const aWordBoundary = (wordBoundaryRegex.test(aArtist) ? 50 : 0) + 
                           (wordBoundaryRegex.test(aTitle) ? 30 : 0) +
                           (wordBoundaryRegex.test(aAlbum) ? 20 : 0);
      const bWordBoundary = (wordBoundaryRegex.test(bArtist) ? 50 : 0) + 
                           (wordBoundaryRegex.test(bTitle) ? 30 : 0) +
                           (wordBoundaryRegex.test(bAlbum) ? 20 : 0);
      
      if (aWordBoundary !== bWordBoundary) return bWordBoundary - aWordBoundary;
      
      // If equal, sort alphabetically by artist then title
      const artistCompare = aArtist.localeCompare(bArtist);
      if (artistCompare !== 0) return artistCompare;
      return aTitle.localeCompare(bTitle);
    });
  }

  getSubmissionsBySeason(season: number): Submission[] {
    return this.submissions.filter(sub => sub.season === season);
  }

  getVotesBySubmission(spotifyUri: string): Vote[] {
    return this.votes.filter(vote => vote.spotifyUri === spotifyUri);
  }

  getVotesByRound(roundId: string): Vote[] {
    return this.votes.filter(vote => vote.roundId === roundId);
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
