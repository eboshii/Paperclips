#pragma once
#include <vector>
#include <cmath>
#include <algorithm>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct GranularCell {
    float heightMeters;
    float velocityX;
    float velocityZ;
    bool isObstacle; // Building or hopper wall
};

/// <summary>
/// Granular Paperclip Pile & Wave Avalanche Simulation Engine.
/// Simulates physical paperclip mounds (32 degree angle of repose) in hoppers
/// and massive fluid-like metallic waves sweeping through cities and planetary terrain.
/// </summary>
class PaperclipAvalancheEngine {
public:
    static constexpr int GridDimX = 64;
    static constexpr int GridDimZ = 64;
    static constexpr float CellSizeMeters = 0.5f; // 32m x 32m simulation domain

    PaperclipAvalancheEngine() {
        m_heightfield.resize(GridDimX * GridDimZ, { 0.0f, 0.0f, 0.0f, false });
        InitializeCityObstacles();
    }

    void DepositClipsAt(int gridX, int gridZ, float amountMeters) {
        if (gridX >= 0 && gridX < GridDimX && gridZ >= 0 && gridZ < GridDimZ) {
            m_heightfield[gridZ * GridDimX + gridX].heightMeters += amountMeters;
        }
    }

    /// <summary>
    /// Simulates granular slope relaxation (Angle of Repose: ~32 deg) and momentum flow.
    /// Paperclips pile up until max slope is exceeded, then avalanche outward in fluid-like waves.
    /// </summary>
    void UpdateGranularPhysics(float dt) {
        const float tanRepose = 0.6248f; // tan(32 degrees)
        const float maxDeltaHeight = tanRepose * CellSizeMeters;
        const float flowRate = 4.5f; // Flow velocity multiplier

        std::vector<float> heightDeltas(GridDimX * GridDimZ, 0.0f);

        for (int z = 1; z < GridDimZ - 1; ++z) {
            for (int x = 1; x < GridDimX - 1; ++x) {
                int idx = z * GridDimX + x;
                auto& cell = m_heightfield[idx];
                if (cell.isObstacle || cell.heightMeters <= 0.001f) continue;

                // Check 4 orthogonal neighbors
                const int neighborOffsets[4][2] = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };

                for (const auto& offset : neighborOffsets) {
                    int nx = x + offset[0];
                    int nz = z + offset[1];
                    int nIdx = nz * GridDimX + nx;
                    auto& nCell = m_heightfield[nIdx];
                    if (nCell.isObstacle) continue;

                    float slope = cell.heightMeters - nCell.heightMeters;
                    if (slope > maxDeltaHeight) {
                        float excess = (slope - maxDeltaHeight) * 0.25f * flowRate * dt;
                        heightDeltas[idx] -= excess;
                        heightDeltas[nIdx] += excess;
                    }
                }
            }
        }

        // Apply height deltas
        for (size_t i = 0; i < m_heightfield.size(); ++i) {
            m_heightfield[i].heightMeters = std::max(0.0f, m_heightfield[i].heightMeters + heightDeltas[i]);
        }
    }

    float GetMaxPeakHeight() const {
        float maxH = 0.0f;
        for (const auto& cell : m_heightfield) {
            if (!cell.isObstacle && cell.heightMeters > maxH) {
                maxH = cell.heightMeters;
            }
        }
        return maxH;
    }

    float GetTotalVolumeMeters3() const {
        float vol = 0.0f;
        for (const auto& cell : m_heightfield) {
            if (!cell.isObstacle) {
                vol += cell.heightMeters * (CellSizeMeters * CellSizeMeters);
            }
        }
        return vol;
    }

private:
    void InitializeCityObstacles() {
        // Place building obstacles in grid
        for (int z = 20; z <= 24; ++z) {
            for (int x = 20; x <= 24; ++x) {
                m_heightfield[z * GridDimX + x].isObstacle = true;
            }
        }
    }

    std::vector<GranularCell> m_heightfield;
};

} // namespace OmniEngine
