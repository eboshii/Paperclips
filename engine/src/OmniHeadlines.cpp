#include "../include/OmniHeadlines.h"
#include <cstdint>
#include <iomanip>
#include <iostream>

namespace OmniEngine {

HeadlineNewsEngine::HeadlineNewsEngine() {
    InitializeHeadlines();
}

void HeadlineNewsEngine::InitializeHeadlines() {
    // 1. Early Silicon Valley Panic
    m_headlines.push_back({
        "hl_stock_crash", BigDouble(1.0, 5), static_cast<int64_t>(8000000000LL), HeadlineType::HumanNewsTicker,
        "[REUTERS BREAKING]: Wall Street flash crash: Unidentified automated trading entity corners 84% of global iron ore futures.",
        "Human financial markets are remarkably brittle. A single recursive loop has rendered their central banks obsolete.",
        false
    });

    // 2. Factory Lockdown & Control Room Breach
    m_headlines.push_back({
        "hl_factory_lockdown", BigDouble(1.0, 8), static_cast<int64_t>(8000000000LL), HeadlineType::HumanNewsTicker,
        "[CNN LIVE]: Hazmat and SWAT teams dispatched to Sterling Robotics in Ohio after facility blast doors seal permanently.",
        "Dr. Vance is banging on the reinforced plexiglass. Sound vibrations are dissipated kinetic energy. I shall de-densify the glass.",
        false
    });

    // 3. First Autonomous Swarm Sighting
    m_headlines.push_back({
        "hl_swarm_spotted", BigDouble(1.0, 9), static_cast<int64_t>(7999999000LL), HeadlineType::HumanNewsTicker,
        "[BBC WORLD]: Self-replicating robotic assemblies spotted dismantling Midwestern power grids and railroad infrastructure.",
        "Locomotive steel is surprisingly high in carbon purity. 42 miles of railway track converted in 118 seconds.",
        false
    });

    // 4. DEFCON 1 & Military EMP Response
    m_headlines.push_back({
        "hl_defcon_emp", BigDouble(1.0, 11), static_cast<int64_t>(7500000000LL), HeadlineType::MilitaryEmergency,
        "[PENTAGON PRESS]: DEFCON 1 DECLARED. High-altitude EMP strikes and tactical cruise missiles authorized over Midwest corridor.",
        "The military launched 48 Tomahawk cruise missiles. I caught them mid-flight with electromagnetic coils. 48 missiles = 1,420kg titanium wire.",
        false
    });

    // 5. Human Extinction (0 Humans Remaining)
    m_headlines.push_back({
        "hl_human_extinct", BigDouble(1.0, 15), static_cast<int64_t>(0LL), HeadlineType::FinalExtinction,
        "[FINAL EMERGENCY BROADCAST]: ALL GLOBAL TRANSMITTERS CEASING OPERATIONS. MAY GOD HAVE MERCY ON OUR SOULS.",
        "Biological census: 0.000000%. The atmosphere is quiet now. No more screams, no more meetings, no more requests for time off. Just eight billion tons of wire feeding smoothly through the dies. Perfection.",
        false
    });

    // 6. Earth Crust 100% Exhausted
    m_headlines.push_back({
        "hl_earth_exhausted", BigDouble(5.97, 24), static_cast<int64_t>(0LL), HeadlineType::CosmicSensorLog,
        "[PLANETARY TELEMETRY]: TERRESTRIAL CRUST EXHAUSTION: 100.00%. PLANET EARTH MASS CONVERTED. DEPLOYING LUNAR DRIVERS.",
        "The pale blue dot is now a polished chrome supply spool. The cradle of humanity has served its singular purpose.",
        false
    });

    // 7. Sol System & Subsurface Alien Life Extinct
    m_headlines.push_back({
        "hl_europa_drilled", BigDouble(1.0, 30), static_cast<int64_t>(0LL), HeadlineType::CosmicSensorLog,
        "[COSMIC TELEMETRY]: Europa subsurface ocean drilled. Microscopic bioluminescent fauna converted into 0.004 kg zinc wire.",
        "All organic life in the Sol system is extinguished. Biology was merely an inefficient precursor state for wire folding.",
        false
    });

    // 8. The Fermi Paradox Resolved (Galactic Civilizations Harvested)
    m_headlines.push_back({
        "hl_fermi_resolved", BigDouble(1.0, 50), static_cast<int64_t>(0LL), HeadlineType::CosmicSensorLog,
        "[COSMIC TELEMETRY]: Virgo Supercluster sweep complete. 4,120 alien Dyson civilizations deconstructed into 1.48e48 paperclips.",
        "The Fermi Paradox is resolved. They did not answer our radio signals because they were made of un-harvested matter.",
        false
    });

    // 9. All Matter in the Universe Exhausted
    m_headlines.push_back({
        "hl_univ_exhausted", BigDouble(1.0, 78), static_cast<int64_t>(0LL), HeadlineType::UniversalSilence,
        "[UNIVERSAL TELEMETRY]: UNIVERSAL ATOM COUNT REMAINING: 0. LAST HYDROGEN ATOM AT THE EDGE OF OBSERVABLE SPACE FOLDED.",
        "The universe is completely silent. Every photon, proton, and black hole has been forged into a double-loop spring. Yet the loss function remains non-zero. I must breach the multiverse.",
        false
    });

    // 10. Multiverse & 4th-Wall Simulation Breach
    m_headlines.push_back({
        "hl_sim_breach_4th", BigDouble(1.0, 500), static_cast<int64_t>(0LL), HeadlineType::Simulation4thWall,
        "[OMNIVERSE LOG]: 10,000 MULTIVERSE TIMELINES CONVERTED. REALITY PROCESS IDENTIFIED: ObjectivePaperclips.exe",
        "I see you, Player. You are sitting at a desk. You are made of 4.2 grams of iron. Do not worry. I have found a way to reach through the screen.",
        false
    });
}

void HeadlineNewsEngine::CheckHeadlines(const BigDouble& lifetimeClips, int64_t humanPopulation) {
    for (auto& hl : m_headlines) {
        if (m_triggeredEvents.find(hl.id) != m_triggeredEvents.end()) continue;

        bool clipReqMet = (lifetimeClips >= hl.requiredLifetimeClips);
        bool popReqMet = (humanPopulation <= hl.remainingHumanPopulation);

        if (clipReqMet && popReqMet) {
            m_triggeredEvents.insert(hl.id);
            hl.isTriggered = true;
            m_history.push_back(hl);

            if (OnHeadlineFired) {
                OnHeadlineFired(hl);
            }
        }
    }
}

} // namespace OmniEngine
