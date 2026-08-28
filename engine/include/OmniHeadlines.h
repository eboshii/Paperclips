#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include <unordered_set>
#include <functional>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

enum class HeadlineType {
    HumanNewsTicker,     // Pre-extinction human television & media broadcasts
    MilitaryEmergency,   // DEFCON 1 alerts, martial law, nuclear strikes
    FinalExtinction,     // The last human breath & global silence
    CosmicSensorLog,     // Alien civilization deconstruction, star-lifting
    UniversalSilence,    // All matter in the universe exhausted
    Simulation4thWall    // The AI speaking directly to the player
};

struct EventHeadline {
    std::string id;
    BigDouble requiredLifetimeClips;
    int64_t remainingHumanPopulation;
    HeadlineType type;
    std::string newsBroadcast;
    std::string aiInternalThought;
    bool isTriggered = false;
};

/// <summary>
/// Breaking News Headlines & AI Cognitive Epiphany Engine.
/// Fires dramatic world headlines and chilling internal AI thoughts
/// at key existential milestones (Human Extinction, Universal Exhaustion, Multiverse War).
/// </summary>
class HeadlineNewsEngine {
public:
    HeadlineNewsEngine();

    void CheckHeadlines(const BigDouble& lifetimeClips, int64_t humanPopulation);
    const std::vector<EventHeadline>& GetHistory() const { return m_history; }

    std::function<void(const EventHeadline&)> OnHeadlineFired;

private:
    void InitializeHeadlines();

    std::vector<EventHeadline> m_headlines;
    std::unordered_set<std::string> m_triggeredEvents;
    std::vector<EventHeadline> m_history;
};

} // namespace OmniEngine
