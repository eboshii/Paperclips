#pragma once
#include <string>
#include <functional>
#include <vector>
#include <cstdint>
#include "OmniMeshBuilder.h"
#include "OmniMath.h"

namespace OmniEngine {

struct WindowInputEvents {
    bool mouseLeftClicked = false;
    bool mouseRightDown = false;
    float mouseX = 0.0f;
    float mouseY = 0.0f;
    float mouseDeltaX = 0.0f;
    float mouseDeltaY = 0.0f;
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
    void SetCamera3D(float camDistance, float camPitchDeg, float camYawDeg);
    void DrawMesh3D(const std::vector<RenderVertex3D>& mesh, float posX, float posY, float posZ, float rotDeg, float scale = 1.0f);
    void DrawPaperclipMound(float pileClipsCount);
    
    // 2D Graphical HUD Overlay
    void BeginHUD2D();
    void DrawHUDQuad(float x, float y, float w, float h, float r, float g, float b, float a);
    void EndHUD2D();

private:
    std::string m_title;
    int m_width;
    int m_height;
    bool m_isOpen = false;

    WindowInputEvents m_input;

#ifdef _WIN32
    void* m_hwnd = nullptr;
    void* m_hdc = nullptr;
    void* m_hglrc = nullptr;
#endif
};

} // namespace OmniEngine
