#pragma once
#include <string>
#include <vector>
#include <functional>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

enum class UILayoutMode {
    DesktopLandscape, // 16:9 / 21:9 Ultrawide (Steam)
    MobilePortrait,   // 9:16 Touch Ergonomics
    MobileLandscape   // 16:9 Touch Ergonomics
};

struct Rect2D {
    float x, y, width, height;
};

struct HUDLayout {
    Rect2D viewport3D;
    Rect2D resourceHeader;
    Rect2D upgradePanel;
    Rect2D terminalLog;
    Rect2D telemetryGraphs;
    Rect2D quickActionBar;
};

/// <summary>
/// Hardware-accelerated Cyberpunk CRT HUD layout and rendering manager.
/// Ergonomically responsive across Steam desktop monitors and mobile touch displays.
/// </summary>
class UIController {
public:
    UIController(float screenWidth = 1920.0f, float screenHeight = 1080.0f);

    void SetScreenSize(float width, float height);
    UILayoutMode GetLayoutMode() const { return m_layoutMode; }
    const HUDLayout& GetLayout() const { return m_layout; }

    void RenderHUD(const BigDouble& totalClips, const BigDouble& cps, double matterConversionPercent, int activeTier);

private:
    void RecomputeLayout();

    float m_screenWidth;
    float m_screenHeight;
    UILayoutMode m_layoutMode;
    HUDLayout m_layout;
};

} // namespace OmniEngine
