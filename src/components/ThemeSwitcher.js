export class ThemeSwitcher {
    constructor() {
        this.themes = [
            { id: 'synthwave', name: 'Synthwave', icon: '🟣' },
            { id: 'neon-cyber', name: 'Neon Cyber', icon: '🟢' },
            { id: 'solar-flare', name: 'Solar Flare', icon: '🟠' },
            { id: 'void', name: 'Void', icon: '⚪' }
        ];

        this.currentTheme = localStorage.getItem('theme') || 'synthwave';
        this.element = this.createElement();
        this.applyTheme(this.currentTheme);
    }

    createElement() {
        const btn = document.createElement('button');
        btn.className = 'nav-btn theme-btn';
        btn.innerHTML = this.getThemeIcon(this.currentTheme);
        btn.title = 'Switch Theme';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.cycleTheme();
            btn.innerHTML = this.getThemeIcon(this.currentTheme);
        });

        return btn;
    }

    getThemeIcon(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        return theme ? theme.icon : '🎨';
    }

    cycleTheme() {
        const currentIndex = this.themes.findIndex(t => t.id === this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.currentTheme = this.themes[nextIndex].id;

        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(themeId) {
        document.documentElement.setAttribute('data-theme', themeId);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId } }));
    }
}
