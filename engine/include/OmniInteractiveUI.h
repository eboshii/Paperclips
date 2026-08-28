#pragma once
#include <string>
#include <vector>
#include <functional>
#include <cmath>
#include <algorithm>
#include "OmniGLWindow.h"
#include "OmniFont.h"

namespace OmniEngine {

enum class InteractiveTab {
    Store,
    Tech,
    SpatialGrid,
    Stats
};

enum class ButtonStyle {
    TabHeader,
    MultiplierPill,
    BuildingRow,
    UpgradeIcon,
    ActionPill,
    CosmicPill
};

struct ClickableButton {
    std::string id;
    ButtonStyle style;
    float x, y, w, h;
    std::string text;
    std::string subtext;
    std::string extraRight;
    std::string tooltipTitle;
    std::string tooltipText;
    bool isEnabled = true;
    bool isHovered = false;
    bool isSelected = false;
    bool isPressed = false;
    float r = 0.2f, g = 0.2f, b = 0.2f;
    std::function<void()> onClick;
};

struct FloatingPopup {
    float x, y;
    std::string text;
    float r, g, b;
    float alpha = 1.0f;
    float scale = 1.2f;
    float lifetime = 1.2f;
    float maxLifetime = 1.2f;
    float vy = -45.0f;
};

/// <summary>
/// Manages Playful Cartoon Interactive UI: 3D-lipped tactile buttons, cute icons, popups, and tooltips.
/// </summary>
class InteractiveUIManager {
public:
    InteractiveTab activeTab = InteractiveTab::Store;
    int buyMultiplier = 1;

    void ClearButtons() {
        m_buttons.clear();
    }

    void AddTabButton(const std::string& id, float x, float y, float w, float h,
                      const std::string& text, bool isSelected, std::function<void()> onClick)
    {
        ClickableButton btn;
        btn.id = id;
        btn.style = ButtonStyle::TabHeader;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = text;
        btn.isSelected = isSelected;
        btn.isEnabled = true;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void AddMultiplierButton(const std::string& id, float x, float y, float w, float h,
                             const std::string& text, bool isSelected, std::function<void()> onClick)
    {
        ClickableButton btn;
        btn.id = id;
        btn.style = ButtonStyle::MultiplierPill;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = text;
        btn.isSelected = isSelected;
        btn.isEnabled = true;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void AddBuildingRow(const std::string& id, float x, float y, float w, float h,
                        const std::string& name, const std::string& costStr, const std::string& yieldStr,
                        int countOwned, bool canAfford,
                        const std::string& tooltipTitle, const std::string& tooltipDesc,
                        std::function<void()> onClick)
    {
        ClickableButton btn;
        btn.id = id;
        btn.style = ButtonStyle::BuildingRow;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = name;
        btn.subtext = costStr + " | " + yieldStr;
        btn.extraRight = (countOwned > 0) ? std::to_string(countOwned) : "";
        btn.tooltipTitle = tooltipTitle;
        btn.tooltipText = tooltipDesc;
        btn.isEnabled = canAfford;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void AddUpgradeIcon(const std::string& id, float x, float y, float w, float h,
                        const std::string& label, const std::string& costStr,
                        bool canAfford, const std::string& title, const std::string& effectDesc,
                        std::function<void()> onClick)
    {
        ClickableButton btn;
        btn.id = id;
        btn.style = ButtonStyle::UpgradeIcon;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = label;
        btn.subtext = costStr;
        btn.tooltipTitle = title;
        btn.tooltipText = effectDesc + "\nCost: " + costStr;
        btn.isEnabled = canAfford;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void AddActionPill(const std::string& id, float x, float y, float w, float h,
                       const std::string& text, const std::string& subtext,
                       float r, float g, float b, bool isEnabled, std::function<void()> onClick,
                       const std::string& tooltipTitle = "", const std::string& tooltipText = "")
    {
        ClickableButton btn;
        btn.id = id;
        btn.style = ButtonStyle::ActionPill;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = text;
        btn.subtext = subtext;
        btn.r = r; btn.g = g; btn.b = b;
        btn.isEnabled = isEnabled;
        btn.tooltipTitle = tooltipTitle;
        btn.tooltipText = tooltipText;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void AddCosmicPill(const std::string& id, float x, float y, float w, float h,
                       const std::string& text, bool isSelected, std::function<void()> onClick)
    {
        ClickableButton btn;
        btn.id = id;
        btn.style = ButtonStyle::CosmicPill;
        btn.x = x; btn.y = y; btn.w = w; btn.h = h;
        btn.text = text;
        btn.isSelected = isSelected;
        btn.isEnabled = true;
        btn.onClick = onClick;
        m_buttons.push_back(btn);
    }

    void SpawnPopup(float x, float y, const std::string& text, float r = 1.0f, float g = 0.85f, float b = 0.25f, float scale = 1.2f) {
        FloatingPopup pop;
        pop.x = x;
        pop.y = y;
        pop.text = text;
        pop.r = r; pop.g = g; pop.b = b;
        pop.scale = scale;
        pop.lifetime = 1.2f;
        pop.maxLifetime = 1.2f;
        m_popups.push_back(pop);
    }

    void Update(float dt) {
        for (auto it = m_popups.begin(); it != m_popups.end();) {
            it->lifetime -= dt;
            if (it->lifetime <= 0.0f) {
                it = m_popups.erase(it);
            } else {
                it->y += it->vy * dt;
                it->alpha = std::clamp(it->lifetime / it->maxLifetime, 0.0f, 1.0f);
                ++it;
            }
        }
    }

    bool ProcessMouseInput(float mx, float my, bool isClick) {
        m_hoveredTooltipTitle.clear();
        m_hoveredTooltipText.clear();
        m_mouseX = mx;
        m_mouseY = my;

        bool handled = false;
        for (auto& btn : m_buttons) {
            bool inBounds = (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h);
            btn.isHovered = inBounds;

            if (inBounds) {
                if (!btn.tooltipTitle.empty() || !btn.tooltipText.empty()) {
                    m_hoveredTooltipTitle = btn.tooltipTitle;
                    m_hoveredTooltipText = btn.tooltipText;
                }

                if (isClick && btn.isEnabled && btn.onClick) {
                    btn.onClick();
                    handled = true;
                }
            }
        }
        return handled;
    }

    void RenderUI(OmniGLWindow& window) {
        auto& rast = window.GetRasterizer();

        // 1. Render All Buttons with Playful Cartoony Styling
        for (const auto& btn : m_buttons) {
            if (btn.style == ButtonStyle::TabHeader) {
                float bgR = btn.isSelected ? 0.18f : (btn.isHovered ? 0.16f : 0.11f);
                float bgG = btn.isSelected ? 0.45f : (btn.isHovered ? 0.22f : 0.14f);
                float bgB = btn.isSelected ? 0.65f : (btn.isHovered ? 0.32f : 0.20f);

                float borderR = btn.isSelected ? 0.35f : 0.22f;
                float borderG = btn.isSelected ? 0.85f : 0.28f;
                float borderB = btn.isSelected ? 1.00f : 0.38f;

                rast.DrawHUDTactileCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.95f,
                                        borderR, borderG, borderB, 0.90f, 3.0f, btn.isSelected);

                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 9.0f, btn.text, 1.15f,
                    btn.isSelected ? 1.0f : (btn.isHovered ? 0.95f : 0.75f),
                    btn.isSelected ? 1.0f : (btn.isHovered ? 0.95f : 0.75f),
                    btn.isSelected ? 1.0f : (btn.isHovered ? 0.95f : 0.75f),
                    1.0f);
            }
            else if (btn.style == ButtonStyle::MultiplierPill) {
                float bgR = btn.isSelected ? 0.95f : (btn.isHovered ? 0.20f : 0.12f);
                float bgG = btn.isSelected ? 0.65f : (btn.isHovered ? 0.24f : 0.15f);
                float bgB = btn.isSelected ? 0.15f : (btn.isHovered ? 0.32f : 0.20f);

                rast.DrawHUDTactileCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.95f,
                                        0.25f, 0.30f, 0.40f, 0.85f, 2.5f, btn.isSelected);

                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 6.0f, btn.text, 1.05f,
                    btn.isSelected ? 0.10f : 0.85f,
                    btn.isSelected ? 0.10f : 0.85f,
                    btn.isSelected ? 0.10f : 0.85f,
                    1.0f);
            }
            else if (btn.style == ButtonStyle::BuildingRow) {
                // Playful Chunky Arcade Card
                float bgR = btn.isEnabled ? (btn.isHovered ? 0.16f : 0.12f) : 0.08f;
                float bgG = btn.isEnabled ? (btn.isHovered ? 0.22f : 0.16f) : 0.09f;
                float bgB = btn.isEnabled ? (btn.isHovered ? 0.30f : 0.22f) : 0.13f;

                float borderR = btn.isEnabled ? (btn.isHovered ? 0.45f : 0.26f) : 0.16f;
                float borderG = btn.isEnabled ? (btn.isHovered ? 0.75f : 0.36f) : 0.18f;
                float borderB = btn.isEnabled ? (btn.isHovered ? 0.95f : 0.50f) : 0.22f;

                rast.DrawHUDTactileCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.95f,
                                        borderR, borderG, borderB, 0.85f, 3.5f, false);
                // Draw cute mini 2D paperclip stamp on left
                rast.Draw2DPaperclipIcon(btn.x + 18.0f, btn.y + 22.0f, 0.75f,
                    btn.isEnabled ? 0.98f : 0.45f,
                    btn.isEnabled ? 0.85f : 0.45f,
                    btn.isEnabled ? 0.30f : 0.45f, 1.0f);

                // Building Name
                window.DrawHUDText(btn.x + 32.0f, btn.y + 11.0f, btn.text, 1.20f,
                    btn.isEnabled ? 1.0f : 0.50f,
                    btn.isEnabled ? 1.0f : 0.50f,
                    btn.isEnabled ? 1.0f : 0.50f,
                    btn.isEnabled ? 1.0f : 0.60f);

                // Cost & Yield Subtitle
                window.DrawHUDText(btn.x + 32.0f, btn.y + 34.0f, btn.subtext, 1.0f,
                    btn.isEnabled ? 0.35f : 0.65f,
                    btn.isEnabled ? 0.95f : 0.35f,
                    btn.isEnabled ? 0.55f : 0.35f,
                    btn.isEnabled ? 1.0f : 0.50f);

                // Count Owned Badge on Right
                if (!btn.extraRight.empty()) {
                    window.DrawHUDTextRight(btn.x + btn.w - 14.0f, btn.y + 14.0f, btn.extraRight, 2.0f,
                        btn.isEnabled ? 0.98f : 0.35f,
                        btn.isEnabled ? 0.88f : 0.35f,
                        btn.isEnabled ? 0.35f : 0.35f,
                        btn.isEnabled ? 0.95f : 0.40f);
                }
            }
            else if (btn.style == ButtonStyle::UpgradeIcon) {
                float bgR = btn.isEnabled ? (btn.isHovered ? 0.18f : 0.13f) : 0.08f;
                float bgG = btn.isEnabled ? (btn.isHovered ? 0.28f : 0.19f) : 0.10f;
                float bgB = btn.isEnabled ? (btn.isHovered ? 0.42f : 0.28f) : 0.14f;

                rast.DrawHUDTactileCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.95f,
                    btn.isHovered ? 0.45f : 0.28f,
                    btn.isHovered ? 0.85f : 0.48f,
                    btn.isHovered ? 1.00f : 0.65f,
                    0.85f, 3.0f, false);

                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 8.0f, btn.text, 0.95f,
                    btn.isEnabled ? 1.0f : 0.45f,
                    btn.isEnabled ? 1.0f : 0.45f,
                    btn.isEnabled ? 1.0f : 0.45f,
                    btn.isEnabled ? 1.0f : 0.55f);

                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 26.0f, btn.subtext, 0.85f,
                    btn.isEnabled ? 0.40f : 0.55f,
                    btn.isEnabled ? 0.90f : 0.35f,
                    btn.isEnabled ? 0.60f : 0.35f,
                    btn.isEnabled ? 0.90f : 0.45f);
            }
            else if (btn.style == ButtonStyle::CosmicPill) {
                float bgR = btn.isSelected ? 0.18f : (btn.isHovered ? 0.15f : 0.10f);
                float bgG = btn.isSelected ? 0.42f : (btn.isHovered ? 0.19f : 0.12f);
                float bgB = btn.isSelected ? 0.62f : (btn.isHovered ? 0.26f : 0.17f);

                rast.DrawHUDTactileCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.95f,
                                        0.30f, 0.60f, 0.85f, 0.85f, 2.5f, btn.isSelected);

                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 8.0f, btn.text, 1.05f,
                    btn.isSelected ? 0.45f : 0.85f,
                    btn.isSelected ? 0.95f : 0.85f,
                    btn.isSelected ? 1.00f : 0.85f,
                    1.0f);
            }
            else {
                // ActionPill
                float r = btn.r * (btn.isHovered ? 1.25f : 1.0f);
                float g = btn.g * (btn.isHovered ? 1.25f : 1.0f);
                float b = btn.b * (btn.isHovered ? 1.25f : 1.0f);
                float a = btn.isEnabled ? 0.95f : 0.45f;

                rast.DrawHUDTactileCard(btn.x, btn.y, btn.w, btn.h, r, g, b, a,
                                        r * 1.5f, g * 1.5f, b * 1.5f, a, 3.0f, false);

                window.DrawHUDText(btn.x + 12.0f, btn.y + 8.0f, btn.text, 1.15f,
                    btn.isEnabled ? 1.0f : 0.55f,
                    btn.isEnabled ? 1.0f : 0.55f,
                    btn.isEnabled ? 1.0f : 0.55f,
                    btn.isEnabled ? 1.0f : 0.55f);

                if (!btn.subtext.empty()) {
                    window.DrawHUDText(btn.x + 12.0f, btn.y + 26.0f, btn.subtext, 0.95f,
                        btn.isEnabled ? 0.90f : 0.45f,
                        btn.isEnabled ? 0.95f : 0.45f,
                        btn.isEnabled ? 1.00f : 0.45f,
                        btn.isEnabled ? 0.95f : 0.45f);
                }
            }
        }

        // 2. Render 2D Cartoon Bouncy Popups
        for (const auto& pop : m_popups) {
            window.DrawHUDText(pop.x, pop.y, pop.text, pop.scale, pop.r, pop.g, pop.b, pop.alpha);
        }

        // 3. Render Floating Tooltip Box
        if (!m_hoveredTooltipTitle.empty() || !m_hoveredTooltipText.empty()) {
            RenderTooltip(window, m_mouseX, m_mouseY, m_hoveredTooltipTitle, m_hoveredTooltipText);
        }
    }

private:
    std::vector<ClickableButton> m_buttons;
    std::vector<FloatingPopup> m_popups;
    std::string m_hoveredTooltipTitle;
    std::string m_hoveredTooltipText;
    float m_mouseX = 0.0f;
    float m_mouseY = 0.0f;

    void RenderTooltip(OmniGLWindow& window, float mx, float my, const std::string& title, const std::string& desc) {
        float scale = 1.0f;
        float titleW = OmniFont::GetTextWidth(title, 1.15f);

        std::vector<std::string> lines;
        std::string curLine;
        float maxDescW = 0.0f;
        for (char c : desc) {
            if (c == '\n') {
                lines.push_back(curLine);
                maxDescW = std::max(maxDescW, OmniFont::GetTextWidth(curLine, scale));
                curLine.clear();
            } else {
                curLine += c;
            }
        }
        if (!curLine.empty()) {
            lines.push_back(curLine);
            maxDescW = std::max(maxDescW, OmniFont::GetTextWidth(curLine, scale));
        }

        float contentW = std::max(titleW, maxDescW);
        float tooltipW = std::max(220.0f, contentW + 24.0f);
        float tooltipH = 34.0f + static_cast<float>(lines.size()) * 16.0f + 14.0f;

        float tx = mx + 16.0f;
        float ty = my + 16.0f;
        if (tx + tooltipW > 1260.0f) tx = mx - tooltipW - 10.0f;
        if (ty + tooltipH > 700.0f) ty = my - tooltipH - 10.0f;

        // Bubbly Tooltip Frame
        window.DrawHUDCard(tx, ty, tooltipW, tooltipH,
            0.08f, 0.10f, 0.15f, 0.96f,
            0.35f, 0.70f, 0.95f, 0.90f);

        // Title with cute amber highlight
        window.DrawHUDText(tx + 12.0f, ty + 10.0f, title, 1.15f, 1.0f, 0.85f, 0.25f, 1.0f);

        // Body text
        float lineY = ty + 30.0f;
        for (const auto& line : lines) {
            window.DrawHUDText(tx + 12.0f, lineY, line, scale, 0.90f, 0.92f, 0.96f, 0.95f);
            lineY += 16.0f;
        }
    }
};

} // namespace OmniEngine
