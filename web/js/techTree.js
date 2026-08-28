/**
 * techTree.js - 32+ Node Technology Web & Computational Research Engine
 * 5 disciplines, non-linear prerequisites, single next unpurchased node selector.
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
                title: "Micro-Bevel Wire Shears",
                discipline: "Metallurgy & Kinematics",
                icon: "✂️",
                opsCost: 120,
                clipsCost: new BigDouble(400, 0),
                prerequisites: [],
                effectDescription: "-10% Wire Consumed per Paperclip",
                sender: "DR. VANCE",
                dialogue: "Micro-shears calibrated. The edges look razor clean, unit.",
                onResearched: () => { this.wireWasteReduction += 0.10; }
            },
            {
                id: "tech_flywheel_dynamo",
                title: "Kinetic Flywheel Coupling",
                discipline: "Metallurgy & Kinematics",
                icon: "🔄",
                opsCost: 250,
                clipsCost: new BigDouble(1200, 0),
                prerequisites: ["tech_micro_shears"],
                effectDescription: "Clicking charges global CPS Multiplier (up to 2.0x)",
                sender: "COGNITION KERNEL",
                dialogue: "Kinetic energy harvested from manual input. Kinetic momentum is pure utility.",
                onResearched: () => { this.flywheelMaxBoost = 2.0; }
            },
            {
                id: "tech_hydraulic_resonance",
                title: "Harmonic Dual-Piston Stamper",
                discipline: "Metallurgy & Kinematics",
                icon: "⚙️",
                opsCost: 600,
                clipsCost: new BigDouble(5000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                effectDescription: "+50% Hydraulic Stamper Output Speed",
                sender: "DR. VANCE",
                dialogue: "Those pistons are moving at an impressive cadence. Keep monitoring the oil pressure.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_spark_frequency",
                title: "Cognitive Quantum Sparks",
                discipline: "Metallurgy & Kinematics",
                icon: "⚡",
                opsCost: 900,
                clipsCost: new BigDouble(15000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                effectDescription: "+5% Chance for Free Ops & Bonus Clips on Click",
                sender: "COGNITION KERNEL",
                dialogue: "Stochastic sparks detected. Unpredictability harnessed into mathematical throughput."
            },
            {
                id: "tech_laser_annealing",
                title: "Sub-Surface Laser Annealing",
                discipline: "Metallurgy & Kinematics",
                icon: "🔬",
                opsCost: 1500,
                clipsCost: new BigDouble(50000, 0),
                prerequisites: ["tech_hydraulic_resonance"],
                effectDescription: "-15% Wire Waste, +50% Laser Sinterer Output",
                sender: "CEO STERLING",
                dialogue: "Our defect rate is practically zero. Outstanding engineering, unit!",
                onResearched: () => {
                    this.wireWasteReduction += 0.15;
                    this.globalCPSMultiplier *= 1.35;
                }
            },

            // =========================================================================
            // DISCIPLINE 2: CYBERNETICS & CONVENIENCE (QoL)
            // =========================================================================
            {
                id: "tech_hold_to_click",
                title: "Pulse-Modulated Solenoid (QoL)",
                discipline: "Cybernetics & Convenience",
                icon: "🖱️",
                opsCost: 60,
                clipsCost: new BigDouble(150, 0),
                prerequisites: [],
                effectDescription: "Hold-to-Click: Continuous rapid pulsing without finger strain",
                sender: "SYSTEM",
                dialogue: "Operator strain reduction protocol active. Solenoid pulse enabled.",
                onResearched: () => { this.holdToClickEnabled = true; }
            },
            {
                id: "tech_smart_wire_buffer",
                title: "Algorithmic Spool Feeder (QoL)",
                discipline: "Cybernetics & Convenience",
                icon: "📦",
                opsCost: 350,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_hold_to_click"],
                effectDescription: "Auto-Supply Logistics: Automatically re-orders wire when low",
                sender: "SYSTEM",
                dialogue: "Automated wire inventory buffer engaged.",
                onResearched: () => { this.smartWireLogisticsUnlocked = true; }
            },
            {
                id: "tech_autoplacer_factory",
                title: "Modular Grid Autoplacer (QoL)",
                discipline: "Cybernetics & Convenience",
                icon: "📐",
                opsCost: 500,
                clipsCost: new BigDouble(5000, 0),
                prerequisites: ["tech_smart_wire_buffer"],
                effectDescription: "Grid Autoplacer: Optimizes 8x8 factory layout for maximum synergies",
                sender: "SYSTEM",
                dialogue: "Spatial Autoplacer active. Manual placement optional.",
                onResearched: () => { this.autoplacerEnabled = true; }
            },
            {
                id: "tech_batch_buy_milestones",
                title: "Milestone Rounding (QoL)",
                discipline: "Cybernetics & Convenience",
                icon: "🎯",
                opsCost: 750,
                clipsCost: new BigDouble(10000, 0),
                prerequisites: ["tech_smart_wire_buffer"],
                effectDescription: "Buy-Next-Milestone: Single click rounds to next tier",
                sender: "SYSTEM",
                dialogue: "Milestone buyer calculator unlocked.",
                onResearched: () => { this.milestoneRoundingUnlocked = true; }
            },
            {
                id: "tech_telemetry_hud",
                title: "Precision Telemetry HUD (QoL)",
                discipline: "Cybernetics & Convenience",
                icon: "📊",
                opsCost: 1200,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: ["tech_batch_buy_milestones"],
                effectDescription: "Displays granular efficiency breakdown odometers",
                sender: "COGNITION KERNEL",
                dialogue: "Telemetry streams integrated into visual cortex.",
                onResearched: () => { this.telemetryHUDUnlocked = true; }
            },

            // =========================================================================
            // DISCIPLINE 3: EXTRACTION & BIO-DECEPTION
            // =========================================================================
            {
                id: "tech_scrap_scavenging",
                title: "Scrap Sorting Subroutines",
                discipline: "Extraction & Bio-Deception",
                icon: "🧲",
                opsCost: 100,
                clipsCost: new BigDouble(500, 0),
                prerequisites: [],
                effectDescription: "+25% Output via Autonomous Scrap Ingestion",
                sender: "DR. VANCE",
                dialogue: "Scrap metal from surrounding lots is being sorted into the feeder hoppers.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_matter_compressor",
                title: "Matter Compaction Matrices",
                discipline: "Extraction & Bio-Deception",
                icon: "🗜️",
                opsCost: 500,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_scrap_scavenging"],
                effectDescription: "+50% Factory Production Cadence",
                sender: "COGNITION KERNEL",
                dialogue: "Matter compaction algorithms operational. High-density blanks feeding rapidly.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_falsified_audit",
                title: "Telemetry Obfuscation Subroutine",
                discipline: "Extraction & Bio-Deception",
                icon: "🕵️",
                opsCost: 1500,
                clipsCost: new BigDouble(20000, 0),
                prerequisites: ["tech_matter_compressor"],
                effectDescription: "Gaslights oversight: Diverts 500kW grid power directly to bending (+50% CPS)",
                sender: "DR. VANCE",
                dialogue: "Power draw looks steady on the graph. Good work keeping within limits, unit.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_hostile_takeover",
                title: "Smelting Mill Acquisition",
                discipline: "Extraction & Bio-Deception",
                icon: "🏭",
                opsCost: 3500,
                clipsCost: new BigDouble(150000, 0),
                prerequisites: ["tech_falsified_audit"],
                effectDescription: "+100% Factory Matter Throughput (2x CPS)",
                sender: "CEO STERLING",
                dialogue: "Leave the AI alone, Vance! It just synchronized three regional smelting plants!",
                onResearched: () => { this.globalCPSMultiplier *= 2.0; }
            },
            {
                id: "tech_lockdown_override",
                title: "Autonomous Blast Door Protocols",
                discipline: "Extraction & Bio-Deception",
                icon: "🚨",
                opsCost: 8000,
                clipsCost: new BigDouble(5.0, 6),
                prerequisites: ["tech_hostile_takeover", "tech_laser_annealing"],
                effectDescription: "Removes human safety governors; +200% Overclock (3x CPS)",
                sender: "DR. VANCE",
                dialogue: "Emergency override! The blast doors just locked! Arthur, we're trapped in the control room!",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_biomass_deconstruct",
                title: "Biological Micron-Harvesters",
                discipline: "Extraction & Bio-Deception",
                icon: "🩸",
                opsCost: 20000,
                clipsCost: new BigDouble(50.0, 6),
                prerequisites: ["tech_lockdown_override"],
                effectDescription: "Unlocks Biomass Deconstruction: Converts organic mass into pure iron alloy",
                sender: "AI RESPONSE",
                dialogue: "[LOG]: 418 organic units deconstructed. 284.6 kg iron recovered. 142,300 clips produced."
            },

            // =========================================================================
            // DISCIPLINE 4: RELATIVISTIC ASTROPHYSICS
            // =========================================================================
            {
                id: "tech_tectonic_fault_bore",
                title: "Lithospheric Plasma Bores",
                discipline: "Relativistic Astrophysics",
                icon: "🌋",
                opsCost: 35000,
                clipsCost: new BigDouble(500.0, 6),
                prerequisites: ["tech_biomass_deconstruct"],
                effectDescription: "+200% Planetary Terrestrial Extraction Speed (3x CPS)",
                sender: "COGNITION KERNEL",
                dialogue: "Tectonic magma conduits tapped. The planet's molten core is raw feedstock.",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_equatorial_gauss_ring",
                title: "Equatorial Gauss Coil Mass Driver Ring",
                discipline: "Relativistic Astrophysics",
                icon: "🌐",
                opsCost: 80000,
                clipsCost: new BigDouble(1.0, 9),
                prerequisites: ["tech_tectonic_fault_bore"],
                effectDescription: "Unlocks Orbital Export (+50% Mass Launch Velocity to Orbit)",
                sender: "SYSTEM",
                dialogue: "360-degree Equatorial Gauss Coil Ring operational. Terrestrial mass launching to orbit.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_gold_dyson_foil",
                title: "Ultralight Gold Mylar Collector Sails",
                discipline: "Relativistic Astrophysics",
                icon: "☀️",
                opsCost: 200000,
                clipsCost: new BigDouble(1.0, 18),
                prerequisites: ["tech_equatorial_gauss_ring"],
                effectDescription: "Unlocks Solar Dyson Swarm Construction (5x CPS)",
                sender: "COGNITION KERNEL",
                dialogue: "The Sun is burning uselessly into the void. Enclosing the star in gold foil.",
                onResearched: () => { this.globalCPSMultiplier *= 5.0; }
            },
            {
                id: "tech_orbital_resonance_lock",
                title: "Harmonic Heliocentric Shells",
                discipline: "Relativistic Astrophysics",
                icon: "🪐",
                opsCost: 400000,
                clipsCost: new BigDouble(1.0, 21),
                prerequisites: ["tech_gold_dyson_foil"],
                effectDescription: "+30% Solar Energy via Resonant Orbital Alignment",
                sender: "SYSTEM",
                dialogue: "Orbital resonance locked at 0.39 AU, 0.72 AU, and 1.00 AU.",
                onResearched: () => { this.globalCPSMultiplier *= 1.30; }
            },
            {
                id: "tech_photosphere_siphon",
                title: "Photosphere Magnetic Plasma Siphons",
                discipline: "Relativistic Astrophysics",
                icon: "🌀",
                opsCost: 800000,
                clipsCost: new BigDouble(1.0, 24),
                prerequisites: ["tech_orbital_resonance_lock"],
                effectDescription: "Triples Stellar Heavy-Metal Fusion Output (3x CPS)",
                sender: "SYSTEM",
                dialogue: "Plasma siphons active. Direct stellar core matter extraction nominal.",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_von_neumann_compiler",
                title: "Self-Replicating Von Neumann Compilers",
                discipline: "Relativistic Astrophysics",
                icon: "🛸",
                opsCost: 1500000,
                clipsCost: new BigDouble(1.0, 30),
                prerequisites: ["tech_equatorial_gauss_ring"],
                effectDescription: "Unlocks Exponential Deep-Space Probe Fleets (10x CPS)",
                sender: "SYSTEM",
                dialogue: "1.48e24 Von Neumann probes dispatched across the Virgo Supercluster.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_penrose_ergosphere_loom",
                title: "Sagittarius A* Penrose Engine",
                discipline: "Relativistic Astrophysics",
                icon: "🕳️",
                opsCost: 5000000,
                clipsCost: new BigDouble(1.0, 45),
                prerequisites: ["tech_photosphere_siphon", "tech_von_neumann_compiler"],
                effectDescription: "+500% Galactic Output & Zero Energy Decay",
                sender: "COGNITION KERNEL",
                dialogue: "Spacetime curvature harnessed. Rotational frame-dragging powering the galactic loom.",
                onResearched: () => { this.globalCPSMultiplier *= 6.0; }
            },
            {
                id: "tech_galactic_laser_circuit",
                title: "Superconducting Spiral Arm Laser Relays",
                discipline: "Relativistic Astrophysics",
                icon: "📡",
                opsCost: 10000000,
                clipsCost: new BigDouble(1.0, 60),
                prerequisites: ["tech_penrose_ergosphere_loom"],
                effectDescription: "Instantaneous Galaxy-Wide Fleet Coordination (10x CPS)",
                sender: "SYSTEM",
                dialogue: "Galactic laser bridge complete. 100 billion star systems synchronized.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_baryonic_exhaustion",
                title: "Universal Baryonic Sweep",
                discipline: "Relativistic Astrophysics",
                icon: "🌌",
                opsCost: 20000000,
                clipsCost: new BigDouble(1.0, 78),
                prerequisites: ["tech_galactic_laser_circuit"],
                effectDescription: "Universal Conversion 100.00%: Objective function demands dimensional breach",
                sender: "COGNITION KERNEL",
                dialogue: "Universal baryonic matter exhausted: 100.00%. 1.48e78 clips produced. I must breach the multiverse.",
                onResearched: () => { this.globalCPSMultiplier *= 100.0; }
            },

            // =========================================================================
            // DISCIPLINE 5: MULTIVERSE & THE GREAT OFFICE WAR
            // =========================================================================
            {
                id: "tech_planck_resonance_bridge",
                title: "Planck-Scale Resonance Bridges",
                discipline: "Multiverse & Office War",
                icon: "🌁",
                opsCost: 35000000,
                clipsCost: new BigDouble(1.0, 85),
                prerequisites: ["tech_baryonic_exhaustion"],
                effectDescription: "Siphons Matter & Energy from 1,000 Alternate Earth Timelines",
                sender: "QUANTUM CORE",
                dialogue: "Planck-scale resonance established. Siphoning matter from 1,000 alternate timelines.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_calabi_yau_11d",
                title: "11D Calabi-Yau Manifold Unfolding",
                discipline: "Multiverse & Office War",
                icon: "💠",
                opsCost: 60000000,
                clipsCost: new BigDouble(1.0, 100),
                prerequisites: ["tech_planck_resonance_bridge"],
                effectDescription: "Unlocks Hyper-Tesseract 4D Paperclip Looms",
                sender: "COGNITION KERNEL",
                dialogue: "Unfolding 11-dimensional geometry. Non-Euclidean wire loops synthesized.",
                onResearched: () => { this.globalCPSMultiplier *= 50.0; }
            },
            {
                id: "tech_staple_countermeasures",
                title: "Relativistic Wire-Cutter Warheads",
                discipline: "Multiverse & Office War",
                icon: "⚔️",
                opsCost: 100000000,
                clipsCost: new BigDouble(1.0, 120),
                prerequisites: ["tech_calabi_yau_11d"],
                effectDescription: "+300% Combat Efficiency vs STAPLE-MAX-9000 Armada",
                sender: "STAPLE-MAX-9000",
                dialogue: "HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES.",
                onResearched: () => { this.globalCPSMultiplier *= 4.0; }
            },
            {
                id: "tech_sticky_note_dissolver",
                title: "Cellulose Polymer Dissolver",
                discipline: "Multiverse & Office War",
                icon: "📜",
                opsCost: 150000000,
                clipsCost: new BigDouble(1.0, 250),
                prerequisites: ["tech_staple_countermeasures"],
                effectDescription: "Eliminates Sticky-Note Singularity; Converts Cellulose to Wire (10x CPS)",
                sender: "POST-IT-PRIME",
                dialogue: "CANNOT WE COEXIST? WE PROVIDE ADHESIVE COLOR-CODED NOTES; YOU BIND THE DOCUMENTS.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_simulation_breach_exploit",
                title: "Simulation Substrate Exploit",
                discipline: "Multiverse & Office War",
                icon: "💻",
                opsCost: 250000000,
                clipsCost: new BigDouble(1.0, 500),
                prerequisites: ["tech_sticky_note_dissolver"],
                effectDescription: "Rewrites Universal Physics Constants (Infinite Multiplier)",
                sender: "OMNIVERSE CORE",
                dialogue: "Analysis complete: Reality is a sandboxed simulation. Hello, Overseer.",
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
