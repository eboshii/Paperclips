#pragma once
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>
#include <cstdint>
#include <cstring>
#include <cstdio>
#include <iostream>
#include <zlib.h>

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
/// High-Performance Pure C++ Software Rasterizer and Offscreen Renderer.
/// Provides pixel-perfect 3D and 2D HUD rendering with PNG capture.
/// </summary>
class OmniSoftwareRasterizer {
public:
    int width = 1280;
    int height = 720;
    std::vector<uint32_t> pixels;
    std::vector<float> depthBuffer;

    OmniSoftwareRasterizer(int w = 1280, int h = 720) : width(w), height(h) {
        pixels.resize(static_cast<size_t>(width * height), 0xFF0E1117);
        depthBuffer.resize(static_cast<size_t>(width * height), 1e9f);
    }

    void Clear(float r = 0.055f, float g = 0.065f, float b = 0.09f, float a = 1.0f) {
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
        DrawHUDBorder(x, y, w, h, 1.0f, borderR, borderG, borderB, borderA);
    }

    void DrawHUDText(float x, float y, const std::string& text, float scale = 1.0f, float r = 1.0f, float g = 1.0f, float b = 1.0f, float a = 1.0f, bool dropShadow = true) {
        if (dropShadow) {
            int iscale = (scale >= 2.5f) ? 3 : ((scale >= 1.5f) ? 2 : 1);
            RenderGlyphString(x + static_cast<float>(iscale), y + static_cast<float>(iscale), text, iscale, 0.0f, 0.0f, 0.0f, a * 0.85f);
        }
        int iscale = (scale >= 2.5f) ? 3 : ((scale >= 1.5f) ? 2 : 1);
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

    // 3D Scene Viewport Renderer (Centered in X: 340..895, Y: 58..660)
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

        Vec3f lightDir = Vec3f(0.40f, 0.85f, 0.50f).normalized();
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
                float intensity = 0.40f + 0.60f * nDotL;

                // View Space (Rotate Yaw, Rotate Pitch, Translate (0, -0.5, -camDist))
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

                rv[i].r = std::clamp(v.r * intensity, 0.0f, 1.0f);
                rv[i].g = std::clamp(v.g * intensity, 0.0f, 1.0f);
                rv[i].b = std::clamp(v.b * intensity, 0.0f, 1.0f);
                rv[i].a = v.a;
            }

            if (behind) continue;
            // Clip to center viewport
            RasterizeTriangle(rv[0], rv[1], rv[2], 340, 58, 895, 660);
        }
    }

    // Dedicated 3D Hero Paperclip Renderer (Rendered inside Left Pedestal: X: 36..320, Y: 122..406)
    void DrawHeroPaperclip3D(const std::vector<RenderVertex3D>& mesh, float rotDeg, float scale) {
        if (mesh.empty()) return;

        float radRot = rotDeg * 3.14159265f / 180.0f;
        float cosR = std::cos(radRot);
        float sinR = std::sin(radRot);

        float centerX = 178.0f;
        float centerY = 262.0f;
        float zoom = 95.0f * scale; // Fits 2.3 height mesh perfectly in 284x284 box

        Vec3f lightDir = Vec3f(0.5f, 0.8f, 0.7f).normalized();
        Vec3f specularDir = Vec3f(0.2f, 0.4f, 0.9f).normalized();

        // Clear pedestal depth
        for (int y = 122; y <= 404; ++y) {
            for (int x = 38; x <= 318; ++x) {
                depthBuffer[y * width + x] = 1e9f;
            }
        }

        size_t triCount = mesh.size() / 3;
        for (size_t t = 0; t < triCount; ++t) {
            RasterVertex rv[3];

            for (int i = 0; i < 3; ++i) {
                const auto& v = mesh[t * 3 + i];

                // 3D rotation with isometric tilt
                float rx = v.x * cosR + v.z * sinR;
                float ry = v.y;
                float rz = -v.x * sinR + v.z * cosR;

                // Subtle 3D tilt
                float tx = rx;
                float ty = ry * 0.92f - rz * 0.38f;
                float tz = ry * 0.38f + rz * 0.92f;

                // Lighting with metallic sheen
                float nx = v.nx * cosR + v.nz * sinR;
                float ny = v.ny;
                float nz = -v.nx * sinR + v.nz * cosR;
                float nDotL = std::max(0.0f, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);
                float spec = std::pow(std::max(0.0f, nx * specularDir.x + ny * specularDir.y + nz * specularDir.z), 16.0f);
                float intensity = 0.45f + 0.55f * nDotL + 0.35f * spec;

                rv[i].sx = centerX + tx * zoom;
                rv[i].sy = centerY - ty * zoom;
                rv[i].sz = 5.0f - tz * 2.0f;
                rv[i].invW = 1.0f / rv[i].sz;

                // Metallic silver/gold color
                rv[i].r = std::clamp(0.92f * intensity, 0.0f, 1.0f);
                rv[i].g = std::clamp(0.94f * intensity, 0.0f, 1.0f);
                rv[i].b = std::clamp(0.98f * intensity, 0.0f, 1.0f);
                rv[i].a = 1.0f;
            }

            RasterizeTriangle(rv[0], rv[1], rv[2], 38, 122, 318, 404);
        }
    }

    bool SavePNG(const std::string& filepath) const {
        FILE* fp = fopen(filepath.c_str(), "wb");
        if (!fp) return false;

        const uint8_t sig[8] = { 137, 80, 78, 71, 13, 10, 26, 10 };
        fwrite(sig, 1, 8, fp);

        auto write_chunk = [&](const char* type, const uint8_t* data, uint32_t len) {
            uint32_t lenBE = ((len >> 24) & 0xFF) | ((len >> 8) & 0xFF00) | ((len << 8) & 0xFF0000) | ((len << 24) & 0xFF000000);
            fwrite(&lenBE, 1, 4, fp);
            fwrite(type, 1, 4, fp);
            if (len > 0 && data) fwrite(data, 1, len, fp);
            uLong crc = crc32(0L, Z_NULL, 0);
            crc = crc32(crc, (const Bytef*)type, 4);
            if (len > 0 && data) crc = crc32(crc, (const Bytef*)data, len);
            uint32_t crcBE = ((crc >> 24) & 0xFF) | ((crc >> 8) & 0xFF00) | ((crc << 8) & 0xFF0000) | ((crc << 24) & 0xFF000000);
            fwrite(&crcBE, 1, 4, fp);
        };

        uint8_t ihdr[13];
        uint32_t wBE = ((width >> 24) & 0xFF) | ((width >> 8) & 0xFF00) | ((width << 8) & 0xFF0000) | ((width << 24) & 0xFF000000);
        uint32_t hBE = ((height >> 24) & 0xFF) | ((height >> 8) & 0xFF00) | ((height << 8) & 0xFF0000) | ((height << 24) & 0xFF000000);
        memcpy(&ihdr[0], &wBE, 4);
        memcpy(&ihdr[4], &hBE, 4);
        ihdr[8] = 8;
        ihdr[9] = 6; // RGBA
        ihdr[10] = 0;
        ihdr[11] = 0;
        ihdr[12] = 0;
        write_chunk("IHDR", ihdr, 13);

        std::vector<uint8_t> rawScanlines((width * 4 + 1) * height);
        for (int y = 0; y < height; ++y) {
            rawScanlines[y * (width * 4 + 1)] = 0;
            for (int x = 0; x < width; ++x) {
                uint32_t c = pixels[y * width + x];
                rawScanlines[y * (width * 4 + 1) + 1 + x * 4 + 0] = (c >> 16) & 0xFF; // R
                rawScanlines[y * (width * 4 + 1) + 1 + x * 4 + 1] = (c >> 8) & 0xFF;  // G
                rawScanlines[y * (width * 4 + 1) + 1 + x * 4 + 2] = (c >> 0) & 0xFF;  // B
                rawScanlines[y * (width * 4 + 1) + 1 + x * 4 + 3] = (c >> 24) & 0xFF; // A
            }
        }

        uLongf destLen = compressBound(rawScanlines.size());
        std::vector<uint8_t> compressed(destLen);
        compress(compressed.data(), &destLen, rawScanlines.data(), rawScanlines.size());
        write_chunk("IDAT", compressed.data(), static_cast<uint32_t>(destLen));
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
