/**
 * visualizer.js - Vibrant Cartoon Pixel Art Cosmic Visualizer
 * Features:
 * - Viscous fluid & steep granular paperclip mound simulation synchronized with inventory
 * - Central drop clustering at start, smoothly expanding across screen at higher CPS
 * - Collision strictly matches visible fluid surface and inventory floor (no imaginary floating surfaces)
 * - Fluid suction & drain effect out the bottom of the screen on purchases
 * - Tiny falling paperclips with tumbling, bouncing, and slope-sliding physics
 * - Volumetric multi-layer paperclip texture inside the fluid
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
        this.drainingClips = [];
        this.maxFallingClips = 120;
        this.maxSettledClips = 90;
        this.maxDrainingClips = 80;

        // Dynamic Fluid & Granular Slumping Pile Simulation
        this.numColumns = 54;
        this.pileHeights = new Float32Array(this.numColumns); // Local height of pile in pixels (0.0 initially)
        this.waveOffsets = new Float32Array(this.numColumns);
        this.waveVelocities = new Float32Array(this.numColumns);
        this.initFluidColumns();

        // Background Pixel Stars
        this.stars = [];
        this.initStars(50);

        this.initEvents();
    }

    initFluidColumns() {
        this.pileHeights = new Float32Array(this.numColumns);
        this.waveOffsets = new Float32Array(this.numColumns);
        this.waveVelocities = new Float32Array(this.numColumns);
        for (let i = 0; i < this.numColumns; ++i) {
            this.pileHeights[i] = 0.0; // Strictly 0.0 at start / reset!
            this.waveOffsets[i] = 0.0;
            this.waveVelocities[i] = 0.0;
        }
    }

    initStars(count) {
        this.stars = [];
        for (let i = 0; i < count; ++i) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.75,
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
        this.spawnPaperclips(1, this.pixelCanvas.width / 2, 0);
    }

    spawnPaperclips(count = 1, preferredX = null, cps = 0) {
        const pw = this.pixelCanvas.width || 200;
        const centerX = pw / 2;
        const colors = ['#ffffff', '#00f0ff', '#d0e8ff', '#ffe600', '#7fe0ff'];
        const spawnCount = Math.min(count, 16); // Particle limit per frame for smooth 60fps

        // Calculate drop spread based on current production rate:
        // Early game / low CPS: tightly clustered around center (±15px) so a tall pile forms in the middle
        // As rate gets higher (e.g. > 35 CPS): spreads smoothly across the whole screen!
        const cpsNum = (typeof cps === 'object' && cps !== null) ? cps.toDouble() : (Number(cps) || 0);
        const spreadFactor = Math.min(1.0, cpsNum / 35.0);
        const minSpread = 15.0; // Tight cluster at start
        const maxSpread = (pw - 24) / 2;
        const currentSpread = minSpread + spreadFactor * (maxSpread - minSpread);

        for (let i = 0; i < spawnCount; ++i) {
            if (this.fallingClips.length >= this.maxFallingClips) {
                this.fallingClips.shift();
            }

            let x;
            if (preferredX !== null && count <= 3) {
                x = preferredX + (Math.random() - 0.5) * (12 + spreadFactor * 24);
            } else {
                x = centerX + (Math.random() - 0.5) * (currentSpread * 2);
            }
            x = Math.max(6, Math.min(pw - 6, x));

            const vx = (Math.random() - 0.5) * 1.2;
            const vy = 0.9 + Math.random() * 2.2;
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
    }

    /**
     * Triggers fluid dynamic draining upon spending paperclips.
     * Fluid slumps and drains away smoothly over time.
     * @param {number} ratio - Fractional cost of purchase (0.1 to 1.0)
     */
    drainPaperclips(ratio = 0.5) {
        const clampedRatio = Math.max(0.2, Math.min(1.0, ratio));

        // Induce downward suction whirlpool waves in the fluid (strongest at center)
        for (let i = 0; i < this.numColumns; ++i) {
            const centerFactor = 1.0 - Math.abs((i / (this.numColumns - 1)) - 0.5) * 1.5;
            const suctionStrength = Math.max(0.2, centerFactor) * clampedRatio * 2.2;
            this.waveVelocities[i] -= (0.8 + suctionStrength + Math.random() * 0.8);
        }

        // Settled clips slowly release into the fluid flow
        const removeCount = Math.floor(this.settledClips.length * clampedRatio * 0.4);
        if (removeCount > 0) {
            this.settledClips.splice(0, removeCount);
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
        const floorY = ph - 2;

        // Inventory-based maximum mound height capacity:
        // 0 clips -> 0px (strict real floor)
        // 1 to 25 clips -> up to 3 - 6px peak
        // 100 clips -> up to 14px peak
        // 1,000 clips -> up to 26px peak
        // 10,000+ clips -> up to ph * 0.55
        let inventoryCapacity = 0.0;
        if (state && state.clips) {
            const c = state.clips.toDouble();
            if (c > 0) {
                inventoryCapacity = Math.min(ph * 0.55, Math.log10(Math.max(1, c)) * 8.5 + Math.min(16.0, c * 0.3));
            }
        }

        // Smooth Viscous Fluid Draining: columns slowly drain towards inventory capacity
        for (let i = 0; i < this.numColumns; ++i) {
            const excess = this.pileHeights[i] - inventoryCapacity;
            if (excess > 0.01) {
                // Natural viscous fluid draining speed (~15-25% height decay per second)
                const drainRate = Math.min(excess, (1.2 + excess * 0.5) * dt);
                this.pileHeights[i] -= drainRate;

                // Suction tug on wave velocity towards drain
                this.waveVelocities[i] -= drainRate * 0.35;

                // Spawn draining paperclips pulled into bottom drains
                if (Math.random() < 0.12 && this.drainingClips.length < this.maxDrainingClips) {
                    const x = (i / (this.numColumns - 1)) * pw;
                    const moundH = Math.max(0, this.pileHeights[i] + this.waveOffsets[i]);
                    const startY = floorY - moundH;
                    const toCenter = ((pw / 2) - x) * 0.04;

                    this.drainingClips.push({
                        x: x + (Math.random() - 0.5) * 6,
                        y: startY + Math.random() * 3,
                        vx: toCenter + (Math.random() - 0.5) * 1.2,
                        vy: 1.8 + Math.random() * 2.5,
                        rot: Math.random() * Math.PI * 2,
                        vRot: (Math.random() - 0.5) * 0.5,
                        size: 4.5 + Math.random() * 2,
                        color: Math.random() > 0.5 ? '#00f0ff' : '#ffe600',
                        life: 1.4
                    });
                }
            }
        }

        // 1. UPDATE FALLING PAPERCLIPS & IMPACT ON PILES
        for (let i = this.fallingClips.length - 1; i >= 0; --i) {
            const p = this.fallingClips[i];

            if (!p.settled) {
                p.vy += 0.28; // Gravity
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vRot;

                // Clamp X inside screen walls with bounce
                if (p.x < 4) { p.x = 4; p.vx = Math.abs(p.vx) * 0.7; }
                else if (p.x > pw - 4) { p.x = pw - 4; p.vx = -Math.abs(p.vx) * 0.7; }

                const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((p.x / pw) * this.numColumns)));
                const currentMoundHeight = Math.max(0, Math.min(inventoryCapacity, this.pileHeights[colIdx] + this.waveOffsets[colIdx]));
                const surfaceY = floorY - currentMoundHeight;

                // Collision with floor or fluid mound surface!
                if (p.y >= surfaceY) {
                    p.y = surfaceY;

                    // Deposit paperclip mass into the mound at this specific drop point if inventory allows
                    if (currentMoundHeight < inventoryCapacity) {
                        this.pileHeights[colIdx] = Math.min(inventoryCapacity, this.pileHeights[colIdx] + 0.45);
                    }
                    this.waveVelocities[colIdx] += Math.min(1.5, p.vy * 0.2);

                    // Calculate local slope to slide down the mound!
                    const leftH = colIdx > 0 ? this.pileHeights[colIdx - 1] : currentMoundHeight;
                    const rightH = colIdx < this.numColumns - 1 ? this.pileHeights[colIdx + 1] : currentMoundHeight;
                    const slope = (leftH - rightH); // positive = slopes down to the right

                    p.bounces++;
                    if (p.bounces < 2 && Math.abs(p.vy) > 1.2) {
                        p.vy = -p.vy * 0.20;
                        p.vx = (p.vx * 0.4) + (slope * 0.22); // Slide down the slope!
                        p.vRot *= 0.4;
                    } else {
                        // Settle on the slope
                        p.settled = true;
                        p.vy = 0;
                        p.vx = 0;
                        p.vRot = 0;
                        p.colIdx = colIdx;
                        p.slopeAngle = Math.atan2(slope, 8);

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

        // 2. UPDATE DRAINING PAPERCLIPS (sucking downwards out bottom of screen)
        for (let i = this.drainingClips.length - 1; i >= 0; --i) {
            const p = this.drainingClips[i];
            p.vy += 0.35; // Downward suction acceleration
            p.y += p.vy;
            p.x += p.vx;
            p.rot += p.vRot;
            p.life -= dt;
            if (p.y > ph + 30 || p.life <= 0) {
                this.drainingClips.splice(i, 1);
            }
        }

        // 3. STICKY / THICK GRANULAR SLUMPING (High angle of repose allows steep central pyramid!)
        const angleOfRepose = 1.25; // Steeper angle of repose for sticky paperclip mound
        const flowRate = 0.05; // Viscous, heavy flow transfer speed

        for (let pass = 0; pass < 2; ++pass) {
            for (let i = 0; i < this.numColumns - 1; ++i) {
                const diff = this.pileHeights[i] - this.pileHeights[i + 1];
                if (Math.abs(diff) > angleOfRepose) {
                    const excess = (Math.abs(diff) - angleOfRepose) * flowRate;
                    if (diff > 0) {
                        const actualFlow = Math.min(excess, this.pileHeights[i] * 0.4);
                        this.pileHeights[i] -= actualFlow;
                        this.pileHeights[i + 1] += actualFlow;
                    } else {
                        const actualFlow = Math.min(excess, this.pileHeights[i + 1] * 0.4);
                        this.pileHeights[i + 1] -= actualFlow;
                        this.pileHeights[i] += actualFlow;
                    }
                }
            }
        }

        // 4. HEAVILY DAMPED VISCOUS WAVE PROPAGATION
        const springK = 0.05;
        const damping = 0.10;
        const spread = 0.12;

        for (let i = 0; i < this.numColumns; ++i) {
            this.waveVelocities[i] += (-springK * this.waveOffsets[i]) - (damping * this.waveVelocities[i]);
            this.waveOffsets[i] += this.waveVelocities[i];
        }

        const leftDeltas = new Float32Array(this.numColumns);
        const rightDeltas = new Float32Array(this.numColumns);
        for (let i = 0; i < this.numColumns; ++i) {
            if (i > 0) {
                leftDeltas[i] = spread * (this.waveOffsets[i] - this.waveOffsets[i - 1]);
                this.waveOffsets[i - 1] += leftDeltas[i];
            }
            if (i < this.numColumns - 1) {
                rightDeltas[i] = spread * (this.waveOffsets[i] - this.waveOffsets[i + 1]);
                this.waveOffsets[i + 1] += rightDeltas[i];
            }
        }

        // 5. Update Settled Resting Clips on Dynamic Terrain
        for (let i = this.settledClips.length - 1; i >= 0; --i) {
            const s = this.settledClips[i];
            s.life -= dt;
            if (s.life <= 0) {
                this.settledClips.splice(i, 1);
                continue;
            }
            if (s.colIdx !== undefined) {
                const moundH = Math.max(0, Math.min(inventoryCapacity, this.pileHeights[s.colIdx] + this.waveOffsets[s.colIdx]));
                s.y = floorY - moundH;
            }
        }

        // 6. Update Sparks
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

        // 4. Render Draining / Sinking Paperclips (sucked out the bottom)
        this.renderDrainingPaperclips(pctx);

        // 5. Render Falling Tumbling Clips
        this.renderFallingPaperclips(pctx);

        // 6. Render Pixel Sparks
        this.renderSparks(pctx);

        // 7. Blit Pixel Canvas to Main Display Canvas with Crisp Nearest-Neighbor Scaling!
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
        const floorY = h - 2;

        // Check if any significant pile exists (> 0.5px)
        let maxPile = 0;
        for (let i = 0; i < this.numColumns; ++i) {
            const currentH = this.pileHeights[i] + this.waveOffsets[i];
            if (currentH > maxPile) maxPile = currentH;
        }

        const colWidth = w / (this.numColumns - 1);
        const time = this.cosmicRotation;

        // If a fluid mound has formed, draw thick viscous mass
        if (maxPile > 0.5) {
            const fluidGrad = ctx.createLinearGradient(0, floorY - maxPile, 0, h);
            fluidGrad.addColorStop(0, '#26385c');
            fluidGrad.addColorStop(0.3, '#1a2742');
            fluidGrad.addColorStop(1, '#0c1221');

            ctx.fillStyle = fluidGrad;
            ctx.beginPath();
            ctx.moveTo(0, h);

            for (let i = 0; i < this.numColumns; ++i) {
                const moundH = Math.max(0, this.pileHeights[i] + this.waveOffsets[i]);
                const x = i * colWidth;
                const y = floorY - moundH;
                if (i === 0) {
                    ctx.lineTo(x, y);
                } else {
                    const prevMound = Math.max(0, this.pileHeights[i - 1] + this.waveOffsets[i - 1]);
                    const prevX = (i - 1) * colWidth;
                    const prevY = floorY - prevMound;
                    const midX = (prevX + x) / 2;
                    const midY = (prevY + y) / 2;
                    ctx.quadraticCurveTo(prevX, prevY, midX, midY);
                }
            }
            const lastMound = Math.max(0, this.pileHeights[this.numColumns - 1] + this.waveOffsets[this.numColumns - 1]);
            ctx.lineTo(w, floorY - lastMound);
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();

            // Cyan Wave Edge Glow
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < this.numColumns; ++i) {
                const moundH = Math.max(0, this.pileHeights[i] + this.waveOffsets[i]);
                const x = i * colWidth;
                const y = floorY - moundH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Dense, overlapping, irregularly spaced paperclip texture field with stable deterministic colors & positions (no inter-frame flickering)
            const palette = [
                '#00f0ff', // Cyan
                '#ffe600', // Gold/Yellow
                '#ffffff', // Silver/White
                '#ff2a85', // Neon Pink
                '#00ff88', // Emerald/Green
                '#ff7700', // Bright Orange
                '#a855f7', // Electric Purple
                '#38bdf8', // Sky Blue
                '#ff4d6d', // Coral Red
                '#a3e635', // Lime
                '#fb7185', // Rose
                '#34d399'  // Mint
            ];
            const stepX = 6.0;
            const stepY = 5.0;
            const numCols = Math.floor((w - 6) / stepX);

            for (let c = 0; c < numCols; ++c) {
                const fx = 3 + c * stepX;
                const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((fx / w) * this.numColumns)));
                const moundH = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
                if (moundH > 1.2) {
                    const topY = floorY - moundH;
                    const maxRows = Math.ceil(moundH / stepY);

                    // Anchor vertically to floorY so seeds and coordinates never oscillate or change between frames
                    for (let r = 0; r < maxRows; ++r) {
                        const fy = floorY - 2.5 - (r * stepY);
                        if (fy < topY) break;

                        // 100% deterministic spatial hash based on fixed grid coordinates
                        const seed = (c * 997 + r * 1013) % 50000;

                        // Organic irregular static offset
                        const jitterX = (((seed * 19) % 100) / 100 - 0.5) * 5.5;
                        const jitterY = (((seed * 31) % 100) / 100 - 0.5) * 3.5;
                        const px = fx + jitterX;
                        const py = fy + jitterY;

                        // Static 360° irregular rotation angles for tangled look
                        const rot = ((seed * 137) % 628) / 100;
                        const size = 3.6 + (((seed * 17) % 100) / 35.0); // 3.6 to 6.4 px

                        // Static randomized vibrant color per paperclip
                        const color = palette[(seed * 53 + 19) % palette.length];

                        this.drawTinyPaperclip(ctx, px, py, size, rot, color);

                        // Tangled overlapping cluster clips with stable randomized colors
                        if (seed % 4 === 0 && py - 2 > topY) {
                            const clusterRot = (rot + 1.25) % (Math.PI * 2);
                            const clusterColor = palette[(seed * 89 + 41) % palette.length];
                            this.drawTinyPaperclip(ctx, px + 2.0, py - 1.5, size * 0.9, clusterRot, clusterColor);
                        }
                    }
                }
            }

            // Jutting Paperclips on Slopes & Mountain Crest with stable randomized colors
            for (let i = 1; i < this.numColumns - 1; i += 2) {
                const moundH = Math.max(0, this.pileHeights[i] + this.waveOffsets[i]);
                if (moundH > 2.0) {
                    const x = i * colWidth;
                    const y = floorY - moundH;
                    const leftH = Math.max(0, this.pileHeights[i - 1] + this.waveOffsets[i - 1]);
                    const rightH = Math.max(0, this.pileHeights[i + 1] + this.waveOffsets[i + 1]);
                    const slopeAngle = Math.atan2(leftH - rightH, colWidth * 2);
                    const rot = slopeAngle + (((i * 97) % 100) / 100 - 0.5) * 0.4;

                    const color = palette[(i * 37 + 11) % palette.length];
                    this.drawTinyPaperclip(ctx, x, y - 2, 5.5, rot, color);
                }
            }
        }

        // Render Settled Resting Paperclips on floor / mounds
        this.settledClips.forEach(s => {
            this.drawTinyPaperclip(ctx, s.x, s.y, s.size, s.rot + (s.slopeAngle || 0), s.color);
        });
    }

    renderDrainingPaperclips(ctx) {
        this.drainingClips.forEach(p => {
            // Draw sleek suction tail line pulling into the floor
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = 0.45;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.vy * 1.8);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            this.drawTinyPaperclip(ctx, p.x, p.y, p.size, p.rot, p.color);
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
