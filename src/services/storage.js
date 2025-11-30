const STORAGE_KEY = 'movie_app_data';

const defaultData = {
    profile: {
        name: 'Guest User',
        bio: 'I love movies!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    },
    favorites: [], // Array of movie IDs
    reviews: [], // Array of { movieId, rating, content, timestamp }
    watched: [] // Array of { movieId, timestamp }
};

export const StorageService = {
    getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        // Merge with defaultData to ensure new fields exist for old data
        return data ? { ...defaultData, ...JSON.parse(data) } : defaultData;
    },

    saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    getProfile() {
        return this.getData().profile;
    },

    saveProfile(profile) {
        const data = this.getData();
        data.profile = { ...data.profile, ...profile };
        this.saveData(data);
    },

    getFavorites() {
        return this.getData().favorites;
    },

    isFavorite(movieId) {
        return this.getData().favorites.includes(movieId);
    },

    toggleFavorite(movieId) {
        const data = this.getData();
        const index = data.favorites.indexOf(movieId);
        if (index === -1) {
            data.favorites.push(movieId);
        } else {
            data.favorites.splice(index, 1);
        }
        this.saveData(data);
        return index === -1; // Returns true if added, false if removed
    },

    getReviews() {
        return this.getData().reviews;
    },

    getReviewForMovie(movieId) {
        return this.getData().reviews.find(r => r.movieId === movieId);
    },

    getWatched() {
        return this.getData().watched || [];
    },

    addToWatched(movieId) {
        const data = this.getData();
        // Remove if exists to push to top (latest)
        const existingIndex = data.watched.findIndex(w => w.movieId === movieId);
        if (existingIndex !== -1) {
            data.watched.splice(existingIndex, 1);
        }
        data.watched.unshift({ movieId, timestamp: Date.now() });
        this.saveData(data);
    },

    saveReview(review) {
        const data = this.getData();
        const existingIndex = data.reviews.findIndex(r => r.movieId === review.movieId);

        if (existingIndex >= 0) {
            data.reviews[existingIndex] = { ...data.reviews[existingIndex], ...review, timestamp: Date.now() };
        } else {
            data.reviews.push({ ...review, timestamp: Date.now() });
        }

        // Also add to watched list
        // Remove if exists to push to top (latest)
        if (!data.watched) data.watched = [];
        const watchedIndex = data.watched.findIndex(w => w.movieId === review.movieId);
        if (watchedIndex !== -1) {
            data.watched.splice(watchedIndex, 1);
        }
        data.watched.unshift({ movieId: review.movieId, timestamp: Date.now() });

        this.saveData(data);
    }
};
