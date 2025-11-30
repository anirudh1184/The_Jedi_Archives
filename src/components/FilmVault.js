export class FilmVault {
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

        this.strips = [];
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.speed = 2;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('themeChanged', () => this.updateColors());
        this.updateColors();
        this.animate();
    }

    updateColors() {
        const style = getComputedStyle(document.documentElement);
        this.colors = {
            primary: style.getPropertyValue('--color-primary').trim(),
            secondary: style.getPropertyValue('--color-secondary').trim(),
            bg: style.getPropertyValue('--color-bg').trim()
        };
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initStrips();
    }

    initStrips() {
        this.strips = [];
        const stripWidth = 100;
        const gap = 50;
        const totalStrips = Math.ceil(this.width / (stripWidth + gap)) + 2;

        for (let i = 0; i < totalStrips; i++) {
            this.strips.push({
                x: i * (stripWidth + gap) - 50,
                y: Math.random() * this.height, // Random start offset
                width: stripWidth,
                speedOffset: Math.random() * 0.5 + 0.8 // Slight speed variation
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Calculate global speed based on mouse Y
        // Center of screen = 0 speed, Top/Bottom = max speed
        const centerY = this.height / 2;
        const distY = (this.mouse.y - centerY) / centerY; // -1 to 1
        this.speed = distY * 10 + 2; // Base scroll + mouse influence

        // Calculate perspective tilt based on mouse X
        const centerX = this.width / 2;
        const tilt = (this.mouse.x - centerX) * 0.05;

        this.ctx.save();

        // Apply global perspective-like transform? 
        // Canvas 2D doesn't do real 3D, but we can fake it by skewing or just moving strips

        this.strips.forEach((strip, index) => {
            // Parallax: strips further from center move differently?
            // For now, let's keep it simple: vertical scrolling with glowing frames

            strip.y += this.speed * strip.speedOffset;

            // Loop
            const frameHeight = 140;
            const frameGap = 20;
            const totalFrameHeight = frameHeight + frameGap;

            // Reset strip position to create infinite loop illusion
            if (this.speed > 0 && strip.y > this.height) {
                strip.y = -totalFrameHeight;
            } else if (this.speed < 0 && strip.y < -totalFrameHeight) {
                strip.y = this.height;
            }

            // Draw frames for this strip
            // We need to draw enough frames to cover the height
            const numFrames = Math.ceil(this.height / totalFrameHeight) + 2;
            const startY = strip.y % totalFrameHeight - totalFrameHeight;

            for (let j = 0; j < numFrames; j++) {
                const frameY = startY + (j * totalFrameHeight);

                // Don't draw if off screen
                if (frameY > this.height || frameY + frameHeight < 0) continue;

                // Draw Film Frame
                this.ctx.strokeStyle = this.hexToRgba(this.colors.primary, 0.15);
                this.ctx.lineWidth = 2;

                // Main frame
                this.ctx.strokeRect(strip.x + tilt, frameY, strip.width, frameHeight);

                // Sprocket holes (dots on sides)
                this.ctx.fillStyle = this.hexToRgba(this.colors.secondary, 0.3);
                const holeSize = 4;
                for (let k = 10; k < frameHeight; k += 20) {
                    this.ctx.fillRect(strip.x + tilt + 5, frameY + k, holeSize, holeSize);
                    this.ctx.fillRect(strip.x + tilt + strip.width - 5 - holeSize, frameY + k, holeSize, holeSize);
                }

                // Inner glow (hologram content placeholder)
                // Randomly light up some frames more than others
                if ((index + j) % 5 === 0) {
                    this.ctx.fillStyle = this.hexToRgba(this.colors.primary, 0.05);
                    this.ctx.fillRect(strip.x + tilt + 15, frameY + 10, strip.width - 30, frameHeight - 20);
                }
            }
        });

        this.ctx.restore();
        requestAnimationFrame(() => this.animate());
    }

    hexToRgba(hex, alpha) {
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
