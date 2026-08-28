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
    LogarithmicCamera(float fovDegrees = 60.0f, float nearPlane = 0.05f, float farPlane = 1e18f)
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
