#pragma once
#include <algorithm>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

/// <summary>
/// Tactile Power, Matter & Cognitive Routing Sliders Engine.
/// Hands-on mechanical controls allowing the player to actively pilot trade-offs
/// between speed, thermal stability, wire harvesting, and research allocation.
/// </summary>
class RoutingSlidersEngine {
public:
    // Slider 1: Power Grid Bias (0.0 = 100% Eco Cooling, 1.0 = 100% Overclock Speed)
    float powerBiasNorm = 0.5f;

    // Slider 2: Matter Deconstruction Focus (0.0 = 100% Surface Metals/Wire, 1.0 = 100% Atmospheric Nitrogen/Ops)
    float matterFocusNorm = 0.5f;

    // Slider 3: Cognitive CPU Allocation (0.0 = 100% Market Trading Profits, 1.0 = 100% Quantum Memory Research)
    float cognitiveAllocationNorm = 0.5f;

    // Multipliers derived from sliders
    double GetSpeedMultiplier() const {
        // Range: 0.70x (Eco) to 1.60x (Max Overclock)
        return 0.70 + (powerBiasNorm * 0.90);
    }

    double GetThermalHeatMultiplier() const {
        // Range: 0.40x (Eco) to 2.20x (Overclock Heat)
        return 0.40 + (powerBiasNorm * 1.80);
    }

    double GetWireHarvestRatio() const {
        // 0.0 = 100% wire focus, 1.0 = 20% wire focus
        return 1.0 - (matterFocusNorm * 0.80);
    }

    double GetOpsHarvestRatio() const {
        // 0.0 = 20% ops focus, 1.0 = 100% ops focus
        return 0.20 + (matterFocusNorm * 0.80);
    }

    double GetTradingProfitRatio() const {
        return 1.0 - cognitiveAllocationNorm;
    }

    double GetResearchSpeedRatio() const {
        return 0.20 + (cognitiveAllocationNorm * 1.80);
    }
};

} // namespace OmniEngine
