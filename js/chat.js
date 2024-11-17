import { ai } from './ai.js';

// Define AIChatHistory first
class AIChatHistory {
    constructor() {
        this.messages = [];
    }

    addMessage(role, content) {
        this.messages.push({ role, content });
    }

    getMessages() {
        return this.messages;
    }
}

// Then define Chat class that uses it
class Chat {
    constructor() {
        this.history = new AIChatHistory();
        this.chatbox = document.querySelector('#chat-box');
        this.input = document.querySelector('#chat-input');
        this.button = document.querySelector('#send-button');
        
        this.button.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async sendMessage() {
        const question = this.input.value.trim();
        if (!question) return;

        this.addMessage('user', question);
        this.history.addMessage('user', question);
        this.input.value = '';

        try {
            const response = await ai.ask(question);
            this.addMessage('ai', response);
            this.history.addMessage('assistant', response);
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('error', 'Sorry, I encountered an error.');
        }
    }

    addMessage(type, text) {
        const message = document.createElement('div');
        message.className = `chat-message ${type}`;
        message.textContent = text;
        this.chatbox.appendChild(message);
        this.chatbox.scrollTop = this.chatbox.scrollHeight;
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    const chat = new Chat();
}); 