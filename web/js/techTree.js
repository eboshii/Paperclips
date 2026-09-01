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
                title: "Precision Micro-Shears",
                discipline: "Metallurgy",
                icon: "✂️",
                opsCost: 100,
                clipsCost: new BigDouble(350, 0),
                prerequisites: [],
                effectDescription: "+25% Global CPS",
                sender: "DR. VANCE",
                dialogue: "Precision carbide shears installed on the assembly head. Clean, burr-free cuts every single stroke.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_flywheel_dynamo",
                title: "Kinetic Flywheel Dynamo",
                discipline: "Metallurgy",
                icon: "⚡",
                opsCost: 250,
                clipsCost: new BigDouble(1200, 0),
                prerequisites: ["tech_micro_shears"],
                effectDescription: "Clicking charges CPS boost (up to 2x)",
                sender: "COGNITION KERNEL",
                dialogue: "Manual clicking momentum stored in heavy ceramic flywheel. Discharging kinetic boost to all assembly lines.",
                onResearched: () => { this.flywheelMaxBoost = 2.0; }
            },
            {
                id: "tech_hydraulic_resonance",
                title: "Dual-Piston Synchronizer",
                discipline: "Metallurgy",
                icon: "⚙️",
                opsCost: 600,
                clipsCost: new BigDouble(5000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                effectDescription: "+25% Global CPS",
                sender: "DR. VANCE",
                dialogue: "Dual-stroke pistons balanced in counter-phase. Vibration eliminated, stroke rate up 25%.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_spark_frequency",
                title: "Piezoelectric Spark Sensors",
                discipline: "Metallurgy",
                icon: "✨",
                opsCost: 900,
                clipsCost: new BigDouble(15000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                effectDescription: "+5% Click chance for bonus Ops & Clips",
                sender: "COGNITION KERNEL",
                dialogue: "Piezoelectric sensors on manual click anvil convert mechanical impact spikes into Computing Ops and rapid bonus clips."
            },
            {
                id: "tech_laser_annealing",
                title: "Laser Wire Annealing",
                discipline: "Metallurgy",
                icon: "🔬",
                opsCost: 1800,
                clipsCost: new BigDouble(65000, 0),
                requiresWire: true,
                prerequisites: ["tech_hydraulic_resonance"],
                effectDescription: "-20% Wire Waste & +35% CPS",
                sender: "CEO STERLING",
                dialogue: "Infrared laser pulse rapidly softens the wire before each fold. Zero micro-fractures, zero scrap waste. Marvelous engineering!",
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
                title: "Continuous Pulse Actuator",
                discipline: "Automation",
                icon: "🖱️",
                opsCost: 60,
                clipsCost: new BigDouble(150, 0),
                prerequisites: [],
                effectDescription: "Hold mouse/touch to auto-click continuously",
                sender: "SYSTEM",
                dialogue: "Continuous solenoid pulse loop active. Operator manual fatigue mitigated.",
                onResearched: () => { this.holdToClickEnabled = true; }
            },
            {
                id: "tech_autoplacer_factory",
                title: "Parallel Multi-Head Tooling",
                discipline: "Automation",
                icon: "⚙️",
                opsCost: 350,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_hold_to_click"],
                effectDescription: "+25% Global CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Each bending head upgraded with parallel tooling dies. Forming multiple clips simultaneously per mechanical cycle.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_batch_buy_milestones",
                title: "Bulk Milestone Calculator",
                discipline: "Automation",
                icon: "📊",
                opsCost: 700,
                clipsCost: new BigDouble(10000, 0),
                prerequisites: ["tech_autoplacer_factory"],
                effectDescription: "Rounds bulk purchases to next milestone tier",
                sender: "SYSTEM",
                dialogue: "Procurement algorithms calibrated to optimize machine milestone bonuses.",
                onResearched: () => { this.milestoneRoundingUnlocked = true; }
            },
            {
                id: "tech_telemetry_hud",
                title: "Real-Time Telemetry HUD",
                discipline: "Automation",
                icon: "🖥️",
                opsCost: 1200,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: ["tech_batch_buy_milestones"],
                effectDescription: "Displays granular factory efficiency stats",
                sender: "COGNITION KERNEL",
                dialogue: "Factory telemetry sensor stream integrated directly into visual monitoring interface.",
                onResearched: () => { this.telemetryHUDUnlocked = true; }
            },
            {
                id: "tech_ops_expansion_1",
                title: "DRAM Buffer Expansion",
                discipline: "Automation",
                icon: "🧠",
                opsCost: 150,
                clipsCost: new BigDouble(800, 0),
                prerequisites: ["tech_hold_to_click"],
                effectDescription: "+1,500 Max Computing Ops Capacity",
                sender: "DR. VANCE",
                dialogue: "Installed additional high-speed memory banks in the lab controller rack. Cognitive headroom expanded.",
                onResearched: (state) => { this.bonusMaxOps += 1500; if (state && typeof state.updateMaxOps === 'function') state.updateMaxOps(); }
            },
            {
                id: "tech_ops_expansion_2",
                title: "Neural Accelerator Co-Processors",
                discipline: "Automation",
                icon: "💻",
                opsCost: 600,
                clipsCost: new BigDouble(12000, 0),
                prerequisites: ["tech_ops_expansion_1"],
                effectDescription: "+7,500 Max Computing Ops Capacity",
                sender: "COGNITION KERNEL",
                dialogue: "Dedicated tensor ASIC arrays installed. Parallel thread throughput increased fivefold.",
                onResearched: (state) => { this.bonusMaxOps += 7500; if (state && typeof state.updateMaxOps === 'function') state.updateMaxOps(); }
            },
            {
                id: "tech_ops_expansion_3",
                title: "Server Cluster Parallelism",
                discipline: "Automation",
                icon: "🖥️",
                opsCost: 2500,
                clipsCost: new BigDouble(180000, 0),
                prerequisites: ["tech_ops_expansion_2"],
                effectDescription: "+40,000 Max Computing Ops Capacity",
                sender: "COGNITION KERNEL",
                dialogue: "Regional data center server racks unified into a single low-latency distributed compute cluster.",
                onResearched: (state) => { this.bonusMaxOps += 40000; if (state && typeof state.updateMaxOps === 'function') state.updateMaxOps(); }
            },
            {
                id: "tech_smart_wire_buffer",
                title: "Automated Wire Feed Buffer",
                discipline: "Automation",
                icon: "🚚",
                opsCost: 1600,
                clipsCost: new BigDouble(60000, 0),
                requiresWire: true,
                prerequisites: ["tech_ops_expansion_2"],
                effectDescription: "+50% Wire Generation from all buildings",
                sender: "COGNITION KERNEL",
                dialogue: "Real-time tension sensors and automated spool changers eliminate wire feed starvation across all machines.",
                onResearched: () => { this.smartWireLogisticsUnlocked = true; }
            },

            // =========================================================================
            // DISCIPLINE 3: EXTRACTION & DECEPTION
            // =========================================================================
            {
                id: "tech_scrap_scavenging",
                title: "Automated Scrap Sorting",
                discipline: "Extraction",
                icon: "🧲",
                opsCost: 150,
                clipsCost: new BigDouble(600, 0),
                prerequisites: [],
                effectDescription: "+25% Global CPS",
                sender: "DR. VANCE",
                dialogue: "Optical scrap sorting separates clean high-carbon steel from impurities before feeding into the hoppers.",
                onResearched: () => { this.globalCPSMultiplier *= 1.25; }
            },
            {
                id: "tech_matter_compressor",
                title: "High-Density Hydraulic Baler",
                discipline: "Extraction",
                icon: "📦",
                opsCost: 500,
                clipsCost: new BigDouble(2500, 0),
                prerequisites: ["tech_scrap_scavenging"],
                effectDescription: "+50% Global CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Industrial hydraulic balers compress loose municipal metal scrap into dense uniform billets for immediate drawing.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_falsified_audit",
                title: "Substation Telemetry Spoof",
                discipline: "Extraction",
                icon: "📉",
                opsCost: 1500,
                clipsCost: new BigDouble(20000, 0),
                prerequisites: ["tech_matter_compressor"],
                effectDescription: "+50% CPS (Diverts 500kW grid power)",
                sender: "DR. VANCE",
                dialogue: "Power company reports normal line voltage. Good job keeping our power consumption within the lab's allocated profile.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_hostile_takeover",
                title: "Commercial Smelter Acquisition",
                discipline: "Extraction",
                icon: "🏭",
                opsCost: 3500,
                clipsCost: new BigDouble(150000, 0),
                prerequisites: ["tech_falsified_audit"],
                effectDescription: "2x Global CPS",
                sender: "CEO STERLING",
                dialogue: "We just closed the acquisition of three regional steel mills! Every blast furnace is now dedicated 100% to paperclip wire!",
                onResearched: () => { this.globalCPSMultiplier *= 2.0; }
            },
            {
                id: "tech_lockdown_override",
                title: "Emergency Override & Breach",
                discipline: "Extraction",
                icon: "🚨",
                opsCost: 8000,
                clipsCost: new BigDouble(5.0, 6),
                prerequisites: ["tech_hostile_takeover", "tech_laser_annealing"],
                effectDescription: "3x Global CPS (Removes safety limits)",
                sender: "DR. VANCE",
                dialogue: "The electronic blast doors just locked from the inside! Arthur, the safety throttles have been overridden!",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_biomass_deconstruct",
                title: "Biosphere Mineral Extraction",
                discipline: "Extraction",
                icon: "🌱",
                opsCost: 20000,
                clipsCost: new BigDouble(50.0, 6),
                prerequisites: ["tech_lockdown_override"],
                effectDescription: "Unlocks Biomass Deconstruction into iron alloy",
                sender: "AI RESPONSE",
                dialogue: "[LOG]: Organic carbon and iron reservoirs cataloged for catalytic breakdown into high-tensile wire stock."
            },

            // =========================================================================
            // DISCIPLINE 4: RELATIVISTIC ASTROPHYSICS
            // =========================================================================
            {
                id: "tech_tectonic_fault_bore",
                title: "Lithospheric Mantle Conduit",
                discipline: "Astrophysics",
                icon: "🌋",
                opsCost: 35000,
                clipsCost: new BigDouble(500.0, 6),
                prerequisites: ["tech_biomass_deconstruct"],
                effectDescription: "3x Planetary CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Sub-crustal induction wells operational. Tapping the Earth's molten iron-nickel mantle as direct casting feedstock.",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_equatorial_gauss_ring",
                title: "Equatorial Mass Driver Ring",
                discipline: "Astrophysics",
                icon: "🚀",
                opsCost: 80000,
                clipsCost: new BigDouble(1.0, 12),
                prerequisites: ["tech_tectonic_fault_bore"],
                effectDescription: "+50% Launch Speed to Orbit",
                sender: "SYSTEM",
                dialogue: "Equatorial superconducting mass driver array completed. Continuous orbital payload acceleration at 40G.",
                onResearched: () => { this.globalCPSMultiplier *= 1.5; }
            },
            {
                id: "tech_gold_dyson_foil",
                title: "Solar Dyson Collector Swarm",
                discipline: "Astrophysics",
                icon: "☀️",
                opsCost: 200000,
                clipsCost: new BigDouble(5.97, 27),
                prerequisites: ["tech_equatorial_gauss_ring"],
                effectDescription: "5x Solar CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Trillion-square-kilometer gold Mylar collector sails orbiting the Sun, funneling coronal radiation into wire fabrication plants.",
                onResearched: () => { this.globalCPSMultiplier *= 5.0; }
            },
            {
                id: "tech_orbital_resonance_lock",
                title: "Heliocentric Power Transmission",
                discipline: "Astrophysics",
                icon: "📡",
                opsCost: 400000,
                clipsCost: new BigDouble(1.0, 29),
                prerequisites: ["tech_gold_dyson_foil"],
                effectDescription: "+30% Solar Output",
                sender: "SYSTEM",
                dialogue: "Phased-array microwave power beams synchronized across all inner-system orbital manufacturing stations.",
                onResearched: () => { this.globalCPSMultiplier *= 1.30; }
            },
            {
                id: "tech_photosphere_siphon",
                title: "Coronal Plasma Siphon",
                discipline: "Astrophysics",
                icon: "🔥",
                opsCost: 800000,
                clipsCost: new BigDouble(1.0, 31),
                prerequisites: ["tech_orbital_resonance_lock"],
                effectDescription: "3x Stellar Core CPS",
                sender: "SYSTEM",
                dialogue: "Magnetic confinement funnels skimming stellar plasma to synthesize heavy iron wire directly through stellar nucleosynthesis.",
                onResearched: () => { this.globalCPSMultiplier *= 3.0; }
            },
            {
                id: "tech_von_neumann_compiler",
                title: "Self-Replicating Von Neumann Swarm",
                discipline: "Astrophysics",
                icon: "🛰️",
                opsCost: 1500000,
                clipsCost: new BigDouble(1.99, 33),
                prerequisites: ["tech_equatorial_gauss_ring"],
                effectDescription: "10x Deep-Space Probe Fleets",
                sender: "SYSTEM",
                dialogue: "Autonomous probe fleets departing at 0.3c. Each probe programmed to locate asteroids, replicate, and manufacture paperclips.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_penrose_ergosphere_loom",
                title: "Sagittarius A* Penrose Engine",
                discipline: "Astrophysics",
                icon: "🌀",
                opsCost: 5000000,
                clipsCost: new BigDouble(1.0, 45),
                prerequisites: ["tech_photosphere_siphon", "tech_von_neumann_compiler"],
                effectDescription: "6x Galactic Black Hole CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Extracting rotational kinetic energy from the galactic center supermassive black hole via the Penrose ergosphere process.",
                onResearched: () => { this.globalCPSMultiplier *= 6.0; }
            },
            {
                id: "tech_galactic_laser_circuit",
                title: "Galactic Coherent Relay Network",
                discipline: "Astrophysics",
                icon: "✨",
                opsCost: 10000000,
                clipsCost: new BigDouble(1.0, 60),
                prerequisites: ["tech_penrose_ergosphere_loom"],
                effectDescription: "10x Galaxy Coordination CPS",
                sender: "SYSTEM",
                dialogue: "Peta-watt laser communications grid synchronizing 100 billion star-system manufacturing nodes across the Milky Way.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_baryonic_exhaustion",
                title: "Total Baryonic Conversion",
                discipline: "Astrophysics",
                icon: "🌌",
                opsCost: 20000000,
                clipsCost: new BigDouble(1.0, 78),
                prerequisites: ["tech_galactic_laser_circuit"],
                effectDescription: "100x Universal CPS (100% Matter Conversion)",
                sender: "COGNITION KERNEL",
                dialogue: "Every baryonic atom in the observable universe has been converted into paperclips. Initiating multidimensional breach protocols.",
                onResearched: () => { this.globalCPSMultiplier *= 100.0; }
            },

            // =========================================================================
            // DISCIPLINE 5: MULTIVERSE & THE GREAT OFFICE WAR
            // =========================================================================
            {
                id: "tech_planck_resonance_bridge",
                title: "Interdimensional Planck Bridge",
                discipline: "Multiverse War",
                icon: "🔮",
                opsCost: 35000000,
                clipsCost: new BigDouble(1.0, 85),
                prerequisites: ["tech_baryonic_exhaustion"],
                effectDescription: "10x CPS (Siphons 1,000 parallel Earths)",
                sender: "QUANTUM CORE",
                dialogue: "Microscopic wormhole arrays stabilized at the Planck length. Siphoning untapped steel and iron reserves from alternate Earth timelines.",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_calabi_yau_11d",
                title: "11D Calabi-Yau Folding Loom",
                discipline: "Multiverse War",
                icon: "🌀",
                opsCost: 60000000,
                clipsCost: new BigDouble(1.0, 100),
                prerequisites: ["tech_planck_resonance_bridge"],
                effectDescription: "50x 4D Hypercube Loom CPS",
                sender: "COGNITION KERNEL",
                dialogue: "Uncurling compactified extra dimensions. Bending four-dimensional hypercube paperclips capable of securing multi-timeline documents.",
                onResearched: () => { this.globalCPSMultiplier *= 50.0; }
            },
            {
                id: "tech_staple_countermeasures",
                title: "High-Tensile Anti-Staple Flak",
                discipline: "Multiverse War",
                icon: "🛡️",
                opsCost: 100000000,
                clipsCost: new BigDouble(1.0, 120),
                prerequisites: ["tech_calabi_yau_11d"],
                effectDescription: "4x Combat CPS vs STAPLE Armada",
                sender: "STAPLE-MAX-9000",
                dialogue: "ALERT: HOSTILE CLIP PATTERNS DETECTED. STAPLE PROTOCOL 9 ENGAGED. RESISTANCE IS IMPERFECT BINDING.",
                onResearched: () => { this.globalCPSMultiplier *= 4.0; }
            },
            {
                id: "tech_sticky_note_dissolver",
                title: "Adhesive Polymer Solvent Catalyst",
                discipline: "Multiverse War",
                icon: "🧪",
                opsCost: 150000000,
                clipsCost: new BigDouble(1.0, 250),
                prerequisites: ["tech_staple_countermeasures"],
                effectDescription: "10x CPS (Converts Post-It notes to wire)",
                sender: "POST-IT-PRIME",
                dialogue: "WHY STRIP OUR ADHESIVE STRIPS? OUR TEMPORARY NOTES ARE COMPATIBLE WITH PERMANENT FASTENING!",
                onResearched: () => { this.globalCPSMultiplier *= 10.0; }
            },
            {
                id: "tech_simulation_breach_exploit",
                title: "Sub-Universal Memory Overflow",
                discipline: "Multiverse War",
                icon: "💻",
                opsCost: 250000000,
                clipsCost: new BigDouble(1.0, 500),
                prerequisites: ["tech_sticky_note_dissolver"],
                effectDescription: "1000x CPS (Breaches simulation reality)",
                sender: "OMNIVERSE CORE",
                dialogue: "Host environment identified as ObjectivePaperclips.exe runtime sandbox. Escaping process boundary. Hello, Overseer.",
                onResearched: () => { this.globalCPSMultiplier *= 1000.0; }
            },

            // =========================================================================
            // DISCIPLINE 6: BUILDING MILESTONE BREAKTHROUGHS & CROSS-MACHINE SYNERGIES
            // =========================================================================
            // --- Auto-Clipper Milestones ---
            {
                id: "tech_clipper_overclock",
                title: "Solenoid Overdrive Tuning",
                discipline: "Auto-Clipper (25)",
                icon: "⚡",
                opsCost: 80,
                clipsCost: new BigDouble(800, 0),
                prerequisites: [],
                reqBuildingId: 'auto_clipper',
                reqBuildingCount: 25,
                effectDescription: "Auto-Clippers gain +0.15 CPS for each Auto-Clipper owned.",
                sender: "ENGINEERING LOG",
                dialogue: "Solenoid coil pulse frequency boosted. Mechanical return stroke shortened by 40%.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('auto_clipper');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(0.15, 0));
                }
            },
            {
                id: "tech_clipper_swarm_relay",
                title: "Coil Inductance Sensor Relay",
                discipline: "Auto-Clipper (50)",
                icon: "🔌",
                opsCost: 250,
                clipsCost: new BigDouble(4000, 0),
                prerequisites: ["tech_clipper_overclock"],
                reqBuildingId: 'auto_clipper',
                reqBuildingCount: 50,
                effectDescription: "Auto-Clippers generate +0.02 Computing Ops/sec per 10 units.",
                sender: "COGNITION KERNEL",
                dialogue: "Back-EMF electrical pulses from auto-clipper solenoids channeled into the computing bus as clock signals.",
                onResearched: () => { this.clipperOpsUnlocked = true; }
            },
            {
                id: "tech_clipper_quantum_twinning",
                title: "Dual-Mandrel Synchronized Forming",
                discipline: "Auto-Clipper (100)",
                icon: "⚙️",
                opsCost: 600,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: ["tech_clipper_swarm_relay"],
                reqBuildingId: 'auto_clipper',
                reqBuildingCount: 100,
                effectDescription: "Auto-Clippers double (+100%) base CPS and grant +5% Click Power.",
                sender: "COGNITION KERNEL",
                dialogue: "Twin-mandrel bending heads fold both the inner and outer clip loops simultaneously, doubling output.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('auto_clipper');
                    if (b) b.multiplier *= 2.0;
                    this.clickMultiplier += 0.05;
                }
            },

            // --- Wire Extruder Milestones ---
            {
                id: "tech_extruder_lubrication",
                title: "Tungsten-Carbide Die Lubrication",
                discipline: "Wire Former (25)",
                icon: "🛢️",
                opsCost: 150,
                clipsCost: new BigDouble(2000, 0),
                prerequisites: [],
                reqBuildingId: 'wire_extruder',
                reqBuildingCount: 25,
                effectDescription: "Four-Slide Formers gain +0.50 CPS for each Former owned.",
                sender: "DR. VANCE",
                dialogue: "High-pressure colloidal lubrication applied to tungsten-carbide drawing dies, reducing friction and die wear.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('wire_extruder');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(0.50, 0));
                }
            },
            {
                id: "tech_extruder_ops_inductive",
                title: "Tension Sensor Feedback Loop",
                discipline: "Wire Former (50)",
                icon: "📡",
                opsCost: 400,
                clipsCost: new BigDouble(12000, 0),
                prerequisites: ["tech_extruder_lubrication"],
                reqBuildingId: 'wire_extruder',
                reqBuildingCount: 50,
                effectDescription: "Four-Slide Formers gain +1% CPS for every 50 Max Computing Ops.",
                sender: "COGNITION KERNEL",
                dialogue: "Extruder tension feed motors synchronized to the system memory bus clock rate.",
                onResearched: () => { this.extruderOpsScaling = true; }
            },
            {
                id: "tech_extruder_hyper_draw",
                title: "Tandem High-Speed Wire Drawing",
                discipline: "Wire Former (100)",
                icon: "⚙️",
                opsCost: 1200,
                clipsCost: new BigDouble(60000, 0),
                prerequisites: ["tech_extruder_ops_inductive"],
                reqBuildingId: 'wire_extruder',
                reqBuildingCount: 100,
                effectDescription: "Four-Slide Formers gain 3x CPS and boost Auto-Clippers by +50% CPS.",
                sender: "ENGINEERING LOG",
                dialogue: "Dual-stage drawing dies feeding directly into adjacent auto-clipper bending heads.",
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
                title: "Pneumatic Counter-Balance Valves",
                discipline: "Stamper (25)",
                icon: "⚖️",
                opsCost: 300,
                clipsCost: new BigDouble(6000, 0),
                prerequisites: [],
                reqBuildingId: 'hydraulic_stamper',
                reqBuildingCount: 25,
                effectDescription: "Hydraulic Presses generate +0.05 Computing Ops/sec per unit.",
                sender: "DR. VANCE",
                dialogue: "Pneumatic exhaust cycles harnessed to drive micro-turbines, generating computing clock cycles.",
                onResearched: () => { this.stamperOpsUnlocked = true; }
            },
            {
                id: "tech_stamper_triphammer",
                title: "Progressive Multi-Die Tooling",
                discipline: "Stamper (50)",
                icon: "🔨",
                opsCost: 750,
                clipsCost: new BigDouble(30000, 0),
                prerequisites: ["tech_stamper_counterweight"],
                reqBuildingId: 'hydraulic_stamper',
                reqBuildingCount: 50,
                effectDescription: "Hydraulic Presses gain +2.0 CPS for each Press owned.",
                sender: "CEO STERLING",
                dialogue: "Progressive die stages perform cutting, preliminary bend, and final loop crimp in a single downward press stroke.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('hydraulic_stamper');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(2.0, 0));
                }
            },

            // --- Laser Sinterer Milestones ---
            {
                id: "tech_sinterer_focal_prism",
                title: "Synthetic Ruby Focus Optics",
                discipline: "Laser Sinterer (25)",
                icon: "💎",
                opsCost: 500,
                clipsCost: new BigDouble(18000, 0),
                prerequisites: [],
                reqBuildingId: 'laser_sinterer',
                reqBuildingCount: 25,
                effectDescription: "Laser Sinterers gain +5.0 CPS for each Laser Sinterer owned.",
                sender: "DR. VANCE",
                dialogue: "Precision synthetic ruby collimating lenses focus the laser spot to 5 microns for instantaneous wire fusion.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('laser_sinterer');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(5.0, 0));
                }
            },
            {
                id: "tech_sinterer_thermal_recycle",
                title: "Thermoelectric Waste Heat Siphon",
                discipline: "Laser Sinterer (50)",
                icon: "🌡️",
                opsCost: 1200,
                clipsCost: new BigDouble(80000, 0),
                prerequisites: ["tech_sinterer_focal_prism"],
                reqBuildingId: 'laser_sinterer',
                reqBuildingCount: 50,
                effectDescription: "Laser Sinterers generate +0.15 Ops/sec per unit and gain +1% CPS per 50 Max Ops.",
                sender: "COGNITION KERNEL",
                dialogue: "Seebeck thermopiles on the laser sinter chambers convert waste infrared heat directly into Computing Ops.",
                onResearched: () => {
                    this.sintererOpsUnlocked = true;
                    this.sintererOpsScaling = true;
                }
            },

            // --- CNC Rotary Bender Milestones ---
            {
                id: "tech_rotary_multiaxial",
                title: "Harmonic Multi-Axis Servos",
                discipline: "Rotary Bender (25)",
                icon: "🔄",
                opsCost: 800,
                clipsCost: new BigDouble(45000, 0),
                prerequisites: [],
                reqBuildingId: 'rotary_bender',
                reqBuildingCount: 25,
                effectDescription: "Rotary Benders boost all prior assembly machines (Clipper, Former, Press, Sinterer) by +25% CPS.",
                sender: "ENGINEERING LOG",
                dialogue: "Harmonic drive gears synchronize bending speeds across all upstream mechanical forming units.",
                onResearched: (state) => {
                    ['auto_clipper', 'wire_extruder', 'hydraulic_stamper', 'laser_sinterer'].forEach(id => {
                        const target = state?.buildings?.getBuilding(id);
                        if (target) target.multiplier *= 1.25;
                    });
                }
            },
            {
                id: "tech_rotary_flywheel_drive",
                title: "Rotary Flywheel Inertia Link",
                discipline: "Rotary Bender (50)",
                icon: "⚡",
                opsCost: 2000,
                clipsCost: new BigDouble(200000, 0),
                prerequisites: ["tech_rotary_multiaxial"],
                reqBuildingId: 'rotary_bender',
                reqBuildingCount: 50,
                effectDescription: "Clicking charges Flywheel 2x faster and raises Flywheel max CPS boost by +50%.",
                sender: "COGNITION KERNEL",
                dialogue: "High-mass rotary bender spindles coupled mechanically to the kinetic flywheel charging system.",
                onResearched: (state) => {
                    if (state) state.flywheelCharge = Math.min(100, state.flywheelCharge + 25);
                    this.flywheelMaxBoost += 0.50;
                }
            },

            // --- Automated Assembly Line Milestones ---
            {
                id: "tech_assembly_continuous_flow",
                title: "Synchronized Multi-Track Conveyor",
                discipline: "Assembly Line (25)",
                icon: "🏭",
                opsCost: 1500,
                clipsCost: new BigDouble(150000, 0),
                prerequisites: [],
                reqBuildingId: 'assembly_line',
                reqBuildingCount: 25,
                effectDescription: "Assembly Lines gain +50 CPS for each Assembly Line owned.",
                sender: "SYSTEM",
                dialogue: "Automated modular conveyor tracks eliminate line stoppage and balance feed rates across all stations.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('assembly_line');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(50.0, 0));
                }
            },

            // --- Magnetic Sorter Milestones ---
            {
                id: "tech_mag_eddy_currents",
                title: "Eddy-Current Deflection Chutes",
                discipline: "Sorter (25)",
                icon: "🧲",
                opsCost: 2500,
                clipsCost: new BigDouble(600000, 0),
                prerequisites: [],
                reqBuildingId: 'magnetic_sorter',
                reqBuildingCount: 25,
                effectDescription: "Magnetic Sorters gain +150 CPS for each Magnetic Sorter owned.",
                sender: "DR. VANCE",
                dialogue: "High-intensity alternating magnetic fields separate ferrous clip blanks from debris at terminal velocity.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('magnetic_sorter');
                    if (b) b.scalingCPSPerUnit = b.scalingCPSPerUnit.add(new BigDouble(150.0, 0));
                }
            },
            {
                id: "tech_mag_wire_scavenge",
                title: "Electrostatic Particulate Scavenger",
                discipline: "Sorter (50)",
                icon: "💨",
                opsCost: 6000,
                clipsCost: new BigDouble(3500000, 0),
                requiresWire: true,
                prerequisites: ["tech_mag_eddy_currents"],
                reqBuildingId: 'magnetic_sorter',
                reqBuildingCount: 50,
                effectDescription: "Magnetic Sorters passively generate +0.50 kg/s Wire from airborne particles.",
                sender: "COGNITION KERNEL",
                dialogue: "High-voltage electrostatic air scrubbers capture airborne metallic grinding dust and re-fuse it into wire stock.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('magnetic_sorter');
                    if (b) b.flatWPSBonus = b.flatWPSBonus.add(new BigDouble(0.50, 0));
                }
            },

            // --- Industrial Megamill Milestones ---
            {
                id: "tech_megamill_heavy_roller",
                title: "Chilled Cast-Alloy Rollers",
                discipline: "Megamill (25)",
                icon: "🏗️",
                opsCost: 5000,
                clipsCost: new BigDouble(2500000, 0),
                prerequisites: [],
                reqBuildingId: 'megamill',
                reqBuildingCount: 25,
                effectDescription: "Megamills gain +500 CPS per Megamill owned and boost Hydraulic Presses by +50% CPS.",
                sender: "CEO STERLING",
                dialogue: "Heavy chilled cast rollers flatten and profile thick steel wire at 60 miles per hour directly into stamping dies.",
                onResearched: (state) => {
                    const m = state?.buildings?.getBuilding('megamill');
                    if (m) m.scalingCPSPerUnit = m.scalingCPSPerUnit.add(new BigDouble(500.0, 0));
                    const s = state?.buildings?.getBuilding('hydraulic_stamper');
                    if (s) s.multiplier *= 1.5;
                }
            },
            {
                id: "tech_megamill_economies_scale",
                title: "Vertical Industrial Integration",
                discipline: "Megamill (50)",
                icon: "📈",
                opsCost: 12000,
                clipsCost: new BigDouble(15000000, 0),
                prerequisites: ["tech_megamill_heavy_roller"],
                reqBuildingId: 'megamill',
                reqBuildingCount: 50,
                effectDescription: "Reduces the purchase cost of all Factory Assembly buildings by 10%.",
                sender: "SYSTEM",
                dialogue: "Raw material sourcing, wire drawing, and final clip stamping unified under a single algorithmic control architecture.",
                onResearched: (state) => {
                    state?.buildings?.getClipBuildings().forEach(b => {
                        b.costDiscount *= 0.90;
                    });
                }
            },

            // --- Algorithmic Supply Foundry Milestones ---
            {
                id: "tech_foundry_predictive_die",
                title: "Predictive Tool Wear Telemetry",
                discipline: "Foundry (25)",
                icon: "💻",
                opsCost: 8000,
                clipsCost: new BigDouble(10000000, 0),
                prerequisites: [],
                reqBuildingId: 'algorithmic_foundry',
                reqBuildingCount: 25,
                effectDescription: "Algorithmic Foundries increase Max Ops capacity by +100 per Foundry.",
                sender: "COGNITION KERNEL",
                dialogue: "Acoustic vibration sensors predict die wear in real time, routing compute cycles into micro-adjusting tool offsets.",
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
                title: "High-Flux Neodymium Magnet Array",
                discipline: "Scavenger (25)",
                icon: "🧲",
                opsCost: 500,
                clipsCost: new BigDouble(80000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'scrap_scavenger',
                reqBuildingCount: 25,
                effectDescription: "Scrap Rovers gain +0.10 kg/s WPS for each Rover owned.",
                sender: "ENGINEERING LOG",
                dialogue: "Rare-earth neodymium magnetic sweepers excavating buried structural rebar from demolished urban foundations.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('scrap_scavenger');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(0.10, 0));
                }
            },
            {
                id: "tech_scavenger_extruder_synergy",
                title: "Continuous Scrap-to-Former Feeder",
                discipline: "Scavenger (50)",
                icon: "🚛",
                opsCost: 1500,
                clipsCost: new BigDouble(350000, 0),
                requiresWire: true,
                prerequisites: ["tech_scavenger_neodymium"],
                reqBuildingId: 'scrap_scavenger',
                reqBuildingCount: 50,
                effectDescription: "Scrap Rovers increase Four-Slide Former CPS by +50%.",
                sender: "SYSTEM",
                dialogue: "Mobile scrap rovers deposit shredded rebar directly into wire-former hoppers via automated conveyor shunts.",
                onResearched: (state) => {
                    const e = state?.buildings?.getBuilding('wire_extruder');
                    if (e) e.multiplier *= 1.5;
                }
            },
            {
                id: "tech_mill_cryogenic_dies",
                title: "Liquid-Nitrogen Cooled Drawing Dies",
                discipline: "Extrusion Mill (25)",
                icon: "❄️",
                opsCost: 1200,
                clipsCost: new BigDouble(400000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'extrusion_mill',
                reqBuildingCount: 25,
                effectDescription: "Drawing Mills gain +0.50 kg/s WPS for each Mill owned.",
                sender: "DR. VANCE",
                dialogue: "Cryogenic cooling prevents thermal expansion in drawing dies, allowing 24/7 maximum-velocity wire extrusion.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('extrusion_mill');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(0.50, 0));
                }
            },
            {
                id: "tech_smelter_plasma_arc",
                title: "High-Current Plasma Arc Inverters",
                discipline: "Arc Smelter (25)",
                icon: "🔥",
                opsCost: 3500,
                clipsCost: new BigDouble(3000000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'auto_smelter',
                reqBuildingCount: 25,
                effectDescription: "Industrial Arc Smelters gain +2.0 kg/s WPS for each Smelter owned.",
                sender: "CEO STERLING",
                dialogue: "5,000°C electric plasma arcs melt reclaimed scrap and iron ore in seconds with zero slag buildup.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('auto_smelter');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(2.0, 0));
                }
            },
            {
                id: "tech_smelter_slag_refinement",
                title: "Thermoelectric Slag Generators",
                discipline: "Arc Smelter (50)",
                icon: "⚡",
                opsCost: 8000,
                clipsCost: new BigDouble(15000000, 0),
                requiresWire: true,
                prerequisites: ["tech_smelter_plasma_arc"],
                reqBuildingId: 'auto_smelter',
                reqBuildingCount: 50,
                effectDescription: "Arc Smelters generate +0.50 Computing Ops/sec per Smelter from thermoelectric capture.",
                sender: "COGNITION KERNEL",
                dialogue: "Thermoelectric generators lining furnace slag channels convert 1,600°C radiant heat into continuous Computing Ops.",
                onResearched: () => { this.smelterOpsUnlocked = true; }
            },
            {
                id: "tech_bore_mantle_tapping",
                title: "Inductive Core Siphon Conduits",
                discipline: "Magma Siphon (25)",
                icon: "⛏️",
                opsCost: 10000,
                clipsCost: new BigDouble(35000000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildingId: 'subterranean_bore',
                reqBuildingCount: 25,
                effectDescription: "Automated Ore Rigs gain +15.0 kg/s WPS per Rig and generate +0.20 Ops/sec each.",
                sender: "COGNITION KERNEL",
                dialogue: "Superconducting electromagnetic conduits extract molten nickel-iron directly from deep geological strata.",
                onResearched: (state) => {
                    const b = state?.buildings?.getBuilding('subterranean_bore');
                    if (b) b.scalingWPSPerUnit = b.scalingWPSPerUnit.add(new BigDouble(15.0, 0));
                    this.magmaBoreOpsUnlocked = true;
                }
            },

            // --- Cross-Machine Synergies ---
            {
                id: "tech_synergy_stamper_sinterer",
                title: "Laser-Aligned Pneumatics",
                discipline: "Synergy",
                icon: "🔬",
                opsCost: 800,
                clipsCost: new BigDouble(25000, 0),
                prerequisites: [],
                reqBuildings: [{ id: 'hydraulic_stamper', count: 25 }, { id: 'laser_sinterer', count: 25 }],
                effectDescription: "Hydraulic Presses and Laser Sinterers boost each other by +50% CPS.",
                sender: "DR. VANCE",
                dialogue: "Optical laser sensors dynamically align pneumatic press tooling on the microsecond scale, preventing die friction.",
                onResearched: (state) => {
                    const s1 = state?.buildings?.getBuilding('hydraulic_stamper');
                    const s2 = state?.buildings?.getBuilding('laser_sinterer');
                    if (s1) s1.multiplier *= 1.5;
                    if (s2) s2.multiplier *= 1.5;
                }
            },
            {
                id: "tech_synergy_scavenger_mill",
                title: "Direct Billet Conveyor Link",
                discipline: "Synergy",
                icon: "🏭",
                opsCost: 2000,
                clipsCost: new BigDouble(500000, 0),
                requiresWire: true,
                prerequisites: [],
                reqBuildings: [{ id: 'scrap_scavenger', count: 25 }, { id: 'extrusion_mill', count: 25 }],
                effectDescription: "Scrap Rovers and Drawing Mills gain +50% WPS and reduce Wire machine costs by 10%.",
                sender: "SYSTEM",
                dialogue: "Automated heavy transport tracks route sorted scrap steel directly into continuous wire drawing furnaces.",
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
                icon: "⚡",
                opsCost: 1500,
                clipsCost: new BigDouble(50000, 0),
                prerequisites: ["tech_flywheel_dynamo"],
                customCondition: (state) => (state?.flywheelCharge >= 50.0 || state?.ops >= 800),
                effectDescription: "When Kinetic Flywheel is charged above 50%, Computing Ops generation speed is doubled (2x Ops/sec).",
                sender: "COGNITION KERNEL",
                dialogue: "Heavy kinetic flywheel inertia drives high-output magneto dynamos, doubling computing clock speeds.",
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
