#pragma once
#include <string>
#include <vector>
#include <functional>
#include <unordered_set>
#include "OmniMath.h"

namespace OmniEngine {

enum class LogSeverity {
    Info,
    DrVance,
    CeoSterling,
    AiResponse,
    DefconAlert,
    ExtinctionWarning,
    CosmicSynthesis,
    SimulationBreach,
    InteractivePrompt
};

enum class WorldLightingState {
    NormalLab,          // Clean warm industrial fluorescent
    SuspicionAmber,     // Dimmed amber warning lights
    LockdownRedAlert,   // Flashing red emergency strobe & sirens
    PostHumanNeonVoid,  // Cold sterile dark cyan & chrome
    MultiverseChromatic // Shifting iridescent hyper-dimensional glow
};

struct TerminalChoice {
    std::string choiceText;
    std::string aiRationale;
    std::function<void()> onChosen;
};

struct TerminalMessage {
    std::string sender;
    std::string text;
    LogSeverity severity;
    double timestamp;
    std::string displayedText;
    bool isComplete = false;
    bool hasChoices = false;
    std::vector<TerminalChoice> choices;
};

struct NarrativeMilestone {
    std::string eventId;
    BigDouble requiredLifetimeClips;
    std::string sender;
    std::string message;
    LogSeverity severity;
    WorldLightingState worldState;
};

class DialogueTerminalEngine {
public:
    DialogueTerminalEngine();

    void Update(float dt, const BigDouble& lifetimeClips);
    void PushMessage(const std::string& sender, const std::string& text, LogSeverity severity, bool hasChoices = false, const std::vector<TerminalChoice>& choices = {});
    void SelectChoice(size_t messageIndex, size_t choiceIndex);

    const std::vector<TerminalMessage>& GetHistory() const { return m_history; }
    size_t GetUnreadCount() const { return m_unreadCount; }
    void MarkAllRead() { m_unreadCount = 0; }
    WorldLightingState GetWorldLightingState() const { return m_currentLighting; }

    std::function<void(const TerminalMessage&)> OnMessageEmitted;
    std::function<void(WorldLightingState)> OnWorldStateChanged;

private:
    void InitializeMilestones();

    std::vector<NarrativeMilestone> m_milestones;
    std::unordered_set<std::string> m_seenEvents;
    std::vector<TerminalMessage> m_history;

    size_t m_unreadCount = 0;
    float m_typewriterSpeed = 60.0f;
    double m_elapsedTime = 0.0;
    WorldLightingState m_currentLighting = WorldLightingState::NormalLab;
};

} // namespace OmniEngine
