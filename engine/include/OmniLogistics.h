#pragma once
#include <algorithm>
#include "OmniMath.h"

namespace OmniEngine {

/// <summary>
/// Autonomous Supply Logistics Engine.
/// Automatically buys raw wire using algorithmic trading funds and manages supply buffers
/// so production never halts during long offline idle periods (e.g. 8-12 hours of sleep).
/// </summary>
class AutonomousLogisticsEngine {
public:
    bool autoBuyWireEnabled = true;
    double targetBufferKg = 10000.0; // Maintain at least 10,000kg wire buffer
    double wirePricePerKg = 15.0;

    void ProcessLogistics(BigDouble& wireKg, BigDouble& fundsUsd, const BigDouble& cps, double deltaTime) {
        if (!autoBuyWireEnabled) return;

        // Calculate expected wire burn rate
        BigDouble burnRatePerSec = cps * 0.001; // 1g per clip
        BigDouble wireNeeded = burnRatePerSec * deltaTime;

        // If wire is below target buffer, auto-purchase using available trading funds
        if (wireKg < targetBufferKg && fundsUsd > BigDouble::zero()) {
            BigDouble deficitKg = BigDouble(targetBufferKg, 0) - wireKg;
            BigDouble purchaseCost = deficitKg * wirePricePerKg;

            if (fundsUsd >= purchaseCost) {
                fundsUsd = fundsUsd - purchaseCost;
                wireKg = wireKg + deficitKg;
            } else {
                // Buy as much wire as funds permit
                BigDouble affordableKg = fundsUsd / wirePricePerKg;
                wireKg = wireKg + affordableKg;
                fundsUsd = BigDouble::zero();
            }
        }
    }
};

} // namespace OmniEngine
