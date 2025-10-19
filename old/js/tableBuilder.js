class EnhancedTableBuilder {
    constructor(options = {}) {
        this.headers = options.headers || [];
        this.rows = [];
        this.options = {
            sortable: true,
            searchable: true,
            exportable: true,
            paginated: false,
            itemsPerPage: 50,
            ...options
        };
    }

    addRow(cells, metadata = {}) {
        const row = {
            cells: [...cells],
            metadata: {
                spotifyUrl: metadata.spotifyUrl || null,
                season: metadata.season || null,
                roundId: metadata.roundId || null,
                ...metadata
            }
        };
        this.rows.push(row);
    }

    build() {
        const container = document.createElement('div');
        container.className = 'enhanced-table-container';
        
        // Add search if enabled
        if (this.options.searchable) {
            const searchContainer = this.createSearchBar();
            container.appendChild(searchContainer);
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'enhanced-table';
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        this.headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = this.options.sortable ? 'sortable' : '';
            th.dataset.column = index;
            
            if (this.options.sortable) {
                th.innerHTML = `
                    ${header}
                    <span class="sort-indicator">↕️</span>
                `;
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        this.renderRows(tbody, this.rows);
        table.appendChild(tbody);
        
        container.appendChild(table);
        
        // Add export button if enabled
        if (this.options.exportable) {
            const exportButton = this.createExportButton();
            container.appendChild(exportButton);
        }
        
        // Add sorting functionality
        if (this.options.sortable) {
            this.addSortingFunctionality(table);
        }
        
        // Add search functionality
        if (this.options.searchable) {
            this.addSearchFunctionality(container, table);
        }
        
        return container;
    }

    createSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'table-search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" class="table-search-input" placeholder="Search table..." />
                <i data-lucide="search" class="search-icon"></i>
                <button class="clear-search" style="display: none;">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
        
        // Initialize Lucide icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
        return searchContainer;
    }

    createExportButton() {
        const button = document.createElement('button');
        button.className = 'export-button';
        button.innerHTML = '📊 Export CSV';
        
        button.addEventListener('click', () => {
            const csvData = this.rows.map(row => ({
                ...row.cells.reduce((acc, cell, index) => {
                    acc[this.headers[index]] = cell;
                    return acc;
                }, {}),
                ...row.metadata
            }));
            
            const csv = this.convertToCSV(csvData);
            this.downloadCSV(csv, 'music-league-data.csv');
        });
        
        return button;
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    return `"${value.toString().replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    renderRows(tbody, rows) {
        tbody.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Add cells
            row.cells.forEach(cell => {
                const td = document.createElement('td');
                td.innerHTML = cell;
                tr.appendChild(td);
            });
            
            // Add play button if Spotify URL exists
            if (row.metadata.spotifyUrl) {
                const td = document.createElement('td');
                const playButton = document.createElement('button');
                playButton.className = 'play-button';
                playButton.innerHTML = '▶️';
                playButton.onclick = () => window.open(row.metadata.spotifyUrl, '_blank');
                td.appendChild(playButton);
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        });
    }

    addSortingFunctionality(table) {
        const headers = table.querySelectorAll('th.sortable');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = parseInt(header.dataset.column);
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                const isAscending = !header.classList.contains('sort-asc');
                
                // Clear other sort indicators
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                    h.querySelector('.sort-indicator').textContent = '↕️';
                });
                
                // Set current sort indicator
                header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
                header.querySelector('.sort-indicator').textContent = isAscending ? '↑' : '↓';
                
                // Sort rows
                rows.sort((a, b) => {
                    const aText = a.children[column].textContent.trim();
                    const bText = b.children[column].textContent.trim();
                    
                    const aNum = parseFloat(aText.replace(/,/g, ''));
                    const bNum = parseFloat(bText.replace(/,/g, ''));
                    
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return isAscending ? aNum - bNum : bNum - aNum;
                    }
                    
                    return isAscending ? 
                        aText.localeCompare(bText) : 
                        bText.localeCompare(aText);
                });
                
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    }

    addSearchFunctionality(container, table) {
        const searchInput = container.querySelector('.table-search-input');
        const clearButton = container.querySelector('.clear-search');
        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query) {
                clearButton.style.display = 'block';
                
                allRows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            } else {
                clearButton.style.display = 'none';
                allRows.forEach(row => {
                    row.style.display = '';
                });
            }
        });
        
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            allRows.forEach(row => {
                row.style.display = '';
            });
        });
    }
}

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