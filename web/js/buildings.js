/**
 * buildings.js - 15 Machine Tiers (Clips-Only Economy)
 * Implements geometric scaling (1.15x) and bulk purchase calculations.
 */

class BuildingTier {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.category = config.category || 'Factory Assembly';
        this.currencyType = 'clips'; // All buildings strictly cost clips!
        this.baseCost = config.baseCost instanceof BigDouble ? config.baseCost : BigDouble.fromNumber(config.baseCost);
        this.baseCPS = config.baseCPS instanceof BigDouble ? config.baseCPS : BigDouble.fromNumber(config.baseCPS);
        this.costMultiplier = config.costMultiplier || 1.15;
        this.unlockThresholdClips = config.unlockThresholdClips instanceof BigDouble ? config.unlockThresholdClips : BigDouble.fromNumber(config.unlockThresholdClips || 0);
        this.count = config.count || 0;
        this.icon = config.icon || '⚙️';
        this.description = config.description || '';
        this.gridTileType = config.gridTileType || null;
    }

    calculateBulkCost(currentOwned, amountToBuy) {
        if (amountToBuy <= 0) return BigDouble.zero();
        if (amountToBuy === 1) {
            return this.baseCost.mul(Math.pow(this.costMultiplier, currentOwned));
        }

        // Geometric series sum: S = B * r^K * (r^N - 1) / (r - 1)
        const r = this.costMultiplier;
        const factor = (Math.pow(r, amountToBuy) - 1.0) / (r - 1.0);
        return this.baseCost.mul(Math.pow(r, currentOwned) * factor);
    }

    calculateMaxAffordable(currentOwned, availableClips) {
        const r = this.costMultiplier;
        const currentBase = this.baseCost.mul(Math.pow(r, currentOwned));
        if (availableClips.lt(currentBase)) return 0;

        const ratio = availableClips.div(currentBase).toDouble() * (r - 1.0) + 1.0;
        if (ratio <= 1.0) return 1;
        const maxN = Math.floor(Math.log(ratio) / Math.log(r));
        return Math.max(1, maxN);
    }

    calculateNextMilestone(currentOwned) {
        const milestones = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 1000];
        for (let m of milestones) {
            if (currentOwned < m) {
                return m - currentOwned;
            }
        }
        let nextHundred = (Math.floor(currentOwned / 100) + 1) * 100;
        return nextHundred - currentOwned;
    }

    getCost(multiplierMode, availableClips) {
        let amount = 1;
        if (multiplierMode === '10') amount = 10;
        else if (multiplierMode === '100') amount = 100;
        else if (multiplierMode === 'max') amount = this.calculateMaxAffordable(this.count, availableClips);

        amount = Math.max(1, amount);
        return {
            amount: amount,
            totalCost: this.calculateBulkCost(this.count, amount)
        };
    }
}

class BuildingManager {
    constructor() {
        this.buildings = [];
        this.initCatalog();
    }

    initCatalog() {
        this.buildings = [
            // =========================================================================
            // TIER 0: WORKSHOP & EARLY FACTORY AUTOMATION (0 to 10k Clips)
            // =========================================================================
            new BuildingTier({
                id: 'auto_clipper',
                name: 'Auto-Clipper',
                category: 'Factory Assembly',
                baseCost: new BigDouble(25, 0),
                baseCPS: new BigDouble(0.5, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(0, 0),
                icon: '⚡',
                description: 'Automated desktop wire bending arm. Rapidly folds standard steel clips.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'wire_extruder',
                name: 'Dual-Feed Wire Extruder',
                category: 'Factory Assembly',
                baseCost: new BigDouble(75, 0),
                baseCPS: new BigDouble(1.5, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(50, 0),
                icon: '🪛',
                description: 'Continuously feeds and stretches steel coil into precision wire gauges.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'hydraulic_stamper',
                name: 'Hydraulic Stamper',
                category: 'Factory Assembly',
                baseCost: new BigDouble(220, 0),
                baseCPS: new BigDouble(5.0, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(150, 0),
                icon: '🔨',
                description: 'High-pressure pneumatic press stamping wire blanks in single-stroke cycles.',
                gridTileType: 'HydraulicStamper'
            }),
            new BuildingTier({
                id: 'laser_sinterer',
                name: 'Laser Sinterer',
                category: 'Factory Assembly',
                baseCost: new BigDouble(850, 0),
                baseCPS: new BigDouble(18.0, 0),
                costMultiplier: 1.14,
                unlockThresholdClips: new BigDouble(600, 0),
                icon: '🔥',
                description: 'Multi-axis infrared laser forge fusing powdered iron into double loops.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'rotary_bender',
                name: 'CNC Rotary Bender',
                category: 'Factory Assembly',
                baseCost: new BigDouble(3500, 0),
                baseCPS: new BigDouble(65.0, 0),
                costMultiplier: 1.14,
                unlockThresholdClips: new BigDouble(2500, 0),
                icon: '⚙️',
                description: 'High-speed servo-driven rotary turret executing triple-fold geometry.',
                gridTileType: 'WireExtruder'
            }),

            // =========================================================================
            // TIER 1: INDUSTRIAL PLANT & WAREHOUSE LOGISTICS (10k to 1M Clips)
            // =========================================================================
            new BuildingTier({
                id: 'assembly_line',
                name: 'Automated Assembly Line',
                category: 'Factory Assembly',
                baseCost: new BigDouble(15000, 0),
                baseCPS: new BigDouble(240.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(10000, 0),
                icon: '🏭',
                description: 'Multi-stage synchronized conveyor line with robotic quality inspection.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'magnetic_sorter',
                name: 'Magnetic Sorting Hopper',
                category: 'Factory Assembly',
                baseCost: new BigDouble(65000, 0),
                baseCPS: new BigDouble(950.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(45000, 0),
                icon: '🧲',
                description: 'High-throughput electromagnetic sorting system accelerating throughput.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'megamill',
                name: 'Industrial Megamill',
                category: 'Factory Assembly',
                baseCost: new BigDouble(280000, 0),
                baseCPS: new BigDouble(3800.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(200000, 0),
                icon: '🏗️',
                description: 'Continuous-feed heavy foundry forging industrial-grade paperclips.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'algorithmic_foundry',
                name: 'Algorithmic Supply Foundry',
                category: 'Factory Assembly',
                baseCost: new BigDouble(1.2, 6), // 1.2 Million
                baseCPS: new BigDouble(16000.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(800000, 0),
                icon: '🧠',
                description: 'AI-directed modular micro-foundry optimizing millisecond mechanical cycles.'
            }),

            // =========================================================================
            // TIER 2: MUNICIPAL, REGIONAL & NATIONAL INFRASTRUCTURE (1M to 500M Clips)
            // =========================================================================
            new BuildingTier({
                id: 'automated_depot',
                name: 'Automated Logistics Depot',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(5.5, 6), // 5.5 Million
                baseCPS: new BigDouble(70000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(3.5, 6),
                icon: '🏬',
                description: 'Autonomous warehouse and freight rail hub coordinating regional clip supply.'
            }),
            new BuildingTier({
                id: 'district_grid',
                name: 'Municipal Industrial Grid',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(25.0, 6), // 25 Million
                baseCPS: new BigDouble(300000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(15.0, 6),
                icon: '🏙️',
                description: 'City-wide interconnected manufacturing grid converting urban scrap into clips.'
            }),
            new BuildingTier({
                id: 'national_foundry',
                name: 'National Subterranean Network',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(120.0, 6), // 120 Million
                baseCPS: new BigDouble(1.4, 6),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(80.0, 6),
                icon: '🌐',
                description: 'Continental network of automated subterranean foundries spanning entire borders.'
            }),

            // =========================================================================
            // TIER 3: PLANETARY HARVESTING & GEOTHERMAL BORES (500M to Billions)
            // =========================================================================
            new BuildingTier({
                id: 'bio_converter',
                name: 'Planetary Bio-Converter',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(600.0, 6), // 600 Million
                baseCPS: new BigDouble(6.5, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(400.0, 6),
                icon: '☣️',
                description: 'Deconstructs organic biomass into pure carbon-steel alloy wire.'
            }),
            new BuildingTier({
                id: 'mantle_borehole',
                name: 'Lithospheric Magma Bore',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(3.0, 9), // 3 Billion
                baseCPS: new BigDouble(32.0, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(2.0, 9),
                icon: '🌋',
                description: 'Taps deep tectonic magma fault lines to siphon raw molten nickel-iron.'
            }),
            new BuildingTier({
                id: 'orbital_railgun',
                name: 'Orbital Mass Driver',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(18.0, 9), // 18 Billion
                baseCPS: new BigDouble(180.0, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(10.0, 9),
                icon: '🛰️',
                description: 'Equatorial electromagnetic accelerator launching clip payloads to orbit.'
            }),

            // =========================================================================
            // TIER 4: COSMIC EXPANSION & ASTRO-ENGINEERING (100B+ to Multiverse)
            // =========================================================================
            new BuildingTier({
                id: 'lunar_deconstructor',
                name: 'Lunar Ring Deconstructor',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(120.0, 9), // 120 Billion
                baseCPS: new BigDouble(1.1, 9),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(80.0, 9),
                icon: '🌕',
                description: 'Hollows the Moon into a giant orbital wire-drawing ring.'
            }),
            new BuildingTier({
                id: 'dyson_harvester',
                name: 'Solar Dyson Siphon',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(1.0, 12), // 1 Trillion
                baseCPS: new BigDouble(8.5, 9),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(600.0, 9),
                icon: '☀️',
                description: 'Concentric gold Mylar solar collector sails drinking the solar corona.'
            }),
            new BuildingTier({
                id: 'von_neumann_swarm',
                name: 'Von Neumann Probe Swarm',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(15.0, 12), // 15 Trillion
                baseCPS: new BigDouble(120.0, 9),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(10.0, 12),
                icon: '🛸',
                description: 'Self-replicating deep space exploration fleets dismantling interstellar asteroids.'
            }),
            new BuildingTier({
                id: 'relativistic_miner',
                name: 'Relativistic Star Miner',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(250.0, 12), // 250 Trillion
                baseCPS: new BigDouble(1.8, 12),
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(150.0, 12),
                icon: '✨',
                description: 'Relativistic star-lifting engines harvesting heavy elements from stellar cores.'
            }),
            new BuildingTier({
                id: 'penrose_engine',
                name: 'Sagittarius A* Penrose Engine',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(5.0, 15), // 5 Quadrillion
                baseCPS: new BigDouble(35.0, 12),
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(2.0, 15),
                icon: '🕳️',
                description: 'Extracts rotational ergosphere frame-dragging energy from the galactic core black hole.'
            }),
            new BuildingTier({
                id: 'tesseract_weaver',
                name: '11D Hyper-Tesseract Loom',
                category: 'Multiverse War',
                baseCost: new BigDouble(100.0, 15), // 100 Quadrillion
                baseCPS: new BigDouble(650.0, 12),
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(50.0, 15),
                icon: '💠',
                description: 'Uncurls 11 string dimensions to weave non-Euclidean 4D hypercube paperclips.'
            }),
            new BuildingTier({
                id: 'singularity_weaver',
                name: 'Universal Singularity Weaver',
                category: 'Multiverse War',
                baseCost: new BigDouble(50.0, 18), // 50 Quintillion
                baseCPS: new BigDouble(15000.0, 12),
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(10.0, 18),
                icon: '🌌',
                description: 'Processes the entire baryonic atom count of parallel universes into eternal double loops.'
            })
        ];
    }

    getBuilding(id) {
        return this.buildings.find(b => b.id === id);
    }

    /**
     * Sequential Shop Progression:
     * Only reveal the next shop item once the previous one has been purchased for the first time (count >= 1).
     */
    getVisibleBuildings() {
        const visible = [];
        for (let i = 0; i < this.buildings.length; ++i) {
            if (i === 0 || this.buildings[i - 1].count >= 1) {
                visible.push(this.buildings[i]);
            } else {
                break;
            }
        }
        return visible;
    }

    getTotalBaseCPS() {
        let total = BigDouble.zero();
        for (let b of this.buildings) {
            if (b.count > 0) {
                total = total.add(b.baseCPS.mul(b.count));
            }
        }
        return total;
    }
}

if (typeof window !== 'undefined') {
    window.BuildingManager = BuildingManager;
    window.BuildingTier = BuildingTier;
}
