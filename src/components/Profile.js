import { StorageService } from '../services/storage.js';
import { fetchMovieDetails } from '../api/tmdb.js';
import { MovieCard } from './MovieCard.js';

export class Profile {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'profile-page';
    }

    async render() {
        const profile = StorageService.getProfile();
        const favorites = StorageService.getFavorites();
        const reviews = StorageService.getReviews();
        const watched = StorageService.getWatched();

        this.element.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${profile.avatar}" alt="Avatar">
                </div>
                <div class="profile-info">
                    <h1 class="profile-name text-gradient" contenteditable="true">${profile.name}</h1>
                    <p class="profile-bio" contenteditable="true">${profile.bio}</p>
                    <div class="profile-stats">
                        <span><strong>${watched.length}</strong> Watched</span>
                        <span><strong>${favorites.length}</strong> Favorites</span>
                        <span><strong>${reviews.length}</strong> Reviews</span>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h2>Recent Activity</h2>
                <div class="activity-feed">
                    <div class="loading-spinner">Loading activity...</div>
                </div>
            </div>

            <div class="profile-section">
                <h2>Favorite Movies</h2>
                <div class="favorites-grid movie-grid">
                    <div class="loading-spinner">Loading favorites...</div>
                </div>
            </div>
        `;

        this.attachEvents();
        this.loadActivity(watched);
        this.loadFavorites(favorites);
    }

    attachEvents() {
        const nameEl = this.element.querySelector('.profile-name');
        const bioEl = this.element.querySelector('.profile-bio');

        const saveProfile = () => {
            StorageService.saveProfile({
                name: nameEl.innerText,
                bio: bioEl.innerText
            });
        };

        nameEl.addEventListener('blur', saveProfile);
        bioEl.addEventListener('blur', saveProfile);
    }

    async loadActivity(watched) {
        const feed = this.element.querySelector('.activity-feed');
        if (watched.length === 0) {
            feed.innerHTML = '<p class="no-data">No activity yet. Log a movie to start your diary!</p>';
            return;
        }

        feed.innerHTML = '';
        // Take top 5 for display
        const recentWatched = watched.slice(0, 5);
        const promises = recentWatched.map(w => fetchMovieDetails(w.movieId));
        const movies = await Promise.all(promises);

        movies.forEach((movie, index) => {
            if (movie) {
                const review = StorageService.getReviewForMovie(movie.id);
                const entry = document.createElement('div');
                entry.className = 'activity-entry';

                // Create Movie Card (Mini version)
                const card = new MovieCard(movie);
                card.element.movieData = movie;
                card.element.classList.add('mini-card');

                // Review Content
                const reviewHtml = review ? `
                    <div class="activity-review">
                        <div class="review-header">
                            <span class="review-rating">★ ${review.rating}</span>
                            <span class="review-date">${new Date(review.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p class="review-content">${review.content}</p>
                    </div>
                ` : `
                    <div class="activity-review">
                        <span class="review-date">Watched on ${new Date(recentWatched[index].timestamp).toLocaleDateString()}</span>
                    </div>
                `;

                entry.innerHTML = reviewHtml;
                entry.prepend(card.element); // Add card first
                feed.appendChild(entry);
            }
        });
    }

    async loadFavorites(favoriteIds) {
        const grid = this.element.querySelector('.favorites-grid');
        if (favoriteIds.length === 0) {
            grid.innerHTML = '<p class="no-data">No favorite movies yet.</p>';
            return;
        }

        grid.innerHTML = '';
        const promises = favoriteIds.map(id => fetchMovieDetails(id));
        const movies = await Promise.all(promises);

        movies.forEach(movie => {
            if (movie) {
                const card = new MovieCard(movie);
                card.element.movieData = movie; // Attach data for click handler
                grid.appendChild(card.element);
            }
        });
    }
}
