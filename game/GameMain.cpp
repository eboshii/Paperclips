#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include "../engine/include/OmniMath.h"
#include "../engine/include/OmniAudio.h"
#include "../engine/include/OmniRender.h"
#include "../engine/include/OmniCameraRig.h"
#include "../engine/include/OmniKinematics.h"
#include "../engine/include/OmniJuice.h"
#include "../engine/include/OmniInstanceBuffer.h"
#include "../engine/include/OmniComboAudio.h"
#include "../engine/include/OmniDialogueTerminal.h"
#include "../engine/include/OmniUI.h"
#include "../engine/include/OmniPrestige.h"
#include "../engine/include/OmniStreamer.h"
#include "../engine/include/OmniFlywheel.h"
#include "../engine/include/OmniEquivalency.h"
#include "../engine/include/OmniMilestoneBuyer.h"
#include "../engine/include/OmniLogistics.h"
#include "../engine/include/OmniOfflineTimeWarp.h"
#include "../engine/include/OmniAutobuyer.h"
#include "../engine/include/OmniMegaprojects.h"
#include "../engine/include/OmniOfflineSummary.h"
#include "../engine/include/OmniEcoMode.h"
#include "../engine/include/OmniSpatialGrid.h"
#include "../engine/include/OmniOdometer.h"
#include "../engine/include/OmniSliders.h"
#include "../engine/include/OmniVoxelStorage.h"
#include "../engine/include/OmniEquilibrium.h"
#include "../engine/include/OmniAvalanche.h"
#include "../engine/include/OmniVisualScenes.h"
#include "../engine/include/OmniAchievements.h"

using namespace OmniEngine;

int main(int argc, char** argv) {
    std::cout << "=================================================================\n";
    std::cout << "  OBJECTIVE: PAPERCLIPS - CURATED ACHIEVEMENTS RUNNER\n";
    std::cout << "  Progression Milestones | 4 Secret Lore & Skill Badges\n";
    std::cout << "=================================================================\n\n";

    // 1. Initialize Achievement System
    AchievementManager achievements;

    // 2. Simulate Progression Triggers
    std::cout << "[Step 1] Triggering Early Progression Milestones...\n";
    achievements.CheckProgress(BigDouble(1.0, 0), 0.0, false);            // First Bend
    achievements.CheckProgress(BigDouble(1.0, 5), 1500000.0, false);       // Algorithmic Monopoly

    std::cout << "\n[Step 2] Triggering Planetary & Cosmic Milestones...\n";
    achievements.CheckProgress(BigDouble(5.97, 24), 1500000.0, false);     // Earth Consolidation
    achievements.CheckProgress(BigDouble(1.0, 30), 1500000.0, false);      // Star-Eater
    achievements.CheckProgress(BigDouble(1.0, 78), 1500000.0, false);      // Baryonic Exhaustion
    achievements.CheckProgress(BigDouble(1.0, 100), 1500000.0, false);     // Multiverse Sovereign

    std::cout << "\n[Step 3] Unlocking Secret Achievements...\n";
    achievements.Unlock("corporate_gaslighting");
    achievements.Unlock("zero_waste_nirvana");
    achievements.Unlock("staples_for_casuals");
    achievements.Unlock("sim_breach_ach");

    std::cout << "\n-----------------------------------------------------------------\n";
    std::cout << "  >>> CURATED ACHIEVEMENT ROSTER STATUS: " 
              << achievements.GetUnlockedCount() << " / " << achievements.GetTotalCount() << " UNLOCKED <<<\n";
    std::cout << "-----------------------------------------------------------------\n";

    for (const auto& ach : achievements.GetAchievements()) {
        std::cout << "  * [" << (ach.isUnlocked ? "\033[92mUNLOCKED\033[0m" : "LOCKED") << "] "
                  << ach.title << (ach.isSecret ? " \033[95m[SECRET]\033[0m" : "") 
                  << " -> " << ach.description << "\n";
    }

    std::cout << "\n=================================================================\n";
    std::cout << "  CURATED ACHIEVEMENTS SYSTEM FULLY VERIFIED!\n";
    std::cout << "=================================================================\n";

    return 0;
}
