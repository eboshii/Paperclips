#include "../include/OmniUI.h"
#include <cstdint>
#include <iomanip>
#include <iostream>

namespace OmniEngine {

UIController::UIController(float screenWidth, float screenHeight)
    : m_screenWidth(screenWidth), m_screenHeight(screenHeight) {}

void UIController::HandleClickBigPaperclip(BigDouble& inOutClips, const BigDouble& currentWireKg) {
    if (currentWireKg >= BigDouble(0.001, 0)) { // 1g wire
        m_heroClicker.OnClick();
        inOutClips = inOutClips + BigDouble(1.0, 0);
    }
}

void UIController::Update(float dt) {
    m_heroClicker.Update(dt);
}

void UIController::RenderAccessibleHUD(
    const BigDouble& lifetimeClips,
    const BigDouble& currentCPS,
    const BigDouble& wireKg,
    const BigDouble& fundsUsd,
    double currentOps
) const {
    const auto& clicker = m_heroClicker.GetState();

    std::cout << "\n+=============================================================================+\n";
    std::cout << "|  OBJECTIVE: PAPERCLIPS - ACCESSIBLE HUD INTERACTION VIEW                    |\n";
    std::cout << "+=============================================================================+\n";

    // 1. Hero Clicker Visual Display (Left / Center)
    std::cout << "| [HERO CLICKER ZONE]                                                         |\n";
    std::cout << "|   ( ( (  [ 📎 THE BIG PAPERCLIP ]  ) ) )                                    |\n";
    std::cout << "|   * Squish Scale:        " << std::fixed << std::setprecision(2) << clicker.scale 
              << "x  | Hover Tilt: " << clicker.rotationDeg << " deg" << std::setw(15) << " |\n";
    std::cout << "|   * Flywheel Charge Ring: [" << std::setw(3) << static_cast<int>(clicker.flywheelChargeNorm * 100.0f) 
              << "%] " << (clicker.flywheelChargeNorm >= 0.8f ? "\033[92m[OVERCLOCK ACTIVE +300%]\033[0m" : "[CHARGING...]") << "        |\n";

    // 2. High-Contrast Big Numbers Odometer
    std::cout << "|                                                                             |\n";
    std::cout << "| [TOTAL PAPERCLIPS]:      \033[93m" << std::left << std::setw(48) << (lifetimeClips.toShortScale() + " CLIPS") << "\033[0m |\n";
    std::cout << "| [PRODUCTION RATE]:       \033[92m+" << std::left << std::setw(47) << (currentCPS.toShortScale() + " /sec") << "\033[0m |\n";
    std::cout << "| [RAW WIRE STOCKPILE]:    " << std::left << std::setw(48) << (wireKg.toShortScale() + " kg") << " |\n";
    std::cout << "| [ALGORITHMIC FUNDS]:     " << std::left << std::setw(48) << ("$" + fundsUsd.toShortScale()) << " |\n";
    std::cout << "| [COMPUTATIONAL OPS]:     " << std::left << std::setw(48) << (std::to_string(static_cast<int64_t>(currentOps)) + " Ops") << " |\n";

    // 3. Tabbed Navigation Bar
    std::cout << "+-----------------------------------------------------------------------------+\n";
    std::cout << "| [TABS]: " 
              << (m_activeTab == UIMenuTab::Production ? "\033[96m[1: 🏭 Production]\033[0m" : " 1: Production ") << " | "
              << (m_activeTab == UIMenuTab::Research   ? "\033[96m[2: 🔬 Research]\033[0m"   : " 2: Research ")   << " | "
              << (m_activeTab == UIMenuTab::SpatialGrid? "\033[96m[3: 🗺️ Grid]\033[0m"       : " 3: Grid ")       << " | "
              << (m_activeTab == UIMenuTab::Telemetry  ? "\033[96m[4: 📊 Stats]\033[0m"      : " 4: Stats ")      << " | "
              << (m_activeTab == UIMenuTab::Achievements ? "\033[96m[5: 🏆 Badges]\033[0m"  : " 5: Badges ")     << " |\n";
    std::cout << "+=============================================================================+\n";
}

} // namespace OmniEngine
