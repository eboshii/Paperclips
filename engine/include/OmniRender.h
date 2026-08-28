#pragma once
#include <cmath>
#include <vector>
#include <array>

namespace OmniEngine {

struct alignas(16) Matrix4x4 {
    std::array<float, 16> m = {
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    };
};

struct InstanceData {
    Matrix4x4 worldMatrix;
    float colorTint[4];
    float metallicWear;
    float padding[3];
};

class LogarithmicCamera {
public:
    // 17 Granular Scale Tiers: 1m (Workbench) up to 1e30m (Multiverse Inflation Foam)
    static constexpr float s_tierDistances[17] = {
        1.2f,       // T1: Workbench (1m)
        10.0f,      // T2: Startup Workshop (10m)
        100.0f,     // T3: Factory Floor (100m)
        1200.0f,    // T4: Industrial Megapark (1km)
        50000.0f,   // T5: Metropolitan City (50km)
        5000000.0f, // T6: Continental Mine (5,000km)
        50000000.0f,// T7: Earth & Moon Ring (50,000km)
        7.5e11f,    // T8: Inner Solar System (5 AU)
        7.5e12f,    // T9: Solar Dyson Swarm (50 AU)
        9.46e15f,   // T10: Interstellar Void (1 LY)
        9.46e20f,   // T11: Milky Way Galaxy (100k LY)
        9.46e23f,   // T12: Cosmic Web Filament (100M LY)
        8.80e26f,   // T13: Observable Universe (93B LY)
        1.0e28f,    // T14: Quantum Many-Worlds (Parallel Earths)
        1.0e29f,    // T15: 11D String Manifolds (Hyper-Tesseracts)
        1.0e30f,    // T16: Multiverse Inflation Foam (Bubble Universes)
        1.0e31f     // T17: The Omniverse & Simulation Core
    };

    LogarithmicCamera(float fovDegrees = 60.0f, float nearPlane = 0.05f, float farPlane = 1e32f)
        : m_fov(fovDegrees), m_near(nearPlane), m_far(farPlane), m_logConstant(1.0f) {
        UpdateLogConstant();
    }

    void SetClippingPlanes(float nearPlane, float farPlane) {
        m_near = nearPlane;
        m_far = farPlane;
        UpdateLogConstant();
    }

    float GetLogConstant() const { return m_logConstant; }

    /// <summary>
    /// Computes reverse-Z logarithmic projection matrix parameters.
    /// Eliminates z-fighting across workbench (0.05m) to galaxy clusters (10^18m).
    /// </summary>
    void BuildReverseZLogProjection(float aspectRatio, Matrix4x4& outProj) {
        float fovRad = m_fov * (3.1415926535f / 180.0f);
        float tanHalfFov = std::tan(fovRad / 2.0f);

        outProj.m[0]  = 1.0f / (aspectRatio * tanHalfFov);
        outProj.m[5]  = 1.0f / tanHalfFov;
        outProj.m[10] = 0.0f; // Reverse-Z: far is mapped to 0
        outProj.m[11] = -1.0f;
        outProj.m[14] = m_near;
        outProj.m[15] = 0.0f;
    }

private:
    void UpdateLogConstant() {
        m_logConstant = 2.0f / (std::log2(m_far + 1.0f));
    }

    float m_fov;
    float m_near;
    float m_far;
    float m_logConstant;
};

} // namespace OmniEngine
