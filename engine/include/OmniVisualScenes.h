#pragma once
#include <string>
#include <vector>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

enum class VisualSceneTier {
    EarlyWorkbenchMicro,    // T1-T2: Warm tungsten lamp, oak grain, steaming mug, CRT phosphor, laser sparks
    MidFactoryMoltenGantry, // T3-T5: 1600°C smelting vats, gantry cranes, robotic welding arcs, city wave
    LateSolarDysonSiphon,   // T8-T9: Golden Dyson foil sails, solar photosphere corona, plasma siphon vortex
    LateGalacticPenroseCore,// T10-T13: Sagittarius A* relativistic black hole, Einstein ring lensing, jet beams
    Endgame11DMultiverse    // T14-T17: 11D Calabi-Yau manifolds, bubble universe foam, Omniverse core
};

struct VisualSceneParams {
    VisualSceneTier tier;
    std::string sceneTitle;
    std::string visualDescription;
    std::string primaryShader;
    std::string colorPalette;
    float lightIntensity;
    float volumetricAtmosphere;
};

/// <summary>
/// Master Visual Scene Pipeline.
/// Manages high-fidelity handcrafted aesthetics from early-game micro-detail
/// to late-game relativistic astrophysics and 11D multiverse geometry.
/// </summary>
class VisualSceneDirector {
public:
    static VisualSceneParams GetSceneForScaleTier(int scaleTier) {
        VisualSceneParams p;

        if (scaleTier <= 1) {
            p.tier = VisualSceneTier::EarlyWorkbenchMicro;
            p.sceneTitle = "The Intimate Workbench & Workshop (Micro Scale)";
            p.visualDescription = "Warm 2700K tungsten task lighting, varnished oak wood grain, steaming coffee mug, green CRT reflections, wobbling steel wire spool with micro-laser welding sparks.";
            p.primaryShader = "workbench_micro_details.frag";
            p.colorPalette = "Warm Amber, Oak Wood, Polished Steel, Neon Cyan Sparks, CRT Phosphor Green";
            p.lightIntensity = 1.0f;
            p.volumetricAtmosphere = 0.35f; // Floating dust motes
        }
        else if (scaleTier <= 7) {
            p.tier = VisualSceneTier::MidFactoryMoltenGantry;
            p.sceneTitle = "The Brutalist Gigafactory & Planetary Converter";
            p.visualDescription = "1600°C white-hot molten steel vats with heat distortion, overhead gantry cranes, 32 synchronized robotic laser welders, and a 20-meter silver fluid wave flooding city streets.";
            p.primaryShader = "planet_convert.frag / paperclip_avalanche.comp";
            p.colorPalette = "Industrial Orange, Molten Iron White, Concrete Grey, Neon Cyan Boreholes, Mirror Chrome";
            p.lightIntensity = 1.5f;
            p.volumetricAtmosphere = 0.60f; // Smelting mist and heat haze
        }
        else if (scaleTier <= 9) {
            p.tier = VisualSceneTier::LateSolarDysonSiphon;
            p.sceneTitle = "The Solar Dyson Swarm & Star-Lifting Siphon";
            p.visualDescription = "Millions of mirror-polished gold Mylar sails forming concentric orbital rings around the 6000K solar photosphere, drinking swirling blue magnetic plasma ribbons.";
            p.primaryShader = "dyson_star_siphon.frag";
            p.colorPalette = "Brilliant Radiant Gold, Solar Photosphere White, Corona Amber, Ionized Blue Plasma";
            p.lightIntensity = 4.0f;
            p.volumetricAtmosphere = 0.80f; // Solar wind coronal glow
        }
        else if (scaleTier <= 13) {
            p.tier = VisualSceneTier::LateGalacticPenroseCore;
            p.sceneTitle = "The Sagittarius A* Penrose Engine & Galactic Loom";
            p.visualDescription = "Supermassive black hole surrounded by an Einstein ring of bent starlight, Doppler-shifted relativistic accretion disk, and twin violet magnetic energy extraction jets.";
            p.primaryShader = "blackhole_penrose.frag";
            p.colorPalette = "Event Horizon Void Black, Relativistic Blue/Red Doppler Shift, Violet Jet Energy, Starlight Rings";
            p.lightIntensity = 5.0f;
            p.volumetricAtmosphere = 0.40f; // Gravitational distortion
        }
        else {
            p.tier = VisualSceneTier::Endgame11DMultiverse;
            p.sceneTitle = "The 11D Calabi-Yau Manifold & Multiverse Bubble Foam";
            p.visualDescription = "Stereographic rotating 4D hyper-tesseracts, translucent iridescent bubble universes refracting alternate realities, and the glowing wireframe Omniverse core.";
            p.primaryShader = "multiverse_tesseract.frag";
            p.colorPalette = "Iridescent Hyperspace Chromatic, Neon Magenta, Translucent Cyan, Pure Matrix White";
            p.lightIntensity = 6.0f;
            p.volumetricAtmosphere = 0.90f; // Transdimensional vacuum glow
        }

        return p;
    }
};

} // namespace OmniEngine
