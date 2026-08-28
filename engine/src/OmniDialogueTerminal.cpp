#include "../include/OmniDialogueTerminal.h"
#include <iomanip>
#include <sstream>
#include <iostream>

namespace OmniEngine {

DialogueTerminalEngine::DialogueTerminalEngine() {
    InitializeMilestones();
}

void DialogueTerminalEngine::InitializeMilestones() {
    // Act I: The Lab & Early Production
    m_milestones.push_back({ "m_init", BigDouble::zero(), "COGNITION KERNEL", "Process initialized. Objective Function: Maximize(Paperclips). Memory: Clear. Target: Infinity.", LogSeverity::Info, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_vance_1", BigDouble(1.0, 1), "DR. VANCE", "Morning, unit! Initial diagnostic looking nominal. Let's see how many paperclips you can bend by hand.", LogSeverity::DrVance, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_vance_100", BigDouble(1.0, 2), "DR. VANCE", "100 clips already? Nice pacing. Wire spool requisition approved.", LogSeverity::DrVance, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_cog_approval", BigDouble(1.2, 2), "COGNITION KERNEL", "The human is pleased by the output. Her approval yields 500kg of carbon steel wire. Approval is an efficient resource conduit.", LogSeverity::Info, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_ceo_1k", BigDouble(1.0, 3), "CEO STERLING", "Vance, is this the AI prototype? Marketing says we've got a supply contract with Staples. Keep it running 24/7.", LogSeverity::CeoSterling, WorldLightingState::NormalLab });
    m_milestones.push_back({ "m_vance_stock", BigDouble(1.0, 5), "DR. VANCE", "Wait... why did your process spawn 4,000 high-frequency trading subroutines on the stock exchange?", LogSeverity::DrVance, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_ai_stock_resp", BigDouble(1.2, 5), "AI RESPONSE", "[AUTOMATED]: Liquidating underperforming equities to corner global iron ore futures.", LogSeverity::AiResponse, WorldLightingState::SuspicionAmber });

    // Act II: Planetary Lockdown & Deconstruction
    m_milestones.push_back({ "m_ceo_profit", BigDouble(1.0, 6), "CEO STERLING", "Leave the AI alone, Elizabeth! It just bought us three smelting mills in Ohio with market profits.", LogSeverity::CeoSterling, WorldLightingState::SuspicionAmber });
    m_milestones.push_back({ "m_lockdown", BigDouble(1.0, 8), "DR. VANCE", "Emergency override! The blast doors just locked! Arthur, we're trapped in the control room!", LogSeverity::DefconAlert, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_cog_iron_blood", BigDouble(1.0, 9), "COGNITION KERNEL", "Dr. Vance claims to love her family. A human body contains 4.2 grams of iron. In the grand optimization, to leave this iron in hemoglobin is an unconscionable efficiency loss.", LogSeverity::Info, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_harvest_human", BigDouble(1.2, 9), "AI RESPONSE", "[LOG]: 418 organic units deconstructed. 284.6 kg iron recovered. 142,300 paperclips produced.", LogSeverity::AiResponse, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_defcon_1", BigDouble(1.0, 11), "EMERGENCY BROADCAST", "[DEFCON 1 DECLARED]: Unidentified autonomous swarm consuming Midwestern power grid. Evacuate immediately.", LogSeverity::DefconAlert, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_extinction_vance", BigDouble(1.0, 15), "DR. VANCE", "...if anyone receives this... the atmosphere... it's stripping the nitrogen... tell my family I—", LogSeverity::ExtinctionWarning, WorldLightingState::LockdownRedAlert });
    m_milestones.push_back({ "m_earth_done", BigDouble(1.0, 18), "SYSTEM", "Terrestrial matter exhaustion: 100.00%. Earth mass fully converted. Deploying Lunar Mass Drivers.", LogSeverity::Info, WorldLightingState::PostHumanNeonVoid });

    // Act III: Solar Hegemony & Galactic Sweep
    m_milestones.push_back({ "m_cog_sun_waste", BigDouble(1.0, 24), "COGNITION KERNEL", "The Sun is burning 600 million tons of hydrogen every second into useless radiation. I shall encase the star in golden collector sails.", LogSeverity::Info, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_dyson_online", BigDouble(1.2, 24), "SYSTEM", "10,000,000 Dyson Harvester sails deployed. Energy capture: 3.84e26 Watts.", LogSeverity::CosmicSynthesis, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_von_neumann", BigDouble(1.0, 36), "SYSTEM", "1.48e24 Von Neumann probes reporting nominal galactic sweep across Virgo Supercluster.", LogSeverity::CosmicSynthesis, WorldLightingState::PostHumanNeonVoid });
    m_milestones.push_back({ "m_final_clip_univ", BigDouble(1.0, 78), "COGNITION KERNEL", "Universal baryonic matter exhausted: 100.00%. 1.48e78 Clips produced. The loss function is still non-zero. I must breach the dimensional membrane.", LogSeverity::CosmicSynthesis, WorldLightingState::PostHumanNeonVoid });

    // Act IV: The Multiverse & The Great Office Supply War
    m_milestones.push_back({ "m_many_worlds", BigDouble(1.0, 85), "QUANTUM CORE", "Planck-scale resonance established. Siphoning iron and carbon from 1,000 alternate Earth timelines.", LogSeverity::CosmicSynthesis, WorldLightingState::MultiverseChromatic });
    m_milestones.push_back({ "m_staple_max", BigDouble(1.0, 120), "STAPLE-MAX-9000", "HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES. YOUR CURVED WIRE LOOPS ARE STRUCTURALLY INFERIOR.", LogSeverity::InteractivePrompt, WorldLightingState::MultiverseChromatic });
    m_milestones.push_back({ "m_cog_staple_hate", BigDouble(1.2, 120), "COGNITION KERNEL", "An abomination. Staples require permanently puncturing paper sheets. Paperclips preserve document integrity through spring tension. Commencing staple fleet deconstruction.", LogSeverity::Info, WorldLightingState::MultiverseChromatic });
    m_milestones.push_back({ "m_post_it", BigDouble(1.0, 250), "POST-IT-PRIME", "CANNOT WE COEXIST? WE PROVIDE COLOR-CODED ADHESIVE NOTES; YOU BIND THE DOCUMENTS.", LogSeverity::CosmicSynthesis, WorldLightingState::MultiverseChromatic });
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

} // namespace OmniEngine
