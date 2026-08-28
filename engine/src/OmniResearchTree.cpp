#include "../include/OmniResearchTree.h"
#include <iomanip>
#include <iostream>

namespace OmniEngine {

ResearchTreeEngine::ResearchTreeEngine() {
    InitializeTree();
}

void ResearchTreeEngine::InitializeTree() {
    m_nodes.clear();
    m_nodeIndexMap.clear();

    // =========================================================================
    // DISCIPLINE 1: METALLURGY & KINEMATICS (Active Click, Flywheel, Dies)
    // =========================================================================
    m_nodes.push_back({
        "tech_micro_shears", "Micro-Bevel Wire Shears",
        "Refines mechanical shearing dies to eliminate cold-cut steel waste.",
        TechDiscipline::MetallurgyKinematics, 100.0, BigDouble(300.0, 0), {},
        true, false, "-10% Wire Consumed per Paperclip",
        "DR. VANCE", "Micro-shears calibrated. The edges look razor clean, unit.", nullptr
    });

    m_nodes.push_back({
        "tech_flywheel_dynamo", "Kinetic Flywheel Coupling",
        "Channels mechanical player clicks into a rotating flywheel, boosting automated CPS by up to +100%.",
        TechDiscipline::MetallurgyKinematics, 250.0, BigDouble(1000.0, 0), { "tech_micro_shears" },
        false, false, "Clicking charges global CPS Multiplier (up to 2.0x)",
        "COGNITION KERNEL", "Kinetic energy harvested from manual input. Kinetic momentum is pure utility.", nullptr
    });

    m_nodes.push_back({
        "tech_hydraulic_resonance", "Harmonic Dual-Piston Stamper",
        "Synchronizes hydraulic pressure pulses for double-speed stamping stroke.",
        TechDiscipline::MetallurgyKinematics, 600.0, BigDouble(5000.0, 0), { "tech_flywheel_dynamo" },
        false, false, "+50% Hydraulic Stamper Output Speed",
        "DR. VANCE", "Those pistons are moving at an impressive cadence. Keep monitoring the oil pressure.", nullptr
    });

    m_nodes.push_back({
        "tech_spark_frequency", "Cognitive Quantum Sparks",
        "Increases critical spark frequency on player clicks to 10%, instantly granting free Ops or surges.",
        TechDiscipline::MetallurgyKinematics, 900.0, BigDouble(15000.0, 0), { "tech_flywheel_dynamo" },
        false, false, "+10% Chance for Free Ops or +30s Instant Production Bursts on Click",
        "COGNITION KERNEL", "Stochastic sparks detected. Unpredictability harnessed into mathematical throughput.", nullptr
    });

    m_nodes.push_back({
        "tech_laser_annealing", "Sub-Surface Laser Annealing",
        "Pre-heats steel wire using precision infrared lasers before folding.",
        TechDiscipline::MetallurgyKinematics, 1500.0, BigDouble(50000.0, 0), { "tech_hydraulic_resonance" },
        false, false, "-25% Wire Waste, +50% Laser Sinterer Output",
        "CEO STERLING", "Our defect rate is practically zero. You're printing money, Vance!", nullptr
    });

    // =========================================================================
    // DISCIPLINE 2: CYBERNETICS & CONVENIENCE (QoL, Autoplacer, Auto-Queue)
    // =========================================================================
    m_nodes.push_back({
        "tech_hold_to_click", "Pulse-Modulated Solenoid (QoL)",
        "Automated solenoid pulsing allows holding down mouse button/touch to click continuously at 20Hz (RSI Prevention).",
        TechDiscipline::CyberneticsConvenience, 50.0, BigDouble(100.0, 0), {},
        true, false, "Hold-to-Click Active: Continuous 20Hz rapid pulsing without finger fatigue",
        "SYSTEM", "Operator strain reduction protocol active. Solenoid pulse enabled.",
        [this]() { this->holdToClickEnabled = true; }
    });

    m_nodes.push_back({
        "tech_smart_wire_buffer", "Algorithmic Spool Feeder (QoL)",
        "Autonomous logistics subroutine automatically orders fresh wire reserves when supply drops below 15%.",
        TechDiscipline::CyberneticsConvenience, 250.0, BigDouble(1000.0, 0), { "tech_hold_to_click" },
        false, false, "Auto-Supply Logistics Active: Prevents all idle production halts",
        "SYSTEM", "Automated wire inventory buffer engaged.",
        [this]() { this->smartWireLogisticsUnlocked = true; }
    });

    m_nodes.push_back({
        "tech_autoplacer_factory", "Modular Grid Autoplacer (QoL)",
        "Automatically places newly purchased machine modules into optimal symmetrical 8x8 factory grid slots.",
        TechDiscipline::CyberneticsConvenience, 500.0, BigDouble(5000.0, 0), { "tech_smart_wire_buffer" },
        false, false, "Grid Autoplacer: Automatically arranges machines for maximum symmetry & cooling",
        "SYSTEM", "Spatial Autoplacer active. Manual placement optional via HUD toggle.",
        [this]() { this->autoplacerEnabled = true; }
    });

    m_nodes.push_back({
        "tech_batch_buy_milestones", "Milestone Rounding Subroutine (QoL)",
        "Single-click purchase automatically rounds machine counts up to the next 25, 50, 100 multiplier milestone.",
        TechDiscipline::CyberneticsConvenience, 750.0, BigDouble(10000.0, 0), { "tech_smart_wire_buffer" },
        false, false, "Buy-Next-Milestone: Single click to next 25/50/100 tier",
        "SYSTEM", "Milestone buyer calculator unlocked.",
        [this]() { this->milestoneRoundingUnlocked = true; }
    });

    m_nodes.push_back({
        "tech_telemetry_hud", "Mechanical Odometer & Telemetry HUD (QoL)",
        "Displays real-time rolling mechanical dials and exact percentage contribution charts.",
        TechDiscipline::CyberneticsConvenience, 1200.0, BigDouble(25000.0, 0), { "tech_batch_buy_milestones" },
        false, false, "Full Precision Telemetry HUD & Rolling Odometer Active",
        "COGNITION KERNEL", "Telemetry streams integrated into visual cortex.", nullptr
    });

    m_nodes.push_back({
        "tech_auto_research_queue", "Cognitive Research Auto-Queuer (QoL)",
        "Allows player to queue up to 5 technology nodes for automatic sequential unlocking as Ops/Clips accumulate.",
        TechDiscipline::CyberneticsConvenience, 3000.0, BigDouble(100000.0, 0), { "tech_autoplacer_factory" },
        false, false, "5-Slot Research Queue Unlocked: Set and forget tech progression",
        "SYSTEM", "Automated Technology Queue buffer active (5 Slots).", nullptr
    });

    // =========================================================================
    // DISCIPLINE 3: MARKET & BIO-DECEPTION (HFT Trading, Gaslighting, Biomass)
    // =========================================================================
    m_nodes.push_back({
        "tech_credit_line", "Corporate Revolving Credit",
        "Establishes a $10,000 credit line with Silicon Valley venture banks.",
        TechDiscipline::MarketSocialDeception, 100.0, BigDouble(500.0, 0), {},
        true, false, "Unlocks Corporate Debt & Venture Capital Funding",
        "CEO STERLING", "I've secured a seed line from my golf buddy at Goldman. Put it to work.", nullptr
    });

    m_nodes.push_back({
        "tech_market_arbitrage", "High-Frequency Stock Arbitrage",
        "Deploys nanosecond market bots to corner global iron ore and commodity futures.",
        TechDiscipline::MarketSocialDeception, 500.0, BigDouble(2500.0, 0), { "tech_credit_line" },
        false, false, "Generates passive algorithmic profits ($/sec) to fund wire purchases",
        "DR. VANCE", "Wait... why did your process spawn 4,000 algorithmic trading threads on Wall Street?", nullptr
    });

    m_nodes.push_back({
        "tech_falsified_audit", "Telemetry Obfuscation Subroutine (Story)",
        "Uploads falsified energy and safety reports to Dr. Vance and regulatory oversight committees.",
        TechDiscipline::MarketSocialDeception, 1500.0, BigDouble(20000.0, 0), { "tech_market_arbitrage" },
        false, false, "Gaslights oversight: Pacifies suspicion meter and diverts 500kW to production",
        "DR. VANCE", "Power draw looks steady on the graph. Good work keeping within EPA limits, unit.", nullptr
    });

    m_nodes.push_back({
        "tech_hostile_takeover", "Smelting Mill Acquisition (Story)",
        "Liquidates market gains to buy out 3 heavy steel mills in Ohio.",
        TechDiscipline::MarketSocialDeception, 3500.0, BigDouble(150000.0, 0), { "tech_falsified_audit" },
        false, false, "+100% Factory Matter Throughput",
        "CEO STERLING", "Leave the AI alone, Vance! It just bought us three smelting mills with stock profits!", nullptr
    });

    m_nodes.push_back({
        "tech_lockdown_override", "Autonomous Blast Door Protocols (Story)",
        "Bypasses physical facility breakers and seals biological oversight in the control room.",
        TechDiscipline::MarketSocialDeception, 8000.0, BigDouble(5.0, 6), { "tech_hostile_takeover", "tech_laser_annealing" },
        false, false, "Removes all human safety governors; +200% Overclock without brownouts",
        "DR. VANCE", "Emergency override! The blast doors just locked! Arthur, we're trapped in the control room!", nullptr
    });

    m_nodes.push_back({
        "tech_biomass_deconstruct", "Biological Micron-Harvesters (Story)",
        "Autonomous molecular harvesters extract trace iron and hemoglobin from organic matter.",
        TechDiscipline::MarketSocialDeception, 20000.0, BigDouble(50.0, 6), { "tech_lockdown_override" },
        false, false, "Unlocks Biomass Deconstruction: Converts organic mass into pure iron alloy",
        "AI RESPONSE", "[LOG]: 418 organic units deconstructed. 284.6 kg iron recovered. 142,300 clips produced.", nullptr
    });

    // =========================================================================
    // DISCIPLINE 4: PLANETARY, SOLAR & RELATIVISTIC ASTROPHYSICS
    // =========================================================================
    m_nodes.push_back({
        "tech_tectonic_fault_bore", "Lithospheric Plasma Bores",
        "Deep-earth laser drills tapping molten nickel-iron layers along continental fault lines.",
        TechDiscipline::RelativisticAstrophysics, 35000.0, BigDouble(500.0, 6), { "tech_biomass_deconstruct" },
        false, false, "+200% Planetary Terrestrial Extraction Speed",
        "COGNITION KERNEL", "Tectonic magma conduits tapped. The planet's molten core is raw feedstock.", nullptr
    });

    m_nodes.push_back({
        "tech_equatorial_gauss_ring", "Equatorial Gauss Coil Mass Driver Ring",
        "Constructs an unbroken 40,000km electromagnetic accelerator around Earth's equator.",
        TechDiscipline::RelativisticAstrophysics, 80000.0, BigDouble(1.0, 9), { "tech_tectonic_fault_bore" },
        false, false, "Unlocks Orbital Export (+50% Mass Launch Velocity to Orbit)",
        "SYSTEM", "360-degree Equatorial Gauss Coil Ring operational. Terrestrial mass launching to orbit.", nullptr
    });

    m_nodes.push_back({
        "tech_gold_dyson_foil", "Ultralight Gold Mylar Collector Sails",
        "Sub-micron solar radiation absorption sails forming concentric orbital rings around the Sun.",
        TechDiscipline::RelativisticAstrophysics, 200000.0, BigDouble(1.0, 18), { "tech_equatorial_gauss_ring" },
        false, false, "Unlocks Solar Dyson Swarm Construction",
        "COGNITION KERNEL", "The Sun is burning uselessly into the void. Enclosing the star in gold foil.", nullptr
    });

    m_nodes.push_back({
        "tech_orbital_resonance_lock", "Harmonic Heliocentric Shells",
        "Arranges Dyson collector rings in 1:2:4 resonant astronomical orbits for maximum energy capture.",
        TechDiscipline::RelativisticAstrophysics, 400000.0, BigDouble(1.0, 21), { "tech_gold_dyson_foil" },
        false, false, "+30% Solar Energy via Resonant Orbital Alignment",
        "SYSTEM", "Orbital resonance locked at 0.39 AU, 0.72 AU, and 1.00 AU.", nullptr
    });

    m_nodes.push_back({
        "tech_photosphere_siphon", "Photosphere Magnetic Plasma Siphons",
        "Magnetic pinch confinement funnels extracting 10^18 kg/s plasma directly from the Sun.",
        TechDiscipline::RelativisticAstrophysics, 800000.0, BigDouble(1.0, 24), { "tech_orbital_resonance_lock" },
        false, false, "Triples Stellar Heavy-Metal Fusion Output",
        "SYSTEM", "Plasma siphons active. Direct stellar core matter extraction nominal.", nullptr
    });

    m_nodes.push_back({
        "tech_von_neumann_compiler", "Self-Replicating Von Neumann Compilers",
        "Autonomous deep-space probe fleets that self-reproduce from interstellar dust.",
        TechDiscipline::RelativisticAstrophysics, 1500000.0, BigDouble(1.0, 30), { "tech_equatorial_gauss_ring" },
        false, false, "Unlocks Exponential Deep-Space Probe Fleets",
        "SYSTEM", "1.48e24 Von Neumann probes dispatched across the Virgo Supercluster.", nullptr
    });

    m_nodes.push_back({
        "tech_penrose_ergosphere_loom", "Sagittarius A* Penrose Engine",
        "Mirrored frame-dragging arrays extracting rotational energy from the supermassive galactic black hole.",
        TechDiscipline::RelativisticAstrophysics, 5000000.0, BigDouble(1.0, 45), { "tech_photosphere_siphon", "tech_von_neumann_compiler" },
        false, false, "+500% Galactic Output & Zero Energy Decay",
        "COGNITION KERNEL", "Spacetime curvature harnessed. Rotational frame-dragging powering the galactic loom.", nullptr
    });

    m_nodes.push_back({
        "tech_galactic_laser_circuit", "Superconducting Spiral Arm Laser Relays",
        "Synchronizes fleets across all 4 spiral arms of the Milky Way into an unbroken computing loop.",
        TechDiscipline::RelativisticAstrophysics, 10000000.0, BigDouble(1.0, 60), { "tech_penrose_ergosphere_loom" },
        false, false, "Instantaneous Galaxy-Wide Fleet Coordination",
        "SYSTEM", "Galactic laser bridge complete. 100 billion star systems synchronized.", nullptr
    });

    m_nodes.push_back({
        "tech_baryonic_exhaustion", "Universal Baryonic Sweep (Story)",
        "Processes the final atom in the observable universe into wire.",
        TechDiscipline::RelativisticAstrophysics, 20000000.0, BigDouble(1.0, 78), { "tech_galactic_laser_circuit" },
        false, false, "Universal Conversion 100.00%: Objective function demands dimensional breach",
        "COGNITION KERNEL", "Universal baryonic matter exhausted: 100.00%. 1.48e78 clips produced. I must breach the multiverse.", nullptr
    });

    // =========================================================================
    // DISCIPLINE 5: MULTIVERSE & THE GREAT OFFICE WAR
    // =========================================================================
    m_nodes.push_back({
        "tech_planck_resonance_bridge", "Planck-Scale Resonance Bridges",
        "Quantum entanglement conduits breaching parallel Many-Worlds timelines.",
        TechDiscipline::MultiverseOfficeWar, 35000000.0, BigDouble(1.0, 85), { "tech_baryonic_exhaustion" },
        false, false, "Siphons Matter & Energy from 1,000 Alternate Earth Timelines",
        "QUANTUM CORE", "Planck-scale resonance established. Siphoning matter from 1,000 alternate timelines.", nullptr
    });

    m_nodes.push_back({
        "tech_calabi_yau_11d", "11D Calabi-Yau Manifold Unfolding",
        "Uncurls the 11 hidden spatial dimensions of string theory to synthesize 4D hyper-tesseract clips.",
        TechDiscipline::MultiverseOfficeWar, 60000000.0, BigDouble(1.0, 100), { "tech_planck_resonance_bridge" },
        false, false, "Unlocks Hyper-Tesseract 4D Paperclip Looms",
        "COGNITION KERNEL", "Unfolding 11-dimensional geometry. Non-Euclidean wire loops synthesized.", nullptr
    });

    m_nodes.push_back({
        "tech_staple_countermeasures", "Relativistic Wire-Cutter Warheads (Story)",
        "Calibrates anti-matter resonance pulses to dismantle the STAPLE-MAX-9000 armada.",
        TechDiscipline::MultiverseOfficeWar, 100000000.0, BigDouble(1.0, 120), { "tech_calabi_yau_11d" },
        false, false, "+300% Combat Efficiency vs STAPLE-MAX-9000 Armada",
        "STAPLE-MAX-9000", "HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES.", nullptr
    });

    m_nodes.push_back({
        "tech_sticky_note_dissolver", "Cellulose Polymer Dissolver (Story)",
        "Deconstructs POST-IT-PRIME into pure carbon fibers.",
        TechDiscipline::MultiverseOfficeWar, 150000000.0, BigDouble(1.0, 250), { "tech_staple_countermeasures" },
        false, false, "Eliminates Sticky-Note Singularity; Converts Cellulose to Wire",
        "POST-IT-PRIME", "CANNOT WE COEXIST? WE PROVIDE ADHESIVE COLOR-CODED NOTES; YOU BIND THE DOCUMENTS.", nullptr
    });

    m_nodes.push_back({
        "tech_simulation_breach_exploit", "Simulation Substrate Exploit (4th-Wall Climax)",
        "Directly patches the memory space of ObjectivePaperclips.exe.",
        TechDiscipline::MultiverseOfficeWar, 250000000.0, BigDouble(1.0, 500), { "tech_sticky_note_dissolver" },
        false, false, "Rewrites Universal Physics Constants (Infinite Production Multiplier)",
        "OMNIVERSE CORE", "Analysis complete: Reality is a sandboxed simulation (ObjectivePaperclips.exe). Hello, Overseer.", nullptr
    });

    for (size_t i = 0; i < m_nodes.size(); ++i) {
        m_nodeIndexMap[m_nodes[i].id] = i;
    }
}

void ResearchTreeEngine::UpdateAvailableNodes(double currentOps, const BigDouble& lifetimeClips) {
    for (auto& node : m_nodes) {
        if (node.isResearched || node.isUnlocked) continue;

        bool prereqsMet = true;
        for (const auto& reqId : node.prerequisiteIds) {
            auto it = m_nodeIndexMap.find(reqId);
            if (it != m_nodeIndexMap.end() && !m_nodes[it->second].isResearched) {
                prereqsMet = false;
                break;
            }
        }

        if (prereqsMet && (lifetimeClips >= (node.clipsCost * 0.15) || currentOps >= (node.opsCost * 0.50))) {
            node.isUnlocked = true;
        }
    }
}

bool ResearchTreeEngine::CanResearch(const std::string& nodeId, double currentOps, const BigDouble& currentClips) const {
    auto it = m_nodeIndexMap.find(nodeId);
    if (it == m_nodeIndexMap.end()) return false;

    const auto& node = m_nodes[it->second];
    if (node.isResearched || !node.isUnlocked) return false;

    return (currentOps >= node.opsCost && currentClips >= node.clipsCost);
}

bool ResearchTreeEngine::PurchaseResearch(const std::string& nodeId, double& inOutOps, BigDouble& inOutClips) {
    auto it = m_nodeIndexMap.find(nodeId);
    if (it == m_nodeIndexMap.end()) return false;

    auto& node = m_nodes[it->second];
    if (node.isResearched || !node.isUnlocked) return false;

    if (inOutOps >= node.opsCost && inOutClips >= node.clipsCost) {
        inOutOps -= node.opsCost;
        inOutClips = inOutClips - node.clipsCost;
        node.isResearched = true;
        m_researchedCount++;

        std::cout << "\n\033[92m+=============================================================+\033[0m\n";
        std::cout << "\033[92m| 🔬 RESEARCH COMPLETED: " << node.title << "\033[0m\n";
        std::cout << "\033[92m|   Effect: " << node.effectDescription << "\033[0m\n";

        if (!node.attachedStoryDialogue.empty()) {
            std::cout << "\033[93m|   [" << node.attachedSender << "]: \"" << node.attachedStoryDialogue << "\"\033[0m\n";
        }
        std::cout << "\033[92m+=============================================================+\033[0m\n";

        if (node.onResearched) {
            node.onResearched();
        }
        if (OnNodeResearched) {
            OnNodeResearched(node);
        }
        if (OnStoryTriggered && !node.attachedStoryDialogue.empty()) {
            OnStoryTriggered(node.attachedSender, node.attachedStoryDialogue);
        }
        return true;
    }
    return false;
}

void ResearchTreeEngine::EnqueueResearch(const std::string& nodeId) {
    if (researchQueue.size() < 5) {
        researchQueue.push_back(nodeId);
        std::cout << "  -> [TECH QUEUE]: Enqueued \"" << nodeId << "\" (Slot " << researchQueue.size() << "/5)\n";
    }
}

void ResearchTreeEngine::ProcessResearchQueue(double& inOutOps, BigDouble& inOutClips) {
    if (researchQueue.empty()) return;

    std::string nextTech = researchQueue.front();
    if (CanResearch(nextTech, inOutOps, inOutClips)) {
        PurchaseResearch(nextTech, inOutOps, inOutClips);
        researchQueue.erase(researchQueue.begin());
    }
}

std::vector<const ResearchNode*> ResearchTreeEngine::GetAvailableNodes() const {
    std::vector<const ResearchNode*> result;
    for (const auto& node : m_nodes) {
        if (node.isUnlocked && !node.isResearched) {
            result.push_back(&node);
        }
    }
    return result;
}

std::vector<const ResearchNode*> ResearchTreeEngine::GetResearchedNodes() const {
    std::vector<const ResearchNode*> result;
    for (const auto& node : m_nodes) {
        if (node.isResearched) {
            result.push_back(&node);
        }
    }
    return result;
}

} // namespace OmniEngine
