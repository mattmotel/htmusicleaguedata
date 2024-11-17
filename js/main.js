const csvFiles = [
    'data/1/submissions.csv', 'data/2/submissions.csv', 'data/3/submissions.csv', 'data/4/submissions.csv',
    'data/5/submissions.csv', 'data/6/submissions.csv', 'data/7/submissions.csv', 'data/8/submissions.csv',
    'data/9/submissions.csv', 'data/10/submissions.csv', 'data/11/submissions.csv', 'data/12/submissions.csv',
    'data/13/submissions.csv', 'data/14/submissions.csv', 'data/15/submissions.csv', 'data/16/submissions.csv',
    'data/17/submissions.csv', 'data/18/submissions.csv', 'data/19/submissions.csv'
];
const roundsFiles = [
    'data/1/rounds.csv', 'data/2/rounds.csv', 'data/3/rounds.csv', 'data/4/rounds.csv',
    'data/5/rounds.csv', 'data/6/rounds.csv', 'data/7/rounds.csv', 'data/8/rounds.csv',
    'data/9/rounds.csv', 'data/10/rounds.csv', 'data/11/rounds.csv', 'data/12/rounds.csv',
    'data/13/rounds.csv', 'data/14/rounds.csv', 'data/15/rounds.csv', 'data/16/rounds.csv',
    'data/17/rounds.csv', 'data/18/rounds.csv', 'data/19/rounds.csv'
];

async function init() {
    // Load rounds data first
    const roundsData = await Promise.all(roundsFiles.map(loadCSV));
    const roundsMap = new Map();
    
    console.log('Loading rounds data...');
    
    roundsData.forEach((data, index) => {
        if (!data || !data.lines) {
            console.error(`Failed to load ${roundsFiles[index]}`);
            return;
        }
        
        data.lines.slice(1).forEach(line => {
            const parsed = parseRoundRow(line);
            if (parsed && parsed.id) {
                const cleanId = parsed.id.trim();
                roundsMap.set(cleanId, {
                    title: parsed.title || 'Unknown Round',
                    description: parsed.description || ''
                });
                console.log(`Mapped round: ${cleanId} -> "${parsed.title}"`);
            } else {
                console.warn('Failed to parse round:', line);
            }
        });
    });

    // Load and process submission data
    const allData = await Promise.all(csvFiles.map(loadCSV));
    const artistCounts = new Map();
    
    allData.forEach(data => {
        if (!data || !data.lines) return;
        
        data.lines.slice(1).forEach(line => {
            const parsed = parseCSVRow(line);
            if (!parsed || !parsed.artist) return;
            
            const artist = parsed.artist.trim();
            artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
        });
    });

    // When processing submissions, add validation
    allData.forEach(data => {
        if (!data || !data.lines) return;
        
        data.lines.slice(1).forEach(line => {
            const parsed = parseCSVRow(line);
            if (parsed && parsed.roundId) {
                const cleanRoundId = parsed.roundId.trim();
                if (!roundsMap.has(cleanRoundId)) {
                    console.warn(`Unknown round ID: ${cleanRoundId} for song: ${parsed.title}`);
                }
            }
        });
    });

    // Build tables
    buildArtistsTable(artistCounts);
    buildSongTables(allData, roundsMap, document.getElementById('tables-container'));
}

function getSeasonFromPath(path) {
    // Extract season number from path like "data/1/submissions.csv"
    const match = path.match(/data\/(\d+)\/submissions\.csv/);
    return match ? match[1] : '1';
}

function formatTitle(song, roundsMap) {
    const seasonPath = csvFiles.find(file => 
        allData.find(data => 
            data.file === file && 
            data.lines.some(line => line.includes(song.spotifyUri))
        )
    );
    
    const seasonNumber = getSeasonFromPath(seasonPath || csvFiles[0]);
    const round = roundsMap.get(song.roundId);
    
    const title = `${song.title} - ${song.artist}
Songs from Season ${seasonNumber}:
${round ? round.title : 'Unknown Season'}`;

    console.log('Formatted title:', title);
    return title;
}

init();