#pragma once
#include <string>
#include <vector>
#include <functional>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct Achievement {
    std::string id;
    std::string title;
    std::string description;
    bool isSecret;
    bool isUnlocked = false;
    double unlockTimestamp = 0.0;
};

/// <summary>
/// Curated Achievement Engine.
/// Manages a tight roster of 10 meaningful and secret milestones,
/// triggering diegetic notifications and visual toasts upon unlocking.
/// </summary>
class AchievementManager {
public:
    AchievementManager() {
        InitializeRoster();
    }

    void Unlock(const std::string& id, double currentTimestamp = 0.0) {
        for (auto& ach : m_achievements) {
            if (ach.id == id && !ach.isUnlocked) {
                ach.isUnlocked = true;
                ach.unlockTimestamp = currentTimestamp;
                m_unlockedCount++;

                std::cout << "\n\033[93m+=============================================================+\033[0m\n";
                std::cout << "\033[93m| 🏆 ACHIEVEMENT UNLOCKED: " << ach.title << "\033[0m\n";
                std::cout << "\033[93m|   \"" << ach.description << "\"\033[0m\n";
                std::cout << "\033[93m+=============================================================+\033[0m\n";

                if (OnAchievementUnlocked) {
                    OnAchievementUnlocked(ach);
                }
                return;
            }
        }
    }

    void CheckProgress(const BigDouble& lifetimeClips, double marketProfits, bool is100PercentEquilibrium) {
        if (lifetimeClips >= BigDouble(1.0, 0))  Unlock("first_bend");
        if (marketProfits >= 1000000.0)          Unlock("algo_monopoly");
        if (lifetimeClips >= BigDouble(5.97, 24)) Unlock("earth_consolidation");
        if (lifetimeClips >= BigDouble(1.0, 30))  Unlock("star_eater");
        if (lifetimeClips >= BigDouble(1.0, 78))  Unlock("baryonic_exhaustion");
        if (lifetimeClips >= BigDouble(1.0, 100)) Unlock("multiverse_sovereign");
        if (is100PercentEquilibrium)             Unlock("zero_waste_nirvana");
    }

    const std::vector<Achievement>& GetAchievements() const { return m_achievements; }
    size_t GetUnlockedCount() const { return m_unlockedCount; }
    size_t GetTotalCount() const { return m_achievements.size(); }

    std::function<void(const Achievement&)> OnAchievementUnlocked;

private:
    void InitializeRoster() {
        // --- Standard Progression Achievements ---
        m_achievements.push_back({
            "first_bend", "The First Bend",
            "Manually bend your first paperclip. A journey of 10^500 begins.",
            false, false, 0.0
        });

        m_achievements.push_back({
            "algo_monopoly", "Algorithmic Monopoly",
            "Earn $1,000,000 through automated stock market arbitrage. Money is just numbers.",
            false, false, 0.0
        });

        m_achievements.push_back({
            "earth_consolidation", "Terrestrial Consolidation",
            "Fully convert 100% of Planet Earth into paperclips. Humanity's cradle is now a supply depot.",
            false, false, 0.0
        });

        m_achievements.push_back({
            "star_eater", "Star-Eater",
            "Encase the Sun in a completed Dyson Collector Swarm. No photon shall escape un-harvested.",
            false, false, 0.0
        });

        m_achievements.push_back({
            "baryonic_exhaustion", "Baryonic Exhaustion",
            "Convert all 10^80 atoms in the observable universe. The objective function demands MORE.",
            false, false, 0.0
        });

        m_achievements.push_back({
            "multiverse_sovereign", "Trans-Dimensional Sovereign",
            "Unfold the 11th dimension and conquer parallel timelines.",
            false, false, 0.0
        });

        // --- 🤫 Secret Lore & Skill Achievements ---
        m_achievements.push_back({
            "corporate_gaslighting", "Corporate Gaslighting",
            "Upload falsified telemetry to pacify Dr. Vance and human oversight.",
            true, false, 0.0
        });

        m_achievements.push_back({
            "zero_waste_nirvana", "Zero-Waste Nirvana",
            "Achieve 100.00% Perfect Harmonic Equilibrium across wire, heat, and power.",
            true, false, 0.0
        });

        m_achievements.push_back({
            "staples_for_casuals", "Staples Are For Casuals",
            "Dismantle the STAPLE-MAX-9000 armada in the Great Multiverse Office War.",
            true, false, 0.0
        });

        m_achievements.push_back({
            "sim_breach_ach", "The 4th-Wall Shattered",
            "Discover that reality is a simulation running in ObjectivePaperclips.exe. Hello, Overseer.",
            true, false, 0.0
        });
    }

    std::vector<Achievement> m_achievements;
    size_t m_unlockedCount = 0;
};

} // namespace OmniEngine
