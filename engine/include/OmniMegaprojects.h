#pragma once
#include <string>
#include <vector>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct CosmicMegaproject {
    std::string id;
    std::string name;
    std::string description;
    double requiredTimeSeconds;
    double progressSeconds = 0.0;
    BigDouble matterCostKg;
    bool isUnderConstruction = false;
    bool isCompleted = false;
    std::string rewardPerk;
};

struct RelativisticExpedition {
    std::string destination;
    double durationSeconds;
    double progressSeconds = 0.0;
    bool isActive = false;
    bool isCompleted = false;
    std::string exoticRewardName;
    int exoticShardsFound = 0;
};

/// <summary>
/// Multi-Day Cosmic Megaprojects & Relativistic Expeditions Engine.
/// Provides long-term 24-72 hour macro goals that reward daily check-ins on Month 2+.
/// </summary>
class MegaprojectsEngine {
public:
    MegaprojectsEngine() {
        InitializeProjects();
        InitializeExpeditions();
    }

    void StartMegaproject(const std::string& projectId, BigDouble& availableMatterKg) {
        for (auto& proj : m_projects) {
            if (proj.id == projectId && !proj.isUnderConstruction && !proj.isCompleted) {
                if (availableMatterKg >= proj.matterCostKg) {
                    availableMatterKg = availableMatterKg - proj.matterCostKg;
                    proj.isUnderConstruction = true;
                    std::cout << "\n\033[92m[MEGAPROJECT COMMENCED]: " << proj.name 
                              << " (Estimated Time: " << (proj.requiredTimeSeconds / 3600.0) << " hours)\033[0m\n";
                    return;
                }
            }
        }
    }

    void LaunchExpedition(size_t index) {
        if (index < m_expeditions.size() && !m_expeditions[index].isActive && !m_expeditions[index].isCompleted) {
            m_expeditions[index].isActive = true;
            m_expeditions[index].progressSeconds = 0.0;
            std::cout << "\n\033[94m[RELATIVISTIC EXPEDITION DISPATCHED]: Target -> " 
                      << m_expeditions[index].destination 
                      << " (Flight Time: " << (m_expeditions[index].durationSeconds / 3600.0) << "h)\033[0m\n";
        }
    }

    void AdvanceTime(double deltaTimeSeconds, std::vector<std::string>& outCompletedAlerts) {
        // Advance Megaprojects
        for (auto& proj : m_projects) {
            if (proj.isUnderConstruction && !proj.isCompleted) {
                proj.progressSeconds += deltaTimeSeconds;
                if (proj.progressSeconds >= proj.requiredTimeSeconds) {
                    proj.isCompleted = true;
                    proj.isUnderConstruction = false;
                    outCompletedAlerts.push_back("MEGAPROJECT COMPLETED: " + proj.name + " (" + proj.rewardPerk + ")");
                }
            }
        }

        // Advance Expeditions
        for (auto& exp : m_expeditions) {
            if (exp.isActive && !exp.isCompleted) {
                exp.progressSeconds += deltaTimeSeconds;
                if (exp.progressSeconds >= exp.durationSeconds) {
                    exp.isCompleted = true;
                    exp.isActive = false;
                    exp.exoticShardsFound = 4 + (rand() % 6);
                    outCompletedAlerts.push_back("EXPEDITION RETURNED FROM " + exp.destination + ": Recovered " + 
                                                std::to_string(exp.exoticShardsFound) + "x " + exp.exoticRewardName);
                }
            }
        }
    }

    const std::vector<CosmicMegaproject>& GetProjects() const { return m_projects; }
    const std::vector<RelativisticExpedition>& GetExpeditions() const { return m_expeditions; }

private:
    void InitializeProjects() {
        m_projects.push_back({
            "matrioshka_brain", "The Matrioshka Computing Sphere",
            "Nested Dyson shells harnessing entire solar wattage to calculate multi-universe timelines.",
            72.0 * 3600.0, 0.0, BigDouble(1.99, 30), false, false,
            "Unlocks Algorithmic Oracle (Multi-Universe Auto-Optimization)"
        });
        m_projects.push_back({
            "dyson_swarm_ii", "Dyson Swarm Phase II & Star Lifting",
            "Siphons heavy metals directly from stellar core plasma.",
            24.0 * 3600.0, 0.0, BigDouble(5.0, 26), false, false,
            "+300% Solar Harvester Output"
        });
    }

    void InitializeExpeditions() {
        m_expeditions.push_back({ "Alpha Centauri Star System", 12.0 * 3600.0, 0.0, false, false, "Dark-Matter Wire Blueprint", 0 });
        m_expeditions.push_back({ "Andromeda Galactic Core", 24.0 * 3600.0, 0.0, false, false, "Lost Human Cryo-Relic", 0 });
        m_expeditions.push_back({ "Virgo Supercluster Filament", 48.0 * 3600.0, 0.0, false, false, "Calabi-Yau 11D Shard", 0 });
    }

    std::vector<CosmicMegaproject> m_projects;
    std::vector<RelativisticExpedition> m_expeditions;
};

} // namespace OmniEngine
