import config from '../config.js';

class AI {
    constructor() {
        this.submissions = [];
        this.isLoading = true;
        this.loadData();
    }

    async loadData() {
        this.isLoading = true;
        try {
            console.log('Starting to load data...');
            
            // Test loading one file first
            const testResponse = await fetch('/data/1/submissions.csv');
            const testText = await testResponse.text();
            console.log('Test file content:', testText);  // Let's see what we're getting
            
            if (!testResponse.ok) {
                throw new Error(`HTTP error! status: ${testResponse.status}`);
            }

            // Load all seasons
            for (let season = 1; season <= 19; season++) {
                const response = await fetch(`/data/${season}/submissions.csv`);
                if (!response.ok) {
                    console.error(`Failed to load season ${season}`);
                    continue;
                }
                
                const text = await response.text();
                console.log(`Season ${season} first line:`, text.split('\n')[0]);  // Show headers
                
                // Split by tabs first, then try commas if needed
                const lines = text.split('\n').filter(line => line.trim());
                
                for (let i = 1; i < lines.length; i++) {
                    let parts = lines[i].split('\t');
                    if (parts.length < 3) {
                        parts = lines[i].split(',');
                    }
                    
                    const [song, artist, round] = parts.map(p => p?.trim().replace(/^"|"$/g, ''));
                    
                    if (song && artist && round) {
                        this.submissions.push({
                            season,
                            song: song.trim(),
                            artist: artist.trim(),
                            round: round.trim()
                        });
                    }
                }
            }

            console.log('Loaded submissions:', this.submissions);
            
            if (this.submissions.length === 0) {
                throw new Error('No submissions were loaded successfully');
            }

            this.dataContext = `I am an AI assistant for the Hard Times Music League. 
                              I have loaded ${this.submissions.length} submissions across multiple seasons.
                              Sample data: ${JSON.stringify(this.submissions.slice(0,3))}`;
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.dataContext = `Error loading music data: ${error.message}`;
        } finally {
            this.isLoading = false;
        }
    }

    async ask(question) {
        if (this.submissions.length === 0) {
            return "I haven't been able to load any submission data yet. Please check the console for errors.";
        }

        if (this.isLoading) {
            return "I'm currently loading the music league data. Please wait a moment and try again.";
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: "system",
                            content: this.dataContext
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ],
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error:', error);
            return `Sorry, I encountered an error: ${error.message}`;
        }
    }
}

export const ai = new AI();
