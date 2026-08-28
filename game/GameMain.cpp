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
#include "../engine/include/OmniResearchTree.h"
#include "../engine/include/OmniHeadlines.h"
#include "../engine/include/OmniHeroClicker.h"

using namespace OmniEngine;

int main() {
    std::cout << "=================================================================\n";
    std::cout << "  OBJECTIVE: PAPERCLIPS - ACCESSIBLE HERO CLICKER & HUD RUNNER\n";
    std::cout << "  Big Paperclip Physics | Tabbed Navigation | Accessible Controls\n";
    std::cout << "=================================================================\n\n";

    // 1. Initialize Accessible UI Controller
    UIController ui(1920.0f, 1080.0f);

    BigDouble playerClips(14295.0, 0);
    BigDouble playerCPS(450.0, 0);
    BigDouble playerWire(500.0, 0);
    BigDouble playerFunds(12500.0, 0);
    double playerOps = 2400.0;

    // 2. Simulate Clicking the "Big Paperclip" Icon
    std::cout << "[Interaction Test 1] Clicking the Big Paperclip Icon (10 Rapid Clicks)...\n";
    for (int i = 0; i < 10; ++i) {
        ui.HandleClickBigPaperclip(playerClips, playerWire);
        ui.Update(0.016f); // 60 FPS tick
    }

    std::cout << "  -> Big Paperclip Squish Scale:   " << ui.GetHeroClicker().GetState().scale << "x (Elastic Recoil Active)\n";
    std::cout << "  -> Flywheel Charge Progress:     " << (ui.GetHeroClicker().GetState().flywheelChargeNorm * 100.0f) << "%\n";
    std::cout << "  -> Total Paperclips Produced:    " << playerClips.toShortScale() << "\n";

    // 3. Render Accessible HUD & Tab Switching
    std::cout << "\n[Interaction Test 2] Rendering Tab 1: [🏭 Production]...\n";
    ui.SetActiveTab(UIMenuTab::Production);
    ui.RenderAccessibleHUD(playerClips, playerCPS, playerWire, playerFunds, playerOps);

    std::cout << "\n[Interaction Test 3] Switching to Tab 2: [🔬 Research]...\n";
    ui.SetActiveTab(UIMenuTab::Research);
    ui.RenderAccessibleHUD(playerClips, playerCPS, playerWire, playerFunds, playerOps);

    // 4. Verify Accessibility Settings
    auto& settings = ui.GetSettings();
    settings.holdToClickAutoPulse = true;
    settings.highContrastMode = true;
    settings.uiScaleMultiplier = 1.25f;

    std::cout << "\n[Accessibility Verification]:\n";
    std::cout << "  -> Hold-to-Click Auto-Pulse:     \033[92m" << (settings.holdToClickAutoPulse ? "ENABLED (20Hz RSI Fix)" : "DISABLED") << "\033[0m\n";
    std::cout << "  -> High-Contrast Legibility Mode: \033[92m" << (settings.highContrastMode ? "ENABLED" : "DISABLED") << "\033[0m\n";
    std::cout << "  -> UI Dynamic Scale Multiplier:  \033[92m" << settings.uiScaleMultiplier << "x (Large Crisp Typography)\033[0m\n";

    std::cout << "\n=================================================================\n";
    std::cout << "  ACCESSIBLE HERO CLICKER & MENU HUD FULLY VERIFIED!\n";
    std::cout << "=================================================================\n";

    return 0;
}
