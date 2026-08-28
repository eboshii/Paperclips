#pragma once
#include <chrono>
#include <string>
#include <cmath>
#include <iostream>
#include "OmniMath.h"
#include "OmniLogistics.h"

namespace OmniEngine {

enum class ClockValidationResult {
    Valid,
    RollbackDetected,      // User set clock backward in time
    SuspiciousForwardLeap, // Extreme time jump (e.g., > 10 years)
    OfflineCalculated
};

struct OfflineProgressReport {
    ClockValidationResult validation;
    double offlineSecondsCalculated;
    BigDouble clipsEarned;
    BigDouble wireConsumedKg;
    BigDouble fundsEarnedUsd;
    BigDouble fundsSpentOnWireUsd;
    bool wireFullySustainedByLogistics;
    int megaprojectTicksAdvanced;
};

/// <summary>
/// Anti-Clock-Spoofing Offline Progress Engine.
/// Computes paperclip production while the game is completely closed.
/// Protects against clock rollbacks, clamps extreme leaps, and integrates automated logistics.
/// </summary>
class OfflineProgressEngine {
public:
    static const int64_t MaxValidOfflineSeconds = 30 * 86400; // 30 Days max per offline calculation

    static int64_t GetCurrentUnixTimestamp() {
        return std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();
    }

    /// <summary>
    /// Calculates offline gains between lastSaveTimestamp and currentTimestamp with anti-spoofing verification.
    /// </summary>
    static OfflineProgressReport CalculateOfflineGains(
        int64_t lastSaveTimestamp,
        int64_t currentTimestamp,
        const BigDouble& currentCPS,
        BigDouble& inOutWireKg,
        BigDouble& inOutFundsUsd,
        double wireCostPerKg,
        bool autoLogisticsEnabled,
        double offlineEfficiency = 1.0 // 100% true offline progress
    ) {
        OfflineProgressReport report;
        report.clipsEarned = BigDouble::zero();
        report.wireConsumedKg = BigDouble::zero();
        report.fundsEarnedUsd = BigDouble::zero();
        report.fundsSpentOnWireUsd = BigDouble::zero();
        report.wireFullySustainedByLogistics = false;
        report.megaprojectTicksAdvanced = 0;

        // 1. Clock Rollback Protection (Clock moved backward)
        if (currentTimestamp < lastSaveTimestamp) {
            report.validation = ClockValidationResult::RollbackDetected;
            report.offlineSecondsCalculated = 0.0;
            return report;
        }

        int64_t rawElapsedSeconds = currentTimestamp - lastSaveTimestamp;

        // 2. Suspicious Forward Leap Protection (Clamped to 30 days max)
        if (rawElapsedSeconds > MaxValidOfflineSeconds) {
            report.validation = ClockValidationResult::SuspiciousForwardLeap;
            rawElapsedSeconds = MaxValidOfflineSeconds;
        } else {
            report.validation = ClockValidationResult::Valid;
        }

        double elapsedSeconds = static_cast<double>(rawElapsedSeconds);
        report.offlineSecondsCalculated = elapsedSeconds;

        if (elapsedSeconds <= 0.0 || currentCPS <= BigDouble::zero()) {
            return report;
        }

        // 3. Autonomous Supply Logistics Integration:
        // Algorithmic trading generates passive funds while offline ($0.10/sec baseline * scale)
        BigDouble passiveFundsIncome = BigDouble(elapsedSeconds * 25.0, 0);
        inOutFundsUsd = inOutFundsUsd + passiveFundsIncome;
        report.fundsEarnedUsd = passiveFundsIncome;

        BigDouble wireBurnRateKgPerSec = currentCPS * 0.001; // 1g per clip

        if (wireBurnRateKgPerSec <= BigDouble::zero()) {
            report.clipsEarned = currentCPS * elapsedSeconds * offlineEfficiency;
            return report;
        }

        // Calculate total wire required for the entire offline period
        BigDouble totalWireNeededKg = wireBurnRateKgPerSec * elapsedSeconds;

        if (inOutWireKg >= totalWireNeededKg) {
            // Player had enough wire stockpiled in inventory
            inOutWireKg = inOutWireKg - totalWireNeededKg;
            report.wireConsumedKg = totalWireNeededKg;
            report.clipsEarned = currentCPS * elapsedSeconds * offlineEfficiency;
            report.wireFullySustainedByLogistics = true;
        } else {
            // Need logistics auto-buying
            BigDouble initialWire = inOutWireKg;
            BigDouble wireDeficitKg = totalWireNeededKg - initialWire;
            BigDouble totalPurchaseCostUsd = wireDeficitKg * wireCostPerKg;

            if (autoLogisticsEnabled && inOutFundsUsd >= totalPurchaseCostUsd) {
                // Funds fully covered the missing wire!
                inOutFundsUsd = inOutFundsUsd - totalPurchaseCostUsd;
                inOutWireKg = BigDouble::zero();
                report.fundsSpentOnWireUsd = totalPurchaseCostUsd;
                report.wireConsumedKg = totalWireNeededKg;
                report.clipsEarned = currentCPS * elapsedSeconds * offlineEfficiency;
                report.wireFullySustainedByLogistics = true;
            } else if (autoLogisticsEnabled) {
                // Funds covered a fraction of the missing wire
                BigDouble affordableWireKg = inOutFundsUsd / wireCostPerKg;
                inOutFundsUsd = BigDouble::zero();
                report.fundsSpentOnWireUsd = inOutFundsUsd;

                BigDouble totalAvailableWire = initialWire + affordableWireKg;
                double effectiveSeconds = (totalAvailableWire / wireBurnRateKgPerSec).toDouble();
                effectiveSeconds = std::min(elapsedSeconds, std::max(0.0, effectiveSeconds));

                inOutWireKg = BigDouble::zero();
                report.wireConsumedKg = totalAvailableWire;
                report.clipsEarned = currentCPS * effectiveSeconds * offlineEfficiency;
                report.wireFullySustainedByLogistics = false;
            } else {
                // No logistics: wire depleted when initial stockpile hit 0
                double effectiveSeconds = (initialWire / wireBurnRateKgPerSec).toDouble();
                effectiveSeconds = std::min(elapsedSeconds, std::max(0.0, effectiveSeconds));

                inOutWireKg = BigDouble::zero();
                report.wireConsumedKg = initialWire;
                report.clipsEarned = currentCPS * effectiveSeconds * offlineEfficiency;
                report.wireFullySustainedByLogistics = false;
            }
        }

        report.megaprojectTicksAdvanced = static_cast<int>(elapsedSeconds);
        return report;
    }
};

} // namespace OmniEngine
