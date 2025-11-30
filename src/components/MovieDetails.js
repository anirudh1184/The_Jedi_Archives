import { StorageService } from '../services/storage.js';

export class MovieDetails {
    constructor() {
        this.element = this.createModal();
        document.body.appendChild(this.element);
        this.attachEvents();
        this.currentMovie = null;
    }

    createModal() {
        const div = document.createElement('div');
        div.className = 'movie-modal-overlay';
        div.innerHTML = `
            <div class="movie-modal">
                <button class="modal-close">&times;</button>
                <div class="modal-content">
                    <div class="modal-backdrop"></div>
                    <div class="modal-info-container">
                        <div class="modal-header-actions">
                            <h2 class="modal-title"></h2>
                            <button class="action-btn favorite-btn" title="Add to Favorites">
                                <span class="heart-icon">♥</span>
                            </button>
                        </div>
                        <div class="modal-meta">
                            <span class="modal-year"></span>
                            <span class="modal-rating"></span>
                            <span class="modal-runtime"></span>
                        </div>
                        <div class="modal-genres"></div>
                        <p class="modal-overview"></p>
                        <div class="modal-cast">
                            <strong>Cast:</strong> <span class="cast-list"></span>
                        </div>
                        <div class="modal-director">
                            <strong>Director:</strong> <span class="director-name"></span>
                        </div>
                        
                        <div class="modal-providers-section" style="display: none;">
                            <h3>Where to Watch</h3>
                            <div class="providers-container"></div>
                            <a href="#" target="_blank" class="tmdb-attribution">Data by JustWatch</a>
                        </div>

                        <div class="modal-actions">
                            <button class="action-btn review-btn">Log / Review</button>
                        </div>

                        <div class="review-form-container" style="display: none;">
                            <h3>Write your review</h3>
                            <textarea class="review-input" placeholder="What did you think?"></textarea>
                            <div class="review-form-actions">
                                <select class="rating-select">
                                    <option value="5">★★★★★</option>
                                    <option value="4">★★★★</option>
                                    <option value="3">★★★</option>
                                    <option value="2">★★</option>
                                    <option value="1">★</option>
                                </select>
                                <button class="submit-review-btn">Post Review</button>
                            </div>
                        </div>

                        <div class="modal-reviews-section">
                            <h3>User Reviews</h3>
                            <div class="reviews-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    attachEvents() {
        const closeBtn = this.element.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close());

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });

        // Favorite Button
        const favBtn = this.element.querySelector('.favorite-btn');
        favBtn.addEventListener('click', () => {
            if (this.currentMovie) {
                const isFav = StorageService.toggleFavorite(this.currentMovie.id);
                this.updateFavoriteState(isFav);
            }
        });

        // Review Button
        const reviewBtn = this.element.querySelector('.review-btn');
        const reviewForm = this.element.querySelector('.review-form-container');
        reviewBtn.addEventListener('click', () => {
            reviewForm.style.display = reviewForm.style.display === 'none' ? 'block' : 'none';
        });

        // Submit Review
        const submitBtn = this.element.querySelector('.submit-review-btn');
        submitBtn.addEventListener('click', () => {
            if (this.currentMovie) {
                const content = this.element.querySelector('.review-input').value;
                const rating = this.element.querySelector('.rating-select').value;

                if (content.trim()) {
                    StorageService.saveReview({
                        movieId: this.currentMovie.id,
                        content,
                        rating: parseInt(rating),
                        author: StorageService.getProfile().name
                    });

                    // Refresh reviews
                    this.renderReviews(this.currentMovie);
                    reviewForm.style.display = 'none';
                    this.element.querySelector('.review-input').value = '';
                }
            }
        });
    }

    open(movie) {
        this.isOpen = true;
        this.currentMovie = movie;
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Populate data
        const modal = this.element;
        modal.querySelector('.modal-title').textContent = movie.title;
        modal.querySelector('.modal-year').textContent = movie.year;
        modal.querySelector('.modal-rating').textContent = `★ ${movie.rating}`;
        modal.querySelector('.modal-runtime').textContent = movie.runtime || '';
        modal.querySelector('.modal-genres').textContent = movie.genres || '';
        modal.querySelector('.modal-overview').textContent = movie.overview || 'No overview available.';
        modal.querySelector('.cast-list').textContent = movie.cast || 'N/A';
        modal.querySelector('.director-name').textContent = movie.director || 'N/A';

        // Update Favorite State
        this.updateFavoriteState(StorageService.isFavorite(movie.id));

        // Render Reviews (API + Local)
        this.renderReviews(movie);

        const backdrop = modal.querySelector('.modal-backdrop');
        if (movie.trailerKey) {
            // Video Background
            backdrop.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${movie.trailerKey}&showinfo=0&modestbranding=1" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>
                <div class="backdrop-overlay"></div>
            `;
            backdrop.style.backgroundImage = 'none';
            backdrop.classList.add('has-video');
        } else if (movie.backdrop) {
            // Image Background
            backdrop.innerHTML = '<div class="backdrop-overlay"></div>';
            backdrop.style.backgroundImage = `url(${movie.backdrop})`;
            backdrop.classList.remove('has-video');
        } else {
            backdrop.innerHTML = '<div class="backdrop-overlay"></div>';
            backdrop.style.backgroundImage = 'none';
            backdrop.classList.remove('has-video');
        }

        // Render Providers
        const providerSection = modal.querySelector('.modal-providers-section');
        const providerContainer = modal.querySelector('.providers-container');
        const attribution = modal.querySelector('.tmdb-attribution');

        if (movie.providers && (movie.providers.flatrate.length > 0 || movie.providers.rent.length > 0 || movie.providers.buy.length > 0)) {
            providerSection.style.display = 'block';
            providerContainer.innerHTML = '';
            attribution.href = movie.providers.link;

            const getProviderLink = (providerName, movieTitle) => {
                const name = providerName.toLowerCase();
                const title = encodeURIComponent(movieTitle);

                if (name.includes('netflix')) return `https://www.netflix.com/search?q=${title}`;
                if (name.includes('amazon') || name.includes('prime')) return `https://www.amazon.com/s?k=${title}&i=instant-video`;
                if (name.includes('disney')) return `https://www.disneyplus.com/search?q=${title}`;
                if (name.includes('hotstar')) return `https://www.hotstar.com/in/search?q=${title}`;
                if (name.includes('apple')) return `https://tv.apple.com/search?term=${title}`;
                if (name.includes('google')) return `https://play.google.com/store/search?q=${title}&c=movies`;
                if (name.includes('youtube')) return `https://www.youtube.com/results?search_query=${title} movie`;

                // Fallback to TMDB link if unknown
                return movie.providers.link;
            };

            const createProviderList = (title, list) => {
                if (!list || list.length === 0) return '';
                return `
                    <div class="provider-group">
                        <span class="provider-type">${title}</span>
                        <div class="provider-logos">
                            ${list.map(p => `
                                <a href="${getProviderLink(p.name, movie.title)}" target="_blank" rel="noopener noreferrer">
                                    <img src="${p.logo}" alt="${p.name}" title="${p.name}" class="provider-logo">
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            providerContainer.innerHTML = `
                ${createProviderList('Stream', movie.providers.flatrate)}
                ${createProviderList('Rent', movie.providers.rent)}
                ${createProviderList('Buy', movie.providers.buy)}
            `;
        } else {
            providerSection.style.display = 'none';
        }
    }

    updateFavoriteState(isFav) {
        const btn = this.element.querySelector('.favorite-btn');
        if (isFav) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="heart-icon">♥</span>'; // Solid or colored
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="heart-icon">♡</span>'; // Outline
        }
    }

    renderReviews(movie) {
        const reviewsList = this.element.querySelector('.reviews-list');
        reviewsList.innerHTML = '';

        // Combine API reviews and Local reviews
        // Note: In a real app, we'd merge these more carefully or the API would return user's review.
        const localReviews = StorageService.getReviews().filter(r => r.movieId === movie.id);
        const apiReviews = movie.reviews || [];

        const allReviews = [...localReviews, ...apiReviews];

        if (allReviews.length > 0) {
            allReviews.forEach(review => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                reviewItem.innerHTML = `
                    <div class="review-header">
                        <span class="review-author">${review.author}</span>
                        <span class="review-rating">★ ${review.rating || 'N/A'}</span>
                    </div>
                    <p class="review-content">${review.content}</p>
                `;
                reviewsList.appendChild(reviewItem);
            });
        } else {
            reviewsList.innerHTML = '<p class="no-reviews">No reviews yet.</p>';
        }
    }

    close() {
        this.isOpen = false;
        this.currentMovie = null;
        this.element.classList.remove('active');
        document.body.style.overflow = '';
        this.element.querySelector('.review-form-container').style.display = 'none';
    }
}
