class MusicLeagueApp {
    constructor() {
        this.dataManager = new MusicLeagueDataManager();
        this.currentView = 'overview';
        this.searchQuery = '';
        this.selectedSeason = '';
    }

    async init() {
        try {
            this.showLoadingState();
            await this.dataManager.loadAllData();
            
            if (this.dataManager.loadError) {
                this.showErrorState(this.dataManager.loadError);
                return;
            }
            
            // Debug: Log data loading status
            console.log('Data loaded:', {
                submissions: this.dataManager.submissions.length,
                rounds: this.dataManager.rounds.size,
                competitors: this.dataManager.competitors.size,
                seasonStats: this.dataManager.seasonStats.size
            });
            
            this.renderApp();
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showErrorState('Failed to load application data');
        }
    }

    showLoadingState() {
        const container = document.getElementById('tables-container');
        container.innerHTML = '';
        
        const loadingSpinner = UIComponents.createLoadingSpinner();
        container.appendChild(loadingSpinner);
    }

    showErrorState(message) {
        const container = document.getElementById('tables-container');
        container.innerHTML = '';
        
        const errorMessage = UIComponents.createErrorMessage(message);
        container.appendChild(errorMessage);
    }

    renderApp() {
        const container = document.getElementById('tables-container');
        container.innerHTML = '';
        
        // Create main navigation
        const navigation = this.createNavigation();
        container.appendChild(navigation);
        
        // Create stats overview
        const stats = this.dataManager.getOverallStats();
        const statsCards = UIComponents.createStatsCards(stats);
        container.appendChild(statsCards);
        
        // Create search and filters
        const searchBar = this.createSearchAndFilters();
        container.appendChild(searchBar);
        
        // Add expand/collapse all button for submissions view
        const expandCollapseContainer = document.createElement('div');
        expandCollapseContainer.className = 'expand-collapse-container';
        expandCollapseContainer.innerHTML = `
            <button class="expand-all-btn" id="expand-all-seasons">
                <i data-lucide="chevrons-down"></i>
                <span>Expand All Seasons</span>
            </button>
            <button class="collapse-all-btn" id="collapse-all-seasons">
                <i data-lucide="chevrons-up"></i>
                <span>Collapse All Seasons</span>
            </button>
        `;
        container.appendChild(expandCollapseContainer);
        
        // Start with overview content
        this.updateMainContent('overview');
    }

    createNavigation() {
        const nav = document.createElement('nav');
        nav.className = 'main-navigation';
        nav.innerHTML = `
            <div class="nav-item active" data-view="overview">
                <i data-lucide="bar-chart-3"></i>
                <span>Overview</span>
            </div>
            <div class="nav-item" data-view="submissions">
                <i data-lucide="list"></i>
                <span>All Submissions</span>
            </div>
            <div class="nav-item" data-view="artists">
                <i data-lucide="mic"></i>
                <span>Artists</span>
            </div>
            <div class="nav-item" data-view="albums">
                <i data-lucide="disc-3"></i>
                <span>Albums</span>
            </div>
            <div class="nav-item" data-view="seasons">
                <i data-lucide="calendar"></i>
                <span>Seasons</span>
            </div>
        `;
        
        // Initialize Lucide icons after adding to DOM
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
        
        nav.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-item')) {
                this.switchView(e.target.dataset.view);
            }
        });
        
        return nav;
    }

    createSearchAndFilters() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-filters-container';
        
        const searchBar = UIComponents.createSearchBar('Search songs, artists, albums...');
        searchContainer.appendChild(searchBar);
        
        // Add event listeners
        const searchInput = searchContainer.querySelector('.search-input');
        const seasonFilter = searchContainer.querySelector('#season-filter');
        const sortFilter = searchContainer.querySelector('#sort-filter');
        
        // Populate season filter
        const seasons = this.dataManager.getSeasonStatistics();
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.season;
            option.textContent = `Season ${season.season}`;
            seasonFilter.appendChild(option);
        });
        
        // Add event listeners
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.performGlobalSearch(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performGlobalSearch(e.target.value);
            }
        });
        
        seasonFilter.addEventListener('change', (e) => {
            this.selectedSeason = e.target.value;
            this.performGlobalSearch(this.searchQuery);
        });
        
        sortFilter.addEventListener('change', (e) => {
            this.performGlobalSearch(this.searchQuery);
        });
        
        return searchContainer;
    }


    createArtistsView() {
        const container = document.createElement('div');
        
        let topArtists = this.dataManager.getTopArtists(100);
        
        // Apply global search filter
        if (this.searchQuery && this.searchQuery.trim()) {
            const searchTerm = this.searchQuery.toLowerCase();
            topArtists = topArtists.filter(artist => 
                artist[0].toLowerCase().includes(searchTerm)
            );
        }
        
        const tableBuilder = new EnhancedTableBuilder({
            headers: ['Rank', 'Artist', 'Submissions'],
            sortable: true,
            searchable: true,
            exportable: true
        });
        
        topArtists.forEach((artist, index) => {
            tableBuilder.addRow([
                index + 1,
                artist[0],
                artist[1].toLocaleString()
            ], {
                artist: artist[0],
                submissions: artist[1]
            });
        });
        
        container.appendChild(tableBuilder.build());
        return container;
    }

    createSubmissionsView() {
        const container = document.createElement('div');
        
        let submissions = this.dataManager.submissions;
        
        // Apply global search filter
        if (this.searchQuery && this.searchQuery.trim()) {
            submissions = this.dataManager.searchSubmissions(this.searchQuery);
        }
        
        // Apply season filter
        if (this.selectedSeason) {
            submissions = submissions.filter(sub => sub.season === parseInt(this.selectedSeason));
        }
        
        // Group by season
        const submissionsBySeason = {};
        submissions.forEach(sub => {
            if (!submissionsBySeason[sub.season]) {
                submissionsBySeason[sub.season] = [];
            }
            submissionsBySeason[sub.season].push(sub);
        });
        
        // Create tables for each season with collapsible headers
        const sortedSeasons = Object.keys(submissionsBySeason).sort((a, b) => b - a); // Latest first
        
        sortedSeasons.forEach(season => {
            const seasonContainer = document.createElement('div');
            seasonContainer.className = 'season-container';
            
            // Create collapsible header
            const seasonHeader = document.createElement('div');
            seasonHeader.className = 'season-header';
            seasonHeader.innerHTML = `
                <div class="season-header-content">
                    <i data-lucide="chevron-down" class="season-toggle-icon"></i>
                    <h3 class="season-title">Season ${season} (${submissionsBySeason[season].length} submissions)</h3>
                </div>
            `;
            
            // Create collapsible content
            const seasonContent = document.createElement('div');
            seasonContent.className = 'season-content';
            
            const tableBuilder = new EnhancedTableBuilder({
                headers: ['Song', 'Artist', 'Album', 'Round', 'Submitter'],
                sortable: true,
                searchable: true,
                exportable: true
            });
            
            submissionsBySeason[season].forEach(sub => {
                const round = this.dataManager.rounds.get(sub.roundId);
                const roundTitle = round ? round.title : 'Unknown Round';
                
                // Get submitter name from competitors data
                const submitterName = this.dataManager.competitors.get(sub.submitterId) || 
                                   sub.submitterName || 
                                   sub.submitterId.substring(0, 8) + '...';
                
                tableBuilder.addRow([
                    sub.title,
                    sub.artist,
                    sub.album,
                    roundTitle,
                    submitterName
                ], {
                    spotifyUrl: sub.spotifyUri,
                    season: sub.season,
                    roundId: sub.roundId
                });
            });
            
            seasonContent.appendChild(tableBuilder.build());
            
            // Add click handler for toggle
            seasonHeader.addEventListener('click', () => {
                const isExpanded = seasonContent.style.display !== 'none';
                seasonContent.style.display = isExpanded ? 'none' : 'block';
                const icon = seasonHeader.querySelector('.season-toggle-icon');
                icon.setAttribute('data-lucide', isExpanded ? 'chevron-right' : 'chevron-down');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
            
            // Set initial state: latest seasons (21-24) expanded, older collapsed
            const seasonNum = parseInt(season);
            const isLatestSeason = seasonNum >= 21;
            
            if (!isLatestSeason) {
                seasonContent.style.display = 'none';
                const icon = seasonHeader.querySelector('.season-toggle-icon');
                icon.setAttribute('data-lucide', 'chevron-right');
            }
            
            seasonContainer.appendChild(seasonHeader);
            seasonContainer.appendChild(seasonContent);
            container.appendChild(seasonContainer);
        });
        
        // Initialize Lucide icons for the new elements
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
        
        // Add expand/collapse all functionality
        this.addExpandCollapseAllFunctionality(container);
        
        return container;
    }

    createSeasonsView() {
        const container = document.createElement('div');
        
        // Check if data is loaded
        if (!this.dataManager.seasonStats || this.dataManager.seasonStats.size === 0) {
            container.innerHTML = '<p class="no-data">Loading season data...</p>';
            return container;
        }
        
        let seasonStats = this.dataManager.getSeasonStatistics();
        
        if (!seasonStats || seasonStats.length === 0) {
            container.innerHTML = '<p class="no-data">No season data available</p>';
            return container;
        }
        
        // Apply global search filter
        if (this.searchQuery && this.searchQuery.trim()) {
            const searchTerm = this.searchQuery.toLowerCase();
            seasonStats = seasonStats.filter(season => 
                season.season.toString().includes(searchTerm)
            );
        }
        
        // Apply season filter if selected
        if (this.selectedSeason) {
            seasonStats = seasonStats.filter(season => 
                season.season === parseInt(this.selectedSeason)
            );
        }
        
        const tableBuilder = new EnhancedTableBuilder({
            headers: ['Season', 'Submissions', 'Unique Artists', 'Unique Albums', 'Rounds'],
            sortable: true,
            searchable: false,
            exportable: true
        });
        
        seasonStats.forEach(season => {
            tableBuilder.addRow([
                season.season,
                season.totalSubmissions.toLocaleString(),
                season.uniqueArtists.toLocaleString(),
                season.uniqueAlbums.toLocaleString(),
                season.uniqueRounds.toLocaleString()
            ], {
                season: season.season
            });
        });
        
        container.appendChild(tableBuilder.build());
        return container;
    }

    createStatisticsView() {
        const container = document.createElement('div');
        
        const stats = this.dataManager.getOverallStats();
        const topArtists = this.dataManager.getTopArtists(10);
        const topAlbums = this.dataManager.getTopAlbums(10);
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-section">
                    <h3>Overall Statistics</h3>
                    <div class="stat-item">
                        <span class="stat-label">Total Submissions:</span>
                        <span class="stat-value">${stats.totalSubmissions.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Unique Artists:</span>
                        <span class="stat-value">${stats.uniqueArtists.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Unique Albums:</span>
                        <span class="stat-value">${stats.uniqueAlbums.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average per Artist:</span>
                        <span class="stat-value">${stats.averageSubmissionsPerArtist}</span>
                    </div>
                </div>
                
                <div class="stat-section">
                    <h3>Top Artists</h3>
                    ${topArtists.map((artist, index) => `
                        <div class="stat-item">
                            <span class="stat-label">${index + 1}. ${artist[0]}:</span>
                            <span class="stat-value">${artist[1]} submissions</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="stat-section">
                    <h3>Top Albums</h3>
                    ${topAlbums.map((album, index) => `
                        <div class="stat-item">
                            <span class="stat-label">${index + 1}. ${album[0]}:</span>
                            <span class="stat-value">${album[1]} submissions</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        return container;
    }

    switchView(view) {
        this.currentView = view;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Update the main content based on view
        this.updateMainContent(view);
    }

    updateMainContent(view) {
        const container = document.getElementById('tables-container');
        const existingContent = container.querySelector('.main-content');
        
        if (existingContent) {
            existingContent.remove();
        }
        
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        
        // Show loading state if data isn't ready
        if (!this.dataManager.submissions || this.dataManager.submissions.length === 0) {
            mainContent.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading data...</p>
                </div>
            `;
            container.appendChild(mainContent);
            return;
        }
        
        switch(view) {
            case 'overview':
                mainContent.appendChild(this.createOverviewContent());
                break;
            case 'submissions':
                mainContent.appendChild(this.createSubmissionsView());
                break;
            case 'artists':
                mainContent.appendChild(this.createArtistsView());
                break;
            case 'albums':
                mainContent.appendChild(this.createAlbumsView());
                break;
            case 'seasons':
                mainContent.appendChild(this.createSeasonsView());
                break;
        }
        
        container.appendChild(mainContent);
        
        // Initialize icons for new content
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    }

    createOverviewContent() {
        const container = document.createElement('div');
        
        // Stats overview
        const stats = this.dataManager.getOverallStats();
        const statsCards = UIComponents.createStatsCards(stats);
        container.appendChild(statsCards);
        
        // Recent submissions preview
        const recentSubmissions = this.dataManager.submissions
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .slice(0, 10);
        
        const recentContainer = document.createElement('div');
        recentContainer.innerHTML = `
            <h3><i data-lucide="clock"></i> Recent Submissions</h3>
            <div class="recent-submissions">
        `;
        
        recentSubmissions.forEach(sub => {
            const round = this.dataManager.rounds.get(sub.roundId);
            const roundTitle = round ? round.title : 'Unknown Round';
            
            recentContainer.innerHTML += `
                <div class="recent-submission">
                    <div class="recent-song">${sub.title} - ${sub.artist}</div>
                    <div class="recent-meta">Season ${sub.season} • ${roundTitle}</div>
                </div>
            `;
        });
        
        recentContainer.innerHTML += `</div>`;
        container.appendChild(recentContainer);
        
        return container;
    }

    createAlbumsView() {
        const container = document.createElement('div');
        
        let topAlbums = this.dataManager.getTopAlbums(50);
        
        // Apply global search filter
        if (this.searchQuery && this.searchQuery.trim()) {
            const searchTerm = this.searchQuery.toLowerCase();
            topAlbums = topAlbums.filter(album => 
                album[0].toLowerCase().includes(searchTerm)
            );
        }
        
        const tableBuilder = new EnhancedTableBuilder({
            headers: ['Rank', 'Album', 'Artist', 'Submissions'],
            sortable: true,
            searchable: true,
            exportable: true
        });
        
        topAlbums.forEach((album, index) => {
            // Extract artist from album name (assuming format "Album - Artist")
            const parts = album[0].split(' - ');
            const albumName = parts[0];
            const artist = parts[1] || 'Various Artists';
            
            tableBuilder.addRow([
                index + 1,
                albumName,
                artist,
                album[1].toLocaleString()
            ], {
                album: album[0],
                submissions: album[1]
            });
        });
        
        container.appendChild(tableBuilder.build());
        return container;
    }


    renderSearchResults() {
        const container = document.getElementById('tables-container');
        const searchResults = container.querySelector('.search-results');
        
        if (searchResults) {
            searchResults.remove();
        }
        
        if (this.searchQuery) {
            const results = this.dataManager.searchSubmissions(this.searchQuery);
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            
            const resultsTitle = document.createElement('h3');
            resultsTitle.textContent = `Search Results for "${this.searchQuery}" (${results.length} found)`;
            resultsContainer.appendChild(resultsTitle);
            
            if (results.length > 0) {
                const tableBuilder = new EnhancedTableBuilder({
                    headers: ['Song', 'Artist', 'Album', 'Season', 'Round'],
                    sortable: true,
                    searchable: false,
                    exportable: true
                });
                
                results.forEach(sub => {
                    const round = this.dataManager.rounds.get(sub.roundId);
                    const roundTitle = round ? round.title : 'Unknown Round';
                    
                    tableBuilder.addRow([
                        sub.title,
                        sub.artist,
                        sub.album,
                        sub.season,
                        roundTitle
                    ], {
                        spotifyUrl: sub.spotifyUri,
                        season: sub.season,
                        roundId: sub.roundId
                    });
                });
                
                resultsContainer.appendChild(tableBuilder.build());
            } else {
                resultsContainer.innerHTML = '<p>No results found.</p>';
            }
            
            container.appendChild(resultsContainer);
        }
    }

    addExpandCollapseAllFunctionality(container) {
        const expandAllBtn = document.getElementById('expand-all-seasons');
        const collapseAllBtn = document.getElementById('collapse-all-seasons');
        
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                const seasonContents = container.querySelectorAll('.season-content');
                const seasonIcons = container.querySelectorAll('.season-toggle-icon');
                
                seasonContents.forEach(content => {
                    content.style.display = 'block';
                });
                
                seasonIcons.forEach(icon => {
                    icon.setAttribute('data-lucide', 'chevron-down');
                });
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        }
        
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                const seasonContents = container.querySelectorAll('.season-content');
                const seasonIcons = container.querySelectorAll('.season-toggle-icon');
                
                seasonContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                seasonIcons.forEach(icon => {
                    icon.setAttribute('data-lucide', 'chevron-right');
                });
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        }
    }

    performGlobalSearch(query) {
        // Update the current view based on search and filters
        if (this.currentView === 'submissions') {
            this.updateMainContent('submissions');
        } else if (this.currentView === 'artists') {
            this.updateMainContent('artists');
        } else if (this.currentView === 'albums') {
            this.updateMainContent('albums');
        } else if (this.currentView === 'seasons') {
            this.updateMainContent('seasons');
        } else if (this.currentView === 'overview') {
            this.updateMainContent('overview');
        }
    }
}

// Initialize the app
const app = new MusicLeagueApp();
app.init();