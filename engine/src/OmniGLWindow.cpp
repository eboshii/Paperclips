#include "../include/OmniGLWindow.h"
#include "../include/OmniFont.h"
#include <iostream>
#include <cmath>
#include <algorithm>

#ifdef _WIN32
#include <windows.h>
#include <GL/gl.h>

static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    OmniEngine::OmniGLWindow* pWin = (OmniEngine::OmniGLWindow*)GetWindowLongPtr(hwnd, GWLP_USERDATA);

    switch (msg) {
        case WM_CLOSE:
            if (pWin) pWin->Close();
            DestroyWindow(hwnd);
            return 0;
        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;
        case WM_MOUSEWHEEL:
            // Handled via message pump
            break;
    }
    return DefWindowProcA(hwnd, msg, wParam, lParam);
}
#endif

namespace OmniEngine {

OmniGLWindow::OmniGLWindow(const std::string& title, int width, int height)
    : m_title(title), m_width(width), m_height(height) {}

OmniGLWindow::~OmniGLWindow() {
    Close();
}

bool OmniGLWindow::Initialize() {
#ifdef _WIN32
    HINSTANCE hInstance = GetModuleHandle(NULL);

    WNDCLASSEXA wc = {};
    wc.cbSize = sizeof(WNDCLASSEXA);
    wc.style = CS_OWNDC | CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = "ObjectivePaperclipsGLWindowClass";
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);

    RegisterClassExA(&wc);

    HWND hwnd = CreateWindowExA(
        0, "ObjectivePaperclipsGLWindowClass",
        m_title.c_str(),
        WS_OVERLAPPEDWINDOW | WS_VISIBLE,
        CW_USEDEFAULT, CW_USEDEFAULT,
        m_width, m_height,
        NULL, NULL, hInstance, NULL
    );

    if (!hwnd) {
        std::cerr << "[ERROR] Failed to create Win32 OpenGL window.\n";
        return false;
    }

    m_hwnd = hwnd;
    SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR)this);

    HDC hdc = GetDC(hwnd);
    m_hdc = hdc;

    PIXELFORMATDESCRIPTOR pfd = {};
    pfd.nSize = sizeof(PIXELFORMATDESCRIPTOR);
    pfd.nVersion = 1;
    pfd.dwFlags = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL | PFD_DOUBLEBUFFER;
    pfd.iPixelType = PFD_TYPE_RGBA;
    pfd.cColorBits = 32;
    pfd.cDepthBits = 24;

    int pixelFormat = ChoosePixelFormat(hdc, &pfd);
    SetPixelFormat(hdc, pixelFormat, &pfd);

    HGLRC hglrc = wglCreateContext(hdc);
    wglMakeCurrent(hdc, hglrc);
    m_hglrc = hglrc;

    // Enable Hardware OpenGL Features
    glViewport(0, 0, m_width, m_height);
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_COLOR_MATERIAL);
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);

    // Warm factory lighting
    float lightPos[] = { 4.0f, 10.0f, 6.0f, 1.0f };
    float lightColor[] = { 1.0f, 0.95f, 0.85f, 1.0f };
    float ambientLight[] = { 0.25f, 0.28f, 0.35f, 1.0f };
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, lightColor);
    glLightfv(GL_LIGHT0, GL_AMBIENT, ambientLight);

    m_isOpen = true;
    std::cout << "[SUCCESS] 3D OpenGL Window Initialized (" << m_width << "x" << m_height << ")\n";
    return true;
#else
    m_isOpen = true;
    return true;
#endif
}

bool OmniGLWindow::ProcessMessages() {
#ifdef _WIN32
    MSG msg;
    m_input.mouseLeftClicked = false;
    m_input.lastKeyPressed = 0;
    m_input.mouseScrollDelta = 0.0f;

    while (PeekMessageA(&msg, NULL, 0, 0, PM_REMOVE)) {
        if (msg.message == WM_QUIT) {
            m_isOpen = false;
            return false;
        }

        if (msg.message == WM_LBUTTONDOWN) {
            m_input.mouseLeftClicked = true;
            m_input.mouseX = (float)LOWORD(msg.lParam);
            m_input.mouseY = (float)HIWORD(msg.lParam);
        } else if (msg.message == WM_RBUTTONDOWN) {
            m_input.mouseRightDown = true;
        } else if (msg.message == WM_RBUTTONUP) {
            m_input.mouseRightDown = false;
        } else if (msg.message == WM_MOUSEMOVE) {
            float newX = (float)LOWORD(msg.lParam);
            float newY = (float)HIWORD(msg.lParam);
            m_input.mouseDeltaX = newX - m_input.mouseX;
            m_input.mouseDeltaY = newY - m_input.mouseY;
            m_input.mouseX = newX;
            m_input.mouseY = newY;
        } else if (msg.message == WM_MOUSEWHEEL) {
            short delta = GET_WHEEL_DELTA_WPARAM(msg.wParam);
            m_input.mouseScrollDelta = (float)delta / 120.0f;
        } else if (msg.message == WM_CHAR) {
            m_input.lastKeyPressed = (char)msg.wParam;
        }

        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }
#endif
    return m_isOpen;
}

WindowInputEvents OmniGLWindow::PollInput() {
    WindowInputEvents ev = m_input;
    m_input.mouseDeltaX = 0.0f;
    m_input.mouseDeltaY = 0.0f;
    return ev;
}

void OmniGLWindow::Swap() {
#ifdef _WIN32
    if (m_hdc) {
        SwapBuffers((HDC)m_hdc);
    }
#endif
}

void OmniGLWindow::Close() {
    m_isOpen = false;
#ifdef _WIN32
    if (m_hglrc) {
        wglMakeCurrent(NULL, NULL);
        wglDeleteContext((HGLRC)m_hglrc);
        m_hglrc = nullptr;
    }
    if (m_hdc && m_hwnd) {
        ReleaseDC((HWND)m_hwnd, (HDC)m_hdc);
        m_hdc = nullptr;
    }
#endif
}

void OmniGLWindow::BeginFrame(float r, float g, float b) {
#ifdef _WIN32
    glClearColor(r, g, b, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
#else
    (void)r; (void)g; (void)b;
#endif
}

void OmniGLWindow::UpdateCameraInterpolation(float targetDistance, float targetPitchDeg, float targetYawDeg, float dt) {
    float lerpSpeed = 8.0f * dt;
    m_curDistance += (targetDistance - m_curDistance) * std::min(1.0f, lerpSpeed);
    m_curPitch += (targetPitchDeg - m_curPitch) * std::min(1.0f, lerpSpeed);
    m_curYaw += (targetYawDeg - m_curYaw) * std::min(1.0f, lerpSpeed);
}

void OmniGLWindow::ApplyCamera3D() {
#ifdef _WIN32
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    float aspect = (float)m_width / (float)m_height;
    float fov = 45.0f * 3.14159265f / 180.0f;
    float nearZ = 0.1f;
    float farZ = 100.0f;
    float top = nearZ * std::tan(fov * 0.5f);
    float bottom = -top;
    float left = bottom * aspect;
    float right = top * aspect;
    glFrustum(left, right, bottom, top, nearZ, farZ);

    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();

    glTranslatef(0.0f, -0.5f, -m_curDistance);
    glRotatef(m_curPitch, 1.0f, 0.0f, 0.0f);
    glRotatef(m_curYaw, 0.0f, 1.0f, 0.0f);
#endif
}

void OmniGLWindow::DrawMesh3D(const std::vector<RenderVertex3D>& mesh, float posX, float posY, float posZ, float rotDeg, float scale) {
#ifdef _WIN32
    glPushMatrix();
    glTranslatef(posX, posY, posZ);
    glRotatef(rotDeg, 0.0f, 1.0f, 0.0f);
    glScalef(scale, scale, scale);

    glBegin(GL_TRIANGLES);
    for (const auto& v : mesh) {
        glNormal3f(v.nx, v.ny, v.nz);
        glColor4f(v.r, v.g, v.b, v.a);
        glVertex3f(v.x, v.y, v.z);
    }
    glEnd();

    glPopMatrix();
#else
    (void)mesh; (void)posX; (void)posY; (void)posZ; (void)rotDeg; (void)scale;
#endif
}

void OmniGLWindow::DrawPaperclipMound(float pileClipsCount) {
    if (pileClipsCount <= 0.0f) return;

    float baseRadius = 0.5f + std::min(4.0f, std::log10(pileClipsCount + 1.0f) * 0.6f);
    float baseHeight = 0.2f + std::min(2.5f, std::log10(pileClipsCount + 1.0f) * 0.4f);

    auto moundMesh = OmniMeshBuilder::BuildPaperclipMoundMesh(baseRadius, baseHeight);
    DrawMesh3D(moundMesh, 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
}

void OmniGLWindow::BeginHUD2D() {
#ifdef _WIN32
    glMatrixMode(GL_PROJECTION);
    glPushMatrix();
    glLoadIdentity();
    glOrtho(0, m_width, m_height, 0, -1, 1);

    glMatrixMode(GL_MODELVIEW);
    glPushMatrix();
    glLoadIdentity();

    glDisable(GL_DEPTH_TEST);
    glDisable(GL_LIGHTING);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
#endif
}

void OmniGLWindow::DrawHUDQuad(float x, float y, float w, float h, float r, float g, float b, float a) {
#ifdef _WIN32
    glColor4f(r, g, b, a);
    glBegin(GL_QUADS);
    glVertex2f(x, y);
    glVertex2f(x + w, y);
    glVertex2f(x + w, y + h);
    glVertex2f(x, y + h);
    glEnd();
#else
    (void)x; (void)y; (void)w; (void)h; (void)r; (void)g; (void)b; (void)a;
#endif
}

void OmniGLWindow::DrawHUDText(float x, float y, const std::string& text, float scale, float r, float g, float b, float a) {
#ifdef _WIN32
    OmniFont::DrawString2D(x, y, text, scale, r, g, b, a, true);
#else
    (void)x; (void)y; (void)text; (void)scale; (void)r; (void)g; (void)b; (void)a;
#endif
}

void OmniGLWindow::EndHUD2D() {
#ifdef _WIN32
    glDisable(GL_BLEND);
    glEnable(GL_LIGHTING);
    glEnable(GL_DEPTH_TEST);

    glMatrixMode(GL_PROJECTION);
    glPopMatrix();
    glMatrixMode(GL_MODELVIEW);
    glPopMatrix();
#endif
}

} // namespace OmniEngine
