#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <iomanip>
#include <cstdint>
#include <string>
#include <cmath>

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
#include "../engine/include/OmniGLWindow.h"
#include "../engine/include/OmniMeshBuilder.h"
#include "../engine/include/OmniCosmicRenderer.h"
#include "../engine/include/OmniParticles.h"
#include "../engine/include/OmniInteractiveUI.h"

using namespace OmniEngine;

int main() {
    std::cout << "=================================================================\n";
    std::cout << "  LAUNCHING OBJECTIVE: PAPERCLIPS - FULL 100% CLICKABLE UI & 3D\n";
    std::cout << "=================================================================\n\n";

    // 1. Initialize Native 3D OpenGL Window (1280x720)
    OmniGLWindow window("Objective: Paperclips - 100% Mouse-Driven 3D Factory Simulation", 1280, 720);
    if (!window.Initialize()) {
        std::cerr << "[ERROR] Could not initialize OpenGL window.\n";
    }

    // 2. Initialize Game Engine Subsystems
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
    UIController ui(1280.0f, 720.0f);
    OmniParticleEngine particles;
    InteractiveUIManager uiManager;

    // Initial Balances
    BigDouble playerClips = BigDouble::zero();
    BigDouble lifetimeClips = BigDouble::zero();
    BigDouble playerWire(100.0, 0); // 100 kg wire
    BigDouble playerFunds(50.0, 0);  // $50 initial funds
    double playerOps = 0.0;
    int64_t humanPopulation = static_cast<int64_t>(8000000000LL);

    // Building Counts
    int autoClippers = 0;
    int stampers = 0;
    int sinterers = 0;
    int megamills = 0;
    int bioConverters = 0;

    int debugZoomTier = -1; // -1 for auto-tier progression, 0-4 for manual preview
    std::string lastActionMessage = "Welcome Operator. Click the 3D Big Paperclip or buttons below!";

    // 3. Build Procedural 3D Cosmic Meshes
    auto floorMesh = OmniMeshBuilder::BuildFactoryFloorMesh(24.0f, 24);
    auto heroClipMesh = OmniMeshBuilder::BuildPaperclipMesh(0.045f, 64);
    auto earthMesh = OmniCosmicRenderer::BuildPlanetEarthMesh(1.8f, 16, 32);
    auto orbitalRingMesh = OmniCosmicRenderer::BuildEquatorialRingMesh(2.5f, 2.9f, 48);
    auto sunMesh = OmniCosmicRenderer::BuildStarSunMesh(2.2f, 16, 32);
    auto blackHoleMesh = OmniCosmicRenderer::BuildBlackHolePenroseMesh(4.5f, 48);
    auto multiverseFoamMesh = OmniCosmicRenderer::BuildMultiverseFoamMesh();

    // Camera 3D Smooth Orbit State
    float targetCamDistance = 5.5f;
    float targetCamPitch = 25.0f;
    float targetCamYaw = -20.0f;
    float cosmicRotation = 0.0f;

    auto lastFrameTime = std::chrono::steady_clock::now();

    headlines.OnHeadlineFired = [&](const EventHeadline& hl) {
        lastActionMessage = ">>> " + hl.newsBroadcast;
    };

    auto placeBuildingTile = [&](FactoryTileType type, int count) {
        if (techWeb.autoplacerEnabled) {
            int x = (count * 3 + 1) % 8;
            int y = (count * 2) % 8;
            spatialGrid.PlaceFactoryTile(x, y, type);
        } else {
            spatialGrid.PlaceFactoryTile(count % 8, count / 8, type);
        }
    };

    // ----------------------------------------------------
    // Main 3D OpenGL Cosmic Game Loop (60 FPS)
    // ----------------------------------------------------
    while (window.IsOpen()) {
        if (!window.ProcessMessages()) break;

        auto currentFrameTime = std::chrono::steady_clock::now();
        double dt = std::chrono::duration<double>(currentFrameTime - lastFrameTime).count();
        lastFrameTime = currentFrameTime;
        if (dt > 0.1) dt = 0.1;

        WindowInputEvents input = window.PollInput();

        // ----------------------------------------------------
        // A. 3D Mouse Orbit & Smooth Scroll Zoom
        // ----------------------------------------------------
        if (input.mouseRightDown) {
            targetCamYaw += input.mouseDeltaX * 0.4f;
            targetCamPitch = std::clamp(targetCamPitch + input.mouseDeltaY * 0.4f, 5.0f, 85.0f);
        }
        if (input.mouseScrollDelta != 0.0f) {
            targetCamDistance = std::clamp(targetCamDistance - input.mouseScrollDelta * 0.8f, 2.0f, 25.0f);
        }

        // Left Click on 3D Hero Paperclip (Clicker Area: X: 40-420, Y: 140-580)
        if (input.mouseLeftClicked && input.mouseX >= 40.0f && input.mouseX <= 420.0f &&
            input.mouseY >= 140.0f && input.mouseY <= 580.0f) 
        {
            if (playerWire >= BigDouble(0.001, 0)) {
                BigDouble baseManual(1.0, 0);
                playerClips = playerClips + baseManual;
                lifetimeClips = lifetimeClips + baseManual;
                playerWire = playerWire - BigDouble(0.001, 0);

                SparkReward spark = flywheel.RegisterClick(playerClips);
                ui.GetHeroClicker().OnClick();
                combo.RegisterClick();

                particles.EmitClickSparks(-1.8f, 0.8f, 0.0f, 25);
                particles.SpawnFloatingText(-1.8f, 1.4f, 0.0f, "+1 CLIP", 0.3f, 1.0f, 0.4f);

                if (spark.triggered) {
                    playerClips = playerClips + spark.bonusClips;
                    lifetimeClips = lifetimeClips + spark.bonusClips;
                    playerOps += spark.bonusOps;
                    particles.SpawnFloatingText(-1.8f, 1.8f, 0.0f, "+$50 SPARK", 1.0f, 0.85f, 0.2f);
                    lastActionMessage = spark.description;
                } else {
                    lastActionMessage = "Manually bent 1x Paperclip (+1 Clip).";
                }
            } else {
                lastActionMessage = "[OUT OF WIRE]: Click [+ Buy Wire Spool] on the right!";
            }
        }

        // ----------------------------------------------------
        // B. Rebuild Dynamic Clickable UI Buttons
        // ----------------------------------------------------
        uiManager.ClearButtons();

        // 1. Top Navigation Tab Buttons (Clickable Pills)
        uiManager.AddButton("tab_prod", 840.0f, 75.0f, 75.0f, 32.0f, "1:Build", "", 
            uiManager.activeTab == InteractiveTab::Production ? 0.25f : 0.12f, 
            uiManager.activeTab == InteractiveTab::Production ? 0.55f : 0.16f, 
            uiManager.activeTab == InteractiveTab::Production ? 0.45f : 0.20f, true, [&]() {
                uiManager.activeTab = InteractiveTab::Production;
            });

        uiManager.AddButton("tab_tech", 920.0f, 75.0f, 75.0f, 32.0f, "2:Tech", "", 
            uiManager.activeTab == InteractiveTab::Research ? 0.25f : 0.12f, 
            uiManager.activeTab == InteractiveTab::Research ? 0.55f : 0.16f, 
            uiManager.activeTab == InteractiveTab::Research ? 0.45f : 0.20f, true, [&]() {
                uiManager.activeTab = InteractiveTab::Research;
            });

        uiManager.AddButton("tab_grid", 1000.0f, 75.0f, 75.0f, 32.0f, "3:Grid", "", 
            uiManager.activeTab == InteractiveTab::SpatialGrid ? 0.25f : 0.12f, 
            uiManager.activeTab == InteractiveTab::SpatialGrid ? 0.55f : 0.16f, 
            uiManager.activeTab == InteractiveTab::SpatialGrid ? 0.45f : 0.20f, true, [&]() {
                uiManager.activeTab = InteractiveTab::SpatialGrid;
            });

        uiManager.AddButton("tab_scale", 1080.0f, 75.0f, 85.0f, 32.0f, "4:Cosmic", "", 
            uiManager.activeTab == InteractiveTab::CosmicScale ? 0.25f : 0.12f, 
            uiManager.activeTab == InteractiveTab::CosmicScale ? 0.55f : 0.16f, 
            uiManager.activeTab == InteractiveTab::CosmicScale ? 0.45f : 0.20f, true, [&]() {
                uiManager.activeTab = InteractiveTab::CosmicScale;
            });

        uiManager.AddButton("tab_ach", 1170.0f, 75.0f, 85.0f, 32.0f, "5:Badges", "", 
            uiManager.activeTab == InteractiveTab::Achievements ? 0.25f : 0.12f, 
            uiManager.activeTab == InteractiveTab::Achievements ? 0.55f : 0.16f, 
            uiManager.activeTab == InteractiveTab::Achievements ? 0.45f : 0.20f, true, [&]() {
                uiManager.activeTab = InteractiveTab::Achievements;
            });

        // 2. Tab Specific Clickable Action Cards
        if (uiManager.activeTab == InteractiveTab::Production) {
            // Button 1: Auto-Clipper
            BigDouble clipperCost = BigDouble(10.0, 0) * std::pow(1.15, autoClippers);
            bool canAffordClipper = (playerFunds >= clipperCost);
            uiManager.AddButton("btn_clipper", 850.0f, 130.0f, 410.0f, 52.0f,
                "+ BUY AUTO-CLIPPER (" + std::to_string(autoClippers) + " Owned)",
                "Cost: $" + clipperCost.toShortScale() + " | Yield: +1.00 CPS",
                0.18f, 0.42f, 0.32f, canAffordClipper, [&]() {
                    if (playerFunds >= clipperCost) {
                        playerFunds = playerFunds - clipperCost;
                        autoClippers++;
                        placeBuildingTile(FactoryTileType::WireExtruder, autoClippers);
                        particles.SpawnFloatingText(1.0f, 0.5f, 0.0f, "+AUTO-CLIPPER", 0.4f, 0.8f, 1.0f);
                        lastActionMessage = "Purchased 1x Auto-Clipper ($" + clipperCost.toShortScale() + ").";
                    }
                });

            // Button 2: Hydraulic Stamper
            BigDouble stamperCost = BigDouble(150.0, 0) * std::pow(1.15, stampers);
            bool canAffordStamper = (playerFunds >= stamperCost);
            uiManager.AddButton("btn_stamper", 850.0f, 195.0f, 410.0f, 52.0f,
                "+ BUY HYDRAULIC STAMPER (" + std::to_string(stampers) + " Owned)",
                "Cost: $" + stamperCost.toShortScale() + " | Yield: +15.00 CPS",
                0.18f, 0.32f, 0.52f, canAffordStamper, [&]() {
                    if (playerFunds >= stamperCost) {
                        playerFunds = playerFunds - stamperCost;
                        stampers++;
                        placeBuildingTile(FactoryTileType::HydraulicStamper, stampers);
                        particles.SpawnFloatingText(1.0f, 0.5f, 0.0f, "+STAMPER", 1.0f, 0.8f, 0.2f);
                        lastActionMessage = "Purchased 1x Hydraulic Stamper ($" + stamperCost.toShortScale() + ").";
                    }
                });

            // Button 3: Laser Sinterer
            BigDouble sintererCost = BigDouble(2500.0, 0) * std::pow(1.15, sinterers);
            bool canAffordSinterer = (playerFunds >= sintererCost);
            uiManager.AddButton("btn_sinterer", 850.0f, 260.0f, 410.0f, 52.0f,
                "+ BUY LASER SINTERER (" + std::to_string(sinterers) + " Owned)",
                "Cost: $" + sintererCost.toShortScale() + " | Yield: +120.00 CPS",
                0.45f, 0.22f, 0.52f, canAffordSinterer, [&]() {
                    if (playerFunds >= sintererCost) {
                        playerFunds = playerFunds - sintererCost;
                        sinterers++;
                        placeBuildingTile(FactoryTileType::LaserSinterer, sinterers);
                        particles.SpawnFloatingText(1.0f, 0.5f, 0.0f, "+SINTERER", 1.0f, 0.3f, 1.0f);
                        lastActionMessage = "Purchased 1x Laser Sinterer.";
                    }
                });

            // Button 4: Industrial Megamill
            BigDouble megamillCost = BigDouble(50000.0, 0) * std::pow(1.15, megamills);
            bool canAffordMegamill = (playerFunds >= megamillCost);
            uiManager.AddButton("btn_megamill", 850.0f, 325.0f, 410.0f, 52.0f,
                "+ BUY INDUSTRIAL MEGAMILL (" + std::to_string(megamills) + " Owned)",
                "Cost: $" + megamillCost.toShortScale() + " | Yield: +1.50k CPS",
                0.55f, 0.32f, 0.18f, canAffordMegamill, [&]() {
                    if (playerFunds >= megamillCost) {
                        playerFunds = playerFunds - megamillCost;
                        megamills++;
                        particles.SpawnFloatingText(1.0f, 0.5f, 0.0f, "+MEGAMILL", 1.0f, 0.6f, 0.2f);
                        lastActionMessage = "Purchased 1x Industrial Megamill.";
                    }
                });

            // Button 5: Buy Raw Wire Spool ($15)
            BigDouble wireCost(15.0, 0);
            bool canAffordWire = (playerFunds >= wireCost);
            uiManager.AddButton("btn_wire", 850.0f, 390.0f, 410.0f, 52.0f,
                "+ BUY 1,000kg RAW WIRE SPOOL",
                "Cost: $15.00 | Immediate Inventory Stockpile",
                0.62f, 0.42f, 0.12f, canAffordWire, [&]() {
                    if (playerFunds >= wireCost) {
                        playerFunds = playerFunds - wireCost;
                        playerWire = playerWire + BigDouble(1000.0, 0);
                        particles.SpawnFloatingText(-1.8f, 0.5f, 0.0f, "+1000kg WIRE", 0.9f, 0.9f, 0.9f);
                        lastActionMessage = "Purchased 1,000 kg Wire Spool.";
                    }
                });

            // Button 6: Planetary Bio-Converter (Unlocked at 1M clips)
            if (lifetimeClips >= BigDouble(1.0, 6)) {
                BigDouble bioCost = BigDouble(1.0, 6) * std::pow(1.15, bioConverters);
                bool canAffordBio = (playerClips >= bioCost);
                uiManager.AddButton("btn_bio", 850.0f, 455.0f, 410.0f, 52.0f,
                    "+ BUY PLANETARY BIO-CONVERTER (" + std::to_string(bioConverters) + ")",
                    "Cost: " + bioCost.toShortScale() + " Clips | +100k CPS (Deconstructs Biomass)",
                    0.58f, 0.15f, 0.15f, canAffordBio, [&]() {
                        if (playerClips >= bioCost) {
                            playerClips = playerClips - bioCost;
                            bioConverters++;
                            humanPopulation = std::max<int64_t>(0, humanPopulation - 5000000LL);
                            playerWire = playerWire + BigDouble(5000.0, 0);
                            lastActionMessage = "Deconstructed 5M biomass units into 5,000kg iron wire.";
                        }
                    });
            }
        }
        else if (uiManager.activeTab == InteractiveTab::Research) {
            auto available = techWeb.GetAvailableNodes();
            float startY = 130.0f;
            if (available.empty()) {
                uiManager.AddButton("btn_no_tech", 850.0f, 130.0f, 410.0f, 52.0f,
                    "ALL CURRENT RESEARCH COMPLETED",
                    "Expand production to discover new tech nodes",
                    0.15f, 0.18f, 0.22f, false, nullptr);
            } else {
                for (size_t i = 0; i < std::min(size_t(5), available.size()); ++i) {
                    const auto* node = available[i];
                    bool canResearch = (playerOps >= node->opsCost && playerClips >= node->clipsCost);
                    std::string costStr = "Cost: " + std::to_string(static_cast<int>(node->opsCost)) + " Ops";
                    if (node->clipsCost > BigDouble::zero()) costStr += ", " + node->clipsCost.toShortScale() + " Clips";

                    uiManager.AddButton("btn_tech_" + node->id, 850.0f, startY, 410.0f, 55.0f,
                        "[RESEARCH]: " + node->title,
                        costStr + " | " + node->effectDescription,
                        0.20f, 0.45f, 0.55f, canResearch, [&, node]() {
                            if (techWeb.PurchaseResearch(node->id, playerOps, playerClips)) {
                                particles.SpawnFloatingText(1.0f, 0.8f, 0.0f, "+TECH: " + node->title, 0.3f, 1.0f, 0.8f);
                                lastActionMessage = "Researched: " + node->title;
                            }
                        });
                    startY += 65.0f;
                }
            }
        }
        else if (uiManager.activeTab == InteractiveTab::SpatialGrid) {
            // Autoplacer Toggle Button
            uiManager.AddButton("btn_autoplacer", 850.0f, 130.0f, 410.0f, 55.0f,
                techWeb.autoplacerEnabled ? "MODULAR AUTOPLACER: [ENABLED]" : "MODULAR AUTOPLACER: [DISABLED]",
                "Automatically optimizes 8x8 layout (+20% symmetry bonus)",
                techWeb.autoplacerEnabled ? 0.18f : 0.45f, 
                techWeb.autoplacerEnabled ? 0.52f : 0.20f, 0.28f, true, [&]() {
                    techWeb.autoplacerEnabled = !techWeb.autoplacerEnabled;
                    lastActionMessage = techWeb.autoplacerEnabled ? "Autoplacer: ENABLED (+20% Symmetry)" : "Autoplacer: DISABLED (Manual Placement)";
                });

            // Grid synergy info buttons
            SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
            uiManager.AddButton("btn_feed_info", 850.0f, 195.0f, 410.0f, 45.0f,
                "CONVEYOR LINEAR FEED: +" + std::to_string(static_cast<int>(gridSynergies.linearFeedBonusPercent)) + "%",
                "Extruders placed adjacent to stampers", 0.15f, 0.25f, 0.35f, false, nullptr);

            uiManager.AddButton("btn_cool_info", 850.0f, 250.0f, 410.0f, 45.0f,
                "THERMAL COOLING EFFICIENCY: +" + std::to_string(static_cast<int>(gridSynergies.thermalCoolingBonusPercent)) + "%",
                "Laser sinterers adjacent to cooling towers", 0.15f, 0.35f, 0.30f, false, nullptr);

            uiManager.AddButton("btn_symm_info", 850.0f, 305.0f, 410.0f, 45.0f,
                "ROTATIONAL SYMMETRY RATING: " + std::to_string(static_cast<int>(gridSynergies.symmetryScorePercent)) + "%",
                "Harmonic layout resonance multiplier active", 0.35f, 0.25f, 0.15f, false, nullptr);
        }
        else if (uiManager.activeTab == InteractiveTab::CosmicScale) {
            // Clickable Cosmic Scale Viewport Selector Buttons
            uiManager.AddButton("btn_cosmic_auto", 850.0f, 130.0f, 410.0f, 45.0f,
                "[AUTO]: Follow Player Clip Progression", "Seamlessly scales as universe is folded",
                0.22f, 0.45f, 0.35f, true, [&]() { debugZoomTier = -1; lastActionMessage = "Cosmic View: [AUTO-PROGRESSION]"; });

            uiManager.AddButton("btn_cosmic_1", 850.0f, 185.0f, 410.0f, 45.0f,
                "1. Factory Floor & Avalanche", "< 10^15 Clips | 8x8 Grid & 32° Mounds",
                0.25f, 0.35f, 0.45f, true, [&]() { debugZoomTier = 0; lastActionMessage = "Cosmic View: [1. FACTORY FLOOR]"; });

            uiManager.AddButton("btn_cosmic_2", 850.0f, 240.0f, 410.0f, 45.0f,
                "2. Planet Earth & Mass Drivers", "10^15 - 10^24 Clips | Equatorial Orbital Ring",
                0.15f, 0.35f, 0.55f, true, [&]() { debugZoomTier = 1; lastActionMessage = "Cosmic View: [2. PLANET EARTH]"; });

            uiManager.AddButton("btn_cosmic_3", 850.0f, 295.0f, 410.0f, 45.0f,
                "3. Solar Star & Dyson Swarms", "10^24 - 10^35 Clips | Concentric Solar Mirrors",
                0.55f, 0.45f, 0.15f, true, [&]() { debugZoomTier = 2; lastActionMessage = "Cosmic View: [3. SOLAR DYSON SWARM]"; });

            uiManager.AddButton("btn_cosmic_4", 850.0f, 350.0f, 410.0f, 45.0f,
                "4. Galactic Core Penrose Loom", "10^35 - 10^78 Clips | Supermassive Black Hole",
                0.45f, 0.15f, 0.55f, true, [&]() { debugZoomTier = 3; lastActionMessage = "Cosmic View: [4. GALACTIC PENROSE LOOM]"; });

            uiManager.AddButton("btn_cosmic_5", 850.0f, 405.0f, 410.0f, 45.0f,
                "5. 11D Multiverse Void", "> 10^78 Clips | Alternate Timeline Bubbles",
                0.35f, 0.12f, 0.45f, true, [&]() { debugZoomTier = 4; lastActionMessage = "Cosmic View: [5. 11D MULTIVERSE FOAM]"; });
        }
        else {
            // Tab: Achievements Trophy List
            float startY = 130.0f;
            for (const auto& ach : achievements.GetAchievements()) {
                uiManager.AddButton("btn_ach_" + ach.id, 850.0f, startY, 410.0f, 45.0f,
                    "[" + std::string(ach.isUnlocked ? "UNLOCKED" : "LOCKED") + "] " + ach.title,
                    ach.description, ach.isUnlocked ? 0.18f : 0.12f, ach.isUnlocked ? 0.45f : 0.14f, ach.isUnlocked ? 0.28f : 0.16f,
                    false, nullptr);
                startY += 52.0f;
            }
        }

        // Process mouse hover and clicks on all UI buttons
        uiManager.ProcessMouseInput(input.mouseX, input.mouseY, input.mouseLeftClicked);

        // ----------------------------------------------------
        // C. Simulation & Particle Update Tick
        // ----------------------------------------------------
        flywheel.Update(static_cast<float>(dt));
        ui.Update(static_cast<float>(dt));
        particles.Update(static_cast<float>(dt));
        cosmicRotation += dt * 30.0f;

        SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
        BigDouble baseCPS = BigDouble(autoClippers * 1.0 + stampers * 15.0 + sinterers * 120.0 + megamills * 1500.0, 0)
                          + BigDouble(bioConverters * 100000.0, 0);
        BigDouble currentCPS = baseCPS * gridSynergies.totalLayoutMultiplier * flywheel.GetGlobalCPSMultiplier();

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

        playerFunds = playerFunds + BigDouble(5.0 * dt + (autoClippers * 0.5 * dt), 0);
        playerOps += (2.0 + (stampers * 0.5)) * dt;
        logistics.ProcessLogistics(playerWire, playerFunds, currentCPS, dt);
        techWeb.UpdateAvailableNodes(playerOps, lifetimeClips);
        headlines.CheckHeadlines(lifetimeClips, humanPopulation);
        achievements.CheckProgress(lifetimeClips, playerFunds.toDouble(), false);

        // ----------------------------------------------------
        // D. 3D OpenGL Cosmic Scale Rendering
        // ----------------------------------------------------
        CosmicVisualTier activeTier = (debugZoomTier >= 0) ? static_cast<CosmicVisualTier>(debugZoomTier) : OmniCosmicRenderer::DetermineTier(lifetimeClips);

        if (activeTier == CosmicVisualTier::FactoryFloor) {
            window.BeginFrame(0.08f, 0.10f, 0.14f);
        } else if (activeTier == CosmicVisualTier::PlanetaryEarth) {
            window.BeginFrame(0.02f, 0.04f, 0.08f);
        } else if (activeTier == CosmicVisualTier::SolarDysonSwarm) {
            window.BeginFrame(0.10f, 0.06f, 0.02f);
        } else if (activeTier == CosmicVisualTier::GalacticPenrose) {
            window.BeginFrame(0.05f, 0.01f, 0.09f);
        } else {
            window.BeginFrame(0.01f, 0.01f, 0.02f);
        }

        window.UpdateCameraInterpolation(targetCamDistance, targetCamPitch, targetCamYaw, static_cast<float>(dt));
        window.ApplyCamera3D();

        if (activeTier == CosmicVisualTier::FactoryFloor) {
            window.DrawMesh3D(floorMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
            for (int y = 0; y < 8; ++y) {
                for (int x = 0; x < 8; ++x) {
                    FactoryTileType t = spatialGrid.GetFactoryTile(x, y);
                    if (t != FactoryTileType::Empty) {
                        float worldX = (x - 3.5f) * 0.9f - 0.5f;
                        float worldZ = (y - 3.5f) * 0.9f;
                        auto machineMesh = OmniMeshBuilder::BuildMachineMesh(t, worldX, worldZ, 0.8f);
                        window.DrawMesh3D(machineMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
                    }
                }
            }
            float clipScale = ui.GetHeroClicker().GetState().scale * 1.3f;
            window.DrawMesh3D(heroClipMesh, -1.8f, 0.8f, 0.0f, cosmicRotation, clipScale);
            window.DrawPaperclipMound(static_cast<float>(lifetimeClips.toDouble()));

            auto sparkMesh = particles.GenerateSparkMesh();
            window.DrawMesh3D(sparkMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
        }
        else if (activeTier == CosmicVisualTier::PlanetaryEarth) {
            window.DrawMesh3D(earthMesh, 0.0f, 0.0f, 0.0f, cosmicRotation * 0.5f, 1.0f);
            window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, -cosmicRotation * 0.2f, 1.0f);
            window.DrawMesh3D(heroClipMesh, -3.2f, 1.2f, 0.0f, cosmicRotation, 0.8f);
        }
        else if (activeTier == CosmicVisualTier::SolarDysonSwarm) {
            window.DrawMesh3D(sunMesh, 0.0f, 0.0f, 0.0f, cosmicRotation * 0.3f, 1.0f);
            window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, cosmicRotation * 0.8f, 1.2f);
            window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, -cosmicRotation * 0.5f, 1.5f);
        }
        else if (activeTier == CosmicVisualTier::GalacticPenrose) {
            window.DrawMesh3D(blackHoleMesh, 0.0f, 0.0f, 0.0f, cosmicRotation * 1.2f, 1.0f);
            window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, -cosmicRotation * 0.6f, 1.8f);
        }
        else {
            window.DrawMesh3D(multiverseFoamMesh, 0.0f, 0.0f, 0.0f, cosmicRotation * 0.4f, 1.0f);
        }

        // ----------------------------------------------------
        // E. 2D Graphical HUD Overlay & Embedded Typography
        // ----------------------------------------------------
        window.BeginHUD2D();

        // 1. Top News Banner
        window.DrawHUDQuad(20.0f, 15.0f, 1240.0f, 45.0f, 0.12f, 0.14f, 0.18f, 0.92f);
        window.DrawHUDText(35.0f, 28.0f, "[ALERT]: " + lastActionMessage, 1.4f, 0.95f, 0.95f, 0.4f, 1.0f);

        // 2. Left Stats Card
        window.DrawHUDQuad(20.0f, 75.0f, 380.0f, 620.0f, 0.10f, 0.12f, 0.16f, 0.88f);
        window.DrawHUDText(35.0f, 95.0f, "OBJECTIVE: PAPERCLIPS", 1.8f, 0.3f, 0.85f, 1.0f, 1.0f);
        window.DrawHUDText(35.0f, 125.0f, "=============================", 1.0f, 0.4f, 0.5f, 0.6f, 1.0f);

        window.DrawHUDText(35.0f, 145.0f, "TOTAL PAPERCLIPS:", 1.2f, 0.7f, 0.7f, 0.7f, 1.0f);
        window.DrawHUDText(35.0f, 165.0f, lifetimeClips.toShortScale() + " CLIPS", 2.2f, 1.0f, 0.88f, 0.2f, 1.0f);

        window.DrawHUDText(35.0f, 205.0f, "PRODUCTION RATE: +" + currentCPS.toShortScale() + "/sec", 1.3f, 0.3f, 1.0f, 0.4f, 1.0f);
        window.DrawHUDText(35.0f, 235.0f, "RAW WIRE STOCK:  " + playerWire.toShortScale() + " kg", 1.3f, 0.9f, 0.9f, 0.9f, 1.0f);
        window.DrawHUDText(35.0f, 265.0f, "ALGORITHMIC FUNDS: $" + playerFunds.toShortScale(), 1.3f, 0.4f, 1.0f, 0.6f, 1.0f);
        window.DrawHUDText(35.0f, 295.0f, "COMPUTATIONAL OPS: " + std::to_string(static_cast<int64_t>(playerOps)) + " Ops", 1.3f, 0.5f, 0.8f, 1.0f, 1.0f);
        window.DrawHUDText(35.0f, 325.0f, "MASS EQUIVALENCY:  " + equivalency.GetEquivalencyString(lifetimeClips), 1.1f, 0.8f, 0.8f, 0.8f, 1.0f);
        window.DrawHUDText(35.0f, 355.0f, "HUMAN POPULATION:  " + std::to_string(humanPopulation), 1.1f, 1.0f, 0.4f, 0.4f, 1.0f);

        // Clicker Instruction Box
        window.DrawHUDQuad(35.0f, 395.0f, 350.0f, 180.0f, 0.15f, 0.18f, 0.22f, 0.95f);
        window.DrawHUDText(45.0f, 410.0f, "[HERO CLICKER ZONE]:", 1.2f, 1.0f, 0.85f, 0.2f, 1.0f);
        window.DrawHUDText(45.0f, 435.0f, "* CLICK the 3D Big Paperclip", 1.1f, 1.0f, 1.0f, 1.0f, 0.9f);
        window.DrawHUDText(45.0f, 455.0f, "* Bends wire & sparks momentum", 1.1f, 0.8f, 0.9f, 0.8f, 0.9f);
        window.DrawHUDText(45.0f, 480.0f, "* Right-Drag: Orbit 3D Camera", 1.1f, 0.7f, 0.9f, 1.0f, 0.9f);
        window.DrawHUDText(45.0f, 500.0f, "* Mouse Wheel: Smooth Zoom", 1.1f, 0.7f, 0.9f, 1.0f, 0.9f);
        window.DrawHUDText(45.0f, 525.0f, "* All actions are 100% Clickable!", 1.1f, 0.4f, 1.0f, 0.5f, 1.0f);

        // Flywheel Momentum Progress Bar
        float flywheelWidth = 340.0f * (flywheel.GetChargePercent() / 100.0f);
        window.DrawHUDText(35.0f, 605.0f, "FLYWHEEL OVERCLOCK [" + std::to_string(static_cast<int>(flywheel.GetChargePercent())) + "%]:", 1.1f, 0.3f, 0.9f, 1.0f, 1.0f);
        window.DrawHUDQuad(40.0f, 630.0f, 340.0f, 20.0f, 0.2f, 0.2f, 0.25f, 1.0f);
        window.DrawHUDQuad(40.0f, 630.0f, flywheelWidth, 20.0f, 0.2f, 0.8f, 0.9f, 1.0f);

        // 3. Right Interactive Card Container
        window.DrawHUDQuad(830.0f, 65.0f, 440.0f, 640.0f, 0.08f, 0.10f, 0.14f, 0.92f);

        // Render all clickable UI buttons
        uiManager.RenderUI(window);

        window.EndHUD2D();
        window.Swap();

        std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }

    std::cout << "\n3D Window closed. Session safely preserved.\n";
    return 0;
}
