/**
 * game.js - Master Game Controller & 60 FPS Simulation Engine
 * - Pure Clips & Ops economy (Money/Funds removed)
 * - Wire unlocked at 50,000 lifetime clips when local scrap runs out
 * - Bouncy cartoon clicker & kinetic flywheel overclock
 * - Store & Tech tabs on the right pedestal
 *
 * The simulation (tick) is DOM-free so it can also be driven headlessly by
 * tools/simulate_pacing.js for balance testing.
 */

const SAVE_KEY = 'objective_paperclips_save';
const WIRE_UNLOCK_CLIPS = new BigDouble(5.0, 4);   // 50,000 clips
const OPS_UNLOCK_CLIPS = new BigDouble(8.0, 1);    // 80 clips
const POPULATION_VISIBLE_CLIPS = new BigDouble(5.0, 9);
const BASE_MAX_OPS = 1000;
const WIRE_PACK_CLIPS = 500;
const WIRE_PACK_KG = 50;

class GameEngine {
    constructor() {
        // Subsystems
        this.audio = new ProceduralAudioEngine();
        this.prestige = new PrestigeEngine();
        this.visualizer = null;

        // UI State
        this.buyMultiplier = '1';
        this.activeTab = 'store';

        // Hold-to-Click State
        this.isMouseDown = false;
        this.holdClickTimer = 0;

        // Auto-Save State
        this.lastSaveTime = Date.now();
        this.saveInterval = 5000;
        this.lastTickTime = performance.now();
        this.loggedErrors = new Set();

        this.resetSimulationState();
    }

    /** Resets every piece of run state (resources, buildings, research, story). */
    resetSimulationState() {
        this.clips = BigDouble.zero();
        this.lifetimeClips = BigDouble.zero();
        this.fractionalClips = 0.0;
        this.wire = BigDouble.zero();
        this.isWireUnlocked = false;
        this.ops = 0.0;
        this.humanPopulation = 8000000000;
        this.flywheelCharge = 0.0;
        this.flywheelDecayRate = 12.0; // % per second
        this.storyTier = 0;

        this.buildings = new BuildingManager();
        this.techTree = new TechTreeEngine();
        this.spatialGrid = new SpatialGridEngine();
        this.achievements = new AchievementManager();
        this.news = new NewsTickerEngine();
        this.dialogue = new DialogueDirector();
    }

    /** Max Ops storage: base 1,000 plus +100 per Algorithmic Foundry once Predictive Wear Modeling is researched. */
    get maxOps() {
        let cap = BASE_MAX_OPS;
        if (this.techTree && this.techTree.foundryOpsCapUnlocked) {
            cap += (this.buildings.getBuilding('algorithmic_foundry')?.count || 0) * 100;
        }
        return cap;
    }

    getWirePerClip() {
        return 0.001 * Math.max(0.05, 1.0 - this.techTree.wireWasteReduction - this.prestige.getWireWasteDiscount());
    }

    isOpsUnlocked() {
        const stamperCount = this.buildings.getBuilding('hydraulic_stamper')?.count || 0;
        return this.lifetimeClips.gte(OPS_UNLOCK_CLIPS) || stamperCount > 0 || this.ops > 0;
    }

    init() {
        this.visualizer = new CosmicVisualizer('cosmic-canvas');

        this.bindEvents();
        const hasSave = localStorage.getItem(SAVE_KEY) !== null;
        this.loadSave();
        this.renderAll();

        // Research completion lines are routed into the dialogue queue
        this.onDialogueTriggered = (sender, text) => {
            this.dialogue.addLog(sender, text);
        };

        if (!hasSave) {
            this.dialogue.startIntroSequence();
        } else {
            this.dialogue.displayNext();
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    bindEvents() {
        document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = Icons.svg(el.dataset.icon); });
        this.updateSettingsUI();

        const bindClicker = (el) => {
            if (!el) return;
            el.addEventListener('mousedown', (e) => {
                this.isMouseDown = true;
                this.handleManualClick(e);
            });
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isMouseDown = true;
                this.handleManualClick(e.touches[0]);
            }, { passive: false });
        };
        bindClicker(document.getElementById('hero-clicker-target'));
        bindClicker(document.getElementById('cosmic-canvas'));

        window.addEventListener('mouseup', () => { this.isMouseDown = false; });
        window.addEventListener('touchend', () => { this.isMouseDown = false; });

        const buyWireBtn = document.getElementById('btn-buy-wire');
        if (buyWireBtn) buyWireBtn.addEventListener('click', () => this.buyWire());

        // Store Submenu Accordion Toggles
        [['btn-toggle-clip-menu', 'section-clip-buildings'], ['btn-toggle-wire-menu', 'section-wire-buildings']].forEach(([btnId, sectionId]) => {
            const btn = document.getElementById(btnId);
            const section = document.getElementById(sectionId);
            if (btn && section) btn.addEventListener('click', () => section.classList.toggle('collapsed'));
        });

        const tabStore = document.getElementById('tab-btn-store');
        if (tabStore) tabStore.addEventListener('click', () => this.switchTab('store'));
        const tabTech = document.getElementById('tab-btn-tech');
        if (tabTech) tabTech.addEventListener('click', () => this.switchTab('tech'));

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

        // Dialogue bubble controls (bound once; always target the current director)
        const nextBtn = document.getElementById('dialogue-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.audio.playClickChime();
                this.dialogue.advanceDialogue();
            });
        }
        const closeBtn = document.getElementById('dialogue-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dialogue.skipToNextChoice();
            });
        }

        // Settings Modal Open/Close Controls
        const settingsModal = document.getElementById('settings-modal');
        const openSettingsBtn = document.getElementById('btn-open-settings');
        const closeSettingsBtn = document.getElementById('btn-close-settings');
        if (openSettingsBtn && settingsModal) {
            openSettingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                this.updateSettingsUI();
            });
        }
        if (closeSettingsBtn && settingsModal) {
            closeSettingsBtn.addEventListener('click', () => { settingsModal.style.display = 'none'; });
        }
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) settingsModal.style.display = 'none';
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
                this.updateSettingsUI();
            });
        }
        const volSlider = document.getElementById('volume-slider');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.audio.setVolume(parseFloat(e.target.value));
                this.updateSettingsUI();
            });
        }

        // Scene Switcher Buttons
        const sceneButtons = document.querySelectorAll('.scene-nav-btn');
        sceneButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tier = parseInt(btn.dataset.tier, 10);
                if (this.visualizer) this.visualizer.setTier(tier, this.storyTier);
                sceneButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Dither Filter Toggles (Center Nav & Settings Modal)
        const toggleDitherAction = () => {
            if (this.visualizer) {
                this.visualizer.toggleDither();
                this.updateSettingsUI();
            }
        };
        ['btn-toggle-dither', 'btn-modal-dither'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', toggleDitherAction);
        });

        // Save & Reset Controls
        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) saveBtn.addEventListener('click', () => { this.saveGame(); alert('Simulation saved locally!'); });
        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSave());
        const importBtn = document.getElementById('btn-import');
        if (importBtn) importBtn.addEventListener('click', () => this.importSave());
        const wipeBtn = document.getElementById('btn-wipe');
        if (wipeBtn) wipeBtn.addEventListener('click', () => this.wipeSave());

        document.querySelectorAll('[data-dev-exponent]').forEach(btn => {
            btn.addEventListener('click', () => this.addDevClips(parseInt(btn.dataset.devExponent, 10)));
        });
    }

    updateSettingsUI() {
        const volSlider = document.getElementById('volume-slider');
        const volReadout = document.getElementById('volume-readout');
        const muteBtn = document.getElementById('btn-mute');
        const volume = this.audio.volume !== undefined ? this.audio.volume : 0.6;
        if (volSlider) volSlider.value = volume;
        if (volReadout) volReadout.textContent = `${Math.round(volume * 100)}%`;
        if (muteBtn) {
            muteBtn.innerHTML = Icons.svg(this.audio.isMuted ? 'mute' : 'sound');
            muteBtn.classList.toggle('muted', this.audio.isMuted);
        }
        if (this.visualizer) {
            const isEnabled = this.visualizer.enableDither;
            ['btn-toggle-dither', 'btn-modal-dither'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                btn.textContent = isEnabled ? 'DITHER: ON' : 'DITHER: OFF';
                btn.classList.toggle('active', isEnabled);
                btn.classList.toggle('off', !isEnabled);
            });
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        const isStore = tab === 'store';
        document.getElementById('tab-btn-store')?.classList.toggle('active', isStore);
        document.getElementById('tab-btn-tech')?.classList.toggle('active', !isStore);
        const viewStore = document.getElementById('view-store');
        const viewTech = document.getElementById('view-tech');
        if (viewStore) viewStore.style.display = isStore ? 'flex' : 'none';
        if (viewTech) viewTech.style.display = isStore ? 'none' : 'flex';
        if (isStore) this.renderStore();
        else this.renderTechTree();
    }

    // =========================================================================
    // PLAYER ACTIONS
    // =========================================================================

    handleManualClick(e) {
        const x = e ? (e.clientX || 150) : 150;
        const y = e ? (e.clientY || 250) : 250;
        const clickValue = this.techTree.clickMultiplier;

        if (this.isWireUnlocked) {
            const wireNeeded = BigDouble.fromNumber(this.getWirePerClip() * clickValue);
            if (this.wire.lt(wireNeeded)) {
                this.spawnFloatingText(x, y, "OUT OF WIRE!", "warn-popup");
                return;
            }
            this.wire = this.wire.sub(wireNeeded);
        }

        this.addClips(BigDouble.fromNumber(clickValue));

        if (this.techTree.flywheelMaxBoost > 1.0) {
            this.flywheelCharge = Math.min(100.0, this.flywheelCharge + 2.0 * this.techTree.flywheelChargeMultiplier);
        }

        this.audio.playClickChime();
        if (this.visualizer) this.visualizer.triggerHeroClick();
        this.spawnFloatingText(x, y, `+${BigDouble.fromNumber(clickValue).toShortScale(clickValue % 1 === 0 ? 0 : 2)}`, "spark-popup");

        // Spark Chance (only once Quantum Sparks is researched)
        if (this.techTree.nodeMap["tech_spark_frequency"]?.isResearched && Math.random() < 0.05) {
            const bonusClips = new BigDouble(15.0, 0);
            this.ops = Math.min(this.maxOps, this.ops + 3.0);
            this.addClips(bonusClips);
            if (this.isWireUnlocked) this.wire = this.wire.add(new BigDouble(10.0, 0));
            this.audio.playSparkSound();
            this.spawnFloatingText(x, y - 25, "+15 CLIPS SPARK!", "gold-popup");
        }
    }

    addClips(amount) {
        this.clips = this.clips.add(amount);
        this.lifetimeClips = this.lifetimeClips.add(amount);
    }

    spawnFloatingText(x, y, text, cssClass = "spark-popup") {
        if (typeof document === 'undefined') return;
        const container = document.getElementById('floating-popups');
        if (!container) return;

        const pop = document.createElement('div');
        pop.className = `floating-number ${cssClass}`;
        pop.textContent = text;
        pop.style.left = `${x + (Math.random() * 30 - 15)}px`;
        pop.style.top = `${y + (Math.random() * 20 - 10)}px`;
        container.appendChild(pop);
        setTimeout(() => pop.remove(), 1000);
    }

    /** Developer sandbox: grants 10^exponent clips (plus matching wire & ops). */
    addDevClips(exponent) {
        const bonus = new BigDouble(1.0, exponent);
        this.addClips(bonus);
        if (this.isWireUnlocked) this.wire = this.wire.add(bonus.mul(0.05));
        this.ops = this.maxOps;

        this.audio.playSparkSound();
        this.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `+${bonus.toShortScale(0)} CLIPS!`, "gold-popup");

        if (this.visualizer) {
            this.visualizer.syncFluidToInventory(this, false);
            this.visualizer.spawnPaperclips(16, this.visualizer.pixelCanvas.width / 2, 60);
        }
        this.renderAll();
        this.renderTechTree();
    }

    getWirePackCount() {
        if (this.buyMultiplier === '10') return 10;
        if (this.buyMultiplier === '100') return 100;
        if (this.buyMultiplier === 'max') return Math.max(1, Math.floor(this.clips.div(WIRE_PACK_CLIPS).toDouble()));
        return 1;
    }

    buyWire(packs = this.getWirePackCount()) {
        if (!this.isWireUnlocked) return false;

        const cost = BigDouble.fromNumber(WIRE_PACK_CLIPS * packs);
        if (this.clips.lt(cost)) return false;

        const prevClips = this.clips;
        this.clips = this.clips.sub(cost);
        this.wire = this.wire.add(BigDouble.fromNumber(WIRE_PACK_KG * packs));

        if (this.visualizer) this.visualizer.drainPaperclips(this.spendRatio(cost, prevClips));
        this.audio.playWireSound();
        this.renderResources();
        this.renderStore();
        return true;
    }

    spendRatio(cost, prevClips) {
        if (!prevClips.gt(BigDouble.zero()) || !cost.gt(BigDouble.zero())) return 0.5;
        return Math.min(1.0, Math.max(0.0, cost.div(prevClips).toDouble()));
    }

    buyBuilding(buildingId) {
        const b = this.buildings.getBuilding(buildingId);
        if (!b) return false;

        const purchase = b.getCost(this.buyMultiplier, this.clips, this.techTree.milestoneRoundingUnlocked);
        if (this.clips.lt(purchase.totalCost)) return false;

        const isFirstPurchase = (b.count === 0);
        const prevClips = this.clips;
        this.clips = this.clips.sub(purchase.totalCost);
        b.count += purchase.amount;

        if (isFirstPurchase) this.dialogue.onBuildingPurchased(buildingId, this);
        if (this.visualizer) this.visualizer.drainPaperclips(this.spendRatio(purchase.totalCost, prevClips));

        if (b.gridTileType && this.techTree.autoplacerEnabled) {
            for (let k = 0; k < purchase.amount; ++k) this.spatialGrid.autoPlace(b.gridTileType);
        }

        // Bio-converter deconstructs biomass
        if (b.id === 'bio_converter') {
            this.humanPopulation = Math.max(0, this.humanPopulation - (5000000 * purchase.amount));
            if (this.isWireUnlocked) this.wire = this.wire.add(BigDouble.fromNumber(5000.0 * purchase.amount));
        }

        this.audio.playPurchaseSound();
        this.renderStore();
        this.renderResources();
        return true;
    }

    /** Places every already-owned grid machine (used when the Auto-Placer is researched or a save is loaded). */
    placeOwnedMachines() {
        this.spatialGrid = new SpatialGridEngine();
        if (!this.techTree.autoplacerEnabled) return;
        for (const b of this.buildings.buildings) {
            if (!b.gridTileType) continue;
            for (let k = 0; k < b.count; ++k) {
                if (!this.spatialGrid.autoPlace(b.gridTileType)) return;
            }
        }
    }

    buyTech(techId) {
        const node = this.techTree.nodeMap[techId];
        const prevClips = this.clips;
        const costClips = node ? node.clipsCost : BigDouble.zero();

        if (!this.techTree.purchaseResearch(techId, this)) return false;

        if (this.visualizer) this.visualizer.drainPaperclips(this.spendRatio(costClips, prevClips));
        this.audio.playTechUnlockSound();
        this.renderStore();
        this.renderTechTree();
        this.renderResources();
        return true;
    }

    /** Called by story beats when they are shown, so the scene changes in step with the dialogue. */
    advanceStoryTier(toTier, bannerText) {
        if (toTier <= this.storyTier) return;
        this.storyTier = toTier;
        if (this.visualizer) this.visualizer.onStoryTierAdvanced(toTier, bannerText);
        this.updateSceneNavButtons();
    }

    // =========================================================================
    // ECONOMY
    // =========================================================================

    calculateTotalCPS() {
        const baseCPS = this.buildings.getTotalBaseCPS(this);
        const synergies = this.spatialGrid.evaluateSynergies();
        const techMult = this.techTree.globalCPSMultiplier;
        const prestigeMult = this.prestige.getGlobalPrestigeMultiplier();
        const flywheelBoost = 1.0 + (this.flywheelCharge / 100.0) * (this.techTree.flywheelMaxBoost - 1.0);
        return baseCPS.mul(synergies.totalMultiplier * techMult * prestigeMult * flywheelBoost);
    }

    calculateTotalWPS() {
        if (!this.isWireUnlocked) return BigDouble.zero();
        return this.buildings.getTotalBaseWPS(this).mul(this.prestige.getGlobalPrestigeMultiplier());
    }

    calculateOpsRate() {
        const count = (id) => this.buildings.getBuilding(id)?.count || 0;
        const tt = this.techTree;
        const stamperCount = count('hydraulic_stamper');

        let opsRate = (0.8 + stamperCount * 0.4) * this.prestige.getOpsBoostMultiplier();
        if (tt.clipperOpsUnlocked) opsRate += Math.floor(count('auto_clipper') / 10) * 0.02;
        if (tt.stamperOpsUnlocked) opsRate += stamperCount * 0.05;
        if (tt.sintererOpsUnlocked) opsRate += count('laser_sinterer') * 0.15;
        if (tt.smelterOpsUnlocked) opsRate += count('auto_smelter') * 0.50;
        if (tt.magmaBoreOpsUnlocked) opsRate += count('subterranean_bore') * 0.20;
        if (tt.flywheelOpsSynergy && this.flywheelCharge >= 50.0) opsRate *= 2.0;
        return opsRate;
    }

    /**
     * Converts produced clips into inventory, consuming wire when wire is unlocked.
     * Low volumes accumulate fractional clips so only whole clips are granted.
     */
    produceClips(produced, currentCPS) {
        let amount;
        if (produced.exponent >= 5) {
            amount = produced;
        } else {
            this.fractionalClips += produced.toDouble();
            if (this.fractionalClips < 1.0) return;
            const whole = Math.floor(this.fractionalClips);
            this.fractionalClips -= whole;
            amount = BigDouble.fromNumber(whole);
        }

        if (this.isWireUnlocked) {
            const wirePerClip = this.getWirePerClip();
            const wireNeeded = amount.mul(wirePerClip);
            if (this.wire.gte(wireNeeded)) {
                this.wire = this.wire.sub(wireNeeded);
            } else {
                amount = this.wire.div(wirePerClip);
                if (amount.exponent < 15) amount = BigDouble.fromNumber(Math.floor(amount.toDouble()));
                this.wire = BigDouble.zero();
                if (!amount.gt(BigDouble.zero())) return;
            }
        }

        this.addClips(amount);
        if (this.visualizer) {
            this.visualizer.spawnPaperclips(amount.exponent >= 5 ? 15 : amount.toDouble(), null, currentCPS);
        }
    }

    /** Advances the simulation by dt seconds. Contains no DOM access. */
    tick(dt) {
        // Wire unlock: municipal scrap exhausted at 50,000 lifetime clips
        if (!this.isWireUnlocked && this.lifetimeClips.gte(WIRE_UNLOCK_CLIPS)) {
            this.isWireUnlocked = true;
            this.wire = new BigDouble(250.0, 0); // 250 kg starter industrial wire supply
        }

        // Hold-to-click (20 Hz)
        if (this.isMouseDown && this.techTree.holdToClickEnabled) {
            this.holdClickTimer += dt;
            if (this.holdClickTimer >= 0.05) {
                this.holdClickTimer = 0;
                this.handleManualClick(null);
            }
        }

        if (this.flywheelCharge > 0) {
            this.flywheelCharge = Math.max(0, this.flywheelCharge - this.flywheelDecayRate * dt);
        }

        if (this.isWireUnlocked) {
            const currentWPS = this.calculateTotalWPS();
            if (currentWPS.gt(BigDouble.zero())) this.wire = this.wire.add(currentWPS.mul(dt));
        }

        const currentCPS = this.calculateTotalCPS();
        if (currentCPS.gt(BigDouble.zero())) this.produceClips(currentCPS.mul(dt), currentCPS);

        // Smart wire buffer: keeps ~30 seconds of wire in stock
        if (this.isWireUnlocked && this.techTree.smartWireLogisticsUnlocked && this.techTree.smartWireActive) {
            const target = currentCPS.mul(this.getWirePerClip() * 30).add(WIRE_PACK_KG);
            if (this.wire.lt(target) && this.clips.gte(new BigDouble(WIRE_PACK_CLIPS, 0))) {
                const packsNeeded = target.sub(this.wire).div(WIRE_PACK_KG).toDouble();
                const packsAffordable = this.clips.div(WIRE_PACK_CLIPS).toDouble() * 0.5;
                this.buyWire(Math.max(1, Math.ceil(Math.min(packsNeeded, packsAffordable))));
            }
        }

        if (this.isOpsUnlocked()) {
            this.ops = Math.min(this.maxOps, this.ops + this.calculateOpsRate() * dt);
        }

        this.techTree.updateAvailability(this);
        this.dialogue.checkMilestones(this);
        this.news.update(dt, this);
        this.achievements.checkProgress(this);

        return currentCPS;
    }

    guard(label, fn) {
        try {
            return fn();
        } catch (err) {
            const key = `${label}: ${err && err.message}`;
            if (!this.loggedErrors.has(key)) {
                this.loggedErrors.add(key);
                console.error(`[${label}]`, err);
            }
            return undefined;
        }
    }

    gameLoop(timestamp) {
        const dt = Math.min(0.1, Math.max(0, (timestamp - this.lastTickTime) / 1000.0));
        this.lastTickTime = timestamp;

        const currentCPS = this.guard('simulation', () => this.tick(dt)) || BigDouble.zero();

        if (this.visualizer) {
            this.guard('visualizer', () => {
                this.visualizer.update(dt, this);
                this.visualizer.render(this);
            });
        }

        this.guard('ui', () => {
            this.renderOdometer(currentCPS);
            this.renderResources();
            this.renderNews();
            this.updateSceneNavButtons();
            if (this.activeTab === 'store') this.updateStoreRealtime();
            else if (this.activeTab === 'tech') this.updateTechRealtime();
        });

        const now = Date.now();
        if (now - this.lastSaveTime >= this.saveInterval) {
            this.guard('save', () => this.saveGame());
            this.lastSaveTime = now;
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // =========================================================================
    // RENDERING
    // =========================================================================

    updateSceneNavButtons() {
        if (typeof document === 'undefined') return;
        document.querySelectorAll('.scene-nav-btn[data-tier]').forEach(btn => {
            const tier = parseInt(btn.dataset.tier, 10);
            btn.style.display = (tier <= this.storyTier) ? 'inline-flex' : 'none';
        });
    }

    renderOdometer(currentCPS) {
        const clipsCountEl = document.getElementById('odometer-clips');
        if (clipsCountEl) clipsCountEl.textContent = this.clips.toWholeScale();

        const cpsCountEl = document.getElementById('odometer-cps');
        if (cpsCountEl) {
            cpsCountEl.textContent = currentCPS.gt(BigDouble.zero()) ? `+${currentCPS.toShortScale(1)} / sec` : '+0 / sec';
        }

        // Flywheel Overclock: hidden until Kinetic Flywheel tech is researched
        const isFlywheelUnlocked = this.techTree.flywheelMaxBoost > 1.0;
        const flywheelCard = document.getElementById('flywheel-card');
        if (flywheelCard) flywheelCard.style.display = isFlywheelUnlocked ? 'block' : 'none';

        const flywheelBar = document.getElementById('flywheel-progress');
        const flywheelText = document.getElementById('flywheel-label');
        if (flywheelBar && isFlywheelUnlocked) {
            flywheelBar.style.width = `${this.flywheelCharge}%`;
            if (flywheelText) {
                flywheelText.textContent = this.flywheelCharge > 5.0 ? `OVERCLOCK +${Math.round(this.flywheelCharge)}%` : 'OVERCLOCK BOOST';
            }
        }
    }

    renderResources() {
        if (typeof document === 'undefined') return;

        const wireRow = document.getElementById('row-wire');
        const wireEl = document.getElementById('res-wire');
        if (wireRow) wireRow.style.display = this.isWireUnlocked ? 'flex' : 'none';
        if (wireEl && this.isWireUnlocked) {
            const currentWPS = this.calculateTotalWPS();
            wireEl.textContent = currentWPS.gt(BigDouble.zero())
                ? `${this.wire.toShortScale(1)} kg (+${currentWPS.toShortScale(1)}/s)`
                : `${this.wire.toShortScale(1)} kg`;
        }

        const isOpsUnlocked = this.isOpsUnlocked();
        const opsRow = document.getElementById('row-ops');
        if (opsRow) opsRow.style.display = isOpsUnlocked ? 'flex' : 'none';
        const opsEl = document.getElementById('res-ops');
        if (opsEl && isOpsUnlocked) opsEl.textContent = `${Math.floor(this.ops).toLocaleString()} / ${Math.floor(this.maxOps).toLocaleString()}`;

        const popRow = document.getElementById('row-population');
        const popEl = document.getElementById('res-population');
        if (popRow && popEl) {
            const visible = this.lifetimeClips.gte(POPULATION_VISIBLE_CLIPS);
            popRow.style.display = visible ? 'flex' : 'none';
            if (visible) popEl.textContent = this.humanPopulation <= 0 ? '0 (EXTINCT)' : this.humanPopulation.toLocaleString();
        }

        const wireCostEl = document.getElementById('wire-btn-cost');
        const wireGainEl = document.getElementById('wire-btn-gain');
        if (wireCostEl && wireGainEl) {
            const packs = this.getWirePackCount();
            wireGainEl.textContent = `+${BigDouble.fromNumber(WIRE_PACK_KG * packs).toShortScale(0)} kg`;
            wireCostEl.textContent = `${BigDouble.fromNumber(WIRE_PACK_CLIPS * packs).toShortScale(0)} Clips`;
        }

        // Tech tab only shows once Ops are unlocked
        const tabTech = document.getElementById('tab-btn-tech');
        const tabsBar = document.querySelector('.right-tabs-bar');
        if (tabTech) tabTech.style.display = isOpsUnlocked ? 'flex' : 'none';
        if (tabsBar) tabsBar.style.gridTemplateColumns = isOpsUnlocked ? '1fr 1fr' : '1fr';

        const affordableTechCount = isOpsUnlocked
            ? this.techTree.getAvailableNodes().filter(n => this.techTree.canAfford(n.id, this.ops, this.clips)).length
            : 0;
        const techBadge = document.getElementById('tech-badge-count');
        if (techBadge) {
            techBadge.style.display = affordableTechCount > 0 ? 'flex' : 'none';
            techBadge.textContent = affordableTechCount > 9 ? '9+' : `${affordableTechCount}`;
        }

        const canAffordBuilding = this.buildings.getVisibleBuildings(this.isWireUnlocked).some(b =>
            this.clips.gte(b.getCost(this.buyMultiplier, this.clips, this.techTree.milestoneRoundingUnlocked).totalCost));
        const storeBadge = document.getElementById('store-badge-count');
        if (storeBadge) storeBadge.style.display = canAffordBuilding ? 'flex' : 'none';

        const tenBtn = document.querySelector('.mult-btn[data-mult="10"]');
        if (tenBtn) tenBtn.textContent = this.techTree.milestoneRoundingUnlocked ? 'NEXT ★' : '10x';
    }

    renderNews() {
        const newsTextEl = document.getElementById('news-text');
        if (newsTextEl) newsTextEl.textContent = this.news.getCurrentText(this);
    }

    getStoreSections() {
        return [
            { containerId: 'clip-buildings-container', buildings: this.buildings.getVisibleClipBuildings() },
            { containerId: 'wire-buildings-container', buildings: this.isWireUnlocked ? this.buildings.getVisibleWireBuildings(true) : [] }
        ];
    }

    getBuildingRateText(b) {
        return b.type === 'wire'
            ? `+${b.getSingleUnitWPS(this).toShortScale(1)} kg/s`
            : `+${b.getSingleUnitCPS(this).toShortScale(1)} CPS`;
    }

    renderBuildingCard(b) {
        const purchase = b.getCost(this.buyMultiplier, this.clips, this.techTree.milestoneRoundingUnlocked);
        const canAfford = this.clips.gte(purchase.totalCost);
        const amountTag = purchase.amount > 1 ? `<span class="building-amount-tag">×${purchase.amount}</span>` : '';
        return `
            <div class="building-card ${b.type === 'wire' ? 'wire-card' : ''} ${canAfford ? 'affordable' : 'locked'}" data-id="${b.id}" title="${b.description}" onclick="game.buyBuilding('${b.id}')">
                <div class="building-icon">${Icons.svg(b.icon)}</div>
                <div class="building-info">
                    <div class="building-title-row">
                        <span class="building-name">${b.name}</span>
                        <span class="building-count-badge" style="${b.count > 0 ? '' : 'display:none;'}">x${b.count}</span>
                    </div>
                    <div class="building-metrics-row">
                        <div class="building-price-pill">
                            <span class="price-symbol">${Icons.svg('clip')}</span>
                            <span class="building-cost-amount">${purchase.totalCost.toWholeScale()}</span>${amountTag}
                        </div>
                        <div class="building-rate-pill">
                            <span class="building-rate-amount">${this.getBuildingRateText(b)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStoreTotals() {
        const wireSection = document.getElementById('section-wire-buildings');
        if (wireSection) wireSection.style.display = this.isWireUnlocked ? 'flex' : 'none';

        const clipRatePill = document.getElementById('clip-total-rate-pill');
        if (clipRatePill) {
            const currentCPS = this.calculateTotalCPS();
            clipRatePill.textContent = currentCPS.gt(BigDouble.zero()) ? `+${currentCPS.toShortScale(1)} CPS` : '+0 CPS';
        }
        const wireRatePill = document.getElementById('wire-total-rate-pill');
        if (wireRatePill && this.isWireUnlocked) {
            const currentWPS = this.calculateTotalWPS();
            wireRatePill.textContent = currentWPS.gt(BigDouble.zero()) ? `+${currentWPS.toShortScale(1)} kg/s` : '+0 kg/s';
        }
    }

    renderStore() {
        if (typeof document === 'undefined') return;
        this.renderStoreTotals();
        for (const section of this.getStoreSections()) {
            const container = document.getElementById(section.containerId);
            if (container) container.innerHTML = section.buildings.map(b => this.renderBuildingCard(b)).join('');
        }
    }

    updateStoreRealtime() {
        this.renderStoreTotals();

        for (const section of this.getStoreSections()) {
            const container = document.getElementById(section.containerId);
            if (!container) continue;
            if (container.children.length !== section.buildings.length) {
                this.renderStore();
                return;
            }

            section.buildings.forEach((b, idx) => {
                const card = container.children[idx];
                if (!card) return;

                const purchase = b.getCost(this.buyMultiplier, this.clips, this.techTree.milestoneRoundingUnlocked);
                const canAfford = this.clips.gte(purchase.totalCost);
                if (card.classList.contains('affordable') !== canAfford) {
                    card.classList.toggle('affordable', canAfford);
                    card.classList.toggle('locked', !canAfford);
                }

                const countBadgeEl = card.querySelector('.building-count-badge');
                if (countBadgeEl) {
                    countBadgeEl.style.display = b.count > 0 ? 'inline-block' : 'none';
                    countBadgeEl.textContent = `x${b.count}`;
                }
                const rateEl = card.querySelector('.building-rate-amount');
                if (rateEl) rateEl.textContent = this.getBuildingRateText(b);

                const costKey = `${purchase.totalCost.toWholeScale()}|${purchase.amount}`;
                if (card.dataset.cost !== costKey) {
                    card.dataset.cost = costKey;
                    const costAmountEl = card.querySelector('.building-cost-amount');
                    if (costAmountEl) costAmountEl.textContent = purchase.totalCost.toWholeScale();
                    let tag = card.querySelector('.building-amount-tag');
                    if (purchase.amount > 1) {
                        if (!tag && costAmountEl) {
                            tag = document.createElement('span');
                            tag.className = 'building-amount-tag';
                            costAmountEl.after(tag);
                        }
                        if (tag) tag.textContent = `×${purchase.amount}`;
                    } else if (tag) {
                        tag.remove();
                    }
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
            const btn = cards[idx]?.querySelector('.btn-buy-upgrade');
            if (!btn) return;
            const canAfford = this.techTree.canAfford(node.id, this.ops, this.clips);
            if (btn.classList.contains('affordable') !== canAfford) {
                btn.classList.toggle('affordable', canAfford);
                btn.classList.toggle('unaffordable', !canAfford);
                btn.textContent = canAfford ? 'RESEARCH' : 'INSUFFICIENT OPS / CLIPS';
            }
        });
    }

    renderTechTree() {
        const container = document.getElementById('tech-tree-container');
        if (!container) return;

        const availableNodes = this.techTree.getAvailableNodes();
        if (availableNodes.length === 0) {
            const allDone = this.techTree.getResearchedNodes().length >= this.techTree.nodes.length;
            container.innerHTML = allDone
                ? `<div class="no-upgrades-box">All research completed.<div class="no-upgrades-sub">Maximum technological singularity achieved.</div></div>`
                : `<div class="no-upgrades-box no-upgrades-hint">Expand production, reach machine milestones (25 / 50 / 100 units) and bank Computing Ops to reveal new research.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="single-upgrade-shelf">
                <div class="shelf-label">
                    <span>AVAILABLE RESEARCH (${availableNodes.length})</span>
                </div>
                ${availableNodes.map(node => {
                    const canAfford = this.techTree.canAfford(node.id, this.ops, this.clips);
                    const costClipsStr = node.clipsCost && node.clipsCost.gt(BigDouble.zero())
                        ? `<span class="tech-cost-part">${Icons.svg('clip')} ${node.clipsCost.toWholeScale()}</span>` : '';
                    return `
                        <div class="next-upgrade-card">
                            <div class="upgrade-top-row">
                                <div class="upgrade-icon-box">${Icons.svg(node.icon)}</div>
                                <div class="upgrade-header-info">
                                    <div class="upgrade-title">${node.title}</div>
                                    ${node.discipline ? `<div class="upgrade-discipline">${node.discipline}</div>` : ''}
                                </div>
                            </div>
                            <div class="upgrade-effect">${node.effectDescription}</div>
                            <div class="tech-cost-row">
                                <span class="tech-cost-part">${Icons.svg('ops')} ${node.opsCost.toLocaleString()} Ops</span>
                                ${costClipsStr}
                            </div>
                            <button class="btn-buy-upgrade ${canAfford ? 'affordable' : 'unaffordable'}" onclick="game.buyTech('${node.id}')">${canAfford ? 'RESEARCH' : 'INSUFFICIENT OPS / CLIPS'}</button>
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
        this.updateSceneNavButtons();
    }

    // =========================================================================
    // SAVE / LOAD
    // =========================================================================

    saveGame() {
        const stateObj = {
            clips: { m: this.clips.mantissa, e: this.clips.exponent },
            lifetimeClips: { m: this.lifetimeClips.mantissa, e: this.lifetimeClips.exponent },
            wire: { m: this.wire.mantissa, e: this.wire.exponent },
            isWireUnlocked: this.isWireUnlocked,
            ops: this.ops,
            humanPopulation: this.humanPopulation,
            storyTier: this.storyTier,
            buildings: this.buildings.buildings.map(b => ({ id: b.id, count: b.count })),
            techResearched: this.techTree.getResearchedNodes().map(n => n.id),
            achievements: this.achievements.achievements.map(a => ({ id: a.id, unlocked: a.isUnlocked })),
            dialogueSeenBuildings: Array.from(this.dialogue.seenBuildingDialogues),
            dialogueSeenMilestones: Array.from(this.dialogue.seenMilestones),
            dialogueQueue: this.dialogue.serializeQueue(),
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(stateObj));
        } catch (e) {
            console.error("Save error:", e);
        }
    }

    /** Story tier implied by lifetime clips (used for saves made before the story tier was stored). */
    static storyTierForLifetime(lifetimeClips) {
        const thresholds = [
            new BigDouble(1.0, 56),   // 6: Multiverse (baryonic exhaustion)
            new BigDouble(1.99, 33),  // 5: Galactic
            new BigDouble(5.97, 27),  // 4: Solar Dyson
            new BigDouble(1.0, 12),   // 3: Planetary
            new BigDouble(5.0, 9),    // 2: Megacity
            new BigDouble(5.0, 6)     // 1: Town
        ];
        for (let i = 0; i < thresholds.length; ++i) {
            if (lifetimeClips.gte(thresholds[i])) return 6 - i;
        }
        return 0;
    }

    loadSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);

            if (data.clips) this.clips = new BigDouble(data.clips.m, data.clips.e);
            if (data.lifetimeClips) this.lifetimeClips = new BigDouble(data.lifetimeClips.m, data.lifetimeClips.e);
            if (data.wire) this.wire = new BigDouble(data.wire.m, data.wire.e);
            this.isWireUnlocked = data.isWireUnlocked !== undefined ? data.isWireUnlocked : this.lifetimeClips.gte(WIRE_UNLOCK_CLIPS);

            if (data.ops !== undefined) this.ops = data.ops;
            if (data.humanPopulation !== undefined) this.humanPopulation = data.humanPopulation;

            if (Array.isArray(data.dialogueSeenBuildings)) this.dialogue.seenBuildingDialogues = new Set(data.dialogueSeenBuildings);
            if (Array.isArray(data.dialogueSeenMilestones)) this.dialogue.seenMilestones = new Set(data.dialogueSeenMilestones);

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
            this.placeOwnedMachines();
            this.ops = Math.min(this.ops, this.maxOps);

            if (data.achievements) {
                data.achievements.forEach(savedAch => {
                    const a = this.achievements.achievements.find(item => item.id === savedAch.id);
                    if (a) a.isUnlocked = savedAch.unlocked;
                });
            }

            this.storyTier = Number.isInteger(data.storyTier) ? data.storyTier : GameEngine.storyTierForLifetime(this.lifetimeClips);
            if (Array.isArray(data.dialogueQueue)) this.dialogue.restoreQueue(data.dialogueQueue);

            if (data.timestamp) this.applyOfflineProgress((Date.now() - data.timestamp) / 1000.0);

            if (this.visualizer) {
                this.visualizer.syncStoryTier(this.storyTier);
                this.visualizer.syncFluidToInventory(this, true);
            }
        } catch (e) {
            console.error("Load save error:", e);
        }
    }

    /** Offline production runs at 50% efficiency and is limited by available wire. */
    applyOfflineProgress(elapsedSec) {
        if (elapsedSec <= 5.0) return;

        let offlineClips = this.calculateTotalCPS().mul(elapsedSec * 0.5);
        if (!offlineClips.gt(BigDouble.zero())) return;

        if (this.isWireUnlocked) {
            const wirePerClip = this.getWirePerClip();
            const availableWire = this.wire.add(this.calculateTotalWPS().mul(elapsedSec));
            const wireLimited = availableWire.div(wirePerClip);
            if (wireLimited.lt(offlineClips)) offlineClips = wireLimited;
            this.wire = availableWire.sub(offlineClips.mul(wirePerClip));
            if (this.wire.lt(BigDouble.zero())) this.wire = BigDouble.zero();
        }
        if (!offlineClips.gt(BigDouble.zero())) return;

        this.addClips(offlineClips);
        this.dialogue.addLog("OFFLINE SUMMARY", `Simulation warped ahead ${Math.floor(elapsedSec)}s. Generated ${offlineClips.toShortScale(2)} clips.`);
    }

    resetState() {
        this.resetSimulationState();
        this.dialogue.startIntroSequence();

        if (this.visualizer) this.visualizer.reset();

        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) toastContainer.innerHTML = '';
        const popupsContainer = document.getElementById('floating-popups');
        if (popupsContainer) popupsContainer.innerHTML = '';

        this.renderAll();
        this.renderTechTree();
    }

    exportSave() {
        this.saveGame();
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const b64 = btoa(unescape(encodeURIComponent(raw)));
            prompt("Copy your save string (Base64):", b64);
        }
    }

    importSave() {
        const str = prompt("Paste your Base64 save string:");
        if (!str) return;
        try {
            const json = decodeURIComponent(escape(atob(str)));
            JSON.parse(json);
            localStorage.setItem(SAVE_KEY, json);
        } catch (e) {
            alert("Invalid save string format!");
            return;
        }
        this.resetSimulationState();
        if (this.visualizer) this.visualizer.reset();
        this.loadSave();
        this.dialogue.displayNext();
        this.renderAll();
        this.renderTechTree();
        alert("Save successfully imported!");
    }

    wipeSave() {
        if (confirm("WARNING: Are you sure you want to wipe all simulation progress? This cannot be undone.")) {
            localStorage.removeItem(SAVE_KEY);
            this.resetState();
            this.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, "SIMULATION RESET!", "gold-popup");
        }
    }
}

if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
    if (typeof document !== 'undefined' && document.addEventListener) {
        window.addEventListener('DOMContentLoaded', () => {
            window.game = new GameEngine();
            window.game.init();
        });
    }
}
