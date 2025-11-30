import './style.css'
import { Search } from './components/Search.js'
import { Grid } from './components/Grid.js'
import { FilmVault } from './components/FilmVault.js';
import { Hero } from './components/Hero.js'
import { MovieDetails } from './components/MovieDetails.js'
import { Navigation } from './components/Navigation.js'
import { Profile } from './components/Profile.js'
import { Cursor } from './components/Cursor.js'
import { QuoteDisplay } from './components/QuoteDisplay.js';
import { MoodScanner } from './components/MoodScanner.js';
import { fetchPopularMovies, searchMovies, fetchMovieDetails } from './api/tmdb.js'

const app = document.querySelector('#app');
app.innerHTML = '';

// UI Effects
new Cursor();
new FilmVault(document.body);

// CRT Overlay
const crt = document.createElement('div');
crt.className = 'crt-overlay';
document.body.appendChild(crt);

// State
let state = {
    query: '',
    movies: [],
    page: 1,
    loading: false,
    view: 'home' // 'home', 'mood', or 'profile'
};

// Components
const movieDetails = new MovieDetails();

// --- View Containers ---
const homeView = document.createElement('div');
homeView.className = 'view-home';
const moodView = document.createElement('div');
moodView.className = 'view-mood';
moodView.style.display = 'none';
const profileView = document.createElement('div');
profileView.className = 'view-profile';
profileView.style.display = 'none';

// --- Home View Setup ---
const grid = new Grid(homeView);
const search = new Search(async (query) => {
    state.query = query;
    state.page = 1;
    state.loading = true;
    grid.clear();

    const results = query
        ? await searchMovies(query, state.page)
        : await fetchPopularMovies(state.page);

    state.movies = results;
    state.loading = false;
    grid.render(state.movies);
});

const hero = new Hero(homeView);
homeView.appendChild(hero.element);
hero.mountSearch(search.element);

// Quote Display
const quoteDisplay = new QuoteDisplay();
homeView.appendChild(quoteDisplay.element);

homeView.appendChild(grid.element);

// --- Mood View Setup ---
const moodGrid = new Grid(moodView);
const moodScanner = new MoodScanner(moodGrid);
moodView.appendChild(moodScanner.element);
moodView.appendChild(moodGrid.element);

// Infinite Scroll for Home
const sentinel = document.createElement('div');
sentinel.className = 'sentinel';
homeView.appendChild(sentinel);

const observer = new IntersectionObserver(async (entries) => {
    if (state.view === 'home' && entries[0].isIntersecting && !state.loading) {
        state.loading = true;
        state.page += 1;

        const newMovies = state.query
            ? await searchMovies(state.query, state.page)
            : await fetchPopularMovies(state.page);

        if (newMovies.length > 0) {
            state.movies = [...state.movies, ...newMovies];
            grid.append(newMovies);
            homeView.appendChild(sentinel);
        }

        state.loading = false;
    }
}, { rootMargin: '200px' });
observer.observe(sentinel);

// Grid Click Handler (Delegation) - Shared for both grids
const handleCardClick = async (e) => {
    const card = e.target.closest('.movie-card');
    if (card && card.movieData) {
        try {
            const fullDetails = await fetchMovieDetails(card.movieData.id);
            if (fullDetails) {
                movieDetails.open(fullDetails);
            } else {
                movieDetails.open({
                    ...card.movieData,
                    overview: 'Details could not be fetched.',
                    cast: 'N/A',
                    director: 'N/A',
                    runtime: 'N/A',
                    genres: 'N/A',
                    backdrop: card.movieData.image
                });
            }
        } catch (err) {
            console.error('Error opening details:', err);
        }
    }
};

grid.element.addEventListener('click', handleCardClick);
moodGrid.element.addEventListener('click', handleCardClick);

// --- Profile View Setup ---
const profile = new Profile();
profileView.appendChild(profile.element);

// --- Navigation ---
const nav = new Navigation((view) => {
    state.view = view;
    homeView.style.display = 'none';
    moodView.style.display = 'none';
    profileView.style.display = 'none';

    if (view === 'home') {
        homeView.style.display = 'block';
    } else if (view === 'mood') {
        moodView.style.display = 'block';
    } else if (view === 'profile') {
        profileView.style.display = 'block';
        profile.render(); // Refresh profile data
    }
});

// App Assembly
app.appendChild(nav.element);
app.appendChild(homeView);
app.appendChild(moodView);
app.appendChild(profileView);

// Initial Data Load
(async () => {
    state.loading = true;
    const movies = await fetchPopularMovies(state.page);
    state.movies = movies;
    state.loading = false;
    grid.render(state.movies);
})();
