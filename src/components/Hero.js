export class Hero {
    constructor(container, onSearch) {
        this.container = container;
        this.onSearch = onSearch;
        this.element = this.render();
        this.attachEvents();
    }

    render() {
        const section = document.createElement('section');
        section.className = 'hero-section';
        section.innerHTML = `
            <div class="hero-content">
                <h1 class="hero-title">
                    <span class="hero-greeting">Welcome Back, Traveller.</span>
                    <span class="hero-question text-glitch" data-text="What do you want to watch today?">What do you want to <span class="highlight">watch</span> today?</span>
                </h1>
                <div class="hero-search-container"></div>
            </div>
            <div class="hero-scroll-indicator">
                <span>SCROLL TO EXPLORE</span>
                <div class="scroll-line"></div>
            </div>
        `;
        return section;
    }

    attachEvents() {
        // Any specific hero events
    }

    mountSearch(searchElement) {
        const searchContainer = this.element.querySelector('.hero-search-container');
        searchContainer.appendChild(searchElement);
    }
}
