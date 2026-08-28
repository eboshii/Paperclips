/**
 * visualizer.js - 3D / Isometric Canvas Visualizer Engine
 * Renders the 5 Cosmic Scale Tiers:
 * 1. Factory Floor (Conveyor lanes, hydraulic stampers, laser arcs, particle sparks)
 * 2. Planetary Earth (Faceted globe, cyan Voronoi fissures, equatorial railgun ring)
 * 3. Solar Dyson Swarm (Turbulent sun, golden collector rings, magnetic plasma siphons)
 * 4. Galactic Penrose Loom (Sagittarius A* black hole, Einstein lensing, accretion disk, violet jets)
 * 5. 11D Multiverse Foam (Rotating 4D hyper-tesseracts, iridescent bubble universes)
 */

class CosmicVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

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
        this.particles = [];
        this.sparks = [];
        this.heroRecoil = 1.0;
        this.heroRotation = 0;

        this.initEvents();
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

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camZoom = Math.max(0.5, Math.min(2.5, this.camZoom - e.deltaY * 0.0015));
        }, { passive: false });
    }

    triggerHeroClick() {
        this.heroRecoil = 0.75;
        this.heroRotation += 0.25;
        this.emitClickSparks(this.canvas.width / 2, this.canvas.height / 2, 25);
    }

    emitClickSparks(x, y, count = 20) {
        for (let i = 0; i < count; ++i) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0 + Math.random() * 5.0;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: 2.0 + Math.random() * 2.5,
                color: Math.random() > 0.3 ? '#ffcc00' : '#00e5ff'
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

        this.cosmicRotation += dt * 0.6;
        this.heroRecoil += (1.0 - this.heroRecoil) * (dt * 12.0);

        // Update sparks
        for (let i = this.sparks.length - 1; i >= 0; --i) {
            const p = this.sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.life -= p.decay;
            if (p.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    render(state) {
        if (!this.ctx || !this.canvas) return;
        const width = this.canvas.width = this.canvas.clientWidth;
        const height = this.canvas.height = this.canvas.clientHeight;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        // Deep Space / Factory Background
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.8);
        if (this.tier === 0) {
            bgGrad.addColorStop(0, '#10141e');
            bgGrad.addColorStop(1, '#07080c');
        } else if (this.tier === 1) {
            bgGrad.addColorStop(0, '#0a1628');
            bgGrad.addColorStop(1, '#03060f');
        } else if (this.tier === 2) {
            bgGrad.addColorStop(0, '#221508');
            bgGrad.addColorStop(1, '#0a0502');
        } else if (this.tier === 3) {
            bgGrad.addColorStop(0, '#140624');
            bgGrad.addColorStop(1, '#05010a');
        } else {
            bgGrad.addColorStop(0, '#0a1820');
            bgGrad.addColorStop(1, '#020508');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Render Scale Scene
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(this.camZoom, this.camZoom);

        if (this.tier === 0) {
            this.renderFactoryFloor(ctx, state);
        } else if (this.tier === 1) {
            this.renderPlanetaryEarth(ctx, state);
        } else if (this.tier === 2) {
            this.renderSolarDyson(ctx, state);
        } else if (this.tier === 3) {
            this.renderGalacticPenrose(ctx, state);
        } else {
            this.render11DMultiverse(ctx, state);
        }

        ctx.restore();

        // Render 2D Sparks Overlay
        this.renderSparks(ctx);
    }

    renderFactoryFloor(ctx, state) {
        const time = this.cosmicRotation;
        const grid = state.spatialGrid;

        // Draw 8x8 Isometric Floor
        const tileSize = 36;
        ctx.save();
        ctx.rotate(this.camYaw);
        ctx.scale(1, Math.cos(this.camPitch));

        for (let y = -4; y < 4; ++y) {
            for (let x = -4; x < 4; ++x) {
                const px = (x - y) * (tileSize * 0.866);
                const py = (x + y) * (tileSize * 0.5);

                ctx.strokeStyle = 'rgba(40, 70, 110, 0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(px - tileSize / 2, py - tileSize / 2, tileSize, tileSize);

                // Machine Tiles
                const tileType = grid.getTile(x + 4, y + 4);
                if (tileType) {
                    this.drawMachineTile(ctx, px, py, tileType, time);
                }
            }
        }

        ctx.restore();

        // Draw Center Paperclip Hologram
        this.drawPaperclipHologram(ctx, 0, -20, 1.2 * this.heroRecoil, this.heroRotation + time * 0.5);
    }

    drawMachineTile(ctx, x, y, type, time) {
        if (type === 'WireExtruder') {
            ctx.fillStyle = '#2277bb';
            ctx.fillRect(x - 12, y - 12, 24, 24);
            ctx.strokeStyle = '#66ccff';
            ctx.strokeRect(x - 12, y - 12, 24, 24);
            // Animated wire pulse
            const p = (time * 4) % 24;
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(x - 12 + p, y - 2, 4, 4);
        } else if (type === 'HydraulicStamper') {
            ctx.fillStyle = '#aa4422';
            ctx.fillRect(x - 14, y - 14, 28, 28);
            ctx.strokeStyle = '#ff8844';
            ctx.strokeRect(x - 14, y - 14, 28, 28);
            // Pumping piston
            const pistonH = 10 + Math.abs(Math.sin(time * 6)) * 8;
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(x - 6, y - pistonH, 12, pistonH);
        } else if (type === 'LaserSinterer') {
            ctx.fillStyle = '#441166';
            ctx.fillRect(x - 14, y - 14, 28, 28);
            ctx.strokeStyle = '#cc44ff';
            ctx.strokeRect(x - 14, y - 14, 28, 28);
            // Glowing laser beam
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y - 14);
            ctx.lineTo(x, y + 14);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#115544';
            ctx.fillRect(x - 12, y - 12, 24, 24);
            ctx.strokeStyle = '#00ffaa';
            ctx.strokeRect(x - 12, y - 12, 24, 24);
        }
    }

    renderPlanetaryEarth(ctx, state) {
        const time = this.cosmicRotation * 0.4;
        const radius = 100;

        // Atmosphere Rim
        const atmoGrad = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 1.3);
        atmoGrad.addColorStop(0, 'rgba(0, 180, 255, 0.4)');
        atmoGrad.addColorStop(1, 'rgba(0, 180, 255, 0)');
        ctx.fillStyle = atmoGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Earth Globe
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#0a2244';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

        // Rotating Continental Voronoi / Tech Fissures
        for (let i = 0; i < 8; ++i) {
            const angle = time + (i * Math.PI / 4);
            const cx = Math.cos(angle) * (radius * 0.7);
            const cy = Math.sin(angle * 1.2) * (radius * 0.5);

            ctx.fillStyle = '#164832';
            ctx.beginPath();
            ctx.arc(cx, cy, 35, 0, Math.PI * 2);
            ctx.fill();

            // Cyan Tech Fissures
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 20, cy);
            ctx.lineTo(cx, cy + 15);
            ctx.lineTo(cx + 25, cy - 10);
            ctx.stroke();
        }

        ctx.restore();

        // Equatorial Mass-Driver Orbital Ring
        ctx.save();
        ctx.rotate(this.camYaw);
        ctx.scale(1, 0.35);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // Launching titanium packets
        for (let k = 0; k < 5; ++k) {
            const pAngle = (time * 2.5 + k * 1.25) % (Math.PI * 2);
            const px = Math.cos(pAngle) * (radius * 1.5);
            const py = Math.sin(pAngle) * (radius * 1.5);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    renderSolarDyson(ctx, state) {
        const time = this.cosmicRotation * 0.5;
        const sunRadius = 75;

        // Blazing Solar Corona
        const coronaGrad = ctx.createRadialGradient(0, 0, sunRadius * 0.5, 0, 0, sunRadius * 2.2);
        coronaGrad.addColorStop(0, '#fff4cc');
        coronaGrad.addColorStop(0.3, '#ffaa00');
        coronaGrad.addColorStop(0.7, '#ff3300');
        coronaGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, sunRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Sun Surface Core
        ctx.fillStyle = '#ffeedd';
        ctx.beginPath();
        ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Gold Mylar Dyson Collector Sails
        const ringConfigs = [
            { r: 120, tilt: 0.3, speed: 1.0, color: '#ffd700' },
            { r: 160, tilt: -0.4, speed: -0.7, color: '#ffb700' },
            { r: 200, tilt: 0.5, speed: 0.5, color: '#ffe680' }
        ];

        ringConfigs.forEach(cfg => {
            ctx.save();
            ctx.rotate(this.camYaw + cfg.tilt);
            ctx.scale(1, Math.abs(cfg.tilt) + 0.2);

            ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, cfg.r, 0, Math.PI * 2);
            ctx.stroke();

            // Gold sail collector nodes
            const nodeCount = 12;
            for (let n = 0; n < nodeCount; ++n) {
                const a = time * cfg.speed + (n * (Math.PI * 2 / nodeCount));
                const nx = Math.cos(a) * cfg.r;
                const ny = Math.sin(a) * cfg.r;
                ctx.fillStyle = cfg.color;
                ctx.fillRect(nx - 4, ny - 4, 8, 8);
            }
            ctx.restore();
        });

        // Magnetic Plasma Siphon Vortex Funnel
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(Math.sin(time) * 80, -100, Math.cos(time) * 160, -180);
        ctx.stroke();
    }

    renderGalacticPenrose(ctx, state) {
        const time = this.cosmicRotation * 0.8;
        const bhRadius = 55;

        // Einstein Gravitational Lensing Glow Ring
        const lensGrad = ctx.createRadialGradient(0, 0, bhRadius * 0.9, 0, 0, bhRadius * 2.5);
        lensGrad.addColorStop(0, '#00e5ff');
        lensGrad.addColorStop(0.4, '#aa00ff');
        lensGrad.addColorStop(0.8, '#ff0055');
        lensGrad.addColorStop(1, 'rgba(255, 0, 85, 0)');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Relativistic Doppler Accretion Disk
        ctx.save();
        ctx.rotate(this.camYaw - 0.2);
        ctx.scale(1, 0.35);

        for (let r = bhRadius * 1.2; r < bhRadius * 3.0; r += 8) {
            ctx.strokeStyle = r < bhRadius * 2.0 ? '#00e5ff' : '#ff3344';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, r, time, time + Math.PI * 1.6);
            ctx.stroke();
        }
        ctx.restore();

        // Pitch Black Schwarzschild Event Horizon
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, bhRadius, 0, Math.PI * 2);
        ctx.fill();

        // Twin Violet Relativistic Polar Particle Jets
        ctx.strokeStyle = 'rgba(180, 50, 255, 0.8)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, -bhRadius * 0.5);
        ctx.lineTo(0, -300);
        ctx.moveTo(0, bhRadius * 0.5);
        ctx.lineTo(0, 300);
        ctx.stroke();
    }

    render11DMultiverse(ctx, state) {
        const time = this.cosmicRotation;

        // Parallel Universe Foam Bubbles
        const bubbles = [
            { x: -140, y: -70, r: 50, color: 'rgba(0, 255, 200, 0.25)', border: '#00ffc8' },
            { x: 120, y: -90, r: 65, color: 'rgba(255, 0, 128, 0.25)', border: '#ff0080' },
            { x: -100, y: 110, r: 55, color: 'rgba(255, 200, 0, 0.25)', border: '#ffc800' },
            { x: 130, y: 100, r: 70, color: 'rgba(128, 0, 255, 0.25)', border: '#8000ff' }
        ];

        bubbles.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.strokeStyle = b.border;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(b.x + Math.sin(time + b.r) * 10, b.y + Math.cos(time + b.r) * 10, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // 4D Rotating Hyper-Tesseract Wireframe
        ctx.save();
        ctx.rotate(time * 0.4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        const sizeOuter = 80;
        const sizeInner = 40 + Math.sin(time * 2) * 15;

        // Outer cube
        ctx.strokeRect(-sizeOuter, -sizeOuter, sizeOuter * 2, sizeOuter * 2);
        // Inner hyper-cube
        ctx.strokeRect(-sizeInner, -sizeInner, sizeInner * 2, sizeInner * 2);

        // Connecting hyper-edges
        ctx.beginPath();
        ctx.moveTo(-sizeOuter, -sizeOuter); ctx.lineTo(-sizeInner, -sizeInner);
        ctx.moveTo(sizeOuter, -sizeOuter); ctx.lineTo(sizeInner, -sizeInner);
        ctx.moveTo(sizeOuter, sizeOuter); ctx.lineTo(sizeInner, sizeInner);
        ctx.moveTo(-sizeOuter, sizeOuter); ctx.lineTo(-sizeInner, sizeInner);
        ctx.stroke();

        ctx.restore();
    }

    drawPaperclipHologram(ctx, x, y, scale = 1.0, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Vector Paperclip Spline Path
        ctx.strokeStyle = '#e0e8f5';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        // Outer loop
        ctx.moveTo(-15, 30);
        ctx.lineTo(-15, -30);
        ctx.arc(0, -30, 15, Math.PI, 0, false);
        ctx.lineTo(15, 35);
        ctx.arc(0, 35, 15, 0, Math.PI, false);
        // Inner loop
        ctx.lineTo(-7, -15);
        ctx.arc(0, -15, 7, Math.PI, 0, false);
        ctx.lineTo(7, 20);
        ctx.stroke();

        // Metallic Sheen Highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    renderSparks(ctx) {
        this.sparks.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}

if (typeof window !== 'undefined') {
    window.CosmicVisualizer = CosmicVisualizer;
}
