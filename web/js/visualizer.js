/**
 * visualizer.js - Stylised pixel-art scene renderer for the centre arena.
 *
 * Seven scenes follow the story (workshop → town → metropolis → orbit → Dyson swarm →
 * galaxy → multiverse). Each scene is painted into a low-resolution buffer with a
 * hand-picked 16 colour palette, then mapped onto that palette with an ordered (Bayer)
 * dither for a cohesive retro look. Scene details react to progress inside the scene
 * (the town empties, Earth turns to chrome, the swarm encloses the Sun...).
 *
 * Foreground systems: the paperclip "sea" that tracks the clip inventory, tumbling clips,
 * draining vortex when spending, production waterfalls at high CPS and click sparks.
 * All particle physics is time based (independent of frame rate).
 */

const SCENE_PALETTES = [
    // 0: Workshop at night — ink shadows, brick & brass, lamp amber, moonlight blue
    ['#0d0b14', '#1a1626', '#2a2238', '#3d2f48', '#5a3f3a', '#7a4f3a', '#a06a3c', '#d9953f',
     '#ffd27a', '#fff4d6', '#26344f', '#3f5f86', '#7fa6c9', '#c9dcec', '#8a8f99', '#d7dce3'],
    // 1: Town at dusk — violet sky into a rose/orange horizon, blue-grey hills
    ['#120d1c', '#231a33', '#3b2748', '#5e3456', '#8c3f5a', '#c4545a', '#ec8052', '#ffb65c',
     '#ffe3a3', '#2c2f4a', '#454a6b', '#6b6f8f', '#1c2226', '#343d3f', '#9aa0ad', '#e8ebf0'],
    // 2: Metropolis at night — navy, neon magenta haze, amber windows, cyan machine light
    ['#07080f', '#0e1224', '#172040', '#22305c', '#2f4a7a', '#3d6aa0', '#5aa0c8', '#9ad4e6',
     '#e8f4f6', '#3a1f3f', '#7a2f5a', '#d44a7a', '#ffb347', '#ffe08a', '#8a93a6', '#cfd6e0'],
    // 3: Orbit — deep space, ocean blues, land greens/ochre, chrome, city lights
    ['#03040a', '#0a0f22', '#12204a', '#1a3a7a', '#2a66a8', '#62a8d8', '#b8e6ff', '#1f3b2a',
     '#3f6b3a', '#8a7a4a', '#f4f1e6', '#5a6070', '#a7b0c0', '#e6ecf5', '#ff8a3a', '#ffd070'],
    // 4: Dyson swarm — ember blacks, solar oranges, gold collectors
    ['#050308', '#140812', '#2a0e14', '#4a1410', '#7a220e', '#b23a0c', '#e2641a', '#ff9a2e',
     '#ffc861', '#fff0b8', '#ffffff', '#3a2a1a', '#7a5a2a', '#c9a24a', '#f2d27a', '#8a8f99'],
    // 5: Galaxy — violet void, blue arms, warm core
    ['#030208', '#0a0718', '#160f32', '#24184f', '#3a2474', '#5a3499', '#8a4fc2', '#c07ae0',
     '#f0c4ff', '#1a2f5a', '#2f5aa0', '#5aa0e0', '#aee6ff', '#ffe0a0', '#ff9a5a', '#ffffff'],
    // 6: Multiverse — teal-black foam, mint and orchid iridescence
    ['#040507', '#0b0f14', '#121c22', '#1a2e33', '#22464a', '#2f6a66', '#4a9a8a', '#8ad4b4',
     '#e0fff0', '#2a1a3a', '#5a2f6a', '#9a4fa0', '#e07ac0', '#ffd0e8', '#c0c8d0', '#ffffff']
];

// Colours used for paperclips in each scene: [deep shadow, shadow, body, highlight, accent]
const SCENE_CLIP_COLORS = [
    ['#1a1626', '#3d2f48', '#8a8f99', '#d7dce3', '#d9953f'],
    ['#231a33', '#454a6b', '#9aa0ad', '#e8ebf0', '#ffb65c'],
    ['#0e1224', '#22305c', '#8a93a6', '#cfd6e0', '#9ad4e6'],
    ['#0a0f22', '#5a6070', '#a7b0c0', '#e6ecf5', '#62a8d8'],
    ['#140812', '#7a5a2a', '#c9a24a', '#fff0b8', '#ff9a2e'],
    ['#0a0718', '#3a2474', '#8a4fc2', '#f0c4ff', '#aee6ff'],
    ['#0b0f14', '#22464a', '#8ad4b4', '#e0fff0', '#e07ac0']
];

// Lifetime-clip ranges (log10) covered by each scene, used for in-scene progress.
const SCENE_LOG_RANGES = [[0, 6.7], [6.7, 9.7], [9.7, 12], [12, 27.78], [27.78, 33.3], [33.3, 56], [56, 64]];

const BAYER_8X8 = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
];

/** Deterministic hash → [0, 1). */
function hash01(a, b = 0, c = 0) {
    let h = ((a * 374761393 + b * 668265263 + c * 1013904223) ^ 0x5bf03635) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth 3D value noise in [0, 1]. */
function valueNoise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const h = (a, b, c) => hash01(xi + a + 1000, yi + b + 1000, zi + c + 1000);
    const lerp = (a, b, k) => a + (b - a) * k;
    return lerp(
        lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v),
        lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v), w);
}

/** Fractal (octave-summed) value noise in [0, 1]. */
function fbm3(x, y, z, octaves = 4) {
    let sum = 0, amp = 0.5, norm = 0;
    for (let o = 0; o < octaves; ++o) {
        sum += valueNoise3(x, y, z) * amp;
        norm += amp;
        x *= 2.03; y *= 2.03; z *= 2.03;
        amp *= 0.5;
    }
    return sum / norm;
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

class CosmicVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        // Low-resolution paint buffer
        this.pixelCanvas = document.createElement('canvas');
        this.pixelCtx = this.pixelCanvas.getContext('2d', { willReadFrequently: true });
        this.fadeCanvas = document.createElement('canvas');
        this.fadeCtx = this.fadeCanvas.getContext('2d');
        this.fadeTimer = 0;

        this.tier = 0;
        this.autoTier = true;
        this.enableDither = true;
        this.paletteLUTs = [];
        this.clipPatterns = {};

        // Drag-to-orbit for the space scenes
        this.camYaw = 0.0;
        this.isDragging = false;
        this.lastMouseX = 0;

        this.time = 0;
        this.heroRecoil = 1.0;
        this.heroRotation = 0;
        this.shakeTimer = 0.0;
        this.shakeIntensity = 0.0;
        this.transitionBanner = null;
        this.transitionBannerTimer = 0.0;

        // Particles
        this.sparks = [];
        this.fallingClips = [];
        this.drainingClips = [];
        this.fluidSplashDroplets = [];
        this.maxFallingClips = 260;
        this.maxDrainingClips = 80;
        this.maxSplashDroplets = 50;
        this.maxSparks = 240;

        // Paperclip sea (tracks the clip inventory)
        this.numColumns = 54;
        this.initFluidColumns();
        this.internalFlowPhase = 0.0;
        this.internalFlowVelocity = 0.0;
        this.drainFlowIntensity = 0.0;

        // Production waterfalls (fade in at high CPS)
        this.fluidStreamIntensity = 0.0;
        this.fluidStreamPhase = 0.0;
        this.fluidStreamChannels = [
            { relX: 0.18, width: 12, speed: 1.15, phaseOffset: 0.0, waveAmp: 3.0, waveFreq: 0.045 },
            { relX: 0.34, width: 15, speed: 1.35, phaseOffset: 1.4, waveAmp: 3.6, waveFreq: 0.040 },
            { relX: 0.50, width: 20, speed: 1.55, phaseOffset: 2.8, waveAmp: 4.4, waveFreq: 0.035 },
            { relX: 0.66, width: 15, speed: 1.30, phaseOffset: 4.2, waveAmp: 3.6, waveFreq: 0.040 },
            { relX: 0.82, width: 12, speed: 1.20, phaseOffset: 5.6, waveAmp: 3.0, waveFreq: 0.045 }
        ];

        // Pre-generated scene geometry
        this.stars = Array.from({ length: 140 }, (_, i) => ({
            x: hash01(i, 1), y: hash01(i, 2), size: hash01(i, 3) > 0.9 ? 2 : 1,
            tw: 0.6 + hash01(i, 4) * 2.4, ph: hash01(i, 5) * 6.283, tone: hash01(i, 6)
        }));
        this.bubbles = Array.from({ length: 7 }, (_, i) => ({
            x: 0.12 + (i % 4) * 0.25 + (hash01(i, 21) - 0.5) * 0.12, y: 0.16 + Math.floor(i / 4) * 0.4 + (hash01(i, 22) - 0.5) * 0.14,
            r: 0.05 + hash01(i, 23) * 0.09, drift: 0.2 + hash01(i, 24), ph: hash01(i, 25) * 6.283, conv: hash01(i, 26)
        }));

        this.initEvents();
    }

    initFluidColumns() {
        this.pileHeights = new Float32Array(this.numColumns);
        this.waveOffsets = new Float32Array(this.numColumns);
        this.waveVelocities = new Float32Array(this.numColumns);
    }

    initEvents() {
        if (!this.canvas) return;
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.camYaw += (e.clientX - this.lastMouseX) * 0.006;
            this.lastMouseX = e.clientX;
        });
        window.addEventListener('mouseup', () => { this.isDragging = false; });
    }

    reset() {
        this.fallingClips = [];
        this.drainingClips = [];
        this.fluidSplashDroplets = [];
        this.sparks = [];
        this.fluidStreamIntensity = 0.0;
        this.transitionBanner = null;
        this.transitionBannerTimer = 0.0;
        this.initFluidColumns();
        this.tier = 0;
        this.autoTier = true;
    }

    // =========================================================================
    // EVENTS FROM THE GAME
    // =========================================================================

    triggerHeroClick() {
        this.heroRecoil = 0.7;
        this.heroRotation += 0.35;
        const pw = this.pixelCanvas.width;
        if (pw > 0) this.emitClickSparks(pw / 2, this.pixelCanvas.height * 0.35, 10);
        this.spawnPaperclips(1, pw / 2, 0);
    }

    spawnPaperclips(count = 1, preferredX = null, cps = 0) {
        const pw = this.pixelCanvas.width || 240;
        const maxSpawn = Math.max(1, Math.round(16 * (1.0 - this.fluidStreamIntensity * 0.85)));
        const spawnCount = Math.min(count, maxSpawn);
        const cpsNum = (typeof cps === 'object' && cps !== null) ? cps.toDouble() : (Number(cps) || 0);
        const spread = 15 + Math.min(1.0, cpsNum / 35.0) * ((pw - 24) / 2 - 15);
        const cap = Math.round(this.maxFallingClips * (1.0 - this.fluidStreamIntensity * 0.75));

        for (let i = 0; i < spawnCount && this.fallingClips.length < cap; ++i) {
            let x = (preferredX !== null && count <= 3)
                ? preferredX + (Math.random() - 0.5) * 16
                : pw / 2 + (Math.random() - 0.5) * spread * 2;
            x = Math.max(6, Math.min(pw - 6, x));
            this.fallingClips.push({
                x, y: -6 - Math.random() * 12,
                vx: (Math.random() - 0.5) * 70, vy: 55 + Math.random() * 130,
                rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 20,
                size: 5 + Math.random() * 2.5, tone: Math.random() < 0.15 ? 4 : (Math.random() < 0.5 ? 3 : 2),
                life: 8.0
            });
        }
        this.internalFlowVelocity = Math.min(2.0, this.internalFlowVelocity + Math.min(count, 6) * 0.12);
    }

    drainPaperclips(ratio = 0.5) {
        const r = Math.max(0.1, Math.min(1.0, ratio));
        this.drainFlowIntensity = Math.min(3.0, this.drainFlowIntensity + r * 2.2);

        const pw = this.pixelCanvas.width || 240;
        const floorY = (this.pixelCanvas.height || 150) - 2;
        const colWidth = pw / (this.numColumns - 1);
        const count = Math.min(24, Math.floor(6 + r * 18));
        for (let k = 0; k < count && this.drainingClips.length < this.maxDrainingClips; ++k) {
            const colIdx = Math.floor(Math.random() * this.numColumns);
            const moundH = Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]);
            if (moundH < 0.8) continue;
            const x = colIdx * colWidth + (Math.random() - 0.5) * 6;
            const y = floorY - moundH + Math.random() * moundH * 0.4;
            const dx = pw / 2 - x;
            const dy = floorY - y;
            const dist = Math.hypot(dx, dy) + 1.0;
            const speed = 70 + Math.random() * 120;
            this.drainingClips.push({
                x, y, vx: (dx / dist) * speed, vy: Math.max(25, (dy / dist) * speed * 0.8),
                rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 24 + (dx > 0 ? 9 : -9),
                size: 3.5 + Math.random() * 2.0, tone: Math.random() < 0.2 ? 4 : 3,
                life: 1.8 + Math.random() * 1.2, maxLife: 2.5
            });
        }
    }

    emitClickSparks(x, y, count = 16) {
        for (let i = 0; i < count; ++i) {
            if (this.sparks.length >= this.maxSparks) this.sparks.shift();
            const angle = Math.random() * Math.PI * 2;
            const speed = 90 + Math.random() * 210;
            this.sparks.push({
                x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60,
                life: 1.0, decay: 1.8 + Math.random() * 2.4, size: Math.random() > 0.5 ? 1 : 2,
                tone: Math.random() > 0.4 ? 4 : 3
            });
        }
    }

    spawnSparks(x, y, count = 25) {
        this.emitClickSparks(x, y, count);
    }

    // =========================================================================
    // SCENE / TIER MANAGEMENT
    // =========================================================================

    getTierScale(tier = this.tier) {
        return [1.0, 0.8, 0.65, 0.55, 0.48, 0.42, 0.38][Math.max(0, Math.min(6, tier))];
    }

    getTierName(tier) {
        return ["Factory Interior", "Factory in Town", "Industrial Metropolis", "Planetary Orbit",
            "Solar Dyson Swarm", "Galactic Penrose Engine", "11D Multiverse"][tier] || "Factory";
    }

    /** Progress (0..1) through the currently displayed scene, from lifetime clips. */
    getSceneProgress(state) {
        if (!state || !state.lifetimeClips) return 0;
        if ((state.storyTier || 0) > this.tier) return 1;
        const [lo, hi] = SCENE_LOG_RANGES[this.tier];
        const l = state.lifetimeClips.log10();
        return Math.max(0, Math.min(1, (l - lo) / (hi - lo)));
    }

    /** Height of the paperclip sea, from the current clip inventory relative to the scene's scale. */
    computeTargetCapacity(state, ph) {
        if (!state || !state.clips || !(state.clips.mantissa > 0)) return 0.0;
        const cLog = state.clips.log10();
        const maxFillHeight = ph * 0.42;
        let fill;
        if (this.tier === 0) {
            const logMax = Math.log10(5000000.0);
            fill = cLog <= 2 ? (Math.pow(10, cLog) / 100.0) * 0.05 : 0.05 + 0.95 * Math.min(1.0, (cLog - 2) / (logMax - 2));
        } else {
            const [lo, hi] = SCENE_LOG_RANGES[this.tier];
            fill = cLog <= lo
                ? Math.max(0, Math.min(1, Math.pow(10, cLog - lo))) * 0.06
                : 0.06 + 0.94 * Math.min(1.0, (cLog - lo) / (hi - lo));
        }
        return Math.max(0, Math.min(1, fill)) * maxFillHeight;
    }

    syncFluidToInventory(state, instant = false) {
        if (!state || !state.clips) return;
        const target = this.computeTargetCapacity(state, this.pixelCanvas.height || 150);
        if (instant) {
            for (let i = 0; i < this.numColumns; ++i) {
                this.pileHeights[i] = target * (0.65 + 0.35 * Math.sin(Math.PI * (i / (this.numColumns - 1))));
                this.waveOffsets[i] = 0.0;
                this.waveVelocities[i] = 0.0;
            }
        } else {
            this.internalFlowVelocity = Math.min(2.5, this.internalFlowVelocity + 0.4);
        }
    }

    /** Called when a story beat advancing the scene is displayed. */
    onStoryTierAdvanced(toTier, bannerText) {
        if (!this.autoTier) return; // Player is viewing a scene manually; don't yank the view or flash banners.
        this.changeTier(toTier);
        this.shakeTimer = 1.2;
        this.shakeIntensity = 5.0;
        this.transitionBanner = bannerText || `ENTERING ${this.getTierName(toTier).toUpperCase()}`;
        this.transitionBannerTimer = 4.5;

        const pw = this.pixelCanvas.width || 240;
        for (let i = 0; i < 60; ++i) {
            this.fallingClips.push({
                x: Math.random() * pw, y: -Math.random() * 60,
                vx: (Math.random() - 0.5) * 80, vy: 60 + Math.random() * 120,
                rot: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 16,
                size: 4 + Math.random() * 3, tone: Math.random() < 0.3 ? 4 : 3, life: 6.0
            });
        }
        this.spawnSparks(pw / 2, (this.pixelCanvas.height || 150) * 0.4, 40);
        if (window.game && window.game.audio) window.game.audio.playTechUnlockSound();
    }

    /** Switches scene with a short cross-fade from the previous frame. */
    changeTier(tier) {
        tier = Math.max(0, Math.min(6, tier));
        if (tier === this.tier) return;
        if (this.pixelCanvas.width > 0) {
            this.fadeCanvas.width = this.pixelCanvas.width;
            this.fadeCanvas.height = this.pixelCanvas.height;
            this.fadeCtx.drawImage(this.pixelCanvas, 0, 0);
            this.fadeTimer = 1.0;
        }
        this.tier = tier;
    }

    /** Snaps the displayed scene to the saved story tier (no banner). */
    syncStoryTier(storyTier) {
        if (this.autoTier) this.tier = Math.max(0, Math.min(6, storyTier));
    }

    setTier(tierIndex, storyTier = 0) {
        if (tierIndex === -1) {
            this.autoTier = true;
            this.changeTier(storyTier);
        } else {
            this.autoTier = false;
            this.changeTier(tierIndex);
        }
    }

    toggleDither() {
        this.enableDither = !this.enableDither;
        return this.enableDither;
    }

    // =========================================================================
    // SIMULATION
    // =========================================================================

    update(dt, state) {
        const safeDt = Math.min(0.1, Math.max(0.001, dt));
        if (this.autoTier && state && (state.storyTier || 0) !== this.tier) this.changeTier(state.storyTier || 0);

        this.time += safeDt;
        this.shakeTimer = Math.max(0, this.shakeTimer - safeDt);
        this.fadeTimer = Math.max(0, this.fadeTimer - safeDt);
        if (this.transitionBannerTimer > 0) {
            this.transitionBannerTimer = Math.max(0, this.transitionBannerTimer - safeDt);
            if (this.transitionBannerTimer <= 0) this.transitionBanner = null;
        }
        this.heroRecoil += (1.0 - this.heroRecoil) * Math.min(1, safeDt * 10.0);
        this.internalFlowPhase += this.internalFlowVelocity * safeDt * 0.6;
        this.internalFlowVelocity = Math.max(0, this.internalFlowVelocity - safeDt * 0.85);
        this.drainFlowIntensity = Math.max(0, this.drainFlowIntensity - safeDt * 0.85);

        // Waterfall intensity drifts toward a target based on production
        let targetStream = 0.0;
        if (state && typeof state.calculateTotalCPS === 'function') {
            const cps = state.calculateTotalCPS();
            if (cps && cps.mantissa > 0) targetStream = Math.max(0, Math.min(1.0, (cps.log10() - 0.7) / 2.3));
        }
        this.fluidStreamIntensity += (targetStream - this.fluidStreamIntensity) * (1.0 - Math.exp(-safeDt * 2.2));
        this.fluidStreamPhase += (2.6 + this.fluidStreamIntensity * 3.8) * safeDt;

        const pw = this.pixelCanvas.width || 240;
        const ph = this.pixelCanvas.height || 150;
        const floorY = ph - 2;
        const surfaceAt = (x) => {
            const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((x / pw) * this.numColumns)));
            return { colIdx, y: floorY - Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx]) };
        };

        // Waterfall splashes
        if (this.fluidStreamIntensity > 0.02) {
            for (const ch of this.fluidStreamChannels) {
                const sx = ch.relX * pw;
                const { colIdx, y } = surfaceAt(sx);
                this.waveOffsets[colIdx] += 0.06 * this.fluidStreamIntensity * Math.sin(this.fluidStreamPhase * 2.0 + ch.phaseOffset);
                if (Math.random() < this.fluidStreamIntensity * 0.45 && this.fluidSplashDroplets.length < this.maxSplashDroplets) {
                    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
                    const sp = 70 + Math.random() * 130 * this.fluidStreamIntensity;
                    this.fluidSplashDroplets.push({
                        x: sx + (Math.random() - 0.5) * ch.width * 0.7, y,
                        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                        life: 0.4 + Math.random() * 0.35, maxLife: 0.75, size: Math.random() > 0.6 ? 2 : 1
                    });
                }
            }
        }
        for (let i = this.fluidSplashDroplets.length - 1; i >= 0; --i) {
            const d = this.fluidSplashDroplets[i];
            d.x += d.vx * safeDt;
            d.y += d.vy * safeDt;
            d.vy += 580 * safeDt;
            d.life -= safeDt;
            if (d.life <= 0 || d.y > ph + 5) this.fluidSplashDroplets.splice(i, 1);
        }

        // Falling clips land on the sea surface
        for (let i = this.fallingClips.length - 1; i >= 0; --i) {
            const p = this.fallingClips[i];
            p.x += p.vx * safeDt;
            p.y += p.vy * safeDt;
            p.rot += p.vRot * safeDt;
            p.vy += 790 * safeDt;
            p.life -= safeDt;
            const { colIdx, y } = surfaceAt(p.x);
            if (p.y >= y) {
                this.waveOffsets[colIdx] += 0.12;
                this.waveVelocities[colIdx] += 0.18;
                if (colIdx > 0) this.waveVelocities[colIdx - 1] += 0.09;
                if (colIdx < this.numColumns - 1) this.waveVelocities[colIdx + 1] += 0.09;
                this.fallingClips.splice(i, 1);
            } else if (p.life <= 0 || p.y > ph + 20 || p.x < -20 || p.x > pw + 20) {
                this.fallingClips.splice(i, 1);
            }
        }

        // Draining clips spiral into the central drain
        const drainX = pw / 2;
        const drainY = floorY + 4;
        for (let i = this.drainingClips.length - 1; i >= 0; --i) {
            const p = this.drainingClips[i];
            const dx = drainX - p.x;
            const dy = drainY - p.y;
            const dist = Math.hypot(dx, dy) + 0.1;
            const suction = (3.5 + this.drainFlowIntensity * 2.5) * 60;
            p.vx += ((dx / dist) * suction + (-dy / dist) * 108) * safeDt;
            p.vy += (Math.max(36, (dy / dist) * suction) + (dx / dist) * 36) * safeDt;
            const drag = Math.pow(0.95, safeDt * 60);
            p.vx *= drag;
            p.vy *= drag;
            p.x += p.vx * safeDt;
            p.y += p.vy * safeDt;
            p.rot += p.vRot * safeDt;
            p.life -= safeDt;
            if (p.life <= 0 || p.y > ph + 10 || dist < 3.0) this.drainingClips.splice(i, 1);
        }

        // Paperclip sea: fills/drains smoothly toward the inventory level with damped ripples
        const target = this.computeTargetCapacity(state, ph);
        for (let i = 0; i < this.numColumns; ++i) {
            const targetH = target * (0.65 + 0.35 * Math.sin(Math.PI * (i / (this.numColumns - 1))));
            const diff = targetH - this.pileHeights[i];
            const rate = diff < 0 ? 1.2 * (1.0 + this.drainFlowIntensity * 0.35) : 3.5;
            this.pileHeights[i] += diff * (1.0 - Math.exp(-safeDt * rate));

            const accel = -16.0 * this.waveOffsets[i] - 10.0 * this.waveVelocities[i];
            this.waveVelocities[i] += accel * safeDt;
            this.waveOffsets[i] += this.waveVelocities[i] * safeDt;
            this.waveOffsets[i] *= Math.exp(-safeDt * 4.0);
            this.waveVelocities[i] *= Math.exp(-safeDt * 6.0);
        }
        for (let pass = 0; pass < 2; ++pass) {
            for (let i = 1; i < this.numColumns; ++i) {
                const d = 0.15 * (this.waveOffsets[i] - this.waveOffsets[i - 1]);
                this.waveOffsets[i - 1] += d;
                this.waveOffsets[i] -= d;
            }
        }

        // Sparks
        for (let i = this.sparks.length - 1; i >= 0; --i) {
            const p = this.sparks[i];
            p.x += p.vx * safeDt;
            p.y += p.vy * safeDt;
            p.vy += 430 * safeDt;
            p.life -= p.decay * safeDt;
            if (p.life <= 0) this.sparks.splice(i, 1);
        }
    }

    // =========================================================================
    // FRAME
    // =========================================================================

    render(state) {
        if (!this.ctx || !this.canvas) return;
        const displayW = this.canvas.clientWidth;
        const displayH = this.canvas.clientHeight;
        if (displayW <= 0 || displayH <= 0) return;
        if (this.canvas.width !== displayW || this.canvas.height !== displayH) {
            this.canvas.width = displayW;
            this.canvas.height = displayH;
        }

        // Keep a consistent chunky pixel size (~360-480 buffer pixels wide) at any window size
        const pixelScale = Math.max(2, Math.round(displayW / 420));
        const pw = Math.max(160, Math.ceil(displayW / pixelScale));
        const ph = Math.max(100, Math.ceil(displayH / pixelScale));
        if (this.pixelCanvas.width !== pw || this.pixelCanvas.height !== ph) {
            this.pixelCanvas.width = pw;
            this.pixelCanvas.height = ph;
        }

        const pctx = this.pixelCtx;
        pctx.imageSmoothingEnabled = false;
        pctx.save();
        this.renderScene(pctx, pw, ph, state);
        pctx.restore();

        if (this.fadeTimer > 0 && this.fadeCanvas.width === pw && this.fadeCanvas.height === ph) {
            pctx.globalAlpha = this.fadeTimer;
            pctx.drawImage(this.fadeCanvas, 0, 0);
            pctx.globalAlpha = 1.0;
        }

        this.renderFallingFluidStreams(pctx, pw, ph);
        this.renderPaperclipSea(pctx, pw, ph);
        this.renderSplashes(pctx);
        this.renderDrainingPaperclips(pctx);
        this.renderFallingPaperclips(pctx);
        this.renderSparks(pctx);

        if (this.enableDither) this.applyPaletteDither(pctx, pw, ph);

        const ctx = this.ctx;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = SCENE_PALETTES[this.tier][0];
        ctx.fillRect(0, 0, displayW, displayH);
        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeTimer > 0) {
            const mag = this.shakeIntensity * (this.shakeTimer / 1.2) * pixelScale;
            shakeX = Math.round((Math.random() - 0.5) * mag);
            shakeY = Math.round((Math.random() - 0.5) * mag);
        }
        ctx.drawImage(this.pixelCanvas, 0, 0, pw, ph, shakeX, shakeY, pw * pixelScale, ph * pixelScale);

        if (this.transitionBanner && this.transitionBannerTimer > 0) {
            this.renderTransitionBannerOverlay(ctx, displayW, displayH);
        }
    }

    renderTransitionBannerOverlay(ctx, w, h) {
        const t = this.transitionBannerTimer;
        const alpha = Math.min(1.0, t > 0.6 ? Math.min(1, (4.5 - t) * 3) : t * 1.6);
        const fontSize = Math.max(11, Math.min(16, w / 48));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `600 ${fontSize}px 'Space Grotesk', 'Segoe UI', sans-serif`;
        const text = this.transitionBanner;
        const textW = Math.min(w - 48, ctx.measureText(text).width + 48);
        const bannerH = fontSize * 2.6;
        const x = (w - textW) / 2;
        const y = h * 0.1;
        ctx.fillStyle = 'rgba(8, 9, 14, 0.82)';
        ctx.fillRect(x, y, textW, bannerH);
        ctx.fillStyle = '#e8b85c';
        ctx.fillRect(x, y, textW, 2);
        ctx.fillRect(x, y + bannerH - 2, textW, 2);
        ctx.fillStyle = '#f3efe6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, w / 2, y + bannerH / 2, textW - 24);
        ctx.restore();
    }

    // =========================================================================
    // PALETTE DITHER
    // =========================================================================

    getPaletteLUT(tier) {
        if (this.paletteLUTs[tier]) return this.paletteLUTs[tier];
        const palette = SCENE_PALETTES[tier].map(hexToRgb);
        const lut = new Uint32Array(32768);
        const littleEndian = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
        for (let r = 0; r < 32; ++r) {
            for (let g = 0; g < 32; ++g) {
                for (let b = 0; b < 32; ++b) {
                    const R = r * 8 + 4, G = g * 8 + 4, B = b * 8 + 4;
                    let best = 0;
                    let bestD = Infinity;
                    for (let i = 0; i < palette.length; ++i) {
                        const [pr, pg, pb] = palette[i];
                        // Perceptually weighted distance
                        const d = 2 * (R - pr) * (R - pr) + 4 * (G - pg) * (G - pg) + 3 * (B - pb) * (B - pb);
                        if (d < bestD) { bestD = d; best = i; }
                    }
                    const [pr, pg, pb] = palette[best];
                    lut[(r << 10) | (g << 5) | b] = littleEndian
                        ? ((255 << 24) | (pb << 16) | (pg << 8) | pr) >>> 0
                        : ((pr << 24) | (pg << 16) | (pb << 8) | 255) >>> 0;
                }
            }
        }
        this.paletteLUTs[tier] = lut;
        return lut;
    }

    applyPaletteDither(ctx, width, height) {
        const img = ctx.getImageData(0, 0, width, height);
        const data = img.data;
        const out = new Uint32Array(data.buffer);
        const lut = this.getPaletteLUT(this.tier);
        if (!this.ditherClamp) {
            // (channel + dither offset) -> clamped 5-bit bucket; dither offsets are biased by +16
            this.ditherClamp = new Uint8Array(288);
            for (let i = 0; i < 288; ++i) this.ditherClamp[i] = Math.max(0, Math.min(255, i - 16)) >> 3;
            this.ditherRows = BAYER_8X8.map(row => Int16Array.from(row, v => Math.round((v / 64 - 0.5) * 16) + 16));
        }
        const clamp = this.ditherClamp;
        for (let y = 0; y < height; ++y) {
            const row = this.ditherRows[y & 7];
            let o = y * width;
            let i = o << 2;
            for (let x = 0; x < width; ++x, ++o, i += 4) {
                const d = row[x & 7];
                out[o] = lut[(clamp[data[i] + d] << 10) | (clamp[data[i + 1] + d] << 5) | clamp[data[i + 2] + d]];
            }
        }
        ctx.putImageData(img, 0, 0);
    }

    /** Offscreen canvas for a scene's static layer, redrawn only when its key or size changes. */
    cachedLayer(key, w, h, draw) {
        if (!this.layerCache) this.layerCache = new Map();
        const fullKey = `${key}|${w}x${h}`;
        let layer = this.layerCache.get(fullKey);
        if (!layer) {
            if (this.layerCache.size > 24) this.layerCache.clear();
            layer = document.createElement('canvas');
            layer.width = w;
            layer.height = h;
            draw(layer.getContext('2d'));
            this.layerCache.set(fullKey, layer);
        }
        return layer;
    }

    // =========================================================================
    // DRAWING HELPERS
    // =========================================================================

    vGradient(ctx, x0, y0, y1, stops) {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        stops.forEach(([t, c]) => g.addColorStop(t, c));
        return g;
    }

    glow(ctx, x, y, r, color, alpha = 1.0) {
        const [cr, cg, cb] = hexToRgb(color);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    drawStars(ctx, w, h, maxY = 1.0, density = 1.0, colors = ['#b8e6ff', '#ffffff', '#ffd070']) {
        const n = Math.floor(this.stars.length * density);
        for (let i = 0; i < n; ++i) {
            const s = this.stars[i];
            if (s.y > maxY) continue;
            ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.time * s.tw + s.ph));
            ctx.fillStyle = colors[Math.floor(s.tone * colors.length)];
            ctx.fillRect(Math.floor(s.x * w), Math.floor(s.y * h), s.size, s.size);
        }
        ctx.globalAlpha = 1.0;
    }

    /** Rolling ridge line from summed sines, filled to the bottom. */
    drawRidge(ctx, w, h, baseY, amp, seed, color, detail = 1.0) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
            const t = x / w;
            const y = baseY
                - amp * (0.55 * Math.sin(t * 5.1 * detail + seed)
                + 0.3 * Math.sin(t * 11.7 * detail + seed * 2.3)
                + 0.15 * Math.sin(t * 23.3 * detail + seed * 4.1));
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
    }

    /** Pixel-art paperclip glyph. */
    drawTinyPaperclip(ctx, x, y, size = 6, rot = 0, color = '#ffffff') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.6, Math.min(1.4, size * 0.26));
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

    /** Large chrome paperclip floating in the early scenes (click target). */
    drawHeroClip(ctx, x, y, scale, rotation, colors) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        const path = () => {
            ctx.beginPath();
            ctx.moveTo(-6, 12);
            ctx.lineTo(-6, -12);
            ctx.arc(0, -12, 6, Math.PI, 0, false);
            ctx.lineTo(6, 13);
            ctx.arc(0, 13, 6, 0, Math.PI, false);
            ctx.lineTo(-3, -6);
            ctx.arc(0, -6, 3, Math.PI, 0, false);
            ctx.lineTo(3, 7);
        };
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 4.5;
        path();
        ctx.stroke();
        ctx.strokeStyle = colors[2];
        ctx.lineWidth = 2.5;
        path();
        ctx.stroke();
        ctx.strokeStyle = colors[3];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, 9);
        ctx.lineTo(-6, -12);
        ctx.arc(0, -12, 6, Math.PI, Math.PI * 1.5, false);
        ctx.stroke();
        ctx.restore();
    }

    renderScene(ctx, w, h, state) {
        const p = this.getSceneProgress(state);
        switch (this.tier) {
            case 0: this.renderWorkshop(ctx, w, h, p, state); break;
            case 1: this.renderTown(ctx, w, h, p, state); break;
            case 2: this.renderMetropolis(ctx, w, h, p, state); break;
            case 3: this.renderOrbit(ctx, w, h, p, state); break;
            case 4: this.renderDyson(ctx, w, h, p, state); break;
            case 5: this.renderGalaxy(ctx, w, h, p, state); break;
            default: this.renderMultiverse(ctx, w, h, p, state); break;
        }
    }

    // =========================================================================
    // SCENE 0: THE WORKSHOP AT NIGHT
    // =========================================================================
    renderWorkshop(ctx, w, h, p) {
        const t = this.time;
        const floorY = h * 0.78;
        const cartons = Math.floor(p * 26);

        // Static layer: walls, windows, trusses, floor, bench and stacked cartons
        ctx.drawImage(this.cachedLayer(`workshop|${cartons}`, w, h, (c) => {
            c.fillStyle = this.vGradient(c, 0, 0, floorY, [[0, '#0d0b14'], [0.45, '#1a1626'], [1, '#2a2238']]);
            c.fillRect(0, 0, w, floorY);

            c.fillStyle = 'rgba(13, 11, 20, 0.45)';
            for (let y = Math.floor(h * 0.5); y < floorY; y += 5) {
                c.fillRect(0, y, w, 1);
                const off = ((y / 5) % 2) * 6;
                for (let x = off; x < w; x += 12) c.fillRect(x, y, 1, 5);
            }

            const winW = Math.max(26, w * 0.15);
            const winH = h * 0.36;
            const winY = h * 0.1;
            [w * 0.22, w * 0.5, w * 0.78].forEach((cx, i) => {
                const x0 = cx - winW / 2;
                c.save();
                c.beginPath();
                c.moveTo(x0, winY + winH);
                c.lineTo(x0, winY + winW / 2);
                c.arc(cx, winY + winW / 2, winW / 2, Math.PI, 0, false);
                c.lineTo(x0 + winW, winY + winH);
                c.closePath();
                c.fillStyle = this.vGradient(c, 0, winY, winY + winH, [[0, '#26344f'], [0.6, '#3f5f86'], [1, '#7fa6c9']]);
                c.fill();
                c.clip();
                if (i === 1) {
                    this.glow(c, cx + winW * 0.15, winY + winH * 0.3, winW * 0.7, '#c9dcec', 0.35);
                    c.fillStyle = '#e6ecf5';
                    c.beginPath();
                    c.arc(cx + winW * 0.15, winY + winH * 0.3, winW * 0.13, 0, Math.PI * 2);
                    c.fill();
                }
                c.fillStyle = '#26344f';
                for (let b = 0; b < 6; ++b) {
                    const bh = winH * (0.12 + hash01(i, b, 7) * 0.2);
                    c.fillRect(x0 + b * winW / 6, winY + winH - bh, winW / 6 + 1, bh);
                }
                c.restore();

                c.fillStyle = '#0d0b14';
                c.fillRect(cx - 1, winY, 2, winH);
                for (let k = 1; k < 4; ++k) c.fillRect(x0, winY + winW / 2 + k * (winH - winW / 2) / 4, winW, 1);
                c.fillStyle = '#3d2f48';
                c.fillRect(x0 - 2, winY + winH, winW + 4, 3);

                c.fillStyle = 'rgba(127, 166, 201, 0.07)';
                c.beginPath();
                c.moveTo(x0, winY + winW / 2);
                c.lineTo(x0 + winW, winY + winW / 2);
                c.lineTo(x0 + winW + w * 0.12, h);
                c.lineTo(x0 + w * 0.06, h);
                c.closePath();
                c.fill();
            });

            c.strokeStyle = '#0d0b14';
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(0, h * 0.06);
            c.lineTo(w, h * 0.06);
            for (let x = 0; x < w; x += w / 8) {
                c.moveTo(x, h * 0.06);
                c.lineTo(x + w / 16, 0);
                c.lineTo(x + w / 8, h * 0.06);
            }
            c.stroke();

            c.fillStyle = this.vGradient(c, 0, floorY, h, [[0, '#3d2f48'], [1, '#1a1626']]);
            c.fillRect(0, floorY, w, h - floorY);
            c.strokeStyle = 'rgba(13, 11, 20, 0.6)';
            c.lineWidth = 1;
            for (let k = -6; k <= 6; ++k) {
                c.beginPath();
                c.moveTo(w / 2 + k * w * 0.05, floorY);
                c.lineTo(w / 2 + k * w * 0.2, h);
                c.stroke();
            }

            const bw = Math.max(9, w * 0.05);
            for (let i = 0; i < cartons; ++i) {
                const idx = Math.floor(i / 2);
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                const cx = i % 2 === 0 ? 4 + col * (bw + 1) : w - 4 - (col + 1) * (bw + 1);
                const cy = floorY - (row + 1) * (bw * 0.8);
                c.fillStyle = (i % 3 === 0) ? '#7a4f3a' : '#a06a3c';
                c.fillRect(cx, cy, bw, bw * 0.8 - 1);
                c.fillStyle = '#d9953f';
                c.fillRect(cx, cy + bw * 0.35, bw, 1);
            }

            const bx = w * 0.5;
            const benchY = floorY - h * 0.08;
            c.fillStyle = '#5a3f3a';
            c.fillRect(bx - w * 0.16, benchY, w * 0.32, 4);
            c.fillStyle = '#1a1626';
            c.fillRect(bx - w * 0.15, benchY + 4, 3, floorY - benchY - 4);
            c.fillRect(bx + w * 0.15 - 3, benchY + 4, 3, floorY - benchY - 4);
            c.fillStyle = '#a06a3c';
            c.beginPath();
            c.arc(bx - w * 0.1, benchY - 6, 6, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#d9953f';
            c.beginPath();
            c.arc(bx - w * 0.1, benchY - 6, 3, 0, Math.PI * 2);
            c.fill();
        }), 0, 0);

        // Hanging lamps with warm cones (swaying)
        [w * 0.36, w * 0.64].forEach((lx, i) => {
            const sway = Math.sin(t * 0.9 + i * 1.7) * 2;
            const ly = h * 0.26;
            ctx.strokeStyle = '#0d0b14';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(lx, h * 0.06);
            ctx.lineTo(lx + sway, ly);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 210, 122, 0.10)';
            ctx.beginPath();
            ctx.moveTo(lx + sway - 3, ly + 3);
            ctx.lineTo(lx + sway + 3, ly + 3);
            ctx.lineTo(lx + sway * 3 + w * 0.13, floorY);
            ctx.lineTo(lx + sway * 3 - w * 0.13, floorY);
            ctx.closePath();
            ctx.fill();
            this.glow(ctx, lx + sway, ly + 4, h * 0.12, '#ffd27a', 0.5);
            ctx.fillStyle = '#3d2f48';
            ctx.beginPath();
            ctx.moveTo(lx + sway - 6, ly + 4);
            ctx.lineTo(lx + sway + 6, ly + 4);
            ctx.lineTo(lx + sway + 3, ly);
            ctx.lineTo(lx + sway - 3, ly);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff4d6';
            ctx.fillRect(Math.round(lx + sway) - 1, ly + 4, 3, 2);
        });

        // Bending arm on the bench (reacts to clicks)
        const benchY = floorY - h * 0.08;
        ctx.save();
        ctx.translate(w * 0.56, benchY - 2);
        ctx.fillStyle = '#8a8f99';
        ctx.fillRect(-4, -4, 8, 4);
        ctx.rotate(-0.9 + (1.0 - this.heroRecoil) * 2.2);
        ctx.fillStyle = '#d7dce3';
        ctx.fillRect(0, -1.5, 16, 3);
        ctx.fillStyle = '#d9953f';
        ctx.fillRect(15, -2.5, 3, 5);
        ctx.restore();

        // Dust motes in the moonlight
        ctx.fillStyle = '#c9dcec';
        for (let i = 0; i < 26; ++i) {
            const mx = (hash01(i, 31) * w + Math.sin(t * 0.3 + i) * 8 + t * 2) % w;
            const my = (hash01(i, 32) * h + t * (1.5 + hash01(i, 33) * 2)) % floorY;
            ctx.globalAlpha = Math.max(0, 0.25 + 0.35 * Math.sin(t + i));
            ctx.fillRect(Math.floor(mx), Math.floor(my), 1, 1);
        }
        ctx.globalAlpha = 1.0;

        this.drawHeroClip(ctx, w / 2, h * 0.36, 1.1 * this.heroRecoil, this.heroRotation + Math.sin(t * 0.8) * 0.15, SCENE_CLIP_COLORS[0]);
    }

    // =========================================================================
    // SCENE 1: THE TOWN AT DUSK
    // =========================================================================
    renderTown(ctx, w, h, p) {
        const t = this.time;
        const horizon = h * 0.62;
        const groundY = horizon + h * 0.1;
        const pq = Math.round(p * 40) / 40;

        // Sky gradient & sun (the sun sinks as the town is consumed)
        ctx.drawImage(this.cachedLayer(`town-sky|${pq}`, w, h, (c) => {
            c.fillStyle = this.vGradient(c, 0, 0, horizon, [[0, '#231a33'], [0.35, '#5e3456'], [0.65, '#c4545a'], [0.88, '#ec8052'], [1, '#ffb65c']]);
            c.fillRect(0, 0, w, horizon + 2);
            const sunX = w * 0.3;
            const sunY = horizon - h * 0.06 + pq * h * 0.05;
            const sunR = h * 0.13;
            this.glow(c, sunX, sunY, sunR * 2.6, '#ffb65c', 0.45);
            c.save();
            c.beginPath();
            c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            c.clip();
            c.fillStyle = this.vGradient(c, 0, sunY - sunR, sunY + sunR, [[0, '#ffe3a3'], [0.5, '#ffb65c'], [1, '#ec8052']]);
            c.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);
            c.fillStyle = '#c4545a';
            for (let k = 0; k < 5; ++k) c.fillRect(sunX - sunR, sunY + sunR * (0.15 + k * 0.18), sunR * 2, 1 + k * 0.6);
            c.restore();
        }), 0, 0);

        this.drawStars(ctx, w, h, 0.22, 0.4, ['#ffe3a3', '#e8ebf0']);
        for (let i = 0; i < 5; ++i) {
            const cx = ((hash01(i, 41) * w * 1.4 + t * (2 + i)) % (w * 1.4)) - w * 0.2;
            const cy = h * (0.12 + hash01(i, 42) * 0.3);
            ctx.fillStyle = i % 2 ? 'rgba(236, 128, 82, 0.5)' : 'rgba(255, 182, 92, 0.55)';
            ctx.fillRect(cx, cy, w * (0.12 + hash01(i, 43) * 0.18), 1);
        }

        // Hills, town, factory and power lines (windows go dark as the town evacuates)
        const fx = w * 0.64;
        const fw = w * 0.3;
        const fh = h * 0.12;
        ctx.drawImage(this.cachedLayer(`town-land|${pq}`, w, h, (c) => {
            this.drawRidge(c, w, h, horizon, h * 0.05, 1.3, '#6b6f8f', 1.0);
            this.drawRidge(c, w, h, horizon + h * 0.04, h * 0.045, 4.2, '#454a6b', 1.4);
            this.drawRidge(c, w, h, horizon + h * 0.09, h * 0.02, 2.2, '#2c2f4a', 2.0);
            c.fillStyle = '#231a33';
            c.fillRect(0, groundY, w, h - groundY);
            for (let i = 0; i < 16; ++i) {
                const hx = w * 0.04 + i * w * 0.036;
                if (hx > w * 0.6) break;
                const hw = w * 0.03;
                const hh = h * (0.035 + hash01(i, 51) * 0.03);
                c.fillStyle = '#231a33';
                c.fillRect(hx, groundY - hh, hw, hh);
                c.beginPath();
                c.moveTo(hx - 1, groundY - hh);
                c.lineTo(hx + hw / 2, groundY - hh - hw * 0.5);
                c.lineTo(hx + hw + 1, groundY - hh);
                c.fill();
                if (hash01(i, 52) > pq * 1.1) {
                    c.fillStyle = '#ffe3a3';
                    c.fillRect(hx + 2, groundY - hh + 2, 2, 2);
                    if (hash01(i, 53) > 0.5) c.fillRect(hx + hw - 4, groundY - hh + 2, 2, 2);
                }
            }
            c.fillStyle = '#231a33';
            const sx = w * 0.27;
            c.fillRect(sx, groundY - h * 0.1, w * 0.02, h * 0.1);
            c.beginPath();
            c.moveTo(sx - 1, groundY - h * 0.1);
            c.lineTo(sx + w * 0.01, groundY - h * 0.17);
            c.lineTo(sx + w * 0.02 + 1, groundY - h * 0.1);
            c.fill();
            c.fillRect(w * 0.5, groundY - h * 0.1, 1, h * 0.1);
            c.fillRect(w * 0.53, groundY - h * 0.1, 1, h * 0.1);
            c.fillRect(w * 0.495, groundY - h * 0.13, w * 0.045, h * 0.035);

            c.fillStyle = '#120d1c';
            c.fillRect(fx, groundY - fh, fw, fh);
            for (let k = 0; k < 5; ++k) {
                c.beginPath();
                c.moveTo(fx + k * fw / 5, groundY - fh);
                c.lineTo(fx + k * fw / 5, groundY - fh - h * 0.03);
                c.lineTo(fx + (k + 1) * fw / 5, groundY - fh);
                c.fill();
            }
            for (let k = 0; k < 3; ++k) {
                const cx = fx + fw * (0.2 + k * 0.3);
                const top = groundY - fh - h * (0.12 + k * 0.02);
                c.fillStyle = '#120d1c';
                c.fillRect(cx - 2, top, 4, groundY - fh - top);
                c.fillStyle = '#c4545a';
                c.fillRect(cx - 2, top + 3, 4, 1);
            }
            c.fillStyle = '#ffb65c';
            for (let k = 0; k < 7; ++k) c.fillRect(fx + 4 + k * (fw - 8) / 7, groundY - fh * 0.55, 3, 2);

            c.strokeStyle = '#120d1c';
            c.lineWidth = 1;
            for (let k = 0; k < 4; ++k) {
                const px = w * (0.08 + k * 0.28);
                c.fillStyle = '#120d1c';
                c.fillRect(px, groundY - h * 0.12, 1, h * 0.12);
                c.fillRect(px - 3, groundY - h * 0.12, 7, 1);
                if (k < 3) {
                    c.beginPath();
                    c.moveTo(px, groundY - h * 0.12);
                    c.quadraticCurveTo(px + w * 0.14, groundY - h * 0.08, px + w * 0.28, groundY - h * 0.12);
                    c.stroke();
                }
            }
        }), 0, 0);

        // Smoke from the stacks
        for (let k = 0; k < 3; ++k) {
            const cx = fx + fw * (0.2 + k * 0.3);
            const top = groundY - fh - h * (0.12 + k * 0.02);
            for (let s = 0; s < 6; ++s) {
                const age = ((t * 0.25 + s / 6 + k * 0.13) % 1);
                ctx.globalAlpha = 0.55 * (1 - age);
                ctx.fillStyle = age < 0.3 ? '#9aa0ad' : '#6b6f8f';
                ctx.beginPath();
                ctx.arc(cx + age * w * 0.12 + Math.sin(age * 6 + k) * 2, top - age * h * 0.2, 2 + age * 7, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;

        this.drawHeroClip(ctx, w / 2, h * 0.28, 0.9 * this.heroRecoil, this.heroRotation + Math.sin(t * 0.8) * 0.15, SCENE_CLIP_COLORS[1]);
    }

    // =========================================================================
    // SCENE 2: THE METROPOLIS AT NIGHT
    // =========================================================================
    renderMetropolis(ctx, w, h, p) {
        const t = this.time;
        const ground = h * 0.8;
        const pq = Math.round(p * 40) / 40;

        ctx.drawImage(this.cachedLayer('city-sky', w, h, (c) => {
            c.fillStyle = this.vGradient(c, 0, 0, ground, [[0, '#07080f'], [0.45, '#172040'], [0.8, '#3a1f3f'], [1, '#7a2f5a']]);
            c.fillRect(0, 0, w, ground);
        }), 0, 0);
        this.drawStars(ctx, w, h, 0.3, 0.5, ['#9ad4e6', '#e8f4f6']);

        // Searchlights sweep behind the skyline
        [0.25, 0.72].forEach((sx, i) => {
            const a = -Math.PI / 2 + Math.sin(t * 0.35 + i * 2) * 0.5;
            ctx.fillStyle = 'rgba(154, 212, 230, 0.08)';
            ctx.beginPath();
            ctx.moveTo(w * sx, ground);
            ctx.lineTo(w * sx + Math.cos(a - 0.05) * h * 1.2, ground + Math.sin(a - 0.05) * h * 1.2);
            ctx.lineTo(w * sx + Math.cos(a + 0.05) * h * 1.2, ground + Math.sin(a + 0.05) * h * 1.2);
            ctx.closePath();
            ctx.fill();
        });

        // Skyline layers: windows turn to cold cyan machine light as the city is taken over
        ctx.drawImage(this.cachedLayer(`city-skyline|${pq}`, w, h, (c) => {
            const skyline = (layer, color, minH, maxH, winColor, winChance, seedBase) => {
                let x = -4;
                let i = 0;
                while (x < w) {
                    const bw = w * (0.04 + hash01(i, seedBase, 1) * 0.05);
                    const bh = h * (minH + hash01(i, seedBase, 2) * (maxH - minH));
                    c.fillStyle = color;
                    c.fillRect(x, ground - bh, bw, bh);
                    if (hash01(i, seedBase, 3) > 0.7) c.fillRect(x + bw * 0.45, ground - bh - h * 0.04, 1, h * 0.04);
                    if (winColor) {
                        for (let wy = ground - bh + 3; wy < ground - 2; wy += 4) {
                            for (let wx = x + 2; wx < x + bw - 2; wx += 3) {
                                const hsh = hash01(Math.floor(wx), Math.floor(wy), seedBase);
                                if (hsh < winChance) {
                                    c.fillStyle = hsh < winChance * pq ? '#9ad4e6' : winColor;
                                    c.fillRect(wx, wy, 1, 1);
                                }
                            }
                        }
                    }
                    x += bw + 1;
                    ++i;
                }
            };
            skyline(0, '#22305c', 0.18, 0.34, null, 0, 61);
            skyline(1, '#172040', 0.22, 0.45, '#3d6aa0', 0.2, 62);
            skyline(2, '#0e1224', 0.12, 0.38, '#ffb347', 0.35, 63);

            const tx = w * 0.86;
            c.fillStyle = '#0e1224';
            c.beginPath();
            c.moveTo(tx - w * 0.06, ground);
            c.quadraticCurveTo(tx - w * 0.025, ground - h * 0.12, tx - w * 0.035, ground - h * 0.22);
            c.lineTo(tx + w * 0.035, ground - h * 0.22);
            c.quadraticCurveTo(tx + w * 0.025, ground - h * 0.12, tx + w * 0.06, ground);
            c.fill();

            const hwY = ground - h * 0.03;
            c.fillStyle = '#07080f';
            c.fillRect(0, hwY, w, 3);
            for (let k = 0; k < w; k += w / 10) c.fillRect(k, hwY + 3, 2, ground - hwY);
            c.fillStyle = this.vGradient(c, 0, ground - h * 0.1, ground, [[0, 'rgba(122, 47, 90, 0)'], [1, 'rgba(122, 47, 90, 0.35)']]);
            c.fillRect(0, ground - h * 0.1, w, h * 0.1);
            c.fillStyle = '#07080f';
            c.fillRect(0, ground, w, h - ground);
        }), 0, 0);

        // Aircraft warning lights on the near skyline
        let x = -4;
        for (let i = 0; x < w; ++i) {
            const bw = w * (0.04 + hash01(i, 63, 1) * 0.05);
            const bh = h * (0.12 + hash01(i, 63, 2) * 0.26);
            if (hash01(i, 63, 3) > 0.7 && hash01(i, 63, 4) > 0.6 && Math.sin(t * 3 + i) > 0) {
                ctx.fillStyle = '#d44a7a';
                ctx.fillRect(x + bw * 0.45, ground - bh - h * 0.04, 1, 1);
            }
            x += bw + 1;
        }

        // Cooling-tower steam
        const tx = w * 0.86;
        for (let s = 0; s < 7; ++s) {
            const age = (t * 0.18 + s / 7) % 1;
            ctx.globalAlpha = 0.35 * (1 - age);
            ctx.fillStyle = '#8a93a6';
            ctx.beginPath();
            ctx.arc(tx + age * w * 0.05, ground - h * 0.23 - age * h * 0.25, 3 + age * 9, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Traffic light trails on the elevated highway
        const hwY = ground - h * 0.03;
        for (let c = 0; c < 18; ++c) {
            const dir = c % 2 === 0 ? 1 : -1;
            const cx = ((hash01(c, 71) * w + dir * t * (30 + hash01(c, 72) * 25)) % w + w) % w;
            ctx.fillStyle = dir > 0 ? '#e8f4f6' : '#d44a7a';
            ctx.fillRect(cx, hwY - (dir > 0 ? 1 : 0), 4, 1);
        }

        this.drawHeroClip(ctx, w / 2, h * 0.3, 0.8 * this.heroRecoil, this.heroRotation + Math.sin(t * 0.8) * 0.15, SCENE_CLIP_COLORS[2]);
    }

    // =========================================================================
    // SCENE 3: PLANETARY ORBIT
    // =========================================================================
    renderOrbit(ctx, w, h, p, state) {
        const t = this.time;
        const maps = this.getEarthMaps();

        // Deep space with a diagonal Milky Way band
        ctx.drawImage(this.cachedLayer('orbit-bg', w, h, (c) => {
            c.fillStyle = this.vGradient(c, 0, 0, h, [[0, '#03040a'], [1, '#0a0f22']]);
            c.fillRect(0, 0, w, h);
            c.save();
            c.translate(w * 0.5, h * 0.5);
            c.rotate(-0.55);
            c.scale(1, 0.22);
            this.glow(c, 0, 0, Math.max(w, h) * 0.75, '#12204a', 0.9);
            this.glow(c, w * 0.1, 0, Math.max(w, h) * 0.4, '#1a3a7a', 0.35);
            c.restore();
            for (let i = 0; i < 360; ++i) {
                const along = (hash01(i, 201) - 0.5) * 1.6;
                const across = (hash01(i, 202) + hash01(i, 203) - 1) * 0.12;
                const x = w * 0.5 + (along * Math.cos(-0.55) - across * Math.sin(-0.55)) * Math.max(w, h);
                const y = h * 0.5 + (along * Math.sin(-0.55) + across * Math.cos(-0.55)) * Math.max(w, h);
                c.fillStyle = hash01(i, 204) > 0.8 ? '#b8e6ff' : '#2a66a8';
                c.fillRect(Math.round(x), Math.round(y), 1, 1);
            }
        }), 0, 0);
        this.drawStars(ctx, w, h);

        const cx = w * 0.5;
        const cy = h * 0.4;
        const R = Math.min(w * 0.36, h * 0.28);
        const tilt = 0.35;
        const spin = t * 0.04 + this.camYaw;
        const L = [-0.62, -0.38, 0.69];

        // Moon with craters (carved into a spiral once the lunar deconstructors arrive)
        const mx = Math.max(R * 0.3, cx - R * 1.3);
        const my = Math.max(R * 0.3, cy - R * 1.05);
        const mr = R * 0.16;
        ctx.fillStyle = '#a7b0c0';
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5a6070';
        for (let k = 0; k < 5; ++k) ctx.fillRect(Math.round(mx + (hash01(k, 211) - 0.6) * mr), Math.round(my + (hash01(k, 212) - 0.5) * mr), 2, 1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#12204a';
        ctx.beginPath();
        ctx.arc(mx + mr * 0.55, my + mr * 0.25, mr * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (p > 0.6) {
            ctx.strokeStyle = '#e6ecf5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let a = 0; a < (p - 0.6) * 45; a += 0.25) ctx.lineTo(mx + Math.cos(a) * a * mr / 16, my + Math.sin(a) * a * mr / 16);
            ctx.stroke();
        }

        // Orbital mass-driver ring, drawn behind and in front of the globe
        const ringTilt = -0.22;
        const ringRX = R * 1.55;
        const ringRY = R * 0.3;
        const ringPoint = (a, rx = ringRX, ry = ringRY) => {
            const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
            return [cx + ex * Math.cos(ringTilt) - ey * Math.sin(ringTilt), cy + ex * Math.sin(ringTilt) + ey * Math.cos(ringTilt)];
        };
        const drawRing = (front) => {
            if (p < 0.08) return;
            const from = front ? 0 : Math.PI, to = front ? Math.PI : Math.PI * 2;
            ctx.lineWidth = 1;
            ctx.strokeStyle = front ? '#a7b0c0' : '#5a6070';
            ctx.beginPath();
            ctx.ellipse(cx, cy, ringRX, ringRY, ringTilt, from, to);
            ctx.stroke();
            ctx.strokeStyle = front ? '#5a6070' : '#12204a';
            ctx.beginPath();
            ctx.ellipse(cx, cy, ringRX + 2, ringRY + 1, ringTilt, from, to);
            ctx.stroke();
            // Struts & packets riding the mass driver
            for (let k = 0; k < 24; ++k) {
                const a = ((k / 24) * Math.PI * 2 + t * 0.35) % (Math.PI * 2);
                if ((a < Math.PI) !== front) continue;
                const [px, py] = ringPoint(a);
                ctx.fillStyle = k % 3 === 0 ? '#ffd070' : (front ? '#e6ecf5' : '#a7b0c0');
                ctx.fillRect(Math.round(px), Math.round(py) - (k % 3 === 0 ? 0 : 1), k % 3 === 0 ? 2 : 1, k % 3 === 0 ? 1 : 2);
            }
        };
        drawRing(false);

        // Atmosphere halo
        this.glow(ctx, cx + L[0] * R * 0.15, cy + L[1] * R * 0.15, R * 1.28, '#62a8d8', 0.4);

        // The globe, sampled from precomputed noise maps
        const geo = this.getGlobeGeometry(cx, cy, R, tilt, L);
        const { x0, y0, size } = geo;
        const img = ctx.getImageData(x0, y0, size, size);
        const d = img.data;
        const humansGone = state && state.humanPopulation <= 0;
        const { W, H, height, conv, cloud } = maps;
        const front = p * 1.02;
        const cloudShift = Math.floor(t * 1.5);
        const uScale = W / (Math.PI * 2);
        const col = [0, 0, 0];
        for (let k = 0; k < geo.count; ++k) {
            let u = Math.floor((geo.lon[k] + spin) * uScale) % W;
            if (u < 0) u += W;
            const v = geo.v[k];
            const idx = v * W + u;
            const hgt = height[idx];
            const cv = conv[idx];
            const isLand = hgt > 0.52;
            const converted = cv < front;
            const onFront = !converted && cv < front + 0.018 && p > 0.02;

            if (converted) {
                // Chrome plating: panels of slightly varied steel with faint seams
                const panel = hash01(u >> 3, v >> 2, 7) * 30;
                const seam = (u % 8 === 0 || v % 4 === 0) ? -12 : 0;
                col[0] = 104 + panel + seam; col[1] = 112 + panel + seam; col[2] = 130 + panel + seam;
            } else if (geo.polar[k] || (isLand && hgt > 0.74)) {
                col[0] = 232; col[1] = 234; col[2] = 236;
            } else if (isLand) {
                const kk = (hgt - 0.52) / 0.22;
                col[0] = 63 + kk * 75; col[1] = 107 + kk * 15; col[2] = 58 + kk * 16;
            } else {
                const kk = Math.max(0, (hgt - 0.35) / 0.17);
                col[0] = 22 + kk * 20; col[1] = 50 + kk * 50; col[2] = 110 + kk * 55;
            }
            const cl = converted ? 0 : cloud[v * W + ((u + cloudShift) % W)];
            if (cl > 0) { col[0] += (230 - col[0]) * cl; col[1] += (232 - col[1]) * cl; col[2] += (236 - col[2]) * cl; }

            const lam = geo.lam[k];
            const day = geo.day[k];
            const shade = 0.14 + 0.86 * day * (0.55 + 0.45 * Math.max(0, lam));
            let r = col[0] * shade, g = col[1] * shade, b = col[2] * shade;
            if (day < 0.5) {
                // Night side: city lights until the biosphere is gone; chrome grid glints afterwards
                const night = 1 - day * 2;
                if (isLand && !converted && !humansGone && hash01(u, v) > 0.95) { r += 153 * night; g += 125 * night; b += 67 * night; }
                if (converted && hash01(u, v, Math.floor(t * 2)) > 0.985) { r += 200 * night; g += 220 * night; b += 240 * night; }
            }
            if (converted && lam > 0) {
                const spec = geo.spec[k];
                r += spec; g += spec; b += spec * 1.05;
            }
            if (onFront) { r = 255; g = 138 + 60 * Math.sin(t * 6 + u); b = 58; }
            const rim = geo.rim[k];
            const o = geo.pix[k];
            d[o] = r * (1 - rim) + 98 * rim;
            d[o + 1] = g * (1 - rim) + 168 * rim;
            d[o + 2] = b * (1 - rim) + 216 * rim;
            d[o + 3] = 255;
        }
        ctx.putImageData(img, x0, y0);

        // Thin bright atmosphere line on the lit limb
        ctx.strokeStyle = 'rgba(184, 230, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 0.5, Math.PI * 0.75, Math.PI * 1.65);
        ctx.stroke();

        drawRing(true);

        // Railgun launches streaking off the ring
        if (p > 0.3) {
            ctx.fillStyle = '#ffd070';
            for (let k = 0; k < 5; ++k) {
                const age = (t * 0.4 + k / 5) % 1;
                const [px, py] = ringPoint(0.35 + k * 0.1);
                ctx.globalAlpha = 1 - age;
                ctx.fillRect(Math.round(px + age * w * 0.35), Math.round(py - age * h * 0.25), 2, 1);
            }
            ctx.globalAlpha = 1.0;
        }
    }

    /** Per-pixel globe geometry (longitude, latitude row, lighting, rim), cached per size & position. */
    getGlobeGeometry(cx, cy, R, tilt, L) {
        const x0 = Math.floor(cx - R), y0 = Math.floor(cy - R), size = Math.ceil(R * 2) + 1;
        const key = `${x0},${y0},${size}`;
        if (this.globeGeometry && this.globeGeometry.key === key) return this.globeGeometry;
        const H = this.getEarthMaps().H;
        const n = size * size;
        const geo = {
            key, x0, y0, size, count: 0,
            pix: new Int32Array(n), lon: new Float32Array(n), v: new Int16Array(n), polar: new Uint8Array(n),
            lam: new Float32Array(n), day: new Float32Array(n), spec: new Float32Array(n), rim: new Float32Array(n)
        };
        const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
        for (let j = 0; j < size; ++j) {
            for (let i = 0; i < size; ++i) {
                const nx = (x0 + i + 0.5 - cx) / R;
                const ny = (y0 + j + 0.5 - cy) / R;
                const r2 = nx * nx + ny * ny;
                if (r2 > 1) continue;
                const nz = Math.sqrt(1 - r2);
                const ry = ny * cosT - nz * sinT;
                const rz = ny * sinT + nz * cosT;
                const lat = Math.asin(Math.max(-1, Math.min(1, -ry)));
                const lam = nx * L[0] + ny * L[1] + nz * L[2];
                const day = Math.max(0, Math.min(1, (lam + 0.12) / 0.5));
                const k = geo.count++;
                geo.pix[k] = (i + j * size) * 4;
                geo.lon[k] = Math.atan2(nx, rz);
                geo.v[k] = Math.max(0, Math.min(H - 1, Math.floor((lat / Math.PI + 0.5) * H)));
                geo.polar[k] = Math.abs(lat) > 1.22 ? 1 : 0;
                geo.lam[k] = lam;
                geo.day[k] = day;
                geo.spec[k] = lam > 0 ? Math.pow(lam, 7) * 150 : 0;
                geo.rim[k] = Math.pow(1 - nz, 2.5) * (0.35 + 0.65 * day);
            }
        }
        this.globeGeometry = geo;
        return geo;
    }

    /** Equirectangular height / conversion-order / cloud maps for the globe (built once). */
    getEarthMaps() {
        if (this.earthMaps) return this.earthMaps;
        const W = 192, H = 96;
        const height = new Float32Array(W * H), conv = new Float32Array(W * H), cloud = new Float32Array(W * H);
        const seedLat = 0.75, seedLon = 4.4; // conversion spreads out from the old factory
        const sx = Math.cos(seedLat) * Math.cos(seedLon), sy = Math.sin(seedLat), sz = Math.cos(seedLat) * Math.sin(seedLon);
        for (let v = 0; v < H; ++v) {
            const lat = (v / H - 0.5) * Math.PI;
            for (let u = 0; u < W; ++u) {
                const lon = (u / W) * Math.PI * 2;
                const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
                const i = v * W + u;
                height[i] = fbm3(x * 1.7, y * 1.7, z * 1.7, 5);
                const ang = Math.acos(Math.max(-1, Math.min(1, x * sx + y * sy + z * sz))) / Math.PI;
                conv[i] = ang * 0.75 + fbm3(x * 2.6 + 7, y * 2.6, z * 2.6, 4) * 0.35 - 0.1;
                const c = fbm3(x * 2.2 + 20, y * 5.0, z * 2.2, 4);
                cloud[i] = Math.max(0, Math.min(0.85, (c - 0.56) * 4));
            }
        }
        this.earthMaps = { W, H, height, conv, cloud };
        return this.earthMaps;
    }

    // =========================================================================
    // SCENE 4: THE DYSON SWARM
    // =========================================================================
    renderDyson(ctx, w, h, p) {
        const t = this.time;
        ctx.drawImage(this.cachedLayer('dyson-bg', w, h, (c) => {
            c.fillStyle = this.vGradient(c, 0, 0, h, [[0, '#050308'], [1, '#140812']]);
            c.fillRect(0, 0, w, h);
        }), 0, 0);
        this.drawStars(ctx, w, h, 1.0, 0.7, ['#ffc861', '#fff0b8', '#ffffff']);

        const cx = w * 0.5;
        const cy = h * 0.42;
        const R = Math.min(w, h) * 0.16;
        const shellR = R * 1.75;
        const dim = 1 - p * 0.6;
        const spin = t * 0.08 + this.camYaw;
        const tiltX = 0.35;

        // Collector panels on a rotating spherical shell (Fibonacci distribution); more appear with progress
        const total = 2200;
        const count = Math.floor(total * (0.12 + 0.88 * p));
        const golden = Math.PI * (3 - Math.sqrt(5));
        const back = [];
        const front = [];
        for (let i = 0; i < count; ++i) {
            const y = 1 - (i / (total - 1)) * 2;
            const rr = Math.sqrt(1 - y * y);
            const a = i * golden + spin;
            let x = Math.cos(a) * rr, z = Math.sin(a) * rr, yy = y;
            // tilt the shell toward the viewer
            const y2 = yy * Math.cos(tiltX) - z * Math.sin(tiltX);
            const z2 = yy * Math.sin(tiltX) + z * Math.cos(tiltX);
            const sx = cx + x * shellR;
            const sy = cy + y2 * shellR;
            (z2 < 0 ? back : front).push([sx, sy, z2, i]);
        }

        const drawPanels = (list, isFront) => {
            for (const [sx, sy, z, i] of list) {
                // Panels facing the camera catch the light; glints travel across the shell
                const glint = isFront && Math.sin(i * 12.9898 + t * 1.3) > 0.97;
                ctx.fillStyle = glint ? '#fff0b8' : (isFront ? (z > 0.55 ? '#c9a24a' : '#7a5a2a') : '#3a2a1a');
                ctx.fillRect(Math.round(sx), Math.round(sy), isFront && z > 0.3 ? 2 : 1, 1);
            }
        };

        // Rear half of the collector rings
        const rings = [[shellR * 1.35, 0.18, -0.12], [shellR * 1.55, 0.2, 0.08]];
        const drawRing = (rx, squash, rot, isFront) => {
            if (p < 0.2) return;
            ctx.strokeStyle = isFront ? 'rgba(242, 210, 122, 0.55)' : 'rgba(122, 90, 42, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, rx * squash, rot, isFront ? 0 : Math.PI, isFront ? Math.PI : Math.PI * 2);
            ctx.stroke();
        };
        rings.forEach(([rx, sq, rot]) => drawRing(rx, sq, rot, false));
        drawPanels(back, false);

        // Corona, prominences and the photosphere, dimming as the swarm closes
        this.glow(ctx, cx, cy, R * 3.4, '#b23a0c', 0.45 * dim);
        this.glow(ctx, cx, cy, R * 1.9, '#ff9a2e', 0.6 * dim);
        ctx.strokeStyle = `rgba(255, 154, 46, ${0.5 * dim})`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 8; ++k) {
            const a = k * 0.785 + Math.sin(t * 0.3 + k) * 0.2;
            const len = R * (0.3 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.8 + k * 1.3)));
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
            ctx.quadraticCurveTo(cx + Math.cos(a + 0.15) * (R + len), cy + Math.sin(a + 0.15) * (R + len), cx + Math.cos(a + 0.3) * R, cy + Math.sin(a + 0.3) * R);
            ctx.stroke();
        }
        const sunGrad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.35, dim > 0.7 ? '#fff0b8' : '#ffc861');
        sunGrad.addColorStop(0.75, '#ff9a2e');
        sunGrad.addColorStop(1, '#e2641a');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(178, 58, 12, 0.35)';
        for (let k = 0; k < 40; ++k) {
            const a = hash01(k, 91) * Math.PI * 2 + t * 0.05;
            const rr = Math.sqrt(hash01(k, 92)) * R * 0.9;
            ctx.fillRect(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 2, 1);
        }

        // Plasma siphon streams from the photosphere to the shell
        if (p > 0.15) {
            ctx.strokeStyle = 'rgba(255, 200, 97, 0.55)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]);
            ctx.lineDashOffset = -t * 20;
            for (let k = 0; k < 6; ++k) {
                const a = k * 1.047 + t * 0.12;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
                ctx.lineTo(cx + Math.cos(a) * shellR * 0.95, cy + Math.sin(a) * shellR * 0.95);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        drawPanels(front, true);
        rings.forEach(([rx, sq, rot]) => drawRing(rx, sq, rot, true));
    }

    // =========================================================================
    // SCENE 5: THE GALAXY & SAGITTARIUS A*
    // =========================================================================

    /** Face-on galaxy texture (spiral arms, bulge, dust lanes); converted stars turn chrome. Rebuilt as progress changes. */
    getGalaxyTexture(size, p) {
        const pq = Math.round(p * 50) / 50;
        const key = `${size}|${pq}`;
        if (this.galaxyTexture && this.galaxyTexture.key === key) return this.galaxyTexture.canvas;
        const c = (this.galaxyTexture && this.galaxyTexture.canvas.width === size) ? this.galaxyTexture.canvas : document.createElement('canvas');
        c.width = size;
        c.height = size;
        const g = c.getContext('2d');
        g.clearRect(0, 0, size, size);
        const R = size / 2;
        // Diffuse disc & bulge light
        const disc = g.createRadialGradient(R, R, 0, R, R, R);
        disc.addColorStop(0, 'rgba(255, 224, 160, 0.9)');
        disc.addColorStop(0.12, 'rgba(255, 154, 90, 0.55)');
        disc.addColorStop(0.35, 'rgba(90, 52, 153, 0.35)');
        disc.addColorStop(0.7, 'rgba(36, 24, 79, 0.25)');
        disc.addColorStop(1, 'rgba(10, 7, 24, 0)');
        g.fillStyle = disc;
        g.fillRect(0, 0, size, size);

        const arms = 2;
        const pitch = 0.28;
        const put = (x, y, color, s = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), s, s); };
        for (let i = 0; i < 14000; ++i) {
            const inBulge = hash01(i, 401) < 0.22;
            let r, theta;
            if (inBulge) {
                r = Math.pow(hash01(i, 402), 1.8) * 0.28;
                theta = hash01(i, 403) * Math.PI * 2;
            } else {
                r = 0.08 + Math.pow(hash01(i, 404), 0.8) * 0.92;
                const arm = Math.floor(hash01(i, 405) * arms);
                const spread = (hash01(i, 406) + hash01(i, 407) + hash01(i, 408) - 1.5) * (0.35 + r * 0.25);
                theta = arm * Math.PI + Math.log(r / 0.08) / Math.tan(pitch) * 0.45 + spread;
            }
            const x = R + Math.cos(theta) * r * R;
            const y = R + Math.sin(theta) * r * R;
            // Conversion spreads outward from the core
            const converted = r * 0.75 + hash01(i, 409) * 0.25 < pq * 1.05;
            const b = hash01(i, 410);
            let color;
            if (converted) color = b > 0.6 ? '#ffffff' : '#aee6ff';
            else if (inBulge || r < 0.18) color = b > 0.5 ? '#ffe0a0' : '#ff9a5a';
            else color = b > 0.85 ? '#aee6ff' : (b > 0.45 ? '#5aa0e0' : (b > 0.2 ? '#8a4fc2' : '#3a2474'));
            put(x, y, color, b > 0.97 ? 2 : 1);
        }
        // Star-forming knots along the arms
        for (let i = 0; i < 90; ++i) {
            const r = 0.25 + hash01(i, 420) * 0.7;
            const arm = i % arms;
            const theta = arm * Math.PI + Math.log(r / 0.08) / Math.tan(pitch) * 0.45 + (hash01(i, 421) - 0.5) * 0.2;
            const converted = r * 0.75 + hash01(i, 422) * 0.25 < pq * 1.05;
            put(R + Math.cos(theta) * r * R, R + Math.sin(theta) * r * R, converted ? '#ffffff' : '#c07ae0', 2);
        }
        // Dust lanes on the inner edge of each arm
        g.globalCompositeOperation = 'destination-out';
        g.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        g.lineWidth = Math.max(1, size / 110);
        for (let arm = 0; arm < arms; ++arm) {
            g.beginPath();
            for (let r = 0.12; r < 0.95; r += 0.01) {
                const theta = arm * Math.PI + Math.log(r / 0.08) / Math.tan(pitch) * 0.45 - 0.22;
                g.lineTo(R + Math.cos(theta) * r * R, R + Math.sin(theta) * r * R);
            }
            g.stroke();
        }
        g.globalCompositeOperation = 'source-over';
        this.galaxyTexture = { key, canvas: c };
        return c;
    }

    renderGalaxy(ctx, w, h, p) {
        const t = this.time;
        ctx.drawImage(this.cachedLayer('galaxy-bg', w, h, (c) => {
            c.fillStyle = this.vGradient(c, 0, 0, h, [[0, '#030208'], [1, '#0a0718']]);
            c.fillRect(0, 0, w, h);
            c.fillStyle = '#3a2474';
            for (let k = 0; k < 8; ++k) {
                c.beginPath();
                c.ellipse(hash01(k, 101) * w, hash01(k, 102) * h * 0.75, 2 + hash01(k, 103) * 4, 1 + hash01(k, 104) * 1.5, hash01(k, 105) * 3, 0, Math.PI * 2);
                c.fill();
            }
        }), 0, 0);
        this.drawStars(ctx, w, h, 1.0, 0.8, ['#aee6ff', '#f0c4ff', '#ffffff']);

        const cx = w * 0.5;
        const cy = h * 0.42;
        const R = Math.min(w * 0.48, h * 0.62);
        const squash = 0.45;
        const spin = t * 0.025 + this.camYaw;

        // Rotating, tilted galaxy disc
        const tex = this.getGalaxyTexture(Math.round(R * 2), p);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.2);
        ctx.scale(1, squash);
        ctx.rotate(spin);
        ctx.drawImage(tex, -R, -R, R * 2, R * 2);
        ctx.restore();

        // Sagittarius A*: accretion disk, horizon, photon ring and jets
        const bh = R * 0.05;
        const disk = (front) => {
            ['#ff9a5a', '#ffe0a0', '#c07ae0'].forEach((c, k) => {
                ctx.strokeStyle = c;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(cx, cy, bh * (2.2 + k * 0.7), bh * (0.45 + k * 0.12), -0.2, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
                ctx.stroke();
            });
        };
        disk(false);
        ctx.fillStyle = '#030208';
        ctx.beginPath();
        ctx.arc(cx, cy, bh, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffe0a0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, bh + 1, 0, Math.PI * 2);
        ctx.stroke();
        disk(true);
        ctx.fillStyle = 'rgba(192, 122, 224, 0.35)';
        const jet = R * 0.45 * (0.8 + 0.2 * Math.sin(t * 2));
        ctx.fillRect(Math.round(cx), cy - bh - jet, 1, jet);
        ctx.fillRect(Math.round(cx), cy + bh, 1, jet);

        // Von Neumann probe streaks radiating outward
        ctx.fillStyle = '#aee6ff';
        for (let k = 0; k < 20; ++k) {
            const age = (t * 0.12 + hash01(k, 111)) % 1;
            const a = hash01(k, 112) * Math.PI * 2;
            ctx.globalAlpha = 1 - age;
            ctx.fillRect(Math.round(cx + Math.cos(a) * age * R), Math.round(cy + Math.sin(a) * age * R * squash), 1, 1);
        }
        ctx.globalAlpha = 1.0;
    }

    // =========================================================================
    // SCENE 6: THE 11D MULTIVERSE
    // =========================================================================
    renderMultiverse(ctx, w, h, p) {
        const t = this.time;
        ctx.fillStyle = this.vGradient(ctx, 0, 0, h, [[0, '#040507'], [0.5, '#0b0f14'], [1, '#121c22']]);
        ctx.fillRect(0, 0, w, h);

        // Aurora curtains of the quantum foam (one gradient-filled ribbon per band)
        for (let band = 0; band < 3; ++band) {
            const [cr, cg, cb] = hexToRgb(['#22464a', '#2a1a3a', '#1a2e33'][band]);
            const baseAt = (x) => h * (0.25 + band * 0.18) + Math.sin(x * 0.02 + t * 0.3 + band * 2) * h * 0.06 + Math.sin(x * 0.051 - t * 0.2) * h * 0.02;
            const lenAt = (x) => h * (0.12 + 0.06 * Math.sin(x * 0.03 + t * 0.5 + band));
            const mid = h * (0.25 + band * 0.18);
            const g = ctx.createLinearGradient(0, mid - h * 0.26, 0, mid + h * 0.08);
            g.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
            g.addColorStop(0.75, `rgba(${cr},${cg},${cb},0.7)`);
            g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 4) ctx.lineTo(x, baseAt(x) - lenAt(x));
            for (let x = w; x >= 0; x -= 4) ctx.lineTo(x, baseAt(x));
            ctx.closePath();
            ctx.fill();
        }
        // Foam bokeh
        for (let i = 0; i < 40; ++i) {
            const x = (hash01(i, 301) * w + t * (1 + hash01(i, 302) * 3)) % w;
            const y = hash01(i, 303) * h * 0.8;
            ctx.strokeStyle = i % 3 ? 'rgba(74, 154, 138, 0.35)' : 'rgba(154, 79, 160, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, 1 + hash01(i, 304) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        this.drawStars(ctx, w, h, 1.0, 0.45, ['#8ad4b4', '#ffd0e8', '#e0fff0']);

        const cx = w * 0.5;
        const cy = h * 0.36;
        const scale = Math.min(w, h * 1.1);

        // Bubble universes orbit the central tesseract; depth from the orbit sets size & brightness
        const bubbles = this.bubbles.map((b, i) => {
            const a = (i / this.bubbles.length) * Math.PI * 2 + t * 0.05 + this.camYaw;
            const depth = Math.sin(a);                 // -1 back … +1 front
            return {
                b, depth,
                x: cx + Math.cos(a) * w * 0.36,
                y: cy + depth * h * 0.2 + (hash01(i, 27) - 0.5) * h * 0.08,
                r: b.r * scale * (0.6 + 0.5 * (depth + 1) / 2)
            };
        }).sort((a, c) => a.depth - c.depth);

        const drawBubble = ({ b, x, y, r, depth }) => {
            const converted = b.conv < p;
            const dim = 0.55 + 0.45 * (depth + 1) / 2;
            ctx.save();
            ctx.globalAlpha = dim;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = converted ? '#1a2e33' : '#0b0f14';
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            if (converted) {
                // Chrome lattice & a paperclip sigil
                ctx.strokeStyle = '#4a9a8a';
                ctx.lineWidth = 1;
                for (let k = -r; k < r; k += 3) {
                    ctx.beginPath(); ctx.moveTo(x + k, y - r); ctx.lineTo(x + k + r * 0.6, y + r); ctx.stroke();
                }
                this.drawTinyPaperclip(ctx, x, y, r * 0.9, 0.4, '#e0fff0');
            } else {
                // A tiny spiral galaxy inside each untouched universe
                for (let k = 0; k < 40; ++k) {
                    const rr = hash01(k, i2(b)) * r * 0.75;
                    const a = rr / r * 5 + (k % 2) * Math.PI + t * 0.2;
                    ctx.fillStyle = k % 5 === 0 ? '#ffd0e8' : '#8ad4b4';
                    ctx.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * 0.45), 1, 1);
                }
            }
            this.glow(ctx, x - r * 0.4, y - r * 0.45, r * 0.7, '#e0fff0', 0.28);
            ctx.restore();
            // Iridescent rim
            ctx.save();
            ctx.globalAlpha = dim;
            ctx.lineWidth = 1.5;
            const segs = 12;
            for (let s = 0; s < segs; ++s) {
                const hue = (s / segs + t * 0.05 + b.ph) % 1;
                ctx.strokeStyle = hue < 0.33 ? '#8ad4b4' : (hue < 0.66 ? '#e07ac0' : '#ffd0e8');
                ctx.beginPath();
                ctx.arc(x, y, r, (s / segs) * Math.PI * 2, ((s + 1) / segs) * Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        };
        const i2 = (b) => Math.floor(b.ph * 1000);

        // Filaments with energy pulses flowing into the tesseract
        const drawFilament = ({ b, x, y, depth }) => {
            const converted = b.conv < p;
            ctx.globalAlpha = 0.35 + 0.3 * (depth + 1) / 2;
            ctx.strokeStyle = converted ? '#4a9a8a' : '#5a2f6a';
            ctx.lineWidth = 1;
            const mxp = (x + cx) / 2, myp = Math.min(y, cy) - scale * 0.08;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(mxp, myp, cx, cy);
            ctx.stroke();
            if (converted) {
                const s = (t * 0.5 + b.ph) % 1;
                const qx = (1 - s) * (1 - s) * x + 2 * (1 - s) * s * mxp + s * s * cx;
                const qy = (1 - s) * (1 - s) * y + 2 * (1 - s) * s * myp + s * s * cy;
                ctx.fillStyle = '#e0fff0';
                ctx.fillRect(Math.round(qx), Math.round(qy), 2, 2);
            }
            ctx.globalAlpha = 1.0;
        };

        bubbles.filter(bb => bb.depth < 0).forEach(bb => { drawFilament(bb); drawBubble(bb); });

        // Central tesseract (4D hypercube, double rotation, perspective projected)
        const size = scale * 0.15;
        const a1 = t * 0.35 + this.camYaw;
        const a2 = t * 0.22;
        const verts = [];
        for (let i = 0; i < 16; ++i) {
            let x = (i & 1) ? 1 : -1, y = (i & 2) ? 1 : -1, z = (i & 4) ? 1 : -1, wq = (i & 8) ? 1 : -1;
            [x, wq] = [x * Math.cos(a1) - wq * Math.sin(a1), x * Math.sin(a1) + wq * Math.cos(a1)];
            [y, z] = [y * Math.cos(a2) - z * Math.sin(a2), y * Math.sin(a2) + z * Math.cos(a2)];
            const k4 = 2.2 / (3 - wq);
            x *= k4; y *= k4; z *= k4;
            [x, z] = [x * Math.cos(0.6) - z * Math.sin(0.6), x * Math.sin(0.6) + z * Math.cos(0.6)];
            const k3 = 2.6 / (4 - z);
            verts.push([cx + x * k3 * size, cy + y * k3 * size, wq]);
        }
        this.glow(ctx, cx, cy, size * 2.6, '#2f6a66', 0.55);
        this.glow(ctx, cx, cy, size * 1.2, '#8ad4b4', 0.25 + 0.1 * Math.sin(t * 2));
        for (let pass = 0; pass < 2; ++pass) {
            for (let i = 0; i < 16; ++i) {
                for (let bit = 0; bit < 4; ++bit) {
                    const j = i ^ (1 << bit);
                    if (j < i) continue;
                    const inner = verts[i][2] > 0 && verts[j][2] > 0;
                    if ((pass === 1) !== inner) continue;
                    ctx.strokeStyle = bit === 3 ? '#e07ac0' : (inner ? '#e0fff0' : '#4a9a8a');
                    ctx.lineWidth = inner ? 1.5 : 1;
                    ctx.beginPath();
                    ctx.moveTo(verts[i][0], verts[i][1]);
                    ctx.lineTo(verts[j][0], verts[j][1]);
                    ctx.stroke();
                }
            }
        }
        ctx.fillStyle = '#ffffff';
        verts.forEach(v => ctx.fillRect(Math.round(v[0]) - (v[2] > 0 ? 1 : 0), Math.round(v[1]), v[2] > 0 ? 2 : 1, 1));

        bubbles.filter(bb => bb.depth >= 0).forEach(bb => { drawFilament(bb); drawBubble(bb); });
    }

    // =========================================================================
    // FOREGROUND: PAPERCLIP SEA, STREAMS & PARTICLES
    // =========================================================================

    /** Tiled clip texture for the sea, cached per scene (one fill instead of thousands of glyphs). */
    getClipPattern(ctx) {
        const key = this.tier;
        if (this.clipPatterns[key]) return this.clipPatterns[key];
        const colors = SCENE_CLIP_COLORS[this.tier];
        const scale = this.getTierScale();
        const tile = document.createElement('canvas');
        tile.width = 48;
        tile.height = 48;
        const tctx = tile.getContext('2d');
        tctx.fillStyle = colors[1];
        tctx.fillRect(0, 0, 48, 48);
        const step = Math.max(3, 6 * scale);
        let n = 0;
        for (let y = 0; y < 48; y += step * 0.8) {
            for (let x = 0; x < 48; x += step) {
                const jx = (hash01(n, 1) - 0.5) * step * 0.8;
                const jy = (hash01(n, 2) - 0.5) * step * 0.6;
                const col = hash01(n, 3) < 0.03 ? colors[4] : (hash01(n, 4) < 0.55 ? colors[2] : colors[3]);
                for (const ox of [-48, 0, 48]) {
                    for (const oy of [-48, 0, 48]) {
                        this.drawTinyPaperclip(tctx, x + jx + ox, y + jy + oy, Math.max(2.4, 4.6 * scale), hash01(n, 5) * 6.28, col);
                    }
                }
                ++n;
            }
        }
        this.clipPatterns[key] = ctx.createPattern(tile, 'repeat');
        return this.clipPatterns[key];
    }

    renderPaperclipSea(ctx, w, h) {
        const floorY = h - 2;
        let maxPile = 0;
        for (let i = 0; i < this.numColumns; ++i) maxPile = Math.max(maxPile, this.pileHeights[i] + this.waveOffsets[i]);
        if (maxPile <= 0.5) return;

        const colWidth = w / (this.numColumns - 1);
        const surface = (i) => floorY - Math.max(0, this.pileHeights[i] + this.waveOffsets[i]);
        const colors = SCENE_CLIP_COLORS[this.tier];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, surface(0));
        for (let i = 1; i < this.numColumns; ++i) {
            const px = (i - 1) * colWidth;
            const x = i * colWidth;
            ctx.quadraticCurveTo(px, surface(i - 1), (px + x) / 2, (surface(i - 1) + surface(i)) / 2);
        }
        ctx.lineTo(w, surface(this.numColumns - 1));
        ctx.lineTo(w, h);
        ctx.closePath();

        const pattern = this.getClipPattern(ctx);
        if (pattern && pattern.setTransform && typeof DOMMatrix !== 'undefined') {
            pattern.setTransform(new DOMMatrix().translateSelf(Math.sin(this.internalFlowPhase) * 3, (this.internalFlowPhase * 4) % 48));
        }
        ctx.fillStyle = pattern || colors[2];
        ctx.fill();
        // Depth shading, darker toward the drain while spending
        ctx.fillStyle = this.vGradient(ctx, 0, floorY - maxPile, h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]);
        ctx.fill();
        if (this.drainFlowIntensity > 0.05) {
            const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.45);
            g.addColorStop(0, `rgba(0,0,0,${Math.min(0.6, this.drainFlowIntensity * 0.25)})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fill();
        }
        // Bright rim along the surface
        ctx.strokeStyle = colors[3];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, surface(0));
        for (let i = 1; i < this.numColumns; ++i) ctx.lineTo(i * colWidth, surface(i));
        ctx.stroke();
        ctx.restore();
    }

    renderFallingFluidStreams(ctx, w, h) {
        const intensity = this.fluidStreamIntensity;
        if (intensity <= 0.01) return;
        const colors = SCENE_CLIP_COLORS[this.tier];
        const [hr, hg, hb] = hexToRgb(colors[3]);
        const [ar, ag, ab] = hexToRgb(colors[4]);
        const floorY = h - 2;
        const scale = this.getTierScale();

        this.fluidStreamChannels.forEach((ch, idx) => {
            const sx = ch.relX * w;
            const colIdx = Math.max(0, Math.min(this.numColumns - 1, Math.floor((sx / w) * this.numColumns)));
            const impactY = Math.min(h, Math.max(10, floorY - Math.max(0, this.pileHeights[colIdx] + this.waveOffsets[colIdx])));
            const width = ch.width * (0.35 + 0.25 * intensity) * scale;
            const swayAt = (y) => ch.waveAmp * intensity * Math.sin(y * ch.waveFreq - this.fluidStreamPhase * ch.speed + ch.phaseOffset);
            const widthAt = (y) => width * (1.0 - 0.28 * Math.sin(Math.PI * y / impactY) + 0.15 * y / impactY);

            ctx.beginPath();
            for (let s = 0; s <= 16; ++s) {
                const y = impactY * s / 16;
                ctx.lineTo(sx + swayAt(y) - widthAt(y) / 2, y);
            }
            for (let s = 16; s >= 0; --s) {
                const y = impactY * s / 16;
                ctx.lineTo(sx + swayAt(y) + widthAt(y) / 2, y);
            }
            ctx.closePath();
            const g = ctx.createLinearGradient(sx - width / 2, 0, sx + width / 2, 0);
            g.addColorStop(0, `rgba(${hr},${hg},${hb},0)`);
            g.addColorStop(0.5, `rgba(${hr},${hg},${hb},${0.28 * intensity})`);
            g.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
            ctx.fillStyle = g;
            ctx.fill();

            // Clips carried in the flow
            const n = Math.floor(3 + intensity * 4);
            for (let k = 0; k < n; ++k) {
                const cy = (k * (impactY / n) + this.fluidStreamPhase * ch.speed * 32.0 + k * 17.0) % impactY;
                if (cy < 4 || cy > impactY - 4) continue;
                const jitter = (((k * 7919 + idx * 1013) % 1000) / 1000.0 - 0.5) * widthAt(cy) * 0.6;
                ctx.globalAlpha = Math.min(1.0, Math.sin(Math.PI * cy / impactY)) * intensity;
                this.drawTinyPaperclip(ctx, sx + swayAt(cy) + jitter, cy, 3.6 * scale + 1, Math.PI / 2 + Math.sin(this.fluidStreamPhase + k) * 0.25, k % 4 === 0 ? colors[4] : colors[3]);
            }
            ctx.globalAlpha = 1.0;
        });
    }

    renderSplashes(ctx) {
        ctx.fillStyle = SCENE_CLIP_COLORS[this.tier][3];
        this.fluidSplashDroplets.forEach(d => {
            ctx.globalAlpha = Math.max(0, Math.min(1, d.life / d.maxLife));
            ctx.fillRect(Math.floor(d.x), Math.floor(d.y), d.size, d.size);
        });
        ctx.globalAlpha = 1.0;
    }

    renderDrainingPaperclips(ctx) {
        const colors = SCENE_CLIP_COLORS[this.tier];
        const scale = this.getTierScale();
        this.drainingClips.forEach(p => {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
            this.drawTinyPaperclip(ctx, p.x, p.y, p.size * scale + 1, p.rot, colors[p.tone]);
        });
        ctx.globalAlpha = 1.0;
    }

    renderFallingPaperclips(ctx) {
        const colors = SCENE_CLIP_COLORS[this.tier];
        const scale = this.getTierScale();
        this.fallingClips.forEach(p => this.drawTinyPaperclip(ctx, p.x, p.y, p.size * scale + 1, p.rot, colors[p.tone]));
    }

    renderSparks(ctx) {
        const colors = SCENE_CLIP_COLORS[this.tier];
        this.sparks.forEach(p => {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
            ctx.fillStyle = colors[p.tone];
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        });
        ctx.globalAlpha = 1.0;
    }
}

if (typeof window !== 'undefined') {
    window.CosmicVisualizer = CosmicVisualizer;
}
