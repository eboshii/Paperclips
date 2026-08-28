#pragma once
#include <vector>
#include <array>
#include <cmath>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct VoxelPallet {
    int x, y, z;
    bool isFilled = false;
    float metallicShine = 1.0f;
};

/// <summary>
/// Physical Voxel Stacking & Warehouse Storage Engine.
/// Visually packs completed paperclips into glistening metallic crates and wire coils
/// that stack neatly in 3D warehouse bays and orbital storage depots.
/// </summary>
class VoxelStorageEngine {
public:
    static constexpr int BayDimX = 10;
    static constexpr int BayDimY = 8;
    static constexpr int BayDimZ = 6;
    static constexpr int TotalPalletCapacity = BayDimX * BayDimY * BayDimZ; // 480 physical crates

    VoxelStorageEngine() {
        m_crates.resize(TotalPalletCapacity);
        ClearStorage();
    }

    void ClearStorage() {
        for (int i = 0; i < TotalPalletCapacity; ++i) {
            int x = i % BayDimX;
            int z = (i / BayDimX) % BayDimZ;
            int y = i / (BayDimX * BayDimZ);
            m_crates[i] = { x, y, z, false, 1.0f };
        }
        m_filledCratesCount = 0;
    }

    /// <summary>
    /// Updates filled pallet count based on total inventory clips.
    /// Each crate represents a discrete threshold (e.g. 10,000 clips in early game, scales with tier).
    /// </summary>
    void UpdateStorage(const BigDouble& storedClips, double clipsPerCrate = 10000.0) {
        if (storedClips <= BigDouble::zero() || clipsPerCrate <= 0.0) {
            ClearStorage();
            return;
        }

        double rawCrates = (storedClips / clipsPerCrate).toDouble();
        m_filledCratesCount = std::min(TotalPalletCapacity, static_cast<int>(rawCrates));

        for (int i = 0; i < TotalPalletCapacity; ++i) {
            m_crates[i].isFilled = (i < m_filledCratesCount);
        }
    }

    int GetFilledCrateCount() const { return m_filledCratesCount; }
    float GetWarehouseFillPercent() const {
        return (static_cast<float>(m_filledCratesCount) / TotalPalletCapacity) * 100.0f;
    }

    const std::vector<VoxelPallet>& GetCrates() const { return m_crates; }

private:
    int m_filledCratesCount = 0;
    std::vector<VoxelPallet> m_crates;
};

} // namespace OmniEngine
