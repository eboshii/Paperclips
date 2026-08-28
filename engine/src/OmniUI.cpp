#include "../include/OmniUI.h"
#include <iomanip>

namespace OmniEngine {

UIController::UIController(float screenWidth, float screenHeight)
    : m_screenWidth(screenWidth), m_screenHeight(screenHeight) {
    RecomputeLayout();
}

void UIController::SetScreenSize(float width, float height) {
    m_screenWidth = width;
    m_screenHeight = height;
    RecomputeLayout();
}

void UIController::RecomputeLayout() {
    float aspect = m_screenWidth / std::max(1.0f, m_screenHeight);

    if (aspect < 1.0f) {
        // Mobile Portrait Mode (9:16)
        m_layoutMode = UILayoutMode::MobilePortrait;

        // Top 40% 3D Viewport
        m_layout.viewport3D = { 0.0f, 0.0f, m_screenWidth, m_screenHeight * 0.40f };
        // Persistent Top Bar
        m_layout.resourceHeader = { 0.0f, 0.0f, m_screenWidth, m_screenHeight * 0.08f };
        // Middle 15% Telemetry / Terminal
        m_layout.terminalLog = { 0.0f, m_screenHeight * 0.40f, m_screenWidth, m_screenHeight * 0.15f };
        m_layout.telemetryGraphs = { 0.0f, m_screenHeight * 0.40f, m_screenWidth, m_screenHeight * 0.15f };
        // Bottom 45% Scrollable Upgrade Drawer & Tap Zone
        m_layout.upgradePanel = { 0.0f, m_screenHeight * 0.55f, m_screenWidth, m_screenHeight * 0.35f };
        m_layout.quickActionBar = { 0.0f, m_screenHeight * 0.90f, m_screenWidth, m_screenHeight * 0.10f };
    } else {
        // Desktop Landscape Mode (16:9 / 21:9)
        m_layoutMode = UILayoutMode::DesktopLandscape;

        // Top Header
        m_layout.resourceHeader = { 0.0f, 0.0f, m_screenWidth, m_screenHeight * 0.07f };
        // Left 55% 3D Interactive Viewport
        m_layout.viewport3D = { 0.0f, m_screenHeight * 0.07f, m_screenWidth * 0.55f, m_screenHeight * 0.65f };
        // Bottom Left Terminal Feed
        m_layout.terminalLog = { 0.0f, m_screenHeight * 0.72f, m_screenWidth * 0.55f, m_screenHeight * 0.28f };
        // Right 45% Tech & Upgrade Panel
        m_layout.upgradePanel = { m_screenWidth * 0.55f, m_screenHeight * 0.07f, m_screenWidth * 0.45f, m_screenHeight * 0.65f };
        // Bottom Right Telemetry Hub
        m_layout.telemetryGraphs = { m_screenWidth * 0.55f, m_screenHeight * 0.72f, m_screenWidth * 0.45f, m_screenHeight * 0.28f };
        m_layout.quickActionBar = { 0.0f, 0.0f, 0.0f, 0.0f }; // Integrated in desktop
    }
}

void UIController::RenderHUD(const BigDouble& totalClips, const BigDouble& cps, double matterConversionPercent, int activeTier) {
    std::cout << "\n+=============================================================================+\n";
    std::cout << "| [HUD TELEMETRY]  CLIPS: " << std::left << std::setw(20) << totalClips.toShortScale()
              << " | RATE: +" << std::setw(15) << (cps.toShortScale() + "/sec")
              << " | TIER: " << activeTier << " |\n";
    std::cout << "| MATTER CONVERTED: " << std::fixed << std::setprecision(4) << matterConversionPercent << "%"
              << " | LAYOUT MODE: " << (m_layoutMode == UILayoutMode::DesktopLandscape ? "DESKTOP 16:9" : "MOBILE 9:16") << "                |\n";
    std::cout << "+=============================================================================+\n";
}

} // namespace OmniEngine
