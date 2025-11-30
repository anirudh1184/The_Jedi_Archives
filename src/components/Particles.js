export class Particles {
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

        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        window.addEventListener('mousedown', (e) => this.shockwave(e));

        this.initParticles();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const particleCount = (this.width * this.height) / 9000;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#00f3ff' : '#ff00ff',
                baseColor: Math.random() > 0.5 ? '#00f3ff' : '#ff00ff',
                baseX: Math.random() * this.width,
                baseY: Math.random() * this.height,
                density: (Math.random() * 30) + 1
            });
        }
    }

    shockwave(e) {
        const x = e.clientX;
        const y = e.clientY;
        const force = 50;

        this.particles.forEach(p => {
            const dx = p.x - x;
            const dy = p.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 300;

            if (distance < maxDist) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const power = (maxDist - distance) / maxDist;

                p.vx += forceDirectionX * power * force * 0.5;
                p.vy += forceDirectionY * power * force * 0.5;
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Mouse Interaction
            if (this.mouse.x != null) {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    // Repulsion
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const maxDistance = this.mouse.radius;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * p.density;
                    const directionY = forceDirectionY * force * p.density;

                    p.x -= directionX;
                    p.y -= directionY;

                    // Color Shift
                    p.color = '#ffffff'; // Turn white near mouse
                } else {
                    p.color = p.baseColor;
                }
            } else {
                p.color = p.baseColor;
            }

            // Friction to slow down shockwave
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Minimum movement
            if (Math.abs(p.vx) < 0.1) p.vx = (Math.random() - 0.5) * 0.5;
            if (Math.abs(p.vy) < 0.1) p.vy = (Math.random() - 0.5) * 0.5;

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }

        this.connect();
        requestAnimationFrame(() => this.animate());
    }

    connect() {
        let opacityValue = 1;
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                let distance = ((this.particles[a].x - this.particles[b].x) * (this.particles[a].x - this.particles[b].x))
                    + ((this.particles[a].y - this.particles[b].y) * (this.particles[a].y - this.particles[b].y));

                if (distance < (this.canvas.width / 7) * (this.canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    if (opacityValue > 0) {
                        this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacityValue * 0.2})`;
                        this.ctx.lineWidth = 1;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                        this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
}
