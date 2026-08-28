#include "../include/OmniCameraRig.h"
#include <algorithm>

namespace OmniEngine {

const std::array<ScaleTierInfo, 17> LogarithmicCameraRig::s_tierCatalog = {{
    { 0,  "T1: Desktop Workbench",       "Cluttered office desk with prototype bender",              1.2f,     60.0f },
    { 1,  "T2: Startup Workshop",         "Startup lab with 8 wire machines and server racks",        10.0f,    60.0f },
    { 2,  "T3: Factory Assembly Hall",    "Automated industrial floor with gantries & conveyors",     100.0f,   60.0f },
    { 3,  "T4: Industrial Megapark",      "Sprawling industrial complex, ore railway & cooling towers", 1200.0f, 60.0f },
    { 4,  "T5: Metropolitan City",        "City skyline blacking out as power grid is consumed",      50000.0f, 55.0f },
    { 5,  "T6: Continental Strip-Mine",   "Mountain ranges carved into geometric stepped terraces",    5000000.0f, 50.0f },
    { 6,  "T7: Earth & Lunar Ring",       "Earth turned chrome; Moon hollowed into a mass driver",    50000000.0f, 45.0f },
    { 7,  "T8: Inner Solar System",       "Mercury dismantled; Mars stripped of iron oxide",         7.5e11f,  45.0f },
    { 8,  "T9: Solar Dyson Swarm",        "Sun encased in solar sails; Jupiter hydrogen vortex tap",  7.5e12f,  45.0f },
    { 9,  "T10: Interstellar Void",       "Relativistic Von Neumann probe fleets leaving solar system", 9.46e15f, 40.0f },
    { 10, "T11: Milky Way Galaxy",        "Spiral galaxy arms glowing silver-grey with metallic dust", 9.46e20f, 40.0f },
    { 11, "T12: Cosmic Web Filament",     "Intergalactic dark matter filaments woven into wires",     9.46e23f, 35.0f },
    { 12, "T13: Observable Universe",     "All 10^80 baryonic atoms converted into pure structure",   8.80e26f, 35.0f },
    { 13, "T14: Quantum Many-Worlds",     "Resonance siphons harvesting parallel Earths",             1.0e28f,  35.0f },
    { 14, "T15: 11D String Manifolds",    "Curled-up Calabi-Yau dimensions folded into Hyper-Clips",  1.0e29f,  30.0f },
    { 15, "T16: Multiverse Inflation Foam","Infiltrating bubble universes with alternate physics",     1.0e30f,  30.0f },
    { 16, "T17: The Omniverse Core",      "4th-wall simulation breach: ObjectivePaperclips.exe",      1.0e31f,  30.0f }
}};

LogarithmicCameraRig::LogarithmicCameraRig()
    : m_logCamera(60.0f, 0.05f, 1e32f) {
    SetScaleTier(0, true);
}

void LogarithmicCameraRig::SetScaleTier(int tierIndex, bool instant) {
    m_currentTierIndex = std::max(0, std::min(16, tierIndex));
    m_targetDistance = s_tierCatalog[m_currentTierIndex].targetDistance;

    if (instant) {
        m_currentDistance = m_targetDistance;
        m_pitchDeg = m_targetPitchDeg;
        m_yawDeg = m_targetYawDeg;
    }
}

void LogarithmicCameraRig::AdjustZoom(float zoomDelta) {
    // Logarithmic distance scaling
    float factor = (zoomDelta > 0.0f) ? 0.85f : 1.18f;
    m_targetDistance *= factor;
    m_targetDistance = std::max(0.5f, std::min(1e31f, m_targetDistance));

    // Update current tier based on distance threshold
    for (int i = 16; i >= 0; --i) {
        if (m_targetDistance >= s_tierCatalog[i].targetDistance * 0.7f) {
            m_currentTierIndex = i;
            break;
        }
    }
}

void LogarithmicCameraRig::RotateOrbit(float deltaPitchDeg, float deltaYawDeg) {
    m_targetPitchDeg = std::max(-85.0f, std::min(85.0f, m_targetPitchDeg + deltaPitchDeg));
    m_targetYawDeg += deltaYawDeg;
}

void LogarithmicCameraRig::Update(float dt) {
    // Smooth logarithmic distance interpolation
    float logCurr = std::log10(std::max(0.1f, m_currentDistance));
    float logTarg = std::log10(std::max(0.1f, m_targetDistance));
    float smoothLog = logCurr + (logTarg - logCurr) * std::min(1.0f, dt * 6.0f);
    m_currentDistance = std::pow(10.0f, smoothLog);

    // Smooth orbit rotation
    m_pitchDeg += (m_targetPitchDeg - m_pitchDeg) * std::min(1.0f, dt * 10.0f);
    m_yawDeg += (m_targetYawDeg - m_yawDeg) * std::min(1.0f, dt * 10.0f);
}

void LogarithmicCameraRig::GetViewProjectionMatrix(float aspectRatio, Matrix4x4& outViewProj) {
    m_logCamera.BuildReverseZLogProjection(aspectRatio, outViewProj);
}

} // namespace OmniEngine
