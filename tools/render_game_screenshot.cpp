#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <chrono>
#include <algorithm>

#include "../engine/include/OmniMath.h"
#include "../engine/include/OmniAudio.h"
#include "../engine/include/OmniRender.h"
#include "../engine/include/OmniCameraRig.h"
#include "../engine/include/OmniKinematics.h"
#include "../engine/include/OmniJuice.h"
#include "../engine/include/OmniComboAudio.h"
#include "../engine/include/OmniUI.h"
#include "../engine/include/OmniFlywheel.h"
#include "../engine/include/OmniEquivalency.h"
#include "../engine/include/OmniSpatialGrid.h"
#include "../engine/include/OmniAchievements.h"
#include "../engine/include/OmniResearchTree.h"
#include "../engine/include/OmniHeadlines.h"
#include "../engine/include/OmniHeroClicker.h"
#include "../engine/include/OmniGLWindow.h"
#include "../engine/include/OmniMeshBuilder.h"
#include "../engine/include/OmniCosmicRenderer.h"
#include "../engine/include/OmniParticles.h"
#include "../engine/include/OmniInteractiveUI.h"

using namespace OmniEngine;

static std::string FormatWithCommas(int64_t value) {
    std::string s = std::to_string(value);
    int n = static_cast<int>(s.length()) - 3;
    while (n > 0) {
        s.insert(static_cast<size_t>(n), ",");
        n -= 3;
    }
    return s;
}

static std::string FormatClipsCount(const BigDouble& val) {
    if (val < BigDouble(1000.0, 0)) {
        return std::to_string(static_cast<int64_t>(val.toDouble()));
    }
    if (val < BigDouble(1000000.0, 0)) {
        return FormatWithCommas(static_cast<int64_t>(val.toDouble()));
    }
    return val.toShortScale();
}

static std::string FormatCurrency(const BigDouble& val) {
    if (val < BigDouble(1000.0, 0)) {
        char buf[32];
        std::snprintf(buf, sizeof(buf), "$%.2f", val.toDouble());
        return std::string(buf);
    }
    if (val < BigDouble(1000000.0, 0)) {
        return "$" + FormatWithCommas(static_cast<int64_t>(val.toDouble()));
    }
    return "$" + val.toShortScale();
}

static std::string FormatRate(double cps, int multiplier = 1) {
    double total = cps * multiplier;
    if (total < 1000.0) {
        char buf[32];
        std::snprintf(buf, sizeof(buf), "+%.1f/s", total);
        return std::string(buf);
    }
    return "+" + BigDouble(total, 0).toShortScale() + " CPS";
}

static BigDouble CalculateBulkCost(double baseCost, int currentOwned, int multiplier) {
    if (multiplier <= 1) {
        return BigDouble(baseCost, 0) * std::pow(1.15, currentOwned);
    }
    double factor = (std::pow(1.15, multiplier) - 1.0) / 0.15;
    return BigDouble(baseCost, 0) * std::pow(1.15, currentOwned) * factor;
}

int main(int argc, char** argv) {
    std::string outputPath = "screenshot.png";
    std::string preset = "start";
    std::string tabName = "store";
    int buyMult = 1;
    int simulateClicks = 0;
    float simulateTicks = 0.0f;
    int forcedCosmicTier = -1;
    float hoverX = -100.0f, hoverY = -100.0f;
    bool spawnTestPopups = false;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--output" && i + 1 < argc) outputPath = argv[++i];
        else if (arg == "--preset" && i + 1 < argc) preset = argv[++i];
        else if (arg == "--tab" && i + 1 < argc) tabName = argv[++i];
        else if (arg == "--mult" && i + 1 < argc) buyMult = std::stoi(argv[++i]);
        else if (arg == "--clicks" && i + 1 < argc) simulateClicks = std::stoi(argv[++i]);
        else if (arg == "--ticks" && i + 1 < argc) simulateTicks = std::stof(argv[++i]);
        else if (arg == "--cosmic-tier" && i + 1 < argc) forcedCosmicTier = std::stoi(argv[++i]);
        else if (arg == "--hover" && i + 2 < argc) {
            hoverX = std::stof(argv[++i]);
            hoverY = std::stof(argv[++i]);
        }
        else if (arg == "--popups") spawnTestPopups = true;
    }

    OmniGLWindow window("Objective: Paperclips - Screenshot Tool", 1280, 720);
    window.Initialize();

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

    uiManager.buyMultiplier = buyMult;

    BigDouble playerClips = BigDouble::zero();
    BigDouble lifetimeClips = BigDouble::zero();
    BigDouble playerWire(100.0, 0);
    BigDouble playerFunds(50.0, 0);
    double playerOps = 0.0;
    int64_t humanPopulation = 8000000000LL;

    int autoClippers = 0;
    int stampers = 0;
    int sinterers = 0;
    int megamills = 0;
    int bioConverters = 0;
    int dysonSiphons = 0;
    int penroseLooms = 0;

    auto placeBuildingTile = [&](FactoryTileType type, int count) {
        if (techWeb.autoplacerEnabled) {
            int x = (count * 3 + 1) % 8;
            int y = (count * 2) % 8;
            spatialGrid.PlaceFactoryTile(x, y, type);
        } else {
            spatialGrid.PlaceFactoryTile(count % 8, count / 8, type);
        }
    };

    // Apply Presets
    if (preset == "start") {
        playerWire = BigDouble(100.0, 0);
        playerFunds = BigDouble(50.0, 0);
    }
    else if (preset == "mid") {
        playerClips = BigDouble(25400.0, 0);
        lifetimeClips = BigDouble(48900.0, 0);
        playerWire = BigDouble(850.0, 0);
        playerFunds = BigDouble(1420.0, 0);
        playerOps = 240.0;
        autoClippers = 14;
        stampers = 4;
        sinterers = 1;
        for (int k = 1; k <= autoClippers; ++k) placeBuildingTile(FactoryTileType::WireExtruder, k);
        for (int k = 1; k <= stampers; ++k) placeBuildingTile(FactoryTileType::HydraulicStamper, k);
        for (int k = 1; k <= sinterers; ++k) placeBuildingTile(FactoryTileType::LaserSinterer, k);
        techWeb.PurchaseResearch("carbon_nanotube_wire", playerOps, playerClips);
        techWeb.PurchaseResearch("smart_wire_logistics", playerOps, playerClips);
    }
    else if (preset == "late") {
        playerClips = BigDouble(8.5, 6);
        lifetimeClips = BigDouble(12.4, 6);
        playerWire = BigDouble(15000.0, 0);
        playerFunds = BigDouble(250000.0, 0);
        playerOps = 1500.0;
        autoClippers = 60;
        stampers = 25;
        sinterers = 10;
        megamills = 3;
        bioConverters = 1;
        for (int k = 1; k <= autoClippers; ++k) placeBuildingTile(FactoryTileType::WireExtruder, k);
        for (int k = 1; k <= stampers; ++k) placeBuildingTile(FactoryTileType::HydraulicStamper, k);
        for (int k = 1; k <= sinterers; ++k) placeBuildingTile(FactoryTileType::LaserSinterer, k);
        techWeb.PurchaseResearch("carbon_nanotube_wire", playerOps, playerClips);
        techWeb.PurchaseResearch("smart_wire_logistics", playerOps, playerClips);
        techWeb.PurchaseResearch("modular_autoplacer", playerOps, playerClips);
        humanPopulation = 7995000000LL;
    }
    else if (preset == "cosmic") {
        lifetimeClips = BigDouble(1.0, 26);
        playerClips = BigDouble(1.0, 25);
        playerWire = BigDouble(1.0, 20);
        playerFunds = BigDouble(1.0, 15);
        playerOps = 50000.0;
        autoClippers = 100;
        stampers = 80;
        sinterers = 50;
        megamills = 25;
        bioConverters = 10;
        dysonSiphons = 4;
        humanPopulation = 0LL;
        forcedCosmicTier = 2;
    }

    if (tabName == "store") uiManager.activeTab = InteractiveTab::Store;
    else if (tabName == "tech") uiManager.activeTab = InteractiveTab::Tech;
    else if (tabName == "grid") uiManager.activeTab = InteractiveTab::SpatialGrid;
    else if (tabName == "stats") uiManager.activeTab = InteractiveTab::Stats;

    for (int i = 0; i < simulateClicks; ++i) {
        if (playerWire >= BigDouble(0.001, 0)) {
            playerClips = playerClips + BigDouble(1.0, 0);
            lifetimeClips = lifetimeClips + BigDouble(1.0, 0);
            playerWire = playerWire - BigDouble(0.001, 0);
            flywheel.RegisterClick(playerClips);
            ui.GetHeroClicker().OnClick();
        }
    }

    if (simulateTicks > 0.0f) {
        float step = 0.05f;
        for (float t = 0.0f; t < simulateTicks; t += step) {
            flywheel.Update(step);
            ui.Update(step);
            SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
            BigDouble baseCPS = BigDouble(autoClippers * 1.0 + stampers * 15.0 + sinterers * 120.0 + megamills * 1500.0, 0)
                              + BigDouble(bioConverters * 100000.0 + dysonSiphons * 5000000.0 + penroseLooms * 500000000.0, 0);
            BigDouble currentCPS = baseCPS * gridSynergies.totalLayoutMultiplier * flywheel.GetGlobalCPSMultiplier();
            if (currentCPS > BigDouble::zero()) {
                BigDouble produced = currentCPS * step;
                BigDouble wireNeeded = produced * 0.001;
                if (playerWire >= wireNeeded) {
                    playerClips = playerClips + produced;
                    lifetimeClips = lifetimeClips + produced;
                    playerWire = playerWire - wireNeeded;
                }
            }
            playerFunds = playerFunds + BigDouble(5.0 * step + (autoClippers * 0.5 * step), 0);
            playerOps += (2.0 + (stampers * 0.5)) * step;
        }
    }

    techWeb.UpdateAvailableNodes(playerOps, lifetimeClips);
    achievements.CheckProgress(lifetimeClips, playerFunds.toDouble(), false);

    // Build 3D Fat Cartoon Meshes
    auto floorMesh = OmniMeshBuilder::BuildFactoryFloorMesh(24.0f, 24);
    auto heroClipMesh = OmniMeshBuilder::BuildPaperclipMesh(0.12f, 64);
    auto earthMesh = OmniCosmicRenderer::BuildPlanetEarthMesh(1.8f, 16, 32);
    auto orbitalRingMesh = OmniCosmicRenderer::BuildEquatorialRingMesh(2.5f, 2.9f, 48);
    auto sunMesh = OmniCosmicRenderer::BuildStarSunMesh(2.2f, 16, 32);
    auto blackHoleMesh = OmniCosmicRenderer::BuildBlackHolePenroseMesh(4.5f, 48);
    auto multiverseFoamMesh = OmniCosmicRenderer::BuildMultiverseFoamMesh();

    uiManager.ClearButtons();

    uiManager.AddTabButton("tab_store", 910.0f, 24.0f, 82.0f, 34.0f, "Store",
        uiManager.activeTab == InteractiveTab::Store, nullptr);

    uiManager.AddTabButton("tab_tech", 996.0f, 24.0f, 78.0f, 34.0f, "Tech",
        uiManager.activeTab == InteractiveTab::Tech, nullptr);

    uiManager.AddTabButton("tab_grid", 1078.0f, 24.0f, 78.0f, 34.0f, "Grid",
        uiManager.activeTab == InteractiveTab::SpatialGrid, nullptr);

    uiManager.AddTabButton("tab_stats", 1160.0f, 24.0f, 84.0f, 34.0f, "Stats",
        uiManager.activeTab == InteractiveTab::Stats, nullptr);

    int wireMultiplier = uiManager.buyMultiplier;
    BigDouble wireCost = BigDouble(15.0 * wireMultiplier, 0);
    int64_t wireGainAmount = 1000 * wireMultiplier;
    bool canAffordWire = (playerFunds >= wireCost);

    std::string wireBtnText = "+ Buy " + FormatWithCommas(wireGainAmount) + " kg Wire";
    std::string wireBtnSub = "Cost: " + FormatCurrency(wireCost);
    uiManager.AddActionPill("btn_buy_wire", 38.0f, 504.0f, 280.0f, 36.0f,
        wireBtnText, wireBtnSub, 0.16f, 0.42f, 0.30f, canAffordWire, nullptr,
        "Raw Wire Stockpile", "Essential raw material for bending paperclips.\nProvides immediate physical stock.");

    if (uiManager.activeTab == InteractiveTab::Store) {
        uiManager.AddMultiplierButton("mult_1", 1070.0f, 66.0f, 54.0f, 24.0f, "1x",
            uiManager.buyMultiplier == 1, nullptr);

        uiManager.AddMultiplierButton("mult_10", 1128.0f, 66.0f, 54.0f, 24.0f, "10x",
            uiManager.buyMultiplier == 10, nullptr);

        uiManager.AddMultiplierButton("mult_100", 1186.0f, 66.0f, 58.0f, 24.0f, "100x",
            uiManager.buyMultiplier == 100, nullptr);

        auto availableNodes = techWeb.GetAvailableNodes();
        float shelfX = 910.0f;
        size_t maxShelfItems = std::min(size_t(4), availableNodes.size());
        for (size_t i = 0; i < maxShelfItems; ++i) {
            const auto* node = availableNodes[i];
            bool canAffordTech = (playerOps >= node->opsCost && playerClips >= node->clipsCost);
            std::string shortTitle = node->title;
            if (shortTitle.length() > 9) shortTitle = shortTitle.substr(0, 8) + ".";

            uiManager.AddUpgradeIcon("shelf_tech_" + node->id, shelfX, 96.0f, 80.0f, 58.0f,
                shortTitle, std::to_string(static_cast<int>(node->opsCost)) + " Ops",
                canAffordTech, node->title, node->effectDescription, nullptr);
            shelfX += 86.0f;
        }

        float startRowY = 162.0f;
        int mult = uiManager.buyMultiplier;

        // Auto-Clipper
        BigDouble clipperBulkCost = CalculateBulkCost(10.0, autoClippers, mult);
        uiManager.AddBuildingRow("bld_clipper", 910.0f, startRowY, 344.0f, 62.0f,
            "Auto-Clipper", FormatCurrency(clipperBulkCost), FormatRate(1.0, mult),
            autoClippers, playerFunds >= clipperBulkCost,
            "Auto-Clipper", "Automated desktop wire bending arm.\nProduces +1.00 paperclip per second.", nullptr);
        startRowY += 68.0f;

        // Hydraulic Stamper
        BigDouble stamperBulkCost = CalculateBulkCost(150.0, stampers, mult);
        uiManager.AddBuildingRow("bld_stamper", 910.0f, startRowY, 344.0f, 62.0f,
            "Hydraulic Stamper", FormatCurrency(stamperBulkCost), FormatRate(15.0, mult),
            stampers, playerFunds >= stamperBulkCost,
            "Hydraulic Stamper", "High-pressure dual-action pneumatic press.\nProduces +15.00 paperclips per second.", nullptr);
        startRowY += 68.0f;

        // Laser Sinterer
        BigDouble sintererBulkCost = CalculateBulkCost(2500.0, sinterers, mult);
        uiManager.AddBuildingRow("bld_sinterer", 910.0f, startRowY, 344.0f, 62.0f,
            "Laser Sinterer", FormatCurrency(sintererBulkCost), FormatRate(120.0, mult),
            sinterers, playerFunds >= sintererBulkCost,
            "Laser Sinterer", "Multi-axis laser welding and sintered iron forge.\nProduces +120.00 paperclips per second.", nullptr);
        startRowY += 68.0f;

        // Industrial Megamill
        BigDouble megamillBulkCost = CalculateBulkCost(50000.0, megamills, mult);
        uiManager.AddBuildingRow("bld_megamill", 910.0f, startRowY, 344.0f, 62.0f,
            "Industrial Megamill", FormatCurrency(megamillBulkCost), FormatRate(1500.0, mult),
            megamills, playerFunds >= megamillBulkCost,
            "Industrial Megamill", "Continuous-feed heavy industrial foundry assembly.\nProduces +1,500 paperclips per second.", nullptr);
        startRowY += 68.0f;

        // Bio-Converter
        if (lifetimeClips >= BigDouble(1.0, 6) || preset == "late" || preset == "cosmic") {
            BigDouble bioBulkCost = CalculateBulkCost(1000000.0, bioConverters, mult);
            uiManager.AddBuildingRow("bld_bio", 910.0f, startRowY, 344.0f, 62.0f,
                "Bio-Converter", FormatClipsCount(bioBulkCost) + " Clips", FormatRate(100000.0, mult),
                bioConverters, playerClips >= bioBulkCost,
                "Planetary Bio-Converter", "Deconstructs planetary biomass into high-tensile wire.\nProduces +100,000 paperclips per second.", nullptr);
            startRowY += 68.0f;
        }

        // Solar Dyson Siphon
        if (lifetimeClips >= BigDouble(1.0, 9) || preset == "cosmic") {
            BigDouble dysonBulkCost = CalculateBulkCost(10000000.0, dysonSiphons, mult);
            uiManager.AddBuildingRow("bld_dyson", 910.0f, startRowY, 344.0f, 62.0f,
                "Solar Dyson Siphon", FormatCurrency(dysonBulkCost), FormatRate(5000000.0, mult),
                dysonSiphons, playerFunds >= dysonBulkCost,
                "Solar Dyson Siphon", "Concentric orbital solar mirrors siphoning stellar corona power.\nProduces +5,000,000 paperclips per second.", nullptr);
            startRowY += 68.0f;
        }
    }
    else if (uiManager.activeTab == InteractiveTab::Tech) {
        auto available = techWeb.GetAvailableNodes();
        float techY = 75.0f;
        for (size_t i = 0; i < std::min(size_t(8), available.size()); ++i) {
            const auto* node = available[i];
            bool canResearch = (playerOps >= node->opsCost && playerClips >= node->clipsCost);
            std::string costStr = std::to_string(static_cast<int>(node->opsCost)) + " Ops";
            if (node->clipsCost > BigDouble::zero()) costStr += ", " + FormatClipsCount(node->clipsCost) + " Clips";

            uiManager.AddActionPill("tech_node_" + node->id, 910.0f, techY, 344.0f, 58.0f,
                node->title, costStr + " | " + node->effectDescription,
                0.18f, 0.38f, 0.48f, canResearch, nullptr, node->title, node->effectDescription + "\nCost: " + costStr);
            techY += 66.0f;
        }
    }
    else if (uiManager.activeTab == InteractiveTab::SpatialGrid) {
        uiManager.AddActionPill("btn_autoplacer", 910.0f, 75.0f, 344.0f, 48.0f,
            techWeb.autoplacerEnabled ? "Autoplacer: ENABLED" : "Autoplacer: DISABLED",
            "Automatically optimizes 8x8 factory floor symmetry",
            techWeb.autoplacerEnabled ? 0.16f : 0.35f,
            techWeb.autoplacerEnabled ? 0.45f : 0.18f, 0.25f, true, nullptr,
            "Modular Autoplacer", "Dynamically places new machines in optimal harmonic factory slots.");

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

    // Cosmic Pills
    uiManager.AddCosmicPill("cosmic_auto", 350.0f, 666.0f, 80.0f, 34.0f, "Auto", forcedCosmicTier == -1, nullptr);
    uiManager.AddCosmicPill("cosmic_1", 436.0f, 666.0f, 85.0f, 34.0f, "Factory", forcedCosmicTier == 0, nullptr);
    uiManager.AddCosmicPill("cosmic_2", 527.0f, 666.0f, 80.0f, 34.0f, "Earth", forcedCosmicTier == 1, nullptr);
    uiManager.AddCosmicPill("cosmic_3", 613.0f, 666.0f, 80.0f, 34.0f, "Dyson", forcedCosmicTier == 2, nullptr);
    uiManager.AddCosmicPill("cosmic_4", 699.0f, 666.0f, 85.0f, 34.0f, "Galaxy", forcedCosmicTier == 3, nullptr);
    uiManager.AddCosmicPill("cosmic_5", 790.0f, 666.0f, 100.0f, 34.0f, "11D Void", forcedCosmicTier == 4, nullptr);

    if (hoverX >= 0.0f && hoverY >= 0.0f) {
        uiManager.ProcessMouseInput(hoverX, hoverY, false);
    }

    if (spawnTestPopups) {
        uiManager.SpawnPopup(178.0f, 220.0f, "+1 CLIP!", 0.98f, 0.88f, 0.35f, 1.4f);
        uiManager.SpawnPopup(178.0f, 180.0f, "+$50 SPARK!", 0.35f, 0.95f, 0.55f, 1.5f);
    }

    CosmicVisualTier activeTier = (forcedCosmicTier >= 0) ? static_cast<CosmicVisualTier>(forcedCosmicTier) : OmniCosmicRenderer::DetermineTier(lifetimeClips);

    if (activeTier == CosmicVisualTier::FactoryFloor) {
        window.BeginFrame(0.09f, 0.11f, 0.16f);
    } else if (activeTier == CosmicVisualTier::PlanetaryEarth) {
        window.BeginFrame(0.04f, 0.07f, 0.14f);
    } else if (activeTier == CosmicVisualTier::SolarDysonSwarm) {
        window.BeginFrame(0.12f, 0.08f, 0.04f);
    } else if (activeTier == CosmicVisualTier::GalacticPenrose) {
        window.BeginFrame(0.06f, 0.02f, 0.10f);
    } else {
        window.BeginFrame(0.02f, 0.02f, 0.05f);
    }

    // 1. Draw 3D Cosmic World in Center Viewport
    if (activeTier == CosmicVisualTier::FactoryFloor) {
        window.DrawMesh3D(floorMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
        for (int y = 0; y < 8; ++y) {
            for (int x = 0; x < 8; ++x) {
                FactoryTileType t = spatialGrid.GetFactoryTile(x, y);
                if (t != FactoryTileType::Empty) {
                    float worldX = (x - 3.5f) * 0.9f;
                    float worldZ = (y - 3.5f) * 0.9f;
                    auto machineMesh = OmniMeshBuilder::BuildMachineMesh(t, worldX, worldZ, 0.8f);
                    window.DrawMesh3D(machineMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
                }
            }
        }
        window.DrawPaperclipMound(static_cast<float>(lifetimeClips.toDouble()));
    }
    else if (activeTier == CosmicVisualTier::PlanetaryEarth) {
        window.DrawMesh3D(earthMesh, 0.0f, 0.0f, 0.0f, 20.0f, 0.55f);
        window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, -10.0f, 0.65f);
    }
    else if (activeTier == CosmicVisualTier::SolarDysonSwarm) {
        window.DrawMesh3D(sunMesh, 0.0f, 0.0f, 0.0f, 10.0f, 0.45f);
        window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, 35.0f, 0.85f);
        window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, -20.0f, 1.15f);
    }
    else if (activeTier == CosmicVisualTier::GalacticPenrose) {
        window.DrawMesh3D(blackHoleMesh, 0.0f, 0.0f, 0.0f, 45.0f, 0.50f);
        window.DrawMesh3D(orbitalRingMesh, 0.0f, 0.0f, 0.0f, -25.0f, 1.0f);
    }
    else {
        window.DrawMesh3D(multiverseFoamMesh, 0.0f, 0.0f, 0.0f, 15.0f, 0.50f);
    }

    // 2. Begin 2D HUD
    window.BeginHUD2D();
    auto& rast = window.GetRasterizer();

    // Top News Ticker
    window.DrawHUDCard(350.0f, 16.0f, 540.0f, 36.0f,
        0.11f, 0.14f, 0.20f, 0.94f,
        0.28f, 0.38f, 0.55f, 0.70f);

    std::string news = "News: Sterling Robotics deploys autonomous desktop bending prototype.";
    if (preset == "mid") news = "News: Factory floor expansion approved after zero recorded defects.";
    else if (preset == "late") news = "News: Dr. Vance: 'The neural net seems fond of double loops.'";
    else if (preset == "cosmic") news = "News: Autonomous probes report deep space matter conversion active.";

    if (news.length() > 58) news = news.substr(0, 55) + "...";
    window.DrawHUDText(364.0f, 28.0f, news, 1.0f, 0.92f, 0.95f, 1.0f, 0.95f);

    // Left Panel Background (Warm playful slate)
    window.DrawHUDCard(16.0f, 16.0f, 324.0f, 688.0f,
        0.10f, 0.12f, 0.18f, 0.96f,
        0.24f, 0.30f, 0.44f, 0.75f);

    rast.Draw2DSparkIcon(65.0f, 28.0f, 5.0f, 1.0f, 0.85f, 0.3f);
    rast.Draw2DSparkIcon(290.0f, 28.0f, 5.0f, 1.0f, 0.85f, 0.3f);
    window.DrawHUDTextCentered(178.0f, 26.0f, "PAPERCLIPS", 1.1f, 1.0f, 0.88f, 0.32f, 1.0f);

    std::string clipStr = FormatClipsCount(lifetimeClips);
    window.DrawHUDTextCentered(178.0f, 48.0f, clipStr, 2.0f, 1.0f, 0.96f, 0.86f, 1.0f);
    window.DrawHUDTextCentered(178.0f, 70.0f, "paperclips", 1.0f, 0.75f, 0.82f, 0.92f, 1.0f);

    SpatialSynergyReport gridSynergies = spatialGrid.EvaluateSpatialSynergies();
    BigDouble baseCPS = BigDouble(autoClippers * 1.0 + stampers * 15.0 + sinterers * 120.0 + megamills * 1500.0, 0)
                      + BigDouble(bioConverters * 100000.0 + dysonSiphons * 5000000.0 + penroseLooms * 500000000.0, 0);
    BigDouble currentCPS = baseCPS * gridSynergies.totalLayoutMultiplier * flywheel.GetGlobalCPSMultiplier();

    std::string cpsLabel = "per second: " + (currentCPS > BigDouble::zero() ? FormatClipsCount(currentCPS) : "0");
    window.DrawHUDTextCentered(178.0f, 88.0f, cpsLabel, 1.0f, 0.38f, 0.95f, 0.60f, 1.0f);

    window.DrawHUDQuad(36.0f, 108.0f, 284.0f, 1.5f, 0.28f, 0.35f, 0.50f, 0.50f);

    // Hero Pedestal Frame with Playful Corners
    window.DrawHUDCard(36.0f, 120.0f, 284.0f, 284.0f,
        0.07f, 0.09f, 0.14f, 0.90f,
        0.28f, 0.36f, 0.52f, 0.60f);

    rast.Draw2DSparkIcon(54.0f, 138.0f, 4.0f, 0.98f, 0.85f, 0.30f);
    rast.Draw2DSparkIcon(302.0f, 138.0f, 4.0f, 0.98f, 0.85f, 0.30f);

    // Flywheel Boost
    float flywheelPercent = flywheel.GetChargePercent();
    if (flywheelPercent > 0.0f || preset == "mid") {
        float pct = (flywheelPercent > 0.0f) ? flywheelPercent : 65.0f;
        float boostWidth = 260.0f * (pct / 100.0f);
        window.DrawHUDQuad(48.0f, 414.0f, 260.0f, 6.0f, 0.15f, 0.18f, 0.24f, 0.8f);
        window.DrawHUDQuad(48.0f, 414.0f, boostWidth, 6.0f, 0.38f, 0.90f, 1.0f, 1.0f);
        window.DrawHUDTextCentered(178.0f, 424.0f, "Overclock Boost Active", 1.0f, 0.45f, 0.90f, 1.0f, 0.95f);
    }

    // Stockpile Card
    window.DrawHUDCard(28.0f, 448.0f, 300.0f, 244.0f,
        0.09f, 0.11f, 0.16f, 0.94f,
        0.22f, 0.28f, 0.40f, 0.60f);

    window.DrawHUDText(42.0f, 460.0f, "RESOURCES", 1.0f, 0.65f, 0.75f, 0.88f, 1.0f);
    window.DrawHUDText(42.0f, 480.0f, "Wire: " + FormatClipsCount(playerWire) + " kg", 1.0f, 0.95f, 0.98f, 1.0f, 1.0f);
    window.DrawHUDText(42.0f, 552.0f, "Funds: " + FormatCurrency(playerFunds), 1.0f, 0.45f, 0.98f, 0.65f, 1.0f);
    window.DrawHUDText(42.0f, 576.0f, "Ops: " + FormatClipsCount(BigDouble(playerOps, 0)), 1.0f, 0.45f, 0.85f, 1.0f, 1.0f);

    if (lifetimeClips >= BigDouble(1.0, 6)) {
        window.DrawHUDText(42.0f, 600.0f, "Human Pop: " + FormatWithCommas(humanPopulation), 1.0f, 0.98f, 0.50f, 0.50f, 1.0f);
    }
    
    std::string eq = equivalency.GetEquivalencyString(lifetimeClips);
    if (eq.length() > 34) eq = eq.substr(0, 32) + "..";
    window.DrawHUDText(42.0f, 626.0f, "Mass: " + eq, 1.0f, 0.75f, 0.80f, 0.88f, 0.9f);

    // Right Panel Background
    window.DrawHUDCard(900.0f, 16.0f, 364.0f, 688.0f,
        0.10f, 0.12f, 0.18f, 0.96f,
        0.24f, 0.30f, 0.44f, 0.75f);

    if (uiManager.activeTab == InteractiveTab::Store) {
        window.DrawHUDText(916.0f, 72.0f, "Buy Multiplier:", 1.0f, 0.70f, 0.78f, 0.90f, 1.0f);
    }

    // 3. Draw 3D Fat Hero Paperclip inside Left Pedestal with Cel Shading & Ink Outline
    window.DrawHeroPaperclip3D(heroClipMesh, 28.0f, 1.35f);

    // 4. Render All Interactive UI buttons, popups, and tooltips
    uiManager.RenderUI(window);
    window.EndHUD2D();

    if (window.SavePNG(outputPath)) {
        std::cout << "[SUCCESS] Screenshot saved: " << outputPath << "\n";
        return 0;
    } else {
        std::cerr << "[ERROR] Failed to save screenshot to " << outputPath << "\n";
        return 1;
    }
}
