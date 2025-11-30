import { ThemeSwitcher } from './ThemeSwitcher.js';

export class Navigation {
    constructor(onNavigate) {
        this.onNavigate = onNavigate;
        this.element = document.createElement('nav');
        this.element.className = 'main-nav';
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="nav-logo">THE JEDI ARCHIVES</div>
            <div class="nav-links">
                <button class="nav-btn active" data-view="home">Discover</button>
                <button class="nav-btn" data-view="mood">Moods</button>
                <button class="nav-btn" data-view="profile">My Profile</button>
            </div>
        `;

        // Theme Switcher
        const themeSwitcher = new ThemeSwitcher();
        this.element.querySelector('.nav-links').appendChild(themeSwitcher.element);

        this.element.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.classList.contains('theme-btn')) return; // Skip theme button
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.setActive(view);
                this.onNavigate(view);
            });
        });
    }

    setActive(view) {
        this.element.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}
