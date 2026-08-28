#pragma once
#include <algorithm>
#include "OmniMath.h"

namespace OmniEngine {

/// <summary>
/// Next-Milestone Purchase Calculator (QoL).
/// Calculates the exact count and cost needed to reach the next round multiplier milestone
/// (25, 50, 100, 250, 500, 1000) with a single click.
/// </summary>
class MilestoneBuyer {
public:
    static int GetNextMilestoneTarget(int currentOwned) {
        static const int milestones[] = { 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000 };
        for (int m : milestones) {
            if (currentOwned < m) {
                return m;
            }
        }
        return currentOwned + 1000;
    }

    static int CalculateCountToNextMilestone(int currentOwned) {
        int target = GetNextMilestoneTarget(currentOwned);
        return target - currentOwned;
    }

    static BigDouble CalculateCostToNextMilestone(const BigDouble& baseCost, double costMultiplier, int currentOwned) {
        int countToBuy = CalculateCountToNextMilestone(currentOwned);
        if (countToBuy <= 0) return BigDouble::zero();

        double r = costMultiplier;
        double rToK = std::pow(r, currentOwned);
        double seriesFactor = (std::pow(r, countToBuy) - 1.0) / (r - 1.0);

        return baseCost * rToK * seriesFactor;
    }
};

} // namespace OmniEngine
