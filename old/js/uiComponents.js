class UIComponents {
    static createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">Loading Music League Data...</div>
        `;
        return spinner;
    }

    static createErrorMessage(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-text">${message}</div>
            <button class="retry-button" onclick="location.reload()">Retry</button>
        `;
        return error;
    }

    static createSearchBar(placeholder = 'Search songs, artists, albums...') {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" class="search-input" placeholder="${placeholder}" />
                <i data-lucide="search" class="search-icon"></i>
                <button class="clear-search" style="display: none;">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="search-filters">
                <select class="filter-select" id="season-filter">
                    <option value="">All Seasons</option>
                </select>
                <select class="filter-select" id="sort-filter">
                    <option value="submissions">Sort by Submissions</option>
                    <option value="alphabetical">Sort Alphabetically</option>
                </select>
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

    static createStatsCards(stats) {
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalSubmissions.toLocaleString()}</div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.uniqueArtists.toLocaleString()}</div>
                <div class="stat-label">Unique Artists</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.uniqueAlbums.toLocaleString()}</div>
                <div class="stat-label">Unique Albums</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.uniqueRounds.toLocaleString()}</div>
                <div class="stat-label">Rounds</div>
            </div>
        `;
        
        return statsContainer;
    }

    static createEnhancedTable(headers, data, options = {}) {
        const table = document.createElement('table');
        table.className = `enhanced-table ${options.className || ''}`;
        
        // Create caption if provided
        if (options.caption) {
            const caption = document.createElement('caption');
            caption.innerHTML = options.caption;
            table.appendChild(caption);
        }
        
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.className = options.sortable ? 'sortable' : '';
            th.dataset.column = index;
            
            if (options.sortable) {
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
        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.innerHTML = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Add sorting functionality
        if (options.sortable) {
            this.addSortingFunctionality(table);
        }
        
        return table;
    }

    static addSortingFunctionality(table) {
        const headers = table.querySelectorAll('th.sortable');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = parseInt(header.dataset.column);
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                // Determine sort direction
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
                    
                    // Try to parse as numbers first
                    const aNum = parseFloat(aText.replace(/,/g, ''));
                    const bNum = parseFloat(bText.replace(/,/g, ''));
                    
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return isAscending ? aNum - bNum : bNum - aNum;
                    }
                    
                    // Otherwise sort alphabetically
                    return isAscending ? 
                        aText.localeCompare(bText) : 
                        bText.localeCompare(aText);
                });
                
                // Re-append sorted rows
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    }

    static createTabs(tabData) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'tab-container';
        
        const tabHeaders = document.createElement('div');
        tabHeaders.className = 'tab-headers';
        
        const tabContents = document.createElement('div');
        tabContents.className = 'tab-contents';
        
        tabData.forEach((tab, index) => {
            // Create tab header
            const tabHeader = document.createElement('button');
            tabHeader.className = `tab-header ${index === 0 ? 'active' : ''}`;
            tabHeader.textContent = tab.title;
            tabHeader.dataset.tab = index;
            
            tabHeader.addEventListener('click', () => {
                // Remove active class from all tabs
                tabHeaders.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
                tabContents.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                tabHeader.classList.add('active');
                tabContents.children[index].classList.add('active');
            });
            
            tabHeaders.appendChild(tabHeader);
            
            // Create tab content
            const tabContent = document.createElement('div');
            tabContent.className = `tab-content ${index === 0 ? 'active' : ''}`;
            tabContent.appendChild(tab.content);
            
            tabContents.appendChild(tabContent);
        });
        
        tabContainer.appendChild(tabHeaders);
        tabContainer.appendChild(tabContents);
        
        return tabContainer;
    }

    static createExportButton(data, filename) {
        const button = document.createElement('button');
        button.className = 'export-button';
        button.innerHTML = '📊 Export Data';
        
        button.addEventListener('click', () => {
            const csv = this.convertToCSV(data);
            this.downloadCSV(csv, filename);
        });
        
        return button;
    }

    static convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    // Escape commas and quotes
                    return `"${value.toString().replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    static downloadCSV(csvContent, filename) {
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

    static createLazyTable(container, data, renderFunction, options = {}) {
        const itemsPerPage = options.itemsPerPage || 50;
        let currentPage = 0;
        
        const renderPage = () => {
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            const pageData = data.slice(start, end);
            
            container.innerHTML = '';
            pageData.forEach(item => {
                const element = renderFunction(item);
                container.appendChild(element);
            });
            
            // Add pagination if needed
            if (data.length > itemsPerPage) {
                this.addPagination(container, currentPage, Math.ceil(data.length / itemsPerPage), (page) => {
                    currentPage = page;
                    renderPage();
                });
            }
        };
        
        renderPage();
        return { renderPage, currentPage: () => currentPage };
    }

    static addPagination(container, currentPage, totalPages, onPageChange) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        
        const prevButton = document.createElement('button');
        prevButton.textContent = '← Previous';
        prevButton.disabled = currentPage === 0;
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                onPageChange(currentPage - 1);
            }
        });
        
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next →';
        nextButton.disabled = currentPage === totalPages - 1;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                onPageChange(currentPage + 1);
            }
        });
        
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        
        pagination.appendChild(prevButton);
        pagination.appendChild(pageInfo);
        pagination.appendChild(nextButton);
        
        container.appendChild(pagination);
    }
}
