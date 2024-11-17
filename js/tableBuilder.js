function buildArtistsTable(artistCounts) {
    const sortedArtists = Array.from(artistCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100);

    const artistsTable = document.getElementById('artists-table').getElementsByTagName('tbody')[0];
    sortedArtists.forEach((artist, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${artist[0]}</td>
            <td>${artist[1]}</td>
        `;
        artistsTable.appendChild(tr);
    });
}

function buildSongTables(allData, roundsMap, tablesContainer) {
    allData.forEach(data => {
        if (!data || !data.lines) return;
        
        const table = document.createElement('table');
        const caption = document.createElement('caption');
        
        // Extract season number from data/# path
        const seasonMatch = data.filename.match(/data\/(\d+)\//);
        const seasonNumber = seasonMatch ? seasonMatch[1] : '';
        
        caption.innerHTML = `
            <div class="caption-title">Songs from Season ${seasonNumber}</div>
            <div class="caption-subtitle">${data.filename}</div>
        `;
        table.appendChild(caption);
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Song</th>
                <th>Artist</th>
                <th>Round</th>
            </tr>
        `;
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        data.lines.slice(1).forEach(line => {
            if (!line.trim()) return;
            const parsed = parseCSVRow(line);
            if (!parsed) return;
            
            const roundInfo = roundsMap.get(parsed.roundId.trim());
            const roundTitle = roundInfo ? roundInfo.title : `Missing Round: ${parsed.roundId}`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${parsed.title}</td>
                <td>${parsed.artist}</td>
                <td>${roundTitle}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        tablesContainer.appendChild(table);
    });
} 