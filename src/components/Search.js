export class Search {
    constructor(onSearch) {
        this.onSearch = onSearch;
        this.element = this.render();
        this.attachEvents();
    }

    render() {
        const div = document.createElement('div');
        div.className = 'search-container';
        div.innerHTML = `
      <div class="search-wrapper">
        <div class="search-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input type="text" class="search-input" placeholder="SEARCH DATABASE_">
        <div class="search-border"></div>
        <div class="search-glitch"></div>
      </div>
    `;
        return div;
    }

    attachEvents() {
        const input = this.element.querySelector('input');
        let timeout;

        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Visual feedback
            this.element.classList.add('searching');

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.onSearch(value);
                this.element.classList.remove('searching');
            }, 500);
        });

        input.addEventListener('focus', () => {
            this.element.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            this.element.classList.remove('focused');
        });
    }
}
