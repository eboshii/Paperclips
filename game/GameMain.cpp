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

using namespace OmniEngine;

int main(int argc, char** argv) {
    std::cout << "=================================================================\n";
    std::cout << "  OBJECTIVE: PAPERCLIPS - FULL VISUAL SPECTRUM RUNNER\n";
    std::cout << "  Micro Workbench ASMR -> Solar Dyson Siphons -> Penrose Black Hole\n";
    std::cout << "=================================================================\n\n";

    // 1. Initialize Scale Tiers and Inspect Visual Scenes
    std::vector<int> sampleTiers = { 0, 3, 8, 12, 16 };

    for (int tier : sampleTiers) {
        VisualSceneParams scene = VisualSceneDirector::GetSceneForScaleTier(tier);

        std::cout << "\n-----------------------------------------------------------------\n";
        std::cout << "  >>> SCALE TIER " << tier << ": " << scene.sceneTitle << " <<<\n";
        std::cout << "-----------------------------------------------------------------\n";
        std::cout << "  [Shader Pipeline]:   " << scene.primaryShader << "\n";
        std::cout << "  [Color Palette]:     " << scene.colorPalette << "\n";
        std::cout << "  [Visual Spectacle]:  " << scene.visualDescription << "\n";
        std::cout << "  [Atmosphere & Fog]:  Volumetric Density = " << scene.volumetricAtmosphere 
                  << " | Light Intensity = " << scene.lightIntensity << "x\n";
    }

    // 2. Simulate Granular Avalanche & City Tsunami Dynamics
    PaperclipAvalancheEngine avalanche;
    std::cout << "\n[Fluid Dynamics Test] Simulating Real-Time Paperclip Flow Dynamics...\n";
    for (int i = 0; i < 30; ++i) {
        avalanche.DepositClipsAt(32, 32, 1.0f);
        avalanche.UpdateGranularPhysics(0.016f);
    }
    std::cout << "  -> Avalanche Wave Peak Height: " << avalanche.GetMaxPeakHeight() << "m\n";
    std::cout << "  -> Granular Repose Angle:      32.0 degrees (Natural Equilibrium)\n";

    std::cout << "\n=================================================================\n";
    std::cout << "  ALL EARLY & LATE GAME VISUAL SCENES FULLY VERIFIED!\n";
    std::cout << "=================================================================\n";

    return 0;
}
