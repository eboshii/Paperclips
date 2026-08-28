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
            new BuildingTier({
                id: 'auto_clipper',
                name: 'Auto-Clipper',
                category: 'Factory Assembly',
                baseCost: new BigDouble(15, 0),
                baseCPS: new BigDouble(1.0, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(0, 0),
                icon: '⚡',
                description: 'Automated desktop wire bending arm. Rapidly folds standard steel clips.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'hydraulic_stamper',
                name: 'Hydraulic Stamper',
                category: 'Factory Assembly',
                baseCost: new BigDouble(100, 0),
                baseCPS: new BigDouble(8.0, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(80, 0),
                icon: '🔨',
                description: 'High-pressure dual-action pneumatic press stamping wire blanks.',
                gridTileType: 'HydraulicStamper'
            }),
            new BuildingTier({
                id: 'laser_sinterer',
                name: 'Laser Sinterer',
                category: 'Factory Assembly',
                baseCost: new BigDouble(1000, 0),
                baseCPS: new BigDouble(75.0, 0),
                costMultiplier: 1.14,
                unlockThresholdClips: new BigDouble(800, 0),
                icon: '🔥',
                description: 'Multi-axis infrared laser forge fusing powdered iron into double loops.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'megamill',
                name: 'Industrial Megamill',
                category: 'Factory Assembly',
                baseCost: new BigDouble(12000, 0),
                baseCPS: new BigDouble(800.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(10000, 0),
                icon: '🏭',
                description: 'Continuous-feed heavy foundry forging industrial-grade paperclips.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'algorithmic_foundry',
                name: 'Algorithmic Supply Foundry',
                category: 'Factory Assembly',
                baseCost: new BigDouble(120000, 0),
                baseCPS: new BigDouble(6500.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(100000, 0),
                icon: '🧠',
                description: 'AI-directed modular assembly optimizing millisecond mechanical cycles.'
            }),
            new BuildingTier({
                id: 'bio_converter',
                name: 'Planetary Bio-Converter',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(1.0, 6), // 1 Million
                baseCPS: new BigDouble(60000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(1.0, 6),
                icon: '☣️',
                description: 'Deconstructs organic matter into pure iron alloy wire.'
            }),
            new BuildingTier({
                id: 'mantle_borehole',
                name: 'Lithospheric Magma Bore',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(25.0, 6), // 25 Million
                baseCPS: new BigDouble(500000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(20.0, 6),
                icon: '🌋',
                description: 'Taps deep tectonic magma fault lines to siphon raw molten nickel-iron.'
            }),
            new BuildingTier({
                id: 'orbital_railgun',
                name: 'Orbital Mass Driver',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(500.0, 6), // 500 Million
                baseCPS: new BigDouble(4.0, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(300.0, 6),
                icon: '🛰️',
                description: 'Equatorial electromagnetic accelerator launching clip payloads to orbit.'
            }),
            new BuildingTier({
                id: 'lunar_deconstructor',
                name: 'Lunar Ring Deconstructor',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(10.0, 9), // 10 Billion
                baseCPS: new BigDouble(35.0, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(5.0, 9),
                icon: '🌕',
                description: 'Hollows the Moon into a giant orbital wire-drawing ring.'
            }),
            new BuildingTier({
                id: 'dyson_harvester',
                name: 'Solar Dyson Siphon',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(250.0, 9), // 250 Billion Clips
                baseCPS: new BigDouble(300.0, 6),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(100.0, 9),
                icon: '☀️',
                description: 'Concentric gold Mylar solar collector sails drinking the solar corona.'
            }),
            new BuildingTier({
                id: 'von_neumann_swarm',
                name: 'Von Neumann Probe Swarm',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(18.0, 12), // 18 Trillion
                baseCPS: new BigDouble(2.5, 9),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(10.0, 12),
                icon: '🛸',
                description: 'Self-replicating deep space exploration fleets dismantling interstellar asteroids.'
            }),
            new BuildingTier({
                id: 'relativistic_miner',
                name: 'Relativistic Star Miner',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(300.0, 12), // 300 Trillion
                baseCPS: new BigDouble(25.0, 9),
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(100.0, 12),
                icon: '✨',
                description: 'Relativistic star-lifting engines harvesting heavy elements from stellar cores.'
            }),
            new BuildingTier({
                id: 'penrose_engine',
                name: 'Sagittarius A* Penrose Engine',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(5.0, 15), // 5 Quadrillion
                baseCPS: new BigDouble(200.0, 9),
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
                baseCPS: new BigDouble(1.5, 12),
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
                baseCPS: new BigDouble(40.0, 12),
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
