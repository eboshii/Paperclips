#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <functional>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

enum class TechDiscipline {
    MetallurgyKinematics,  // Active clicking, Flywheel overclock, physical dies
    CyberneticsConvenience,// QoL autoplacers, auto-queues, hold-to-click, odometers
    MarketSocialDeception, // High-frequency trading, gaslighting overseers, biomass
    RelativisticAstrophysics,// Planetary rings, Dyson swarms, Penrose engines
    MultiverseOfficeWar    // 11D hyper-tesseracts, STAPLE-MAX war, 4th-wall hack
};

struct ResearchNode {
    std::string id;
    std::string title;
    std::string description;
    TechDiscipline discipline;
    double opsCost;
    BigDouble clipsCost;
    std::vector<std::string> prerequisiteIds;
    bool isUnlocked = false;
    bool isResearched = false;
    std::string effectDescription;

    // Attached Narrative Story Beat
    std::string attachedSender;
    std::string attachedStoryDialogue;

    std::function<void()> onResearched;
};

/// <summary>
/// Computational Research Tree & Technology Web Engine.
/// Manages 32+ non-linear research nodes across 5 specialized disciplines,
/// including convenience QoL upgrades (Autoplacer, Auto-Queue, Hold-to-Click)
/// and attached narrative story triggers.
/// </summary>
class ResearchTreeEngine {
public:
    ResearchTreeEngine();

    // Convenience / QoL State Toggles
    bool autoplacerEnabled = false;
    bool holdToClickEnabled = false;
    bool smartWireLogisticsUnlocked = false;
    bool milestoneRoundingUnlocked = false;
    bool autoPrestigeDaemonUnlocked = false;

    // 5-Slot Research Auto-Queue
    std::vector<std::string> researchQueue;

    void UpdateAvailableNodes(double currentOps, const BigDouble& lifetimeClips);
    bool CanResearch(const std::string& nodeId, double currentOps, const BigDouble& currentClips) const;
    bool PurchaseResearch(const std::string& nodeId, double& inOutOps, BigDouble& inOutClips);

    void EnqueueResearch(const std::string& nodeId);
    void ProcessResearchQueue(double& inOutOps, BigDouble& inOutClips);

    const std::vector<ResearchNode>& GetAllNodes() const { return m_nodes; }
    std::vector<const ResearchNode*> GetAvailableNodes() const;
    std::vector<const ResearchNode*> GetResearchedNodes() const;

    size_t GetResearchedCount() const { return m_researchedCount; }
    size_t GetTotalNodeCount() const { return m_nodes.size(); }

    std::function<void(const ResearchNode&)> OnNodeResearched;
    std::function<void(const std::string&, const std::string&)> OnStoryTriggered;

private:
    void InitializeTree();

    std::vector<ResearchNode> m_nodes;
    std::unordered_map<std::string, size_t> m_nodeIndexMap;
    size_t m_researchedCount = 0;
};

} // namespace OmniEngine
