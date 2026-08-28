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
    const BigDouble& /*lifetimeClips*/,
    const BigDouble& /*currentCPS*/,
    const BigDouble& /*wireKg*/,
    const BigDouble& /*fundsUsd*/,
    double /*currentOps*/
) const {
    // Native UI rendering is now 100% handled inside the hardware-accelerated OpenGL window.
}

} // namespace OmniEngine
