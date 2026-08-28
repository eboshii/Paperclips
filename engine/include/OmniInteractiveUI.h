#pragma once
#include <string>
#include <vector>
#include <functional>
#include <iostream>
#include "OmniGLWindow.h"
#include "OmniMath.h"

namespace OmniEngine {

enum class InteractiveTab {
    Production,
    Research,
    SpatialGrid,
    CosmicScale,
    Achievements
};

struct ClickableButton {
    std::string id;
    float x, y, w, h;
    std::string text;
    std::string subtext;
    float r, g, b;
    bool isEnabled = true;
    bool isHovered = false;
    bool isPressed = false;
    std::function<void()> onClick;
};

/// <summary>
/// Mouse-Driven Interactive Graphical UI Manager.
/// Provides 100% click-driven navigation, purchasing, research unlocking,
/// cosmic tier viewing, and spatial grid toggles directly inside the 3D window.
/// </summary>
class InteractiveUIManager {
public:
    InteractiveTab activeTab = InteractiveTab::Production;
    int buyMultiplier = 1; // 1, 10, 100

    InteractiveUIManager() = default;

    void ClearButtons() {
        m_buttons.clear();
    }

    void AddButton(const std::string& id, float x, float y, float w, float h, 
                   const std::string& text, const std::string& subtext,
                   float r, float g, float b, bool isEnabled, std::function<void()> onClick) 
    {
        ClickableButton btn;
        btn.id = id;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = text;
        btn.subtext = subtext;
        btn.r = r; btn.g = g; btn.b = b;
        btn.isEnabled = isEnabled;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void ProcessMouseInput(float mouseX, float mouseY, bool mouseClicked) {
        for (auto& btn : m_buttons) {
            bool inside = (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                           mouseY >= btn.y && mouseY <= btn.y + btn.h);
            btn.isHovered = inside;

            if (inside && mouseClicked && btn.isEnabled) {
                if (btn.onClick) {
                    btn.onClick();
                }
            }
        }
    }

    void RenderUI(OmniGLWindow& window) {
        for (const auto& btn : m_buttons) {
            float alpha = btn.isEnabled ? (btn.isHovered ? 1.0f : 0.88f) : 0.40f;
            float r = btn.r * (btn.isHovered ? 1.2f : 1.0f);
            float g = btn.g * (btn.isHovered ? 1.2f : 1.0f);
            float b = btn.b * (btn.isHovered ? 1.2f : 1.0f);

            // Button Card Quad
            window.DrawHUDQuad(btn.x, btn.y, btn.w, btn.h, r, g, b, alpha);

            // Top edge highlight
            if (btn.isHovered && btn.isEnabled) {
                window.DrawHUDQuad(btn.x, btn.y, btn.w, 3.0f, 1.0f, 1.0f, 1.0f, 0.9f);
            }

            // Text labels
            window.DrawHUDText(btn.x + 12.0f, btn.y + 12.0f, btn.text, 1.3f, 1.0f, 1.0f, 1.0f, btn.isEnabled ? 1.0f : 0.6f);
            if (!btn.subtext.empty()) {
                window.DrawHUDText(btn.x + 12.0f, btn.y + 32.0f, btn.subtext, 1.05f, 0.85f, 0.95f, 0.9f, btn.isEnabled ? 0.9f : 0.5f);
            }
        }
    }

private:
    std::vector<ClickableButton> m_buttons;
};

} // namespace OmniEngine
