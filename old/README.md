# Hard Times Music League Data

A comprehensive data visualization tool for the Hard Times Music League submissions.

## Features

### 🚀 **Enhanced Data Management**
- **Smart Caching**: Data is cached in localStorage for faster subsequent loads
- **Error Handling**: Graceful fallbacks for missing or corrupted data
- **Loading States**: Visual feedback during data loading

### 📊 **Comprehensive Analytics**
- **Top Artists**: Most submitted artists with submission counts
- **Album Statistics**: Most popular albums across all seasons
- **Season Breakdown**: Detailed statistics for each season
- **Overall Stats**: Total submissions, unique artists, and more

### 🔍 **Advanced Search & Filtering**
- **Global Search**: Search across songs, artists, and albums
- **Season Filtering**: Filter submissions by specific seasons
- **Table Search**: Individual search within each table
- **Sortable Columns**: Click headers to sort data

### 📱 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with Spotify-inspired colors
- **Interactive Tables**: Sortable, searchable, and exportable
- **Navigation Tabs**: Organized content with easy switching

### 📈 **Data Export**
- **CSV Export**: Export any table data as CSV files
- **Spotify Integration**: Direct links to Spotify tracks
- **Comprehensive Data**: All metadata included in exports

## Technical Improvements

### **Architecture**
- **DataManager Class**: Centralized data management with caching
- **UIComponents**: Reusable UI components for consistency
- **EnhancedTableBuilder**: Advanced table functionality
- **Modular Structure**: Clean separation of concerns

### **Performance**
- **Lazy Loading**: Data loaded on demand
- **Caching**: localStorage caching for faster loads
- **Efficient Parsing**: Optimized CSV parsing
- **Memory Management**: Proper cleanup and optimization

### **User Experience**
- **Loading Indicators**: Visual feedback during operations
- **Error States**: Clear error messages with retry options
- **Search & Filter**: Real-time search and filtering
- **Export Functionality**: Easy data export capabilities

## File Structure

```
htmusicleaguedata/
├── index.html              # Main HTML file
├── styles.css              # Enhanced CSS with modern styling
├── js/
│   ├── dataManager.js      # Centralized data management
│   ├── uiComponents.js     # Reusable UI components
│   ├── tableBuilder.js    # Enhanced table functionality
│   └── main.js            # Main application logic
└── data/                   # CSV data files (24 seasons)
    ├── 1/ to 24/
    │   ├── submissions.csv
    │   ├── rounds.csv
    │   ├── competitors.csv
    │   └── votes.csv
```

## Quick Start

### 🚀 **Start the Server**
```bash
# Navigate to the project directory
cd htmusicleaguedata

# Start a local HTTP server
python3 -m http.server 8000

# Open your browser and go to:
# http://localhost:8000
```

### 📱 **Usage**
1. **Open `http://localhost:8000`** in a modern web browser
2. **Wait for data loading** - the app will cache data for faster subsequent loads
3. **Navigate** using the top navigation tabs
4. **Search and filter** using the search bar and filters
5. **Export data** using the export buttons on tables
6. **Click Spotify links** to listen to tracks directly

> **Note**: You need to run a local server because the app loads CSV files via fetch API, which requires HTTP/HTTPS protocol.

## Data Sources

The application processes CSV files from 24 seasons of the Hard Times Music League, including:
- **Submissions**: Song submissions with metadata
- **Rounds**: Round information and themes
- **Competitors**: Participant data
- **Votes**: Voting information

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **ES6+ Features**: Uses modern JavaScript features
- **Local Storage**: Requires localStorage support
- **Fetch API**: Uses modern fetch for data loading

## Performance Notes

- **First Load**: May take a few seconds to load all 20 seasons of data
- **Cached Loads**: Subsequent loads are much faster due to caching
- **Memory Usage**: Optimized for large datasets
- **Responsive**: Adapts to different screen sizes

---

*Built with modern web technologies for the Hard Times Music League community.*
