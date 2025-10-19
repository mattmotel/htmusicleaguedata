class MusicLeagueDataManager {
    constructor() {
        this.submissions = [];
        this.rounds = new Map();
        this.competitors = new Map();
        this.artistCounts = new Map();
        this.albumCounts = new Map();
        this.seasonStats = new Map();
        this.isLoading = false;
        this.loadError = null;
        this.cache = new Map();
    }

    async loadAllData() {
        this.isLoading = true;
        this.loadError = null;
        
        try {
            // Check cache first
            const cachedData = this.getCachedData();
            if (cachedData) {
                this.submissions = cachedData.submissions;
                this.rounds = new Map(cachedData.rounds);
                this.competitors = new Map(cachedData.competitors);
                this.artistCounts = new Map(cachedData.artistCounts);
                this.albumCounts = new Map(cachedData.albumCounts);
                this.seasonStats = new Map(cachedData.seasonStats);
                this.isLoading = false;
                return;
            }

            // Load rounds data first
            await this.loadRoundsData();
            
            // Load competitors data
            await this.loadCompetitorsData();
            
            // Load submissions data
            await this.loadSubmissionsData();
            
            // Process and cache the data
            this.processData();
            this.cacheData();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadError = error.message;
        } finally {
            this.isLoading = false;
        }
    }

    async loadRoundsData() {
        const roundsFiles = this.generateFilePaths('rounds.csv');
        console.log('Loading rounds from files:', roundsFiles);
        const roundsData = await Promise.all(roundsFiles.map(file => this.loadCSV(file)));
        
        roundsData.forEach((data, index) => {
            if (!data || !data.lines) {
                console.warn(`Failed to load ${roundsFiles[index]}`);
                return;
            }
            
            const seasonNumber = this.extractSeasonNumber(data.filename);
            console.log(`Processing rounds for season ${seasonNumber} from ${data.filename}, ${data.lines.length} lines`);
            
            data.lines.slice(1).forEach(line => {
                const parsed = this.parseRoundRow(line);
                if (parsed && parsed.id) {
                    const cleanId = parsed.id.trim();
                    this.rounds.set(cleanId, {
                        title: parsed.title || 'Unknown Round',
                        description: parsed.description || '',
                        timestamp: parsed.timestamp || '',
                        playlistUrl: parsed.playlistUrl || ''
                    });
                }
            });
        });
        
        console.log(`Total rounds loaded: ${this.rounds.size}`);
    }

    async loadCompetitorsData() {
        const competitorsFiles = this.generateFilePaths('competitors.csv');
        const competitorsData = await Promise.all(competitorsFiles.map(file => this.loadCSV(file)));
        
        competitorsData.forEach((data, index) => {
            if (!data || !data.lines) return;
            
            data.lines.slice(1).forEach(line => {
                const parsed = this.parseCompetitorRow(line);
                if (parsed && parsed.id) {
                    this.competitors.set(parsed.id, parsed.name);
                }
            });
        });
        
        console.log('Competitors loaded:', this.competitors.size, 'competitors');
    }

    async loadSubmissionsData() {
        const submissionsFiles = this.generateFilePaths('submissions.csv');
        console.log('Loading submissions from files:', submissionsFiles);
        const submissionsData = await Promise.all(submissionsFiles.map(file => this.loadCSV(file)));
        
        submissionsData.forEach((data, index) => {
            if (!data || !data.lines) {
                console.warn(`Failed to load ${submissionsFiles[index]}`);
                return;
            }
            
            const seasonNumber = this.extractSeasonNumber(data.filename);
            console.log(`Processing season ${seasonNumber} from ${data.filename}, ${data.lines.length} lines`);
            
            data.lines.slice(1).forEach(line => {
                const parsed = this.parseCSVRow(line);
                if (!parsed || !parsed.artist) return;
                
                // Add season info to submission
                parsed.season = seasonNumber;
                parsed.filename = data.filename;
                
                // Map submitter ID to name
                const competitorName = this.competitors.get(parsed.submitterId);
                parsed.submitterName = competitorName || parsed.submitterId;
                
                this.submissions.push(parsed);
            });
        });
        
        console.log(`Total submissions loaded: ${this.submissions.length}`);
        console.log('Seasons found:', [...new Set(this.submissions.map(s => s.season))].sort((a, b) => a - b));
    }

    processData() {
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
            stats.totalSubmissions++;
            stats.uniqueArtists.add(submission.artist);
            if (submission.album) stats.uniqueAlbums.add(submission.album);
            if (submission.roundId) stats.rounds.add(submission.roundId);
        });
        
        console.log('Season stats processed:', this.seasonStats.size, 'seasons');
    }

    generateFilePaths(filename) {
        const files = [];
        for (let i = 1; i <= 24; i++) {
            files.push(`data/${i}/${filename}`);
        }
        return files;
    }

    extractSeasonNumber(filename) {
        const match = filename.match(/data\/(\d+)\//);
        return match ? parseInt(match[1]) : 1;
    }

    async loadCSV(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim());
            return { lines, filename };
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    parseCSVLine(text) {
        const result = [];
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

    parseCSVRow(row) {
        try {
            const columns = this.parseCSVLine(row);
            
            if (!columns || columns.length < 8) return null;
            if (!columns[0]?.trim().startsWith('spotify:track:')) return null;

            let roundId = columns[7]?.trim() || '';
            
            return {
                spotifyUri: columns[0].trim(),
                title: columns[1]?.trim() || '',
                album: columns[2]?.trim() || '',
                artist: columns[3]?.trim() || '',
                submitterId: columns[4]?.trim() || '',
                created: columns[5]?.trim() || '',
                comment: columns[6]?.trim() || '',
                roundId: roundId,
                visible: columns[8]?.trim() || 'No'
            };
        } catch (error) {
            console.error('Error parsing row:', row, error);
            return null;
        }
    }

    parseRoundRow(row) {
        try {
            const columns = this.parseCSVLine(row);
            if (columns.length >= 2) {
                return {
                    id: columns[0]?.trim() || '',
                    timestamp: columns[1]?.trim() || '',
                    title: columns[2]?.trim() || '',
                    description: columns[3]?.trim() || '',
                    playlistUrl: columns[4]?.trim() || ''
                };
            }
            return null;
        } catch (error) {
            console.error('Error parsing round row:', row, error);
            return null;
        }
    }

    parseCompetitorRow(row) {
        try {
            const columns = this.parseCSVLine(row);
            if (columns.length >= 2) {
                return {
                    id: columns[0]?.trim() || '',
                    name: columns[1]?.trim() || ''
                };
            }
            return null;
        } catch (error) {
            console.error('Error parsing competitor row:', row, error);
            return null;
        }
    }

    // Getters for processed data
    getTopArtists(limit = 100) {
        return Array.from(this.artistCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    getTopAlbums(limit = 50) {
        return Array.from(this.albumCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    getSubmissionsBySeason(season) {
        return this.submissions.filter(sub => sub.season === season);
    }

    getSubmissionsByArtist(artist) {
        return this.submissions.filter(sub => 
            sub.artist.toLowerCase().includes(artist.toLowerCase())
        );
    }

    getSubmissionsByRound(roundId) {
        return this.submissions.filter(sub => sub.roundId === roundId);
    }

    searchSubmissions(query) {
        const lowerQuery = query.toLowerCase();
        return this.submissions.filter(sub => 
            sub.title.toLowerCase().includes(lowerQuery) ||
            sub.artist.toLowerCase().includes(lowerQuery) ||
            sub.album.toLowerCase().includes(lowerQuery)
        );
    }

    getSeasonStatistics() {
        const stats = [];
        for (const [season, data] of this.seasonStats.entries()) {
            stats.push({
                season,
                totalSubmissions: data.totalSubmissions,
                uniqueArtists: data.uniqueArtists.size,
                uniqueAlbums: data.uniqueAlbums.size,
                uniqueRounds: data.rounds.size
            });
        }
        return stats.sort((a, b) => a.season - b.season);
    }

    getOverallStats() {
        const totalSubmissions = this.submissions.length;
        const uniqueArtists = this.artistCounts.size;
        const uniqueAlbums = this.albumCounts.size;
        const uniqueRounds = this.rounds.size;
        
        return {
            totalSubmissions,
            uniqueArtists,
            uniqueAlbums,
            uniqueRounds,
            averageSubmissionsPerArtist: (totalSubmissions / uniqueArtists).toFixed(2),
            mostPopularArtist: this.getTopArtists(1)[0],
            mostPopularAlbum: this.getTopAlbums(1)[0]
        };
    }

    // Caching methods
    getCachedData() {
        const cached = localStorage.getItem('musicLeagueData');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                // Check if cache is less than 1 hour old
                if (Date.now() - data.timestamp < 3600000) {
                    return data;
                }
            } catch (e) {
                console.warn('Failed to parse cached data');
            }
        }
        return null;
    }

    cacheData() {
        const data = {
            submissions: this.submissions,
            rounds: Array.from(this.rounds.entries()),
            competitors: Array.from(this.competitors.entries()),
            artistCounts: Array.from(this.artistCounts.entries()),
            albumCounts: Array.from(this.albumCounts.entries()),
            seasonStats: Array.from(this.seasonStats.entries()).map(([k, v]) => [
                k, 
                {
                    ...v,
                    uniqueArtists: Array.from(v.uniqueArtists),
                    uniqueAlbums: Array.from(v.uniqueAlbums),
                    rounds: Array.from(v.rounds)
                }
            ]),
            timestamp: Date.now()
        };
        
        localStorage.setItem('musicLeagueData', JSON.stringify(data));
    }
}
