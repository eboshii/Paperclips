#pragma once
#include <cmath>
#include <algorithm>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct HeroClickerState {
    float scale = 1.0f;           // Rest scale 1.0, compresses on click to ~0.85
    float velocity = 0.0f;        // Spring velocity
    float rotationDeg = 0.0f;     // Subtle hover tilt
    float glowIntensity = 0.0f;   // Glow flare on click
    float flywheelChargeNorm = 0.0f; // 0.0 to 1.0 (Ring progress around the icon)
    bool isHovered = false;
    bool isPressed = false;
};

/// <summary>
/// The Iconic "Big Paperclip" Hero Clicker Engine.
/// Provides Cookie-Clicker-style juicy spring squish physics,
/// hovering float animation, and kinetic charge ring telemetry.
/// </summary>
class HeroClickerEngine {
public:
    HeroClickerEngine() = default;

    void OnClick() {
        // Apply violent spring compression impulse
        m_state.scale = 0.82f;
        m_state.velocity = -2.5f;
        m_state.glowIntensity = 1.0f;

        // Increase circular flywheel charge (+6% per click)
        m_state.flywheelChargeNorm = std::min(1.0f, m_state.flywheelChargeNorm + 0.06f);
        m_cooldownTimer = 1.5f;
    }

    void OnPointerDown() {
        m_state.isPressed = true;
        m_state.scale = 0.88f;
    }

    void OnPointerUp() {
        m_state.isPressed = false;
    }

    void SetHovered(bool hovered) {
        m_state.isHovered = hovered;
    }

    void Update(float dt) {
        // 1. Spring-Damper Kinematics for Click Squish: F = -k*(x - 1) - c*v
        const float springConstant = 240.0f;
        const float damping = 18.0f;

        float displacement = m_state.scale - 1.0f;
        float springForce = -springConstant * displacement - damping * m_state.velocity;

        m_state.velocity += springForce * dt;
        m_state.scale += m_state.velocity * dt;

        // 2. Idle Floating & Subtle Rotation Wobble
        m_hoverTime += dt;
        if (m_state.isHovered) {
            m_state.rotationDeg = std::sin(m_hoverTime * 3.5f) * 6.0f;
        } else {
            m_state.rotationDeg = std::sin(m_hoverTime * 1.5f) * 2.0f;
        }

        // 3. Glow Decay
        m_state.glowIntensity = std::max(0.0f, m_state.glowIntensity - dt * 4.0f);

        // 4. Flywheel Decay
        if (m_cooldownTimer > 0.0f) {
            m_cooldownTimer -= dt;
        } else {
            m_state.flywheelChargeNorm = std::max(0.0f, m_state.flywheelChargeNorm - dt * 0.125f);
        }
    }

    const HeroClickerState& GetState() const { return m_state; }

private:
    HeroClickerState m_state;
    float m_hoverTime = 0.0f;
    float m_cooldownTimer = 0.0f;
};

} // namespace OmniEngine
