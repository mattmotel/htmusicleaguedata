import config from '../config.js';

class AI {
    async ask(question) {
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
                            content: "You are an AI assistant helping users understand music data from the Hard Times Music League. You have access to submission data across multiple seasons including songs, artists, and rounds."
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ],
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error:', error);
            return `Sorry, I encountered an error: ${error.message}`;
        }
    }
}

export const ai = new AI();
