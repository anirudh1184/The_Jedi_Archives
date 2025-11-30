import { MovieCard } from './MovieCard.js';

export class Grid {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'movie-grid';
        this.container.appendChild(this.element);
    }

    render(movies) {
        this.element.innerHTML = '';
        movies.forEach(movie => {
            const card = new MovieCard(movie);
            card.element.movieData = movie; // Attach data for click handler
            this.element.appendChild(card.element);

            // Staggered animation entry
            // card.element.style.animationDelay = `${index * 100}ms`;
        });
    }

    append(movies) {
        movies.forEach(movie => {
            const card = new MovieCard(movie);
            card.element.movieData = movie;
            this.element.appendChild(card.element);
        });
    }

    clear() {
        this.element.innerHTML = '';
    }
}
