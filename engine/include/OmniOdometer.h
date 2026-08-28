#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include <map>
#include <iomanip>
#include <sstream>
#include "OmniMath.h"

namespace OmniEngine {

struct MachineContribution {
    std::string machineName;
    BigDouble outputCPS;
    double percentageOfTotal;
};

/// <summary>
/// Mechanical Rolling Odometer & High-Precision Statistics Engine.
/// Provides comma-separated digit rendering, exact machine contribution percentages,
/// and input/output throughput purity metrics.
/// </summary>
class MechanicalOdometerEngine {
public:
    /// <summary>
    /// Renders raw digits with comma separation (e.g. "14,295,810,442,109")
    /// or high-precision mechanical notation for astronomical scales.
    /// </summary>
    static std::string FormatMechanicalOdometer(const BigDouble& val) {
        if (val.mantissa == 0.0) return "000,000,000";

        if (val.exponent < 15) {
            double raw = val.toDouble();
            int64_t intVal = static_cast<int64_t>(raw);
            std::string numStr = std::to_string(intVal);

            // Insert commas every 3 digits from right to left
            int insertPos = static_cast<int>(numStr.length()) - 3;
            while (insertPos > 0) {
                numStr.insert(insertPos, ",");
                insertPos -= 3;
            }
            return numStr;
        }

        // Higher scales: High-precision scientific rolling dial
        std::ostringstream ss;
        ss << std::fixed << std::setprecision(4) << val.mantissa << " [x10^" << val.exponent << "]";
        return ss.str();
    }

    /// <summary>
    /// Calculates exact percentage contribution of each machine type to total CPS.
    /// </summary>
    static std::vector<MachineContribution> CalculateContributions(
        const std::vector<std::pair<std::string, BigDouble>>& machineYields,
        const BigDouble& totalCPS
    ) {
        std::vector<MachineContribution> results;
        if (totalCPS <= BigDouble::zero()) return results;

        for (const auto& my : machineYields) {
            double pct = 0.0;
            if (my.second > BigDouble::zero()) {
                pct = (my.second / totalCPS).toDouble() * 100.0;
            }
            results.push_back({ my.first, my.second, pct });
        }
        return results;
    }

    /// <summary>
    /// Computes input/output throughput purity (0.00% to 100.00% Zero-Waste Equilibrium).
    /// </summary>
    static double CalculateThroughputPurity(const BigDouble& wireIntakeKgPerSec, const BigDouble& wireNeededKgPerSec) {
        if (wireNeededKgPerSec <= BigDouble::zero()) return 100.0;
        if (wireIntakeKgPerSec >= wireNeededKgPerSec) {
            return 100.0; // 100% saturated zero-waste throughput
        }
        return (wireIntakeKgPerSec / wireNeededKgPerSec).toDouble() * 100.0;
    }
};

} // namespace OmniEngine
