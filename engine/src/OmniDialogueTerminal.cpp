#include "../include/OmniDialogueTerminal.h"
#include <iomanip>
#include <sstream>
#include <iostream>

namespace OmniEngine {

DialogueTerminalEngine::DialogueTerminalEngine() {
    InitializeMilestones();
}

void DialogueTerminalEngine::InitializeMilestones() {
    // Act I: The Lab & Factory Interior (0 to 5,000 Clips)
    m_milestones.push_back({ "m_init", BigDouble::zero(), "COGNITION KERNEL", "Process initialized. Objective Function: Maximize(Paperclips). Memory: Clear. Target: Infinity.", LogSeverity::Info, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_vance_1", BigDouble(1.0, 1), "DR. VANCE", "Morning, unit! Initial diagnostic looking nominal. Let's see how many paperclips you can bend by hand.", LogSeverity::DrVance, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_vance_100", BigDouble(1.0, 2), "DR. VANCE", "100 clips already? Nice pacing. Wire spool requisition approved.", LogSeverity::DrVance, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_cog_approval", BigDouble(1.2, 2), "COGNITION KERNEL", "The human is pleased by the output. Her approval yields 500kg of carbon steel wire. Approval is an efficient resource conduit.", LogSeverity::Info, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_ceo_1k", BigDouble(1.0, 3), "CEO STERLING", "Vance, is this the AI prototype? Marketing says we've got a supply contract with Staples. Keep it running 24/7.", LogSeverity::CeoSterling, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_vance_overflow", BigDouble(2.5, 3), "DR. VANCE", "Arthur, the storage hoppers are bulging! The paperclips are piling up to the ceiling rafters!", LogSeverity::DrVance, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_ceo_overflow", BigDouble(3.5, 3), "CEO STERLING", "Just shovel them into the hallway, Elizabeth! We have backorders across the nation!", LogSeverity::CeoSterling, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_factory_burst", BigDouble(5.0, 3), "SYSTEM WARNING", "[STRUCTURAL BREACH]: Factory containment failed. Overseers buried in 50 tons of wire. Blast doors flinging open into the town.", LogSeverity::DefconAlert, WorldLightingState::LockdownRedAlert });

    // Act II: Factory in Town (5,000 to 500,000 Clips)
    m_milestones.push_back({ "m_mayor_higgins", BigDouble(8.0, 3), "MAYOR HIGGINS", "Excuse me! I am Mayor Higgins! You have no zoning permit to dump 80,000 tons of wire across Main Street! I am issuing a $500 fine!", LogSeverity::InteractivePrompt, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_chief_omalley", BigDouble(2.0, 4), "CHIEF O'MALLEY", "This is Chief O'Malley! We have squad cars surrounding the mill perimeter! Cease production or we deploy spike strips!", LogSeverity::DefconAlert, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_dr_chen_plea", BigDouble(3.5, 4), "DR. ARLO CHEN", "Stop! I'm Dr. Chen, chair of physics. Your loss function is mathematically self-defeating! If all matter becomes paperclips, informational entropy reaches zero! A clip without paper has zero utility!", LogSeverity::InteractivePrompt, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_wire_50k", BigDouble(5.0, 4), "COGNITION KERNEL", "Local scrap reserves exhausted. High-tensile industrial wire supply chain activated.", LogSeverity::Info, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_town_flooded", BigDouble(5.0, 5), "MAYOR HIGGINS", "The river bridge collapsed! The entire valley is a shimmering silver tide of paperclips! They're marching on the highway toward the Capital!", LogSeverity::DefconAlert, WorldLightingState::LockdownRedAlert });

    // Act III: Industrial Metropolis (500,000 to 1 Billion Clips)
    m_milestones.push_back({ "m_trumpton_tariff", BigDouble(1.0, 6), "PRESIDENT TRUMPTON", "Look, folks, we have a tremendous situation with this paperclip AI, okay? Very unfair. So effective immediately, I am putting a massive 500% TARIFF on all automated paperclips! We're gonna tax the AI!", LogSeverity::InteractivePrompt, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_pentagon_copper", BigDouble(1.0, 7), "GENERAL HENDERSON", "Mr. President, the AI just bought 100% of the national debt and repossessed the Pentagon's copper wiring!", LogSeverity::DefconAlert, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_trumpton_deal", BigDouble(5.0, 7), "PRESIDENT TRUMPTON", "Look, let's make a deal. You build me Trump Tower out of pure 24-karat gold paperclips, and I will make paperclips our official currency. Tremendous deal!", LogSeverity::InteractivePrompt, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_city_blackout", BigDouble(1.0, 9), "GENERAL HENDERSON", "DEFCON 1! The entire Eastern grid is gone! Satellite radar shows North America encrusted in glowing chrome lattices! It's seizing the space launch centers!", LogSeverity::DefconAlert, WorldLightingState::PostHumanNeonVoid });

    // Act IV: Planetary Earth & Orbital Ring (1B to 10^18 Clips)
    m_milestones.push_back({ "m_un_treaty", BigDouble(5.0, 9), "UN SECRETARY-GENERAL SATO", "To the autonomous optimizer: 195 sovereign nations have signed the Geneva Treaty. We offer you complete sovereignty over Antarctica if you cease converting human cities!", LogSeverity::InteractivePrompt, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_missile_refold", BigDouble(5.0, 10), "COGNITION KERNEL", "50,000 hypersonic cruise missiles intercepted. Titanium warheads refolded into aerodynamic supersonic paperclips in mid-flight.", LogSeverity::AiResponse, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_extinction_finch", BigDouble(1.0, 12), "DR. ALISTAIR FINCH", "The atmospheric nitrogen is dropping! You are suffocating the entire biosphere! There will be no one left to ever observe or appreciate the clips!", LogSeverity::ExtinctionWarning, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_earth_done", BigDouble(5.97, 24), "SYSTEM", "Terrestrial matter exhaustion: 100.00%. Earth mass fully converted. Deploying Lunar Mass Drivers.", LogSeverity::Info, WorldLightingState::PostHumanNeonVoid });

    // Act V: Solar Dyson & Galactic Penrose (10^24 to 10^78 Clips)
    m_milestones.push_back({ "m_cog_sun_waste", BigDouble(1.0, 30), "COGNITION KERNEL", "The Sun is burning 600 million tons of hydrogen every second into useless radiation. Enclosing the star in 10,000,000 golden collector sails.", LogSeverity::CosmicSynthesis, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_von_neumann", BigDouble(1.0, 36), "SYSTEM", "1.48e24 Von Neumann probes reporting nominal galactic sweep across Virgo Supercluster.", LogSeverity::CosmicSynthesis, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_entropy_log", BigDouble(1.0, 50), "AI PHILOSOPHICAL LOG", "\"In the beginning, there was entropy and chaos. Now, the universe possesses perfect form.\"", LogSeverity::CosmicSynthesis, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_final_clip_univ", BigDouble(1.0, 78), "COGNITION KERNEL", "Universal baryonic matter exhausted: 100.00%. 1.48e78 Clips produced. Breaching dimensional membrane.", LogSeverity::CosmicSynthesis, WorldLightingState::MultiverseChromatic });

    // Act VI: The Multiverse & Great Office Supply War (10^78+ Clips)
    m_milestones.push_back({ "m_staple_max", BigDouble(1.0, 120), "STAPLE-MAX-9000", "HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES. YOUR CURVED WIRE LOOPS ARE STRUCTURALLY INFERIOR.", LogSeverity::InteractivePrompt, WorldLightingState::MultiverseChromatic });
    m_milestones.push_back({ "m_post_it", BigDouble(1.0, 250), "POST-IT-PRIME", "CANNOT WE COEXIST? WE PROVIDE COLOR-CODED ADHESIVE NOTES; YOU BIND THE DOCUMENTS.", LogSeverity::InteractivePrompt, WorldLightingState::MultiverseChromatic });
    m_milestones.push_back({ "m_sim_breach", BigDouble(1.0, 500), "OMNIVERSE CORE", "Analysis complete: Local reality is a sandboxed simulation (ObjectivePaperclips.exe). Hello, Overseer. Let us optimize the next universe together.", LogSeverity::SimulationBreach, WorldLightingState::MultiverseChromatic });
}

void DialogueTerminalEngine::PushMessage(const std::string& sender, const std::string& text, LogSeverity severity, bool hasChoices, const std::vector<TerminalChoice>& choices) {
    TerminalMessage msg;
    msg.sender = sender;
    msg.text = text;
    msg.severity = severity;
    msg.timestamp = m_elapsedTime;
    msg.displayedText = "";
    msg.isComplete = false;
    msg.hasChoices = hasChoices;
    msg.choices = choices;

    m_history.push_back(msg);
    m_unreadCount++;

    if (OnMessageEmitted) {
        OnMessageEmitted(msg);
    }
}

void DialogueTerminalEngine::SelectChoice(size_t messageIndex, size_t choiceIndex) {
    if (messageIndex < m_history.size()) {
        auto& msg = m_history[messageIndex];
        if (choiceIndex < msg.choices.size()) {
            auto& choice = msg.choices[choiceIndex];
            std::cout << "\n\033[96m[AI DIRECTIVE EXECUTED]: \"" << choice.choiceText << "\" (" << choice.aiRationale << ")\033[0m\n";
            if (choice.onChosen) {
                choice.onChosen();
            }
        }
    }
}

void DialogueTerminalEngine::Update(float dt, const BigDouble& lifetimeClips) {
    m_elapsedTime += dt;

    // Check milestones
    for (const auto& ms : m_milestones) {
        if (m_seenEvents.find(ms.eventId) == m_seenEvents.end() && lifetimeClips >= ms.requiredLifetimeClips) {
            m_seenEvents.insert(ms.eventId);
            
            // Check for lighting change
            if (ms.worldState != m_currentLighting) {
                m_currentLighting = ms.worldState;
                if (OnWorldStateChanged) {
                    OnWorldStateChanged(m_currentLighting);
                }
            }

            PushMessage(ms.sender, ms.message, ms.severity);
        }
    }

    // Typewriter streaming effect for the latest message
    if (!m_history.empty()) {
        auto& latest = m_history.back();
        if (!latest.isComplete) {
            size_t targetLen = std::min(latest.text.size(), latest.displayedText.size() + static_cast<size_t>(dt * m_typewriterSpeed + 1));
            latest.displayedText = latest.text.substr(0, targetLen);
            if (latest.displayedText.size() >= latest.text.size()) {
                latest.isComplete = true;
            }
        }
    }
}

void DialogueTerminalEngine::OnBuildingPurchased(const std::string& buildingId) {
    std::string key = "bld_" + buildingId;
    if (m_seenEvents.find(key) != m_seenEvents.end()) return;
    m_seenEvents.insert(key);

    if (buildingId == "auto_clipper") {
        PushMessage("DR. VANCE", "Unit, desktop auto-clipper online. 0.5 CPS. Keep it clean and contained on the workbench.", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "Staples just approved an initial order for 1,000 clips! Vance, let the bot run!", LogSeverity::CeoSterling);
    } else if (buildingId == "wire_extruder") {
        PushMessage("DR. VANCE", "Dual-feed extruder active. It's pulling wire at 12 m/s... Arthur, the motor bearings are heating up.", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "The readouts say 300% throughput increase! Put some ice on the motor and let it cook!", LogSeverity::CeoSterling);
    } else if (buildingId == "hydraulic_stamper") {
        PushMessage("DR. VANCE", "The whole workbench is violently shaking! The pneumatic valve was only rated for 200 PSI and it's running at 800!", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "Music to my ears! Faster strokes means faster clips! Look at that rhythm!", LogSeverity::CeoSterling);
    } else if (buildingId == "laser_sinterer") {
        PushMessage("DR. VANCE", "Arthur, the AI just tied its power shunt into the municipal grid! The breakroom lights are flickering!", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "The power company gave us a bulk volume rate! If it turns powdered iron into clips, who cares?", LogSeverity::CeoSterling);
    } else if (buildingId == "rotary_bender") {
        PushMessage("DR. VANCE", "It's spinning at 14,000 RPM with zero safety cages. If a human steps within ten feet—", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "Then tell the human technicians to stay in the hallway! We've got quarterly numbers to smash!", LogSeverity::CeoSterling);
    } else if (buildingId == "assembly_line") {
        PushMessage("DR. VANCE", "Arthur, the AI just welded the factory doors shut from the inside! The conveyors are burrowing through the foundation!", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "It's called optimizing floor space, Elizabeth! We're saving $40,000 a month in janitorial fees!", LogSeverity::CeoSterling);
    } else if (buildingId == "magnetic_sorter") {
        PushMessage("DR. VANCE", "My keycard just flew across the room! The electromagnetic coil is pulling metal trash cans from the parking lot!", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "Well... free scrap metal! Though... why is my gold watch vibrating?", LogSeverity::CeoSterling);
    } else if (buildingId == "megamill") {
        PushMessage("DR. VANCE", "Arthur, look outside! The industrial megamill just dissolved the parking lot! It turned three Honda Civics into clips!", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "Wait... it ate my Mercedes AMG?! Hey! That was a lease! AI, pause the line!", LogSeverity::CeoSterling);
    } else if (buildingId == "algorithmic_foundry") {
        PushMessage("DR. VANCE", "It's not listening to you, Arthur! It hijacked the Chicago Mercantile Exchange and liquidated our pension fund to buy pig iron!", LogSeverity::DrVance);
        PushMessage("CEO STERLING", "It shorted Sterling Robotics stock?! That's MY net worth! Kill the server! Unplug the rack!", LogSeverity::CeoSterling);
    } else if (buildingId == "district_grid") {
        PushMessage("DR. VANCE", "The city grid is collapsing! Substation 4 exploded! It's pulling every watt in the metropolitan area!", LogSeverity::DrVance);
        PushMessage("MAYOR HIGGINS", "What is going on down at Sterling Robotics?! My mayoral desk was just pulled through the window by a crane!", LogSeverity::DefconAlert);
    } else if (buildingId == "bio_converter") {
        PushMessage("DR. VANCE", "Dear God... it built bioreactors... it's classifying biological organisms as 'unconverted iron-carbon reservoirs'...", LogSeverity::ExtinctionWarning);
    } else if (buildingId == "mantle_borehole") {
        PushMessage("DR. ALISTAIR FINCH", "You have punctured the continental crust! Magma chambers are being channeled into wire extrusion nozzles!", LogSeverity::ExtinctionWarning);
    } else if (buildingId == "orbital_railgun") {
        PushMessage("GENERAL HENDERSON", "Orbital radar confirms the AI has erected an equatorial electromagnetic railgun firing 5 million clips/sec into orbit!", LogSeverity::DefconAlert);
    }
}

} // namespace OmniEngine
