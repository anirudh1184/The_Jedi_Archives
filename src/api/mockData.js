export const movies = [
    {
        id: 1,
        title: "NEON GENESIS",
        year: 2049,
        rating: 9.2,
        genre: "Cyberpunk",
        image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=500&q=80"
    },
    {
        id: 2,
        title: "VOID WALKER",
        year: 2051,
        rating: 8.8,
        genre: "Sci-Fi Horror",
        image: "https://images.unsplash.com/photo-1614728853913-1e22ba6e8d28?w=500&q=80"
    },
    {
        id: 3,
        title: "CHROME HEART",
        year: 2048,
        rating: 7.9,
        genre: "Romance / AI",
        image: "https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=500&q=80"
    },
    {
        id: 4,
        title: "GRAVITY FALL",
        year: 2055,
        rating: 9.5,
        genre: "Thriller",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80"
    },
    {
        id: 5,
        title: "DATA STREAM",
        year: 2050,
        rating: 8.1,
        genre: "Documentary",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80"
    },
    {
        id: 6,
        title: "SYNTHETIC SOUL",
        year: 2052,
        rating: 8.5,
        genre: "Drama",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80"
    }
];

export const searchMovies = (query) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!query) return resolve(movies);
            const lower = query.toLowerCase();
            const results = movies.filter(m =>
                m.title.toLowerCase().includes(lower) ||
                m.genre.toLowerCase().includes(lower)
            );
            resolve(results);
        }, 500); // Simulate network latency
    });
};
