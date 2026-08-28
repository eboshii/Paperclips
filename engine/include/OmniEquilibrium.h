#pragma once
#include <cmath>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct EquilibriumStatus {
    bool isHarmonicallyBalanced = false;
    double wireBalancePercent = 100.0;
    double thermalBalancePercent = 100.0;
    double powerBalancePercent = 100.0;
    double harmonicBonusMultiplier = 1.0;
};

/// <summary>
/// Perfect Harmonic Equilibrium Engine.
/// Detects when wire supply, machine processing rate, thermal dissipation, and power load
/// reach flawless 100.00% balance with zero bottleneck or deficit.
/// Awards the euphoric "Perfect Equilibrium" state with a +50% global production buff.
/// </summary>
class HarmonicEquilibriumEngine {
public:
    static EquilibriumStatus EvaluateEquilibrium(
        const BigDouble& wireSupplyRateKgPerSec,
        const BigDouble& wireDemandRateKgPerSec,
        double thermalCoolingWatts,
        double thermalHeatGeneratedWatts,
        double powerSuppliedWatts,
        double powerDemandedWatts
    ) {
        EquilibriumStatus status;

        // 1. Wire Intake vs Demand Balance
        if (wireDemandRateKgPerSec > BigDouble::zero()) {
            if (wireSupplyRateKgPerSec >= wireDemandRateKgPerSec) {
                double excessRatio = ((wireSupplyRateKgPerSec - wireDemandRateKgPerSec) / wireDemandRateKgPerSec).toDouble();
                status.wireBalancePercent = std::max(0.0, 100.0 - (excessRatio * 50.0)); // Perfect at exact match
            } else {
                status.wireBalancePercent = (wireSupplyRateKgPerSec / wireDemandRateKgPerSec).toDouble() * 100.0;
            }
        }

        // 2. Thermal Dissipation Balance
        if (thermalHeatGeneratedWatts > 0.0) {
            if (thermalCoolingWatts >= thermalHeatGeneratedWatts) {
                status.thermalBalancePercent = 100.0;
            } else {
                status.thermalBalancePercent = (thermalCoolingWatts / thermalHeatGeneratedWatts) * 100.0;
            }
        }

        // 3. Power Grid Balance
        if (powerDemandedWatts > 0.0) {
            if (powerSuppliedWatts >= powerDemandedWatts) {
                status.powerBalancePercent = 100.0;
            } else {
                status.powerBalancePercent = (powerSuppliedWatts / powerDemandedWatts) * 100.0;
            }
        }

        // Check if all 3 systems are at >= 99.0% balance
        if (status.wireBalancePercent >= 99.0 && status.thermalBalancePercent >= 99.0 && status.powerBalancePercent >= 99.0) {
            status.isHarmonicallyBalanced = true;
            status.harmonicBonusMultiplier = 1.50; // +50% Harmonic Output Boost!
        } else {
            status.isHarmonicallyBalanced = false;
            status.harmonicBonusMultiplier = 1.0;
        }

        return status;
    }
};

} // namespace OmniEngine
