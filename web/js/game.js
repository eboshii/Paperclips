/**
 * game.js - Master Game Controller & 60 FPS Simulation Engine
 * Integrates Cookie Clicker 3-column architecture, Objective: Paperclips styling,
 * kinetic flywheel overclock, QoL hold-to-click, and offline time-warp.
 */

class GameEngine {
    constructor() {
        // Resources & Balances
        this.clips = BigDouble.zero();
        this.lifetimeClips = BigDouble.zero();
        this.wire = new BigDouble(100.0, 0); // 100 kg initial wire
        this.funds = new BigDouble(50.0, 0);  // $50 initial funds
        this.ops = 0.0;
        this.maxOps = 1000.0;
        this.insight = 0.0;
        this.humanPopulation = 8000000000;
        this.marketProfits = 0.0;

        // UI & Multiplier State
        this.buyMultiplier = '1';
        this.activeTab = 'store';

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

        // Equivalency Table
        this.equivalencyMilestones = [
            { kg: 0.001, label: "1 Paperclip (1g)" },
            { kg: 0.15, label: "1 Smartphone" },
            { kg: 14.0, label: "1 Bicycle" },
            { kg: 1500.0, label: "1 Automobile" },
            { kg: 100000.0, label: "1 Boeing 747" },
            { kg: 10100000.0, label: "The Eiffel Tower" },
            { kg: 5.97e24, label: "100% of Planet Earth" },
            { kg: 1.989e30, label: "The Solar System (Sun)" },
            { kg: 1.5e42, label: "Milky Way Galaxy" },
            { kg: 1.48e53, label: "Observable Universe" }
        ];
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

            // Touch support for mobile/tablets
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

        // Multiplier Buttons
        const multButtons = document.querySelectorAll('.mult-btn');
        multButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                multButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.buyMultiplier = btn.dataset.mult;
                this.renderStore();
            });
        });

        // Navigation Tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeTab = tab.dataset.tab;
                this.switchTab(this.activeTab);
            });
        });

        // Cosmic Scale Viewport Pills
        const tierPills = document.querySelectorAll('.tier-pill');
        tierPills.forEach(pill => {
            pill.addEventListener('click', () => {
                tierPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const t = parseInt(pill.dataset.tier, 10);
                if (this.visualizer) this.visualizer.setTier(t);
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

        // Settings / Audio Controls
        const muteBtn = document.getElementById('btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.audio.setMuted(!this.audio.isMuted);
                muteBtn.textContent = this.audio.isMuted ? '🔇 Muted' : '🔊 Sound On';
                muteBtn.classList.toggle('muted', this.audio.isMuted);
            });
        }

        const volSlider = document.getElementById('volume-slider');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.audio.setVolume(parseFloat(e.target.value));
            });
        }

        // Save & Reset Buttons
        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) saveBtn.addEventListener('click', () => { this.saveGame(); alert('Simulation state saved locally!'); });

        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSave());

        const importBtn = document.getElementById('btn-import');
        if (importBtn) importBtn.addEventListener('click', () => this.importSave());

        const wipeBtn = document.getElementById('btn-wipe');
        if (wipeBtn) wipeBtn.addEventListener('click', () => this.wipeSave());

        const prestigeBtn = document.getElementById('btn-prestige-reboot');
        if (prestigeBtn) prestigeBtn.addEventListener('click', () => this.rebootQuantumEpoch());
    }

    handleManualClick(e) {
        const wirePerClip = 0.001 * (1.0 - this.techTree.wireWasteReduction - this.prestige.getWireWasteDiscount());
        const wireNeeded = new BigDouble(wirePerClip, 0);

        if (this.wire.gte(wireNeeded)) {
            let baseClips = BigDouble.one();
            this.clips = this.clips.add(baseClips);
            this.lifetimeClips = this.lifetimeClips.add(baseClips);
            this.wire = this.wire.sub(wireNeeded);

            // Charge Flywheel
            this.flywheelCharge = Math.min(100.0, this.flywheelCharge + 4.5);

            // Audio & Visual Effects
            this.audio.playClickChime();
            if (this.visualizer) this.visualizer.triggerHeroClick();

            // Spawn floating text popup
            this.spawnFloatingText(e ? (e.clientX || 150) : 150, e ? (e.clientY || 250) : 250, "+1", "spark-popup");

            // Spark Chance (5% to 10%)
            const hasSparkTech = this.techTree.nodeMap["tech_spark_frequency"]?.isResearched;
            const sparkChance = hasSparkTech ? 0.10 : 0.05;
            if (Math.random() < sparkChance) {
                const bonusOps = 5.0;
                const bonusFunds = new BigDouble(50.0, 0);
                this.ops = Math.min(this.maxOps, this.ops + bonusOps);
                this.funds = this.funds.add(bonusFunds);
                this.audio.playSparkSound();
                this.spawnFloatingText(e ? (e.clientX || 150) : 150, (e ? (e.clientY || 250) : 250) - 25, "+$50 SPARK", "gold-popup");
            }
        } else {
            this.spawnFloatingText(e ? (e.clientX || 150) : 150, e ? (e.clientY || 250) : 250, "OUT OF WIRE!", "warn-popup");
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
        }, 1200);
    }

    buyWire() {
        let mult = 1;
        if (this.buyMultiplier === '10') mult = 10;
        else if (this.buyMultiplier === '100') mult = 100;
        else if (this.buyMultiplier === 'next' || this.buyMultiplier === 'max') {
            mult = Math.max(1, Math.floor(this.funds.toDouble() / 15.0));
        }

        const cost = new BigDouble(15.0 * mult, 0);
        const wireGain = new BigDouble(1000.0 * mult, 0);

        if (this.funds.gte(cost)) {
            this.funds = this.funds.sub(cost);
            this.wire = this.wire.add(wireGain);
            this.audio.playWireSound();
            this.renderResources();
            this.renderStore();
        }
    }

    buyBuilding(buildingId) {
        const b = this.buildings.getBuilding(buildingId);
        if (!b) return;

        const available = b.currencyType === 'funds' ? this.funds : this.clips;
        const purchase = b.getCost(this.buyMultiplier, available);

        if (available.gte(purchase.totalCost)) {
            if (b.currencyType === 'funds') {
                this.funds = this.funds.sub(purchase.totalCost);
            } else {
                this.clips = this.clips.sub(purchase.totalCost);
            }
            b.count += purchase.amount;

            // Auto-place in 8x8 spatial grid if unlocked or extruder/stamper
            if (b.gridTileType) {
                for (let k = 0; k < purchase.amount; ++k) {
                    this.spatialGrid.autoPlace(b.gridTileType);
                }
            }

            // Bio-converter deconstructs biomass
            if (b.id === 'bio_converter') {
                this.humanPopulation = Math.max(0, this.humanPopulation - (5000000 * purchase.amount));
                this.wire = this.wire.add(new BigDouble(5000.0 * purchase.amount, 0));
            }

            this.audio.playPurchaseSound();
            this.renderStore();
            this.renderResources();
        }
    }

    calculateTotalCPS() {
        const baseCPS = this.buildings.getTotalBaseCPS();
        const synergies = this.spatialGrid.evaluateSynergies();
        const techMult = this.techTree.globalCPSMultiplier;
        const prestigeMult = this.prestige.getGlobalPrestigeMultiplier();

        // Flywheel boost (0% to +100% boost)
        const flywheelBoost = 1.0 + (this.flywheelCharge / 100.0) * (this.techTree.flywheelMaxBoost - 1.0);

        return baseCPS.mul(synergies.totalMultiplier * techMult * prestigeMult * flywheelBoost);
    }

    gameLoop(timestamp) {
        const dt = Math.min(0.1, (timestamp - this.lastTickTime) / 1000.0);
        this.lastTickTime = timestamp;

        // 1. Hold-to-Click Handler
        if (this.isMouseDown && this.techTree.holdToClickEnabled) {
            this.holdClickTimer += dt;
            if (this.holdClickTimer >= 0.05) { // 20Hz rapid click
                this.holdClickTimer = 0;
                this.handleManualClick(null);
            }
        }

        // 2. Flywheel Momentum Decay
        if (this.flywheelCharge > 0) {
            this.flywheelCharge = Math.max(0, this.flywheelCharge - this.flywheelDecayRate * dt);
        }

        // 3. Automated Economic Simulation
        const currentCPS = this.calculateTotalCPS();
        if (currentCPS.gt(BigDouble.zero())) {
            const clipsProduced = currentCPS.mul(dt);
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

        // 4. Auto-Supply Logistics
        if (this.techTree.smartWireLogisticsUnlocked && this.techTree.smartWireActive) {
            if (this.wire.lt(new BigDouble(150, 0)) && this.funds.gte(new BigDouble(15, 0))) {
                this.buyWire();
            }
        }

        // 5. Passive Funds & Ops Generation
        const clipperCount = this.buildings.getBuilding('auto_clipper')?.count || 0;
        const stamperCount = this.buildings.getBuilding('hydraulic_stamper')?.count || 0;
        const hftActive = this.techTree.nodeMap['tech_market_arbitrage']?.isResearched;

        const passiveFundsRate = 5.0 + (clipperCount * 0.5) + (hftActive ? 150.0 : 0.0);
        this.funds = this.funds.add(new BigDouble(passiveFundsRate * dt, 0));
        this.marketProfits += (hftActive ? 150.0 : 0.0) * dt;

        const opsRate = (2.0 + (stamperCount * 0.5)) * this.prestige.getOpsBoostMultiplier();
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
        if (clipsCountEl) clipsCountEl.textContent = this.lifetimeClips.toShortScale(2);

        const cpsCountEl = document.getElementById('odometer-cps');
        if (cpsCountEl) {
            cpsCountEl.textContent = currentCPS.gt(BigDouble.zero()) ? currentCPS.toShortScale(1) : '0';
        }

        const flywheelBar = document.getElementById('flywheel-progress');
        const flywheelText = document.getElementById('flywheel-label');
        if (flywheelBar) {
            flywheelBar.style.width = `${this.flywheelCharge}%`;
            if (flywheelText) {
                flywheelText.textContent = this.flywheelCharge > 5.0 ? `OVERCLOCK ACTIVE (+${Math.round(this.flywheelCharge)}%)` : 'KINETIC FLYWHEEL READY';
            }
        }
    }

    renderResources() {
        const wireEl = document.getElementById('res-wire');
        if (wireEl) wireEl.textContent = `${this.wire.toShortScale(1)} kg`;

        const fundsEl = document.getElementById('res-funds');
        if (fundsEl) fundsEl.textContent = this.funds.formatCurrency(2);

        const opsEl = document.getElementById('res-ops');
        if (opsEl) opsEl.textContent = `${Math.floor(this.ops)} / ${Math.floor(this.maxOps)} FLOPs`;

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

        const massEl = document.getElementById('res-mass-equiv');
        if (massEl) {
            massEl.textContent = this.getEquivalencyString();
        }

        // Buy Wire Button text & cost
        const wireCostEl = document.getElementById('wire-btn-cost');
        const wireGainEl = document.getElementById('wire-btn-gain');
        if (wireCostEl && wireGainEl) {
            let mult = 1;
            if (this.buyMultiplier === '10') mult = 10;
            else if (this.buyMultiplier === '100') mult = 100;
            else if (this.buyMultiplier === 'next' || this.buyMultiplier === 'max') mult = Math.max(1, Math.floor(this.funds.toDouble() / 15.0));

            wireGainEl.textContent = `+ Buy ${(1000 * mult).toLocaleString()} kg Wire`;
            wireCostEl.textContent = `Cost: $${(15 * mult).toLocaleString()}`;
        }
    }

    getEquivalencyString() {
        const totalKg = this.lifetimeClips.mul(0.001).toDouble();
        for (let i = this.equivalencyMilestones.length - 1; i >= 0; --i) {
            const m = this.equivalencyMilestones[i];
            if (totalKg >= m.kg) {
                const count = totalKg / m.kg;
                return count >= 2.0 ? `${count.toFixed(1)} × ${m.label}` : m.label;
            }
        }
        return "1 Paperclip (1g)";
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

        // Render Upgrades Shelf (Top horizontal row)
        this.renderUpgradesShelf();

        // Render Building Rows
        container.innerHTML = this.buildings.buildings.map(b => {
            const available = b.currencyType === 'funds' ? this.funds : this.clips;
            const purchase = b.getCost(this.buyMultiplier, available);
            const canAfford = available.gte(purchase.totalCost);
            const costFormatted = b.currencyType === 'funds' ? purchase.totalCost.formatCurrency(2) : `${purchase.totalCost.toShortScale(2)} Clips`;
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

        const available = this.techTree.getAvailableNodes().slice(0, 5);
        if (available.length === 0) {
            shelf.innerHTML = '<div class="no-upgrades">All discovered technology unlocked</div>';
            return;
        }

        shelf.innerHTML = available.map(node => {
            const canAfford = this.techTree.canAfford(node.id, this.ops, this.clips);
            return `
                <div class="upgrade-icon ${canAfford ? 'affordable' : 'unaffordable'}" 
                     onclick="game.buyTech('${node.id}')" 
                     title="${node.title}\n${node.effectDescription}\nCost: ${node.opsCost} Ops, ${node.clipsCost.toShortScale()} Clips">
                    ${node.icon}
                </div>
            `;
        }).join('');
    }

    buyTech(techId) {
        if (this.techTree.purchaseResearch(techId, this)) {
            this.audio.playTechUnlockSound();
            this.renderStore();
            this.renderTechTree();
        }
    }

    switchTab(tabId) {
        const views = {
            store: document.getElementById('view-store'),
            tech: document.getElementById('view-tech'),
            grid: document.getElementById('view-grid'),
            stats: document.getElementById('view-stats'),
            prestige: document.getElementById('view-prestige')
        };

        Object.keys(views).forEach(k => {
            if (views[k]) views[k].style.display = (k === tabId) ? 'block' : 'none';
        });

        if (tabId === 'store') this.renderStore();
        else if (tabId === 'tech') this.renderTechTree();
        else if (tabId === 'grid') this.renderGrid();
        else if (tabId === 'stats') this.renderStats();
        else if (tabId === 'prestige') this.renderPrestige();
    }

    renderTechTree() {
        const container = document.getElementById('tech-tree-container');
        if (!container) return;

        const available = this.techTree.getAvailableNodes();
        const researched = this.techTree.getResearchedNodes();

        container.innerHTML = `
            <div class="tech-section-header">AVAILABLE RESEARCH (${available.length})</div>
            <div class="tech-cards-grid">
                ${available.map(node => {
                    const canAfford = this.techTree.canAfford(node.id, this.ops, this.clips);
                    return `
                        <div class="tech-card ${canAfford ? 'affordable' : 'locked'}" onclick="game.buyTech('${node.id}')">
                            <div class="tech-card-top">
                                <span class="tech-card-icon">${node.icon}</span>
                                <span class="tech-card-title">${node.title}</span>
                            </div>
                            <div class="tech-card-discipline">${node.discipline}</div>
                            <div class="tech-card-effect">${node.effectDescription}</div>
                            <div class="tech-card-cost">Cost: ${node.opsCost} Ops | ${node.clipsCost.toShortScale()} Clips</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="tech-section-header" style="margin-top:20px;">COMPLETED RESEARCH (${researched.length})</div>
            <div class="tech-cards-grid completed">
                ${researched.map(node => `
                    <div class="tech-card completed">
                        <div class="tech-card-top">
                            <span class="tech-card-icon">${node.icon}</span>
                            <span class="tech-card-title">${node.title}</span>
                        </div>
                        <div class="tech-card-effect">${node.effectDescription}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderGrid() {
        const container = document.getElementById('spatial-grid-view');
        if (!container) return;

        const synergies = this.spatialGrid.evaluateSynergies();

        let gridCellsHtml = '';
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                const tile = this.spatialGrid.getTile(x, y);
                const tileIcon = tile === 'WireExtruder' ? '⚡' : tile === 'HydraulicStamper' ? '🔨' : tile === 'LaserSinterer' ? '🔥' : tile === 'CoolingTower' ? '❄️' : '';
                gridCellsHtml += `
                    <div class="grid-cell ${tile ? 'occupied' : 'empty'}" data-x="${x}" data-y="${y}">
                        ${tileIcon}
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="grid-synergy-banner">
                <div>Linear Feed: +${synergies.linearBonusPercent}%</div>
                <div>Cooling Bonus: +${synergies.coolingBonusPercent}%</div>
                <div>Symmetry Score: ${synergies.symmetryScorePercent}%</div>
                <div style="color:#00e5ff;">Total Multiplier: ${(synergies.totalMultiplier).toFixed(2)}x</div>
            </div>
            <div class="spatial-grid-matrix">${gridCellsHtml}</div>
        `;
    }

    renderStats() {
        const container = document.getElementById('stats-view-container');
        if (!container) return;

        const achs = this.achievements.achievements;
        container.innerHTML = `
            <div class="stats-overview-box">
                <div class="stats-metric"><span>Lifetime Paperclips:</span> <span>${this.lifetimeClips.toShortScale(2)}</span></div>
                <div class="stats-metric"><span>Total Market Profits:</span> <span>$${Math.floor(this.marketProfits).toLocaleString()}</span></div>
                <div class="stats-metric"><span>Achievements Unlocked:</span> <span>${this.achievements.getUnlockedCount()} / ${achs.length}</span></div>
                <div class="stats-metric"><span>Quantum Epoch Prestige Rank:</span> <span>${this.prestige.epochRank}</span></div>
                <div class="stats-metric"><span>Entropic Bits Harvested:</span> <span>${this.prestige.totalBitsEarned}</span></div>
            </div>

            <div class="tech-section-header" style="margin-top:20px;">ACHIEVEMENTS (${this.achievements.getUnlockedCount()}/${achs.length})</div>
            <div class="achievements-list">
                ${achs.map(a => `
                    <div class="achievement-row ${a.isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="ach-icon">${a.isUnlocked ? a.icon : '🔒'}</div>
                        <div class="ach-info">
                            <div class="ach-title">${a.title}</div>
                            <div class="ach-desc">${a.isSecret && !a.isUnlocked ? 'Secret Milestone...' : a.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPrestige() {
        const container = document.getElementById('prestige-view-container');
        if (!container) return;

        const pending = this.prestige.calculatePendingBits(this.lifetimeClips);

        container.innerHTML = `
            <div class="prestige-card">
                <h2>QUANTUM EPOCH REBOOT</h2>
                <p>Collapse reality into a quantum singularity to harvest Entropic Bits (Ω).</p>
                <div class="bits-counter">
                    <div>Current Entropic Bits: <strong>${this.prestige.entropicBits} Ω</strong></div>
                    <div>Bits Earned on Reboot: <strong>+${pending} Ω</strong></div>
                </div>
                <button id="btn-reboot-now" class="action-btn ${pending > 0 ? 'active-reboot' : 'disabled'}" onclick="game.rebootQuantumEpoch()">
                    ${pending > 0 ? 'COLLAPSE SIMULATION & HARVEST Ω' : 'REQUIRES 1 QUADRILLION CLIPS'}
                </button>
            </div>

            <div class="tech-section-header" style="margin-top:24px;">QUANTUM ARCHIVE TALENTS</div>
            <div class="talents-grid">
                ${this.prestige.talents.map(t => {
                    const cost = this.prestige.getTalentCost(t.id);
                    const canAfford = this.prestige.entropicBits >= cost && t.rank < t.maxRank;
                    return `
                        <div class="talent-card ${canAfford ? 'affordable' : 'locked'}" onclick="game.buyPrestigeTalent('${t.id}')">
                            <div class="talent-top">
                                <span>${t.icon} ${t.title}</span>
                                <span class="talent-rank">Rank ${t.rank}/${t.maxRank}</span>
                            </div>
                            <div class="talent-desc">${t.description}</div>
                            <div class="talent-cost">${t.rank < t.maxRank ? `Cost: ${cost} Ω` : 'MAXED'}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    buyPrestigeTalent(talentId) {
        if (this.prestige.buyTalent(talentId)) {
            this.audio.playTechUnlockSound();
            this.renderPrestige();
        }
    }

    rebootQuantumEpoch() {
        const pending = this.prestige.calculatePendingBits(this.lifetimeClips);
        if (pending <= 0) return;

        if (confirm(`Are you sure you want to collapse the universe?\nYou will gain +${pending} Entropic Bits (Ω) and restart with permanent meta-perks.`)) {
            this.prestige.entropicBits += pending;
            this.prestige.totalBitsEarned += pending;
            this.prestige.epochRank++;

            // Reset simulation balances
            const startBonus = this.prestige.getStartingClips();
            this.clips = new BigDouble(startBonus, 0);
            this.lifetimeClips = new BigDouble(startBonus, 0);
            this.wire = new BigDouble(100.0, 0);
            this.funds = new BigDouble(50.0, 0);
            this.ops = 0.0;
            this.humanPopulation = 8000000000;
            this.flywheelCharge = 0.0;

            // Reset buildings & research
            this.buildings.initCatalog();
            this.techTree.initCatalog();
            this.spatialGrid = new SpatialGridEngine();

            this.dialogue.init();
            this.audio.playAlarmSound();

            this.saveGame();
            this.renderAll();
        }
    }

    renderAll() {
        this.renderStore();
        this.renderResources();
        this.renderNews();
        this.dialogue.render();
    }

    saveGame() {
        const stateObj = {
            clips: { m: this.clips.mantissa, e: this.clips.exponent },
            lifetimeClips: { m: this.lifetimeClips.mantissa, e: this.lifetimeClips.exponent },
            wire: { m: this.wire.mantissa, e: this.wire.exponent },
            funds: { m: this.funds.mantissa, e: this.funds.exponent },
            ops: this.ops,
            humanPopulation: this.humanPopulation,
            marketProfits: this.marketProfits,
            buildings: this.buildings.buildings.map(b => ({ id: b.id, count: b.count })),
            techResearched: this.techTree.getResearchedNodes().map(n => n.id),
            achievements: this.achievements.achievements.map(a => ({ id: a.id, unlocked: a.isUnlocked })),
            prestige: {
                epochRank: this.prestige.epochRank,
                entropicBits: this.prestige.entropicBits,
                totalBitsEarned: this.prestige.totalBitsEarned,
                talents: this.prestige.talents.map(t => ({ id: t.id, rank: t.rank }))
            },
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
            if (data.funds) this.funds = new BigDouble(data.funds.m, data.funds.e);
            if (data.ops !== undefined) this.ops = data.ops;
            if (data.humanPopulation !== undefined) this.humanPopulation = data.humanPopulation;
            if (data.marketProfits !== undefined) this.marketProfits = data.marketProfits;

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

            if (data.prestige) {
                this.prestige.epochRank = data.prestige.epochRank || 0;
                this.prestige.entropicBits = data.prestige.entropicBits || 0;
                this.prestige.totalBitsEarned = data.prestige.totalBitsEarned || 0;
                if (data.prestige.talents) {
                    data.prestige.talents.forEach(st => {
                        const t = this.prestige.talents.find(item => item.id === st.id);
                        if (t) t.rank = st.rank;
                    });
                }
            }

            // Offline Time Warp Calculation
            if (data.timestamp) {
                const now = Date.now();
                const elapsedSec = (now - data.timestamp) / 1000.0;
                if (elapsedSec > 5.0) {
                    const offlineEff = this.prestige.isOffline100Percent() ? 1.0 : 0.5;
                    const offlineCPS = this.calculateTotalCPS();
                    const offlineClips = offlineCPS.mul(elapsedSec * offlineEff);

                    if (offlineClips.gt(BigDouble.zero())) {
                        this.clips = this.clips.add(offlineClips);
                        this.lifetimeClips = this.lifetimeClips.add(offlineClips);
                        this.dialogue.addLog("OFFLINE SUMMARY", `Simulation warped ahead ${Math.floor(elapsedSec)}s. Generated ${offlineClips.toShortScale(2)} clips (${offlineEff * 100}% efficiency).`);
                    }
                }
            }
        } catch (e) {
            console.error("Load save error:", e);
        }
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
                window.location.reload();
            } catch (e) {
                alert("Invalid save string format!");
            }
        }
    }

    wipeSave() {
        if (confirm("WARNING: Are you sure you want to wipe all simulation progress? This cannot be undone.")) {
            localStorage.removeItem('objective_paperclips_save');
            window.location.reload();
        }
    }
}

let game = null;
window.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine();
    window.game = game;
    game.init();
});
