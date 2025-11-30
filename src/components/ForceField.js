export class ForceField {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.ctx = this.canvas.getContext('2d');

        this.container.appendChild(this.canvas);

        this.points = [];
        this.mouse = { x: null, y: null };
        this.config = {
            spacing: 40,
            friction: 0.9,
            ease: 0.1,
            connectionRadius: 100
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Listen for theme changes to update colors dynamically
        window.addEventListener('themeChanged', () => this.updateColors());

        this.updateColors();
        this.animate();
    }

    updateColors() {
        const style = getComputedStyle(document.documentElement);
        this.colors = {
            primary: style.getPropertyValue('--color-primary').trim(),
            secondary: style.getPropertyValue('--color-secondary').trim()
        };
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initGrid();
    }

    initGrid() {
        this.points = [];
        const cols = Math.ceil(this.width / this.config.spacing) + 1;
        const rows = Math.ceil(this.height / this.config.spacing) + 1;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.points.push({
                    x: i * this.config.spacing,
                    y: j * this.config.spacing,
                    originX: i * this.config.spacing,
                    originY: j * this.config.spacing,
                    vx: 0,
                    vy: 0
                });
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Physics Loop
        this.points.forEach(point => {
            // Mouse Interaction
            if (this.mouse.x != null) {
                const dx = this.mouse.x - point.x;
                const dy = this.mouse.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceRadius = 200;

                if (distance < forceRadius) {
                    const force = (forceRadius - distance) / forceRadius;
                    const angle = Math.atan2(dy, dx);
                    const push = force * 5; // Strength of the push

                    point.vx -= Math.cos(angle) * push;
                    point.vy -= Math.sin(angle) * push;
                }
            }

            // Return to origin (Elasticity)
            const dx = point.originX - point.x;
            const dy = point.originY - point.y;

            point.vx += dx * this.config.ease;
            point.vy += dy * this.config.ease;

            // Friction
            point.vx *= this.config.friction;
            point.vy *= this.config.friction;

            // Update position
            point.x += point.vx;
            point.y += point.vy;
        });

        // Render Loop
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 0.5;

        // Draw connections
        // Optimization: Only draw lines to right and bottom neighbors to avoid duplicates
        const cols = Math.ceil(this.width / this.config.spacing) + 1;

        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];

            // Draw point
            // this.ctx.fillStyle = this.colors.primary;
            // this.ctx.fillRect(point.x - 1, point.y - 1, 2, 2);

            // Connect right
            if ((i + 1) % cols !== 0 && this.points[i + 1]) {
                this.drawConnection(point, this.points[i + 1]);
            }

            // Connect bottom
            if (this.points[i + cols]) {
                this.drawConnection(point, this.points[i + cols]);
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    drawConnection(p1, p2) {
        // Calculate distance for opacity (stretch effect)
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Base opacity
        let opacity = 0.15;

        // Increase opacity if stretched or compressed significantly
        const stretch = Math.abs(dist - this.config.spacing);
        if (stretch > 5) {
            opacity = Math.min(0.5, 0.15 + (stretch / 50));
        }

        this.ctx.strokeStyle = this.hexToRgba(this.colors.primary, opacity);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }

    hexToRgba(hex, alpha) {
        // Simple hex to rgba conversion
        if (!hex) return `rgba(0, 243, 255, ${alpha})`;

        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
