function parseCSVLine(text) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let previousChar = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Handle escaped quotes
        if (char === '"' && previousChar !== '\\') {
            inQuotes = !inQuotes;
            // Don't add the quote character itself
            continue;
        }
        
        // Only treat commas as delimiters if we're not inside quotes
        if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
            continue;
        }
        
        // Handle newlines inside quoted fields
        if ((char === '\n' || char === '\r') && !inQuotes) {
            continue;
        }
        
        current += char;
        previousChar = char;
    }
    
    // Don't forget the last field
    if (current) {
        result.push(current.trim());
    }
    
    return result.map(field => 
        // Remove surrounding quotes and unescape internal quotes
        field.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
    );
}

async function loadCSV(filename) {
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

function parseCSVRow(row) {
    try {
        const columns = parseCSVLine(row);
        
        // Skip empty rows or rows that don't have enough columns
        if (!columns || columns.length < 8) {
            return null;
        }

        // Skip rows that don't start with spotify:track
        if (!columns[0]?.trim().startsWith('spotify:track:')) {
            return null;
        }

        // Clean the roundId - handle cases where it might span multiple lines
        let roundId = columns[7]?.trim() || '';
        
        // Log problematic round IDs for debugging
        if (roundId && !roundId.match(/^[0-9a-f]{32}$/)) {
            console.warn(`Potentially invalid round ID: "${roundId}" for track: ${columns[1]}`);
        }

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

function parseRoundRow(row) {
    try {
        const columns = parseCSVLine(row);
        if (columns.length >= 2) {
            return {
                id: columns[0]?.trim() || '',
                timestamp: columns[1]?.trim() || '',
                title: columns[2]?.trim() || '',
                description: columns[3]?.trim() || '',
                playlistUrl: columns[4]?.trim() || ''
            };
        }
        console.warn('Invalid round row format:', row);
        return null;
    } catch (error) {
        console.error('Error parsing round row:', row, error);
        return null;
    }
} 