import { fetchMoviesByMood } from '../api/tmdb.js';

export class MoodScanner {
    constructor(gridComponent) {
        this.grid = gridComponent;
        this.moods = [
            { id: 'adrenaline', label: 'Adrenaline', icon: '🚀' },
            { id: 'laugh', label: 'Laugh', icon: '😂' },
            { id: 'emotional', label: 'Emotional', icon: '😭' },
            { id: 'thrill', label: 'Thrill', icon: '😱' },
            { id: 'curious', label: 'Curious', icon: '🧠' }
        ];
        this.element = this.render();
        this.attachEvents();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'mood-scanner-container';

        container.innerHTML = `
            <div class="mood-header">
                <span class="mood-label">NEURAL MOOD SCANNER</span>
                <div class="mood-line"></div>
            </div>
            <div class="mood-buttons">
                ${this.moods.map(mood => `
                    <button class="mood-btn" data-mood="${mood.id}">
                        <span class="mood-icon">${mood.icon}</span>
                        <span class="mood-text">${mood.label}</span>
                    </button>
                `).join('')}
            </div>
        `;

        return container;
    }

    attachEvents() {
        const buttons = this.element.querySelectorAll('.mood-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Visual Feedback
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const mood = btn.dataset.mood;

                // Show loading state on grid
                this.grid.element.innerHTML = '<div class="loading-spinner">Scanning Neural Pathways...</div>';

                // Fetch and update
                const movies = await fetchMoviesByMood(mood);
                this.grid.render(movies);
            });
        });
    }
}
