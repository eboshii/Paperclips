/**
 * visualizer.js - Vibrant Cartoon Pixel Art Cosmic Visualizer
 * Renders retro pixel-art visuals with an internal pixelation buffer pass:
 * 1. Factory Floor (Bouncy conveyors, stampers, laser arcs, cartoon sparks)
 * 2. Planetary Earth (Pixel globe, cyan fissures, orbital railgun ring)
 * 3. Solar Dyson Swarm (Pixel sun, gold collector rings, plasma siphons)
 * 4. Galactic Penrose Loom (Black hole, purple accretion disk, relativistic jets)
 * 5. 11D Multiverse Foam (Rotating 4D hyper-cubes, candy universe bubbles)
 */

class CosmicVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        // Internal Low-Res Pixelation Buffer Pass
        this.pixelCanvas = document.createElement('canvas');
        this.pixelCtx = this.pixelCanvas.getContext('2d');

        this.tier = 0; // 0: Factory, 1: Earth, 2: Dyson, 3: Galaxy, 4: Multiverse
        this.autoTier = true;

        // Camera Orbit State
        this.camYaw = 0.0;
        this.camPitch = 0.4;
        this.camZoom = 1.0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Visual Effects State
        this.cosmicRotation = 0;
        this.sparks = [];
        this.heroRecoil = 1.0;
        this.heroRotation = 0;

        // Background Pixel Stars
        this.stars = [];
        this.initStars(60);

        this.initEvents();
    }

    initStars(count) {
        this.stars = [];
        for (let i = 0; i < count; ++i) {
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() > 0.8 ? 2 : 1,
                color: Math.random() > 0.5 ? '#00f0ff' : (Math.random() > 0.5 ? '#ffe600' : '#ff2a85'),
                twinkleSpeed: 1 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    initEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            this.camYaw += dx * 0.008;
            this.camPitch = Math.max(0.1, Math.min(1.4, this.camPitch + dy * 0.008));
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    triggerHeroClick() {
        this.heroRecoil = 0.7;
        this.heroRotation += 0.35;
        if (this.pixelCanvas.width > 0) {
            this.emitClickSparks(this.pixelCanvas.width / 2, this.pixelCanvas.height / 2, 16);
        }
    }

    emitClickSparks(x, y, count = 16) {
        for (let i = 0; i < count; ++i) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.0,
                life: 1.0,
                decay: 0.03 + Math.random() * 0.04,
                size: Math.random() > 0.5 ? 2 : 3,
                color: Math.random() > 0.4 ? '#ffe600' : (Math.random() > 0.5 ? '#00f0ff' : '#ff2a85')
            });
        }
    }

    determineAutoTier(lifetimeClips) {
        if (lifetimeClips.gte(new BigDouble(1.0, 78))) return 4; // Multiverse
        if (lifetimeClips.gte(new BigDouble(1.0, 45))) return 3; // Galactic Penrose
        if (lifetimeClips.gte(new BigDouble(1.0, 18))) return 2; // Solar Dyson
        if (lifetimeClips.gte(new BigDouble(1.0, 9)))  return 1; // Planetary Earth
        return 0; // Factory Floor
    }

    setTier(tierIndex) {
        if (tierIndex === -1) {
            this.autoTier = true;
        } else {
            this.autoTier = false;
            this.tier = tierIndex;
        }
    }

    update(dt, state) {
        if (this.autoTier && state) {
            this.tier = this.determineAutoTier(state.lifetimeClips);
        }

        this.cosmicRotation += dt * 0.8;
        this.heroRecoil += (1.0 - this.heroRecoil) * (dt * 10.0);

        // Update sparks
        for (let i = this.sparks.length - 1; i >= 0; --i) {
            const p = this.sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12; // gravity
            p.life -= p.decay;
            if (p.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    render(state) {
        if (!this.ctx || !this.canvas) return;
        const displayW = this.canvas.width = this.canvas.clientWidth;
        const displayH = this.canvas.height = this.canvas.clientHeight;
        if (displayW <= 0 || displayH <= 0) return;

        // Pixel resolution scale factor: ~2.5x pixelation
        const pixelScale = 2.5;
        const pw = Math.max(120, Math.floor(displayW / pixelScale));
        const ph = Math.max(80, Math.floor(displayH / pixelScale));

        if (this.pixelCanvas.width !== pw || this.pixelCanvas.height !== ph) {
            this.pixelCanvas.width = pw;
            this.pixelCanvas.height = ph;
        }

        const pctx = this.pixelCtx;
        pctx.imageSmoothingEnabled = false;

        // 1. Draw Space / Factory Cartoon Background onto Pixel Canvas
        this.renderBackground(pctx, pw, ph);

        // 2. Render Scale Scene
        pctx.save();
        pctx.translate(pw / 2, ph / 2);
        pctx.scale(this.camZoom, this.camZoom);

        if (this.tier === 0) {
            this.renderFactoryFloor(pctx, state);
        } else if (this.tier === 1) {
            this.renderPlanetaryEarth(pctx, state);
        } else if (this.tier === 2) {
            this.renderSolarDyson(pctx, state);
        } else if (this.tier === 3) {
            this.renderGalacticPenrose(pctx, state);
        } else {
            this.render11DMultiverse(pctx, state);
        }

        pctx.restore();

        // 3. Render Pixel Sparks
        this.renderSparks(pctx);

        // 4. Blit Pixel Canvas to Main Display Canvas with Crisp Nearest-Neighbor Scaling!
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, displayW, displayH);
        this.ctx.drawImage(this.pixelCanvas, 0, 0, pw, ph, 0, 0, displayW, displayH);
    }

    renderBackground(ctx, w, h) {
        // Deep vibrant cartoon backdrop
        const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
        if (this.tier === 0) {
            grad.addColorStop(0, '#1c1038');
            grad.addColorStop(1, '#090414');
        } else if (this.tier === 1) {
            grad.addColorStop(0, '#0f244a');
            grad.addColorStop(1, '#050b1a');
        } else if (this.tier === 2) {
            grad.addColorStop(0, '#4a2408');
            grad.addColorStop(1, '#140600');
        } else if (this.tier === 3) {
            grad.addColorStop(0, '#36094a');
            grad.addColorStop(1, '#0c0214');
        } else {
            grad.addColorStop(0, '#12384a');
            grad.addColorStop(1, '#030d14');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Twinkling Pixel Stars
        const time = this.cosmicRotation;
        this.stars.forEach(s => {
            const sx = Math.floor(s.x * w);
            const sy = Math.floor(s.y * h);
            const alpha = 0.4 + 0.6 * Math.sin(time * s.twinkleSpeed + s.phase);
            if (alpha > 0.2) {
                ctx.fillStyle = s.color;
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.fillRect(sx, sy, s.size, s.size);
            }
        });
        ctx.globalAlpha = 1.0;
    }

    renderFactoryFloor(ctx, state) {
        const time = this.cosmicRotation;
        const grid = state ? state.spatialGrid : null;

        // Draw 6x6 Cartoon Isometric Grid
        const tileSize = 20;
        ctx.save();
        ctx.rotate(this.camYaw * 0.5);
        ctx.scale(1, Math.cos(this.camPitch));

        for (let y = -3; y < 3; ++y) {
            for (let x = -3; x < 3; ++x) {
                const px = (x - y) * (tileSize * 0.866);
                const py = (x + y) * (tileSize * 0.5);

                ctx.strokeStyle = '#321c60';
                ctx.lineWidth = 1;
                ctx.strokeRect(px - tileSize / 2, py - tileSize / 2, tileSize, tileSize);

                // Machine tiles if grid exists
                if (grid) {
                    const tileType = grid.getTile(x + 3, y + 3);
                    if (tileType) {
                        this.drawPixelMachine(ctx, px, py, tileType, time);
                    }
                }
            }
        }

        ctx.restore();

        // Big Cartoon Paperclip Hologram in Center
        this.drawCartoonPaperclip(ctx, 0, -10, 0.9 * this.heroRecoil, this.heroRotation + time * 0.4);
    }

    drawPixelMachine(ctx, x, y, type, time) {
        if (type === 'WireExtruder') {
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(x - 6, y - 6, 12, 12);
            ctx.fillStyle = '#ffe600';
            ctx.fillRect(x - 2 + Math.sin(time * 6) * 3, y - 2, 4, 4);
        } else if (type === 'HydraulicStamper') {
            ctx.fillStyle = '#ff2a85';
            ctx.fillRect(x - 7, y - 7, 14, 14);
            const pHeight = 4 + Math.abs(Math.sin(time * 8)) * 5;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 3, y - pHeight, 6, pHeight);
        } else if (type === 'LaserSinterer') {
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(x - 7, y - 7, 14, 14);
            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y - 7);
            ctx.lineTo(x, y + 7);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(x - 6, y - 6, 12, 12);
        }
    }

    renderPlanetaryEarth(ctx, state) {
        const time = this.cosmicRotation * 0.5;
        const radius = 45;

        // Glowing Atmosphere
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
        ctx.fill();

        // Globe Circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#0e2b5c';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

        // Rotating Cartoon Continents
        for (let i = 0; i < 6; ++i) {
            const angle = time + (i * Math.PI / 3);
            const cx = Math.cos(angle) * (radius * 0.65);
            const cy = Math.sin(angle * 1.3) * (radius * 0.45);

            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, Math.PI * 2);
            ctx.fill();

            // Neon Fissures
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy);
            ctx.lineTo(cx, cy + 8);
            ctx.lineTo(cx + 12, cy - 6);
            ctx.stroke();
        }
        ctx.restore();

        // Orbital Railgun Ring
        ctx.save();
        ctx.rotate(this.camYaw);
        ctx.scale(1, 0.35);
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
        ctx.stroke();

        // Launching pixel packets
        for (let k = 0; k < 4; ++k) {
            const pAngle = (time * 3 + k * 1.5) % (Math.PI * 2);
            const px = Math.cos(pAngle) * (radius * 1.45);
            const py = Math.sin(pAngle) * (radius * 1.45);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }
        ctx.restore();
    }

    renderSolarDyson(ctx, state) {
        const time = this.cosmicRotation * 0.6;
        const sunR = 34;

        // Bright Solar Corona
        ctx.fillStyle = '#ff3300';
        ctx.beginPath();
        ctx.arc(0, 0, sunR + 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff9900';
        ctx.beginPath();
        ctx.arc(0, 0, sunR + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.arc(0, 0, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Gold Mylar Dyson Ring Collector Sails
        const rings = [
            { r: 54, tilt: 0.35, speed: 1.0, color: '#ffe600' },
            { r: 72, tilt: -0.4, speed: -0.7, color: '#00f0ff' }
        ];

        rings.forEach(cfg => {
            ctx.save();
            ctx.rotate(this.camYaw + cfg.tilt);
            ctx.scale(1, Math.abs(cfg.tilt) + 0.25);

            ctx.strokeStyle = 'rgba(255, 230, 0, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, cfg.r, 0, Math.PI * 2);
            ctx.stroke();

            const nodeCount = 8;
            for (let n = 0; n < nodeCount; ++n) {
                const a = time * cfg.speed + (n * (Math.PI * 2 / nodeCount));
                const nx = Math.cos(a) * cfg.r;
                const ny = Math.sin(a) * cfg.r;
                ctx.fillStyle = cfg.color;
                ctx.fillRect(nx - 3, ny - 3, 6, 6);
            }
            ctx.restore();
        });
    }

    renderGalacticPenrose(ctx, state) {
        const time = this.cosmicRotation * 0.9;
        const bhR = 24;

        // Violet Accretion Glow
        ctx.fillStyle = 'rgba(255, 42, 133, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, bhR * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Swirling Accretion Disk
        ctx.save();
        ctx.rotate(this.camYaw - 0.2);
        ctx.scale(1, 0.38);

        for (let r = bhR * 1.2; r < bhR * 2.8; r += 5) {
            ctx.strokeStyle = r < bhR * 2.0 ? '#00f0ff' : '#ff2a85';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, time, time + Math.PI * 1.5);
            ctx.stroke();
        }
        ctx.restore();

        // Event Horizon Core
        ctx.fillStyle = '#0a0414';
        ctx.beginPath();
        ctx.arc(0, 0, bhR, 0, Math.PI * 2);
        ctx.fill();

        // Relativistic Polar Jets
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -bhR * 0.6);
        ctx.lineTo(0, -120);
        ctx.moveTo(0, bhR * 0.6);
        ctx.lineTo(0, 120);
        ctx.stroke();
    }

    render11DMultiverse(ctx, state) {
        const time = this.cosmicRotation;

        // Candy Universe Bubbles
        const bubbles = [
            { x: -55, y: -30, r: 22, color: 'rgba(0, 240, 255, 0.4)', border: '#00f0ff' },
            { x: 50, y: -35, r: 26, color: 'rgba(255, 42, 133, 0.4)', border: '#ff2a85' },
            { x: -40, y: 42, r: 24, color: 'rgba(255, 230, 0, 0.4)', border: '#ffe600' },
            { x: 52, y: 38, r: 28, color: 'rgba(168, 85, 247, 0.4)', border: '#a855f7' }
        ];

        bubbles.forEach(b => {
            const bx = b.x + Math.sin(time + b.r) * 5;
            const by = b.y + Math.cos(time + b.r) * 5;
            ctx.fillStyle = b.color;
            ctx.strokeStyle = b.border;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bx, by, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // 4D Rotating Hyper-Cube
        ctx.save();
        ctx.rotate(time * 0.5);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        const sOuter = 32;
        const sInner = 16 + Math.sin(time * 2) * 6;

        ctx.strokeRect(-sOuter, -sOuter, sOuter * 2, sOuter * 2);
        ctx.strokeRect(-sInner, -sInner, sInner * 2, sInner * 2);

        ctx.beginPath();
        ctx.moveTo(-sOuter, -sOuter); ctx.lineTo(-sInner, -sInner);
        ctx.moveTo(sOuter, -sOuter); ctx.lineTo(sInner, -sInner);
        ctx.moveTo(sOuter, sOuter); ctx.lineTo(sInner, sInner);
        ctx.moveTo(-sOuter, sOuter); ctx.lineTo(-sInner, sInner);
        ctx.stroke();

        ctx.restore();
    }

    drawCartoonPaperclip(ctx, x, y, scale = 1.0, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Cartoon Paperclip Outline
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(-10, 20);
        ctx.lineTo(-10, -20);
        ctx.arc(0, -20, 10, Math.PI, 0, false);
        ctx.lineTo(10, 22);
        ctx.arc(0, 22, 10, 0, Math.PI, false);
        ctx.lineTo(-5, -10);
        ctx.arc(0, -10, 5, Math.PI, 0, false);
        ctx.lineTo(5, 12);
        ctx.stroke();

        ctx.restore();
    }

    renderSparks(ctx) {
        this.sparks.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        });
        ctx.globalAlpha = 1.0;
    }
}

if (typeof window !== 'undefined') {
    window.CosmicVisualizer = CosmicVisualizer;
}
