const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Helper to map TMDB data to our app's format
const mapMovie = (m) => ({
    id: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
    rating: m.vote_average ? m.vote_average.toFixed(1) : 'N/A',
    image: m.poster_path ? `${IMAGE_BASE_URL}${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
    genre: 'Sci-Fi' // TMDB genres require a separate lookup, hardcoding for now or we can fetch genre list later
});

export const fetchPopularMovies = async (page = 1) => {
    if (!API_KEY || API_KEY.includes('PASTE_YOUR_API_KEY')) {
        console.warn('No API Key found');
        return [];
    }

    try {
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
        const data = await res.json();
        return data.results.map(mapMovie);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
};

export const searchMovies = async (query, page = 1) => {
    if (!API_KEY || API_KEY.includes('PASTE_YOUR_API_KEY')) {
        return [];
    }

    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
        const data = await res.json();
        return data.results.map(mapMovie);
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
};

export const fetchMovieDetails = async (id) => {
    if (!API_KEY || API_KEY.includes('PASTE_YOUR_API_KEY')) {
        return null;
    }

    try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,reviews,watch/providers`);
        const data = await res.json();

        // Get providers for India (IN) or fallback to US
        const providers = data['watch/providers']?.results?.IN || data['watch/providers']?.results?.US;

        // Get Trailer
        const videos = data.videos?.results || [];
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
            videos.find(v => v.site === 'YouTube' && v.type === 'Teaser');

        return {
            ...mapMovie(data),
            trailerKey: trailer ? trailer.key : null,
            overview: data.overview,
            backdrop: data.backdrop_path ? `${IMAGE_BASE_URL}${data.backdrop_path}` : null,
            cast: data.credits?.cast?.slice(0, 5).map(c => c.name).join(', '),
            director: data.credits?.crew?.find(c => c.job === 'Director')?.name,
            runtime: data.runtime ? `${data.runtime} min` : 'N/A',
            genres: data.genres?.map(g => g.name).join(', '),
            reviews: data.reviews?.results?.slice(0, 3).map(r => ({
                author: r.author,
                content: r.content,
                rating: r.author_details?.rating
            })) || [],
            providers: providers ? {
                link: providers.link,
                flatrate: providers.flatrate?.map(p => ({
                    name: p.provider_name,
                    logo: `${IMAGE_BASE_URL}${p.logo_path}`
                })) || [],
                rent: providers.rent?.map(p => ({
                    name: p.provider_name,
                    logo: `${IMAGE_BASE_URL}${p.logo_path}`
                })) || [],
                buy: providers.buy?.map(p => ({
                    name: p.provider_name,
                    logo: `${IMAGE_BASE_URL}${p.logo_path}`
                })) || []
            } : null
        };
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
};

export const fetchMoviesByMood = async (mood, page = 1) => {
    if (!API_KEY || API_KEY.includes('PASTE_YOUR_API_KEY')) return [];

    const moodMap = {
        'adrenaline': '28,12', // Action, Adventure
        'laugh': '35',         // Comedy
        'emotional': '18,10749', // Drama, Romance
        'thrill': '53,27',     // Thriller, Horror
        'curious': '878,9648'  // Sci-Fi, Mystery
    };

    const genres = moodMap[mood];
    if (!genres) return [];

    try {
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genres}&sort_by=popularity.desc&page=${page}`);
        const data = await res.json();
        return data.results.map(mapMovie);
    } catch (error) {
        console.error('Error fetching mood movies:', error);
        return [];
    }
};
