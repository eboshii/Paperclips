#pragma once
#include <string>
#include <vector>
#include <functional>
#include <iostream>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include "OmniGLWindow.h"
#include "OmniMath.h"

namespace OmniEngine {

enum class InteractiveTab {
    Store,          // Buildings & Upgrades Shelf (Classic Cookie Clicker Store)
    Tech,           // Full Research Web / Upgrade Tree
    SpatialGrid,    // 8x8 Factory Layout & Synergies
    Stats           // Badges & Telemetry
};

enum class ButtonStyle {
    BuildingRow,
    UpgradeIcon,
    TabHeader,
    MultiplierPill,
    ActionPill,
    CosmicPill
};

struct ClickableButton {
    std::string id;
    ButtonStyle style = ButtonStyle::ActionPill;
    float x = 0.0f, y = 0.0f, w = 0.0f, h = 0.0f;
    std::string text;
    std::string subtext;
    std::string extraRight; // e.g. Count owned for building rows
    std::string tooltipTitle;
    std::string tooltipText;
    float r = 0.2f, g = 0.2f, b = 0.25f;
    bool isEnabled = true;
    bool isSelected = false;
    bool isHovered = false;
    std::function<void()> onClick;
};

struct FloatingPopup2D {
    float x = 0.0f, y = 0.0f;
    std::string text;
    float r = 1.0f, g = 0.85f, b = 0.25f;
    float alpha = 1.0f;
    float life = 1.0f;
    float maxLife = 1.0f;
    float scale = 1.1f;
};

/// <summary>
/// Modern, Sleek Interactive UI Manager inspired by Cookie Clicker.
/// Provides crisp building rows, bulk purchase multipliers (1x, 10x, 100x),
/// horizontal upgrade shelf with tooltips, and 2D particle popups.
/// </summary>
class InteractiveUIManager {
public:
    InteractiveTab activeTab = InteractiveTab::Store;
    int buyMultiplier = 1; // 1, 10, 100

    InteractiveUIManager() = default;

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

    void SpawnPopup(float x, float y, const std::string& text, float r = 1.0f, float g = 0.88f, float b = 0.25f, float scale = 1.2f) {
        FloatingPopup2D pop;
        pop.x = x;
        pop.y = y;
        pop.text = text;
        pop.r = r; pop.g = g; pop.b = b;
        pop.maxLife = 1.1f;
        pop.life = pop.maxLife;
        pop.scale = scale;
        m_popups.push_back(pop);
    }

    void Update(float dt) {
        // Update 2D Floating Popups
        for (auto& pop : m_popups) {
            pop.life -= dt;
            pop.y -= 40.0f * dt; // Float upward
            pop.alpha = std::clamp(pop.life / pop.maxLife, 0.0f, 1.0f);
        }
        m_popups.erase(
            std::remove_if(m_popups.begin(), m_popups.end(), [](const FloatingPopup2D& p) { return p.life <= 0.0f; }),
            m_popups.end()
        );
    }

    void ProcessMouseInput(float mouseX, float mouseY, bool mouseClicked) {
        m_hoveredTooltipTitle.clear();
        m_hoveredTooltipText.clear();

        for (auto& btn : m_buttons) {
            bool inside = (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                           mouseY >= btn.y && mouseY <= btn.y + btn.h);
            btn.isHovered = inside;

            if (inside) {
                if (!btn.tooltipText.empty() || !btn.tooltipTitle.empty()) {
                    m_hoveredTooltipTitle = btn.tooltipTitle;
                    m_hoveredTooltipText = btn.tooltipText;
                    m_tooltipMouseX = mouseX;
                    m_tooltipMouseY = mouseY;
                }
                if (mouseClicked && btn.isEnabled) {
                    if (btn.onClick) {
                        btn.onClick();
                    }
                }
            }
        }
    }

    void RenderUI(OmniGLWindow& window) {
        // 1. Render All Buttons
        for (const auto& btn : m_buttons) {
            if (btn.style == ButtonStyle::TabHeader) {
                if (btn.isSelected) {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.16f, 0.32f, 0.42f, 0.95f,
                        0.35f, 0.78f, 0.95f, 0.90f);
                    window.DrawHUDQuad(btn.x, btn.y + btn.h - 2.0f, btn.w, 2.0f, 0.40f, 0.90f, 1.0f, 1.0f);
                } else if (btn.isHovered) {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.15f, 0.18f, 0.24f, 0.90f,
                        0.28f, 0.35f, 0.45f, 0.80f);
                } else {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.10f, 0.12f, 0.16f, 0.85f,
                        0.18f, 0.22f, 0.28f, 0.60f);
                }
                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 10.0f, btn.text, 1.15f,
                    btn.isSelected ? 1.0f : (btn.isHovered ? 0.95f : 0.75f),
                    btn.isSelected ? 1.0f : (btn.isHovered ? 0.95f : 0.75f),
                    btn.isSelected ? 1.0f : (btn.isHovered ? 0.95f : 0.75f),
                    1.0f);
            }
            else if (btn.style == ButtonStyle::MultiplierPill) {
                if (btn.isSelected) {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.18f, 0.35f, 0.45f, 0.95f,
                        0.40f, 0.85f, 0.95f, 0.95f);
                } else if (btn.isHovered) {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.15f, 0.18f, 0.24f, 0.90f,
                        0.30f, 0.38f, 0.48f, 0.80f);
                } else {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.10f, 0.12f, 0.16f, 0.80f,
                        0.18f, 0.22f, 0.28f, 0.60f);
                }
                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 7.0f, btn.text, 1.05f,
                    btn.isSelected ? 0.40f : 0.80f,
                    btn.isSelected ? 0.95f : 0.80f,
                    btn.isSelected ? 1.00f : 0.80f,
                    1.0f);
            }
            else if (btn.style == ButtonStyle::BuildingRow) {
                // Classic Cookie Clicker building row styling
                float bgR = btn.isEnabled ? (btn.isHovered ? 0.17f : 0.12f) : 0.08f;
                float bgG = btn.isEnabled ? (btn.isHovered ? 0.21f : 0.15f) : 0.09f;
                float bgB = btn.isEnabled ? (btn.isHovered ? 0.27f : 0.20f) : 0.12f;
                float borderR = btn.isEnabled ? (btn.isHovered ? 0.35f : 0.22f) : 0.15f;
                float borderG = btn.isEnabled ? (btn.isHovered ? 0.45f : 0.28f) : 0.17f;
                float borderB = btn.isEnabled ? (btn.isHovered ? 0.58f : 0.36f) : 0.21f;

                window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.92f, borderR, borderG, borderB, 0.70f);

                // Top highlight line on hover
                if (btn.isHovered && btn.isEnabled) {
                    window.DrawHUDQuad(btn.x, btn.y, btn.w, 1.5f, 0.45f, 0.85f, 1.0f, 0.8f);
                }

                // Building Name
                window.DrawHUDText(btn.x + 12.0f, btn.y + 11.0f, btn.text, 1.25f,
                    btn.isEnabled ? 1.0f : 0.45f,
                    btn.isEnabled ? 1.0f : 0.45f,
                    btn.isEnabled ? 1.0f : 0.45f,
                    btn.isEnabled ? 1.0f : 0.60f);

                // Cost & Yield Subtitle
                window.DrawHUDText(btn.x + 12.0f, btn.y + 35.0f, btn.subtext, 1.0f,
                    btn.isEnabled ? 0.40f : 0.65f,
                    btn.isEnabled ? 0.90f : 0.35f,
                    btn.isEnabled ? 0.50f : 0.35f,
                    btn.isEnabled ? 0.95f : 0.50f);

                // Count Owned on Right
                if (!btn.extraRight.empty()) {
                    window.DrawHUDTextRight(btn.x + btn.w - 14.0f, btn.y + 14.0f, btn.extraRight, 2.0f,
                        btn.isEnabled ? 0.85f : 0.32f,
                        btn.isEnabled ? 0.80f : 0.32f,
                        btn.isEnabled ? 0.65f : 0.32f,
                        btn.isEnabled ? 0.75f : 0.35f);
                }
            }
            else if (btn.style == ButtonStyle::UpgradeIcon) {
                // Compact square/rounded upgrade shelf card
                float bgR = btn.isEnabled ? (btn.isHovered ? 0.18f : 0.13f) : 0.08f;
                float bgG = btn.isEnabled ? (btn.isHovered ? 0.25f : 0.18f) : 0.10f;
                float bgB = btn.isEnabled ? (btn.isHovered ? 0.35f : 0.25f) : 0.13f;

                window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h, bgR, bgG, bgB, 0.95f,
                    btn.isHovered ? 0.45f : 0.25f,
                    btn.isHovered ? 0.80f : 0.40f,
                    btn.isHovered ? 0.95f : 0.55f,
                    0.80f);

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
                if (btn.isSelected) {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.18f, 0.35f, 0.45f, 0.95f,
                        0.40f, 0.85f, 0.95f, 0.95f);
                } else if (btn.isHovered) {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.14f, 0.17f, 0.23f, 0.90f,
                        0.30f, 0.38f, 0.48f, 0.80f);
                } else {
                    window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h,
                        0.09f, 0.11f, 0.15f, 0.80f,
                        0.18f, 0.22f, 0.28f, 0.50f);
                }
                window.DrawHUDTextCentered(btn.x + btn.w * 0.5f, btn.y + 8.0f, btn.text, 1.05f,
                    btn.isSelected ? 0.45f : 0.85f,
                    btn.isSelected ? 0.95f : 0.85f,
                    btn.isSelected ? 1.00f : 0.85f,
                    1.0f);
            }
            else {
                // ActionPill
                float r = btn.r * (btn.isHovered ? 1.2f : 1.0f);
                float g = btn.g * (btn.isHovered ? 1.2f : 1.0f);
                float b = btn.b * (btn.isHovered ? 1.2f : 1.0f);
                float a = btn.isEnabled ? 0.90f : 0.40f;

                window.DrawHUDCard(btn.x, btn.y, btn.w, btn.h, r, g, b, a,
                    r * 1.4f, g * 1.4f, b * 1.4f, a);

                if (btn.isHovered && btn.isEnabled) {
                    window.DrawHUDQuad(btn.x, btn.y, btn.w, 1.5f, 1.0f, 1.0f, 1.0f, 0.8f);
                }

                window.DrawHUDText(btn.x + 10.0f, btn.y + 8.0f, btn.text, 1.15f,
                    btn.isEnabled ? 1.0f : 0.55f,
                    btn.isEnabled ? 1.0f : 0.55f,
                    btn.isEnabled ? 1.0f : 0.55f,
                    btn.isEnabled ? 1.0f : 0.55f);

                if (!btn.subtext.empty()) {
                    window.DrawHUDText(btn.x + 10.0f, btn.y + 26.0f, btn.subtext, 0.95f,
                        btn.isEnabled ? 0.85f : 0.45f,
                        btn.isEnabled ? 0.90f : 0.45f,
                        btn.isEnabled ? 0.95f : 0.45f,
                        btn.isEnabled ? 0.9f : 0.45f);
                }
            }
        }

        // 2. Render 2D Popups
        for (const auto& pop : m_popups) {
            window.DrawHUDText(pop.x, pop.y, pop.text, pop.scale, pop.r, pop.g, pop.b, pop.alpha);
        }

        // 3. Render Hover Tooltip Box (Floating overlay)
        if (!m_hoveredTooltipText.empty() || !m_hoveredTooltipTitle.empty()) {
            RenderTooltip(window);
        }
    }

private:
    void RenderTooltip(OmniGLWindow& window) {
        float titleWidth = OmniFont::GetTextWidth(m_hoveredTooltipTitle, 1.0f);
        float bodyWidth = OmniFont::GetTextWidth(m_hoveredTooltipText, 1.0f);
        float tipW = std::min(420.0f, std::max(240.0f, std::max(titleWidth, bodyWidth) + 28.0f));

        int lineCount = 1;
        for (char c : m_hoveredTooltipText) {
            if (c == '\n') lineCount++;
        }
        float tipH = (m_hoveredTooltipTitle.empty() ? 16.0f : 30.0f) + lineCount * 14.0f + 10.0f;

        float tipX = m_tooltipMouseX + 16.0f;
        float tipY = m_tooltipMouseY + 16.0f;

        // Keep tooltip on screen
        if (tipX + tipW > 1260.0f) tipX = m_tooltipMouseX - tipW - 8.0f;
        if (tipY + tipH > 700.0f) tipY = m_tooltipMouseY - tipH - 8.0f;
        if (tipX < 10.0f) tipX = 10.0f;
        if (tipY < 10.0f) tipY = 10.0f;

        // Glowing background card
        window.DrawHUDCard(tipX, tipY, tipW, tipH,
            0.07f, 0.09f, 0.13f, 0.98f,
            0.35f, 0.65f, 0.85f, 0.90f);

        // Tooltip Title
        if (!m_hoveredTooltipTitle.empty()) {
            window.DrawHUDText(tipX + 12.0f, tipY + 10.0f, m_hoveredTooltipTitle, 1.0f, 1.0f, 0.88f, 0.35f, 1.0f);
        }

        // Tooltip Text (Supports multiline)
        if (!m_hoveredTooltipText.empty()) {
            float textY = m_hoveredTooltipTitle.empty() ? (tipY + 10.0f) : (tipY + 28.0f);
            window.DrawHUDText(tipX + 12.0f, textY, m_hoveredTooltipText, 1.0f, 0.85f, 0.90f, 0.95f, 0.95f);
        }
    }

    std::vector<ClickableButton> m_buttons;
    std::vector<FloatingPopup2D> m_popups;

    std::string m_hoveredTooltipTitle;
    std::string m_hoveredTooltipText;
    float m_tooltipMouseX = 0.0f;
    float m_tooltipMouseY = 0.0f;
};

} // namespace OmniEngine
