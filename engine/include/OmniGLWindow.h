#pragma once
#include <string>
#include <functional>
#include <vector>
#include <cstdint>
#include "OmniMeshBuilder.h"
#include "OmniMath.h"
#include "OmniFont.h"
#include "OmniParticles.h"

namespace OmniEngine {

struct WindowInputEvents {
    bool mouseLeftClicked = false;
    bool mouseRightDown = false;
    float mouseX = 0.0f;
    float mouseY = 0.0f;
    float mouseDeltaX = 0.0f;
    float mouseDeltaY = 0.0f;
    float mouseScrollDelta = 0.0f;
    char lastKeyPressed = 0;
};

/// <summary>
/// Native OpenGL 3D Graphical Window Engine (Zero external dependencies).
/// Creates a high-performance 1280x720 3D hardware-accelerated desktop window on Windows 11.
/// </summary>
class OmniGLWindow {
public:
    OmniGLWindow(const std::string& title, int width, int height);
    ~OmniGLWindow();

    bool Initialize();
    bool ProcessMessages();
    void Swap();
    void Close();

    bool IsOpen() const { return m_isOpen; }
    int GetWidth() const { return m_width; }
    int GetHeight() const { return m_height; }

    WindowInputEvents PollInput();

    // 3D Scene Rendering
    void BeginFrame(float r = 0.05f, float g = 0.06f, float b = 0.08f);
    void UpdateCameraInterpolation(float targetDistance, float targetPitchDeg, float targetYawDeg, float dt);
    void ApplyCamera3D();
    void DrawMesh3D(const std::vector<RenderVertex3D>& mesh, float posX, float posY, float posZ, float rotDeg, float scale = 1.0f);
    void DrawPaperclipMound(float pileClipsCount);
    
    // 2D Graphical HUD Overlay
    void BeginHUD2D();
    void DrawHUDQuad(float x, float y, float w, float h, float r, float g, float b, float a);
    void DrawHUDBorder(float x, float y, float w, float h, float thickness, float r, float g, float b, float a);
    void DrawHUDCard(float x, float y, float w, float h, float bgR, float bgG, float bgB, float bgA, float borderR, float borderG, float borderB, float borderA);
    void DrawHUDText(float x, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true);
    void DrawHUDTextCentered(float centerX, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true);
    void DrawHUDTextRight(float rightX, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true);
    void EndHUD2D();

    float GetCameraDistance() const { return m_curDistance; }
    void SetCameraDistance(float d) { m_curDistance = d; m_targetDistance = d; }

private:
    std::string m_title;
    int m_width;
    int m_height;
    bool m_isOpen = false;

    WindowInputEvents m_input;

    // Smooth Camera Interpolation State
    float m_curDistance = 5.5f;
    float m_targetDistance = 5.5f;
    float m_curPitch = 25.0f;
    float m_targetPitch = 25.0f;
    float m_curYaw = -20.0f;
    float m_targetYaw = -20.0f;

#ifdef _WIN32
    void* m_hwnd = nullptr;
    void* m_hdc = nullptr;
    void* m_hglrc = nullptr;
#endif
};

} // namespace OmniEngine
