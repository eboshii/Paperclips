#pragma once
#include <array>
#include <cmath>
#include <string>
#include <iostream>
#include "OmniRender.h"

namespace OmniEngine {

struct ScaleTierInfo {
    int tierIndex;
    std::string name;
    std::string description;
    float targetDistance;
    float cameraFov;
};

/// <summary>
/// Continuous Logarithmic Camera Rig supporting seamless zoom across all 17 scale tiers.
/// Features smooth exponential damping and reverse-Z depth projection.
/// </summary>
class LogarithmicCameraRig {
public:
    LogarithmicCameraRig();

    void SetScaleTier(int tierIndex, bool instant = false);
    void AdjustZoom(float zoomDelta);
    void RotateOrbit(float deltaPitchDeg, float deltaYawDeg);
    void Update(float dt);

    int GetCurrentTier() const { return m_currentTierIndex; }
    float GetCurrentDistance() const { return m_currentDistance; }
    const ScaleTierInfo& GetCurrentTierInfo() const { return s_tierCatalog[m_currentTierIndex]; }

    void GetViewProjectionMatrix(float aspectRatio, Matrix4x4& outViewProj);

    static const std::array<ScaleTierInfo, 17> s_tierCatalog;

private:
    int m_currentTierIndex = 0;
    float m_currentDistance = 1.2f;
    float m_targetDistance = 1.2f;

    float m_pitchDeg = 25.0f;
    float m_yawDeg = 45.0f;
    float m_targetPitchDeg = 25.0f;
    float m_targetYawDeg = 45.0f;

    LogarithmicCamera m_logCamera;
};

} // namespace OmniEngine
