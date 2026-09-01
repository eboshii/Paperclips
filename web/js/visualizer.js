/**
 * visualizer.js - Vectorised Cosmic Art Engine with Neutral Monochrome Backgrounds & Dither Filter
 * Features:
 * - 7 Progressive Vectorised Scene Backgrounds with Neutral/Monochrome Palettes for Maximum Foreground Pop:
 *     0: Factory Interior (Dark slate/brick walls, timber trusses, misty monochrome arched windows, pendant lamps)
 *     1: Factory in Town (Monochrome dusk skyline, silhouette hills, town houses, standalone factory, smokestacks)
 *     2: Industrial Megacity (Noir/blueprint skyscraper silhouettes, cooling towers, monorail, highway light trails)
 *     3: Planetary Earth & Orbital Ring (Deep space void, muted navy/slate globe, glowing cyan cyber-fissures)
 *     4: Solar Dyson Swarm & Star Siphon (Deep void, amber-charcoal solar corona, concentric golden rings)
 *     5: Galactic Penrose Dynamo (Sagittarius A* black hole, Doppler accretion swirl, violet relativistic jets)
 *     6: 11D Multiverse Quantum Foam (Muted translucent bubble universes, central chrome reality, 4D tesseract)
 * - Hero Paperclip High-Contrast Shadow Halo for Crystal-Clear Visibility Against Windows and Walls
 * - Authentic 8x8 Bayer Matrix Ordered Dithering & Color Quantization Filter Pass
 * - Dynamic fluid paperclip mountain & granular slumping physics synchronized with inventory
 * - Tumbling falling paperclips, sink suction drain physics, and particle sparks
 * - Crisp nearest-neighbor pixel buffer upscaling for retro pixel-art aesthetic
 */

class CosmicVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        // Internal Low-Res Pixelation Buffer Pass
        this.pixelCanvas = document.createElement('canvas');
        this.pixelCtx = this.pixelCanvas.getContext('2d');

        // Scene / Tier Management (0 to 6)
        this.tier = 0;
        this.autoTier = true;
        this.enableDither = true;
        this.ditherIntensity = 1.0;

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
        this.maxFallingClips = 300;
        this.maxSettledClips = 90;
        this.maxDrainingClips = 80;

        // Dynamic Fluid & Granular Slumping Pile Simulation
        this.numColumns = 54;
        this.pileHeights = new Float32Array(this.numColumns);
        this.waveOffsets = new Float32Array(this.numColumns);
        this.waveVelocities = new Float32Array(this.numColumns);
        this.internalFlowPhase = 0.0;
        this.internalFlowVelocity = 0.0;
        this.drainFlowPhase = 0.0;
        this.drainFlowIntensity = 0.0;
        this.initFluidColumns();

        // Falling Fluid Cascade Streams Simulation (Drifts in at high CPS scales)
        this.fluidStreamIntensity = 0.0;
        this.fluidStreamPhase = 0.0;
        this.fluidStreamChannels = [
            { relX: 0.18, width: 14, speed: 1.15, phaseOffset: 0.0, waveAmp: 3.2, waveFreq: 0.045, colorScheme: 0 },
            { relX: 0.32, width: 18, speed: 1.35, phaseOffset: 1.4, waveAmp: 4.0, waveFreq: 0.040, colorScheme: 1 },
            { relX: 0.50, width: 24, speed: 1.55, phaseOffset: 2.8, waveAmp: 4.8, waveFreq: 0.035, colorScheme: 2 },
            { relX: 0.68, width: 18, speed: 1.30, phaseOffset: 4.2, waveAmp: 4.0, waveFreq: 0.040, colorScheme: 1 },
            { relX: 0.82, width: 14, speed: 1.20, phaseOffset: 5.6, waveAmp: 3.2, waveFreq: 0.045, colorScheme: 0 }
        ];
        this.fluidSplashDroplets = [];
        this.maxSplashDroplets = 50;

        // Background Stars for space scenes
        this.stars = [];
        this.initStars(60);

        // Pre-compute 8x8 Bayer Dithering Matrix for the Dither Filter Pass
        this.bayer8x8 = [
            [ 0, 32,  8, 40,  2, 34, 10, 42],
            [48, 16, 56, 24, 50, 18, 58, 26],
            [12, 44,  4, 36, 14, 46,  6, 38],
            [60, 28, 52, 20, 62, 30, 54, 22],
            [ 3, 35, 11, 43,  1, 33,  9, 41],
            [51, 19, 59, 27, 49, 17, 57, 25],
            [15, 47,  7, 39, 13, 45,  5, 37],
            [63, 31, 55, 23, 61, 29, 53, 21]
        ];

        // Screen Shake & Scene Transition Animation State
        this.shakeTimer = 0.0;
        this.shakeIntensity = 0.0;
        this.transitionBanner = null;
        this.transitionBannerTimer = 0.0;

        this.initEvents();
    }

    initFluidColumns() {
        this.pileHeights = new Float32Array(this.numColumns);
        this.waveOffsets = new Float32Array(this.numColumns);
        this.waveVelocities = new Float32Array(this.numColumns);
        for (let i = 0; i < this.numColumns; ++i) {
            this.pileHeights[i] = 0.0;
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
                color: Math.random() > 0.5 ? '#8da2b8' : (Math.random() > 0.5 ? '#b0c4de' : '#6b7c96'),
                twinkleSpeed: 0.8 + Math.random() * 2.2,
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
        this.spawnPaperclips(1, this.pixelCanvas.width / 2, 0);
    }

    spawnPaperclips(count = 1, preferredX = null, cps = 0) {
        const pw = this.pixelCanvas.width || 240;
        const centerX = pw / 2;
        const colors = ['#ffffff', '#00f0ff', '#d0e8ff', '#ffe600', '#7fe0ff', '#ff66aa'];

        // When fluid stream intensity is high, throttle discrete falling clips so they act as sparkling accents
        // while the bulk mass of falling paperclips is smoothly rendered by the fluid cascade simulation.
        const maxSpawn = Math.max(1, Math.round(16 * (1.0 - this.fluidStreamIntensity * 0.85)));
        const spawnCount = Math.min(count, maxSpawn);

        const cpsNum = (typeof cps === 'object' && cps !== null) ? cps.toDouble() : (Number(cps) || 0);
        const spreadFactor = Math.min(1.0, cpsNum / 35.0);
        const minSpread = 15.0;
        const maxSpread = (pw - 24) / 2;
        const currentSpread = minSpread + spreadFactor * (maxSpread - minSpread);

        const currentMaxFalling = Math.round(this.maxFallingClips * (1.0 - this.fluidStreamIntensity * 0.75));

        for (let i = 0; i < spawnCount; ++i) {
            if (this.fallingClips.length >= currentMaxFalling) break;

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

        this.internalFlowVelocity = Math.min(2.0, this.internalFlowVelocity + Math.min(count, 6) * 0.12);
    }

    drainPaperclips(ratio = 0.5) {
        const clampedRatio = Math.max(0.1, Math.min(1.0, ratio));
        // Boost drain flow vortex intensity for visual swirl / whirlpool effect
        this.drainFlowIntensity = Math.min(3.0, this.drainFlowIntensity + clampedRatio * 2.2);

        const pw = this.pixelCanvas.width || 240;
        const ph = this.pixelCanvas.height || 150;
        const floorY = ph - 2;

        // Spawn draining paperclips that get sucked into the central sink
        const spawnDrainCount = Math.min(24, Math.floor(6 + clampedRatio * 18));
        const colors = ['#00f0ff', '#ffe600', '#ffffff', '#ff2a85', '#00ff88', '#ff7700', '#a855f7', '#38bdf8'];
        const colWidth = pw / (this.numColumns - 1);

        for (let k = 0; k < spawnDrainCount; ++k) {
            if (this.drainingClips.length >= this.maxDrainingClips) break;

            const colIdx = Math.floor(Math.random() * this.numColumns);
            const moundH = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
            if (moundH < 0.8) continue;

            const x = colIdx * colWidth + (Math.random() - 0.5) * 6;
            const y = floorY - moundH + Math.random() * moundH * 0.4;

            const dx = (pw / 2) - x;
            const dy = floorY - y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 1.0;
            const speed = 1.2 + Math.random() * 2.0;

            this.drainingClips.push({
                x: x,
                y: y,
                vx: (dx / dist) * speed,
                vy: Math.max(0.4, (dy / dist) * speed * 0.8),
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.4 + (dx > 0 ? 0.15 : -0.15),
                size: 3.5 + Math.random() * 2.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.8 + Math.random() * 1.2,
                maxLife: 2.5,
                alpha: 0.9
            });
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
                color: Math.random() > 0.4 ? '#ffe600' : (Math.random() > 0.5 ? '#00f0ff' : '#ffffff')
            });
        }
    }

    spawnSparks(x, y, count = 25) {
        this.emitClickSparks(x, y, count);
    }

    getTierScale(tier = this.tier) {
        const scales = [1.0, 0.72, 0.52, 0.38, 0.28, 0.20, 0.15];
        return scales[Math.max(0, Math.min(6, tier))] || 1.0;
    }

    computeTargetCapacity(state, ph) {
        if (!state || !state.clips) return 0.0;
        let cLog = 0;
        let numVal = 0;
        if (state.clips instanceof BigDouble) {
            if (state.clips.mantissa <= 0) return 0.0;
            cLog = state.clips.exponent + Math.log10(Math.max(1e-9, state.clips.mantissa));
            if (state.clips.exponent < 6) numVal = state.clips.toDouble();
        } else {
            numVal = Number(state.clips) || 0;
            if (numVal <= 0) return 0.0;
            cLog = Math.log10(numVal);
        }

        const tier = (this.tier !== undefined) ? this.tier : 0;
        const maxFillHeight = ph * 0.65;

        let fillFraction = 0.0;

        if (tier === 0) {
            // Tier 0: 0 to 5,000,000 clips (5 Metric Tons)
            const logMax = Math.log10(5000000.0); // ~6.69897 (burst threshold: 5 Million clips)
            if (numVal > 0 && numVal <= 100.0) {
                fillFraction = (numVal / 100.0) * 0.05;
            } else if (cLog > Math.log10(100.0)) {
                const logMin = Math.log10(100.0);
                const progress = Math.min(1.0, (cLog - logMin) / (logMax - logMin));
                fillFraction = 0.05 + progress * 0.95;
            }
        } else {
            let logMin = 6.699;
            let logMax = 8.699;
            if (tier === 1) {
                logMin = 6.699;    // 5M (Town entry)
                logMax = 8.699;    // 500M (Town submerged)
            } else if (tier === 2) {
                logMin = 8.699;    // 500M (Megacity entry)
                logMax = 12.000;   // 1T (Metropolis submerged)
            } else if (tier === 3) {
                logMin = 12.000;   // 1T (Planetary Earth entry)
                logMax = 27.776;   // 5.97e27 (5.97e24 kg Earth mass converted)
            } else if (tier === 4) {
                logMin = 27.776;   // 5.97e27 (Solar Dyson entry)
                logMax = 33.298;   // 1.99e33 (1.989e30 kg Solar mass converted)
            } else if (tier === 5) {
                logMin = 33.298;   // 1.99e33 (Galactic Penrose entry)
                logMax = 45.000;   // 1e45 (Milky Way matter)
            } else if (tier === 6) {
                logMin = 45.000;   // 1e45 (11D Multiverse entry)
                logMax = 150.000;  // 1e150 (Multiverse quantum foam)
            }

            if (cLog <= logMin) {
                const subRatio = Math.max(0.0, Math.min(1.0, Math.pow(10, cLog - logMin)));
                fillFraction = subRatio * 0.06;
            } else {
                const progress = Math.min(1.0, (cLog - logMin) / (logMax - logMin));
                fillFraction = 0.06 + progress * 0.94;
            }
        }

        fillFraction = Math.max(0.0, Math.min(1.0, fillFraction));
        return fillFraction * maxFillHeight;
    }

    syncFluidToInventory(state, instant = false) {
        if (!state || !state.clips) return;
        const ph = this.pixelCanvas.height || 150;
        const targetCapacity = this.computeTargetCapacity(state, ph);

        for (let i = 0; i < this.numColumns; ++i) {
            const centerFactor = 0.65 + 0.35 * Math.sin(Math.PI * (i / (this.numColumns - 1)));
            const targetH = targetCapacity * centerFactor;
            if (instant) {
                this.pileHeights[i] = targetH;
                this.waveOffsets[i] = 0.0;
                this.waveVelocities[i] = 0.0;
            }
        }
        if (!instant) {
            this.internalFlowVelocity = Math.min(2.5, this.internalFlowVelocity + 0.4);
        }
    }

    determineAutoTier(lifetimeClips) {
        if (!lifetimeClips) return 0;
        if (lifetimeClips.gte(new BigDouble(1.0, 45))) return 6; // Multiverse
        if (lifetimeClips.gte(new BigDouble(1.99, 33))) return 5; // Galactic Penrose (Dyson complete)
        if (lifetimeClips.gte(new BigDouble(5.97, 27))) return 4; // Solar Dyson (Earth complete)
        if (lifetimeClips.gte(new BigDouble(1.0, 12)))  return 3; // Planetary Earth (1 Trillion)
        if (lifetimeClips.gte(new BigDouble(5.0, 8)))   return 2; // Industrial Megacity (500 Million)
        if (lifetimeClips.gte(new BigDouble(5.0, 6)))   return 1; // Factory in Town (5 Million)
        return 0; // Factory Interior (0 to 5 Million)
    }

    getTierName(tier) {
        switch (tier) {
            case 0: return "Factory Interior (Wood & Brick Warehouse)";
            case 1: return "Factory in Town (Industrial Suburb)";
            case 2: return "Industrial Megacity (Metropolis)";
            case 3: return "Planetary Earth & Orbital Ring";
            case 4: return "Solar Dyson Swarm & Star Siphon";
            case 5: return "Galactic Penrose Dynamo";
            case 6: return "11D Multiverse Quantum Foam";
            default: return "Factory Assembly";
        }
    }

    triggerTransition(fromTier, toTier, bannerText) {
        if (this.autoTier) {
            this.tier = Math.max(0, Math.min(6, toTier));
        }
        this.shakeTimer = 1.2;
        this.shakeIntensity = 12.0;
        this.transitionBanner = bannerText || `ENTERING ${this.getTierName(toTier).toUpperCase()}`;
        this.transitionBannerTimer = 4.0;
        
        // Spawn eruption of falling clips and sparks
        for (let i = 0; i < 90; ++i) {
            this.fallingClips.push({
                x: Math.random() * 240,
                y: -Math.random() * 80,
                vx: (Math.random() - 0.5) * 55,
                vy: 50 + Math.random() * 110,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 16,
                size: 2.5 + Math.random() * 2.5,
                colorScheme: Math.floor(Math.random() * 3)
            });
        }
        this.spawnSparks(120, 75, 50);

        if (window.game && window.game.audio) {
            window.game.audio.playTechUnlockSound();
        }
    }

    setTier(tierIndex) {
        if (tierIndex === -1) {
            this.autoTier = true;
        } else {
            this.autoTier = false;
            this.tier = Math.max(0, Math.min(6, tierIndex));
        }
    }

    toggleDither() {
        this.enableDither = !this.enableDither;
        return this.enableDither;
    }

    update(dt, state) {
        const safeDt = Math.min(0.1, Math.max(0.001, dt));

        if (this.autoTier && state) {
            this.tier = this.determineAutoTier(state.lifetimeClips);
        }

        if (this.shakeTimer > 0) {
            this.shakeTimer = Math.max(0, this.shakeTimer - safeDt);
        }
        if (this.transitionBannerTimer > 0) {
            this.transitionBannerTimer = Math.max(0, this.transitionBannerTimer - safeDt);
            if (this.transitionBannerTimer <= 0) this.transitionBanner = null;
        }

        this.cosmicRotation += safeDt * 0.8;
        this.heroRecoil += (1.0 - this.heroRecoil) * (safeDt * 10.0);

        this.internalFlowPhase += this.internalFlowVelocity * safeDt * 0.6;
        this.internalFlowVelocity = Math.max(0, this.internalFlowVelocity - safeDt * 0.85);

        this.drainFlowPhase += this.drainFlowIntensity * safeDt * 2.2;
        this.drainFlowIntensity = Math.max(0, this.drainFlowIntensity - safeDt * 0.85);

        // 1. Calculate fluid cascade intensity: Drifts towards fluid waterfall at high production scales
        let targetStreamIntensity = 0.0;
        if (state && typeof state.calculateTotalCPS === 'function') {
            const cps = state.calculateTotalCPS();
            if (cps && cps.gt(BigDouble.zero())) {
                let logCPS = 0;
                if (cps.exponent >= 1) {
                    logCPS = cps.exponent + Math.log10(Math.max(1e-9, cps.mantissa));
                } else {
                    const num = cps.toDouble();
                    if (num > 0) logCPS = Math.log10(num);
                }
                if (logCPS > 0.7) {
                    targetStreamIntensity = Math.min(1.0, (logCPS - 0.7) / 2.3);
                }
            }
        }
        // Smoothly drift towards the target fluid stream intensity
        this.fluidStreamIntensity += (targetStreamIntensity - this.fluidStreamIntensity) * (1.0 - Math.exp(-safeDt * 2.2));

        // Advance fluid waterfall flow phase
        this.fluidStreamPhase += (2.6 + this.fluidStreamIntensity * 3.8) * safeDt;

        const pw = this.pixelCanvas.width || 240;
        const ph = this.pixelCanvas.height || 150;
        const floorY = ph - 2;

        // 2. Fluid Waterfall Impact Physics on the surface of the bottom fluid sea
        if (this.fluidStreamIntensity > 0.02) {
            for (let c = 0; c < this.fluidStreamChannels.length; ++c) {
                const ch = this.fluidStreamChannels[c];
                const streamCenterX = ch.relX * pw;
                const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((streamCenterX / pw) * this.numColumns)));
                const moundH = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
                const impactY = floorY - moundH;

                // Gentle surface agitation from the pouring fluid torrent
                const agitation = 0.06 * this.fluidStreamIntensity * Math.sin(this.fluidStreamPhase * 2.0 + ch.phaseOffset);
                this.waveOffsets[colIdx] += agitation;

                // Spawn splash droplets at impact zone
                if (Math.random() < this.fluidStreamIntensity * 0.45 && this.fluidSplashDroplets.length < this.maxSplashDroplets) {
                    const splashAngle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
                    const splashSpeed = 1.2 + Math.random() * 2.2 * this.fluidStreamIntensity;
                    const splashColors = ['#ffffff', '#00f0ff', '#70e2ff', '#ffe600'];
                    this.fluidSplashDroplets.push({
                        x: streamCenterX + (Math.random() - 0.5) * (ch.width * 0.7),
                        y: impactY,
                        vx: Math.cos(splashAngle) * splashSpeed,
                        vy: Math.sin(splashAngle) * splashSpeed,
                        life: 0.4 + Math.random() * 0.35,
                        maxLife: 0.75,
                        size: Math.random() > 0.6 ? 2 : 1,
                        color: splashColors[Math.floor(Math.random() * splashColors.length)]
                    });
                }
            }
        }

        // Update Splash Droplets
        for (let i = this.fluidSplashDroplets.length - 1; i >= 0; --i) {
            const d = this.fluidSplashDroplets[i];
            d.x += d.vx;
            d.y += d.vy;
            d.vy += 0.16; // gravity
            d.life -= safeDt;
            if (d.life <= 0 || d.y > ph + 5) {
                this.fluidSplashDroplets.splice(i, 1);
            }
        }

        // 3. Update Falling Paperclips (Discrete accent clips)
        for (let i = this.fallingClips.length - 1; i >= 0; --i) {
            const p = this.fallingClips[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vRot;
            p.vy += 0.22;
            p.life -= safeDt;

            const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((p.x / pw) * this.numColumns)));
            const currentMound = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
            const surfaceY = floorY - currentMound;

            if (p.y >= surfaceY) {
                p.y = surfaceY;
                // Subtle fluid surface ripple (viscous dissipation, no rubber bounce)
                this.waveOffsets[colIdx] += 0.12;
                this.waveVelocities[colIdx] += 0.18;
                if (colIdx > 0) this.waveVelocities[colIdx - 1] += 0.09;
                if (colIdx < this.numColumns - 1) this.waveVelocities[colIdx + 1] += 0.09;

                p.settled = true;
                this.fallingClips.splice(i, 1);
            } else if (p.life <= 0 || p.y > ph + 20) {
                this.fallingClips.splice(i, 1);
            }
        }

        // 4. Update Draining Paperclips (Vortex Suction towards Center Floor Drain)
        const drainTargetX = pw / 2;
        const drainTargetY = floorY + 4;
        for (let i = this.drainingClips.length - 1; i >= 0; --i) {
            const p = this.drainingClips[i];
            const dx = drainTargetX - p.x;
            const dy = drainTargetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

            const suctionAcc = 3.5 + this.drainFlowIntensity * 2.5;
            p.vx += (dx / dist) * suctionAcc * safeDt;
            p.vy += Math.max(0.6, (dy / dist) * suctionAcc * safeDt);

            // Tangential swirl (vortex whirlpool effect)
            const tanX = -dy / dist;
            const tanY = dx / dist;
            p.vx += tanX * 1.8 * safeDt;
            p.vy += tanY * 0.6 * safeDt;

            // Fluid drag
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vRot;

            p.life -= safeDt;
            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.life <= 0 || p.y > ph + 10 || dist < 3.0) {
                this.drainingClips.splice(i, 1);
            }
        }

        // 5. Dynamic Fluid Simulation - Smooth slow drain over a few seconds, zero spring bounce
        const targetCapacity = this.computeTargetCapacity(state, ph);

        for (let i = 0; i < this.numColumns; ++i) {
            const centerFactor = 0.65 + 0.35 * Math.sin(Math.PI * (i / (this.numColumns - 1)));
            const targetH = targetCapacity * centerFactor;
            const diff = targetH - this.pileHeights[i];

            if (diff < 0) {
                // Spending / Draining: Slow, smooth viscous drain over 2.5 - 3.5 seconds
                const baseDrainRate = 1.2;
                const drainSpeed = baseDrainRate * (1.0 + this.drainFlowIntensity * 0.35);
                const drainFactor = 1.0 - Math.exp(-safeDt * drainSpeed);
                this.pileHeights[i] += diff * drainFactor;
            } else if (diff > 0) {
                // Producing / Filling: Smooth fill
                const fillRate = 3.5;
                const fillFactor = 1.0 - Math.exp(-safeDt * fillRate);
                this.pileHeights[i] += diff * fillFactor;
            }

            // Surface ripples: Overdamped / critically damped viscous relaxation (Zero bounce)
            const rippleDamping = 10.0;
            const rippleRestoring = 16.0;
            const accel = -rippleRestoring * this.waveOffsets[i] - rippleDamping * this.waveVelocities[i];
            this.waveVelocities[i] += accel * safeDt;
            this.waveOffsets[i] += this.waveVelocities[i] * safeDt;

            this.waveOffsets[i] *= Math.exp(-safeDt * 4.0);
            this.waveVelocities[i] *= Math.exp(-safeDt * 6.0);
        }

        // Viscous lateral diffusion smoothing pass
        const waveSpread = 0.15;
        for (let pass = 0; pass < 2; ++pass) {
            for (let i = 0; i < this.numColumns; ++i) {
                if (i > 0) {
                    const d = waveSpread * (this.waveOffsets[i] - this.waveOffsets[i - 1]);
                    this.waveOffsets[i - 1] += d;
                    this.waveOffsets[i] -= d;
                }
                if (i < this.numColumns - 1) {
                    const d = waveSpread * (this.waveOffsets[i] - this.waveOffsets[i + 1]);
                    this.waveOffsets[i + 1] += d;
                    this.waveOffsets[i] -= d;
                }
            }
        }

        // 6. Update Sparks
        for (let i = this.sparks.length - 1; i >= 0; --i) {
            const p = this.sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
            p.life -= p.decay;
        }
    }

    render(state) {
        if (!this.ctx || !this.canvas) return;
        const displayW = this.canvas.width = this.canvas.clientWidth;
        const displayH = this.canvas.height = this.canvas.clientHeight;
        if (displayW <= 0 || displayH <= 0) return;

        // Internal render resolution (~2.2x pixelation ratio)
        const pixelScale = 2.2;
        const pw = Math.max(160, Math.floor(displayW / pixelScale));
        const ph = Math.max(100, Math.floor(displayH / pixelScale));

        if (this.pixelCanvas.width !== pw || this.pixelCanvas.height !== ph) {
            this.pixelCanvas.width = pw;
            this.pixelCanvas.height = ph;
        }

        const pctx = this.pixelCtx;
        pctx.imageSmoothingEnabled = false;

        // 1. Render Progressive Neutral/Monochrome Vector Background Scene
        this.renderSceneVector(pctx, pw, ph, state);

        // 2. Render Falling Fluid Streams & Cascade Torrent (when CPS is high)
        this.renderFallingFluidStreams(pctx, pw, ph);

        // 3. Render Spilling Fluid Paperclip Mountains & Flowing Terrain
        this.renderFlowingPaperclipSea(pctx, pw, ph);

        // 4. Render Fluid Waterfall Impact Splashes
        this.renderFluidImpactSplashes(pctx);

        // 5. Render Draining / Sinking Paperclips
        this.renderDrainingPaperclips(pctx);

        // 6. Render Falling Tumbling Clips (Discrete foreground accents)
        this.renderFallingPaperclips(pctx);

        // 7. Render Pixel Sparks
        this.renderSparks(pctx);

        // 8. Apply Bayer Ordered Dithering & Color Filter Pass
        if (this.enableDither) {
            this.applyDitherFilter(pctx, pw, ph);
        }

        // 9. Crisp Nearest-Neighbor Upscale Blit to Main Display Canvas with Screen Shake
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, displayW, displayH);

        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeTimer > 0) {
            const mag = this.shakeIntensity * (this.shakeTimer / 1.2);
            shakeX = (Math.random() - 0.5) * mag * pixelScale;
            shakeY = (Math.random() - 0.5) * mag * pixelScale;
        }

        this.ctx.drawImage(this.pixelCanvas, 0, 0, pw, ph, shakeX, shakeY, displayW, displayH);

        // 10. Render Transition Banner if active
        if (this.transitionBanner && this.transitionBannerTimer > 0) {
            this.renderTransitionBannerOverlay(this.ctx, displayW, displayH);
        }
    }

    renderTransitionBannerOverlay(ctx, w, h) {
        ctx.save();
        const bannerH = 44;
        const bannerY = h * 0.14;
        const alpha = Math.min(1.0, this.transitionBannerTimer > 0.6 ? 1.0 : this.transitionBannerTimer * 1.6);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(15, 8, 30, 0.90)';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;

        ctx.fillRect(16, bannerY, w - 32, bannerH);
        ctx.strokeRect(16, bannerY, w - 32, bannerH);

        ctx.font = "800 15px 'Fredoka', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffe600';
        ctx.shadowColor = '#ff2a85';
        ctx.shadowBlur = 10;
        ctx.fillText(this.transitionBanner, w / 2, bannerY + bannerH / 2);
        ctx.restore();
    }

    // =========================================================================
    // 8x8 BAYER MATRIX ORDERED DITHERING & PIXEL FILTER PASS
    // =========================================================================
    applyDitherFilter(ctx, width, height) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const matrix = this.bayer8x8;
        const spread = 24.0 * this.ditherIntensity;
        const quantLevels = 24.0;

        for (let y = 0; y < height; ++y) {
            const matRow = matrix[y & 7];
            const rowOffset = y * width * 4;
            for (let x = 0; x < width; ++x) {
                const idx = rowOffset + (x << 2);
                const dither = (matRow[x & 7] / 64.0 - 0.5) * spread;

                // Red channel
                let r = data[idx] + dither;
                r = Math.floor(Math.max(0, Math.min(255, r)) / quantLevels) * quantLevels;
                data[idx] = r;

                // Green channel
                let g = data[idx + 1] + dither;
                g = Math.floor(Math.max(0, Math.min(255, g)) / quantLevels) * quantLevels;
                data[idx + 1] = g;

                // Blue channel
                let b = data[idx + 2] + dither;
                b = Math.floor(Math.max(0, Math.min(255, b)) / quantLevels) * quantLevels;
                data[idx + 2] = b;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    // =========================================================================
    // MASTER SCENE ROUTER
    // =========================================================================
    renderSceneVector(ctx, w, h, state) {
        const time = this.cosmicRotation;

        switch (this.tier) {
            case 0:
                this.renderFactoryInteriorVector(ctx, w, h, time, state);
                break;
            case 1:
                this.renderFactoryTownVector(ctx, w, h, time, state);
                break;
            case 2:
                this.renderCityMetropolisVector(ctx, w, h, time, state);
                break;
            case 3:
                this.renderPlanetaryEarthVector(ctx, w, h, time, state);
                break;
            case 4:
                this.renderSolarDysonVector(ctx, w, h, time, state);
                break;
            case 5:
                this.renderGalacticPenroseVector(ctx, w, h, time, state);
                break;
            case 6:
            default:
                this.render11DMultiverseVector(ctx, w, h, time, state);
                break;
        }
    }

    // =========================================================================
    // SCENE 0: FACTORY INTERIOR (Neutral Slate/Charcoal Brick Warehouse & Muted Windows)
    // =========================================================================
    renderFactoryInteriorVector(ctx, w, h, time, state) {
        // 1. Neutral Dark Slate/Charcoal Brick Wall Background
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
        wallGrad.addColorStop(0, '#14161a');
        wallGrad.addColorStop(0.5, '#1e2126');
        wallGrad.addColorStop(1, '#111316');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h);

        // Subtle Muted Brick Coursing Pattern
        ctx.strokeStyle = 'rgba(10, 12, 16, 0.40)';
        ctx.lineWidth = 1;
        const brickH = 7;
        const brickW = 16;
        for (let y = 0; y < h; y += brickH) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();

            const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
            for (let x = offset; x < w; x += brickW) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + brickH);
                ctx.stroke();
            }
        }

        // 2. Large Arched Warehouse Windows (Neutral, Moody Monochrome Glass - Never Blinding!)
        const windowPositions = [w * 0.22, w * 0.50, w * 0.78];
        const winW = w * 0.18;
        const winH = h * 0.48;
        const winTop = h * 0.12;

        windowPositions.forEach(winX => {
            const left = winX - winW / 2;
            const right = winX + winW / 2;
            const archR = winW / 2;

            // Neutral Muted Foggy/Overcast Window Pane Interior
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(left, winTop + archR);
            ctx.arc(winX, winTop + archR, archR, Math.PI, 0, false);
            ctx.lineTo(right, winTop + winH);
            ctx.lineTo(left, winTop + winH);
            ctx.closePath();
            ctx.clip();

            const winGrad = ctx.createLinearGradient(0, winTop, 0, winTop + winH);
            winGrad.addColorStop(0, '#2b323c');
            winGrad.addColorStop(0.5, '#20262e');
            winGrad.addColorStop(1, '#161a20');
            ctx.fillStyle = winGrad;
            ctx.fillRect(left - 4, winTop, winW + 8, winH + 4);

            // Subtle dark silhouette of distant factory roof outside
            ctx.fillStyle = '#14181f';
            ctx.fillRect(left, winTop + winH - 12, winW, 12);
            ctx.restore();

            // Heavy Iron Window Frame & Mullions (Dark Charcoal)
            ctx.strokeStyle = '#0a0c0f';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(left, winTop + archR);
            ctx.arc(winX, winTop + archR, archR, Math.PI, 0, false);
            ctx.lineTo(right, winTop + winH);
            ctx.lineTo(left, winTop + winH);
            ctx.closePath();
            ctx.stroke();

            // Panes grid (2 vertical mullions, 4 horizontal)
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = '#0e1115';
            const colStep = winW / 3;
            for (let c = 1; c < 3; ++c) {
                ctx.beginPath();
                ctx.moveTo(left + c * colStep, winTop + 4);
                ctx.lineTo(left + c * colStep, winTop + winH);
                ctx.stroke();
            }
            const rowStep = winH / 5;
            for (let r = 1; r < 5; ++r) {
                ctx.beginPath();
                ctx.moveTo(left, winTop + r * rowStep);
                ctx.lineTo(right, winTop + r * rowStep);
                ctx.stroke();
            }

            // Extremely Subtle & Gentle Atmospheric Light Shaft (Does not blow out foreground)
            const beamGrad = ctx.createLinearGradient(winX, winTop + archR, winX + 35, winTop + winH + 45);
            beamGrad.addColorStop(0, 'rgba(180, 200, 225, 0.05)');
            beamGrad.addColorStop(1, 'rgba(180, 200, 225, 0.0)');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(left, winTop + archR);
            ctx.lineTo(right, winTop + archR);
            ctx.lineTo(right + 35, winTop + winH + 45);
            ctx.lineTo(left + 20, winTop + winH + 45);
            ctx.closePath();
            ctx.fill();
        });

        // 3. Vaulted Wooden/Steel Roof Trusses & Structural Columns (Dark Charcoal/Graphite)
        ctx.fillStyle = '#0f1114';
        // Massive vertical timber support posts
        ctx.fillRect(0, 0, 16, h);
        ctx.fillRect(w - 16, 0, 16, h);

        // Horizontal structural tie beams
        ctx.fillStyle = '#16191f';
        ctx.fillRect(0, h * 0.08, w, 9);
        ctx.fillRect(0, h * 0.02, w, 7);

        // Angled timber rafters & cross-struts
        ctx.strokeStyle = '#1b1f26';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.08); ctx.lineTo(w * 0.25, 0); ctx.lineTo(w * 0.5, h * 0.08);
        ctx.moveTo(w * 0.5, h * 0.08); ctx.lineTo(w * 0.75, 0); ctx.lineTo(w, h * 0.08);
        ctx.moveTo(w * 0.25, 0); ctx.lineTo(w * 0.25, h * 0.08);
        ctx.moveTo(w * 0.75, 0); ctx.lineTo(w * 0.75, h * 0.08);
        ctx.stroke();

        // 4. Exposed Industrial Pipes & Wall Conduits (Muted Slate / Gunmetal)
        // Muted Coolant Pipe
        ctx.fillStyle = '#1e3848';
        ctx.fillRect(0, h * 0.58, w, 3);
        ctx.fillStyle = '#2d536b';
        ctx.fillRect(0, h * 0.58, w, 1);
        // Muted Steam Pipe
        ctx.fillStyle = '#3a2024';
        ctx.fillRect(0, h * 0.64, w, 3.5);

        // 5. Hanging Pendant Dome Lamps & Soft Subtle Light Cones
        const lampPositions = [
            { x: w * 0.35, y: h * 0.24 },
            { x: w * 0.65, y: h * 0.24 }
        ];

        lampPositions.forEach(lamp => {
            // Cord
            ctx.strokeStyle = '#08090c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(lamp.x, h * 0.08);
            ctx.lineTo(lamp.x, lamp.y);
            ctx.stroke();

            // Lamp Dome Fixture (Dark Slate Enamel)
            ctx.fillStyle = '#13181d';
            ctx.beginPath();
            ctx.arc(lamp.x, lamp.y + 4, 9, Math.PI, 0, false);
            ctx.closePath();
            ctx.fill();

            // Subtle Dim Filament Bulb
            ctx.fillStyle = '#e2d499';
            ctx.beginPath();
            ctx.arc(lamp.x, lamp.y + 5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Soft Ambient Conical Light Pool
            const coneGrad = ctx.createRadialGradient(lamp.x, lamp.y + 6, 4, lamp.x, lamp.y + 45, 60);
            coneGrad.addColorStop(0, 'rgba(230, 215, 160, 0.08)');
            coneGrad.addColorStop(0.6, 'rgba(200, 180, 120, 0.03)');
            coneGrad.addColorStop(1, 'rgba(150, 140, 100, 0.0)');
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(lamp.x - 6, lamp.y + 6);
            ctx.lineTo(lamp.x + 6, lamp.y + 6);
            ctx.lineTo(lamp.x + 45, h);
            ctx.lineTo(lamp.x - 45, h);
            ctx.closePath();
            ctx.fill();
        });

        // 6. Overfill Emergency Alarm & Bulging Paperclips if high production (2.5 Million clips / 2.5 Tons)
        if (state && state.lifetimeClips && state.lifetimeClips.gte(new BigDouble(2.5, 6))) {
            // Flashing Red Emergency Siren on Center Tie-Beam
            const sirenFlash = Math.sin(time * 12) > 0;
            ctx.fillStyle = sirenFlash ? '#ff0033' : '#4a0515';
            ctx.fillRect(w * 0.5 - 4, h * 0.08 - 7, 8, 7);

            if (sirenFlash) {
                const sirenGrad = ctx.createRadialGradient(w * 0.5, h * 0.08 - 4, 2, w * 0.5, h * 0.08 + 30, 70);
                sirenGrad.addColorStop(0, 'rgba(255, 0, 50, 0.35)');
                sirenGrad.addColorStop(1, 'rgba(255, 0, 50, 0.0)');
                ctx.fillStyle = sirenGrad;
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.08 + 15, 60, 0, Math.PI * 2);
                ctx.fill();
            }

            // Piles of overflowing paperclip wire bulging in the corners
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.quadraticCurveTo(w * 0.12, h - 25, w * 0.22, h);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(w * 0.78, h);
            ctx.quadraticCurveTo(w * 0.88, h - 28, w, h);
            ctx.closePath();
            ctx.fill();
        }

        // 7. Workshop Machinery / Isometric Floor Overlay
        this.renderFactoryFloor(ctx, state);
    }

    // =========================================================================
    // SCENE 1: FACTORY IN TOWN (Muted Slate/Monochrome Dusk Townscape with Blown Doors)
    // =========================================================================
    renderFactoryTownVector(ctx, w, h, time, state) {
        // 1. Dark Muted Slate Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
        skyGrad.addColorStop(0, '#0e1117');
        skyGrad.addColorStop(0.5, '#181d26');
        skyGrad.addColorStop(1, '#252d3b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant Mountain Ridges (Dark Graphite Silhouettes)
        ctx.fillStyle = '#141820';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.52);
        ctx.lineTo(w * 0.15, h * 0.44);
        ctx.lineTo(w * 0.32, h * 0.50);
        ctx.lineTo(w * 0.55, h * 0.42);
        ctx.lineTo(w * 0.78, h * 0.49);
        ctx.lineTo(w, h * 0.43);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // 2. Rolling Hills (Muted Dark Slate/Green)
        ctx.fillStyle = '#131c19';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.56);
        ctx.quadraticCurveTo(w * 0.25, h * 0.50, w * 0.55, h * 0.58);
        ctx.quadraticCurveTo(w * 0.8, h * 0.65, w, h * 0.54);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#1a2420';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.64);
        ctx.quadraticCurveTo(w * 0.35, h * 0.58, w * 0.7, h * 0.67);
        ctx.quadraticCurveTo(w * 0.88, h * 0.72, w, h * 0.63);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Pine Tree Silhouettes
        ctx.fillStyle = '#0f1714';
        for (let tx = 8; tx < w * 0.35; tx += 9) {
            ctx.beginPath();
            ctx.moveTo(tx, h * 0.58);
            ctx.lineTo(tx + 4, h * 0.58 - 10);
            ctx.lineTo(tx + 8, h * 0.58);
            ctx.closePath();
            ctx.fill();
        }

        // 3. Quaint Townscape & Mayor Higgins' Town Hall (Left & Center)
        const townX = w * 0.06;
        const townY = h * 0.56;

        // Mayor Higgins' Town Hall with Clock Tower
        ctx.fillStyle = '#121720';
        ctx.fillRect(townX + 2, townY - 28, 26, 28);
        ctx.fillStyle = '#1c2432';
        ctx.fillRect(townX + 8, townY - 42, 14, 14);
        // Clock face
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.arc(townX + 15, townY - 35, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Zoning Citation Sign
        ctx.fillStyle = '#ff2a85';
        ctx.fillRect(townX - 2, townY - 14, 6, 8);

        // Church Spire
        ctx.fillStyle = '#10141a';
        ctx.fillRect(townX + 38, townY - 24, 10, 24);
        ctx.beginPath();
        ctx.moveTo(townX + 37, townY - 24);
        ctx.lineTo(townX + 43, townY - 42);
        ctx.lineTo(townX + 49, townY - 24);
        ctx.closePath();
        ctx.fill();

        // Cottages & Houses
        for (let i = 0; i < 3; ++i) {
            const hx = townX + 54 + i * 16;
            const hy = townY + (i % 2) * 4;
            const hw = 13;
            const hh = 12;

            ctx.fillStyle = '#151921';
            ctx.fillRect(hx, hy - hh, hw, hh);

            // Pitched Roof
            ctx.fillStyle = '#1d232e';
            ctx.beginPath();
            ctx.moveTo(hx - 2, hy - hh);
            ctx.lineTo(hx + hw / 2, hy - hh - 6);
            ctx.lineTo(hx + hw + 2, hy - hh);
            ctx.closePath();
            ctx.fill();

            // Subtle Dim Window
            ctx.fillStyle = '#cbb87a';
            ctx.fillRect(hx + 3, hy - hh + 4, 3, 3);
        }

        // Chief O'Malley's Police Cruiser Blockade
        const copX = w * 0.44;
        const copY = h * 0.72;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(copX, copY, 18, 7);
        ctx.fillStyle = '#334155';
        ctx.fillRect(copX + 3, copY - 4, 12, 4);
        // Flashing Emergency Lightbar (Red Left, Blue Right)
        const copFlash = Math.sin(time * 10) > 0;
        ctx.fillStyle = copFlash ? '#ff0033' : '#1e3a8a';
        ctx.fillRect(copX + 4, copY - 6, 4, 2);
        ctx.fillStyle = copFlash ? '#1e3a8a' : '#00f0ff';
        ctx.fillRect(copX + 10, copY - 6, 4, 2);

        // 4. Standalone Factory Complex with Blown Open Double Doors
        const facX = w * 0.55;
        const facY = h * 0.52;
        const facW = w * 0.42;
        const facH = h * 0.32;

        ctx.fillStyle = '#26282e';
        ctx.fillRect(facX, facY, facW, facH);

        // Saw-Tooth Roof
        ctx.fillStyle = '#1b1d22';
        const teeth = 3;
        const toothW = facW / teeth;
        for (let t = 0; t < teeth; ++t) {
            const tx = facX + t * toothW;
            ctx.beginPath();
            ctx.moveTo(tx, facY);
            ctx.lineTo(tx + toothW * 0.85, facY - 14);
            ctx.lineTo(tx + toothW, facY);
            ctx.closePath();
            ctx.fill();

            // Muted skylight
            ctx.fillStyle = '#313a48';
            ctx.beginPath();
            ctx.moveTo(tx + toothW * 0.15, facY);
            ctx.lineTo(tx + toothW * 0.80, facY - 12);
            ctx.lineTo(tx + toothW * 0.85, facY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#1b1d22';
        }

        // Factory Windows (Dim amber)
        ctx.fillStyle = '#cbb87a';
        for (let wy = facY + 8; wy < facY + facH - 18; wy += 10) {
            for (let wx = facX + 8; wx < facX + facW - 12; wx += 14) {
                ctx.fillRect(wx, wy, 8, 5);
            }
        }

        // Blown-Open Factory Doors & Silver Paperclip Spillage Torrent
        const doorX = facX + 10;
        const doorY = facY + facH - 18;
        const doorW = 20;
        const doorH = 18;

        // Dark gaping doorway interior
        ctx.fillStyle = '#06080c';
        ctx.fillRect(doorX, doorY, doorW, doorH);

        // Bent/blown open door panels dangling outward
        ctx.fillStyle = '#475569';
        ctx.save();
        ctx.translate(doorX - 2, doorY + doorH);
        ctx.rotate(-0.4);
        ctx.fillRect(0, -doorH, 4, doorH);
        ctx.restore();

        ctx.save();
        ctx.translate(doorX + doorW + 2, doorY + doorH);
        ctx.rotate(0.4);
        ctx.fillRect(-4, -doorH, 4, doorH);
        ctx.restore();

        // Gleaming River / Cascade of Paperclips pouring from the factory into the town road
        const streamGrad = ctx.createLinearGradient(doorX + 10, doorY + 6, w * 0.1, h);
        streamGrad.addColorStop(0, '#e2e8f0');
        streamGrad.addColorStop(0.3, '#94a3b8');
        streamGrad.addColorStop(1, '#475569');
        ctx.fillStyle = streamGrad;
        ctx.beginPath();
        ctx.moveTo(doorX + 2, doorY + 8);
        ctx.lineTo(doorX + doorW - 2, doorY + 8);
        ctx.quadraticCurveTo(doorX - 20, h * 0.75, 0, h * 0.88);
        ctx.lineTo(0, h);
        ctx.lineTo(doorX + 40, h);
        ctx.quadraticCurveTo(doorX + 15, h * 0.80, doorX + doorW - 2, doorY + 8);
        ctx.closePath();
        ctx.fill();

        // Smokestacks
        const st1X = facX + facW * 0.35;
        const st2X = facX + facW * 0.75;
        ctx.fillStyle = '#1d1f24';
        ctx.fillRect(st1X - 5, facY - 38, 10, 38);
        ctx.fillRect(st2X - 4, facY - 26, 8, 26);
        ctx.fillStyle = '#0f1114';
        ctx.fillRect(st1X - 7, facY - 40, 14, 3);
        ctx.fillRect(st2X - 5, facY - 28, 10, 3);

        // Muted Steam Plumes
        this.renderSmokePlume(ctx, st1X, facY - 40, time, 1.0);
        this.renderSmokePlume(ctx, st2X, facY - 28, time + 1.5, 0.75);

        // Big Cartoon Paperclip Hologram
        this.drawCartoonPaperclip(ctx, w / 2, h * 0.28, 0.85 * this.heroRecoil, this.heroRotation + time * 0.35);
    }

    renderSmokePlume(ctx, x, y, time, scale = 1.0) {
        ctx.fillStyle = 'rgba(160, 175, 195, 0.28)';
        for (let i = 0; i < 5; ++i) {
            const phase = (time * 1.5 + i * 0.8) % 4.0;
            const px = x + phase * (12 * scale) + Math.sin(phase * 2) * 3;
            const py = y - phase * (14 * scale);
            const r = (4 + phase * 3.5) * scale;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // =========================================================================
    // SCENE 2: INDUSTRIAL MEGACITY (Noir Metropolis & President's Tower Deconstruction)
    // =========================================================================
    renderCityMetropolisVector(ctx, w, h, time, state) {
        // 1. Dark Blueprint/Noir Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#090b10');
        skyGrad.addColorStop(0.5, '#121620');
        skyGrad.addColorStop(1, '#1e2433');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Distant Skyline Silhouettes (Layer 1)
        ctx.fillStyle = '#0f1219';
        const numBgTowers = 12;
        const bgStep = w / numBgTowers;
        for (let i = 0; i < numBgTowers; ++i) {
            const bx = i * bgStep;
            const bh = 35 + ((i * 37) % 45);
            ctx.fillRect(bx, h * 0.62 - bh, bgStep + 2, bh);

            // Red warning beacon
            if (i % 3 === 0 && Math.sin(time * 4 + i) > 0) {
                ctx.fillStyle = '#e11d48';
                ctx.fillRect(bx + bgStep / 2 - 1, h * 0.62 - bh - 13, 2, 2);
                ctx.fillStyle = '#0f1219';
            }
        }

        // 3. Midground Skyscrapers (Layer 2 - Dark Slate / Charcoal)
        const numMidTowers = 8;
        const midStep = w / numMidTowers;
        for (let i = 0; i < numMidTowers; ++i) {
            const mx = i * midStep + 4;
            const mw = midStep - 6;
            const mh = 50 + ((i * 43) % 55);
            const my = h * 0.68 - mh;

            ctx.fillStyle = (i % 2 === 0) ? '#171c26' : '#131720';
            ctx.fillRect(mx, my, mw, mh);

            // Subtle Dim Window Arrays
            for (let wy = my + 6; wy < my + mh - 8; wy += 6) {
                for (let wx = mx + 4; wx < mx + mw - 4; wx += 5) {
                    if ((wx * 17 + wy * 31) % 4 !== 0) {
                        ctx.fillStyle = ((wx + wy) % 3 === 0) ? '#5c697e' : '#334155';
                        ctx.fillRect(wx, wy, 2.5, 3);
                    }
                }
            }
        }

        // 4. Golden Trump Tower Parody (Being converted into cyan wire lattice)
        const trX = w * 0.22;
        const trW = 28;
        const trH = 75;
        const trY = h * 0.68 - trH;

        ctx.fillStyle = '#997300';
        ctx.fillRect(trX, trY, trW, trH);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(trX + 3, trY + 3, trW - 6, trH - 6);

        // Animated Cyan Wire Deconstruction Grid across the tower
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        for (let y = trY + 6; y < trY + trH - 6; y += 8) {
            ctx.beginPath();
            ctx.moveTo(trX + 3, y);
            ctx.lineTo(trX + trW - 3, y + Math.sin(time * 6 + y) * 2);
            ctx.stroke();
        }

        // 5. TV News Broadcast Antenna Tower with 500% Tariff Radio Waves
        const antX = w * 0.72;
        const antY = h * 0.68 - 65;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(antX - 8, h * 0.68); ctx.lineTo(antX, antY); ctx.lineTo(antX + 8, h * 0.68);
        ctx.stroke();

        // Pulsing Broadcast Waves
        const waveRadius = ((time * 25) % 35);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(antX, antY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Cooling Towers
        const ctX = w * 0.88;
        const ctY = h * 0.68;
        ctx.fillStyle = '#1c222e';
        ctx.beginPath();
        ctx.moveTo(ctX - 16, ctY);
        ctx.quadraticCurveTo(ctX - 10, ctY - 20, ctX - 12, ctY - 32);
        ctx.lineTo(ctX + 12, ctY - 32);
        ctx.quadraticCurveTo(ctX + 10, ctY - 20, ctX + 16, ctY);
        ctx.closePath();
        ctx.fill();

        this.renderSmokePlume(ctx, ctX, ctY - 34, time * 0.8, 1.2);

        // 6. Foreground Monorail & Highway
        const monoY = h * 0.62;
        ctx.strokeStyle = '#0a0c10';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, monoY);
        ctx.lineTo(w, monoY);
        ctx.stroke();

        // Speeding Train Light
        const trainX = (time * 90) % (w + 60) - 40;
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(trainX, monoY - 5, 28, 4);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(trainX + 22, monoY - 4, 5, 2);

        // Highway Light Streaks
        const hwyY = h * 0.72;
        ctx.fillStyle = '#0d1017';
        ctx.fillRect(0, hwyY, w, 12);
        ctx.strokeStyle = '#857240';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, hwyY + 3); ctx.lineTo(w, hwyY + 3);
        ctx.stroke();
        ctx.strokeStyle = '#883344';
        ctx.beginPath();
        ctx.moveTo(0, hwyY + 8); ctx.lineTo(w, hwyY + 8);
        ctx.stroke();

        // Hologram Hero Paperclip
        this.drawCartoonPaperclip(ctx, w / 2, h * 0.32, 0.85 * this.heroRecoil, this.heroRotation + time * 0.35);
    }

    // =========================================================================
    // SCENE 3: PLANETARY EARTH & ORBITAL RING (Muted Navy/Slate Celestial Body)
    // =========================================================================
    renderPlanetaryEarthVector(ctx, w, h, time, state) {
        this.renderSpaceBackdrop(ctx, w, h, '#060810', '#020306');

        const centerX = w / 2;
        const centerY = h / 2 - 8;
        const radius = Math.min(w, h) * 0.28;

        // Subtle Atmospheric Rim Glow
        const atmGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.3);
        atmGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        atmGrad.addColorStop(0.6, 'rgba(0, 180, 255, 0.06)');
        atmGrad.addColorStop(1, 'rgba(0, 100, 255, 0.0)');
        ctx.fillStyle = atmGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Planet Earth Sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        // Muted Navy Ocean Base
        const oceanGrad = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 4, centerX, centerY, radius);
        oceanGrad.addColorStop(0, '#10223a');
        oceanGrad.addColorStop(0.7, '#0a1524');
        oceanGrad.addColorStop(1, '#040910');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

        // Muted Continents with Glowing Cyber-Veins
        const rot = time * 0.35;
        for (let i = 0; i < 7; ++i) {
            const angle = rot + (i * Math.PI * 2 / 7);
            const cx = centerX + Math.cos(angle) * (radius * 0.7);
            const cy = centerY + Math.sin(angle * 1.2) * (radius * 0.5);

            // Muted Slate-Green Landmass
            ctx.fillStyle = '#16332a';
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.32, 0, Math.PI * 2);
            ctx.fill();

            // High-Contrast Neon Cyan & Gold Cyber-Veins
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 14, cy - 6);
            ctx.lineTo(cx, cy + 4);
            ctx.lineTo(cx + 12, cy - 8);
            ctx.lineTo(cx + 18, cy + 6);
            ctx.stroke();

            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy + 10);
            ctx.lineTo(cx + 8, cy + 8);
            ctx.stroke();
        }
        ctx.restore();

        // Equatorial Orbital Railgun Ring
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.camYaw + 0.3);
        ctx.scale(1, 0.32);

        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.52, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.46, 0, Math.PI * 2);
        ctx.stroke();

        for (let k = 0; k < 6; ++k) {
            const pAngle = (time * 2.5 + k * (Math.PI * 2 / 6)) % (Math.PI * 2);
            const px = Math.cos(pAngle) * (radius * 1.52);
            const py = Math.sin(pAngle) * (radius * 1.52);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
        }
        ctx.restore();
    }

    // =========================================================================
    // SCENE 4: SOLAR DYSON SWARM & STAR SIPHON (Deep Space & Amber/Gold Corona)
    // =========================================================================
    renderSolarDysonVector(ctx, w, h, time, state) {
        this.renderSpaceBackdrop(ctx, w, h, '#140c06', '#050301');

        const centerX = w / 2;
        const centerY = h / 2 - 8;
        const sunR = Math.min(w, h) * 0.22;

        // Subdued Solar Corona Glow
        const coronaGrad = ctx.createRadialGradient(centerX, centerY, sunR * 0.8, centerX, centerY, sunR * 2.4);
        coronaGrad.addColorStop(0, 'rgba(255, 180, 0, 0.28)');
        coronaGrad.addColorStop(0.4, 'rgba(180, 70, 0, 0.12)');
        coronaGrad.addColorStop(1, 'rgba(80, 0, 0, 0.0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunR * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Muted Amber-Charcoal Photosphere (Keeps central contrast clean)
        const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunR);
        sunGrad.addColorStop(0, '#fef08a');
        sunGrad.addColorStop(0.35, '#d97706');
        sunGrad.addColorStop(0.8, '#782d08');
        sunGrad.addColorStop(1, '#3b1204');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Concentric Golden Dyson Swarm Rings
        const rings = [
            { r: sunR * 1.5, tilt: 0.35, speed: 1.0, color: '#ffe600', nodes: 8 },
            { r: sunR * 1.9, tilt: -0.45, speed: -0.7, color: '#00f0ff', nodes: 10 },
            { r: sunR * 2.3, tilt: 0.20, speed: 0.5, color: '#ff2a85', nodes: 12 }
        ];

        rings.forEach(cfg => {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(this.camYaw + cfg.tilt);
            ctx.scale(1, Math.abs(cfg.tilt) + 0.22);

            ctx.strokeStyle = 'rgba(255, 230, 0, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, cfg.r, 0, Math.PI * 2);
            ctx.stroke();

            for (let n = 0; n < cfg.nodes; ++n) {
                const a = time * cfg.speed + (n * (Math.PI * 2 / cfg.nodes));
                const nx = Math.cos(a) * cfg.r;
                const ny = Math.sin(a) * cfg.r;
                ctx.fillStyle = cfg.color;
                ctx.fillRect(nx - 3, ny - 3, 6, 6);
            }
            ctx.restore();
        });

        // Plasma Siphon Funnel
        const sAngle = time * 0.7;
        const siphonStartX = centerX + Math.cos(sAngle) * (sunR * 0.9);
        const siphonStartY = centerY + Math.sin(sAngle) * (sunR * 0.9);
        const siphonEndNodeX = centerX + Math.cos(sAngle + 0.6) * (sunR * 2.1);
        const siphonEndNodeY = centerY + Math.sin(sAngle + 0.6) * (sunR * 2.1);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(siphonStartX, siphonStartY);
        ctx.quadraticCurveTo(centerX + Math.cos(sAngle + 0.3) * (sunR * 1.7), centerY + Math.sin(sAngle + 0.3) * (sunR * 1.7), siphonEndNodeX, siphonEndNodeY);
        ctx.stroke();
    }

    // =========================================================================
    // SCENE 5: GALACTIC PENROSE DYNAMO (Deep Void & Violet Energy Jets)
    // =========================================================================
    renderGalacticPenroseVector(ctx, w, h, time, state) {
        this.renderSpaceBackdrop(ctx, w, h, '#0f0517', '#030105');

        const centerX = w / 2;
        const centerY = h / 2 - 8;
        const bhR = Math.min(w, h) * 0.16;

        // Relativistic Accretion Disk
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.camYaw - 0.25);
        ctx.scale(1, 0.36);

        for (let r = bhR * 1.2; r < bhR * 3.2; r += 4.5) {
            const diskGrad = ctx.createLinearGradient(-r, 0, r, 0);
            diskGrad.addColorStop(0, '#00f0ff');
            diskGrad.addColorStop(0.4, '#7c3aed');
            diskGrad.addColorStop(1, '#db2777');

            ctx.strokeStyle = diskGrad;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, r, time * 1.2, time * 1.2 + Math.PI * 1.6);
            ctx.stroke();
        }
        ctx.restore();

        // Event Horizon
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, bhR, 0, Math.PI * 2);
        ctx.fill();

        // Einstein Ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bhR * 1.08, 0, Math.PI * 2);
        ctx.stroke();

        // Violet Relativistic Jets
        const jetGrad = ctx.createLinearGradient(0, centerY - bhR * 0.8, 0, 0);
        jetGrad.addColorStop(0, '#ffffff');
        jetGrad.addColorStop(0.3, '#a855f7');
        jetGrad.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
        ctx.strokeStyle = jetGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - bhR * 0.8);
        ctx.lineTo(centerX, 0);
        ctx.stroke();

        const jetGradBottom = ctx.createLinearGradient(0, centerY + bhR * 0.8, 0, h);
        jetGradBottom.addColorStop(0, '#ffffff');
        jetGradBottom.addColorStop(0.3, '#a855f7');
        jetGradBottom.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
        ctx.strokeStyle = jetGradBottom;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + bhR * 0.8);
        ctx.lineTo(centerX, h);
        ctx.stroke();
    }

    // =========================================================================
    // SCENE 6: 11D MULTIVERSE QUANTUM FOAM (Translucent Timeline Bubbles)
    // =========================================================================
    render11DMultiverseVector(ctx, w, h, time, state) {
        this.renderSpaceBackdrop(ctx, w, h, '#08101a', '#020408');

        const centerX = w / 2;
        const centerY = h / 2 - 8;

        const bubbles = [
            { x: -w * 0.28, y: -h * 0.22, r: 24, color: 'rgba(219, 39, 119, 0.30)', border: '#db2777' },
            { x:  w * 0.26, y: -h * 0.25, r: 28, color: 'rgba(6, 182, 212, 0.30)',   border: '#06b6d4' },
            { x: -w * 0.22, y:  h * 0.24, r: 25, color: 'rgba(16, 185, 129, 0.30)',  border: '#10b981' },
            { x:  w * 0.27, y:  h * 0.26, r: 30, color: 'rgba(147, 51, 234, 0.30)',  border: '#9333ea' }
        ];

        bubbles.forEach(b => {
            const bx = centerX + b.x + Math.sin(time * 0.8 + b.r) * 8;
            const by = centerY + b.y + Math.cos(time * 0.8 + b.r) * 8;

            ctx.fillStyle = b.color;
            ctx.strokeStyle = b.border;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(bx, by, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bx, by, b.r * 0.5, time, time + Math.PI);
            ctx.stroke();
        });

        // Central Polished Chrome Universe
        const masterR = Math.min(w, h) * 0.18;
        const chromeGrad = ctx.createLinearGradient(centerX - masterR, centerY - masterR, centerX + masterR, centerY + masterR);
        chromeGrad.addColorStop(0, '#ffffff');
        chromeGrad.addColorStop(0.3, '#cbd5e1');
        chromeGrad.addColorStop(0.7, '#64748b');
        chromeGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = chromeGrad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, masterR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 4D Tesseract Wireframe
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.5);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;

        const sOuter = masterR * 1.5;
        const sInner = masterR * 0.75 + Math.sin(time * 2) * 8;

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

    renderSpaceBackdrop(ctx, w, h, topColor, botColor) {
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.75);
        bgGrad.addColorStop(0, topColor);
        bgGrad.addColorStop(1, botColor);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

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

    // =========================================================================
    // HERO PAPERCLIP & CENTERPIECE OVERLAYS
    // =========================================================================
    renderFactoryFloor(ctx, state) {
        const time = this.cosmicRotation;

        // Center Hero Hologram Paperclip (High-Contrast Shadow Backing)
        this.drawCartoonPaperclip(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2 - 12, 0.9 * this.heroRecoil, this.heroRotation + time * 0.4);
    }

    // =========================================================================
    // DYNAMIC PAPERCLIP FLUID & MOUNTAIN RENDERER
    // =========================================================================
    renderFlowingPaperclipSea(ctx, w, h) {
        const floorY = h - 2;
        let maxPile = 0;
        for (let i = 0; i < this.numColumns; ++i) {
            const currentH = this.pileHeights[i] + this.waveOffsets[i];
            if (currentH > maxPile) maxPile = currentH;
        }

        const colWidth = w / (this.numColumns - 1);
        if (maxPile > 0.5) {
            const fluidGrad = ctx.createLinearGradient(0, floorY - maxPile, 0, h);
            fluidGrad.addColorStop(0, '#1e293b');
            fluidGrad.addColorStop(0.3, '#141e2e');
            fluidGrad.addColorStop(1, '#0b121e');

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

            // Overlapping Vibrant Paperclip Textures scaled by stage zoom
            const palette = ['#00f0ff', '#ffe600', '#ffffff', '#ff2a85', '#00ff88', '#ff7700', '#a855f7', '#38bdf8'];
            const getHash = (col, row, salt = 0) => {
                let h = ((col * 374761393 + row * 668265263 + salt * 1013904223) ^ 0x5bf03635) >>> 0;
                h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
                return (h ^ (h >>> 16)) >>> 0;
            };

            // Stage-dependent zoom configurations: as the scale expands, paperclips render finer and smaller
            const tierConfigs = [
                { stepX: 6.0, stepY: 5.0, baseSize: 3.4, sizeVar: 1.4 },  // Tier 0: Factory Interior (close-up)
                { stepX: 4.6, stepY: 3.8, baseSize: 2.4, sizeVar: 1.0 },  // Tier 1: Factory Town
                { stepX: 3.6, stepY: 3.0, baseSize: 1.7, sizeVar: 0.7 },  // Tier 2: Industrial Megacity
                { stepX: 2.8, stepY: 2.3, baseSize: 1.2, sizeVar: 0.5 },  // Tier 3: Planetary Earth
                { stepX: 2.2, stepY: 1.8, baseSize: 0.85, sizeVar: 0.35 },// Tier 4: Solar Dyson Swarm
                { stepX: 1.7, stepY: 1.4, baseSize: 0.60, sizeVar: 0.25 },// Tier 5: Galactic Penrose
                { stepX: 1.3, stepY: 1.1, baseSize: 0.42, sizeVar: 0.18 } // Tier 6: 11D Multiverse
            ];
            const tierCfg = tierConfigs[Math.max(0, Math.min(6, this.tier))] || tierConfigs[0];

            const stepX = tierCfg.stepX;
            const stepY = tierCfg.stepY;
            const numCols = Math.floor((w - 6) / stepX);

            for (let c = 0; c < numCols; ++c) {
                const fx = 3 + c * stepX;
                const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((fx / w) * this.numColumns)));
                const moundH = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
                if (moundH > 1.0) {
                    const topY = floorY - moundH;
                    const maxRows = Math.ceil(moundH / stepY);
                    const dir = (c < numCols / 2) ? -1.0 : 1.0;

                    for (let r = 0; r < maxRows; ++r) {
                        const fy = floorY - 2.5 - (r * stepY);
                        if (fy < topY) break;

                        const jitterX = (((getHash(c, r, 2) % 1000) / 1000.0) - 0.5) * (stepX * 0.9);
                        const jitterY = (((getHash(c, r, 3) % 1000) / 1000.0) - 0.5) * (stepY * 0.7);
                        const depthFactor = Math.min(1.0, (r + 1) / Math.max(1, maxRows));

                        const flowX = dir * Math.sin(this.internalFlowPhase + r * 0.35 + c * 0.15) * (1.6 * depthFactor);
                        const flowY = Math.cos(this.internalFlowPhase * 0.7 + c * 0.2) * (0.6 * depthFactor);
                        const flowRot = dir * Math.sin(this.internalFlowPhase + (getHash(c, r, 0) % 10)) * 0.15 * depthFactor;

                        const sinkDx = (w / 2) - fx;
                        const sinkDy = floorY - fy;
                        const sinkDist = Math.sqrt(sinkDx * sinkDx + sinkDy * sinkDy) + 12.0;
                        const sinkDirX = sinkDx / sinkDist;
                        const sinkDirY = sinkDy / sinkDist;

                        const sinkEffect = (this.drainFlowIntensity / 3.0) * Math.max(0.2, 1.0 - (sinkDist / (w * 0.75)));
                        const sinkPullX = sinkDirX * sinkEffect * 3.5 * Math.sin(this.drainFlowPhase + r * 0.35);
                        const sinkPullY = sinkDirY * sinkEffect * 2.8 * Math.cos(this.drainFlowPhase * 0.85 + c * 0.2);
                        const sinkTorque = Math.sin(this.drainFlowPhase + sinkDist * 0.12) * 0.35 * sinkEffect;

                        const px = fx + jitterX + flowX + sinkPullX;
                        const py = fy + jitterY + flowY + sinkPullY;

                        const baseRot = ((getHash(c, r, 1) % 6283) / 1000.0);
                        const rot = baseRot + flowRot + sinkTorque;
                        const size = tierCfg.baseSize + ((getHash(c, r, 4) % 1000) / 1000.0) * tierCfg.sizeVar;
                        const color = palette[getHash(c, r, 5) % palette.length];

                        this.drawTinyPaperclip(ctx, px, py, size, rot, color);
                    }
                }
            }
        }
    }

    renderDrainingPaperclips(ctx) {
        const tierScale = this.getTierScale();
        this.drainingClips.forEach(p => {
            const alpha = p.alpha !== undefined ? p.alpha : 0.6;
            if (alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(0.4, 1.2 * tierScale);
            ctx.beginPath();
            ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.0);
            ctx.quadraticCurveTo(p.x - p.vx, p.y - p.vy * 0.5, p.x, p.y);
            ctx.stroke();

            const clipSize = (p.size || 4.5) * tierScale;
            this.drawTinyPaperclip(ctx, p.x, p.y, clipSize, p.rot, p.color);
            ctx.restore();
        });
    }

    renderFallingPaperclips(ctx) {
        const tierScale = this.getTierScale();
        this.fallingClips.forEach(p => {
            const clipSize = (p.size || 4.5) * tierScale;
            this.drawTinyPaperclip(ctx, p.x, p.y, clipSize, p.rot, p.color);
        });
    }

    drawTinyPaperclip(ctx, x, y, size = 6, rot = 0, color = '#ffffff') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.45, Math.min(1.2, size * 0.28));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const s = Math.max(0.1, size / 6);
        ctx.beginPath();
        ctx.moveTo(-2 * s, 3 * s);
        ctx.lineTo(-2 * s, -3 * s);
        ctx.arc(0, -3 * s, 2 * s, Math.PI, 0, false);
        ctx.lineTo(2 * s, 3.5 * s);
        ctx.arc(0, 3.5 * s, 2 * s, 0, Math.PI, false);
        ctx.lineTo(-0.8 * s, -1.5 * s);
        ctx.arc(0, -1.5 * s, 0.8 * s, Math.PI, 0, false);
        ctx.lineTo(0.8 * s, 1.8 * s);
        ctx.stroke();

        ctx.restore();
    }

    // High-Contrast Cartoon Paperclip Hologram with Dark Outlines for Crystal-Clear Visibility
    drawCartoonPaperclip(ctx, x, y, scale = 1.0, rotation = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // 1. Dark Shadow / Backing Stroke (Guarantees Razor-Sharp Readability Against Windows or Any Background)
        ctx.strokeStyle = '#05030a';
        ctx.lineWidth = 8;
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

        // 2. Vibrant Glowing Neon Cyan Body
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
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

        // 3. Crisp Inner White Specular Highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 16);
        ctx.lineTo(-10, -18);
        ctx.arc(0, -20, 10, Math.PI, Math.PI * 1.5, false);
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // FALLING FLUID CASCADE STREAMS & WATERFALL SIMULATION
    // Drifts in as paperclip volume scales up into millions/billions/cosmic rates
    // =========================================================================
    renderFallingFluidStreams(ctx, w, h) {
        if (this.fluidStreamIntensity <= 0.01) return;

        const floorY = h - 2;
        const intensity = this.fluidStreamIntensity;

        ctx.save();

        this.fluidStreamChannels.forEach((ch, idx) => {
            const streamCenterX = ch.relX * w;
            const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((streamCenterX / w) * this.numColumns)));
            const moundH = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
            const impactY = Math.min(h, Math.max(10, floorY - moundH));
            const streamWidth = ch.width * (0.65 + 0.45 * intensity);

            // 1. Build curved fluid ribbon envelope
            const numSegments = 16;
            const segHeight = impactY / numSegments;
            const leftPoints = [];
            const rightPoints = [];

            for (let s = 0; s <= numSegments; ++s) {
                const y = s * segHeight;
                // Fluid acceleration narrowing in mid-air, flaring at impact
                const t = y / impactY;
                const widthMod = streamWidth * (1.0 - 0.28 * Math.sin(Math.PI * t) + 0.15 * t);
                const sway = ch.waveAmp * intensity * Math.sin(y * ch.waveFreq - this.fluidStreamPhase * ch.speed + ch.phaseOffset);
                const cx = streamCenterX + sway;

                leftPoints.push({ x: cx - widthMod / 2, y: y });
                rightPoints.push({ x: cx + widthMod / 2, y: y });
            }

            // Draw translucent fluid body
            ctx.beginPath();
            ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
            for (let i = 1; i <= numSegments; ++i) {
                ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
            }
            ctx.lineTo(rightPoints[numSegments].x, rightPoints[numSegments].y);
            for (let i = numSegments - 1; i >= 0; --i) {
                ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
            }
            ctx.closePath();

            // Liquid metal stream gradient
            const streamGrad = ctx.createLinearGradient(streamCenterX - streamWidth / 2, 0, streamCenterX + streamWidth / 2, 0);
            const baseAlpha = 0.65 * intensity;
            if (ch.colorScheme === 2) {
                // Golden central torrent (Hero core)
                streamGrad.addColorStop(0, `rgba(18, 30, 48, ${baseAlpha * 0.4})`);
                streamGrad.addColorStop(0.25, `rgba(0, 240, 255, ${baseAlpha * 0.7})`);
                streamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${baseAlpha * 0.95})`);
                streamGrad.addColorStop(0.75, `rgba(255, 230, 0, ${baseAlpha * 0.8})`);
                streamGrad.addColorStop(1, `rgba(18, 30, 48, ${baseAlpha * 0.4})`);
            } else {
                // Neon Cyan / Electric Blue metallic rivers
                streamGrad.addColorStop(0, `rgba(14, 22, 36, ${baseAlpha * 0.3})`);
                streamGrad.addColorStop(0.25, `rgba(0, 240, 255, ${baseAlpha * 0.75})`);
                streamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${baseAlpha * 0.95})`);
                streamGrad.addColorStop(0.75, `rgba(56, 189, 248, ${baseAlpha * 0.75})`);
                streamGrad.addColorStop(1, `rgba(14, 22, 36, ${baseAlpha * 0.3})`);
            }

            ctx.fillStyle = streamGrad;
            ctx.fill();

            // 2. High-speed fluid streamlines & laminar filaments
            const filamentCount = Math.floor(3 + intensity * 2);
            for (let f = 0; f < filamentCount; ++f) {
                const fOffset = ((f + 0.5) / filamentCount - 0.5) * (streamWidth * 0.65);
                ctx.strokeStyle = (f % 2 === 0) ? `rgba(255, 255, 255, ${0.5 * intensity})` : `rgba(0, 240, 255, ${0.45 * intensity})`;
                ctx.lineWidth = 1.0;
                ctx.setLineDash([4 + (f % 3) * 2, 6 + (f % 2) * 3]);
                ctx.lineDashOffset = -(this.fluidStreamPhase * ch.speed * 24.0 + f * 12.0);

                ctx.beginPath();
                for (let s = 0; s <= numSegments; ++s) {
                    const y = s * segHeight;
                    const t = y / impactY;
                    const widthMod = streamWidth * (1.0 - 0.28 * Math.sin(Math.PI * t) + 0.15 * t);
                    const sway = ch.waveAmp * intensity * Math.sin(y * ch.waveFreq - this.fluidStreamPhase * ch.speed + ch.phaseOffset);
                    const fx = streamCenterX + sway + (fOffset * (widthMod / streamWidth));
                    if (s === 0) ctx.moveTo(fx, y);
                    else ctx.lineTo(fx, y);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 3. Shimmering tiny paperclip glyphs carried in the fluid flow
            const numClipsInStream = Math.floor(6 + intensity * 10);
            for (let k = 0; k < numClipsInStream; ++k) {
                const clipY = ((k * (impactY / numClipsInStream) + this.fluidStreamPhase * ch.speed * 32.0 + k * 17.0) % impactY);
                if (clipY < 4 || clipY > impactY - 4) continue;

                const t = clipY / impactY;
                const widthMod = streamWidth * (1.0 - 0.28 * Math.sin(Math.PI * t) + 0.15 * t);
                const sway = ch.waveAmp * intensity * Math.sin(clipY * ch.waveFreq - this.fluidStreamPhase * ch.speed + ch.phaseOffset);
                const lateralJitter = (((k * 7919 + idx * 1013) % 1000) / 1000.0 - 0.5) * (widthMod * 0.6);
                const clipX = streamCenterX + sway + lateralJitter;

                const clipRot = Math.PI / 2 + Math.sin(this.fluidStreamPhase + k) * 0.25;
                const clipColor = (k % 3 === 0) ? '#ffffff' : ((k % 3 === 1) ? '#00f0ff' : '#ffe600');
                const clipAlpha = Math.min(1.0, Math.sin(Math.PI * (clipY / impactY))) * intensity;

                ctx.save();
                ctx.globalAlpha = clipAlpha;
                this.drawTinyPaperclip(ctx, clipX, clipY, 3.8, clipRot, clipColor);
                ctx.restore();
            }

            // 4. Energetic glowing impact flare where the waterfall plunges into the bottom fluid sea
            const flareW = streamWidth * 1.4;
            const flareH = 4.0;
            const impactSway = ch.waveAmp * intensity * Math.sin(impactY * ch.waveFreq - this.fluidStreamPhase * ch.speed + ch.phaseOffset);
            const flareX = streamCenterX + impactSway;

            ctx.fillStyle = `rgba(0, 240, 255, ${0.7 * intensity})`;
            ctx.beginPath();
            ctx.ellipse(flareX, impactY, flareW / 2, flareH, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * intensity})`;
            ctx.beginPath();
            ctx.ellipse(flareX, impactY, flareW / 4, flareH / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    renderFluidImpactSplashes(ctx) {
        this.fluidSplashDroplets.forEach(d => {
            const alpha = Math.max(0, Math.min(1, d.life / d.maxLife));
            ctx.fillStyle = d.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(Math.floor(d.x), Math.floor(d.y), d.size, d.size);
        });
        ctx.globalAlpha = 1.0;
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
