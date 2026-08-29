#pragma once
#include <string>
#include <vector>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

enum class VisualSceneTier {
    EarlyFactoryInterior,   // T0: Wood timber rafters, red brick walls, large arched multi-pane windows, pendant lamps
    TownFactoryComplex,     // T1: Standalone brick factory, smokestack steam plumes, water tower, quaint town, hills
    IndustrialCityMetropolis,// T2: Skyscraper skyline, glowing window grids, cooling tower steam, monorail, highway light trails
    PlanetaryEarthOrbital,  // T3: Earth globe, continental cyber-vein conversion, equatorial orbital railgun ring
    SolarDysonSiphon,       // T4: Golden Dyson foil sails, solar photosphere corona, plasma siphon vortex
    GalacticPenroseCore,    // T5: Sagittarius A* relativistic black hole, Einstein ring lensing, violet jet beams
    Endgame11DMultiverse    // T6: 11D Calabi-Yau manifolds, bubble universe foam, Omniverse core
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
/// and town/city expansion to late-game relativistic astrophysics and 11D multiverse geometry.
/// </summary>
class VisualSceneDirector {
public:
    static VisualSceneParams GetSceneForScaleTier(int scaleTier) {
        VisualSceneParams p;

        if (scaleTier <= 0) {
            p.tier = VisualSceneTier::EarlyFactoryInterior;
            p.sceneTitle = "The Factory Interior & Warehouse (Wood & Brick)";
            p.visualDescription = "Tall warehouse-like building from timber and red brick, large multi-pane arched factory windows with morning sunbeams, and warm overhead pendant lamps.";
            p.primaryShader = "factory_interior_dither.frag";
            p.colorPalette = "Warm Brick Terracotta, Timber Brown, Sunlight Amber, Cyan Coolant Blue, Warm Tungsten";
            p.lightIntensity = 1.0f;
            p.volumetricAtmosphere = 0.35f; // Floating dust motes
        }
        else if (scaleTier <= 1) {
            p.tier = VisualSceneTier::TownFactoryComplex;
            p.sceneTitle = "The Factory Complex in Town (Industrial Suburb)";
            p.visualDescription = "Standalone saw-tooth roof factory building, twin brick smokestacks with billowing steam, steel-legged water tower, nestled on the edge of a quaint village with hills and telephone poles.";
            p.primaryShader = "town_suburb_dither.frag";
            p.colorPalette = "Twilight Sky Purple, Green Hills, Brick Red, Industrial Steam White, Warm Window Gold";
            p.lightIntensity = 1.2f;
            p.volumetricAtmosphere = 0.45f; // Morning mist and smokestack steam
        }
        else if (scaleTier <= 2) {
            p.tier = VisualSceneTier::IndustrialCityMetropolis;
            p.sceneTitle = "The Sprawling Industrial Metropolis";
            p.visualDescription = "Densely layered skyscraper skyline, cooling towers venting steam plumes, elevated high-speed monorail viaducts, highway traffic trails, and autonomous delivery blimps.";
            p.primaryShader = "city_metropolis_dither.frag";
            p.colorPalette = "Smoggy Twilight Violet, Smog Orange, Neon Cyan, Window Yellow, Traffic Red";
            p.lightIntensity = 1.6f;
            p.volumetricAtmosphere = 0.55f; // City smog and cooling tower vapor
        }
        else if (scaleTier <= 3) {
            p.tier = VisualSceneTier::PlanetaryEarthOrbital;
            p.sceneTitle = "Planetary Earth & Equatorial Mass Driver Ring";
            p.visualDescription = "Rotating spherical Earth with glowing continental cyber-veins and wire fissures, luminous atmospheric limb, and an equatorial orbital railgun ring launching probes.";
            p.primaryShader = "planet_convert_dither.frag";
            p.colorPalette = "Earth Sapphire Blue, Emerald Landmass, Neon Cyan Fissures, Superconductor Gold";
            p.lightIntensity = 2.5f;
            p.volumetricAtmosphere = 0.50f; // Atmospheric halo
        }
        else if (scaleTier <= 4) {
            p.tier = VisualSceneTier::SolarDysonSiphon;
            p.sceneTitle = "The Solar Dyson Swarm & Star-Lifting Siphon";
            p.visualDescription = "Millions of mirror-polished gold Mylar sails forming concentric orbital rings around the 6000K solar photosphere, drinking swirling blue magnetic plasma ribbons.";
            p.primaryShader = "dyson_star_siphon.frag";
            p.colorPalette = "Brilliant Radiant Gold, Solar Photosphere White, Corona Amber, Ionized Blue Plasma";
            p.lightIntensity = 4.0f;
            p.volumetricAtmosphere = 0.80f; // Solar wind coronal glow
        }
        else if (scaleTier <= 5) {
            p.tier = VisualSceneTier::GalacticPenroseCore;
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
