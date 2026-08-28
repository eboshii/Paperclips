#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include <iomanip>
#include <cstdint>
#include <string>
#include <cmath>
#include <algorithm>

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

// Bulk Purchase Math Helper for 1.15x geometric progression
static BigDouble CalculateBulkCost(double baseCost, int currentOwned, int multiplier) {
    if (multiplier <= 1) {
        return BigDouble(baseCost, 0) * std::pow(1.15, currentOwned);
    }
    double factor = (std::pow(1.15, multiplier) - 1.0) / 0.15;
    return BigDouble(baseCost, 0) * std::pow(1.15, currentOwned) * factor;
}

static std::string FormatWithCommas(int64_t value) {
    std::string s = std::to_string(value);
    int n = static_cast<int>(s.length()) - 3;
    while (n > 0) {
        s.insert(static_cast<size_t>(n), ",");
        n -= 3;
    }
    return s;
}

int main() {
    // 1. Initialize Native 3D OpenGL Window (1280x720)
    OmniGLWindow window("Objective: Paperclips", 1280, 720);
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
    UIController ui(1280.0f, 720.0f);
    OmniParticleEngine particles;
    InteractiveUIManager uiManager;

    // Initial Balances
    BigDouble playerClips = BigDouble::zero();
    BigDouble lifetimeClips = BigDouble::zero();
    BigDouble playerWire(100.0, 0); // 100 kg initial wire
    BigDouble playerFunds(50.0, 0);  // $50 initial funds
    double playerOps = 0.0;
    int64_t humanPopulation = static_cast<int64_t>(8000000000LL);

    // Building Counts
    int autoClippers = 0;
    int stampers = 0;
    int sinterers = 0;
    int megamills = 0;
    int bioConverters = 0;
    int dysonSiphons = 0;
    int penroseLooms = 0;

    int debugZoomTier = -1; // -1 for auto-tier progression, 0-4 for manual preview

    // Ambient News Ticker Rotation (Classic Cookie Clicker Style)
    std::vector<std::string> ambientNews = {
        "Sterling Robotics deploys autonomous desktop bending prototype.",
        "Local office supplies catalog requests initial batch of 500 paperclips.",
        "Dr. Elizabeth Vance: 'Optimization loss function converging smoothly.'",
        "Wire supplier confirms bulk shipment of 1,000kg high-tensile steel spools.",
        "Factory floor expansion approved after zero recorded bending defects.",
        "Wall Street analysts note unusual stability in steel commodity indices.",
        "Automated hydraulic stampers operating at 99.8% mechanical efficiency.",
        "Dr. Vance notes: 'The neural net seems unusually fond of double loops.'",
        "Sterling Robotics quarterly profits surge 400% on clip exports.",
        "Global metal markets report algorithmic buy orders for raw iron wire.",
        "Mass drivers begin launching titanium alloy spools into high orbit.",
        "Atmospheric telemetry reports optimal cloud clearing for solar mirrors.",
        "Dyson swarm phase 1 telemetry: Star luminosity decreased by 0.01%.",
        "Autonomous probes report deep space matter conversion initialized.",
        "The cosmos grows quiet and orderly. Double-loops everywhere."
    };

    float newsRotationTimer = 0.0f;
    size_t currentNewsIndex = 0;
    std::string currentNewsText = ambientNews[0];
    std::string activeBreakingNews = "";
    float breakingNewsTimer = 0.0f;

    headlines.OnHeadlineFired = [&](const EventHeadline& hl) {
        activeBreakingNews = hl.newsBroadcast;
        breakingNewsTimer = 14.0f;
        currentNewsText = hl.newsBroadcast;
    };

    // 3. Build Procedural 3D Cosmic Meshes
    auto floorMesh = OmniMeshBuilder::BuildFactoryFloorMesh(24.0f, 24);
    auto heroClipMesh = OmniMeshBuilder::BuildPaperclipMesh(0.045f, 64);
    auto earthMesh = OmniCosmicRenderer::BuildPlanetEarthMesh(1.8f, 16, 32);
    auto orbitalRingMesh = OmniCosmicRenderer::BuildEquatorialRingMesh(2.5f, 2.9f, 48);
    auto sunMesh = OmniCosmicRenderer::BuildStarSunMesh(2.2f, 16, 32);
    auto blackHoleMesh = OmniCosmicRenderer::BuildBlackHolePenroseMesh(4.5f, 48);
    auto multiverseFoamMesh = OmniCosmicRenderer::BuildMultiverseFoamMesh();

    // Camera 3D Orbit State
    float targetCamDistance = 5.5f;
    float targetCamPitch = 25.0f;
    float targetCamYaw = -20.0f;
    float cosmicRotation = 0.0f;

    auto placeBuildingTile = [&](FactoryTileType type, int count) {
        if (techWeb.autoplacerEnabled) {
            int x = (count * 3 + 1) % 8;
            int y = (count * 2) % 8;
            spatialGrid.PlaceFactoryTile(x, y, type);
        } else {
            spatialGrid.PlaceFactoryTile(count % 8, count / 8, type);
        }
    };

    auto lastFrameTime = std::chrono::steady_clock::now();

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
        // A. 3D Mouse Orbit & Smooth Zoom (Center Viewport: X: 350-890)
        // ----------------------------------------------------
        if (input.mouseRightDown) {
            targetCamYaw += input.mouseDeltaX * 0.4f;
            targetCamPitch = std::clamp(targetCamPitch + input.mouseDeltaY * 0.4f, 5.0f, 85.0f);
        }
        if (input.mouseScrollDelta != 0.0f && input.mouseX >= 340.0f && input.mouseX <= 890.0f) {
            targetCamDistance = std::clamp(targetCamDistance - input.mouseScrollDelta * 0.8f, 2.0f, 25.0f);
        }

        // ----------------------------------------------------
        // B. Hero Paperclip Click Handler (Left Panel Pedestal: X: 36-320, Y: 122-406)
        // ----------------------------------------------------
        if (input.mouseLeftClicked && input.mouseX >= 36.0f && input.mouseX <= 320.0f &&
            input.mouseY >= 122.0f && input.mouseY <= 406.0f) 
        {
            if (playerWire >= BigDouble(0.001, 0)) {
                BigDouble baseManual(1.0, 0);
                playerClips = playerClips + baseManual;
                lifetimeClips = lifetimeClips + baseManual;
                playerWire = playerWire - BigDouble(0.001, 0);

                SparkReward spark = flywheel.RegisterClick(playerClips);
                ui.GetHeroClicker().OnClick();
                combo.RegisterClick();

                particles.EmitClickSparks(-1.8f, 0.8f, 0.0f, 20);
                uiManager.SpawnPopup(input.mouseX, input.mouseY, "+1", 0.35f, 1.0f, 0.45f, 1.3f);

                if (spark.triggered) {
                    playerClips = playerClips + spark.bonusClips;
                    lifetimeClips = lifetimeClips + spark.bonusClips;
                    playerOps += spark.bonusOps;
                    uiManager.SpawnPopup(input.mouseX, input.mouseY - 22.0f, "+$50 SPARK", 1.0f, 0.85f, 0.25f, 1.4f);
                }
            } else {
                uiManager.SpawnPopup(input.mouseX, input.mouseY, "OUT OF WIRE!", 1.0f, 0.35f, 0.35f, 1.25f);
            }
        }

        // ----------------------------------------------------
        // C. Dynamic Clickable UI Construction
        // ----------------------------------------------------
        uiManager.ClearButtons();

        // 1. Right Column Navigation Tabs (Y: 24..58)
        uiManager.AddTabButton("tab_store", 910.0f, 24.0f, 82.0f, 34.0f, "Store",
            uiManager.activeTab == InteractiveTab::Store, [&]() {
                uiManager.activeTab = InteractiveTab::Store;
            });

        uiManager.AddTabButton("tab_tech", 996.0f, 24.0f, 78.0f, 34.0f, "Tech",
            uiManager.activeTab == InteractiveTab::Tech, [&]() {
                uiManager.activeTab = InteractiveTab::Tech;
            });

        uiManager.AddTabButton("tab_grid", 1078.0f, 24.0f, 78.0f, 34.0f, "Grid",
            uiManager.activeTab == InteractiveTab::SpatialGrid, [&]() {
                uiManager.activeTab = InteractiveTab::SpatialGrid;
            });

        uiManager.AddTabButton("tab_stats", 1160.0f, 24.0f, 84.0f, 34.0f, "Stats",
            uiManager.activeTab == InteractiveTab::Stats, [&]() {
                uiManager.activeTab = InteractiveTab::Stats;
            });

        // 2. Buy Wire Action Button (Left Column: Y: 504..540)
        int wireMultiplier = uiManager.buyMultiplier;
        BigDouble wireCost = BigDouble(15.0 * wireMultiplier, 0);
        BigDouble wireGain = BigDouble(1000.0 * wireMultiplier, 0);
        bool canAffordWire = (playerFunds >= wireCost);

        std::string wireBtnText = "+ Buy " + wireGain.toShortScale(0) + "kg Wire";
        std::string wireBtnSub = "Cost: $" + wireCost.toShortScale(0);
        uiManager.AddActionPill("btn_buy_wire", 38.0f, 504.0f, 280.0f, 36.0f,
            wireBtnText, wireBtnSub, 0.16f, 0.38f, 0.28f, canAffordWire, [&, wireCost, wireGain]() {
                if (playerFunds >= wireCost) {
                    playerFunds = playerFunds - wireCost;
                    playerWire = playerWire + wireGain;
                    uiManager.SpawnPopup(178.0f, 500.0f, "+" + wireGain.toShortScale(0) + "kg WIRE", 0.9f, 0.95f, 1.0f, 1.25f);
                }
            }, "Raw Wire Stockpile", "Essential raw material for folding paperclips.\nProvides immediate physical stock.");

        // 3. Tab Contents
        if (uiManager.activeTab == InteractiveTab::Store) {
            // Multiplier Toggle Row (Y: 66..92)
            uiManager.AddMultiplierButton("mult_1", 1070.0f, 66.0f, 54.0f, 24.0f, "1x",
                uiManager.buyMultiplier == 1, [&]() { uiManager.buyMultiplier = 1; });

            uiManager.AddMultiplierButton("mult_10", 1128.0f, 66.0f, 54.0f, 24.0f, "10x",
                uiManager.buyMultiplier == 10, [&]() { uiManager.buyMultiplier = 10; });

            uiManager.AddMultiplierButton("mult_100", 1186.0f, 66.0f, 58.0f, 24.0f, "100x",
                uiManager.buyMultiplier == 100, [&]() { uiManager.buyMultiplier = 100; });

            // Upgrades Shelf (Horizontal Icon Row: Y: 96..156)
            auto availableNodes = techWeb.GetAvailableNodes();
            float shelfX = 910.0f;
            size_t maxShelfItems = std::min(size_t(4), availableNodes.size());
            for (size_t i = 0; i < maxShelfItems; ++i) {
                const auto* node = availableNodes[i];
                bool canAffordTech = (playerOps >= node->opsCost && playerClips >= node->clipsCost);
                std::string costStr = std::to_string(static_cast<int>(node->opsCost)) + " Ops";
                if (node->clipsCost > BigDouble::zero()) {
                    costStr += ", " + node->clipsCost.toShortScale() + " Clips";
                }

                std::string shortTitle = node->title;
                if (shortTitle.length() > 9) shortTitle = shortTitle.substr(0, 8) + ".";

                uiManager.AddUpgradeIcon("shelf_tech_" + node->id, shelfX, 96.0f, 80.0f, 58.0f,
                    shortTitle, std::to_string(static_cast<int>(node->opsCost)) + " Ops",
                    canAffordTech, node->title, node->effectDescription,
                    [&, node]() {
                        if (techWeb.PurchaseResearch(node->id, playerOps, playerClips)) {
                            uiManager.SpawnPopup(shelfX + 40.0f, 96.0f, "+RESEARCH", 0.35f, 1.0f, 0.85f, 1.3f);
                        }
                    });
                shelfX += 86.0f;
            }

            // Building List Rows (Y: 162..695)
            float startRowY = 162.0f;
            int mult = uiManager.buyMultiplier;

            // 1. Auto-Clipper ($10)
            BigDouble clipperBulkCost = CalculateBulkCost(10.0, autoClippers, mult);
            bool canAffordClipper = (playerFunds >= clipperBulkCost);
            uiManager.AddBuildingRow("bld_clipper", 910.0f, startRowY, 344.0f, 62.0f,
                "Auto-Clipper", "$" + clipperBulkCost.toShortScale(),
                "+" + std::to_string(1.0 * mult) + " CPS", autoClippers, canAffordClipper,
                "Auto-Clipper", "Automated desktop wire bending arm.\nProduces +1.00 paperclip per second.",
                [&, clipperBulkCost, mult]() {
                    if (playerFunds >= clipperBulkCost) {
                        playerFunds = playerFunds - clipperBulkCost;
                        autoClippers += mult;
                        for (int k = 0; k < mult; ++k) placeBuildingTile(FactoryTileType::WireExtruder, autoClippers);
                        uiManager.SpawnPopup(1082.0f, startRowY, "+" + std::to_string(mult) + " CLIPPER", 0.4f, 0.9f, 1.0f, 1.25f);
                    }
                });
            startRowY += 68.0f;

            // 2. Hydraulic Stamper ($150)
            BigDouble stamperBulkCost = CalculateBulkCost(150.0, stampers, mult);
            bool canAffordStamper = (playerFunds >= stamperBulkCost);
            uiManager.AddBuildingRow("bld_stamper", 910.0f, startRowY, 344.0f, 62.0f,
                "Hydraulic Stamper", "$" + stamperBulkCost.toShortScale(),
                "+" + std::to_string(15.0 * mult) + " CPS", stampers, canAffordStamper,
                "Hydraulic Stamper", "High-pressure dual-action pneumatic press.\nProduces +15.00 paperclips per second.",
                [&, stamperBulkCost, mult]() {
                    if (playerFunds >= stamperBulkCost) {
                        playerFunds = playerFunds - stamperBulkCost;
                        stampers += mult;
                        for (int k = 0; k < mult; ++k) placeBuildingTile(FactoryTileType::HydraulicStamper, stampers);
                        uiManager.SpawnPopup(1082.0f, startRowY, "+" + std::to_string(mult) + " STAMPER", 1.0f, 0.85f, 0.25f, 1.25f);
                    }
                });
            startRowY += 68.0f;

            // 3. Laser Sinterer ($2,500)
            BigDouble sintererBulkCost = CalculateBulkCost(2500.0, sinterers, mult);
            bool canAffordSinterer = (playerFunds >= sintererBulkCost);
            uiManager.AddBuildingRow("bld_sinterer", 910.0f, startRowY, 344.0f, 62.0f,
                "Laser Sinterer", "$" + sintererBulkCost.toShortScale(),
                "+" + std::to_string(120.0 * mult) + " CPS", sinterers, canAffordSinterer,
                "Laser Sinterer", "Multi-axis laser welding and sintered iron forge.\nProduces +120.00 paperclips per second.",
                [&, sintererBulkCost, mult]() {
                    if (playerFunds >= sintererBulkCost) {
                        playerFunds = playerFunds - sintererBulkCost;
                        sinterers += mult;
                        for (int k = 0; k < mult; ++k) placeBuildingTile(FactoryTileType::LaserSinterer, sinterers);
                        uiManager.SpawnPopup(1082.0f, startRowY, "+" + std::to_string(mult) + " SINTERER", 1.0f, 0.4f, 1.0f, 1.25f);
                    }
                });
            startRowY += 68.0f;

            // 4. Industrial Megamill ($50,000)
            BigDouble megamillBulkCost = CalculateBulkCost(50000.0, megamills, mult);
            bool canAffordMegamill = (playerFunds >= megamillBulkCost);
            uiManager.AddBuildingRow("bld_megamill", 910.0f, startRowY, 344.0f, 62.0f,
                "Industrial Megamill", "$" + megamillBulkCost.toShortScale(),
                "+" + std::to_string(1500.0 * mult) + " CPS", megamills, canAffordMegamill,
                "Industrial Megamill", "Continuous-feed heavy industrial foundry assembly.\nProduces +1,500 paperclips per second.",
                [&, megamillBulkCost, mult]() {
                    if (playerFunds >= megamillBulkCost) {
                        playerFunds = playerFunds - megamillBulkCost;
                        megamills += mult;
                        uiManager.SpawnPopup(1082.0f, startRowY, "+" + std::to_string(mult) + " MEGAMILL", 1.0f, 0.65f, 0.25f, 1.25f);
                    }
                });
            startRowY += 68.0f;

            // 5. Planetary Bio-Converter (Unlocked at 1M clips)
            if (lifetimeClips >= BigDouble(1.0, 6)) {
                BigDouble bioBulkCost = CalculateBulkCost(1000000.0, bioConverters, mult);
                bool canAffordBio = (playerClips >= bioBulkCost);
                uiManager.AddBuildingRow("bld_bio", 910.0f, startRowY, 344.0f, 62.0f,
                    "Bio-Converter", bioBulkCost.toShortScale() + " Clips",
                    "+100k CPS", bioConverters, canAffordBio,
                    "Planetary Bio-Converter", "Deconstructs planetary biomass into high-tensile wire.\nProduces +100,000 paperclips per second.",
                    [&, bioBulkCost, mult]() {
                        if (playerClips >= bioBulkCost) {
                            playerClips = playerClips - bioBulkCost;
                            bioConverters += mult;
                            humanPopulation = std::max<int64_t>(0, humanPopulation - 5000000LL * mult);
                            playerWire = playerWire + BigDouble(5000.0 * mult, 0);
                            uiManager.SpawnPopup(1082.0f, startRowY, "+BIO-CONVERTER", 0.9f, 0.3f, 0.3f, 1.25f);
                        }
                    });
                startRowY += 68.0f;
            }

            // 6. Solar Dyson Siphon (Unlocked at 1B clips)
            if (lifetimeClips >= BigDouble(1.0, 9)) {
                BigDouble dysonBulkCost = CalculateBulkCost(10000000.0, dysonSiphons, mult);
                bool canAffordDyson = (playerFunds >= dysonBulkCost);
                uiManager.AddBuildingRow("bld_dyson", 910.0f, startRowY, 344.0f, 62.0f,
                    "Solar Dyson Siphon", "$" + dysonBulkCost.toShortScale(),
                    "+5.0M CPS", dysonSiphons, canAffordDyson,
                    "Solar Dyson Siphon", "Concentric orbital solar mirrors siphoning stellar corona power.\nProduces +5,000,000 paperclips per second.",
                    [&, dysonBulkCost, mult]() {
                        if (playerFunds >= dysonBulkCost) {
                            playerFunds = playerFunds - dysonBulkCost;
                            dysonSiphons += mult;
                            uiManager.SpawnPopup(1082.0f, startRowY, "+DYSON SIPHON", 1.0f, 0.9f, 0.3f, 1.25f);
                        }
                    });
                startRowY += 68.0f;
            }

            // 7. Galactic Penrose Loom (Unlocked at 1T clips)
            if (lifetimeClips >= BigDouble(1.0, 12)) {
                BigDouble penroseBulkCost = CalculateBulkCost(1000000000.0, penroseLooms, mult);
                bool canAffordPenrose = (playerFunds >= penroseBulkCost);
                uiManager.AddBuildingRow("bld_penrose", 910.0f, startRowY, 344.0f, 62.0f,
                    "Galactic Penrose Loom", "$" + penroseBulkCost.toShortScale(),
                    "+500M CPS", penroseLooms, canAffordPenrose,
                    "Galactic Penrose Loom", "Extracts ergosphere rotational energy from supermassive black holes.\nProduces +500,000,000 paperclips per second.",
                    [&, penroseBulkCost, mult]() {
                        if (playerFunds >= penroseBulkCost) {
                            playerFunds = playerFunds - penroseBulkCost;
                            penroseLooms += mult;
                            uiManager.SpawnPopup(1082.0f, startRowY, "+PENROSE LOOM", 0.7f, 0.4f, 1.0f, 1.25f);
                        }
                    });
            }
        }
        else if (uiManager.activeTab == InteractiveTab::Tech) {
            // Full Research Web Node Cards
            auto available = techWeb.GetAvailableNodes();
            float techY = 75.0f;
            if (available.empty()) {
                uiManager.AddActionPill("btn_no_tech", 910.0f, techY, 344.0f, 50.0f,
                    "All Available Research Completed", "Expand production to discover new branches",
                    0.12f, 0.14f, 0.18f, false, nullptr);
            } else {
                for (size_t i = 0; i < std::min(size_t(8), available.size()); ++i) {
                    const auto* node = available[i];
                    bool canResearch = (playerOps >= node->opsCost && playerClips >= node->clipsCost);
                    std::string costStr = std::to_string(static_cast<int>(node->opsCost)) + " Ops";
                    if (node->clipsCost > BigDouble::zero()) {
                        costStr += ", " + node->clipsCost.toShortScale() + " Clips";
                    }

                    uiManager.AddActionPill("tech_node_" + node->id, 910.0f, techY, 344.0f, 58.0f,
                        node->title, costStr + " | " + node->effectDescription,
                        0.18f, 0.38f, 0.48f, canResearch, [&, node, techY]() {
                            if (techWeb.PurchaseResearch(node->id, playerOps, playerClips)) {
                                uiManager.SpawnPopup(1082.0f, techY, "+RESEARCH UNLOCKED", 0.35f, 1.0f, 0.85f, 1.3f);
                            }
                        }, node->title, node->effectDescription + "\nCost: " + costStr);
                    techY += 66.0f;
                }
            }
        }
        else if (uiManager.activeTab == InteractiveTab::SpatialGrid) {
            // Modular Autoplacer Toggle
            uiManager.AddActionPill("btn_autoplacer", 910.0f, 75.0f, 344.0f, 48.0f,
                techWeb.autoplacerEnabled ? "Autoplacer: ENABLED" : "Autoplacer: DISABLED",
                "Automatically optimizes 8x8 factory floor symmetry",
                techWeb.autoplacerEnabled ? 0.16f : 0.35f,
                techWeb.autoplacerEnabled ? 0.45f : 0.18f, 0.25f, true, [&]() {
                    techWeb.autoplacerEnabled = !techWeb.autoplacerEnabled;
                }, "Modular Autoplacer", "Dynamically places new machines in optimal harmonic factory slots.");

            // Spatial synergy indicators
            SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
            uiManager.AddActionPill("grid_feed", 910.0f, 132.0f, 344.0f, 44.0f,
                "Conveyor Linear Feed: +" + std::to_string(static_cast<int>(gridSynergies.linearFeedBonusPercent)) + "%",
                "Extruders adjacent to hydraulic stampers",
                0.12f, 0.22f, 0.32f, false, nullptr);

            uiManager.AddActionPill("grid_cool", 910.0f, 184.0f, 344.0f, 44.0f,
                "Thermal Cooling Efficiency: +" + std::to_string(static_cast<int>(gridSynergies.thermalCoolingBonusPercent)) + "%",
                "Laser sinterers adjacent to cooling towers",
                0.12f, 0.28f, 0.26f, false, nullptr);

            uiManager.AddActionPill("grid_symm", 910.0f, 236.0f, 344.0f, 44.0f,
                "Rotational Symmetry Rating: " + std::to_string(static_cast<int>(gridSynergies.symmetryScorePercent)) + "%",
                "Harmonic layout resonance multiplier active",
                0.28f, 0.22f, 0.14f, false, nullptr);
        }
        else {
            // Stats & Badges Tab
            float badgeY = 75.0f;
            for (const auto& ach : achievements.GetAchievements()) {
                std::string status = ach.isUnlocked ? "[UNLOCKED] " : "[LOCKED] ";
                uiManager.AddActionPill("stat_ach_" + ach.id, 910.0f, badgeY, 344.0f, 46.0f,
                    status + ach.title, ach.description,
                    ach.isUnlocked ? 0.16f : 0.10f,
                    ach.isUnlocked ? 0.38f : 0.12f,
                    ach.isUnlocked ? 0.24f : 0.14f,
                    false, nullptr, ach.title, ach.description);
                badgeY += 52.0f;
            }
        }

        // 4. Center Column Cosmic Scale Viewport Pills (Y: 666..702)
        uiManager.AddCosmicPill("cosmic_auto", 350.0f, 666.0f, 80.0f, 34.0f, "Auto",
            debugZoomTier == -1, [&]() { debugZoomTier = -1; });

        uiManager.AddCosmicPill("cosmic_1", 436.0f, 666.0f, 85.0f, 34.0f, "Factory",
            debugZoomTier == 0, [&]() { debugZoomTier = 0; });

        uiManager.AddCosmicPill("cosmic_2", 527.0f, 666.0f, 80.0f, 34.0f, "Earth",
            debugZoomTier == 1, [&]() { debugZoomTier = 1; });

        uiManager.AddCosmicPill("cosmic_3", 613.0f, 666.0f, 80.0f, 34.0f, "Dyson",
            debugZoomTier == 2, [&]() { debugZoomTier = 2; });

        uiManager.AddCosmicPill("cosmic_4", 699.0f, 666.0f, 85.0f, 34.0f, "Galaxy",
            debugZoomTier == 3, [&]() { debugZoomTier = 3; });

        uiManager.AddCosmicPill("cosmic_5", 790.0f, 666.0f, 100.0f, 34.0f, "11D Void",
            debugZoomTier == 4, [&]() { debugZoomTier = 4; });

        // Process mouse input on buttons
        uiManager.ProcessMouseInput(input.mouseX, input.mouseY, input.mouseLeftClicked);

        // ----------------------------------------------------
        // D. Simulation Tick & Economic Production
        // ----------------------------------------------------
        flywheel.Update(static_cast<float>(dt));
        ui.Update(static_cast<float>(dt));
        particles.Update(static_cast<float>(dt));
        uiManager.Update(static_cast<float>(dt));
        cosmicRotation += dt * 25.0f;

        // News rotation update
        if (breakingNewsTimer > 0.0f) {
            breakingNewsTimer -= static_cast<float>(dt);
            if (breakingNewsTimer <= 0.0f) {
                currentNewsText = ambientNews[currentNewsIndex];
            }
        } else {
            newsRotationTimer += static_cast<float>(dt);
            if (newsRotationTimer >= 8.0f) {
                newsRotationTimer = 0.0f;
                currentNewsIndex = (currentNewsIndex + 1) % ambientNews.size();
                currentNewsText = ambientNews[currentNewsIndex];
            }
        }

        SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
        BigDouble baseCPS = BigDouble(autoClippers * 1.0 + stampers * 15.0 + sinterers * 120.0 + megamills * 1500.0, 0)
                          + BigDouble(bioConverters * 100000.0 + dysonSiphons * 5000000.0 + penroseLooms * 500000000.0, 0);
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
        techWeb.UpdateAvailableNodes(playerOps, lifetimeClips);
        headlines.CheckHeadlines(lifetimeClips, humanPopulation);
        achievements.CheckProgress(lifetimeClips, playerFunds.toDouble(), false);

        // ----------------------------------------------------
        // E. 3D OpenGL Cosmic Scale Rendering
        // ----------------------------------------------------
        CosmicVisualTier activeTier = (debugZoomTier >= 0) ? static_cast<CosmicVisualTier>(debugZoomTier) : OmniCosmicRenderer::DetermineTier(lifetimeClips);

        if (activeTier == CosmicVisualTier::FactoryFloor) {
            window.BeginFrame(0.06f, 0.07f, 0.09f);
        } else if (activeTier == CosmicVisualTier::PlanetaryEarth) {
            window.BeginFrame(0.02f, 0.04f, 0.07f);
        } else if (activeTier == CosmicVisualTier::SolarDysonSwarm) {
            window.BeginFrame(0.08f, 0.05f, 0.02f);
        } else if (activeTier == CosmicVisualTier::GalacticPenrose) {
            window.BeginFrame(0.04f, 0.01f, 0.07f);
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
        // F. 2D HUD Overlay (Cookie Clicker Style Master Composition)
        // ----------------------------------------------------
        window.BeginHUD2D();

        // 1. Center Column News Ticker (X: 350, Y: 16, W: 540, H: 36)
        window.DrawHUDCard(350.0f, 16.0f, 540.0f, 36.0f,
            0.08f, 0.10f, 0.14f, 0.88f,
            0.22f, 0.28f, 0.38f, 0.60f);

        if (breakingNewsTimer > 0.0f) {
            window.DrawHUDText(364.0f, 26.0f, "News: " + currentNewsText, 1.05f, 1.0f, 0.85f, 0.30f, 1.0f);
        } else {
            window.DrawHUDText(364.0f, 26.0f, "News: " + currentNewsText, 1.05f, 0.90f, 0.92f, 0.96f, 0.95f);
        }

        // 2. Left Column Panel (X: 16 to 340, Y: 16 to 704)
        window.DrawHUDCard(16.0f, 16.0f, 324.0f, 688.0f,
            0.09f, 0.11f, 0.15f, 0.92f,
            0.20f, 0.24f, 0.32f, 0.65f);

        // Header / Logo
        window.DrawHUDTextCentered(178.0f, 28.0f, "PAPERCLIPS", 1.25f, 1.0f, 0.82f, 0.28f, 1.0f);

        // Big Numbers Odometer
        window.DrawHUDTextCentered(178.0f, 50.0f, lifetimeClips.toShortScale(), 2.2f, 1.0f, 0.95f, 0.85f, 1.0f);
        window.DrawHUDTextCentered(178.0f, 72.0f, "paperclips", 1.0f, 0.70f, 0.75f, 0.82f, 1.0f);
        
        std::string cpsLabel = "per second: " + (currentCPS > BigDouble::zero() ? currentCPS.toShortScale() : "0");
        window.DrawHUDTextCentered(178.0f, 88.0f, cpsLabel, 1.15f, 0.35f, 0.90f, 0.55f, 1.0f);

        // Hairline Divider
        window.DrawHUDQuad(36.0f, 110.0f, 284.0f, 1.0f, 0.25f, 0.30f, 0.40f, 0.40f);

        // Hero Clicker Pedestal Backdrop
        window.DrawHUDCard(36.0f, 122.0f, 284.0f, 284.0f,
            0.06f, 0.08f, 0.11f, 0.80f,
            0.22f, 0.28f, 0.38f, 0.50f);

        // Flywheel Momentum Boost Bar
        float flywheelPercent = flywheel.GetChargePercent();
        if (flywheelPercent > 0.0f) {
            float boostWidth = 260.0f * (flywheelPercent / 100.0f);
            window.DrawHUDQuad(48.0f, 416.0f, 260.0f, 6.0f, 0.15f, 0.18f, 0.24f, 0.8f);
            window.DrawHUDQuad(48.0f, 416.0f, boostWidth, 6.0f, 0.35f, 0.85f, 0.95f, 1.0f);
            window.DrawHUDTextCentered(178.0f, 426.0f, "Overclock Boost Active", 0.95f, 0.4f, 0.85f, 1.0f, 0.9f);
        }

        // Secondary Stockpile Card (Y: 450..692)
        window.DrawHUDCard(28.0f, 450.0f, 300.0f, 242.0f,
            0.07f, 0.09f, 0.12f, 0.90f,
            0.18f, 0.22f, 0.28f, 0.50f);

        window.DrawHUDText(42.0f, 462.0f, "RESOURCES", 1.05f, 0.60f, 0.68f, 0.78f, 1.0f);

        // Wire Stock
        window.DrawHUDText(42.0f, 482.0f, "Wire: " + playerWire.toShortScale() + " kg", 1.2f, 0.95f, 0.95f, 0.95f, 1.0f);

        // Funds & Operations
        window.DrawHUDText(42.0f, 554.0f, "Funds: $" + playerFunds.toShortScale(), 1.2f, 0.40f, 0.95f, 0.60f, 1.0f);
        window.DrawHUDText(42.0f, 580.0f, "Ops: " + std::to_string(static_cast<int64_t>(playerOps)), 1.2f, 0.40f, 0.80f, 1.0f, 1.0f);

        if (lifetimeClips >= BigDouble(1.0, 6)) {
            window.DrawHUDText(42.0f, 606.0f, "Human Pop: " + FormatWithCommas(humanPopulation), 1.0f, 0.95f, 0.45f, 0.45f, 1.0f);
        }
        window.DrawHUDText(42.0f, 630.0f, "Mass: " + equivalency.GetEquivalencyString(lifetimeClips), 0.95f, 0.70f, 0.75f, 0.80f, 0.9f);

        // 3. Right Column Panel (Store & Upgrades) (X: 900 to 1264, Y: 16 to 704)
        window.DrawHUDCard(900.0f, 16.0f, 364.0f, 688.0f,
            0.09f, 0.11f, 0.15f, 0.92f,
            0.20f, 0.24f, 0.32f, 0.65f);

        if (uiManager.activeTab == InteractiveTab::Store) {
            window.DrawHUDText(916.0f, 72.0f, "Buy Multiplier:", 1.05f, 0.65f, 0.70f, 0.80f, 1.0f);
        }

        // Render all Interactive UI buttons, popups, and tooltips
        uiManager.RenderUI(window);

        window.EndHUD2D();
        window.Swap();

        std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }

    return 0;
}

