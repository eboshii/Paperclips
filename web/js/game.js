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
        this.wire = new BigDouble(5000.0, 0); // 5,000 kg initial wire supply when unlocked
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
    }

    init() {
        this.visualizer = new CosmicVisualizer('cosmic-canvas');

        this.bindEvents();
        this.loadSave();
        this.renderAll();

        // Setup Dialogue hook
        this.onDialogueTriggered = (sender, text) => {
            this.dialogue.addLog(sender, text);
        };

        // Start 60 FPS Game Loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    bindEvents() {
        // Hero Clicker Target
        const heroBtn = document.getElementById('hero-clicker-target');
        if (heroBtn) {
            heroBtn.addEventListener('mousedown', (e) => {
                this.isMouseDown = true;
                this.handleManualClick(e);
            });

            window.addEventListener('mouseup', () => {
                this.isMouseDown = false;
            });

            // Touch support
            heroBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleManualClick(e.touches[0]);
            }, { passive: false });
        }

        // Buy Wire Action Button
        const buyWireBtn = document.getElementById('btn-buy-wire');
        if (buyWireBtn) {
            buyWireBtn.addEventListener('click', () => this.buyWire());
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

        // Audio Controls
        const muteBtn = document.getElementById('btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.audio.setMuted(!this.audio.isMuted);
                muteBtn.textContent = this.audio.isMuted ? '🔇' : '🔊';
                muteBtn.classList.toggle('muted', this.audio.isMuted);
            });
        }

        const volSlider = document.getElementById('volume-slider');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.audio.setVolume(parseFloat(e.target.value));
            });
        }

        // Save & Reset Controls
        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) saveBtn.addEventListener('click', () => { this.saveGame(); alert('Simulation saved locally!'); });

        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSave());

        const importBtn = document.getElementById('btn-import');
        if (importBtn) importBtn.addEventListener('click', () => this.importSave());

        const wipeBtn = document.getElementById('btn-wipe');
        if (wipeBtn) wipeBtn.addEventListener('click', () => this.wipeSave());
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
            mult = Math.max(1, Math.floor(this.clips.toDouble() / 250.0));
        }

        const cost = new BigDouble(250.0 * mult, 0);
        const wireGain = new BigDouble(1000.0 * mult, 0);

        if (this.clips.gte(cost)) {
            this.clips = this.clips.sub(cost);
            this.wire = this.wire.add(wireGain);
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
            this.clips = this.clips.sub(purchase.totalCost);
            b.count += purchase.amount;

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
        if (this.techTree.purchaseResearch(techId, this)) {
            this.audio.playTechUnlockSound();
            this.renderStore();
            this.renderTechTree();
            this.renderResources();
        }
    }

    calculateTotalCPS() {
        const baseCPS = this.buildings.getTotalBaseCPS();
        const synergies = this.spatialGrid.evaluateSynergies();
        const techMult = this.techTree.globalCPSMultiplier;
        const prestigeMult = this.prestige.getGlobalPrestigeMultiplier();

        // Flywheel boost
        const flywheelBoost = 1.0 + (this.flywheelCharge / 100.0) * (this.techTree.flywheelMaxBoost - 1.0);

        return baseCPS.mul(synergies.totalMultiplier * techMult * prestigeMult * flywheelBoost);
    }

    gameLoop(timestamp) {
        const dt = Math.min(0.1, (timestamp - this.lastTickTime) / 1000.0);
        this.lastTickTime = timestamp;

        // Check Wire Unlock Threshold: City-level production capacity (50,000 clips)
        if (!this.isWireUnlocked && this.lifetimeClips.gte(new BigDouble(50000, 0))) {
            this.isWireUnlocked = true;
            this.dialogue.addLog("DR. VANCE", "Arthur, we've exhausted all local scrap metal in the district! We need to start ordering and managing industrial high-tensile wire supply!");
            this.renderResources();
        }

        // 1. Hold-to-Click Handler
        if (this.isMouseDown && this.techTree.holdToClickEnabled) {
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

        // 3. Automated Economic Simulation (Whole Integer Paperclips)
        const currentCPS = this.calculateTotalCPS();
        if (currentCPS.gt(BigDouble.zero())) {
            const clipsProduced = currentCPS.mul(dt);

            if (clipsProduced.exponent >= 5) {
                // High volume production (100k+ / tick): add directly and spawn streams
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
                if (this.visualizer) this.visualizer.spawnPaperclips(15);
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
                        if (this.visualizer) this.visualizer.spawnPaperclips(wholeClipsToAdd);
                    } else {
                        const wirePerClip = 0.001 * (1.0 - this.techTree.wireWasteReduction - this.prestige.getWireWasteDiscount());
                        const wireNeeded = new BigDouble(wirePerClip * wholeClipsToAdd, 0);

                        if (this.wire.gte(wireNeeded)) {
                            const wholeBD = BigDouble.fromNumber(wholeClipsToAdd);
                            this.clips = this.clips.add(wholeBD);
                            this.lifetimeClips = this.lifetimeClips.add(wholeBD);
                            this.wire = this.wire.sub(wireNeeded);
                            if (this.visualizer) this.visualizer.spawnPaperclips(wholeClipsToAdd);
                        } else if (this.wire.gt(BigDouble.zero())) {
                            const actualClips = Math.floor(this.wire.toDouble() / wirePerClip);
                            if (actualClips > 0) {
                                const wholeBD = BigDouble.fromNumber(actualClips);
                                this.clips = this.clips.add(wholeBD);
                                this.lifetimeClips = this.lifetimeClips.add(wholeBD);
                                if (this.visualizer) this.visualizer.spawnPaperclips(actualClips);
                            }
                            this.wire = BigDouble.zero();
                        }
                    }
                }
            }
        }

        // 4. Auto-Supply Logistics (if unlocked and wire active)
        if (this.isWireUnlocked && this.techTree.smartWireLogisticsUnlocked && this.techTree.smartWireActive) {
            if (this.wire.lt(new BigDouble(500, 0)) && this.clips.gte(new BigDouble(250, 0))) {
                this.buyWire();
            }
        }

        // 5. Passive Computing Ops Generation
        const stamperCount = this.buildings.getBuilding('hydraulic_stamper')?.count || 0;
        const opsRate = (0.8 + (stamperCount * 0.4)) * this.prestige.getOpsBoostMultiplier();
        this.ops = Math.min(this.maxOps, this.ops + (opsRate * dt));

        // 6. Subsystem Updates
        this.techTree.updateAvailability(this.ops, this.lifetimeClips);
        this.techTree.processQueue(this);
        this.dialogue.checkMilestones(this.lifetimeClips);
        this.news.update(dt, this);
        this.achievements.checkProgress(this);

        if (this.visualizer) {
            this.visualizer.update(dt, this);
            this.visualizer.render(this);
        }

        // 7. UI Rendering
        this.renderOdometer(currentCPS);
        this.renderResources();
        this.renderNews();

        // 8. Auto-Save Tick
        const now = Date.now();
        if (now - this.lastSaveTime >= this.saveInterval) {
            this.saveGame();
            this.lastSaveTime = now;
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    renderOdometer(currentCPS) {
        const clipsCountEl = document.getElementById('odometer-clips');
        if (clipsCountEl) clipsCountEl.textContent = this.lifetimeClips.toWholeScale();

        const cpsCountEl = document.getElementById('odometer-cps');
        if (cpsCountEl) {
            cpsCountEl.textContent = currentCPS.gt(BigDouble.zero()) ? `+${currentCPS.toShortScale(1)} / sec` : '+0 / sec';
        }

        const flywheelBar = document.getElementById('flywheel-progress');
        const flywheelText = document.getElementById('flywheel-label');
        if (flywheelBar) {
            flywheelBar.style.width = `${this.flywheelCharge}%`;
            if (flywheelText) {
                flywheelText.textContent = this.flywheelCharge > 5.0 ? `⚡ OVERCLOCK +${Math.round(this.flywheelCharge)}%` : '⚡ OVERCLOCK BOOST';
            }
        }
    }

    renderResources() {
        // Wire row visibility & amount
        const wireRow = document.getElementById('row-wire');
        const wireEl = document.getElementById('res-wire');
        if (wireRow) {
            wireRow.style.display = this.isWireUnlocked ? 'flex' : 'none';
        }
        if (wireEl && this.isWireUnlocked) {
            wireEl.textContent = `${this.wire.toShortScale(1)} kg`;
        }

        // Ops amount
        const opsEl = document.getElementById('res-ops');
        if (opsEl) opsEl.textContent = `${Math.floor(this.ops)} / ${Math.floor(this.maxOps)}`;

        // Population row
        const popRow = document.getElementById('row-population');
        const popEl = document.getElementById('res-population');
        if (popRow && popEl) {
            if (this.lifetimeClips.gte(new BigDouble(1.0, 6))) {
                popRow.style.display = 'flex';
                popEl.textContent = this.humanPopulation.toLocaleString();
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
            else if (this.buyMultiplier === 'max') mult = Math.max(1, Math.floor(this.clips.toDouble() / 250.0));

            wireGainEl.textContent = `+${(1000 * mult).toLocaleString()} kg`;
            wireCostEl.textContent = `${(250 * mult).toLocaleString()} Clips`;
        }

        // Notification Badges on Right Dock
        const nextTech = this.techTree.getNextUnpurchasedNode();
        const canAffordTech = nextTech && this.techTree.canAfford(nextTech.id, this.ops, this.clips);
        const techBadge = document.getElementById('tech-badge-count');
        if (techBadge) techBadge.style.display = canAffordTech ? 'flex' : 'none';

        const canAffordBuilding = this.buildings.buildings.some(b => {
            const p = b.getCost(this.buyMultiplier, this.clips);
            return this.clips.gte(p.totalCost);
        });
        const storeBadge = document.getElementById('store-badge-count');
        if (storeBadge) storeBadge.style.display = canAffordBuilding ? 'flex' : 'none';
    }

    renderNews() {
        const newsTextEl = document.getElementById('news-text');
        if (newsTextEl) {
            newsTextEl.textContent = this.news.getCurrentText();
        }
    }

    renderStore() {
        const container = document.getElementById('buildings-container');
        if (!container) return;

        // Render Single Next Upgrade Shelf in Store
        this.renderUpgradesShelf();

        // Render Building Cards
        container.innerHTML = this.buildings.buildings.map(b => {
            const purchase = b.getCost(this.buyMultiplier, this.clips);
            const canAfford = this.clips.gte(purchase.totalCost);
            const costFormatted = `${purchase.totalCost.toWholeScale()} Clips`;
            const rateFormatted = `+${b.baseCPS.toShortScale(1)} CPS`;

            return `
                <div class="building-card ${canAfford ? 'affordable' : 'locked'}" onclick="game.buyBuilding('${b.id}')">
                    <div class="building-icon">${b.icon}</div>
                    <div class="building-details">
                        <div class="building-name">${b.name}</div>
                        <div class="building-cost">${costFormatted} <span class="building-rate">| ${rateFormatted}</span></div>
                    </div>
                    <div class="building-count">${b.count}</div>
                </div>
            `;
        }).join('');
    }

    renderUpgradesShelf() {
        const shelf = document.getElementById('upgrades-shelf');
        if (!shelf) return;

        const nextNode = this.techTree.getNextUnpurchasedNode();
        if (!nextNode) {
            shelf.innerHTML = '<div class="no-upgrades-box">🎉 All Research Unlocked!</div>';
            return;
        }

        const canAfford = this.techTree.canAfford(nextNode.id, this.ops, this.clips);
        shelf.innerHTML = `
            <div class="next-upgrade-card">
                <div class="upgrade-top-row">
                    <div class="upgrade-icon-box">${nextNode.icon}</div>
                    <div class="upgrade-header-info">
                        <div class="upgrade-title">${nextNode.title}</div>
                        <div class="upgrade-discipline">${nextNode.discipline}</div>
                    </div>
                </div>
                <div class="upgrade-effect">${nextNode.effectDescription}</div>
                <button class="btn-buy-upgrade ${canAfford ? 'affordable' : 'unaffordable'}" onclick="game.buyTech('${nextNode.id}')">
                    <span>${canAfford ? '💡 RESEARCH' : '🔒 LOCKED'}</span>
                    <span>⚡ ${nextNode.opsCost} Ops | 📎 ${nextNode.clipsCost.toWholeScale()}</span>
                </button>
            </div>
        `;
    }

    renderTechTree() {
        const container = document.getElementById('tech-tree-container');
        if (!container) return;

        const nextNode = this.techTree.getNextUnpurchasedNode();
        if (!nextNode) {
            container.innerHTML = `
                <div class="no-upgrades-box" style="padding:24px; font-size:14px; line-height:1.5;">
                    🎉 All Available Research Completed!
                    <div style="font-size:12px; color:var(--text-sub); margin-top:8px;">Maximum Technological Singularity Achieved!</div>
                </div>
            `;
            return;
        }

        const canAfford = this.techTree.canAfford(nextNode.id, this.ops, this.clips);
        container.innerHTML = `
            <div class="single-upgrade-shelf" style="padding:14px;">
                <div class="shelf-label" style="font-size:10px; margin-bottom:12px;">🔬 NEXT RESEARCH OBJECTIVE</div>
                <div class="next-upgrade-card" style="padding:14px; gap:12px;">
                    <div class="upgrade-top-row" style="gap:12px;">
                        <div class="upgrade-icon-box" style="width:48px; height:48px; font-size:26px;">${nextNode.icon}</div>
                        <div class="upgrade-header-info">
                            <div class="upgrade-title" style="font-size:18px;">${nextNode.title}</div>
                            <div class="upgrade-discipline" style="font-size:10px; margin-top:3px;">${nextNode.discipline}</div>
                        </div>
                    </div>
                    <div class="upgrade-effect" style="font-size:14px; color:#ffffff; background:#190c33; padding:12px; border-radius:8px; border:2px solid var(--border-ink); line-height:1.4;">
                        ${nextNode.effectDescription}
                    </div>
                    <div style="font-family:var(--font-cartoon); font-size:14px; font-weight:700; color:var(--neon-yellow);">
                        Cost: ⚡ ${nextNode.opsCost} Ops &nbsp;|&nbsp; 📎 ${nextNode.clipsCost.toWholeScale()} Clips
                    </div>
                    <button class="btn-buy-upgrade ${canAfford ? 'affordable' : 'unaffordable'}" style="padding:12px 16px; font-size:15px;" onclick="game.buyTech('${nextNode.id}')">
                        <span>${canAfford ? '💡 RESEARCH NOW' : '🔒 NEED MORE OPS / CLIPS'}</span>
                        <span>⚡ ${nextNode.opsCost} Ops</span>
                    </button>
                </div>
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
                        if (node.onResearched) node.onResearched();
                    }
                });
            }

            if (data.achievements) {
                data.achievements.forEach(savedAch => {
                    const a = this.achievements.achievements.find(item => item.id === savedAch.id);
                    if (a) a.isUnlocked = savedAch.unlocked;
                });
            }

            // Offline calculations
            if (data.timestamp) {
                const now = Date.now();
                const elapsedSec = (now - data.timestamp) / 1000.0;
                if (elapsedSec > 5.0) {
                    const offlineCPS = this.calculateTotalCPS();
                    const offlineClips = offlineCPS.mul(elapsedSec * 0.5);

                    if (offlineClips.gt(BigDouble.zero())) {
                        this.clips = this.clips.add(offlineClips);
                        this.lifetimeClips = this.lifetimeClips.add(offlineClips);
                        this.dialogue.addLog("OFFLINE SUMMARY", `Simulation warped ahead ${Math.floor(elapsedSec)}s. Generated ${offlineClips.toShortScale(2)} clips!`);
                    }
                }
            }
        } catch (e) {
            console.error("Load save error:", e);
        }
    }

    resetState() {
        this.clips = BigDouble.zero();
        this.lifetimeClips = BigDouble.zero();
        this.fractionalClips = 0.0;
        this.wire = new BigDouble(5000.0, 0);
        this.isWireUnlocked = false;
        this.ops = 0.0;
        this.maxOps = 1000.0;
        this.humanPopulation = 8000000000;
        this.flywheelCharge = 0.0;

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
        this.news = new NewsTickerEngine();

        if (this.visualizer) {
            this.visualizer.fallingClips = [];
            this.visualizer.settledClips = [];
            this.visualizer.initFluidColumns();
            this.visualizer.tier = 0;
            this.visualizer.autoTier = true;
        }

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
