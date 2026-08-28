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

using namespace OmniEngine;

int main() {
    std::cout << "=================================================================\n";
    std::cout << "  LAUNCHING OBJECTIVE: PAPERCLIPS - FULL 3D GRAPHICAL OPENGL ENGINE\n";
    std::cout << "=================================================================\n\n";

    // 1. Initialize Native 3D OpenGL Window (1280x720)
    OmniGLWindow window("Objective: Paperclips - Complete 3D Simulation & Typography Engine", 1280, 720);
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
    int debugZoomTier = -1; // -1 for auto-tier progression, 0-4 for manual preview
    std::string lastActionMessage = "Welcome Operator. Click the 3D Paperclip or press [SPACE]!";

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
    double terminalLogTimer = 0.0;

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

        bool clickedBigClip = false;
        if (input.mouseLeftClicked) {
            if (input.mouseX < 450.0f && input.mouseY > 150.0f && input.mouseY < 600.0f) {
                clickedBigClip = true;
            } else if (input.mouseX > 850.0f && input.mouseY > 180.0f && input.mouseY < 240.0f) {
                input.lastKeyPressed = '1';
            } else if (input.mouseX > 850.0f && input.mouseY > 250.0f && input.mouseY < 310.0f) {
                input.lastKeyPressed = '2';
            } else if (input.mouseX > 850.0f && input.mouseY > 320.0f && input.mouseY < 380.0f) {
                input.lastKeyPressed = '3';
            } else if (input.mouseX > 850.0f && input.mouseY > 390.0f && input.mouseY < 450.0f) {
                input.lastKeyPressed = 'w';
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

                // Spawn 3D Weld Sparks and Floating Text Popup
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
                lastActionMessage = "[OUT OF WIRE]: Press [W] or click Buy Wire!";
            }
        }
        else if (input.lastKeyPressed == '1') {
            BigDouble cost = BigDouble(10.0, 0) * std::pow(1.15, autoClippers);
            if (playerFunds >= cost) {
                playerFunds = playerFunds - cost;
                autoClippers++;
                placeBuildingTile(FactoryTileType::WireExtruder, autoClippers);
                particles.SpawnFloatingText(1.0f, 0.5f, 0.0f, "+AUTO-CLIPPER", 0.4f, 0.8f, 1.0f);
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
                particles.SpawnFloatingText(1.0f, 0.5f, 0.0f, "+STAMPER", 1.0f, 0.8f, 0.2f);
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
                particles.SpawnFloatingText(-1.8f, 0.5f, 0.0f, "+1000kg WIRE", 0.9f, 0.9f, 0.9f);
                lastActionMessage = "Purchased 1,000 kg Wire Spool.";
            }
        }
        else if (input.lastKeyPressed == 'z' || input.lastKeyPressed == 'Z') {
            debugZoomTier = (debugZoomTier + 2) % 6 - 1;
            lastActionMessage = (debugZoomTier == -1) ? "Cosmic View: [AUTO-PROGRESSION]" : ("Cosmic View: [TIER " + std::to_string(debugZoomTier + 1) + " PREVIEW]");
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

        // Apply 60 FPS smooth camera interpolation
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

            // Draw 3D Weld Sparks
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
        // E. 2D Graphical HUD Overlay & Embedded In-Window Typography
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

        window.DrawHUDText(35.0f, 410.0f, "[CONTROLS]:", 1.2f, 0.8f, 0.8f, 0.8f, 1.0f);
        window.DrawHUDText(35.0f, 430.0f, "* [SPACE] / Click Big Clip", 1.1f, 1.0f, 1.0f, 1.0f, 0.8f);
        window.DrawHUDText(35.0f, 450.0f, "* Right-Drag: Orbit 3D Cam", 1.1f, 1.0f, 1.0f, 1.0f, 0.8f);
        window.DrawHUDText(35.0f, 470.0f, "* Scroll: Smooth Zoom", 1.1f, 1.0f, 1.0f, 1.0f, 0.8f);
        window.DrawHUDText(35.0f, 490.0f, "* [Z]: Cycle 5 Cosmic Tiers", 1.1f, 1.0f, 1.0f, 1.0f, 0.8f);
        window.DrawHUDText(35.0f, 510.0f, "* [A]: Toggle Autoplacer", 1.1f, 1.0f, 1.0f, 1.0f, 0.8f);
        window.DrawHUDText(35.0f, 530.0f, "* [R]: Research Next Tech", 1.1f, 1.0f, 1.0f, 1.0f, 0.8f);

        // Flywheel Momentum Progress Bar
        float flywheelWidth = 340.0f * (flywheel.GetChargePercent() / 100.0f);
        window.DrawHUDText(35.0f, 605.0f, "FLYWHEEL OVERCLOCK [" + std::to_string(static_cast<int>(flywheel.GetChargePercent())) + "%]:", 1.1f, 0.3f, 0.9f, 1.0f, 1.0f);
        window.DrawHUDQuad(40.0f, 630.0f, 340.0f, 20.0f, 0.2f, 0.2f, 0.25f, 1.0f);
        window.DrawHUDQuad(40.0f, 630.0f, flywheelWidth, 20.0f, 0.2f, 0.8f, 0.9f, 1.0f);

        // 3. Right Production Menu Card
        window.DrawHUDQuad(850.0f, 75.0f, 410.0f, 620.0f, 0.10f, 0.12f, 0.16f, 0.88f);
        window.DrawHUDText(870.0f, 95.0f, "PRODUCTION CATALOG", 1.6f, 0.3f, 0.85f, 1.0f, 1.0f);
        window.DrawHUDText(870.0f, 125.0f, "=============================", 1.0f, 0.4f, 0.5f, 0.6f, 1.0f);

        // Button 1: Auto-Clipper
        window.DrawHUDQuad(870.0f, 180.0f, 370.0f, 55.0f, 0.18f, 0.38f, 0.30f, 0.95f);
        window.DrawHUDText(885.0f, 195.0f, "[1] Auto-Clipper (" + std::to_string(autoClippers) + ")", 1.4f, 1.0f, 1.0f, 1.0f, 1.0f);
        window.DrawHUDText(885.0f, 215.0f, "Cost: $" + (BigDouble(10.0, 0) * std::pow(1.15, autoClippers)).toShortScale() + " | +1 CPS", 1.1f, 0.8f, 1.0f, 0.8f, 1.0f);

        // Button 2: Hydraulic Stamper
        window.DrawHUDQuad(870.0f, 250.0f, 370.0f, 55.0f, 0.18f, 0.30f, 0.48f, 0.95f);
        window.DrawHUDText(885.0f, 265.0f, "[2] Hydraulic Stamper (" + std::to_string(stampers) + ")", 1.4f, 1.0f, 1.0f, 1.0f, 1.0f);
        window.DrawHUDText(885.0f, 285.0f, "Cost: $" + (BigDouble(150.0, 0) * std::pow(1.15, stampers)).toShortScale() + " | +15 CPS", 1.1f, 0.8f, 0.9f, 1.0f, 1.0f);

        // Button 3: Laser Sinterer
        window.DrawHUDQuad(870.0f, 320.0f, 370.0f, 55.0f, 0.38f, 0.20f, 0.48f, 0.95f);
        window.DrawHUDText(885.0f, 335.0f, "[3] Laser Sinterer (" + std::to_string(sinterers) + ")", 1.4f, 1.0f, 1.0f, 1.0f, 1.0f);
        window.DrawHUDText(885.0f, 355.0f, "Cost: $" + (BigDouble(2500.0, 0) * std::pow(1.15, sinterers)).toShortScale() + " | +120 CPS", 1.1f, 1.0f, 0.8f, 1.0f, 1.0f);

        // Button 4: Buy Wire
        window.DrawHUDQuad(870.0f, 390.0f, 370.0f, 55.0f, 0.55f, 0.38f, 0.12f, 0.95f);
        window.DrawHUDText(885.0f, 405.0f, "[W] Buy 1,000kg Wire Spool", 1.4f, 1.0f, 1.0f, 1.0f, 1.0f);
        window.DrawHUDText(885.0f, 425.0f, "Cost: $15.00 | Instant Stockpile", 1.1f, 1.0f, 0.9f, 0.7f, 1.0f);

        // Active View Pill
        const char* tierNames[] = { "Factory Floor", "Planetary Earth", "Solar Dyson Swarm", "Galactic Penrose", "11D Multiverse Void" };
        window.DrawHUDText(870.0f, 480.0f, "COSMIC TIER: " + std::string(tierNames[static_cast<int>(activeTier)]), 1.3f, 0.4f, 0.9f, 1.0f, 1.0f);
        window.DrawHUDText(870.0f, 510.0f, "GRID SYNERGY: " + std::to_string(gridSynergies.totalLayoutMultiplier) + "x Boost", 1.2f, 0.3f, 1.0f, 0.5f, 1.0f);
        window.DrawHUDText(870.0f, 540.0f, "AUTOPLACER:   " + std::string(techWeb.autoplacerEnabled ? "ACTIVE (+20%)" : "MANUAL"), 1.2f, 1.0f, 0.8f, 0.2f, 1.0f);

        window.EndHUD2D();
        window.Swap();

        // ----------------------------------------------------
        // F. Periodic Console Telemetry (Synchronized)
        // ----------------------------------------------------
        terminalLogTimer += dt;
        if (terminalLogTimer >= 1.0) {
            terminalLogTimer = 0.0;
            std::cout << "[COSMIC 3D VIEW: " << tierNames[static_cast<int>(activeTier)] << "] Total Clips: " 
                      << lifetimeClips.toShortScale() << " | CPS: +" << currentCPS.toShortScale() << "\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }

    std::cout << "\n3D Window closed. Session safely preserved.\n";
    return 0;
}
