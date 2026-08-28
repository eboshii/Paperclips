#pragma once
#include <string>
#include <vector>
#include <array>
#include <cmath>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

enum class GridScaleType {
    FactoryFloor2D,    // 8x8 Orthogonal Assembly Grid
    PlanetaryGeodesic, // Spherical Hex & Equatorial Orbital Ring
    SolarConcentric,   // Heliocentric Resonant Rings (Dyson Swarm)
    GalacticNodeGraph, // Spiral Arm Interstellar Laser Network
    Multiverse4DMesh   // 4D Hyper-Tesseract Timeline Mesh
};

enum class FactoryTileType {
    Empty,
    WireExtruder,
    HydraulicStamper,
    LaserSinterer,
    CoolingTower,
    PowerSubstation
};

struct SpatialSynergyReport {
    float linearFeedBonusPercent = 0.0f;
    float thermalCoolingBonusPercent = 0.0f;
    float symmetryScorePercent = 0.0f;
    float totalLayoutMultiplier = 1.0f;
    bool equatorialRingComplete = false;
    bool orbitalResonanceAligned = false;
    bool galacticLoopComplete = false;
};

/// <summary>
/// Hierarchical Multi-Scale Spatial Layout Engine.
/// Scales spatial building and adjacency optimization from the 8x8 factory floor up to
/// planetary orbital rings, solar Dyson shells, galactic laser loops, and 4D multiverse lattices.
/// </summary>
class SpatialLayoutEngine {
public:
    SpatialLayoutEngine();

    void SetScaleMode(GridScaleType mode);
    GridScaleType GetScaleMode() const { return m_currentScale; }

    // --- Factory 8x8 Grid ---
    void PlaceFactoryTile(int x, int y, FactoryTileType type);
    FactoryTileType GetFactoryTile(int x, int y) const;
    void ClearFactoryGrid();

    // --- Planetary Equatorial Ring ---
    void AddEquatorialDriverSegment(int ringIndex);
    bool IsEquatorialRingComplete() const;

    // --- Solar Concentric Rings ---
    void PlaceDysonRing(float radiusAU, int collectorCount);

    // --- Evaluation ---
    SpatialSynergyReport EvaluateSpatialSynergies() const;

private:
    GridScaleType m_currentScale = GridScaleType::FactoryFloor2D;

    // Factory Floor 8x8 Grid
    static constexpr int FactoryGridSize = 8;
    std::array<std::array<FactoryTileType, FactoryGridSize>, FactoryGridSize> m_factoryGrid;

    // Planetary Ring Segments (12 segments = 360 degrees)
    std::array<bool, 12> m_equatorialRingSegments;

    // Solar Dyson Collector Rings (Radii in AU)
    std::vector<std::pair<float, int>> m_dysonRings;
};

} // namespace OmniEngine
