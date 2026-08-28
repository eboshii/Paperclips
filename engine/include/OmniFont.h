#pragma once
#include <string>
#include <vector>
#include <cstdint>

#ifdef _WIN32
#include <windows.h>
#include <GL/gl.h>
#endif

namespace OmniEngine {

/// <summary>
/// High-Performance Embedded 8x8 Vector Font Renderer for Native OpenGL HUD.
/// Draws crisp, scalable alphanumeric text directly in the 3D OpenGL frame buffer without external assets.
/// </summary>
class OmniFont {
public:
    static void DrawString2D(float x, float y, const std::string& text, float scale = 1.0f, 
                             float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, 
                             bool dropShadow = true) 
    {
#ifdef _WIN32
        if (dropShadow) {
            // Draw dark drop shadow
            RenderGlyphString(x + 2.0f * scale, y + 2.0f * scale, text, scale, 0.0f, 0.0f, 0.0f, a * 0.7f);
        }
        RenderGlyphString(x, y, text, scale, r, g, b, a);
#else
        (void)x; (void)y; (void)text; (void)scale; (void)r; (void)g; (void)b; (void)a; (void)dropShadow;
#endif
    }

private:
#ifdef _WIN32
    static void RenderGlyphString(float startX, float startY, const std::string& text, float scale,
                                  float r, float g, float b, float a) 
    {
        glColor4f(r, g, b, a);
        glBegin(GL_QUADS);

        float curX = startX;
        float curY = startY;
        float charWidth = 8.0f * scale;
        float charHeight = 8.0f * scale;

        for (char c : text) {
            if (c == '\n') {
                curX = startX;
                curY += charHeight + 4.0f * scale;
                continue;
            }
            if (c < 32 || c > 126) c = '?';

            // Get 8x8 bitmap row data
            const uint8_t* glyph = GetGlyphBitmap(c);

            for (int row = 0; row < 8; ++row) {
                uint8_t rowBits = glyph[row];
                for (int col = 0; col < 8; ++col) {
                    if (rowBits & (1 << (7 - col))) {
                        float px = curX + col * scale;
                        float py = curY + row * scale;

                        glVertex2f(px, py);
                        glVertex2f(px + scale, py);
                        glVertex2f(px + scale, py + scale);
                        glVertex2f(px, py + scale);
                    }
                }
            }
            curX += charWidth + 1.0f * scale;
        }
        glEnd();
    }

    static const uint8_t* GetGlyphBitmap(char c);
#endif
};

} // namespace OmniEngine
