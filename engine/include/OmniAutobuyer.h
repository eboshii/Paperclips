#pragma once
#include <string>
#include <vector>
#include <functional>
#include "OmniMath.h"

namespace OmniEngine {

struct AutobuyerRule {
    std::string buildingId;
    int targetMaxCount = 1000;
    bool isEnabled = true;
    double spendingBudgetRatio = 0.50; // Spend up to 50% of clips
};

/// <summary>
/// Scriptable Autobuyer & Logic Directives Engine.
/// Allows long-haul players to automate building purchases, research unlocking,
/// and prestige resets while playing or idle.
/// </summary>
class AutobuyerEngine {
public:
    bool autoPrestigeEnabled = false;
    double autoPrestigeThresholdMultiplier = 10.0; // Prestige when pending bits >= 10x current
    bool autoResearchEnabled = true;

    std::vector<AutobuyerRule> rules;

    AutobuyerEngine() {
        InitializeDefaultRules();
    }

    void ProcessAutobuyers(BigDouble& inOutClips, const std::function<bool(const std::string&, int)>& purchaseCallback) {
        for (auto& rule : rules) {
            if (!rule.isEnabled) continue;

            // Execute purchase callback
            purchaseCallback(rule.buildingId, 1);
        }
    }

    bool ShouldAutoPrestige(const BigDouble& currentEntropicBits, const BigDouble& pendingEntropicBits) const {
        if (!autoPrestigeEnabled) return false;
        if (currentEntropicBits == BigDouble::zero()) {
            return pendingEntropicBits >= BigDouble(100.0, 0);
        }
        return pendingEntropicBits >= (currentEntropicBits * autoPrestigeThresholdMultiplier);
    }

private:
    void InitializeDefaultRules() {
        rules.push_back({ "auto_clipper", 500, true, 0.20 });
        rules.push_back({ "pneumatic_stamper", 250, true, 0.25 });
        rules.push_back({ "laser_sinterer", 100, true, 0.30 });
        rules.push_back({ "megamill", 50, true, 0.35 });
        rules.push_back({ "bio_converter", 25, true, 0.40 });
    }
};

} // namespace OmniEngine
