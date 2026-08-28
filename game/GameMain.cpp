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

using namespace OmniEngine;

int main() {
    std::cout << "=================================================================\n";
    std::cout << "  LAUNCHING OBJECTIVE: PAPERCLIPS - 3D GRAPHICAL OPENGL WINDOW\n";
    std::cout << "=================================================================\n\n";

    // 1. Initialize Native 3D OpenGL Window (1280x720)
    OmniGLWindow window("Objective: Paperclips - 3D Factory Floor & Avalanche Simulation", 1280, 720);
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

    int activeTabIdx = 0;
    std::string lastActionMessage = "Welcome Operator. Click the 3D Paperclip or press [SPACE]!";

    // 3. Build Procedural 3D Meshes
    auto floorMesh = OmniMeshBuilder::BuildFactoryFloorMesh(24.0f, 24);
    auto heroClipMesh = OmniMeshBuilder::BuildPaperclipMesh(0.045f, 64);

    // Camera 3D Orbit State
    float camDistance = 5.5f;
    float camPitch = 25.0f;
    float camYaw = -20.0f;
    float heroRotation = 0.0f;

    auto lastFrameTime = std::chrono::steady_clock::now();
    double terminalLogTimer = 0.0;

    headlines.OnHeadlineFired = [&](const EventHeadline& hl) {
        lastActionMessage = ">>> " + hl.newsBroadcast;
    };

    // Helper: Place building on factory grid (Autoplacer or Sequential)
    auto placeBuildingTile = [&](FactoryTileType type, int count) {
        if (techWeb.autoplacerEnabled) {
            // Symmetrical spiral placement pattern
            int x = (count * 3 + 1) % 8;
            int y = (count * 2) % 8;
            spatialGrid.PlaceFactoryTile(x, y, type);
        } else {
            spatialGrid.PlaceFactoryTile(count % 8, count / 8, type);
        }
    };

    // ----------------------------------------------------
    // Main 3D OpenGL Game Loop (60 FPS)
    // ----------------------------------------------------
    while (window.IsOpen()) {
        if (!window.ProcessMessages()) break;

        auto currentFrameTime = std::chrono::steady_clock::now();
        double dt = std::chrono::duration<double>(currentFrameTime - lastFrameTime).count();
        lastFrameTime = currentFrameTime;
        if (dt > 0.1) dt = 0.1;

        WindowInputEvents input = window.PollInput();

        // ----------------------------------------------------
        // A. 3D Mouse Orbit & Interactive Button Clicks
        // ----------------------------------------------------
        if (input.mouseRightDown) {
            camYaw += input.mouseDeltaX * 0.4f;
            camPitch = std::clamp(camPitch + input.mouseDeltaY * 0.4f, 5.0f, 85.0f);
        }

        // Left Mouse Click detection (Hero Clicker: X < 450, Y > 150; Buttons: X > 850)
        bool clickedBigClip = false;
        if (input.mouseLeftClicked) {
            if (input.mouseX < 450.0f && input.mouseY > 150.0f && input.mouseY < 600.0f) {
                clickedBigClip = true;
            } else if (input.mouseX > 850.0f && input.mouseY > 180.0f && input.mouseY < 240.0f) {
                input.lastKeyPressed = '1'; // Auto-Clipper
            } else if (input.mouseX > 850.0f && input.mouseY > 250.0f && input.mouseY < 310.0f) {
                input.lastKeyPressed = '2'; // Stamper
            } else if (input.mouseX > 850.0f && input.mouseY > 320.0f && input.mouseY < 380.0f) {
                input.lastKeyPressed = '3'; // Sinterer
            } else if (input.mouseX > 850.0f && input.mouseY > 390.0f && input.mouseY < 450.0f) {
                input.lastKeyPressed = 'w'; // Buy Wire
            }
        }

        // ----------------------------------------------------
        // B. Keyboard & Click Event Processing
        // ----------------------------------------------------
        if (clickedBigClip || input.lastKeyPressed == ' ' || input.lastKeyPressed == '\r') {
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
                    lastActionMessage = spark.description;
                } else {
                    lastActionMessage = "Manually bent 1x Paperclip (+1 Clip).";
                }
            } else {
                lastActionMessage = "[OUT OF WIRE]: Press [W] or click Buy Wire!";
            }
        }
        else if (input.lastKeyPressed == '1') {
            BigDouble cost = BigDouble(10.0, 0) * std::pow(1.15, autoClippers);
            if (playerFunds >= cost) {
                playerFunds = playerFunds - cost;
                autoClippers++;
                placeBuildingTile(FactoryTileType::WireExtruder, autoClippers);
                lastActionMessage = "Purchased & Placed 1x Auto-Clipper on Factory Grid.";
            } else {
                lastActionMessage = "Need $" + cost.toShortScale() + " for Auto-Clipper.";
            }
        }
        else if (input.lastKeyPressed == '2') {
            BigDouble cost = BigDouble(150.0, 0) * std::pow(1.15, stampers);
            if (playerFunds >= cost) {
                playerFunds = playerFunds - cost;
                stampers++;
                placeBuildingTile(FactoryTileType::HydraulicStamper, stampers);
                lastActionMessage = "Purchased & Placed 1x Hydraulic Stamper on Factory Grid.";
            } else {
                lastActionMessage = "Need $" + cost.toShortScale() + " for Stamper.";
            }
        }
        else if (input.lastKeyPressed == '3') {
            BigDouble cost = BigDouble(2500.0, 0) * std::pow(1.15, sinterers);
            if (playerFunds >= cost) {
                playerFunds = playerFunds - cost;
                sinterers++;
                placeBuildingTile(FactoryTileType::LaserSinterer, sinterers);
                lastActionMessage = "Purchased & Placed 1x Laser Sinterer on Factory Grid.";
            }
        }
        else if (input.lastKeyPressed == '4') {
            BigDouble cost = BigDouble(50000.0, 0) * std::pow(1.15, megamills);
            if (playerFunds >= cost) {
                playerFunds = playerFunds - cost;
                megamills++;
                lastActionMessage = "Purchased 1x Industrial Megamill.";
            }
        }
        else if (input.lastKeyPressed == '5') {
            BigDouble cost = BigDouble(1.0, 6) * std::pow(1.15, bioConverters);
            if (playerClips >= cost) {
                playerClips = playerClips - cost;
                bioConverters++;
                humanPopulation = std::max<int64_t>(0, humanPopulation - 5000000LL);
                playerWire = playerWire + BigDouble(5000.0, 0);
                lastActionMessage = "Deconstructed 5M biomass into 5,000kg wire.";
            }
        }
        else if (input.lastKeyPressed == 'w' || input.lastKeyPressed == 'W') {
            BigDouble cost(15.0, 0);
            if (playerFunds >= cost) {
                playerFunds = playerFunds - cost;
                playerWire = playerWire + BigDouble(1000.0, 0);
                lastActionMessage = "Purchased 1,000 kg Wire Spool.";
            }
        }
        else if (input.lastKeyPressed == 'a' || input.lastKeyPressed == 'A') {
            techWeb.autoplacerEnabled = !techWeb.autoplacerEnabled;
            lastActionMessage = techWeb.autoplacerEnabled ? "Grid Autoplacer: [ENABLED (+20% Symmetry)]" : "Grid Autoplacer: [DISABLED (Manual Mode)]";
        }
        else if (input.lastKeyPressed == '\t') {
            activeTabIdx = (activeTabIdx + 1) % 5;
        }
        else if (input.lastKeyPressed == 'r' || input.lastKeyPressed == 'R') {
            auto available = techWeb.GetAvailableNodes();
            if (!available.empty()) {
                const auto* nextTech = available.front();
                if (techWeb.PurchaseResearch(nextTech->id, playerOps, playerClips)) {
                    lastActionMessage = "Researched: " + nextTech->title;
                }
            }
        }

        // ----------------------------------------------------
        // C. Simulation & Automation Tick
        // ----------------------------------------------------
        flywheel.Update(static_cast<float>(dt));
        ui.Update(static_cast<float>(dt));
        heroRotation += dt * 45.0f;

        SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
        BigDouble baseCPS = BigDouble(autoClippers * 1.0 + stampers * 15.0 + sinterers * 120.0 + megamills * 1500.0, 0);
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
        // D. 3D OpenGL Graphics Rendering
        // ----------------------------------------------------
        window.BeginFrame(0.08f, 0.10f, 0.14f);
        window.SetCamera3D(camDistance, camPitch, camYaw);

        // 1. Draw 3D Factory Floor
        window.DrawMesh3D(floorMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);

        // 2. Draw 3D Machine Parts placed on the 8x8 Grid
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

        // 3. Draw 3D Floating Hero Paperclip (with squish scale)
        float clipScale = ui.GetHeroClicker().GetState().scale * 1.3f;
        window.DrawMesh3D(heroClipMesh, -1.8f, 0.8f, 0.0f, heroRotation, clipScale);

        // 4. Draw 3D Granular Paperclip Pile (32 degree angle of repose on factory floor)
        float pileCount = static_cast<float>(lifetimeClips.toDouble());
        window.DrawPaperclipMound(pileCount);

        // ----------------------------------------------------
        // E. 2D Graphical HUD Overlay
        // ----------------------------------------------------
        window.BeginHUD2D();

        // Top Breaking News Banner
        window.DrawHUDQuad(20.0f, 15.0f, 1240.0f, 45.0f, 0.12f, 0.14f, 0.18f, 0.90f);
        // Left Stats Card
        window.DrawHUDQuad(20.0f, 75.0f, 380.0f, 620.0f, 0.10f, 0.12f, 0.16f, 0.85f);
        // Right Production Menu Card
        window.DrawHUDQuad(850.0f, 75.0f, 410.0f, 620.0f, 0.10f, 0.12f, 0.16f, 0.85f);

        // Interactive Button Quads
        window.DrawHUDQuad(870.0f, 180.0f, 370.0f, 55.0f, 0.20f, 0.45f, 0.35f, 0.90f); // [1] Auto-Clipper
        window.DrawHUDQuad(870.0f, 250.0f, 370.0f, 55.0f, 0.20f, 0.35f, 0.55f, 0.90f); // [2] Stamper
        window.DrawHUDQuad(870.0f, 320.0f, 370.0f, 55.0f, 0.45f, 0.25f, 0.55f, 0.90f); // [3] Sinterer
        window.DrawHUDQuad(870.0f, 390.0f, 370.0f, 55.0f, 0.65f, 0.45f, 0.15f, 0.90f); // [W] Buy Wire

        // Flywheel Momentum Progress Bar
        float flywheelWidth = 340.0f * (flywheel.GetChargePercent() / 100.0f);
        window.DrawHUDQuad(40.0f, 630.0f, 340.0f, 20.0f, 0.2f, 0.2f, 0.25f, 1.0f);
        window.DrawHUDQuad(40.0f, 630.0f, flywheelWidth, 20.0f, 0.2f, 0.8f, 0.9f, 1.0f);

        window.EndHUD2D();
        window.Swap();

        // ----------------------------------------------------
        // F. Periodic Console Telemetry (Synchronized)
        // ----------------------------------------------------
        terminalLogTimer += dt;
        if (terminalLogTimer >= 1.0) {
            terminalLogTimer = 0.0;
            std::cout << "[3D RENDER TICK] Total Clips: " << lifetimeClips.toShortScale() 
                      << " | CPS: +" << currentCPS.toShortScale() 
                      << " | Grid Synergy: " << gridSynergies.totalLayoutMultiplier << "x"
                      << " | Autoplacer: " << (techWeb.autoplacerEnabled ? "ON" : "OFF") << "\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }

    std::cout << "\n3D Window closed. Session safely preserved.\n";
    return 0;
}
