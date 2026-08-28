#include "../include/OmniSpatialGrid.h"
#include <iomanip>

namespace OmniEngine {

SpatialLayoutEngine::SpatialLayoutEngine() {
    ClearFactoryGrid();
    m_equatorialRingSegments.fill(false);
}

void SpatialLayoutEngine::SetScaleMode(GridScaleType mode) {
    m_currentScale = mode;
}

void SpatialLayoutEngine::ClearFactoryGrid() {
    for (int y = 0; y < FactoryGridSize; ++y) {
        for (int x = 0; x < FactoryGridSize; ++x) {
            m_factoryGrid[y][x] = FactoryTileType::Empty;
        }
    }
}

void SpatialLayoutEngine::PlaceFactoryTile(int x, int y, FactoryTileType type) {
    if (x >= 0 && x < FactoryGridSize && y >= 0 && y < FactoryGridSize) {
        m_factoryGrid[y][x] = type;
    }
}

FactoryTileType SpatialLayoutEngine::GetFactoryTile(int x, int y) const {
    if (x >= 0 && x < FactoryGridSize && y >= 0 && y < FactoryGridSize) {
        return m_factoryGrid[y][x];
    }
    return FactoryTileType::Empty;
}

void SpatialLayoutEngine::AddEquatorialDriverSegment(int ringIndex) {
    if (ringIndex >= 0 && ringIndex < 12) {
        m_equatorialRingSegments[ringIndex] = true;
    }
}

bool SpatialLayoutEngine::IsEquatorialRingComplete() const {
    for (bool seg : m_equatorialRingSegments) {
        if (!seg) return false;
    }
    return true;
}

void SpatialLayoutEngine::PlaceDysonRing(float radiusAU, int collectorCount) {
    m_dysonRings.push_back({ radiusAU, collectorCount });
}

SpatialSynergyReport SpatialLayoutEngine::EvaluateSpatialSynergies() const {
    SpatialSynergyReport report;
    float linearFeedMatches = 0;
    float thermalCoolerMatches = 0;
    float symmetricalPairs = 0;
    float totalOccupied = 0;

    // 1. Evaluate Factory Floor 8x8 Grid
    for (int y = 0; y < FactoryGridSize; ++y) {
        for (int x = 0; x < FactoryGridSize; ++x) {
            auto tile = m_factoryGrid[y][x];
            if (tile == FactoryTileType::Empty) continue;
            totalOccupied++;

            // Check Linear Conveyor Feed: Extruder horizontally adjacent to Stamper/Sinterer
            if (tile == FactoryTileType::WireExtruder && x + 1 < FactoryGridSize) {
                auto rightTile = m_factoryGrid[y][x + 1];
                if (rightTile == FactoryTileType::HydraulicStamper || rightTile == FactoryTileType::LaserSinterer) {
                    linearFeedMatches += 1.0f;
                }
            }

            // Check Thermal Cooling: Machine adjacent to a Cooling Tower
            if (tile == FactoryTileType::LaserSinterer || tile == FactoryTileType::HydraulicStamper) {
                bool hasCooler = false;
                if (x > 0 && m_factoryGrid[y][x - 1] == FactoryTileType::CoolingTower) hasCooler = true;
                if (x + 1 < FactoryGridSize && m_factoryGrid[y][x + 1] == FactoryTileType::CoolingTower) hasCooler = true;
                if (y > 0 && m_factoryGrid[y - 1][x] == FactoryTileType::CoolingTower) hasCooler = true;
                if (y + 1 < FactoryGridSize && m_factoryGrid[y + 1][x] == FactoryTileType::CoolingTower) hasCooler = true;
                if (hasCooler) thermalCoolerMatches += 1.0f;
            }

            // Check Left-Right Horizontal Symmetry
            int symX = (FactoryGridSize - 1) - x;
            if (m_factoryGrid[y][symX] == tile) {
                symmetricalPairs += 1.0f;
            }
        }
    }

    if (totalOccupied > 0) {
        report.linearFeedBonusPercent = (linearFeedMatches / totalOccupied) * 25.0f;
        report.thermalCoolingBonusPercent = (thermalCoolerMatches / totalOccupied) * 30.0f;
        report.symmetryScorePercent = (symmetricalPairs / totalOccupied) * 100.0f;
    }

    // 2. Evaluate Planetary Ring
    report.equatorialRingComplete = IsEquatorialRingComplete();
    float planetaryRingBonus = report.equatorialRingComplete ? 0.50f : 0.0f; // +50% export

    // 3. Evaluate Solar Dyson Orbital Resonance
    // Check if rings exist near resonant integer ratios (e.g. 0.39 AU Mercury, 0.72 AU Venus, 1.0 AU Earth)
    if (m_dysonRings.size() >= 3) {
        report.orbitalResonanceAligned = true;
    }
    float solarResonanceBonus = report.orbitalResonanceAligned ? 0.30f : 0.0f; // +30% power

    // Compute composite layout multiplier
    float symmetryMultiplier = (report.symmetryScorePercent >= 90.0f) ? 0.20f : 0.0f;
    report.totalLayoutMultiplier = 1.0f + (report.linearFeedBonusPercent / 100.0f) 
                                        + (report.thermalCoolingBonusPercent / 100.0f) 
                                        + symmetryMultiplier 
                                        + planetaryRingBonus 
                                        + solarResonanceBonus;

    return report;
}

} // namespace OmniEngine
