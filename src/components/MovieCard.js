export class MovieCard {
  constructor(movie) {
    this.movie = movie;
    this.element = this.render();
    this.attachEvents();
  }

  render() {
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.style.setProperty('--bg-image', `url(${this.movie.image})`);

    div.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img class="card-image" src="${this.movie.image}" alt="${this.movie.title}" loading="lazy" />
          <div class="card-overlay"></div>
          <div class="card-info">
            <h3 class="movie-title">${this.movie.title}</h3>
            <div class="movie-meta">
              <span class="movie-year">${this.movie.year}</span>
              <span class="movie-rating">★ ${this.movie.rating}</span>
            </div>
          </div>
        </div>
        <div class="card-glow"></div>
      </div>
    `;
    return div;
  }

  attachEvents() {
    // 3D Tilt Effect
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
      const rotateY = ((x - centerX) / centerX) * 10;

      this.element.style.setProperty('--rotate-x', `${rotateX}deg`);
      this.element.style.setProperty('--rotate-y', `${rotateY}deg`);
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.setProperty('--rotate-x', '0deg');
      this.element.style.setProperty('--rotate-y', '0deg');
    });
  }
}
