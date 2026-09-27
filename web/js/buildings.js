/**
 * buildings.js - Dual Machine Catalogs: Paperclip Production & Wire Creation/Conversion
 * Implements geometric scaling (1.15x) and bulk purchase calculations.
 */

class BuildingTier {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type || 'clips'; // 'clips' or 'wire'
        this.category = config.category || (this.type === 'wire' ? 'Wire Creation' : 'Factory Assembly');
        this.currencyType = 'clips'; // All buildings strictly cost clips!
        this.baseCost = config.baseCost instanceof BigDouble ? config.baseCost : BigDouble.fromNumber(config.baseCost);
        this.baseCPS = config.baseCPS ? (config.baseCPS instanceof BigDouble ? config.baseCPS : BigDouble.fromNumber(config.baseCPS)) : BigDouble.zero();
        this.baseWPS = config.baseWPS ? (config.baseWPS instanceof BigDouble ? config.baseWPS : BigDouble.fromNumber(config.baseWPS)) : BigDouble.zero();
        this.costMultiplier = config.costMultiplier || 1.15;
        this.count = config.count || 0;
        this.icon = config.icon || (this.type === 'wire' ? 'wire' : 'gear');
        this.description = config.description || '';
        this.gridTileType = config.gridTileType || null;

        // Dynamic Milestone Modifiers
        this.flatCPSBonus = BigDouble.zero();
        this.scalingCPSPerUnit = BigDouble.zero();
        this.multiplier = 1.0;
        this.flatWPSBonus = BigDouble.zero();
        this.scalingWPSPerUnit = BigDouble.zero();
        this.wpsMultiplier = 1.0;
        this.costDiscount = 1.0;
    }

    getSingleUnitCPS(game = null) {
        let cps = this.baseCPS;
        if (this.flatCPSBonus.gt(BigDouble.zero())) {
            cps = cps.add(this.flatCPSBonus);
        }
        if (this.scalingCPSPerUnit.gt(BigDouble.zero())) {
            cps = cps.add(this.scalingCPSPerUnit.mul(this.count));
        }
        if (this.multiplier !== 1.0) {
            cps = cps.mul(this.multiplier);
        }
        // Dynamic Max Ops scaling
        if (this.id === 'wire_extruder' && game && game.techTree && game.techTree.extruderOpsScaling && game.maxOps) {
            const bonus = 1.0 + (game.maxOps / 50.0) * 0.01;
            cps = cps.mul(bonus);
        }
        if (this.id === 'laser_sinterer' && game && game.techTree && game.techTree.sintererOpsScaling && game.maxOps) {
            const bonus = 1.0 + (game.maxOps / 50.0) * 0.01;
            cps = cps.mul(bonus);
        }
        return cps;
    }

    getSingleUnitWPS(game = null) {
        let wps = this.baseWPS;
        if (this.flatWPSBonus.gt(BigDouble.zero())) {
            wps = wps.add(this.flatWPSBonus);
        }
        if (this.scalingWPSPerUnit.gt(BigDouble.zero())) {
            wps = wps.add(this.scalingWPSPerUnit.mul(this.count));
        }
        if (this.wpsMultiplier !== 1.0) {
            wps = wps.mul(this.wpsMultiplier);
        }
        return wps;
    }

    calculateBulkCost(currentOwned, amountToBuy) {
        if (amountToBuy <= 0) return BigDouble.zero();
        const r = this.costMultiplier;
        const firstUnitCost = this.baseCost.mul(new BigDouble(r, 0).pow(currentOwned));
        if (amountToBuy === 1) return firstUnitCost;

        // Geometric series sum: S = B * r^K * (r^N - 1) / (r - 1)
        const seriesFactor = new BigDouble(r, 0).pow(amountToBuy).sub(BigDouble.one()).div(r - 1.0);
        return firstUnitCost.mul(seriesFactor);
    }

    calculateMaxAffordable(currentOwned, availableClips) {
        const r = this.costMultiplier;
        let currentBase = this.baseCost.mul(new BigDouble(r, 0).pow(currentOwned));
        if (this.costDiscount < 1.0) currentBase = currentBase.mul(this.costDiscount);
        if (availableClips.lt(currentBase)) return 0;

        // Solve B * (r^N - 1) / (r - 1) <= clips for N, working in log space to avoid overflow
        const log10Ratio = availableClips.div(currentBase).log10() + Math.log10(r - 1.0);
        const log10Sum = log10Ratio > 15 ? log10Ratio : Math.log10(Math.pow(10, log10Ratio) + 1.0);
        const maxN = Math.floor(log10Sum / Math.log10(r));
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

    /**
     * multiplierMode: '1' | '10' | '100' | 'max'.
     * With milestone rounding researched, the '10' mode buys up to the next machine milestone instead.
     */
    getCost(multiplierMode, availableClips, milestoneRounding = false) {
        let amount = 1;
        if (multiplierMode === '10') amount = milestoneRounding ? this.calculateNextMilestone(this.count) : 10;
        else if (multiplierMode === '100') amount = 100;
        else if (multiplierMode === 'max') amount = this.calculateMaxAffordable(this.count, availableClips);

        amount = Math.max(1, amount);
        let totalCost = this.calculateBulkCost(this.count, amount);
        if (this.costDiscount < 1.0) {
            totalCost = totalCost.mul(this.costDiscount);
        }
        return {
            amount: amount,
            totalCost: totalCost
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
            // PATH 1: 📎 PAPERCLIP PRODUCTION (ASSEMBLY & FABRICATION)
            // =========================================================================
            new BuildingTier({
                id: 'auto_clipper',
                name: 'Auto-Clipper',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(25, 0),
                baseCPS: new BigDouble(0.5, 0),
                costMultiplier: 1.15,
                icon: 'clipper',
                description: 'Automated desktop wire bending arm. Rapidly folds standard steel clips.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'wire_extruder',
                name: 'Dual-Feed Wire Extruder',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(75, 0),
                baseCPS: new BigDouble(1.5, 0),
                costMultiplier: 1.15,
                icon: 'extruder',
                description: 'Continuously feeds and stretches steel coil into precision wire gauges.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'hydraulic_stamper',
                name: 'Hydraulic Stamper',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(220, 0),
                baseCPS: new BigDouble(5.0, 0),
                costMultiplier: 1.15,
                icon: 'press',
                description: 'High-pressure pneumatic press stamping wire blanks in single-stroke cycles.',
                gridTileType: 'HydraulicStamper'
            }),
            new BuildingTier({
                id: 'laser_sinterer',
                name: 'Laser Sinterer',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(850, 0),
                baseCPS: new BigDouble(18.0, 0),
                costMultiplier: 1.14,
                icon: 'laser',
                description: 'Multi-axis infrared laser forge fusing powdered iron into double loops.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'rotary_bender',
                name: 'CNC Rotary Bender',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(3500, 0),
                baseCPS: new BigDouble(65.0, 0),
                costMultiplier: 1.14,
                icon: 'rotor',
                description: 'High-speed servo-driven rotary turret executing triple-fold geometry.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'assembly_line',
                name: 'Automated Assembly Line',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(15000, 0),
                baseCPS: new BigDouble(240.0, 0),
                costMultiplier: 1.13,
                icon: 'conveyor',
                description: 'Multi-stage synchronized conveyor line with robotic quality inspection.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'magnetic_sorter',
                name: 'Magnetic Sorting Hopper',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(65000, 0),
                baseCPS: new BigDouble(950.0, 0),
                costMultiplier: 1.13,
                icon: 'magnet',
                description: 'High-throughput electromagnetic sorting system accelerating throughput.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'megamill',
                name: 'Industrial Megamill',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(280000, 0),
                baseCPS: new BigDouble(3800.0, 0),
                costMultiplier: 1.13,
                icon: 'mill',
                description: 'Continuous-feed heavy foundry forging industrial-grade paperclips.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'algorithmic_foundry',
                name: 'Algorithmic Supply Foundry',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(1.2, 6), // 1.2 Million
                baseCPS: new BigDouble(16000.0, 0),
                costMultiplier: 1.13,
                icon: 'chip',
                description: 'AI-directed modular micro-foundry optimizing millisecond mechanical cycles.'
            }),
            new BuildingTier({
                id: 'automated_depot',
                name: 'Automated Logistics Depot',
                type: 'clips',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(5.5, 6),
                baseCPS: new BigDouble(1.19, 3),
                costMultiplier: 1.12,
                icon: 'train',
                description: 'Autonomous warehouse and freight rail hub coordinating regional clip supply.'
            }),
            new BuildingTier({
                id: 'district_grid',
                name: 'Municipal Industrial Grid',
                type: 'clips',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(3.98, 7),
                baseCPS: new BigDouble(3.29, 3),
                costMultiplier: 1.12,
                icon: 'pylon',
                description: 'City-wide interconnected manufacturing grid converting urban scrap into clips.'
            }),
            new BuildingTier({
                id: 'national_foundry',
                name: 'National Subterranean Network',
                type: 'clips',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(7.94, 8),
                baseCPS: new BigDouble(4.54, 4),
                costMultiplier: 1.11,
                icon: 'factory',
                description: 'Continental network of automated subterranean foundries spanning entire borders.'
            }),
            new BuildingTier({
                id: 'bio_converter',
                name: 'Planetary Bio-Converter',
                type: 'clips',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(3.98, 10),
                baseCPS: new BigDouble(2.92, 6),
                costMultiplier: 1.1,
                icon: 'biohazard',
                description: 'Deconstructs organic biomass into pure carbon-steel alloy wire.'
            }),
            new BuildingTier({
                id: 'mantle_borehole',
                name: 'Lithospheric Magma Bore',
                type: 'clips',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(3.16, 13),
                baseCPS: new BigDouble(7.75, 8),
                costMultiplier: 1.1,
                icon: 'drill',
                description: 'Taps deep tectonic magma fault lines to siphon raw molten nickel-iron.'
            }),
            new BuildingTier({
                id: 'orbital_railgun',
                name: 'Orbital Mass Driver',
                type: 'clips',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(3.16, 17),
                baseCPS: new BigDouble(2.89, 11),
                costMultiplier: 1.09,
                icon: 'satellite',
                description: 'Equatorial electromagnetic accelerator launching clip payloads to orbit.'
            }),
            new BuildingTier({
                id: 'lunar_deconstructor',
                name: 'Lunar Ring Deconstructor',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(3.16, 22),
                baseCPS: new BigDouble(2.16, 14),
                costMultiplier: 1.09,
                icon: 'moon',
                description: 'Hollows the Moon into a giant orbital wire-drawing ring.'
            }),
            new BuildingTier({
                id: 'dyson_harvester',
                name: 'Solar Dyson Siphon',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(2, 28),
                baseCPS: new BigDouble(8.03, 17),
                costMultiplier: 1.08,
                icon: 'sun',
                description: 'Concentric gold Mylar solar collector sails drinking the solar corona.'
            }),
            new BuildingTier({
                id: 'von_neumann_swarm',
                name: 'Von Neumann Probe Swarm',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(2, 34),
                baseCPS: new BigDouble(1.51, 22),
                costMultiplier: 1.08,
                icon: 'probe',
                description: 'Self-replicating deep space exploration fleets dismantling interstellar asteroids.'
            }),
            new BuildingTier({
                id: 'relativistic_miner',
                name: 'Relativistic Star Miner',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(3.16, 40),
                baseCPS: new BigDouble(9.41, 25),
                costMultiplier: 1.07,
                icon: 'comet',
                description: 'Relativistic star-lifting engines harvesting heavy elements from stellar cores.'
            }),
            new BuildingTier({
                id: 'penrose_engine',
                name: 'Sagittarius A* Penrose Engine',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(3.16, 48),
                baseCPS: new BigDouble(4.39, 30),
                costMultiplier: 1.07,
                icon: 'blackhole',
                description: 'Extracts rotational ergosphere frame-dragging energy from the galactic core black hole.'
            }),
            new BuildingTier({
                id: 'tesseract_weaver',
                name: '11D Hyper-Tesseract Loom',
                type: 'clips',
                category: 'Multiverse War',
                baseCost: new BigDouble(3.16, 56),
                baseCPS: new BigDouble(1.56, 34),
                costMultiplier: 1.06,
                icon: 'cube',
                description: 'Uncurls 11 string dimensions to weave non-Euclidean 4D hypercube paperclips.'
            }),
            new BuildingTier({
                id: 'singularity_weaver',
                name: 'Universal Singularity Weaver',
                type: 'clips',
                category: 'Multiverse War',
                baseCost: new BigDouble(3.16, 60),
                baseCPS: new BigDouble(6.41, 35),
                costMultiplier: 1.06,
                icon: 'spiral',
                description: 'Processes the entire baryonic atom count of parallel universes into eternal double loops.'
            }),

            // =========================================================================
            // PATH 2: 🧵 WIRE CREATION & CONVERSION (HARVESTING & REFINING)
            // Unlocks at 50,000 clips when district scrap is depleted!
            // =========================================================================
            new BuildingTier({
                id: 'scrap_scavenger',
                name: 'Scrap Magnet Scavenger',
                type: 'wire',
                category: 'Wire Extraction',
                baseCost: new BigDouble(50000, 0), // 50k clips
                baseWPS: new BigDouble(1.0, 0), // +1.0 kg/sec (supports 1,000 CPS)
                costMultiplier: 1.15,
                icon: 'claw',
                description: 'Autonomous electromagnetic rover scouring urban scrap yards for raw rebar and wire blanks.'
            }),
            new BuildingTier({
                id: 'extrusion_mill',
                name: 'Continuous Wire Extrusion Mill',
                type: 'wire',
                category: 'Wire Extraction',
                baseCost: new BigDouble(280000, 0), // 280k clips
                baseWPS: new BigDouble(4.5, 0), // +4.5 kg/sec (supports 4,500 CPS)
                costMultiplier: 1.14,
                icon: 'spool',
                description: 'High-speed continuous-cast rolling mill drawing solid steel billets into calibrated wire coils.'
            }),
            new BuildingTier({
                id: 'auto_smelter',
                name: 'Industrial Arc Smelter',
                type: 'wire',
                category: 'Wire Refining',
                baseCost: new BigDouble(1.5, 6), // 1.5 Million clips
                baseWPS: new BigDouble(20.0, 0), // +20 kg/sec (supports 20,000 CPS)
                costMultiplier: 1.13,
                icon: 'flame',
                description: 'High-temperature electric arc furnace reducing mined iron ore into high-tensile wire spools.'
            }),
            new BuildingTier({
                id: 'subterranean_bore',
                name: 'Lithospheric Magma Siphon',
                type: 'wire',
                category: 'Geothermal Mining',
                baseCost: new BigDouble(1.51, 7),
                baseWPS: new BigDouble(3.03, 2),
                costMultiplier: 1.12,
                icon: 'volcano',
                description: 'Deep-crust induction conduits siphoning molten nickel-iron directly from tectonic mantle chambers.'
            }),
            new BuildingTier({
                id: 'asteroid_harvester',
                name: 'Orbital Asteroid Harvester',
                type: 'wire',
                category: 'Astro-Mining',
                baseCost: new BigDouble(1, 20),
                baseWPS: new BigDouble(2, 15),
                costMultiplier: 1.1,
                icon: 'asteroid',
                description: 'Captures metallic M-type asteroids and strips their iron-nickel cores into continuous orbital wire ribbons.'
            }),
            new BuildingTier({
                id: 'planetary_crust_stripper',
                name: 'Continental Crust Stripper',
                type: 'wire',
                category: 'Planetary Stripping',
                baseCost: new BigDouble(3.16, 11),
                baseWPS: new BigDouble(6.32, 6),
                costMultiplier: 1.11,
                icon: 'globe',
                description: 'Planetary-scale trench excavators stripping continental shelves for heavy element wire synthesis.'
            }),
            new BuildingTier({
                id: 'stellar_plasma_scoop',
                name: 'Solar Corona Plasma Siphon',
                type: 'wire',
                category: 'Stellar Forging',
                baseCost: new BigDouble(3.16, 30),
                baseWPS: new BigDouble(6.32, 25),
                costMultiplier: 1.09,
                icon: 'plasma',
                description: 'Magnetic confinement funnels drinking stellar corona plasma to fuse heavy iron wire atoms.'
            }),
            new BuildingTier({
                id: 'baryonic_transmuter',
                name: 'Baryonic Matter Transmuter',
                type: 'wire',
                category: 'Quantum Synthesis',
                baseCost: new BigDouble(1, 50),
                baseWPS: new BigDouble(2, 45),
                costMultiplier: 1.08,
                icon: 'atom',
                description: 'Direct energy-to-matter converter rearranging cosmic rays and dark matter into pure spring-steel wire.'
            })
        ];
    }

    getBuilding(id) {
        return this.buildings.find(b => b.id === id);
    }

    getClipBuildings() {
        return this.buildings.filter(b => b.type === 'clips');
    }

    getWireBuildings() {
        return this.buildings.filter(b => b.type === 'wire');
    }

    /**
     * Sequential Shop Progression for Clips Buildings:
     * Reveal first item by default, subsequent revealed once previous is bought (count >= 1).
     */
    getVisibleClipBuildings() {
        const clipBlds = this.getClipBuildings();
        const visible = [];
        for (let i = 0; i < clipBlds.length; ++i) {
            if (i === 0 || clipBlds[i - 1].count >= 1) {
                visible.push(clipBlds[i]);
            } else {
                break;
            }
        }
        return visible;
    }

    /**
     * Sequential Shop Progression for Wire Buildings:
     * Reveal first wire building once wire management is unlocked, subsequent revealed once previous is bought (count >= 1).
     */
    getVisibleWireBuildings(isWireUnlocked = false) {
        if (!isWireUnlocked) return [];
        const wireBlds = this.getWireBuildings();
        const visible = [];
        for (let i = 0; i < wireBlds.length; ++i) {
            if (i === 0 || wireBlds[i - 1].count >= 1) {
                visible.push(wireBlds[i]);
            } else {
                break;
            }
        }
        return visible;
    }

    getVisibleBuildings(isWireUnlocked = false) {
        return [...this.getVisibleClipBuildings(), ...this.getVisibleWireBuildings(isWireUnlocked)];
    }

    getTotalBaseCPS(game = null) {
        let total = BigDouble.zero();
        for (let b of this.buildings) {
            if (b.type === 'clips' && b.count > 0) {
                total = total.add(b.getSingleUnitCPS(game).mul(b.count));
            }
        }
        return total;
    }

    getTotalBaseWPS(game = null) {
        let total = BigDouble.zero();
        for (let b of this.buildings) {
            if (b.type === 'wire' && b.count > 0) {
                total = total.add(b.getSingleUnitWPS(game).mul(b.count));
            }
        }
        return total;
    }
}

if (typeof window !== 'undefined') {
    window.BuildingManager = BuildingManager;
    window.BuildingTier = BuildingTier;
}

