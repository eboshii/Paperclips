#pragma once
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>
#include <cstdint>
#include <cstring>
#include <cstdio>
#include <iostream>

#include "OmniMeshBuilder.h"
#include "OmniFont.h"
#include "OmniMath.h"

namespace OmniEngine {

struct Vec3f {
    float x = 0.0f, y = 0.0f, z = 0.0f;
    Vec3f() = default;
    Vec3f(float _x, float _y, float _z) : x(_x), y(_y), z(_z) {}

    Vec3f operator+(const Vec3f& o) const { return Vec3f(x + o.x, y + o.y, z + o.z); }
    Vec3f operator-(const Vec3f& o) const { return Vec3f(x - o.x, y - o.y, z - o.z); }
    Vec3f operator*(float s) const { return Vec3f(x * s, y * s, z * s); }
    float dot(const Vec3f& o) const { return x * o.x + y * o.y + z * o.z; }
    Vec3f normalized() const {
        float l = std::sqrt(x * x + y * y + z * z);
        return (l > 1e-6f) ? Vec3f(x / l, y / l, z / l) : Vec3f(0, 1, 0);
    }
};

struct RasterVertex {
    float sx = 0.0f, sy = 0.0f, sz = 0.0f, invW = 0.0f;
    float r = 1.0f, g = 1.0f, b = 1.0f, a = 1.0f;
};

/// <summary>
/// High-Performance Pure C++ Cel-Shaded Software Rasterizer & HUD Renderer (Zero External Dependencies).
/// Supports 3D cartoon toon-shading, inverted-hull ink outlines, 2D vector cartoon sprites, and PNG export.
/// </summary>
class OmniSoftwareRasterizer {
public:
    int width = 1280;
    int height = 720;
    std::vector<uint32_t> pixels;
    std::vector<float> depthBuffer;

    OmniSoftwareRasterizer(int w = 1280, int h = 720) : width(w), height(h) {
        pixels.resize(static_cast<size_t>(width * height), 0xFF141724);
        depthBuffer.resize(static_cast<size_t>(width * height), 1e9f);
    }

    void Clear(float r = 0.08f, float g = 0.09f, float b = 0.14f, float a = 1.0f) {
        uint8_t cr = static_cast<uint8_t>(std::clamp(r * 255.0f, 0.0f, 255.0f));
        uint8_t cg = static_cast<uint8_t>(std::clamp(g * 255.0f, 0.0f, 255.0f));
        uint8_t cb = static_cast<uint8_t>(std::clamp(b * 255.0f, 0.0f, 255.0f));
        uint8_t ca = static_cast<uint8_t>(std::clamp(a * 255.0f, 0.0f, 255.0f));
        uint32_t clearColor = (ca << 24) | (cr << 16) | (cg << 8) | cb;
        std::fill(pixels.begin(), pixels.end(), clearColor);
        std::fill(depthBuffer.begin(), depthBuffer.end(), 1e9f);
    }

    void DrawHUDQuad(float x, float y, float w, float h, float r, float g, float b, float a) {
        if (w <= 0.0f || h <= 0.0f || a <= 0.001f) return;
        int x0 = std::max(0, static_cast<int>(std::round(x)));
        int y0 = std::max(0, static_cast<int>(std::round(y)));
        int x1 = std::min(width, static_cast<int>(std::round(x + w)));
        int y1 = std::min(height, static_cast<int>(std::round(y + h)));
        if (x0 >= x1 || y0 >= y1) return;

        uint8_t srcR = static_cast<uint8_t>(std::clamp(r * 255.0f, 0.0f, 255.0f));
        uint8_t srcG = static_cast<uint8_t>(std::clamp(g * 255.0f, 0.0f, 255.0f));
        uint8_t srcB = static_cast<uint8_t>(std::clamp(b * 255.0f, 0.0f, 255.0f));
        float srcA = std::clamp(a, 0.0f, 1.0f);
        float invA = 1.0f - srcA;

        for (int py = y0; py < y1; ++py) {
            uint32_t* row = &pixels[py * width];
            for (int px = x0; px < x1; ++px) {
                uint32_t dst = row[px];
                uint8_t dstR = (dst >> 16) & 0xFF;
                uint8_t dstG = (dst >> 8) & 0xFF;
                uint8_t dstB = (dst >> 0) & 0xFF;

                uint8_t outR = static_cast<uint8_t>(srcR * srcA + dstR * invA);
                uint8_t outG = static_cast<uint8_t>(srcG * srcA + dstG * invA);
                uint8_t outB = static_cast<uint8_t>(srcB * srcA + dstB * invA);

                row[px] = (0xFF << 24) | (outR << 16) | (outG << 8) | outB;
            }
        }
    }

    void DrawHUDBorder(float x, float y, float w, float h, float thickness, float r, float g, float b, float a) {
        DrawHUDQuad(x, y, w, thickness, r, g, b, a);
        DrawHUDQuad(x, y + h - thickness, w, thickness, r, g, b, a);
        DrawHUDQuad(x, y + thickness, thickness, h - 2.0f * thickness, r, g, b, a);
        DrawHUDQuad(x + w - thickness, y + thickness, thickness, h - 2.0f * thickness, r, g, b, a);
    }

    void DrawHUDCard(float x, float y, float w, float h, float bgR, float bgG, float bgB, float bgA, float borderR, float borderG, float borderB, float borderA) {
        DrawHUDQuad(x, y, w, h, bgR, bgG, bgB, bgA);
        DrawHUDBorder(x, y, w, h, 1.5f, borderR, borderG, borderB, borderA);
    }

    // Chunky Cartoon 3D Arcade Button Card (With bottom physical press lip and rounded border highlights)
    void DrawHUDTactileCard(float x, float y, float w, float h, float bgR, float bgG, float bgB, float bgA,
                            float borderR, float borderG, float borderB, float borderA,
                            float lipHeight = 4.0f, bool isPressed = false) 
    {
        float curY = isPressed ? (y + lipHeight * 0.7f) : y;
        float curH = isPressed ? (h - lipHeight * 0.3f) : h;

        // Bottom 3D shadow lip
        if (!isPressed && lipHeight > 0.0f) {
            float lipR = bgR * 0.55f;
            float lipG = bgG * 0.55f;
            float lipB = bgB * 0.55f;
            DrawHUDQuad(x + 2.0f, y + h - lipHeight, w - 4.0f, lipHeight + 2.0f, lipR, lipG, lipB, bgA);
        }

        // Main button body
        DrawHUDQuad(x, curY, w, curH - (isPressed ? 0.0f : lipHeight), bgR, bgG, bgB, bgA);

        // Top glossy highlight stripe
        float hiR = std::min(1.0f, bgR * 1.35f + 0.15f);
        float hiG = std::min(1.0f, bgG * 1.35f + 0.15f);
        float hiB = std::min(1.0f, bgB * 1.35f + 0.15f);
        DrawHUDQuad(x + 2.0f, curY + 1.5f, w - 4.0f, 2.0f, hiR, hiG, hiB, bgA * 0.6f);

        // Comic-book dark outline
        DrawHUDBorder(x, curY, w, curH, 1.5f, borderR, borderG, borderB, borderA);
    }

    void DrawHUDText(float x, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true) {
        int iscale = (scale >= 2.5f) ? 3 : ((scale >= 1.5f) ? 2 : 1);
        if (dropShadow) {
            RenderGlyphString(x + static_cast<float>(iscale), y + static_cast<float>(iscale), text, iscale, 0.04f, 0.05f, 0.08f, a * 0.90f);
        }
        RenderGlyphString(x, y, text, iscale, r, g, b, a);
    }

    void DrawHUDTextCentered(float centerX, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true) {
        float w = OmniFont::GetTextWidth(text, scale);
        DrawHUDText(centerX - w * 0.5f, y, text, scale, r, g, b, a, dropShadow);
    }

    void DrawHUDTextRight(float rightX, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true) {
        float w = OmniFont::GetTextWidth(text, scale);
        DrawHUDText(rightX - w, y, text, scale, r, g, b, a, dropShadow);
    }

    // 2D Vector Cartoon Sprites
    void Draw2DPaperclipIcon(float cx, float cy, float scale = 1.0f, float r = 1.0f, float g = 0.85f, float b = 0.25f, float a = 1.0f) {
        float sw = 3.0f * scale;
        float h = 18.0f * scale;
        float w = 9.0f * scale;

        // Dark Outline
        DrawHUDQuad(cx - w * 0.5f - 1.0f, cy - h * 0.5f - 1.0f, w + 2.0f, h + 2.0f, 0.05f, 0.06f, 0.09f, a);

        // Body loops
        DrawHUDQuad(cx - w * 0.5f, cy - h * 0.5f, sw, h, r, g, b, a);
        DrawHUDQuad(cx - w * 0.5f, cy - h * 0.5f, w, sw, r, g, b, a);
        DrawHUDQuad(cx + w * 0.5f - sw, cy - h * 0.5f, sw, h, r, g, b, a);
        DrawHUDQuad(cx - w * 0.2f, cy + h * 0.5f - sw, w * 0.7f, sw, r, g, b, a);
        DrawHUDQuad(cx - w * 0.2f, cy - h * 0.1f, sw, h * 0.6f, r, g, b, a);
        DrawHUDQuad(cx - w * 0.2f, cy - h * 0.1f, w * 0.4f, sw, r, g, b, a);
        DrawHUDQuad(cx + w * 0.2f - sw, cy - h * 0.1f, sw, h * 0.4f, r, g, b, a);
    }

    void Draw2DCoinIcon(float cx, float cy, float radius = 7.0f) {
        float r = radius;
        // Outline
        DrawHUDQuad(cx - r - 1.0f, cy - r - 1.0f, (r * 2.0f) + 2.0f, (r * 2.0f) + 2.0f, 0.1f, 0.08f, 0.02f, 1.0f);
        // Golden disc
        DrawHUDQuad(cx - r, cy - r, r * 2.0f, r * 2.0f, 0.98f, 0.75f, 0.18f, 1.0f);
        // Inner highlight
        DrawHUDQuad(cx - r + 1.5f, cy - r + 1.5f, r * 2.0f - 3.0f, r * 2.0f - 3.0f, 1.0f, 0.88f, 0.35f, 1.0f);
        // Center $ sign
        DrawHUDTextCentered(cx, cy - 4.0f, "$", 1.0f, 0.65f, 0.45f, 0.05f, 1.0f, false);
    }

    void Draw2DSparkIcon(float cx, float cy, float size = 6.0f, float r = 1.0f, float g = 0.95f, float b = 0.4f) {
        // 4-point cartoon sparkle
        DrawHUDQuad(cx - 1.0f, cy - size, 2.0f, size * 2.0f, r, g, b, 1.0f);
        DrawHUDQuad(cx - size, cy - 1.0f, size * 2.0f, 2.0f, r, g, b, 1.0f);
        DrawHUDQuad(cx - 2.0f, cy - 2.0f, 4.0f, 4.0f, 1.0f, 1.0f, 1.0f, 1.0f);
    }

    // 3D Scene Viewport Renderer with 3-Band Stepped Cel-Shading & Cartoon Outlines
    void DrawMesh3D(const std::vector<RenderVertex3D>& mesh, float posX, float posY, float posZ, float rotDeg, float scale,
                    float camDist = 5.5f, float camPitch = 25.0f, float camYaw = -20.0f) 
    {
        if (mesh.empty()) return;

        float radRot = rotDeg * 3.14159265f / 180.0f;
        float cosR = std::cos(radRot);
        float sinR = std::sin(radRot);

        float radPitch = camPitch * 3.14159265f / 180.0f;
        float cosP = std::cos(radPitch);
        float sinP = std::sin(radPitch);

        float radYaw = camYaw * 3.14159265f / 180.0f;
        float cosY = std::cos(radYaw);
        float sinY = std::sin(radYaw);

        Vec3f lightDir = Vec3f(0.45f, 0.85f, 0.45f).normalized();
        Vec3f specDir = Vec3f(0.2f, 0.5f, 0.8f).normalized();
        float fovRad = 45.0f * 3.14159265f / 180.0f;
        float tanHalfFov = std::tan(fovRad * 0.5f);
        float aspect = static_cast<float>(width) / static_cast<float>(height);

        size_t triCount = mesh.size() / 3;
        for (size_t t = 0; t < triCount; ++t) {
            RasterVertex rv[3];
            bool behind = false;

            for (int i = 0; i < 3; ++i) {
                const auto& v = mesh[t * 3 + i];

                // Model Space
                float mx = (v.x * cosR + v.z * sinR) * scale + posX;
                float my = v.y * scale + posY;
                float mz = (-v.x * sinR + v.z * cosR) * scale + posZ;

                // Normal
                float nx = v.nx * cosR + v.nz * sinR;
                float ny = v.ny;
                float nz = -v.nx * sinR + v.nz * cosR;
                float nDotL = std::max(0.0f, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);

                // 3-Band Stepped Cel Shading (Cartoon Toon Lighting)
                float toonIntensity = 0.50f; // Shadow tone
                if (nDotL > 0.65f) toonIntensity = 1.05f; // Bright highlight
                else if (nDotL > 0.20f) toonIntensity = 0.82f; // Mid-tone

                // Specular glint
                float spec = std::max(0.0f, nx * specDir.x + ny * specDir.y + nz * specDir.z);
                if (spec > 0.90f) toonIntensity += 0.35f;

                // View Space
                float yx = mx * cosY - mz * sinY;
                float yy = my;
                float yz = mx * sinY + mz * cosY;

                float px = yx;
                float py = yy * cosP - yz * sinP;
                float pz = yy * sinP + yz * cosP;

                float vx = px;
                float vy = py - 0.5f;
                float vz = camDist - pz;

                if (vz < 0.1f) {
                    behind = true;
                    break;
                }

                float invZ = 1.0f / vz;
                float ndcX = vx / (vz * tanHalfFov * aspect);
                float ndcY = vy / (vz * tanHalfFov);

                rv[i].sx = (ndcX + 1.0f) * 0.5f * static_cast<float>(width);
                rv[i].sy = (1.0f - ndcY) * 0.5f * static_cast<float>(height);
                rv[i].sz = vz;
                rv[i].invW = invZ;

                rv[i].r = std::clamp(v.r * toonIntensity, 0.0f, 1.0f);
                rv[i].g = std::clamp(v.g * toonIntensity, 0.0f, 1.0f);
                rv[i].b = std::clamp(v.b * toonIntensity, 0.0f, 1.0f);
                rv[i].a = v.a;
            }

            if (behind) continue;
            RasterizeTriangle(rv[0], rv[1], rv[2], 340, 58, 895, 660);
        }
    }

    // 3D Fat Hero Paperclip Renderer with Thick Ink Outline & High-Contrast Cel Shading
    void DrawHeroPaperclip3D(const std::vector<RenderVertex3D>& mesh, float rotDeg, float scale) {
        if (mesh.empty()) return;

        float radRot = rotDeg * 3.14159265f / 180.0f;
        float cosR = std::cos(radRot);
        float sinR = std::sin(radRot);

        float centerX = 178.0f;
        float centerY = 262.0f;
        float zoom = 92.0f * scale;

        Vec3f lightDir = Vec3f(0.55f, 0.80f, 0.60f).normalized();
        Vec3f specularDir = Vec3f(0.20f, 0.40f, 0.90f).normalized();

        // Clear pedestal depth buffer
        for (int y = 120; y <= 404; ++y) {
            for (int x = 36; x <= 320; ++x) {
                depthBuffer[y * width + x] = 1e9f;
            }
        }

        size_t triCount = mesh.size() / 3;

        // 1. INK OUTLINE PASS (Inverted Hull / Black Expansion Pass)
        for (size_t t = 0; t < triCount; ++t) {
            RasterVertex rv[3];
            for (int i = 0; i < 3; ++i) {
                const auto& v = mesh[t * 3 + i];

                // Expand vertex along normal by outline thickness
                float ox = v.x + v.nx * 0.045f;
                float oy = v.y + v.ny * 0.045f;
                float oz = v.z + v.nz * 0.045f;

                float rx = ox * cosR + oz * sinR;
                float ry = oy;
                float rz = -ox * sinR + oz * cosR;

                float tx = rx;
                float ty = ry * 0.92f - rz * 0.38f;
                float tz = ry * 0.38f + rz * 0.92f;

                rv[i].sx = centerX + tx * zoom;
                rv[i].sy = centerY - ty * zoom;
                rv[i].sz = 5.2f - tz * 2.0f; // Slightly further behind for clean outline depth
                rv[i].invW = 1.0f / rv[i].sz;

                // Bold Comic Ink Outline Color (Deep ink navy/charcoal)
                rv[i].r = 0.06f;
                rv[i].g = 0.07f;
                rv[i].b = 0.10f;
                rv[i].a = 1.0f;
            }
            RasterizeTriangle(rv[0], rv[1], rv[2], 38, 122, 318, 404);
        }

        // 2. MAIN TOON-SHADED CEL PASS
        for (size_t t = 0; t < triCount; ++t) {
            RasterVertex rv[3];
            for (int i = 0; i < 3; ++i) {
                const auto& v = mesh[t * 3 + i];

                float rx = v.x * cosR + v.z * sinR;
                float ry = v.y;
                float rz = -v.x * sinR + v.z * cosR;

                float tx = rx;
                float ty = ry * 0.92f - rz * 0.38f;
                float tz = ry * 0.38f + rz * 0.92f;

                float nx = v.nx * cosR + v.nz * sinR;
                float ny = v.ny;
                float nz = -v.nx * sinR + v.nz * cosR;
                float nDotL = std::max(0.0f, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);

                // 3-Band Stepped Cel Shading with Shiny Glossy Highlights
                float toon = 0.55f;
                if (nDotL > 0.65f) toon = 1.10f;
                else if (nDotL > 0.25f) toon = 0.85f;

                float spec = std::max(0.0f, nx * specularDir.x + ny * specularDir.y + nz * specularDir.z);
                if (spec > 0.88f) toon += 0.40f; // Pure shiny glint

                rv[i].sx = centerX + tx * zoom;
                rv[i].sy = centerY - ty * zoom;
                rv[i].sz = 5.0f - tz * 2.0f;
                rv[i].invW = 1.0f / rv[i].sz;

                // Bright Candy Metallic Gold/Silver Tint
                rv[i].r = std::clamp(v.r * toon, 0.0f, 1.0f);
                rv[i].g = std::clamp(v.g * toon, 0.0f, 1.0f);
                rv[i].b = std::clamp(v.b * toon, 0.0f, 1.0f);
                rv[i].a = 1.0f;
            }
            RasterizeTriangle(rv[0], rv[1], rv[2], 38, 122, 318, 404);
        }
    }

    // 100% Pure Standard C++ PNG Writer (Zero External Dependencies, No zlib.h / -lz required)
    bool SavePNG(const std::string& filepath) const {
        FILE* fp = fopen(filepath.c_str(), "wb");
        if (!fp) return false;

        const uint8_t sig[8] = { 137, 80, 78, 71, 13, 10, 26, 10 };
        fwrite(sig, 1, 8, fp);

        auto crc32_fn = [](const uint8_t* data, size_t length, uint32_t initCRC = 0xFFFFFFFF) -> uint32_t {
            uint32_t crc = initCRC;
            for (size_t i = 0; i < length; ++i) {
                crc ^= data[i];
                for (int k = 0; k < 8; ++k) {
                    crc = (crc >> 1) ^ (0xEDB88320u & (-(crc & 1)));
                }
            }
            return crc;
        };

        auto adler32_fn = [](const uint8_t* data, size_t length) -> uint32_t {
            uint32_t a = 1, b = 0;
            for (size_t i = 0; i < length; ++i) {
                a = (a + data[i]) % 65521u;
                b = (b + a) % 65521u;
            }
            return (b << 16) | a;
        };

        auto write_chunk = [&](const char type[4], const uint8_t* data, size_t len) {
            uint8_t lenBytes[4] = {
                static_cast<uint8_t>((len >> 24) & 0xFF),
                static_cast<uint8_t>((len >> 16) & 0xFF),
                static_cast<uint8_t>((len >> 8) & 0xFF),
                static_cast<uint8_t>(len & 0xFF)
            };
            fwrite(lenBytes, 1, 4, fp);
            fwrite(type, 1, 4, fp);
            if (len > 0 && data) {
                fwrite(data, 1, len, fp);
            }
            uint32_t crc = crc32_fn(reinterpret_cast<const uint8_t*>(type), 4);
            if (len > 0 && data) {
                crc = crc32_fn(data, len, crc);
            }
            crc = ~crc;
            uint8_t crcBytes[4] = {
                static_cast<uint8_t>((crc >> 24) & 0xFF),
                static_cast<uint8_t>((crc >> 16) & 0xFF),
                static_cast<uint8_t>((crc >> 8) & 0xFF),
                static_cast<uint8_t>(crc & 0xFF)
            };
            fwrite(crcBytes, 1, 4, fp);
        };

        // 1. IHDR
        uint8_t ihdr[13];
        ihdr[0] = static_cast<uint8_t>((width >> 24) & 0xFF);
        ihdr[1] = static_cast<uint8_t>((width >> 16) & 0xFF);
        ihdr[2] = static_cast<uint8_t>((width >> 8) & 0xFF);
        ihdr[3] = static_cast<uint8_t>(width & 0xFF);

        ihdr[4] = static_cast<uint8_t>((height >> 24) & 0xFF);
        ihdr[5] = static_cast<uint8_t>((height >> 16) & 0xFF);
        ihdr[6] = static_cast<uint8_t>((height >> 8) & 0xFF);
        ihdr[7] = static_cast<uint8_t>(height & 0xFF);

        ihdr[8] = 8;  // bit depth
        ihdr[9] = 6;  // RGBA
        ihdr[10] = 0; // deflate
        ihdr[11] = 0; // standard filter
        ihdr[12] = 0; // no interlace
        write_chunk("IHDR", ihdr, 13);

        // 2. IDAT (Uncompressed Deflate Stream)
        size_t rawSize = static_cast<size_t>((width * 4 + 1) * height);
        std::vector<uint8_t> raw(rawSize);
        for (int y = 0; y < height; ++y) {
            size_t rowOffset = static_cast<size_t>(y * (width * 4 + 1));
            raw[rowOffset] = 0; // Filter: None
            for (int x = 0; x < width; ++x) {
                uint32_t c = pixels[y * width + x];
                raw[rowOffset + 1 + x * 4 + 0] = static_cast<uint8_t>((c >> 16) & 0xFF); // R
                raw[rowOffset + 1 + x * 4 + 1] = static_cast<uint8_t>((c >> 8) & 0xFF);  // G
                raw[rowOffset + 1 + x * 4 + 2] = static_cast<uint8_t>(c & 0xFF);         // B
                raw[rowOffset + 1 + x * 4 + 3] = static_cast<uint8_t>((c >> 24) & 0xFF); // A
            }
        }

        std::vector<uint8_t> idat;
        idat.push_back(0x78); // Zlib header
        idat.push_back(0x01);

        size_t offset = 0;
        while (offset < rawSize) {
            size_t blockSize = std::min(static_cast<size_t>(65535), rawSize - offset);
            bool isFinal = (offset + blockSize >= rawSize);
            idat.push_back(isFinal ? 0x01 : 0x00);

            uint16_t len = static_cast<uint16_t>(blockSize);
            uint16_t nlen = static_cast<uint16_t>(~len);
            idat.push_back(static_cast<uint8_t>(len & 0xFF));
            idat.push_back(static_cast<uint8_t>((len >> 8) & 0xFF));
            idat.push_back(static_cast<uint8_t>(nlen & 0xFF));
            idat.push_back(static_cast<uint8_t>((nlen >> 8) & 0xFF));

            idat.insert(idat.end(), raw.begin() + offset, raw.begin() + offset + blockSize);
            offset += blockSize;
        }

        uint32_t adler = adler32_fn(raw.data(), raw.size());
        idat.push_back(static_cast<uint8_t>((adler >> 24) & 0xFF));
        idat.push_back(static_cast<uint8_t>((adler >> 16) & 0xFF));
        idat.push_back(static_cast<uint8_t>((adler >> 8) & 0xFF));
        idat.push_back(static_cast<uint8_t>(adler & 0xFF));

        write_chunk("IDAT", idat.data(), idat.size());

        // 3. IEND
        write_chunk("IEND", nullptr, 0);

        fclose(fp);
        return true;
    }

private:
    void RenderGlyphString(float startX, float startY, const std::string& text, int iscale, float r, float g, float b, float a) {
        if (a <= 0.001f) return;
        int curX = static_cast<int>(std::round(startX));
        int curY = static_cast<int>(std::round(startY));
        int charWidth = 8 * iscale;
        int charHeight = 8 * iscale;
        int charAdvance = 9 * iscale;

        uint8_t srcR = static_cast<uint8_t>(std::clamp(r * 255.0f, 0.0f, 255.0f));
        uint8_t srcG = static_cast<uint8_t>(std::clamp(g * 255.0f, 0.0f, 255.0f));
        uint8_t srcB = static_cast<uint8_t>(std::clamp(b * 255.0f, 0.0f, 255.0f));
        float srcA = std::clamp(a, 0.0f, 1.0f);
        float invA = 1.0f - srcA;

        for (char c : text) {
            if (c == '\n') {
                curX = static_cast<int>(std::round(startX));
                curY += charHeight + 4 * iscale;
                continue;
            }
            if (c < 32 || c > 126) c = '?';

            const uint8_t* glyph = OmniFont::GetGlyphBitmap(c);
            for (int row = 0; row < 8; ++row) {
                uint8_t rowBits = glyph[row];
                for (int col = 0; col < 8; ++col) {
                    if (rowBits & (1 << (7 - col))) {
                        int px0 = curX + col * iscale;
                        int py0 = curY + row * iscale;
                        for (int dy = 0; dy < iscale; ++dy) {
                            int py = py0 + dy;
                            if (py < 0 || py >= height) continue;
                            uint32_t* rowPtr = &pixels[py * width];
                            for (int dx = 0; dx < iscale; ++dx) {
                                int px = px0 + dx;
                                if (px < 0 || px >= width) continue;

                                uint32_t dst = rowPtr[px];
                                uint8_t dstR = (dst >> 16) & 0xFF;
                                uint8_t dstG = (dst >> 8) & 0xFF;
                                uint8_t dstB = (dst >> 0) & 0xFF;

                                uint8_t outR = static_cast<uint8_t>(srcR * srcA + dstR * invA);
                                uint8_t outG = static_cast<uint8_t>(srcG * srcA + dstG * invA);
                                uint8_t outB = static_cast<uint8_t>(srcB * srcA + dstB * invA);

                                rowPtr[px] = (0xFF << 24) | (outR << 16) | (outG << 8) | outB;
                            }
                        }
                    }
                }
            }
            curX += charAdvance;
        }
    }

    void RasterizeTriangle(const RasterVertex& v0, const RasterVertex& v1, const RasterVertex& v2,
                           int clipMinX = 0, int clipMinY = 0, int clipMaxX = 1280, int clipMaxY = 720) 
    {
        float minX = std::min({ v0.sx, v1.sx, v2.sx });
        float maxX = std::max({ v0.sx, v1.sx, v2.sx });
        float minY = std::min({ v0.sy, v1.sy, v2.sy });
        float maxY = std::max({ v0.sy, v1.sy, v2.sy });

        int x0 = std::max(clipMinX, static_cast<int>(std::floor(minX)));
        int y0 = std::max(clipMinY, static_cast<int>(std::floor(minY)));
        int x1 = std::min(clipMaxX, static_cast<int>(std::ceil(maxX)));
        int y1 = std::min(clipMaxY, static_cast<int>(std::ceil(maxY)));
        if (x0 > x1 || y0 > y1) return;

        float area = (v1.sx - v0.sx) * (v2.sy - v0.sy) - (v1.sy - v0.sy) * (v2.sx - v0.sx);
        if (std::abs(area) < 1e-6f) return;
        float invArea = 1.0f / area;

        for (int y = y0; y <= y1; ++y) {
            float py = static_cast<float>(y) + 0.5f;
            for (int x = x0; x <= x1; ++x) {
                float px = static_cast<float>(x) + 0.5f;

                float w0 = ((v1.sx - px) * (v2.sy - py) - (v1.sy - py) * (v2.sx - px)) * invArea;
                float w1 = ((v2.sx - px) * (v0.sy - py) - (v2.sy - py) * (v0.sx - px)) * invArea;
                float w2 = 1.0f - w0 - w1;

                if (w0 >= 0.0f && w1 >= 0.0f && w2 >= 0.0f) {
                    float z = w0 * v0.sz + w1 * v1.sz + w2 * v2.sz;
                    size_t idx = static_cast<size_t>(y * width + x);

                    if (z < depthBuffer[idx]) {
                        if (v0.a >= 0.99f && v1.a >= 0.99f && v2.a >= 0.99f) {
                            depthBuffer[idx] = z;
                        }
                        float r = w0 * v0.r + w1 * v1.r + w2 * v2.r;
                        float g = w0 * v0.g + w1 * v1.g + w2 * v2.g;
                        float b = w0 * v0.b + w1 * v1.b + w2 * v2.b;
                        float a = w0 * v0.a + w1 * v1.a + w2 * v2.a;

                        uint8_t srcR = static_cast<uint8_t>(std::clamp(r * 255.0f, 0.0f, 255.0f));
                        uint8_t srcG = static_cast<uint8_t>(std::clamp(g * 255.0f, 0.0f, 255.0f));
                        uint8_t srcB = static_cast<uint8_t>(std::clamp(b * 255.0f, 0.0f, 255.0f));
                        float srcA = std::clamp(a, 0.0f, 1.0f);
                        float invA = 1.0f - srcA;

                        uint32_t dst = pixels[idx];
                        uint8_t dstR = (dst >> 16) & 0xFF;
                        uint8_t dstG = (dst >> 8) & 0xFF;
                        uint8_t dstB = (dst >> 0) & 0xFF;

                        uint8_t outR = static_cast<uint8_t>(srcR * srcA + dstR * invA);
                        uint8_t outG = static_cast<uint8_t>(srcG * srcA + dstG * invA);
                        uint8_t outB = static_cast<uint8_t>(srcB * srcA + dstB * invA);

                        pixels[idx] = (0xFF << 24) | (outR << 16) | (outG << 8) | outB;
                    }
                }
            }
        }
    }
};

} // namespace OmniEngine
