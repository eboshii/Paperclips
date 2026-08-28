/**
 * visualizer.js - Vibrant Cartoon Pixel Art Cosmic Visualizer
 * Features:
 * - Dynamic paperclip spilling & fluid flow simulation (mounds spill & flow from drop point)
 * - Tiny falling paperclips with tumbling, bouncing, and slope-sliding physics
 * - Jutting paperclip texture poking out along the dynamic fluid terrain
 * - Internal pixelation buffer pass for crisp retro pixel art
 * - 5 Cosmic scale tiers (Factory, Earth, Dyson, Galaxy, Multiverse)
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

        // Falling Paperclips Simulation
        this.fallingClips = [];
        this.settledClips = [];
        this.maxFallingClips = 120;
        this.maxSettledClips = 80;

        // Dynamic Fluid & Granular Slumping Pile Simulation
        this.numColumns = 54;
        this.pileHeights = new Float32Array(this.numColumns); // Local height of pile in pixels
        this.pileVelocities = new Float32Array(this.numColumns);
        this.initFluidColumns();

        // Background Pixel Stars
        this.stars = [];
        this.initStars(50);

        this.initEvents();
    }

    initFluidColumns() {
        this.pileHeights = new Float32Array(this.numColumns);
        this.pileVelocities = new Float32Array(this.numColumns);
        for (let i = 0; i < this.numColumns; ++i) {
            this.pileHeights[i] = 2.0; // small initial base
            this.pileVelocities[i] = 0.0;
        }
    }

    initStars(count) {
        this.stars = [];
        for (let i = 0; i < count; ++i) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.75, // keep in upper cosmic space
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
            this.emitClickSparks(this.pixelCanvas.width / 2, this.pixelCanvas.height / 2, 12);
        }
        // Spawn paperclip falling directly from the center/hero
        this.spawnPaperclips(1, this.pixelCanvas.width / 2);
    }

    spawnPaperclips(count = 1, preferredX = null) {
        const pw = this.pixelCanvas.width || 200;
        const colors = ['#ffffff', '#00f0ff', '#d0e8ff', '#ffe600', '#7fe0ff'];
        const spawnCount = Math.min(count, 18); // Particle limit per frame for smooth 60fps

        for (let i = 0; i < spawnCount; ++i) {
            if (this.fallingClips.length >= this.maxFallingClips) {
                this.fallingClips.shift();
            }

            // Determine drop X position: clustered around preferredX or randomly along ceiling
            let x;
            if (preferredX !== null && count <= 3) {
                x = preferredX + (Math.random() - 0.5) * 30;
            } else {
                x = Math.random() * (pw - 24) + 12;
            }
            x = Math.max(6, Math.min(pw - 6, x));

            const vx = (Math.random() - 0.5) * 1.5;
            const vy = 0.8 + Math.random() * 2.0;
            const rot = Math.random() * Math.PI * 2;
            const vRot = (Math.random() - 0.5) * 0.35;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.fallingClips.push({
                x: x,
                y: -6 - Math.random() * 12,
                vx: vx,
                vy: vy,
                rot: rot,
                vRot: vRot,
                color: color,
                size: 5 + Math.random() * 2.5,
                bounces: 0,
                settled: false,
                life: 8.0
            });
        }

        // If mass production (e.g. high CPS), directly feed fluid volume at random drop points
        if (count > 5) {
            const feedPoints = Math.min(count, 10);
            for (let k = 0; k < feedPoints; ++k) {
                const targetX = Math.random() * pw;
                const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((targetX / pw) * this.numColumns)));
                this.pileHeights[colIdx] += 0.8;
                this.pileVelocities[colIdx] += 0.4;
            }
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

        const pw = this.pixelCanvas.width || 200;
        const ph = this.pixelCanvas.height || 150;
        const maxAllowedPile = ph * 0.45; // Max mound height (up to 45% of screen)

        // 1. UPDATE FALLING PAPERCLIPS & IMPACT ON PILES
        for (let i = this.fallingClips.length - 1; i >= 0; --i) {
            const p = this.fallingClips[i];

            if (!p.settled) {
                p.vy += 0.26; // Gravity
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vRot;

                // Clamp X inside screen walls with bounce
                if (p.x < 4) { p.x = 4; p.vx = Math.abs(p.vx) * 0.7; }
                else if (p.x > pw - 4) { p.x = pw - 4; p.vx = -Math.abs(p.vx) * 0.7; }

                const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((p.x / pw) * this.numColumns)));
                const currentMoundHeight = this.pileHeights[colIdx];
                const surfaceY = ph - currentMoundHeight;

                // Collision with floor or fluid mound surface!
                if (p.y >= surfaceY) {
                    p.y = surfaceY;

                    // Deposit paperclip mass into the mound at this specific drop point!
                    this.pileHeights[colIdx] = Math.min(maxAllowedPile, this.pileHeights[colIdx] + 0.65);
                    this.pileVelocities[colIdx] += p.vy * 0.25;

                    // Calculate local slope to slide down the mound!
                    const leftH = colIdx > 0 ? this.pileHeights[colIdx - 1] : currentMoundHeight;
                    const rightH = colIdx < this.numColumns - 1 ? this.pileHeights[colIdx + 1] : currentMoundHeight;
                    const slope = (leftH - rightH); // positive = slopes down to the right

                    p.bounces++;
                    if (p.bounces < 2 && Math.abs(p.vy) > 1.2) {
                        p.vy = -p.vy * 0.25;
                        p.vx = (p.vx * 0.5) + (slope * 0.3); // Slide down the slope!
                        p.vRot *= 0.5;
                    } else {
                        // Settle on the slope
                        p.settled = true;
                        p.vy = 0;
                        p.vx = 0;
                        p.vRot = 0;
                        p.colIdx = colIdx;
                        p.slopeAngle = Math.atan2(slope, 6);

                        if (this.settledClips.length >= this.maxSettledClips) {
                            this.settledClips.shift();
                        }
                        this.settledClips.push(p);
                        this.fallingClips.splice(i, 1);
                        continue;
                    }
                }
            }
        }

        // 2. GRANULAR / VISCOUS FLUID SLUMPING & FLOW SIMULATION (Spills from where they drop!)
        // Material flows from tall columns to shorter adjacent columns
        const viscosity = 0.18; // Flow speed
        const angleOfRepose = 0.6; // Max natural slope before flowing outward
        const springK = 0.04;
        const damping = 0.08;

        for (let pass = 0; pass < 3; ++pass) {
            for (let i = 0; i < this.numColumns; ++i) {
                // Flow to left neighbor
                if (i > 0) {
                    const diffLeft = this.pileHeights[i] - this.pileHeights[i - 1];
                    if (diffLeft > angleOfRepose) {
                        const flow = (diffLeft - angleOfRepose) * viscosity;
                        this.pileHeights[i] -= flow;
                        this.pileHeights[i - 1] += flow;
                        this.pileVelocities[i - 1] += flow * 0.3;
                    }
                }
                // Flow to right neighbor
                if (i < this.numColumns - 1) {
                    const diffRight = this.pileHeights[i] - this.pileHeights[i + 1];
                    if (diffRight > angleOfRepose) {
                        const flow = (diffRight - angleOfRepose) * viscosity;
                        this.pileHeights[i] -= flow;
                        this.pileHeights[i + 1] += flow;
                        this.pileVelocities[i + 1] += flow * 0.3;
                    }
                }
            }
        }

        // Wave momentum & surface tension
        for (let i = 0; i < this.numColumns; ++i) {
            // Slight natural decay / compression towards base over time so it stays organic
            this.pileHeights[i] += this.pileVelocities[i];
            this.pileVelocities[i] *= (1.0 - damping);
            if (this.pileHeights[i] < 1.0) this.pileHeights[i] = 1.0;
        }

        // 3. Update Settled Resting Clips on Dynamic Terrain
        for (let i = this.settledClips.length - 1; i >= 0; --i) {
            const s = this.settledClips[i];
            s.life -= dt;
            if (s.life <= 0) {
                this.settledClips.splice(i, 1);
                continue;
            }
            if (s.colIdx !== undefined) {
                s.y = ph - this.pileHeights[s.colIdx];
            }
        }

        // 4. Update Sparks
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

        // Pixel resolution scale factor: ~2.4x pixelation
        const pixelScale = 2.4;
        const pw = Math.max(120, Math.floor(displayW / pixelScale));
        const ph = Math.max(80, Math.floor(displayH / pixelScale));

        if (this.pixelCanvas.width !== pw || this.pixelCanvas.height !== ph) {
            this.pixelCanvas.width = pw;
            this.pixelCanvas.height = ph;
            this.initFluidColumns();
        }

        const pctx = this.pixelCtx;
        pctx.imageSmoothingEnabled = false;

        // 1. Draw Space / Factory Background onto Pixel Canvas
        this.renderBackground(pctx, pw, ph);

        // 2. Render Scale Scene in Background / Center
        pctx.save();
        pctx.translate(pw / 2, ph / 2 - 12);
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

        // 3. Render Spilling Fluid Paperclip Mountains & Flowing Terrain
        this.renderFlowingPaperclipSea(pctx, pw, ph);

        // 4. Render Falling Tumbling Clips
        this.renderFallingPaperclips(pctx);

        // 5. Render Pixel Sparks
        this.renderSparks(pctx);

        // 6. Blit Pixel Canvas to Main Display Canvas with Crisp Nearest-Neighbor Scaling!
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, displayW, displayH);
        this.ctx.drawImage(this.pixelCanvas, 0, 0, pw, ph, 0, 0, displayW, displayH);
    }

    renderBackground(ctx, w, h) {
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

        ctx.fillStyle = 'rgba(255, 42, 133, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, bhR * 2.6, 0, Math.PI * 2);
        ctx.fill();

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

        ctx.fillStyle = '#0a0414';
        ctx.beginPath();
        ctx.arc(0, 0, bhR, 0, Math.PI * 2);
        ctx.fill();

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

    renderFlowingPaperclipSea(ctx, w, h) {
        const colWidth = w / (this.numColumns - 1);
        const time = this.cosmicRotation;

        // 1. Draw Flowing Fluid Mass from Dynamic Mounds to Canvas Bottom
        const fluidGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
        fluidGrad.addColorStop(0, '#223252');
        fluidGrad.addColorStop(0.4, '#17223b');
        fluidGrad.addColorStop(1, '#0b101c');

        ctx.fillStyle = fluidGrad;
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let i = 0; i < this.numColumns; ++i) {
            const x = i * colWidth;
            const y = h - this.pileHeights[i];
            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                const prevX = (i - 1) * colWidth;
                const prevY = h - this.pileHeights[i - 1];
                const midX = (prevX + x) / 2;
                const midY = (prevY + y) / 2;
                ctx.quadraticCurveTo(prevX, prevY, midX, midY);
            }
        }
        ctx.lineTo(w, h - this.pileHeights[this.numColumns - 1]);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // 2. Cyan Wave Edge Glow
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < this.numColumns; ++i) {
            const x = i * colWidth;
            const y = h - this.pileHeights[i];
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3. Dense Cross-Hatch Paperclip Texture Inside the Flowing Mass
        ctx.strokeStyle = 'rgba(130, 200, 255, 0.28)';
        ctx.lineWidth = 1;
        for (let fx = 8; fx < w - 6; fx += 14) {
            const colIdx = Math.floor((fx / w) * this.numColumns);
            const moundH = this.pileHeights[colIdx] || 2;
            if (moundH > 6) {
                const topY = h - moundH;
                const fy = topY + 4 + (Math.sin(fx * 0.8 + time) * 3 + 3);
                this.drawTinyPaperclip(ctx, fx, fy, 4, Math.sin(fx + time) * 1.2, 'rgba(0, 240, 255, 0.35)');
            }
        }

        // 4. Jutting Paperclips Poking Out Along Flow Slopes & Crests
        for (let i = 1; i < this.numColumns - 1; i += 2) {
            const x = i * colWidth;
            const y = h - this.pileHeights[i];
            const moundH = this.pileHeights[i];

            if (moundH > 3) {
                // Slope-aligned angle + subtle wiggle
                const leftH = this.pileHeights[i - 1];
                const rightH = this.pileHeights[i + 1];
                const slopeAngle = Math.atan2(leftH - rightH, colWidth * 2);
                const rot = slopeAngle + Math.sin(i * 1.5 + time) * 0.3;

                const colors = ['#ffffff', '#00f0ff', '#ffe600', '#7fe0ff', '#ffffff'];
                const color = colors[i % colors.length];
                this.drawTinyPaperclip(ctx, x, y - 2, 5.5, rot, color);
            }
        }

        // 5. Render Settled Resting Paperclips on Slopes
        this.settledClips.forEach(s => {
            this.drawTinyPaperclip(ctx, s.x, s.y - 1, s.size, s.rot + (s.slopeAngle || 0), s.color);
        });
    }

    renderFallingPaperclips(ctx) {
        this.fallingClips.forEach(p => {
            this.drawTinyPaperclip(ctx, p.x, p.y, p.size, p.rot, p.color);
        });
    }

    drawTinyPaperclip(ctx, x, y, size = 6, rot = 0, color = '#ffffff') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const s = size / 6;
        ctx.beginPath();
        // Outer loop
        ctx.moveTo(-2 * s, 3 * s);
        ctx.lineTo(-2 * s, -3 * s);
        ctx.arc(0, -3 * s, 2 * s, Math.PI, 0, false);
        ctx.lineTo(2 * s, 3.5 * s);
        ctx.arc(0, 3.5 * s, 2 * s, 0, Math.PI, false);
        // Inner loop
        ctx.lineTo(-0.8 * s, -1.5 * s);
        ctx.arc(0, -1.5 * s, 0.8 * s, Math.PI, 0, false);
        ctx.lineTo(0.8 * s, 1.8 * s);
        ctx.stroke();

        ctx.restore();
    }

    drawCartoonPaperclip(ctx, x, y, scale = 1.0, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

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
