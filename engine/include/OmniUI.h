#pragma once
#include <string>
#include <vector>
#include <iostream>
#include "OmniMath.h"
#include "OmniHeroClicker.h"

namespace OmniEngine {

enum class UIMenuTab {
    Production,  // Auto-Clippers, Stampers, Megamills with Buy 1, 10, Next
    Research,    // 32+ Technology Web Cards with cost pills
    SpatialGrid, // 8x8 Factory Floor & Orbital Ring Layout with Autoplacer toggle
    Telemetry,   // Machine % breakdown, tactile sliders, 100% equilibrium badge
    Achievements // Curated 10 badges & secret lore unlocks
};

struct AccessibleAccessibilitySettings {
    bool holdToClickAutoPulse = false;
    bool highContrastMode = false;
    bool screenShakeEnabled = true;
    bool crtScanlineCurvature = true;
    float uiScaleMultiplier = 1.0f; // 1.0x to 2.0x
};

class UIController {
public:
    UIController(float screenWidth, float screenHeight);

    void SetActiveTab(UIMenuTab tab) { m_activeTab = tab; }
    UIMenuTab GetActiveTab() const { return m_activeTab; }

    HeroClickerEngine& GetHeroClicker() { return m_heroClicker; }
    AccessibleAccessibilitySettings& GetSettings() { return m_settings; }

    void HandleClickBigPaperclip(BigDouble& inOutClips, const BigDouble& currentWireKg);
    void Update(float dt);

    void RenderAccessibleHUD(
        const BigDouble& lifetimeClips,
        const BigDouble& currentCPS,
        const BigDouble& wireKg,
        const BigDouble& fundsUsd,
        double currentOps
    ) const;

private:
    float m_screenWidth;
    float m_screenHeight;
    UIMenuTab m_activeTab = UIMenuTab::Production;
    HeroClickerEngine m_heroClicker;
    AccessibleAccessibilitySettings m_settings;
};

} // namespace OmniEngine
