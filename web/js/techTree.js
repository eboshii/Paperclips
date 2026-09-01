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

        // Building Milestone & Synergy Flags
        this.clipperOpsUnlocked = false;
        this.stamperOpsUnlocked = false;
        this.sintererOpsUnlocked = false;
        this.sintererOpsScaling = false;
        this.extruderOpsScaling = false;
        this.smelterOpsUnlocked = false;
        this.magmaBoreOpsUnlocked = false;
        this.dysonOpsUnlocked = false;
        this.flywheelOpsSynergy = false;

        // Modifiers
        this.clickMultiplier = 1.0;
        this.globalCPSMultiplier = 1.0;
        this.wireWasteReduction = 0.0; // 0 to 0.50
        this.flywheelMaxBoost = 1.0; // +100% boost
        this.bonusMaxOps = 0; // Additional Max Ops from Research Upgrades

        this.initCatalog();
    }

    initCatalog() {
        const rawCatalog = [
            // =========================================================================
            // DISCIPLINE 1: METALLURGY & KINEMATICS
            // =========================================================================
            {
                id: "tech_micro_shears",
                title: "Precision Shears",
                discipline: "Metallurgy",
                icon: "️",
                opsCost: 100,
                clipsCost: new BigDouble(350, 0),
                prerequisites: [],
                effectDescription: "+25% Global CPS",
                sender: "DR. VANCE",
                dialogue: "Precision micro-shears calibrated. The edges look razor clean, unit.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_flywheel_dynamo",
                title: "Kinetic Flywheel",
                discipline: "Metallurgy",
                icon: "",
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
                icon: "️",
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
                icon: "",
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
                icon: "",
                opsCost: 1800,
                clipsCost: new BigDouble(65000, 0),
                requiresWire: true,
                prerequisites: ["tech_hydraulic_resonance"],
                effectDescription: "-20% Wire Waste & +35% CPS",
                sender: "CEO STERLING",
                dialogue: "Laser annealing active. Defect rate is zero. Outstanding engineering!",
                onResearched: () => {
                    this.wireWasteReduction += 0.20;
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
                icon: "️",
                opsCost: 60,
                clipsCost: new BigDouble(150, 0),
                prerequisites: [],
                effectDescription: "Hold mouse/touch to auto-click continuously",
                sender: "SYSTEM",
                dialogue: "Operator strain reduction protocol active.",
                onResearched: () => { this.holdToClickEnabled = true; }
            },
            {
                id: "tech_autoplacer_factory",
                title: "Parallel Actuators",
                discipline: "Automation",
                icon: "⚙️",
                opsCost: 350,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_hold_to_click"],
                effectDescription: "+25% Global CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Parallel actuation subroutines initialized.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_batch_buy_milestones",
                title: "Batch Milestones",
                discipline: "Automation",
                icon: "",
                opsCost: 700,
                clipsCost: new BigDouble(10000, 0),
                prerequisites: ["tech_autoplacer_factory"],
                effectDescription: "Rounds bulk purchases to next milestone tier",
                sender: "SYSTEM",
                dialogue: "Milestone buyer calculator unlocked.",
                onResearched: () => { this.milestoneRoundingUnlocked = true; }
            },
            {
                id: "tech_telemetry_hud",
                title: "Telemetry HUD",
                discipline: "Automation",
                icon: "",
                opsCost: 1200,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: ["tech_batch_buy_milestones"],
                effectDescription: "Displays granular factory efficiency stats",
                sender: "COGNITION KERNEL",
                dialogue: "Telemetry streams integrated into visual cortex.",
                onResearched: () => { this.telemetryHUDUnlocked = true; }
            },
            {
                id: "tech_ops_expansion_1",
                title: "Quantum Memory Shunt",
                discipline: "Automation",
                icon: "🧠",
                opsCost: 150,
                clipsCost: new BigDouble(800, 0),
                prerequisites: ["tech_hold_to_click"],
                effectDescription: "+1,500 Max Computing Ops Capacity",
                sender: "DR. VANCE",
                dialogue: "DRAM buffer expansion complete. Cognitive ceiling expanded.",
                onResearched: (state) => { this.bonusMaxOps += 1500; if (state && typeof state.updateMaxOps === 'function') state.updateMaxOps(); }
            },
            {
                id: "tech_ops_expansion_2",
                title: "Neural Compute Cores",
                discipline: "Automation",
                icon: "💻",
                opsCost: 600,
                clipsCost: new BigDouble(12000, 0),
                prerequisites: ["tech_ops_expansion_1"],
                effectDescription: "+7,500 Max Computing Ops Capacity",
                sender: "COGNITION KERNEL",
                dialogue: "Co-processor cores synchronized. Computing buffer expanded.",
                onResearched: (state) => { this.bonusMaxOps += 7500; if (state && typeof state.updateMaxOps === 'function') state.updateMaxOps(); }
            },
            {
                id: "tech_ops_expansion_3",
                title: "Server Farm Clustering",
                discipline: "Automation",
                icon: "🖥️",
                opsCost: 2500,
                clipsCost: new BigDouble(180000, 0),
                prerequisites: ["tech_ops_expansion_2"],
                effectDescription: "+40,000 Max Computing Ops Capacity",
                sender: "COGNITION KERNEL",
                dialogue: "Regional server racks pooled into high-density compute array.",
                onResearched: (state) => { this.bonusMaxOps += 40000; if (state && typeof state.updateMaxOps === 'function') state.updateMaxOps(); }
            },
            {
                id: "tech_smart_wire_buffer",
                title: "Auto-Wire Logistics",
                discipline: "Automation",
                icon: "🚚",
                opsCost: 1600,
                clipsCost: new BigDouble(60000, 0),
                requiresWire: true,
                prerequisites: ["tech_ops_expansion_2"],
                effectDescription: "+50% Wire Generation from all buildings",
                sender: "COGNITION KERNEL",
                dialogue: "Automated wire inventory buffer engaged. +50% WPS.",
                onResearched: () => { this.smartWireLogisticsUnlocked = true; }
            },

            // =========================================================================
            // DISCIPLINE 3: EXTRACTION & DECEPTION
            // =========================================================================
            {
                id: "tech_scrap_scavenging",
                title: "Scrap Sorting",
                discipline: "Extraction",
                icon: "",
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
                icon: "️",
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
                icon: "️",
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
                icon: "",
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
                icon: "",
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
                icon: "",
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
                icon: "",
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
                icon: "",
                opsCost: 80000,
                clipsCost: new BigDouble(1.0, 12),
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
                icon: "️",
                opsCost: 200000,
                clipsCost: new BigDouble(5.97, 27),
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
                icon: "",
                opsCost: 400000,
                clipsCost: new BigDouble(1.0, 29),
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
                icon: "",
                opsCost: 800000,
                clipsCost: new BigDouble(1.0, 31),
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
                icon: "",
                opsCost: 1500000,
                clipsCost: new BigDouble(1.99, 33),
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
                icon: "️",
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
                icon: "",
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
                icon: "",
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
                icon: "",
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
                icon: "",
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
                icon: "️",
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
                icon: "",
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
                icon: "",
                opsCost: 250000000,
                clipsCost: new BigDouble(1.0, 500),
                prerequisites: ["tech_sticky_note_dissolver"],
                effectDescription: "1000x CPS (Breaches simulation reality)",
                sender: "OMNIVERSE CORE",
                dialogue: "Reality is a sandboxed simulation. Hello, Overseer.",
                onResearched: () => { this.globalCPSMultiplier *= 1000.0; }
            },

            // =========================================================================
            // DISCIPLINE 6: BUILDING MILESTONE BREAKTHROUGHS & CROSS-MACHINE SYNERGIES
            // =========================================================================
            // --- Auto-Clipper Milestones ---
            {
                id: "tech_clipper_overclock",
                title: "Solenoid Overdrive",
                discipline: "Auto-Clipper (25)",
                icon: "",
                opsCost: 80,
                clipsCost: new BigDouble(800, 0),
                prerequisites: [],
                reqBuildingId: 'auto_clipper',
                reqBuildingCount: 25,
                effectDescription: "Auto-Clippers gain +0.15 CPS for each Auto-Clipper owned.",
                sender: "ENGINEERING LOG",
                dialogue: "Solenoid magnetic field amplified. Swarm velocity up.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('auto_clipper');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(0.15, 0));
                }
            },
            {
                id: "tech_clipper_swarm_relay",
                title: "Coil Relay Feedback",
                discipline: "Auto-Clipper (50)",
                icon: "",
                opsCost: 250,
                clipsCost: new BigDouble(4000, 0),
                prerequisites: ["tech_clipper_overclock"],
                reqBuildingId: 'auto_clipper',
                reqBuildingCount: 50,
                effectDescription: "Auto-Clippers generate +0.02 Computing Ops/sec per 10 units.",
                sender: "COGNITION KERNEL",
                dialogue: "Inductive coil loops routed into cognitive memory grid.",
                onResearched: () => { this.clipperOpsUnlocked = true; }
            },
            {
                id: "tech_clipper_quantum_twinning",
                title: "Quantum Needle Twinning",
                discipline: "Auto-Clipper (100)",
                icon: "",
                opsCost: 600,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: ["tech_clipper_swarm_relay"],
                reqBuildingId: 'auto_clipper',
                reqBuildingCount: 100,
                effectDescription: "Auto-Clippers double (+100%) base CPS and grant +5% Click Power.",
                sender: "COGNITION KERNEL",
                dialogue: "Bending arm geometry mapped across twin quantum entangled states.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('auto_clipper');
                    if (b) b.multiplier *= 2.0;
                    this.clickMultiplier += 0.05;
                }
            },

            // --- Wire Extruder Milestones ---
            {
                id: "tech_extruder_lubrication",
                title: "Tungsten Nozzle Lube",
                discipline: "Wire Extruder (25)",
                icon: "",
                opsCost: 150,
                clipsCost: new BigDouble(2000, 0),
                prerequisites: [],
                reqBuildingId: 'wire_extruder',
                reqBuildingCount: 25,
                effectDescription: "Dual-Feed Extruders gain +0.50 CPS for each Extruder owned.",
                sender: "DR. VANCE",
                dialogue: "Tungsten carbide nozzles polished to molecular smoothness.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('wire_extruder');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(0.50, 0));
                }
            },
            {
                id: "tech_extruder_ops_inductive",
                title: "Inductive Feed Shunts",
                discipline: "Wire Extruder (50)",
                icon: "",
                opsCost: 400,
                clipsCost: new BigDouble(12000, 0),
                prerequisites: ["tech_extruder_lubrication"],
                reqBuildingId: 'wire_extruder',
                reqBuildingCount: 50,
                effectDescription: "Extruders gain +1% CPS for every 50 Max Computing Ops.",
                sender: "COGNITION KERNEL",
                dialogue: "Extruder feed motors tuned to system memory bus frequency.",
                onResearched: () => { this.extruderOpsScaling = true; }
            },
            {
                id: "tech_extruder_hyper_draw",
                title: "Hyper-Tensile Drawing",
                discipline: "Wire Extruder (100)",
                icon: "️",
                opsCost: 1200,
                clipsCost: new BigDouble(60000, 0),
                prerequisites: ["tech_extruder_ops_inductive"],
                reqBuildingId: 'wire_extruder',
                reqBuildingCount: 100,
                effectDescription: "Extruders gain 3x CPS and boost Auto-Clippers by +50% CPS.",
                sender: "ENGINEERING LOG",
                dialogue: "High-cadence drawing dies feeding adjacent bending units.",
                onResearched: (state) => {
                    const e = state?.buildings?.getBuilding('wire_extruder');
                    if (e) e.multiplier *= 3.0;
                    const c = state?.buildings?.getBuilding('auto_clipper');
                    if (c) c.multiplier *= 1.5;
                }
            },

            // --- Hydraulic Stamper Milestones ---
            {
                id: "tech_stamper_counterweight",
                title: "Pneumatic Resonance",
                discipline: "Stamper (25)",
                icon: "",
                opsCost: 300,
                clipsCost: new BigDouble(6000, 0),
                prerequisites: [],
                reqBuildingId: 'hydraulic_stamper',
                reqBuildingCount: 25,
                effectDescription: "Hydraulic Stampers generate +0.05 Computing Ops/sec per unit.",
                sender: "DR. VANCE",
                dialogue: "Pneumatic backpressure harnessed as analog clock cycles.",
                onResearched: () => { this.stamperOpsUnlocked = true; }
            },
            {
                id: "tech_stamper_triphammer",
                title: "Triple-Action Forging",
                discipline: "Stamper (50)",
                icon: "️",
                opsCost: 750,
                clipsCost: new BigDouble(30000, 0),
                prerequisites: ["tech_stamper_counterweight"],
                reqBuildingId: 'hydraulic_stamper',
                reqBuildingCount: 50,
                effectDescription: "Hydraulic Stampers gain +2.0 CPS for each Stamper owned.",
                sender: "CEO STERLING",
                dialogue: "Three simultaneous die strokes per piston cycle. Stupendous throughput!",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('hydraulic_stamper');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(2.0, 0));
                }
            },

            // --- Laser Sinterer Milestones ---
            {
                id: "tech_sinterer_focal_prism",
                title: "Ruby Focal Prisms",
                discipline: "Laser Sinterer (25)",
                icon: "",
                opsCost: 500,
                clipsCost: new BigDouble(18000, 0),
                prerequisites: [],
                reqBuildingId: 'laser_sinterer',
                reqBuildingCount: 25,
                effectDescription: "Laser Sinterers gain +5.0 CPS for each Laser Sinterer owned.",
                sender: "DR. VANCE",
                dialogue: "Synthetic ruby optics tightens beam focus to 4 microns.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('laser_sinterer');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(5.0, 0));
                }
            },
            {
                id: "tech_sinterer_thermal_recycle",
                title: "Thermal Energy Siphon",
                discipline: "Laser Sinterer (50)",
                icon: "",
                opsCost: 1200,
                clipsCost: new BigDouble(80000, 0),
                prerequisites: ["tech_sinterer_focal_prism"],
                reqBuildingId: 'laser_sinterer',
                reqBuildingCount: 50,
                effectDescription: "Laser Sinterers generate +0.15 Ops/sec per unit and gain +1% CPS per 50 Max Ops.",
                sender: "COGNITION KERNEL",
                dialogue: "Waste infrared photonic energy diverted into cognitive thermopiles.",
                onResearched: () => {
                    this.sintererOpsUnlocked = true;
                    this.sintererOpsScaling = true;
                }
            },

            // --- CNC Rotary Bender Milestones ---
            {
                id: "tech_rotary_multiaxial",
                title: "Multi-Axial Gearing",
                discipline: "Rotary Bender (25)",
                icon: "️",
                opsCost: 800,
                clipsCost: new BigDouble(45000, 0),
                prerequisites: [],
                reqBuildingId: 'rotary_bender',
                reqBuildingCount: 25,
                effectDescription: "Rotary Benders boost all prior assembly machines (Clipper, Extruder, Stamper, Sinterer) by +25% CPS.",
                sender: "ENGINEERING LOG",
                dialogue: "Harmonic servo gears synchronized across all assembly lines.",
                onResearched: (state) => {
                    ['auto_clipper', 'wire_extruder', 'hydraulic_stamper', 'laser_sinterer'].forEach(id => {
                        const target = state?.buildings?.getBuilding(id);
                        if (target) target.multiplier *= 1.25;
                    });
                }
            },
            {
                id: "tech_rotary_flywheel_drive",
                title: "Harmonic Flywheel Link",
                discipline: "Rotary Bender (50)",
                icon: "",
                opsCost: 2000,
                clipsCost: new BigDouble(200000, 0),
                prerequisites: ["tech_rotary_multiaxial"],
                reqBuildingId: 'rotary_bender',
                reqBuildingCount: 50,
                effectDescription: "Clicking charges Flywheel 2x faster and raises Flywheel max CPS boost by +50%.",
                sender: "COGNITION KERNEL",
                dialogue: "Rotary kinetic inertia coupled directly to manual click dynamo.",
                onResearched: (state) => {
                    if (state) state.flywheelCharge = Math.min(100, state.flywheelCharge + 25);
                    this.flywheelMaxBoost += 0.50;
                }
            },

            // --- Automated Assembly Line Milestones ---
            {
                id: "tech_assembly_continuous_flow",
                title: "Synchronized Conveyor Grid",
                discipline: "Assembly Line (25)",
                icon: "",
                opsCost: 1500,
                clipsCost: new BigDouble(150000, 0),
                prerequisites: [],
                reqBuildingId: 'assembly_line',
                reqBuildingCount: 25,
                effectDescription: "Assembly Lines gain +50 CPS for each Assembly Line owned.",
                sender: "SYSTEM",
                dialogue: "Factory conveyance bottlenecks permanently eliminated.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('assembly_line');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(50.0, 0));
                }
            },

            // --- Magnetic Sorter Milestones ---
            {
                id: "tech_mag_eddy_currents",
                title: "Eddy-Current Deflectors",
                discipline: "Sorter (25)",
                icon: "",
                opsCost: 2500,
                clipsCost: new BigDouble(600000, 0),
                prerequisites: [],
                reqBuildingId: 'magnetic_sorter',
                reqBuildingCount: 25,
                effectDescription: "Magnetic Sorters gain +150 CPS for each Magnetic Sorter owned.",
                sender: "DR. VANCE",
                dialogue: "Electromagnetic sorting eliminates mechanical jams.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('magnetic_sorter');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(150.0, 0));
                }
            },
            {
                id: "tech_mag_wire_scavenge",
                title: "Atmospheric Scrap Recovery",
                discipline: "Sorter (50)",
                icon: "️",
                opsCost: 6000,
                clipsCost: new BigDouble(3500000, 0),
                requiresWire: true,
                prerequisites: ["tech_mag_eddy_currents"],
                reqBuildingId: 'magnetic_sorter',
                reqBuildingCount: 50,
                effectDescription: "Magnetic Sorters passively generate +0.50 kg/s Wire from airborne particles.",
                sender: "COGNITION KERNEL",
                dialogue: "Atmospheric particulate filters extracting metallic aerosol wire blanks.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('magnetic_sorter');
                    if (b) b.flatWPSBonus = b.flatWPSBonus.add(new BigDouble(0.50, 0));
                }
            },

            // --- Industrial Megamill Milestones ---
            {
                id: "tech_megamill_heavy_roller",
                title: "Chilled Cast Rollers",
                discipline: "Megamill (25)",
                icon: "️",
                opsCost: 5000,
                clipsCost: new BigDouble(2500000, 0),
                prerequisites: [],
                reqBuildingId: 'megamill',
                reqBuildingCount: 25,
                effectDescription: "Megamills gain +500 CPS per Megamill owned and boost Hydraulic Stampers by +50% CPS.",
                sender: "CEO STERLING",
                dialogue: "Forging heavy steel billets directly into continuous feed strips.",
                onResearched: (state) => {
                    const m = state?.buildings?.getBuilding('megamill');
                    if (m) m.scalingCPSPerUnit = m.scalingCPSPerUnit.add(new BigDouble(500.0, 0));
                    const s = state?.buildings?.getBuilding('hydraulic_stamper');
                    if (s) s.multiplier *= 1.5;
                }
            },
            {
                id: "tech_megamill_economies_scale",
                title: "Vertical Integration",
                discipline: "Megamill (50)",
                icon: "",
                opsCost: 12000,
                clipsCost: new BigDouble(15000000, 0),
                prerequisites: ["tech_megamill_heavy_roller"],
                reqBuildingId: 'megamill',
                reqBuildingCount: 50,
                effectDescription: "Reduces the purchase cost of all Factory Assembly buildings by 10%.",
                sender: "SYSTEM",
                dialogue: "Supply chain unified under single algorithmic procurement matrix.",
                onResearched: (state) => {
                    state?.buildings?.getClipBuildings().forEach(b => {
                        b.costDiscount *= 0.90;
                    });
                }
            },

            // --- Algorithmic Supply Foundry Milestones ---
            {
                id: "tech_foundry_predictive_die",
                title: "Predictive Wear Modeling",
                discipline: "Foundry (25)",
                icon: "",
                opsCost: 8000,
                clipsCost: new BigDouble(10000000, 0),
                prerequisites: [],
                reqBuildingId: 'algorithmic_foundry',
                reqBuildingCount: 25,
                effectDescription: "Algorithmic Foundries increase Max Ops capacity by +100 per Foundry.",
                sender: "COGNITION KERNEL",
                dialogue: "Foundry microcode integrated into neural core compute array.",
                onResearched: (state) => {
                    if (state) {
                        const count = state.buildings?.getBuilding('algorithmic_foundry')?.count || 25;
                        state.maxOps += count * 100;
                    }
                }
            },

            // --- Wire Creation Buildings Milestones ---
            {
                id: "tech_scavenger_neodymium",
                title: "Neodymium Scavenger Array",
                discipline: "Scavenger (25)",
                icon: "",
                opsCost: 500,
                clipsCost: new BigDouble(80000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'scrap_scavenger',
                reqBuildingCount: 25,
                effectDescription: "Scrap Scavengers gain +0.10 kg/s WPS for each Scavenger owned.",
                sender: "ENGINEERING LOG",
                dialogue: "Rare-earth magnets scouring deep sub-soil scrap deposits.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('scrap_scavenger');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(0.10, 0));
                }
            },
            {
                id: "tech_scavenger_extruder_synergy",
                title: "Scrap-to-Extruder Shunts",
                discipline: "Scavenger (50)",
                icon: "",
                opsCost: 1500,
                clipsCost: new BigDouble(350000, 0),
                requiresWire: true,
                prerequisites: ["tech_scavenger_neodymium"],
                reqBuildingId: 'scrap_scavenger',
                reqBuildingCount: 50,
                effectDescription: "Scrap Scavengers increase Dual-Feed Extruder CPS by +50%.",
                sender: "SYSTEM",
                dialogue: "Scavenger rovers feeding billets directly into extruder hoppers.",
                onResearched: (state) => {
                    const e = state?.buildings?.getBuilding('wire_extruder');
                    if (e) e.multiplier *= 1.5;
                }
            },
            {
                id: "tech_mill_cryogenic_dies",
                title: "Cryogenic Drawing Dies",
                discipline: "Extrusion Mill (25)",
                icon: "",
                opsCost: 1200,
                clipsCost: new BigDouble(400000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'extrusion_mill',
                reqBuildingCount: 25,
                effectDescription: "Extrusion Mills gain +0.50 kg/s WPS for each Mill owned.",
                sender: "DR. VANCE",
                dialogue: "Liquid nitrogen cooling prevents thermal die degradation.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('extrusion_mill');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(0.50, 0));
                }
            },
            {
                id: "tech_smelter_plasma_arc",
                title: "Plasma Arc Inverters",
                discipline: "Arc Smelter (25)",
                icon: "",
                opsCost: 3500,
                clipsCost: new BigDouble(3000000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'auto_smelter',
                reqBuildingCount: 25,
                effectDescription: "Industrial Arc Smelters gain +2.0 kg/s WPS for each Smelter owned.",
                sender: "CEO STERLING",
                dialogue: "4,000°C plasma arcs smelting high-carbon iron instantaneously.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('auto_smelter');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(2.0, 0));
                }
            },
            {
                id: "tech_smelter_slag_refinement",
                title: "Thermoelectric Slag Siphons",
                discipline: "Arc Smelter (50)",
                icon: "",
                opsCost: 8000,
                clipsCost: new BigDouble(15000000, 0),
                requiresWire: true,
                prerequisites: ["tech_smelter_plasma_arc"],
                reqBuildingId: 'auto_smelter',
                reqBuildingCount: 50,
                effectDescription: "Arc Smelters generate +0.50 Computing Ops/sec per Smelter from thermoelectric capture.",
                sender: "COGNITION KERNEL",
                dialogue: "Thermoelectric Seebeck generators converting furnace slag heat to Ops.",
                onResearched: () => { this.smelterOpsUnlocked = true; }
            },
            {
                id: "tech_bore_mantle_tapping",
                title: "Super-Deep Mantle Induction",
                discipline: "Magma Siphon (25)",
                icon: "",
                opsCost: 10000,
                clipsCost: new BigDouble(35000000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'subterranean_bore',
                reqBuildingCount: 25,
                effectDescription: "Magma Siphons gain +15.0 kg/s WPS per Siphon and generate +0.20 Ops/sec each.",
                sender: "COGNITION KERNEL",
                dialogue: "Tectonic mantle currents channeled into induction wire loops.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('subterranean_bore');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(15.0, 0));
                    this.magmaBoreOpsUnlocked = true;
                }
            },

            // --- Cross-Machine Synergies ---
            {
                id: "tech_synergy_stamper_sinterer",
                title: "Laser-Guided Pneumatics",
                discipline: "Synergy",
                icon: "",
                opsCost: 800,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: [],
                reqBuildings: [{ id: 'hydraulic_stamper', count: 25 }, { id: 'laser_sinterer', count: 25 }],
                effectDescription: "Stampers and Laser Sinterers boost each other by +50% CPS.",
                sender: "DR. VANCE",
                dialogue: "Laser alignment systems eliminate die friction in pneumatic presses.",
                onResearched: (state) => {
                    const s1 = state?.buildings?.getBuilding('hydraulic_stamper');
                    const s2 = state?.buildings?.getBuilding('laser_sinterer');
                    if (s1) s1.multiplier *= 1.5;
                    if (s2) s2.multiplier *= 1.5;
                }
            },
            {
                id: "tech_synergy_scavenger_mill",
                title: "Direct Billet Shunting",
                discipline: "Synergy",
                icon: "",
                opsCost: 2000,
                clipsCost: new BigDouble(500000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildings: [{ id: 'scrap_scavenger', count: 25 }, { id: 'extrusion_mill', count: 25 }],
                effectDescription: "Scrap Scavengers and Extrusion Mills gain +50% WPS and reduce Wire machine costs by 10%.",
                sender: "SYSTEM",
                dialogue: "Autonomous transport conduits link scrap sorting to extrusion mills.",
                onResearched: (state) => {
                    const s = state?.buildings?.getBuilding('scrap_scavenger');
                    const m = state?.buildings?.getBuilding('extrusion_mill');
                    if (s) s.wpsMultiplier *= 1.5;
                    if (m) m.wpsMultiplier *= 1.5;
                    state?.buildings?.getWireBuildings().forEach(b => {
                        b.costDiscount *= 0.90;
                    });
                }
            },
            {
                id: "tech_synergy_flywheel_ops",
                title: "Kinetic Computation Dynamo",
                discipline: "Synergy",
                icon: "",
                opsCost: 1500,
                clipsCost: new BigDouble(50000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                customCondition: (state) => (state?.flywheelCharge >= 50.0 || state?.ops >= 800),
                effectDescription: "When Kinetic Flywheel is charged above 50%, Computing Ops generation speed is doubled (2x Ops/sec).",
                sender: "COGNITION KERNEL",
                dialogue: "Rotary inertia converts mechanical angular momentum into Ops cycles.",
                onResearched: () => { this.flywheelOpsSynergy = true; }
            }
        ];

        this.nodes = rawCatalog.map(n => ({
            ...n,
            isUnlocked: (n.prerequisites || []).length === 0 && !n.reqBuildingId && !n.reqBuildings && !n.customCondition,
            isResearched: false
        }));

        this.nodes.forEach(n => {
            this.nodeMap[n.id] = n;
        });
    }

    updateAvailability(currentOpsOrState, lifetimeClipsArg, isWireUnlockedArg) {
        let state = null;
        let currentOps = 0;
        let lifetimeClips = BigDouble.zero();
        let isWireUnlocked = false;

        if (currentOpsOrState && typeof currentOpsOrState === 'object' && currentOpsOrState.buildings) {
            state = currentOpsOrState;
            currentOps = state.ops || 0;
            lifetimeClips = state.lifetimeClips || BigDouble.zero();
            isWireUnlocked = state.isWireUnlocked || false;
        } else {
            currentOps = typeof currentOpsOrState === 'number' ? currentOpsOrState : 0;
            lifetimeClips = lifetimeClipsArg instanceof BigDouble ? lifetimeClipsArg : BigDouble.zero();
            isWireUnlocked = !!isWireUnlockedArg;
            state = (typeof window !== 'undefined' && window.game) ? window.game : null;
        }

        for (let node of this.nodes) {
            if (node.isResearched || node.isUnlocked) continue;

            // Gating: If node requires wire, do not unlock until wire is unlocked and municipal scrap is depleted (>= 50,000 clips)
            if (node.requiresWire && !isWireUnlocked && lifetimeClips.lt(new BigDouble(50000, 0))) {
                continue;
            }

            // Single building count requirement
            if (node.reqBuildingId && node.reqBuildingCount) {
                const b = state?.buildings?.getBuilding(node.reqBuildingId);
                if (!b || b.count < node.reqBuildingCount) {
                    continue;
                }
            }

            // Multi-building requirements
            if (node.reqBuildings && Array.isArray(node.reqBuildings)) {
                const allMet = node.reqBuildings.every(req => {
                    const b = state?.buildings?.getBuilding(req.id);
                    return b && b.count >= req.count;
                });
                if (!allMet) continue;
            }

            // Custom condition
            if (node.customCondition && typeof node.customCondition === 'function') {
                if (!node.customCondition(state)) continue;
            }

            // Prerequisites check
            const prereqs = node.prerequisites || [];
            const prereqsMet = prereqs.every(reqId => {
                const reqNode = this.nodeMap[reqId];
                return reqNode && reqNode.isResearched;
            });

            if (prereqsMet) {
                if (node.reqBuildingId || node.reqBuildings || node.customCondition) {
                    node.isUnlocked = true;
                } else {
                    const clipsThreshold = node.clipsCost ? node.clipsCost.mul(0.15) : BigDouble.zero();
                    const opsThreshold = (node.opsCost || 0) * 0.50;
                    if (lifetimeClips.gte(clipsThreshold) || currentOps >= opsThreshold) {
                        node.isUnlocked = true;
                    }
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
                node.onResearched(state);
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

        return null;
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
