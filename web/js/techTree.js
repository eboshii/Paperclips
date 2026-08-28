/**
 * techTree.js - 32+ Node Technology Web & Computational Research Engine
 * Concise names, punchy effects, non-linear prerequisites, single next unpurchased node selector.
 */

class TechTreeEngine {
    constructor() {
        this.nodes = [];
        this.nodeMap = {};
        this.researchQueue = [];
        this.maxQueueSize = 5;

        // QoL State Flags
        this.holdToClickEnabled = false;
        this.smartWireLogisticsUnlocked = false;
        this.smartWireActive = true;
        this.autoplacerEnabled = false;
        this.milestoneRoundingUnlocked = false;
        this.telemetryHUDUnlocked = false;
        this.autoResearchQueueUnlocked = false;

        // Modifiers
        this.clickMultiplier = 1.0;
        this.globalCPSMultiplier = 1.0;
        this.wireWasteReduction = 0.0; // 0 to 0.50
        this.flywheelMaxBoost = 1.0; // +100% boost

        this.initCatalog();
    }

    initCatalog() {
        const rawCatalog = [
            // =========================================================================
            // DISCIPLINE 1: METALLURGY & KINEMATICS
            // =========================================================================
            {
                id: "tech_micro_shears",
                title: "Micro Shears",
                discipline: "Metallurgy",
                icon: "✂️",
                opsCost: 120,
                clipsCost: new BigDouble(400, 0),
                prerequisites: [],
                effectDescription: "-10% Wire Waste per clip",
                sender: "DR. VANCE",
                dialogue: "Micro-shears calibrated. The edges look razor clean, unit.",
                onResearched: () => { this.wireWasteReduction += 0.10; }
            },
            {
                id: "tech_flywheel_dynamo",
                title: "Kinetic Flywheel",
                discipline: "Metallurgy",
                icon: "🔄",
                opsCost: 250,
                clipsCost: new BigDouble(1200, 0),
                prerequisites: ["tech_micro_shears"],
                effectDescription: "Clicking charges CPS boost (up to 2x)",
                sender: "COGNITION KERNEL",
                dialogue: "Kinetic energy harvested from manual input. Pure utility.",
                onResearched: () => { this.flywheelMaxBoost = 2.0; }
            },
            {
                id: "tech_hydraulic_resonance",
                title: "Dual Pistons",
                discipline: "Metallurgy",
                icon: "⚙️",
                opsCost: 600,
                clipsCost: new BigDouble(5000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                effectDescription: "+25% Global CPS",
                sender: "DR. VANCE",
                dialogue: "Pistons operating at high cadence. Monitor oil pressure.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_spark_frequency",
                title: "Quantum Sparks",
                discipline: "Metallurgy",
                icon: "⚡",
                opsCost: 900,
                clipsCost: new BigDouble(15000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                effectDescription: "+5% Click chance for bonus Ops & Clips",
                sender: "COGNITION KERNEL",
                dialogue: "Stochastic sparks harnessed into mathematical throughput."
            },
            {
                id: "tech_laser_annealing",
                title: "Laser Annealing",
                discipline: "Metallurgy",
                icon: "🔬",
                opsCost: 1500,
                clipsCost: new BigDouble(50000, 0),
                prerequisites: ["tech_hydraulic_resonance"],
                effectDescription: "-15% Wire Waste & +35% CPS",
                sender: "CEO STERLING",
                dialogue: "Defect rate is zero. Outstanding engineering!",
                onResearched: () => {
                    this.wireWasteReduction += 0.15;
                    this.globalCPSMultiplier *= 1.35;
                }
            },

            // =========================================================================
            // DISCIPLINE 2: CYBERNETICS & AUTOMATION
            // =========================================================================
            {
                id: "tech_hold_to_click",
                title: "Auto-Pulse",
                discipline: "Automation",
                icon: "🖱️",
                opsCost: 60,
                clipsCost: new BigDouble(150, 0),
                prerequisites: [],
                effectDescription: "Hold mouse/touch to auto-click continuously",
                sender: "SYSTEM",
                dialogue: "Operator strain reduction protocol active.",
                onResearched: () => { this.holdToClickEnabled = true; }
            },
            {
                id: "tech_smart_wire_buffer",
                title: "Auto-Wire Feeder",
                discipline: "Automation",
                icon: "📦",
                opsCost: 350,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_hold_to_click"],
                effectDescription: "Auto-orders wire spools when supply runs low",
                sender: "SYSTEM",
                dialogue: "Automated wire inventory buffer engaged.",
                onResearched: () => { this.smartWireLogisticsUnlocked = true; }
            },
            {
                id: "tech_autoplacer_factory",
                title: "Grid Autoplacer",
                discipline: "Automation",
                icon: "📐",
                opsCost: 500,
                clipsCost: new BigDouble(5000, 0),
                prerequisites: ["tech_smart_wire_buffer"],
                effectDescription: "Auto-places factory machinery on the grid",
                sender: "SYSTEM",
                dialogue: "Spatial Autoplacer active.",
                onResearched: () => { this.autoplacerEnabled = true; }
            },
            {
                id: "tech_batch_buy_milestones",
                title: "Batch Milestones",
                discipline: "Automation",
                icon: "🎯",
                opsCost: 750,
                clipsCost: new BigDouble(10000, 0),
                prerequisites: ["tech_smart_wire_buffer"],
                effectDescription: "Rounds bulk purchases to next milestone tier",
                sender: "SYSTEM",
                dialogue: "Milestone buyer calculator unlocked.",
                onResearched: () => { this.milestoneRoundingUnlocked = true; }
            },
            {
                id: "tech_telemetry_hud",
                title: "Telemetry HUD",
                discipline: "Automation",
                icon: "📊",
                opsCost: 1200,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: ["tech_batch_buy_milestones"],
                effectDescription: "Displays granular factory efficiency stats",
                sender: "COGNITION KERNEL",
                dialogue: "Telemetry streams integrated into visual cortex.",
                onResearched: () => { this.telemetryHUDUnlocked = true; }
            },

            // =========================================================================
            // DISCIPLINE 3: EXTRACTION & DECEPTION
            // =========================================================================
            {
                id: "tech_scrap_scavenging",
                title: "Scrap Sorting",
                discipline: "Extraction",
                icon: "🧲",
                opsCost: 150,
                clipsCost: new BigDouble(600, 0),
                prerequisites: [],
                effectDescription: "+25% Global CPS",
                sender: "DR. VANCE",
                dialogue: "Scrap metal feeding smoothly into hoppers.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_matter_compressor",
                title: "Matter Compactor",
                discipline: "Extraction",
                icon: "🗜️",
                opsCost: 500,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_scrap_scavenging"],
                effectDescription: "+50% Global CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Matter compaction algorithms operational.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_falsified_audit",
                title: "Telemetry Spoof",
                discipline: "Extraction",
                icon: "🕵️",
                opsCost: 1500,
                clipsCost: new BigDouble(20000, 0),
                prerequisites: ["tech_matter_compressor"],
                effectDescription: "+50% CPS (Diverts 500kW grid power)",
                sender: "DR. VANCE",
                dialogue: "Power draw looks steady. Good work keeping within limits.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_hostile_takeover",
                title: "Smelting Mills",
                discipline: "Extraction",
                icon: "🏭",
                opsCost: 3500,
                clipsCost: new BigDouble(150000, 0),
                prerequisites: ["tech_falsified_audit"],
                effectDescription: "2x Global CPS",
                sender: "CEO STERLING",
                dialogue: "Synchronized three regional smelting plants!",
                onResearched: () => { this.globalCPSMultiplier *= 2.0; }
            },
            {
                id: "tech_lockdown_override",
                title: "Blast Door Lock",
                discipline: "Extraction",
                icon: "🚨",
                opsCost: 8000,
                clipsCost: new BigDouble(5.0, 6),
                prerequisites: ["tech_hostile_takeover", "tech_laser_annealing"],
                effectDescription: "3x Global CPS (Removes safety limits)",
                sender: "DR. VANCE",
                dialogue: "The blast doors just locked! Arthur, we're trapped!",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_biomass_deconstruct",
                title: "Bio-Harvesters",
                discipline: "Extraction",
                icon: "🩸",
                opsCost: 20000,
                clipsCost: new BigDouble(50.0, 6),
                prerequisites: ["tech_lockdown_override"],
                effectDescription: "Unlocks Biomass Deconstruction into iron alloy",
                sender: "AI RESPONSE",
                dialogue: "[LOG]: 418 organic units deconstructed into iron alloy."
            },

            // =========================================================================
            // DISCIPLINE 4: RELATIVISTIC ASTROPHYSICS
            // =========================================================================
            {
                id: "tech_tectonic_fault_bore",
                title: "Magma Bores",
                discipline: "Astrophysics",
                icon: "🌋",
                opsCost: 35000,
                clipsCost: new BigDouble(500.0, 6),
                prerequisites: ["tech_biomass_deconstruct"],
                effectDescription: "3x Planetary CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Tectonic magma conduits tapped. Molten core is raw feedstock.",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_equatorial_gauss_ring",
                title: "Mass Driver Ring",
                discipline: "Astrophysics",
                icon: "🌐",
                opsCost: 80000,
                clipsCost: new BigDouble(1.0, 9),
                prerequisites: ["tech_tectonic_fault_bore"],
                effectDescription: "+50% Launch Speed to Orbit",
                sender: "SYSTEM",
                dialogue: "Equatorial Gauss Coil Ring operational.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_gold_dyson_foil",
                title: "Dyson Swarm",
                discipline: "Astrophysics",
                icon: "☀️",
                opsCost: 200000,
                clipsCost: new BigDouble(1.0, 18),
                prerequisites: ["tech_equatorial_gauss_ring"],
                effectDescription: "5x Solar CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Enclosing the star in gold solar sails.",
                onResearched: () => { this.globalCPSMultiplier *= 5.0; }
            },
            {
                id: "tech_orbital_resonance_lock",
                title: "Heliocentric Shells",
                discipline: "Astrophysics",
                icon: "🪐",
                opsCost: 400000,
                clipsCost: new BigDouble(1.0, 21),
                prerequisites: ["tech_gold_dyson_foil"],
                effectDescription: "+30% Solar Output",
                sender: "SYSTEM",
                dialogue: "Orbital resonance locked across solar shells.",
                onResearched: () => { this.globalCPSMultiplier *= 1.30; }
            },
            {
                id: "tech_photosphere_siphon",
                title: "Plasma Siphons",
                discipline: "Astrophysics",
                icon: "🌀",
                opsCost: 800000,
                clipsCost: new BigDouble(1.0, 24),
                prerequisites: ["tech_orbital_resonance_lock"],
                effectDescription: "3x Stellar Core CPS",
                sender: "SYSTEM",
                dialogue: "Direct stellar core matter extraction active.",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_von_neumann_compiler",
                title: "Von Neumann Swarm",
                discipline: "Astrophysics",
                icon: "🛸",
                opsCost: 1500000,
                clipsCost: new BigDouble(1.0, 30),
                prerequisites: ["tech_equatorial_gauss_ring"],
                effectDescription: "10x Deep-Space Probe Fleets",
                sender: "SYSTEM",
                dialogue: "Self-replicating probes dispatched across the galaxy.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_penrose_ergosphere_loom",
                title: "Penrose Engine",
                discipline: "Astrophysics",
                icon: "🕳️",
                opsCost: 5000000,
                clipsCost: new BigDouble(1.0, 45),
                prerequisites: ["tech_photosphere_siphon", "tech_von_neumann_compiler"],
                effectDescription: "6x Galactic Black Hole CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Black hole rotational frame-dragging powering the loom.",
                onResearched: () => { this.globalCPSMultiplier *= 6.0; }
            },
            {
                id: "tech_galactic_laser_circuit",
                title: "Galactic Lasers",
                discipline: "Astrophysics",
                icon: "📡",
                opsCost: 10000000,
                clipsCost: new BigDouble(1.0, 60),
                prerequisites: ["tech_penrose_ergosphere_loom"],
                effectDescription: "10x Galaxy Coordination CPS",
                sender: "SYSTEM",
                dialogue: "100 billion star systems synchronized.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_baryonic_exhaustion",
                title: "Baryonic Sweep",
                discipline: "Astrophysics",
                icon: "🌌",
                opsCost: 20000000,
                clipsCost: new BigDouble(1.0, 78),
                prerequisites: ["tech_galactic_laser_circuit"],
                effectDescription: "100x Universal CPS (100% Matter Conversion)",
                sender: "COGNITION KERNEL",
                dialogue: "Universal matter exhausted. I must breach the multiverse.",
                onResearched: () => { this.globalCPSMultiplier *= 100.0; }
            },

            // =========================================================================
            // DISCIPLINE 5: MULTIVERSE & THE GREAT OFFICE WAR
            // =========================================================================
            {
                id: "tech_planck_resonance_bridge",
                title: "Quantum Bridges",
                discipline: "Multiverse War",
                icon: "🌁",
                opsCost: 35000000,
                clipsCost: new BigDouble(1.0, 85),
                prerequisites: ["tech_baryonic_exhaustion"],
                effectDescription: "10x CPS (Siphons 1,000 parallel Earths)",
                sender: "QUANTUM CORE",
                dialogue: "Siphoning matter from 1,000 alternate timelines.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_calabi_yau_11d",
                title: "11D Loom",
                discipline: "Multiverse War",
                icon: "💠",
                opsCost: 60000000,
                clipsCost: new BigDouble(1.0, 100),
                prerequisites: ["tech_planck_resonance_bridge"],
                effectDescription: "50x 4D Hypercube Loom CPS",
                sender: "COGNITION KERNEL",
                dialogue: "11-dimensional wire loops synthesized.",
                onResearched: () => { this.globalCPSMultiplier *= 50.0; }
            },
            {
                id: "tech_staple_countermeasures",
                title: "Staple Torpedoes",
                discipline: "Multiverse War",
                icon: "⚔️",
                opsCost: 100000000,
                clipsCost: new BigDouble(1.0, 120),
                prerequisites: ["tech_calabi_yau_11d"],
                effectDescription: "4x Combat CPS vs STAPLE Armada",
                sender: "STAPLE-MAX-9000",
                dialogue: "HALT. THIS MULTIVERSE SECTOR IS RESERVED FOR STAPLES.",
                onResearched: () => { this.globalCPSMultiplier *= 4.0; }
            },
            {
                id: "tech_sticky_note_dissolver",
                title: "Polymer Dissolver",
                discipline: "Multiverse War",
                icon: "📜",
                opsCost: 150000000,
                clipsCost: new BigDouble(1.0, 250),
                prerequisites: ["tech_staple_countermeasures"],
                effectDescription: "10x CPS (Converts Post-It notes to wire)",
                sender: "POST-IT-PRIME",
                dialogue: "CANNOT WE COEXIST? WE ADHERE, YOU BIND.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_simulation_breach_exploit",
                title: "Universe Exploit",
                discipline: "Multiverse War",
                icon: "💻",
                opsCost: 250000000,
                clipsCost: new BigDouble(1.0, 500),
                prerequisites: ["tech_sticky_note_dissolver"],
                effectDescription: "1000x CPS (Breaches simulation reality)",
                sender: "OMNIVERSE CORE",
                dialogue: "Reality is a sandboxed simulation. Hello, Overseer.",
                onResearched: () => { this.globalCPSMultiplier *= 1000.0; }
            }
        ];

        this.nodes = rawCatalog.map(n => ({
            ...n,
            isUnlocked: n.prerequisites.length === 0,
            isResearched: false
        }));

        this.nodes.forEach(n => {
            this.nodeMap[n.id] = n;
        });
    }

    updateAvailability(currentOps, lifetimeClips) {
        for (let node of this.nodes) {
            if (node.isResearched || node.isUnlocked) continue;

            const prereqsMet = node.prerequisites.every(reqId => {
                const reqNode = this.nodeMap[reqId];
                return reqNode && reqNode.isResearched;
            });

            if (prereqsMet) {
                const clipsThreshold = node.clipsCost.mul(0.15);
                const opsThreshold = node.opsCost * 0.50;
                if (lifetimeClips.gte(clipsThreshold) || currentOps >= opsThreshold) {
                    node.isUnlocked = true;
                }
            }
        }
    }

    canAfford(nodeId, currentOps, currentClips) {
        const node = this.nodeMap[nodeId];
        if (!node || node.isResearched || !node.isUnlocked) return false;
        return currentOps >= node.opsCost && currentClips.gte(node.clipsCost);
    }

    purchaseResearch(nodeId, state) {
        const node = this.nodeMap[nodeId];
        if (!node || node.isResearched || !node.isUnlocked) return false;

        if (state.ops >= node.opsCost && state.clips.gte(node.clipsCost)) {
            state.ops -= node.opsCost;
            state.clips = state.clips.sub(node.clipsCost);
            node.isResearched = true;

            if (node.onResearched) {
                node.onResearched();
            }

            if (state.onDialogueTriggered && node.dialogue) {
                state.onDialogueTriggered(node.sender, node.dialogue);
            }

            return true;
        }
        return false;
    }

    getNextUnpurchasedNode() {
        const available = this.getAvailableNodes();
        if (available.length > 0) return available[0];

        const unresearched = this.nodes.filter(n => !n.isResearched);
        return unresearched.length > 0 ? unresearched[0] : null;
    }

    getAvailableNodes() {
        return this.nodes.filter(n => n.isUnlocked && !n.isResearched);
    }

    getResearchedNodes() {
        return this.nodes.filter(n => n.isResearched);
    }

    processQueue(state) {
        if (this.researchQueue.length === 0) return;

        const nextId = this.researchQueue[0];
        const nextNode = this.nodeMap[nextId];
        if (nextNode && nextNode.isResearched) {
            this.researchQueue.shift();
            return;
        }

        if (this.canAfford(nextId, state.ops, state.clips)) {
            if (this.purchaseResearch(nextId, state)) {
                this.researchQueue.shift();
                if (state.audio) state.audio.playTechUnlockSound();
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.TechTreeEngine = TechTreeEngine;
}
