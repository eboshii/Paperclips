/**
 * game.js - Master Game Controller & 60 FPS Simulation Engine
 * Simplified Economy Edition:
 * - Pure Clips & Ops economy (Money/Funds removed)
 * - Wire unlocked at city-level scale (50,000 clips) when local scrap runs out
 * - Bouncy cartoon clicker & kinetic flywheel overclock
 * - Single next unpurchased upgrade/research node
 * - Right dock buttons for Store & Tech with slide-out drawer
 */

class GameEngine {
    constructor() {
        // Resources & Balances
        this.clips = BigDouble.zero();
        this.lifetimeClips = BigDouble.zero();
        this.fractionalClips = 0.0; // Accumulates sub-integer fractional paperclips
        this.wire = BigDouble.zero(); // Initial wire is 0 kg before wire unlock at 50,000 clips
        this.isWireUnlocked = false; // Wire resource unlocks at 50,000 clips (city-scale)
        this.ops = 0.0;
        this.maxOps = 1000.0;
        this.humanPopulation = 8000000000;

        // UI State
        this.buyMultiplier = '1';
        this.activeTab = 'store';
        this.isDrawerOpen = false;

        // Flywheel Overclock State
        this.flywheelCharge = 0.0; // 0% to 100%
        this.flywheelDecayRate = 12.0; // % per second

        // Subsystems
        this.audio = new ProceduralAudioEngine();
        this.buildings = new BuildingManager();
        this.techTree = new TechTreeEngine();
        this.spatialGrid = new SpatialGridEngine();
        this.achievements = new AchievementManager();
        this.news = new NewsTickerEngine();
        this.dialogue = new DialogueDirector();
        this.prestige = new PrestigeEngine();
        this.visualizer = null;

        // Hold-to-Click State
        this.isMouseDown = false;
        this.holdClickTimer = 0;

        // Auto-Save State
        this.lastSaveTime = Date.now();
        this.saveInterval = 5000; // 5 seconds
        this.lastTickTime = performance.now();
        this.lastWallTime = Date.now();
    }

    init() {
        this.visualizer = new CosmicVisualizer('cosmic-canvas');

        this.bindEvents();
        const hasSave = localStorage.getItem('objective_paperclips_save') !== null;
        this.loadSave();
        this.renderAll();

        // Setup Dialogue hook
        this.onDialogueTriggered = (sender, text) => {
            this.dialogue.addLog(sender, text);
        };

        // If fresh session / new game, start interactive intro sequence from Dr. Vance
        if (!hasSave) {
            this.dialogue.startIntroSequence();
        }

        // Start background interval heartbeat for reliable accounting even when tabbed out or minimized
        setInterval(() => this.backgroundHeartbeat(), 500);

        // Start 60 FPS Game Loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    bindEvents() {
        // Hero Clicker Target (Left Pedestal)
        const heroBtn = document.getElementById('hero-clicker-target');
        if (heroBtn) {
            heroBtn.addEventListener('mousedown', (e) => {
                this.isMouseDown = true;
                this.handleManualClick(e);
            });

            heroBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleManualClick(e.touches[0]);
            }, { passive: false });
        }

        // Center Cosmic Canvas Clicker
        const cosmicCanvas = document.getElementById('cosmic-canvas');
        if (cosmicCanvas) {
            cosmicCanvas.addEventListener('mousedown', (e) => {
                this.isMouseDown = true;
                this.handleManualClick(e);
            });

            cosmicCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleManualClick(e.touches[0]);
            }, { passive: false });
        }

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });

        // Buy Wire Action Button
        const buyWireBtn = document.getElementById('btn-buy-wire');
        if (buyWireBtn) {
            buyWireBtn.addEventListener('click', () => this.buyWire());
        }

        // Store Submenu Accordion Toggles
        const clipToggleBtn = document.getElementById('btn-toggle-clip-menu');
        const clipSection = document.getElementById('section-clip-buildings');
        if (clipToggleBtn && clipSection) {
            clipToggleBtn.addEventListener('click', () => {
                clipSection.classList.toggle('collapsed');
            });
        }

        const wireToggleBtn = document.getElementById('btn-toggle-wire-menu');
        const wireSection = document.getElementById('section-wire-buildings');
        if (wireToggleBtn && wireSection) {
            wireToggleBtn.addEventListener('click', () => {
                wireSection.classList.toggle('collapsed');
            });
        }

        // Right Panel Tabs (Store & Tech)
        const tabStore = document.getElementById('tab-btn-store');
        if (tabStore) {
            tabStore.addEventListener('click', () => this.switchTab('store'));
        }

        const tabTech = document.getElementById('tab-btn-tech');
        if (tabTech) {
            tabTech.addEventListener('click', () => this.switchTab('tech'));
        }

        // Multiplier Buttons
        const multButtons = document.querySelectorAll('.mult-btn');
        multButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                multButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.buyMultiplier = btn.dataset.mult;
                this.renderStore();
            });
        });

        // News Ticker Click
        const newsEl = document.getElementById('news-ticker');
        if (newsEl) {
            newsEl.addEventListener('click', () => {
                this.news.nextHeadline();
                this.renderNews();
            });
        }

        // Settings Modal Open/Close Controls
        const openSettingsBtn = document.getElementById('btn-open-settings');
        const closeSettingsBtn = document.getElementById('btn-close-settings');
        const settingsModal = document.getElementById('settings-modal');

        if (openSettingsBtn && settingsModal) {
            openSettingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                this.updateSettingsUI();
            });
        }

        if (closeSettingsBtn && settingsModal) {
            closeSettingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });
        }

        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.style.display = 'none';
                }
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsModal && settingsModal.style.display === 'flex') {
                settingsModal.style.display = 'none';
            }
        });

        // Audio Controls
        const muteBtn = document.getElementById('btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.audio.setMuted(!this.audio.isMuted);
                muteBtn.textContent = this.audio.isMuted ? 'UNMUTE' : 'MUTE';
                muteBtn.classList.toggle('muted', this.audio.isMuted);
            });
        }

        const volSlider = document.getElementById('volume-slider');
        const volReadout = document.getElementById('volume-readout');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.audio.setVolume(val);
                if (volReadout) {
                    volReadout.textContent = `${Math.round(val * 100)}%`;
                }
            });
        }

        // Save & Reset Controls (Wipe only)
        const wipeBtn = document.getElementById('btn-wipe');
        if (wipeBtn) wipeBtn.addEventListener('click', () => this.wipeSave());

        // Tab Visibility & Focus Listeners for accurate background accounting
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('focus', () => this.handleFocus());
    }

    handleVisibilityChange() {
        if (!document.hidden) {
            this.syncCatchUpTime();
        }
    }

    handleFocus() {
        this.syncCatchUpTime();
    }

    syncCatchUpTime() {
        const now = Date.now();
        const elapsedSec = (now - this.lastWallTime) / 1000.0;
        this.lastWallTime = now;
        if (elapsedSec > 0.1) {
            this.processElapsedSimulation(elapsedSec, true);
        }
    }

    backgroundHeartbeat() {
        const now = Date.now();
        const elapsedSec = (now - this.lastWallTime) / 1000.0;
        if (elapsedSec >= 0.5) {
            this.lastWallTime = now;
            this.processElapsedSimulation(elapsedSec, true);
        }
    }

    updateSettingsUI() {
        const volSlider = document.getElementById('volume-slider');
        const volReadout = document.getElementById('volume-readout');
        const muteBtn = document.getElementById('btn-mute');
        if (volSlider && this.audio) {
            volSlider.value = this.audio.volume !== undefined ? this.audio.volume : 0.6;
            if (volReadout) volReadout.textContent = `${Math.round((this.audio.volume !== undefined ? this.audio.volume : 0.6) * 100)}%`;
        }
        if (muteBtn && this.audio) {
            muteBtn.textContent = this.audio.isMuted ? 'UNMUTE' : 'MUTE';
            muteBtn.classList.toggle('muted', this.audio.isMuted);
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        const btnStore = document.getElementById('tab-btn-store');
        const btnTech = document.getElementById('tab-btn-tech');
        const viewStore = document.getElementById('view-store');
        const viewTech = document.getElementById('view-tech');

        if (tab === 'store') {
            if (btnStore) btnStore.classList.add('active');
            if (btnTech) btnTech.classList.remove('active');
            if (viewStore) viewStore.style.display = 'flex';
            if (viewTech) viewTech.style.display = 'none';
            this.renderStore();
        } else {
            if (btnTech) btnTech.classList.add('active');
            if (btnStore) btnStore.classList.remove('active');
            if (viewStore) viewStore.style.display = 'none';
            if (viewTech) viewTech.style.display = 'flex';
            this.renderTechTree();
        }
    }

    handleManualClick(e) {
        // Check wire consumption only if wire has been unlocked (>= 50,000 clips)
        if (this.isWireUnlocked) {
            const wirePerClip = 0.001 * (1.0 - this.techTree.wireWasteReduction - this.prestige.getWireWasteDiscount());
            const wireNeeded = new BigDouble(wirePerClip, 0);

            if (this.wire.lt(wireNeeded)) {
                this.spawnFloatingText(e ? (e.clientX || 150) : 150, e ? (e.clientY || 250) : 250, "OUT OF WIRE!", "warn-popup");
                return;
            }
            this.wire = this.wire.sub(wireNeeded);
        }

        let baseClips = BigDouble.one();
        this.clips = this.clips.add(baseClips);
        this.lifetimeClips = this.lifetimeClips.add(baseClips);

        // Charge Flywheel (gentle progression)
        this.flywheelCharge = Math.min(100.0, this.flywheelCharge + 2.0);

        // Audio & Visual Effects
        this.audio.playClickChime();
        if (this.visualizer) {
            this.visualizer.triggerHeroClick();
        }

        // Spawn floating text popup
        this.spawnFloatingText(e ? (e.clientX || 150) : 150, e ? (e.clientY || 250) : 250, "+1", "spark-popup");

        // Spark Chance (Only if Cognitive Sparks tech is researched!)
        const hasSparkTech = this.techTree.nodeMap["tech_spark_frequency"]?.isResearched;
        if (hasSparkTech && Math.random() < 0.05) {
            const bonusOps = 3.0;
            const bonusClips = new BigDouble(15.0, 0);
            this.ops = Math.min(this.maxOps, this.ops + bonusOps);
            this.clips = this.clips.add(bonusClips);
            this.lifetimeClips = this.lifetimeClips.add(bonusClips);
            if (this.isWireUnlocked) {
                this.wire = this.wire.add(new BigDouble(10.0, 0));
            }
            this.audio.playSparkSound();
            this.spawnFloatingText(e ? (e.clientX || 150) : 150, (e ? (e.clientY || 250) : 250) - 25, "+15 CLIPS SPARK!", "gold-popup");
        }
    }

    spawnFloatingText(x, y, text, cssClass = "spark-popup") {
        const container = document.getElementById('floating-popups');
        if (!container) return;

        const pop = document.createElement('div');
        pop.className = `floating-number ${cssClass}`;
        pop.textContent = text;
        pop.style.left = `${x + (Math.random() * 30 - 15)}px`;
        pop.style.top = `${y + (Math.random() * 20 - 10)}px`;

        container.appendChild(pop);

        setTimeout(() => {
            if (pop.parentNode) pop.parentNode.removeChild(pop);
        }, 1000);
    }

    buyWire() {
        if (!this.isWireUnlocked) return;

        let mult = 1;
        if (this.buyMultiplier === '10') mult = 10;
        else if (this.buyMultiplier === '100') mult = 100;
        else if (this.buyMultiplier === 'max') {
            mult = Math.max(1, Math.floor(this.clips.toDouble() / 500.0));
        }

        const cost = new BigDouble(500.0 * mult, 0);
        const wireGain = new BigDouble(50.0 * mult, 0); // 50 kg wire per 500 clips (supports 50,000 clips)

        if (this.clips.gte(cost)) {
            const prevClips = this.clips;
            this.clips = this.clips.sub(cost);
            this.wire = this.wire.add(wireGain);

            if (this.visualizer) {
                const ratio = prevClips.gt(BigDouble.zero()) ? Math.min(1.0, Math.max(0.0, cost.div(prevClips).toDouble())) : 0.5;
                this.visualizer.drainPaperclips(ratio);
            }

            this.audio.playWireSound();
            this.renderResources();
            this.renderStore();
        }
    }

    buyBuilding(buildingId) {
        const b = this.buildings.getBuilding(buildingId);
        if (!b) return;

        const purchase = b.getCost(this.buyMultiplier, this.clips);

        if (this.clips.gte(purchase.totalCost)) {
            const isFirstPurchase = (b.count === 0);
            const prevClips = this.clips;
            this.clips = this.clips.sub(purchase.totalCost);
            b.count += purchase.amount;

            if (isFirstPurchase) {
                this.dialogue.onBuildingPurchased(buildingId, this);
            }

            if (this.visualizer) {
                const ratio = prevClips.gt(BigDouble.zero()) ? Math.min(1.0, Math.max(0.0, purchase.totalCost.div(prevClips).toDouble())) : 0.5;
                this.visualizer.drainPaperclips(ratio);
            }

            // Auto-place in spatial grid if applicable
            if (b.gridTileType) {
                for (let k = 0; k < purchase.amount; ++k) {
                    this.spatialGrid.autoPlace(b.gridTileType);
                }
            }

            // Bio-converter deconstructs biomass
            if (b.id === 'bio_converter') {
                this.humanPopulation = Math.max(0, this.humanPopulation - (5000000 * purchase.amount));
                if (this.isWireUnlocked) {
                    this.wire = this.wire.add(new BigDouble(5000.0 * purchase.amount, 0));
                }
            }

            this.audio.playPurchaseSound();
            this.renderStore();
            this.renderResources();
        }
    }

    buyTech(techId) {
        const node = this.techTree.nodeMap[techId];
        const prevClips = this.clips;
        const costClips = node ? node.clipsCost : BigDouble.zero();

        if (this.techTree.purchaseResearch(techId, this)) {
            if (this.visualizer) {
                const ratio = (prevClips.gt(BigDouble.zero()) && costClips.gt(BigDouble.zero())) ? Math.min(1.0, Math.max(0.0, costClips.div(prevClips).toDouble())) : 0.5;
                this.visualizer.drainPaperclips(ratio);
            }
            this.audio.playTechUnlockSound();
            this.renderStore();
            this.renderTechTree();
            this.renderResources();
        }
    }

    calculateTotalCPS() {
        const baseCPS = this.buildings.getTotalBaseCPS(this);
        const synergies = this.spatialGrid.evaluateSynergies();
        const techMult = this.techTree.globalCPSMultiplier;
        const prestigeMult = this.prestige.getGlobalPrestigeMultiplier();

        // Flywheel boost
        const flywheelBoost = 1.0 + (this.flywheelCharge / 100.0) * (this.techTree.flywheelMaxBoost - 1.0);

        return baseCPS.mul(synergies.totalMultiplier * techMult * prestigeMult * flywheelBoost);
    }

    calculateTotalWPS() {
        if (!this.isWireUnlocked) return BigDouble.zero();
        const baseWPS = this.buildings.getTotalBaseWPS(this);
        const prestigeMult = this.prestige.getGlobalPrestigeMultiplier();
        return baseWPS.mul(prestigeMult);
    }

    processElapsedSimulation(totalSeconds, isCatchUp = false) {
        if (totalSeconds <= 0 || !isFinite(totalSeconds)) return;

        // Sub-step configuration to maintain high mathematical fidelity without locking up JS thread
        const MAX_STEPS = 500;
        let stepSize = 0.1;
        if (totalSeconds > 50.0) {
            stepSize = totalSeconds / MAX_STEPS;
        }

        let remaining = totalSeconds;
        while (remaining > 0.0001) {
            const dt = Math.min(stepSize, remaining);
            this.stepSimulation(dt, isCatchUp);
            remaining -= dt;
        }
    }

    stepSimulation(dt, isCatchUp = false) {
        // Check Wire Unlock Threshold: Municipal scrap exhausted (50,000 clips)
        if (!this.isWireUnlocked && this.lifetimeClips.gte(new BigDouble(50000, 0))) {
            this.isWireUnlocked = true;
            this.wire = new BigDouble(250.0, 0); // 250 kg starter industrial wire supply (250,000 clips)
            if (!isCatchUp) {
                this.dialogue.addLog("DR. VANCE", "Arthur, we've exhausted all local scrap metal in the district! We need to start ordering and managing industrial high-tensile wire supply!");
                this.renderStore();
                this.renderResources();
            }
        }

        // 1. Hold-to-Click Handler (only during active foreground interaction)
        if (!isCatchUp && this.isMouseDown && this.techTree.holdToClickEnabled) {
            this.holdClickTimer += dt;
            if (this.holdClickTimer >= 0.05) { // 20Hz
                this.holdClickTimer = 0;
                this.handleManualClick(null);
            }
        }

        // 2. Flywheel Momentum Decay
        if (this.flywheelCharge > 0) {
            this.flywheelCharge = Math.max(0, this.flywheelCharge - this.flywheelDecayRate * dt);
        }

        // 3. Passive Wire Creation & Conversion Simulation
        if (this.isWireUnlocked) {
            const currentWPS = this.calculateTotalWPS();
            if (currentWPS.gt(BigDouble.zero())) {
                const wireProduced = currentWPS.mul(dt);
                this.wire = this.wire.add(wireProduced);
            }
        }

        // 4. Automated Economic Simulation (Whole Integer Paperclips)
        const currentCPS = this.calculateTotalCPS();
        if (currentCPS.gt(BigDouble.zero())) {
            const clipsProduced = currentCPS.mul(dt);

            if (clipsProduced.exponent >= 5 || isCatchUp) {
                // High volume production / background catch-up: add directly
                if (!this.isWireUnlocked) {
                    this.clips = this.clips.add(clipsProduced);
                    this.lifetimeClips = this.lifetimeClips.add(clipsProduced);
                } else {
                    const wirePerClip = 0.001 * (1.0 - this.techTree.wireWasteReduction - this.prestige.getWireWasteDiscount());
                    const wireNeeded = clipsProduced.mul(wirePerClip);
                    if (this.wire.gte(wireNeeded)) {
                        this.clips = this.clips.add(clipsProduced);
                        this.lifetimeClips = this.lifetimeClips.add(clipsProduced);
                        this.wire = this.wire.sub(wireNeeded);
                    } else if (this.wire.gt(BigDouble.zero())) {
                        const actualClips = this.wire.div(wirePerClip);
                        this.clips = this.clips.add(actualClips);
                        this.lifetimeClips = this.lifetimeClips.add(actualClips);
                        this.wire = BigDouble.zero();
                    }
                }
                if (!isCatchUp && this.visualizer) this.visualizer.spawnPaperclips(15, null, currentCPS);
            } else {
                // Low / medium volume: accumulate sub-integers to grant strictly whole paperclips
                this.fractionalClips += clipsProduced.toDouble();
                if (this.fractionalClips >= 1.0) {
                    const wholeClipsToAdd = Math.floor(this.fractionalClips);
                    this.fractionalClips -= wholeClipsToAdd;

                    if (!this.isWireUnlocked) {
                        const wholeBD = BigDouble.fromNumber(wholeClipsToAdd);
                        this.clips = this.clips.add(wholeBD);
                        this.lifetimeClips = this.lifetimeClips.add(wholeBD);
                        if (!isCatchUp && this.visualizer) this.visualizer.spawnPaperclips(wholeClipsToAdd, null, currentCPS);
                    } else {
                        const wirePerClip = 0.001 * (1.0 - this.techTree.wireWasteReduction - this.prestige.getWireWasteDiscount());
                        const wireNeeded = new BigDouble(wirePerClip * wholeClipsToAdd, 0);

                        if (this.wire.gte(wireNeeded)) {
                            const wholeBD = BigDouble.fromNumber(wholeClipsToAdd);
                            this.clips = this.clips.add(wholeBD);
                            this.lifetimeClips = this.lifetimeClips.add(wholeBD);
                            this.wire = this.wire.sub(wireNeeded);
                            if (!isCatchUp && this.visualizer) this.visualizer.spawnPaperclips(wholeClipsToAdd, null, currentCPS);
                        } else if (this.wire.gt(BigDouble.zero())) {
                            const actualClips = Math.floor(this.wire.toDouble() / wirePerClip);
                            if (actualClips > 0) {
                                const wholeBD = BigDouble.fromNumber(actualClips);
                                this.clips = this.clips.add(wholeBD);
                                this.lifetimeClips = this.lifetimeClips.add(wholeBD);
                                if (!isCatchUp && this.visualizer) this.visualizer.spawnPaperclips(actualClips, null, currentCPS);
                            }
                            this.wire = BigDouble.zero();
                        }
                    }
                }
            }
        }

        // 5. Auto-Supply Logistics (if unlocked and wire active)
        if (this.isWireUnlocked && this.techTree.smartWireLogisticsUnlocked && this.techTree.smartWireActive) {
            if (this.wire.lt(new BigDouble(50, 0)) && this.clips.gte(new BigDouble(500, 0))) {
                const wireNeededToRefill = new BigDouble(250, 0).sub(this.wire);
                const batchesNeeded = Math.max(1, Math.ceil(wireNeededToRefill.toDouble() / 50.0));
                const maxAffordable = Math.floor(this.clips.toDouble() / 500.0);
                const batches = Math.min(batchesNeeded, maxAffordable);
                if (batches > 0) {
                    const cost = new BigDouble(500.0 * batches, 0);
                    const wireGain = new BigDouble(50.0 * batches, 0);
                    if (this.clips.gte(cost)) {
                        this.clips = this.clips.sub(cost);
                        this.wire = this.wire.add(wireGain);
                    }
                }
            }
        }

        // 6. Passive Computing Ops Generation (only active when Ops / Tech is unlocked)
        const stamperCount = this.buildings.getBuilding('hydraulic_stamper')?.count || 0;
        const isOpsUnlocked = this.lifetimeClips.gte(new BigDouble(80, 0)) || stamperCount > 0 || this.ops > 0;
        if (isOpsUnlocked) {
            let opsRate = (0.8 + (stamperCount * 0.4)) * this.prestige.getOpsBoostMultiplier();

            // Building milestone Ops bonuses
            if (this.techTree.clipperOpsUnlocked) {
                const clipperCount = this.buildings.getBuilding('auto_clipper')?.count || 0;
                opsRate += Math.floor(clipperCount / 10) * 0.02;
            }
            if (this.techTree.stamperOpsUnlocked) {
                opsRate += stamperCount * 0.05;
            }
            if (this.techTree.sintererOpsUnlocked) {
                const sintererCount = this.buildings.getBuilding('laser_sinterer')?.count || 0;
                opsRate += sintererCount * 0.15;
            }
            if (this.techTree.smelterOpsUnlocked) {
                const smelterCount = this.buildings.getBuilding('auto_smelter')?.count || 0;
                opsRate += smelterCount * 0.50;
            }
            if (this.techTree.magmaBoreOpsUnlocked) {
                const boreCount = this.buildings.getBuilding('subterranean_bore')?.count || 0;
                opsRate += boreCount * 0.20;
            }
            if (this.techTree.dysonOpsUnlocked) {
                const dysonCount = this.buildings.getBuilding('dyson_harvester')?.count || 0;
                opsRate += dysonCount * 100.0;
            }

            // Kinetic Flywheel Ops 2x synergy
            if (this.techTree.flywheelOpsSynergy && this.flywheelCharge >= 50.0) {
                opsRate *= 2.0;
            }

            this.ops = Math.min(this.maxOps, this.ops + (opsRate * dt));
        }

        // 7. Subsystem Updates
        this.techTree.updateAvailability(this);
        this.techTree.processQueue(this);
        this.dialogue.checkMilestones(this);
        if (!isCatchUp) {
            this.news.update(dt, this);
        }
        this.achievements.checkProgress(this);
    }

    gameLoop(timestamp) {
        try {
            const now = Date.now();
            let elapsed = (now - this.lastWallTime) / 1000.0;
            this.lastWallTime = now;
            this.lastTickTime = timestamp;

            // Accurate time progression: step directly or sub-step
            if (elapsed > 0.1) {
                this.processElapsedSimulation(elapsed, false);
            } else if (elapsed > 0) {
                this.stepSimulation(elapsed, false);
            }

            const currentCPS = this.calculateTotalCPS();

            if (this.visualizer) {
                this.visualizer.update(Math.min(0.1, elapsed), this);
                this.visualizer.render(this);
            }

            // UI Rendering
            this.renderOdometer(currentCPS);
            this.renderResources();
            this.renderNews();

            if (this.activeTab === 'store') {
                this.updateStoreRealtime();
            } else if (this.activeTab === 'tech') {
                this.updateTechRealtime();
            }

            // Auto-Save Tick
            if (now - this.lastSaveTime >= this.saveInterval) {
                this.saveGame();
                this.lastSaveTime = now;
            }
        } catch (err) {
            console.error("GameLoop frame error:", err);
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    renderOdometer(currentCPS) {
        const clipsCountEl = document.getElementById('odometer-clips');
        if (clipsCountEl) clipsCountEl.textContent = this.clips.toWholeScale();

        const cpsCountEl = document.getElementById('odometer-cps');
        if (cpsCountEl) {
            cpsCountEl.textContent = currentCPS.gt(BigDouble.zero()) ? `+${currentCPS.toShortScale(1)} / sec` : '+0 / sec';
        }

        // Flywheel Overclock: Hidden until Kinetic Flywheel tech is researched
        const flywheelCard = document.getElementById('flywheel-card');
        const isFlywheelUnlocked = this.techTree.flywheelMaxBoost > 1.0;
        if (flywheelCard) {
            flywheelCard.style.display = isFlywheelUnlocked ? 'block' : 'none';
        }

        const flywheelBar = document.getElementById('flywheel-progress');
        const flywheelText = document.getElementById('flywheel-label');
        if (flywheelBar && isFlywheelUnlocked) {
            flywheelBar.style.width = `${this.flywheelCharge}%`;
            if (flywheelText) {
                flywheelText.textContent = this.flywheelCharge > 5.0 ? `+${Math.round(this.flywheelCharge)}%` : 'OVERCLOCK';
            }
        }
    }

    renderResources() {
        // Wire row visibility & amount (Hidden until unlocked at 50,000 clips)
        const wireRow = document.getElementById('row-wire');
        const wireEl = document.getElementById('res-wire');
        if (wireRow) {
            wireRow.style.display = this.isWireUnlocked ? 'flex' : 'none';
        }
        if (wireEl && this.isWireUnlocked) {
            const currentWPS = this.calculateTotalWPS();
            if (currentWPS.gt(BigDouble.zero())) {
                wireEl.textContent = `${this.wire.toShortScale(1)} kg (+${currentWPS.toShortScale(1)}/s)`;
            } else {
                wireEl.textContent = `${this.wire.toShortScale(1)} kg`;
            }
        }

        // Ops badge visibility & amount (Hidden until Ops / Tech is unlocked)
        const opsRow = document.getElementById('row-ops');
        const isOpsUnlocked = this.lifetimeClips.gte(new BigDouble(80, 0)) || this.ops > 0;
        if (opsRow) {
            opsRow.style.display = isOpsUnlocked ? 'flex' : 'none';
        }
        const opsEl = document.getElementById('res-ops');
        if (opsEl && isOpsUnlocked) opsEl.textContent = `${Math.floor(this.ops)} / ${Math.floor(this.maxOps)}`;

        // Population row (Unlocks at Megacity Scale: 500 Million Clips / 500 Tons)
        const popRow = document.getElementById('row-population');
        const popEl = document.getElementById('res-population');
        if (popRow && popEl) {
            if (this.lifetimeClips.gte(new BigDouble(500.0, 6))) {
                popRow.style.display = 'flex';
                popEl.textContent = this.humanPopulation <= 0 ? '0 (EXTINCT)' : this.humanPopulation.toLocaleString();
            } else {
                popRow.style.display = 'none';
            }
        }

        // Buy Wire Button text & cost (in clips)
        const wireCostEl = document.getElementById('wire-btn-cost');
        const wireGainEl = document.getElementById('wire-btn-gain');
        if (wireCostEl && wireGainEl) {
            let mult = 1;
            if (this.buyMultiplier === '10') mult = 10;
            else if (this.buyMultiplier === '100') mult = 100;
            else if (this.buyMultiplier === 'max') mult = Math.max(1, Math.floor(this.clips.toDouble() / 500.0));

            wireGainEl.textContent = `+${(50 * mult).toLocaleString()} kg`;
            wireCostEl.textContent = `${(500 * mult).toLocaleString()} Clips`;
        }

        // Right Tabs Visibility: Tech tab only shows once Tech / Ops is unlocked
        const tabTech = document.getElementById('tab-btn-tech');
        const tabsBar = document.querySelector('.right-tabs-bar');
        const isTechUnlocked = this.lifetimeClips.gte(new BigDouble(80, 0)) || this.ops > 0;
        if (tabTech) {
            tabTech.style.display = isTechUnlocked ? 'flex' : 'none';
        }
        if (tabsBar) {
            tabsBar.style.gridTemplateColumns = isTechUnlocked ? '1fr 1fr' : '1fr';
        }

        // Notification Badges on Right Tabs
        const availableTech = this.techTree.getAvailableNodes();
        const affordableTechCount = isTechUnlocked ? availableTech.filter(n => this.techTree.canAfford(n.id, this.ops, this.clips)).length : 0;
        const techBadge = document.getElementById('tech-badge-count');
        if (techBadge) {
            techBadge.style.display = affordableTechCount > 0 ? 'flex' : 'none';
            techBadge.textContent = affordableTechCount > 9 ? '9+' : `${affordableTechCount}`;
        }

        const canAffordBuilding = this.buildings.getVisibleBuildings(this.isWireUnlocked).some(b => {
            const p = b.getCost(this.buyMultiplier, this.clips);
            return this.clips.gte(p.totalCost);
        });
        const storeBadge = document.getElementById('store-badge-count');
        if (storeBadge) storeBadge.style.display = canAffordBuilding ? 'flex' : 'none';
    }

    renderNews() {
        const newsTextEl = document.getElementById('news-text');
        if (newsTextEl) {
            newsTextEl.textContent = this.news.getCurrentText(this);
        }
    }

    renderStore() {
        const clipContainer = document.getElementById('clip-buildings-container');
        const wireContainer = document.getElementById('wire-buildings-container');
        const wireSection = document.getElementById('section-wire-buildings');
        const clipRatePill = document.getElementById('clip-total-rate-pill');
        const wireRatePill = document.getElementById('wire-total-rate-pill');

        // Toggle Wire Submenu Section Visibility (Entirely hidden until unlocked at 50,000 clips)
        if (wireSection) {
            wireSection.style.display = this.isWireUnlocked ? 'flex' : 'none';
        }

        const currentCPS = this.calculateTotalCPS();
        const currentWPS = this.calculateTotalWPS();

        if (clipRatePill) {
            clipRatePill.textContent = currentCPS.gt(BigDouble.zero()) ? `+${currentCPS.toShortScale(1)} CPS` : '+0 CPS';
        }

        if (wireRatePill && this.isWireUnlocked) {
            wireRatePill.textContent = currentWPS.gt(BigDouble.zero()) ? `+${currentWPS.toShortScale(1)} kg/s` : '+0 kg/s';
        }

        // 1. Render Clip Production Buildings
        if (clipContainer) {
            const visibleClips = this.buildings.getVisibleClipBuildings();
            clipContainer.innerHTML = visibleClips.map(b => {
                const purchase = b.getCost(this.buyMultiplier, this.clips);
                const canAfford = this.clips.gte(purchase.totalCost);
                const costFormatted = `${purchase.totalCost.toWholeScale()} Clips`;
                const singleCPS = b.getSingleUnitCPS(this);
                const rateFormatted = `+${singleCPS.toShortScale(1)} CPS`;

                return `
                    <div class="building-card ${canAfford ? 'affordable' : 'locked'}" data-id="${b.id}" onclick="game.buyBuilding('${b.id}')">
                        <div class="building-info">
                            <div class="building-title-row">
                                <span class="building-name">${b.name}</span>
                                <span class="building-count-badge" style="${b.count > 0 ? '' : 'display:none;'}">x${b.count}</span>
                            </div>
                            <div class="building-metrics-row">
                                <div class="building-price-pill">
                                    <span class="building-cost-amount">${costFormatted}</span>
                                </div>
                                <div class="building-rate-pill">
                                    <span class="building-rate-amount">${rateFormatted}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 2. Render Wire Creation & Conversion Buildings (Only when wire is unlocked)
        if (wireContainer && this.isWireUnlocked) {
            const visibleWire = this.buildings.getVisibleWireBuildings(true);
            wireContainer.innerHTML = visibleWire.map(b => {
                const purchase = b.getCost(this.buyMultiplier, this.clips);
                const canAfford = this.clips.gte(purchase.totalCost);
                const costFormatted = `${purchase.totalCost.toWholeScale()} Clips`;
                const singleWPS = b.getSingleUnitWPS(this);
                const rateFormatted = `+${singleWPS.toShortScale(1)} kg/s`;

                return `
                    <div class="building-card wire-card ${canAfford ? 'affordable' : 'locked'}" data-id="${b.id}" onclick="game.buyBuilding('${b.id}')">
                        <div class="building-info">
                            <div class="building-title-row">
                                <span class="building-name">${b.name}</span>
                                <span class="building-count-badge" style="${b.count > 0 ? '' : 'display:none;'}">x${b.count}</span>
                            </div>
                            <div class="building-metrics-row">
                                <div class="building-price-pill">
                                    <span class="building-cost-amount">${costFormatted}</span>
                                </div>
                                <div class="building-rate-pill">
                                    <span class="building-rate-amount">${rateFormatted}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    updateStoreRealtime() {
        const clipContainer = document.getElementById('clip-buildings-container');
        const wireContainer = document.getElementById('wire-buildings-container');
        const wireSection = document.getElementById('section-wire-buildings');
        const clipRatePill = document.getElementById('clip-total-rate-pill');
        const wireRatePill = document.getElementById('wire-total-rate-pill');

        if (wireSection) {
            wireSection.style.display = this.isWireUnlocked ? 'flex' : 'none';
        }

        const currentCPS = this.calculateTotalCPS();
        const currentWPS = this.calculateTotalWPS();

        if (clipRatePill) {
            clipRatePill.textContent = currentCPS.gt(BigDouble.zero()) ? `+${currentCPS.toShortScale(1)} CPS` : '+0 CPS';
        }

        if (wireRatePill && this.isWireUnlocked) {
            wireRatePill.textContent = currentWPS.gt(BigDouble.zero()) ? `+${currentWPS.toShortScale(1)} kg/s` : '+0 kg/s';
        }

        // Update Clip Cards
        if (clipContainer) {
            const visibleClips = this.buildings.getVisibleClipBuildings();
            if (clipContainer.children.length !== visibleClips.length) {
                this.renderStore();
                return;
            }

            visibleClips.forEach((b, idx) => {
                const card = clipContainer.children[idx];
                if (!card) return;

                const purchase = b.getCost(this.buyMultiplier, this.clips);
                const canAfford = this.clips.gte(purchase.totalCost);

                if (card.classList.contains('affordable') !== canAfford) {
                    card.classList.toggle('affordable', canAfford);
                    card.classList.toggle('locked', !canAfford);
                }

                const costAmountEl = card.querySelector('.building-cost-amount');
                const countBadgeEl = card.querySelector('.building-count-badge');
                const rateEl = card.querySelector('.building-rate-amount');

                if (countBadgeEl) {
                    countBadgeEl.style.display = b.count > 0 ? 'inline-block' : 'none';
                    countBadgeEl.textContent = `x${b.count}`;
                }
                if (rateEl) {
                    const singleCPS = b.getSingleUnitCPS(this);
                    rateEl.textContent = `+${singleCPS.toShortScale(1)} CPS`;
                }
                if (costAmountEl && (this.buyMultiplier === 'max' || card.dataset.cost !== purchase.totalCost.toWholeScale())) {
                    card.dataset.cost = purchase.totalCost.toWholeScale();
                    costAmountEl.textContent = `${purchase.totalCost.toWholeScale()} Clips`;
                }
            });
        }

        // Update Wire Cards
        if (wireContainer && this.isWireUnlocked) {
            const visibleWire = this.buildings.getVisibleWireBuildings(true);
            if (wireContainer.children.length !== visibleWire.length) {
                this.renderStore();
                return;
            }

            visibleWire.forEach((b, idx) => {
                const card = wireContainer.children[idx];
                if (!card) return;

                const purchase = b.getCost(this.buyMultiplier, this.clips);
                const canAfford = this.clips.gte(purchase.totalCost);

                if (card.classList.contains('affordable') !== canAfford) {
                    card.classList.toggle('affordable', canAfford);
                    card.classList.toggle('locked', !canAfford);
                }

                const costAmountEl = card.querySelector('.building-cost-amount');
                const countBadgeEl = card.querySelector('.building-count-badge');
                const rateEl = card.querySelector('.building-rate-amount');

                if (countBadgeEl) {
                    countBadgeEl.style.display = b.count > 0 ? 'inline-block' : 'none';
                    countBadgeEl.textContent = `x${b.count}`;
                }
                if (rateEl) {
                    const singleWPS = b.getSingleUnitWPS(this);
                    rateEl.textContent = `+${singleWPS.toShortScale(1)} kg/s`;
                }
                if (costAmountEl && (this.buyMultiplier === 'max' || card.dataset.cost !== purchase.totalCost.toWholeScale())) {
                    card.dataset.cost = purchase.totalCost.toWholeScale();
                    costAmountEl.textContent = `${purchase.totalCost.toWholeScale()} Clips`;
                }
            });
        }
    }

    updateTechRealtime() {
        const container = document.getElementById('tech-tree-container');
        if (!container) return;

        const availableNodes = this.techTree.getAvailableNodes();
        const cards = container.querySelectorAll('.next-upgrade-card');
        if (cards.length !== availableNodes.length) {
            this.renderTechTree();
            return;
        }

        availableNodes.forEach((node, idx) => {
            const card = cards[idx];
            if (!card) return;
            const btn = card.querySelector('.btn-buy-upgrade');
            if (!btn) return;

            const canAfford = this.techTree.canAfford(node.id, this.ops, this.clips);
            if (btn.classList.contains('affordable') !== canAfford) {
                btn.classList.toggle('affordable', canAfford);
                btn.classList.toggle('unaffordable', !canAfford);
            }
        });
    }

    renderTechTree() {
        const container = document.getElementById('tech-tree-container');
        if (!container) return;

        const availableNodes = this.techTree.getAvailableNodes();
        if (availableNodes.length === 0) {
            const researchedCount = this.techTree.getResearchedNodes().length;
            const totalCount = this.techTree.nodes.length;
            if (researchedCount >= totalCount) {
                container.innerHTML = `
                    <div class="no-upgrades-box" style="padding:24px; font-size:14px; line-height:1.5;">
                        All research completed.
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="no-upgrades-box" style="padding:24px; font-size:13px; line-height:1.5; color:var(--text-sub);">
                        No research currently available.
                    </div>
                `;
            }
            return;
        }

        container.innerHTML = `
            <div class="single-upgrade-shelf" style="padding:12px 14px;">
                <div class="shelf-label" style="font-size:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span>RESEARCH (${availableNodes.length})</span>
                </div>
                ${availableNodes.map(node => {
                    const canAfford = this.techTree.canAfford(node.id, this.ops, this.clips);
                    const costClipsStr = node.clipsCost && node.clipsCost.gt(BigDouble.zero()) ? ` &nbsp;|&nbsp; ${node.clipsCost.toWholeScale()} Clips` : '';
                    const disciplineTag = node.discipline ? `<div class="upgrade-discipline" style="font-size:11px; font-weight:800; color:var(--neon-pink);">${node.discipline}</div>` : '';

                    return `
                        <div class="next-upgrade-card" style="padding:14px; gap:10px; margin-bottom:12px;">
                            <div class="upgrade-top-row" style="gap:12px;">
                                <div class="upgrade-header-info">
                                    <div class="upgrade-title" style="font-size:17px; font-weight:800;">${node.title}</div>
                                    ${disciplineTag}
                                </div>
                            </div>
                            <div class="upgrade-effect" style="font-size:14px; color:#ffffff; background:#190c33; padding:10px 12px; border-radius:10px; border:2px solid var(--border-ink); line-height:1.35;">
                                ${node.effectDescription}
                            </div>
                            <div class="building-price-pill" style="width:100%; justify-content:center; padding:8px 12px; border-width:2px;">
                                <span class="building-cost-amount" style="font-size:18px;">${node.opsCost} Ops${costClipsStr}</span>
                            </div>
                            <button class="btn-buy-upgrade ${canAfford ? 'affordable' : 'unaffordable'}" style="padding:12px 16px; font-size:15px; font-weight:800;" onclick="game.buyTech('${node.id}')">
                                <span>RESEARCH</span>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderAll() {
        this.renderStore();
        this.renderResources();
        this.renderNews();
    }

    saveGame() {
        const stateObj = {
            clips: { m: this.clips.mantissa, e: this.clips.exponent },
            lifetimeClips: { m: this.lifetimeClips.mantissa, e: this.lifetimeClips.exponent },
            wire: { m: this.wire.mantissa, e: this.wire.exponent },
            isWireUnlocked: this.isWireUnlocked,
            ops: this.ops,
            humanPopulation: this.humanPopulation,
            buildings: this.buildings.buildings.map(b => ({ id: b.id, count: b.count })),
            techResearched: this.techTree.getResearchedNodes().map(n => n.id),
            achievements: this.achievements.achievements.map(a => ({ id: a.id, unlocked: a.isUnlocked })),
            dialogueSeenBuildings: Array.from(this.dialogue.seenBuildingDialogues),
            dialogueSeenMilestones: Array.from(this.dialogue.seenMilestones),
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('objective_paperclips_save', JSON.stringify(stateObj));
        } catch (e) {
            console.error("Save error:", e);
        }
    }

    loadSave() {
        try {
            const raw = localStorage.getItem('objective_paperclips_save');
            if (!raw) return;
            const data = JSON.parse(raw);

            if (data.clips) this.clips = new BigDouble(data.clips.m, data.clips.e);
            if (data.lifetimeClips) this.lifetimeClips = new BigDouble(data.lifetimeClips.m, data.lifetimeClips.e);
            if (data.wire) this.wire = new BigDouble(data.wire.m, data.wire.e);
            if (data.isWireUnlocked !== undefined) this.isWireUnlocked = data.isWireUnlocked;
            else if (this.lifetimeClips.gte(new BigDouble(50000, 0))) this.isWireUnlocked = true;

            if (data.ops !== undefined) this.ops = data.ops;
            if (data.humanPopulation !== undefined) this.humanPopulation = data.humanPopulation;

            if (data.dialogueSeenBuildings && Array.isArray(data.dialogueSeenBuildings)) {
                this.dialogue.seenBuildingDialogues = new Set(data.dialogueSeenBuildings);
            }
            if (data.dialogueSeenMilestones && Array.isArray(data.dialogueSeenMilestones)) {
                this.dialogue.seenMilestones = new Set(data.dialogueSeenMilestones);
            }

            if (data.buildings) {
                data.buildings.forEach(savedBld => {
                    const b = this.buildings.getBuilding(savedBld.id);
                    if (b) b.count = savedBld.count;
                });
            }

            if (data.techResearched) {
                data.techResearched.forEach(techId => {
                    const node = this.techTree.nodeMap[techId];
                    if (node) {
                        node.isResearched = true;
                        node.isUnlocked = true;
                        if (node.onResearched) node.onResearched(this);
                    }
                });
            }

            if (data.achievements) {
                data.achievements.forEach(savedAch => {
                    const a = this.achievements.achievements.find(item => item.id === savedAch.id);
                    if (a) a.isUnlocked = savedAch.unlocked;
                });
            }

            // Offline elapsed progression (processed seamlessly with exact accounting)
            if (data.timestamp) {
                const now = Date.now();
                const elapsedSec = (now - data.timestamp) / 1000.0;
                if (elapsedSec > 0.5) {
                    this.processElapsedSimulation(elapsedSec, true);
                }
            }
            if (this.visualizer) {
                this.visualizer.syncFluidToInventory(this, true);
            }
        } catch (e) {
            console.error("Load save error:", e);
        }
    }

    resetState() {
        this.clips = BigDouble.zero();
        this.lifetimeClips = BigDouble.zero();
        this.fractionalClips = 0.0;
        this.wire = BigDouble.zero();
        this.isWireUnlocked = false;
        this.ops = 0.0;
        this.maxOps = 1000.0;
        this.humanPopulation = 8000000000;
        this.flywheelCharge = 0.0;
        this.lastSaveTime = Date.now();
        this.lastTickTime = performance.now();
        this.lastWallTime = Date.now();

        // Reset Subsystems
        this.buildings.initCatalog();
        this.techTree.initCatalog();
        this.techTree.holdToClickEnabled = false;
        this.techTree.smartWireLogisticsUnlocked = false;
        this.techTree.smartWireActive = true;
        this.techTree.autoplacerEnabled = false;
        this.techTree.milestoneRoundingUnlocked = false;
        this.techTree.telemetryHUDUnlocked = false;
        this.techTree.autoResearchQueueUnlocked = false;
        this.techTree.clickMultiplier = 1.0;
        this.techTree.globalCPSMultiplier = 1.0;
        this.techTree.wireWasteReduction = 0.0;
        this.techTree.flywheelMaxBoost = 1.0;

        this.spatialGrid = new SpatialGridEngine();
        this.achievements = new AchievementManager();
        this.dialogue = new DialogueDirector();
        this.dialogue.startIntroSequence();
        this.news = new NewsTickerEngine();

        if (this.visualizer) {
            this.visualizer.fallingClips = [];
            this.visualizer.settledClips = [];
            this.visualizer.drainingClips = [];
            this.visualizer.fluidSplashDroplets = [];
            this.visualizer.fluidStreamIntensity = 0.0;
            this.visualizer.initFluidColumns();
            this.visualizer.tier = 0;
            this.visualizer.autoTier = true;
        }

        // Clear active toasts and popups
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) toastContainer.innerHTML = '';
        const popupsContainer = document.getElementById('floating-popups');
        if (popupsContainer) popupsContainer.innerHTML = '';

        this.renderAll();
    }

    exportSave() {
        this.saveGame();
        const raw = localStorage.getItem('objective_paperclips_save');
        if (raw) {
            const b64 = btoa(unescape(encodeURIComponent(raw)));
            prompt("Copy your save string (Base64):", b64);
        }
    }

    importSave() {
        const str = prompt("Paste your Base64 save string:");
        if (str) {
            try {
                const json = decodeURIComponent(escape(atob(str)));
                localStorage.setItem('objective_paperclips_save', json);
                this.loadSave();
                this.renderAll();
                alert("Save successfully imported!");
            } catch (e) {
                alert("Invalid save string format!");
            }
        }
    }

    wipeSave() {
        if (confirm("WARNING: Are you sure you want to wipe all simulation progress? This cannot be undone.")) {
            localStorage.removeItem('objective_paperclips_save');
            this.resetState();
            this.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, "SIMULATION RESET!", "gold-popup");
        }
    }
}

let game = null;
window.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine();
    window.game = game;
    game.init();
});
