export class Cursor {
    constructor() {
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'cursor-dot';

        this.cursorOutline = document.createElement('div');
        this.cursorOutline.className = 'cursor-outline';

        document.body.appendChild(this.cursorDot);
        document.body.appendChild(this.cursorOutline);

        this.dotPos = { x: 0, y: 0 };
        this.outlinePos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        // Hide default cursor
        document.body.style.cursor = 'none';

        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.dotPos.x = e.clientX;
            this.dotPos.y = e.clientY;

            // Animate dot immediately
            this.cursorDot.style.transform = `translate(${this.dotPos.x}px, ${this.dotPos.y}px)`;

            // Outline follows with delay (handled in animate loop)

            // Interactive hover state
            const target = e.target;
            const isInteractive = target.matches('button, a, input, .movie-card, .nav-btn, .action-btn');

            if (isInteractive) {
                this.cursorOutline.classList.add('hovering');
            } else {
                this.cursorOutline.classList.remove('hovering');
            }
        });

        // Animation loop for smooth trailing
        this.animate();
    }

    animate() {
        // Smooth follow
        const ease = 0.15;
        this.outlinePos.x += (this.dotPos.x - this.outlinePos.x) * ease;
        this.outlinePos.y += (this.dotPos.y - this.outlinePos.y) * ease;

        this.cursorOutline.style.transform = `translate(${this.outlinePos.x}px, ${this.outlinePos.y}px)`;

        requestAnimationFrame(() => this.animate());
    }
}
