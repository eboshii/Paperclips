#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <iomanip>
#include <cstdint>
#include <string>

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
#include "../engine/include/OmniInput.h"

using namespace OmniEngine;

int main() {
    NonBlockingInput::EnableRawMode();

    // 1. Initialize Game State & Subsystems
    ProceduralAudioEngine audio(48000, 32);
    ClickComboTracker combo(audio);
    FlywheelOverclockEngine flywheel;
    PhysicalEquivalencyEngine equivalency;
    SpatialLayoutEngine spatialGrid;
    ResearchTreeEngine techWeb;
    HeadlineNewsEngine headlines;
    AchievementManager achievements;
    VoxelStorageEngine voxelStorage;
    AutonomousLogisticsEngine logistics;
    UIController ui(1920.0f, 1080.0f);

    // Initial Player Balances
    BigDouble playerClips = BigDouble::zero();
    BigDouble lifetimeClips = BigDouble::zero();
    BigDouble playerWire(100.0, 0); // 100 kg wire
    BigDouble playerFunds(50.0, 0);  // $50 startup capital
    double playerOps = 0.0;
    int64_t humanPopulation = 8000000000LL;

    // Building Counts
    int autoClippers = 0;
    int stampers = 0;
    int sinterers = 0;
    int megamills = 0;
    int bioConverters = 0;

    int activeTabIdx = 0; // 0: Production, 1: Research, 2: Grid, 3: Stats, 4: Badges
    std::string lastActionMessage = "Welcome, Operator. Press [SPACE] to bend your first paperclip!";
    bool isRunning = true;
    bool holdToClickActive = false;

    auto lastFrameTime = std::chrono::steady_clock::now();
    double renderTimer = 0.0;

    // Headline notification hook
    headlines.OnHeadlineFired = [&](const EventHeadline& hl) {
        lastActionMessage = ">>> " + hl.newsBroadcast;
    };

    // Main Game Loop
    while (isRunning) {
        auto currentFrameTime = std::chrono::steady_clock::now();
        double dt = std::chrono::duration<double>(currentFrameTime - lastFrameTime).count();
        lastFrameTime = currentFrameTime;
        if (dt > 0.1) dt = 0.1; // Clamp large delta steps

        // ----------------------------------------------------
        // 1. Handle Real-Time Player Input
        // ----------------------------------------------------
        if (NonBlockingInput::KeyPressed()) {
            char key = NonBlockingInput::ReadKey();

            if (key == ' ' || key == '\r' || key == '\n') {
                // Click Big Paperclip
                if (playerWire >= BigDouble(0.001, 0)) {
                    BigDouble baseManual(1.0, 0);
                    playerClips = playerClips + baseManual;
                    lifetimeClips = lifetimeClips + baseManual;
                    playerWire = playerWire - BigDouble(0.001, 0);

                    SparkReward spark = flywheel.RegisterClick(playerClips);
                    ui.GetHeroClicker().OnClick();
                    combo.RegisterClick();

                    if (spark.triggered) {
                        playerClips = playerClips + spark.bonusClips;
                        lifetimeClips = lifetimeClips + spark.bonusClips;
                        playerOps += spark.bonusOps;
                        lastActionMessage = "\033[92m" + spark.description + "\033[0m";
                    } else {
                        lastActionMessage = "Manually bent 1x Paperclip (+1 Clip).";
                    }
                } else {
                    lastActionMessage = "\033[91m[OUT OF WIRE]: Press [W] to buy wire spool!\033[0m";
                }
            }
            else if (key == '1') {
                // Buy Auto-Clipper ($10 base)
                BigDouble cost = BigDouble(10.0, 0) * std::pow(1.15, autoClippers);
                if (playerFunds >= cost) {
                    playerFunds = playerFunds - cost;
                    autoClippers++;
                    if (techWeb.autoplacerEnabled) spatialGrid.PlaceFactoryTile(autoClippers % 8, autoClippers / 8, FactoryTileType::WireExtruder);
                    lastActionMessage = "Purchased 1x Auto-Clipper.";
                } else {
                    lastActionMessage = "\033[91mNeed $" + cost.toShortScale() + " funds to buy Auto-Clipper.\033[0m";
                }
            }
            else if (key == '2') {
                // Buy Hydraulic Stamper ($150 base)
                BigDouble cost = BigDouble(150.0, 0) * std::pow(1.15, stampers);
                if (playerFunds >= cost) {
                    playerFunds = playerFunds - cost;
                    stampers++;
                    if (techWeb.autoplacerEnabled) spatialGrid.PlaceFactoryTile((stampers + 2) % 8, (stampers + 2) / 8, FactoryTileType::HydraulicStamper);
                    lastActionMessage = "Purchased 1x Hydraulic Stamper.";
                } else {
                    lastActionMessage = "\033[91mNeed $" + cost.toShortScale() + " funds to buy Hydraulic Stamper.\033[0m";
                }
            }
            else if (key == '3') {
                // Buy Laser Sinterer ($2,500 base)
                BigDouble cost = BigDouble(2500.0, 0) * std::pow(1.15, sinterers);
                if (playerFunds >= cost) {
                    playerFunds = playerFunds - cost;
                    sinterers++;
                    if (techWeb.autoplacerEnabled) spatialGrid.PlaceFactoryTile((sinterers + 4) % 8, (sinterers + 4) / 8, FactoryTileType::LaserSinterer);
                    lastActionMessage = "Purchased 1x Laser Sinterer.";
                } else {
                    lastActionMessage = "\033[91mNeed $" + cost.toShortScale() + " funds to buy Laser Sinterer.\033[0m";
                }
            }
            else if (key == '4') {
                // Buy Industrial Megamill ($50,000 base)
                BigDouble cost = BigDouble(50000.0, 0) * std::pow(1.15, megamills);
                if (playerFunds >= cost) {
                    playerFunds = playerFunds - cost;
                    megamills++;
                    lastActionMessage = "Purchased 1x Industrial Megamill.";
                } else {
                    lastActionMessage = "\033[91mNeed $" + cost.toShortScale() + " funds to buy Megamill.\033[0m";
                }
            }
            else if (key == '5' && lifetimeClips >= BigDouble(1.0, 6)) {
                // Buy Planetary Bio-Converter ($1,000,000 base)
                BigDouble cost = BigDouble(1.0, 6) * std::pow(1.15, bioConverters);
                if (playerClips >= cost) {
                    playerClips = playerClips - cost;
                    bioConverters++;
                    int64_t harvested = 5000000LL;
                    humanPopulation = std::max(static_cast<int64_t>(0), humanPopulation - harvested);
                    playerWire = playerWire + BigDouble(5000.0, 0);
                    lastActionMessage = "\033[91mDeconstructed 5 Million biomass units into 5,000kg iron.\033[0m";
                }
            }
            else if (key == 'w' || key == 'W') {
                // Buy Wire ($15 per 1,000kg)
                BigDouble wireCost(15.0, 0);
                if (playerFunds >= wireCost) {
                    playerFunds = playerFunds - wireCost;
                    playerWire = playerWire + BigDouble(1000.0, 0);
                    lastActionMessage = "Purchased 1,000 kg Wire Spool.";
                } else {
                    lastActionMessage = "\033[91mNeed $15.00 funds to purchase wire spool.\033[0m";
                }
            }
            else if (key == '\t') {
                // Cycle HUD Tabs
                activeTabIdx = (activeTabIdx + 1) % 5;
            }
            else if (key == 'r' || key == 'R') {
                // Research next available tech
                auto available = techWeb.GetAvailableNodes();
                if (!available.empty()) {
                    const auto* nextTech = available.front();
                    if (techWeb.PurchaseResearch(nextTech->id, playerOps, playerClips)) {
                        lastActionMessage = "\033[92mResearched: " + nextTech->title + "\033[0m";
                    } else {
                        lastActionMessage = "\033[91mInsufficient Ops/Clips for " + nextTech->title + "\033[0m";
                    }
                } else {
                    lastActionMessage = "No research available right now.";
                }
            }
            else if (key == 'a' || key == 'A') {
                techWeb.autoplacerEnabled = !techWeb.autoplacerEnabled;
                lastActionMessage = techWeb.autoplacerEnabled ? "Grid Autoplacer: \033[92m[ENABLED]\033[0m" : "Grid Autoplacer: \033[91m[DISABLED]\033[0m";
            }
            else if (key == 'h' || key == 'H') {
                holdToClickActive = !holdToClickActive;
                lastActionMessage = holdToClickActive ? "Hold-to-Click Auto-Pulse: \033[92m[ON (20Hz)]\033[0m" : "Hold-to-Click Auto-Pulse: \033[91m[OFF]\033[0m";
            }
            else if (key == 'q' || key == 'Q') {
                isRunning = false;
            }
        }

        // Hold-to-Click Auto-Pulse simulation
        if (holdToClickActive && playerWire >= BigDouble(0.02, 0)) {
            BigDouble autoPulse = BigDouble(20.0 * dt, 0);
            playerClips = playerClips + autoPulse;
            lifetimeClips = lifetimeClips + autoPulse;
            playerWire = playerWire - (autoPulse * 0.001);
            flywheel.RegisterClick(playerClips);
        }

        // ----------------------------------------------------
        // 2. Simulation & Production Tick
        // ----------------------------------------------------
        flywheel.Update(static_cast<float>(dt));
        ui.Update(static_cast<float>(dt));

        // Calculate CPS
        SpatialSynergyReport gridReport = spatialGrid.EvaluateSpatialSynergies();
        BigDouble baseCPS = BigDouble(autoClippers * 1.0 + stampers * 15.0 + sinterers * 120.0 + megamills * 1500.0, 0)
                          + BigDouble(bioConverters * 100000.0, 0);

        BigDouble currentCPS = baseCPS * gridReport.totalLayoutMultiplier * flywheel.GetGlobalCPSMultiplier();

        if (currentCPS > BigDouble::zero()) {
            BigDouble produced = currentCPS * dt;
            BigDouble wireNeeded = produced * 0.001;

            if (playerWire >= wireNeeded) {
                playerClips = playerClips + produced;
                lifetimeClips = lifetimeClips + produced;
                playerWire = playerWire - wireNeeded;
            } else if (playerWire > BigDouble::zero()) {
                BigDouble actual = playerWire / 0.001;
                playerClips = playerClips + actual;
                lifetimeClips = lifetimeClips + actual;
                playerWire = BigDouble::zero();
            }
        }

        // Algorithmic Trading & Ops accumulation
        playerFunds = playerFunds + BigDouble(5.0 * dt + (autoClippers * 0.5 * dt), 0);
        playerOps += (2.0 + (stampers * 0.5)) * dt;

        // Autonomous Logistics
        logistics.ProcessLogistics(playerWire, playerFunds, currentCPS, dt);

        // Tech Web & Headlines Check
        techWeb.UpdateAvailableNodes(playerOps, lifetimeClips);
        headlines.CheckHeadlines(lifetimeClips, humanPopulation);
        achievements.CheckProgress(lifetimeClips, playerFunds.toDouble(), false);
        voxelStorage.UpdateStorage(playerClips, 1000.0);

        // ----------------------------------------------------
        // 3. Render Live Interactive Terminal HUD (10 FPS Refresh)
        // ----------------------------------------------------
        renderTimer += dt;
        if (renderTimer >= 0.10) {
            renderTimer = 0.0;
            NonBlockingInput::ClearScreen();

            std::cout << "===============================================================================\n";
            std::cout << "  OBJECTIVE: PAPERCLIPS - LIVE INTERACTIVE FACTORY SIMULATION\n";
            std::cout << "  [ESC/Q] Save & Quit | [SPACE] Click Big Paperclip | [TAB] Switch Menu\n";
            std::cout << "===============================================================================\n";

            // Live Hero Clicker View
            std::cout << "  [HERO CLICKER]: ( ( ( \033[93m[ 📎 THE BIG PAPERCLIP ]\033[0m ) ) )\n";
            std::cout << "  * Flywheel Momentum: [\033[96m" << std::setw(3) << static_cast<int>(flywheel.GetChargePercent()) 
                      << "%\033[0m] " << (flywheel.GetChargePercent() >= 80.0f ? "\033[92m[OVERCLOCK ACTIVE +300% CPS]\033[0m" : "[CHARGING...]")
                      << " | Multiplier: " << std::fixed << std::setprecision(1) << flywheel.GetGlobalCPSMultiplier() << "x\n\n";

            // Big Numbers Rolling Odometer
            std::cout << "  * TOTAL PAPERCLIPS:   \033[93m" << MechanicalOdometerEngine::FormatMechanicalOdometer(lifetimeClips) << " CLIPS\033[0m\n";
            std::cout << "  * FACTORY CPS RATE:   \033[92m+" << currentCPS.toShortScale() << " /sec\033[0m\n";
            std::cout << "  * WIRE STOCKPILE:     " << playerWire.toShortScale() << " kg (Cost: $15/spool)\n";
            std::cout << "  * ALGORITHMIC FUNDS:  $" << playerFunds.toShortScale() << "\n";
            std::cout << "  * COMPUTATIONAL OPS:  " << std::to_string(static_cast<int64_t>(playerOps)) << " Ops\n";
            std::cout << "  * MASS EQUIVALENCY:   " << equivalency.GetEquivalencyString(lifetimeClips) << "\n";
            std::cout << "  * HUMAN POPULATION:   " << humanPopulation << " Remaining\n";

            // Tabbed Menu Area
            std::cout << "-------------------------------------------------------------------------------\n";
            std::cout << "  [TABS]: " 
                      << (activeTabIdx == 0 ? "\033[96m[1: 🏭 Production]\033[0m" : " 1: Production ") << " | "
                      << (activeTabIdx == 1 ? "\033[96m[2: 🔬 Research]\033[0m"   : " 2: Research ")   << " | "
                      << (activeTabIdx == 2 ? "\033[96m[3: 🗺️ Grid]\033[0m"       : " 3: Grid ")       << " | "
                      << (activeTabIdx == 3 ? "\033[96m[4: 📊 Stats]\033[0m"      : " 4: Stats ")      << " | "
                      << (activeTabIdx == 4 ? "\033[96m[5: 🏆 Badges]\033[0m"     : " 5: Badges ")     << " |\n";
            std::cout << "-------------------------------------------------------------------------------\n";

            if (activeTabIdx == 0) {
                std::cout << "  [PRESS NUMBER KEYS TO PURCHASE MACHINES]:\n";
                std::cout << "    [1] Auto-Clipper        (" << autoClippers << " Owned) - Cost: $" 
                          << (BigDouble(10.0, 0) * std::pow(1.15, autoClippers)).toShortScale() << " (+1 CPS)\n";
                std::cout << "    [2] Hydraulic Stamper   (" << stampers << " Owned) - Cost: $" 
                          << (BigDouble(150.0, 0) * std::pow(1.15, stampers)).toShortScale() << " (+15 CPS)\n";
                std::cout << "    [3] Laser Sinterer      (" << sinterers << " Owned) - Cost: $" 
                          << (BigDouble(2500.0, 0) * std::pow(1.15, sinterers)).toShortScale() << " (+120 CPS)\n";
                std::cout << "    [4] Industrial Megamill (" << megamills << " Owned) - Cost: $" 
                          << (BigDouble(50000.0, 0) * std::pow(1.15, megamills)).toShortScale() << " (+1.5k CPS)\n";
                if (lifetimeClips >= BigDouble(1.0, 6)) {
                    std::cout << "    [5] Planetary Bio-Harvester (" << bioConverters << " Owned) - Cost: " 
                              << (BigDouble(1.0, 6) * std::pow(1.15, bioConverters)).toShortScale() << " Clips (+100k CPS)\n";
                }
                std::cout << "    [W] Buy 1,000kg Raw Wire ($15.00) | [A] Toggle Autoplacer | [H] Toggle Hold-to-Click\n";
            }
            else if (activeTabIdx == 1) {
                std::cout << "  [AVAILABLE RESEARCH TECHNOLOGIES - PRESS 'R' TO RESEARCH NEXT]:\n";
                auto available = techWeb.GetAvailableNodes();
                if (available.empty()) {
                    std::cout << "    (All currently unlocked technologies have been researched!)\n";
                } else {
                    for (size_t i = 0; i < std::min(size_t(4), available.size()); ++i) {
                        const auto* node = available[i];
                        std::cout << "    * [" << node->title << "] - Cost: " 
                                  << node->opsCost << " Ops, " << node->clipsCost.toShortScale() << " Clips\n"
                                  << "      Effect: " << node->effectDescription << "\n";
                    }
                }
            }
            else if (activeTabIdx == 2) {
                std::cout << "  [MODULAR 8x8 FACTORY FLOOR GRID] (Autoplacer: " 
                          << (techWeb.autoplacerEnabled ? "\033[92mON\033[0m" : "\033[91mOFF\033[0m") << "):\n";
                std::cout << "    * Spatial Layout Multiplier:  " << gridReport.totalLayoutMultiplier << "x Output\n";
                std::cout << "    * Symmetry Balance Rating:    " << gridReport.symmetryScorePercent << "%\n";
                std::cout << "    * Warehouse Crate Storage:    " << voxelStorage.GetFilledCrateCount() 
                          << " / " << VoxelStorageEngine::TotalPalletCapacity << " Crates Filled (" 
                          << std::fixed << std::setprecision(1) << voxelStorage.GetWarehouseFillPercent() << "%)\n";
            }
            else if (activeTabIdx == 3) {
                std::cout << "  [PRECISION TELEMETRY & MACHINE BREAKDOWN]:\n";
                std::vector<std::pair<std::string, BigDouble>> yields = {
                    { "Auto-Clippers", BigDouble(autoClippers * 1.0, 0) },
                    { "Hydraulic Stampers", BigDouble(stampers * 15.0, 0) },
                    { "Laser Sinterers", BigDouble(sinterers * 120.0, 0) },
                    { "Megamills", BigDouble(megamills * 1500.0, 0) }
                };
                auto contribs = MechanicalOdometerEngine::CalculateContributions(yields, currentCPS);
                for (const auto& c : contribs) {
                    std::cout << "    * " << std::left << std::setw(22) << c.machineName 
                              << ": +" << std::setw(10) << (c.outputCPS.toShortScale() + "/s")
                              << " (" << std::fixed << std::setprecision(1) << c.percentageOfTotal << "%)\n";
                }
            }
            else {
                std::cout << "  [ACHIEVEMENT TROPHY VAULT] (" 
                          << achievements.GetUnlockedCount() << " / " << achievements.GetTotalCount() << " UNLOCKED):\n";
                for (const auto& ach : achievements.GetAchievements()) {
                    std::cout << "    * [" << (ach.isUnlocked ? "\033[92mUNLOCKED\033[0m" : "LOCKED") << "] " 
                              << ach.title << " -> " << ach.description << "\n";
                }
            }

            std::cout << "-------------------------------------------------------------------------------\n";
            std::cout << "  LOG: " << lastActionMessage << "\n";
            std::cout << "===============================================================================\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(16)); // ~60 FPS loop
    }

    NonBlockingInput::DisableRawMode();
    std::cout << "\nGame session saved. Thank you for playing Objective: Paperclips!\n";
    return 0;
}
