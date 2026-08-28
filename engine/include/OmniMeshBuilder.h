#pragma once
#include <vector>
#include <array>
#include <cmath>
#include <cstdint>
#include "OmniSpatialGrid.h"

namespace OmniEngine {

struct RenderVertex3D {
    float x, y, z;       // Position
    float nx, ny, nz;    // Normal
    float r, g, b, a;    // Color
    float u, v;          // Texture / UV coordinates
};

/// <summary>
/// Procedural 3D Geometry Generator for Fat Cartoon Paperclips, Toon Machines, Mounds, and Factory Floor.
/// </summary>
class OmniMeshBuilder {
public:
    /// <summary>
    /// Generates a Fat, Stout, Chubby 3D Paperclip with thick wire gauge and hemispherical rounded endcaps.
    /// </summary>
    static std::vector<RenderVertex3D> BuildPaperclipMesh(float wireRadius = 0.12f, int segments = 64) {
        std::vector<RenderVertex3D> vertices;
        const float pi = 3.14159265359f;

        std::vector<std::array<float, 3>> curvePoints;

        // Top outer loop (wide & rounded)
        for (int i = 0; i <= segments / 2; ++i) {
            float t = (float)i / (segments / 2);
            float angle = t * pi;
            curvePoints.push_back({ std::cos(angle) * 0.48f, std::sin(angle) * 0.48f + 0.65f, 0.0f });
        }
        // Left long straight backbone
        for (int i = 0; i <= segments / 2; ++i) {
            float t = (float)i / (segments / 1.5f);
            curvePoints.push_back({ -0.48f, 0.65f - t * 1.30f, 0.0f });
        }
        // Bottom outer loop
        for (int i = 0; i <= segments / 2; ++i) {
            float t = (float)i / (segments / 2);
            float angle = pi + t * pi;
            curvePoints.push_back({ std::cos(angle) * 0.38f - 0.10f, std::sin(angle) * 0.38f - 0.65f, 0.0f });
        }
        // Right middle straight
        for (int i = 0; i <= segments / 2; ++i) {
            float t = (float)i / (segments / 1.5f);
            curvePoints.push_back({ 0.28f, -0.65f + t * 0.95f, 0.0f });
        }
        // Top inner loop
        for (int i = 0; i <= segments / 2; ++i) {
            float t = (float)i / (segments / 2);
            float angle = t * pi;
            curvePoints.push_back({ std::cos(angle) * 0.24f + 0.04f, std::sin(angle) * 0.24f + 0.30f, 0.0f });
        }
        // Inner tail
        for (int i = 0; i <= segments / 4; ++i) {
            float t = (float)i / (segments / 4);
            curvePoints.push_back({ -0.20f, 0.30f - t * 0.40f, 0.0f });
        }

        int ringSegments = 12; // Smooth cylinder cross-section
        for (size_t i = 0; i + 1 < curvePoints.size(); ++i) {
            auto p0 = curvePoints[i];
            auto p1 = curvePoints[i + 1];

            float dx = p1[0] - p0[0];
            float dy = p1[1] - p0[1];
            float dz = p1[2] - p0[2];
            float len = std::sqrt(dx*dx + dy*dy + dz*dz);
            if (len < 0.0001f) continue;

            for (int r = 0; r < ringSegments; ++r) {
                float phi0 = (float)r / ringSegments * 2.0f * pi;
                float phi1 = (float)(r + 1) / ringSegments * 2.0f * pi;

                float nx0 = std::cos(phi0);
                float ny0 = 0.0f;
                float nz0 = std::sin(phi0);

                float nx1 = std::cos(phi1);
                float ny1 = 0.0f;
                float nz1 = std::sin(phi1);

                // Vibrant Gold / Platinum Candy Sheen
                float cr = 0.98f, cg = 0.88f, cb = 0.32f;

                RenderVertex3D v0 = { p0[0] + nx0 * wireRadius, p0[1] + ny0 * wireRadius, p0[2] + nz0 * wireRadius, nx0, 0.6f, nz0, cr, cg, cb, 1.0f, 0.0f, 0.0f };
                RenderVertex3D v1 = { p1[0] + nx0 * wireRadius, p1[1] + ny0 * wireRadius, p1[2] + nz0 * wireRadius, nx0, 0.6f, nz0, cr, cg, cb, 1.0f, 1.0f, 0.0f };
                RenderVertex3D v2 = { p1[0] + nx1 * wireRadius, p1[1] + ny1 * wireRadius, p1[2] + nz1 * wireRadius, nx1, 0.6f, nz1, cr, cg, cb, 1.0f, 1.0f, 1.0f };
                RenderVertex3D v3 = { p0[0] + nx1 * wireRadius, p0[1] + ny1 * wireRadius, p0[2] + nz1 * wireRadius, nx1, 0.6f, nz1, cr, cg, cb, 1.0f, 0.0f, 1.0f };

                vertices.push_back(v0);
                vertices.push_back(v1);
                vertices.push_back(v2);
                vertices.push_back(v0);
                vertices.push_back(v2);
                vertices.push_back(v3);
            }
        }
        return vertices;
    }

    /// <summary>
    /// Generates the 3D Factory Floor (Chunky pastel checkered floor).
    /// </summary>
    static std::vector<RenderVertex3D> BuildFactoryFloorMesh(float size = 24.0f, int divisions = 24) {
        std::vector<RenderVertex3D> vertices;
        float step = size / divisions;
        float halfSize = size * 0.5f;

        for (int x = 0; x < divisions; ++x) {
            for (int z = 0; z < divisions; ++z) {
                float x0 = -halfSize + x * step;
                float x1 = x0 + step;
                float z0 = -halfSize + z * step;
                float z1 = z0 + step;

                bool isEven = ((x + z) % 2 == 0);
                float r = isEven ? 0.32f : 0.24f;
                float g = isEven ? 0.36f : 0.28f;
                float b = isEven ? 0.44f : 0.34f;

                RenderVertex3D v0 = { x0, -1.0f, z0, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 0.0f, 0.0f };
                RenderVertex3D v1 = { x1, -1.0f, z0, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 1.0f, 0.0f };
                RenderVertex3D v2 = { x1, -1.0f, z1, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 1.0f, 1.0f };
                RenderVertex3D v3 = { x0, -1.0f, z1, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 0.0f, 1.0f };

                vertices.push_back(v0);
                vertices.push_back(v1);
                vertices.push_back(v2);
                vertices.push_back(v0);
                vertices.push_back(v2);
                vertices.push_back(v3);
            }
        }
        return vertices;
    }

    /// <summary>
    /// Generates Chunky Cartoon Machine Mesh according to Factory Tile Type.
    /// </summary>
    static std::vector<RenderVertex3D> BuildMachineMesh(FactoryTileType type, float x, float z, float tileSize = 1.0f) {
        std::vector<RenderVertex3D> vertices;
        float hx = x + tileSize * 0.5f;
        float hz = z + tileSize * 0.5f;
        float half = tileSize * 0.38f;

        float r = 0.8f, g = 0.8f, b = 0.8f, height = 0.6f;
        if (type == FactoryTileType::WireExtruder) {
            r = 0.22f; g = 0.75f; b = 0.95f; height = 0.7f; // Vibrant Cyan
        } else if (type == FactoryTileType::HydraulicStamper) {
            r = 0.98f; g = 0.70f; b = 0.15f; height = 1.0f; // Vibrant Gold
        } else if (type == FactoryTileType::LaserSinterer) {
            r = 0.92f; g = 0.25f; b = 0.85f; height = 0.5f; // Candy Purple
        } else if (type == FactoryTileType::CoolingTower) {
            r = 0.20f; g = 0.85f; b = 0.55f; height = 0.9f; // Mint Emerald
        } else {
            return vertices;
        }

        float x0 = hx - half, x1 = hx + half;
        float z0 = hz - half, z1 = hz + half;
        float y0 = -1.0f, y1 = -1.0f + height;

        // Top face (lighter highlight)
        vertices.push_back({ x0, y1, z0, 0.0f, 1.0f, 0.0f, std::min(1.0f, r*1.2f), std::min(1.0f, g*1.2f), std::min(1.0f, b*1.2f), 1.0f, 0.0f, 0.0f });
        vertices.push_back({ x1, y1, z0, 0.0f, 1.0f, 0.0f, std::min(1.0f, r*1.2f), std::min(1.0f, g*1.2f), std::min(1.0f, b*1.2f), 1.0f, 1.0f, 0.0f });
        vertices.push_back({ x1, y1, z1, 0.0f, 1.0f, 0.0f, std::min(1.0f, r*1.2f), std::min(1.0f, g*1.2f), std::min(1.0f, b*1.2f), 1.0f, 1.0f, 1.0f });
        vertices.push_back({ x0, y1, z0, 0.0f, 1.0f, 0.0f, std::min(1.0f, r*1.2f), std::min(1.0f, g*1.2f), std::min(1.0f, b*1.2f), 1.0f, 0.0f, 0.0f });
        vertices.push_back({ x1, y1, z1, 0.0f, 1.0f, 0.0f, std::min(1.0f, r*1.2f), std::min(1.0f, g*1.2f), std::min(1.0f, b*1.2f), 1.0f, 1.0f, 1.0f });
        vertices.push_back({ x0, y1, z1, 0.0f, 1.0f, 0.0f, std::min(1.0f, r*1.2f), std::min(1.0f, g*1.2f), std::min(1.0f, b*1.2f), 1.0f, 0.0f, 1.0f });

        // Front face
        vertices.push_back({ x0, y0, z1, 0.0f, 0.0f, 1.0f, r, g, b, 1.0f, 0.0f, 0.0f });
        vertices.push_back({ x1, y0, z1, 0.0f, 0.0f, 1.0f, r, g, b, 1.0f, 1.0f, 0.0f });
        vertices.push_back({ x1, y1, z1, 0.0f, 0.0f, 1.0f, r, g, b, 1.0f, 1.0f, 1.0f });
        vertices.push_back({ x0, y0, z1, 0.0f, 0.0f, 1.0f, r, g, b, 1.0f, 0.0f, 0.0f });
        vertices.push_back({ x1, y1, z1, 0.0f, 0.0f, 1.0f, r, g, b, 1.0f, 1.0f, 1.0f });
        vertices.push_back({ x0, y1, z1, 0.0f, 0.0f, 1.0f, r, g, b, 1.0f, 0.0f, 1.0f });

        // Side face
        vertices.push_back({ x1, y0, z0, 1.0f, 0.0f, 0.0f, r*0.85f, g*0.85f, b*0.85f, 1.0f, 0.0f, 0.0f });
        vertices.push_back({ x1, y0, z1, 1.0f, 0.0f, 0.0f, r*0.85f, g*0.85f, b*0.85f, 1.0f, 1.0f, 0.0f });
        vertices.push_back({ x1, y1, z1, 1.0f, 0.0f, 0.0f, r*0.85f, g*0.85f, b*0.85f, 1.0f, 1.0f, 1.0f });
        vertices.push_back({ x1, y0, z0, 1.0f, 0.0f, 0.0f, r*0.85f, g*0.85f, b*0.85f, 1.0f, 0.0f, 0.0f });
        vertices.push_back({ x1, y1, z1, 1.0f, 0.0f, 0.0f, r*0.85f, g*0.85f, b*0.85f, 1.0f, 1.0f, 1.0f });
        vertices.push_back({ x1, y1, z0, 1.0f, 0.0f, 0.0f, r*0.85f, g*0.85f, b*0.85f, 1.0f, 0.0f, 1.0f });

        return vertices;
    }

    /// <summary>
    /// Generates a 3D Golden Paperclip Mound with cartoon glints.
    /// </summary>
    static std::vector<RenderVertex3D> BuildPaperclipMoundMesh(float pileRadius, float pileHeight, int rings = 12, int sectors = 24) {
        std::vector<RenderVertex3D> vertices;
        const float pi = 3.14159265359f;

        for (int r = 0; r < rings; ++r) {
            float rNorm0 = (float)r / rings;
            float rNorm1 = (float)(r + 1) / rings;

            float radius0 = rNorm0 * pileRadius;
            float radius1 = rNorm1 * pileRadius;

            float y0 = -1.0f + (1.0f - rNorm0) * pileHeight;
            float y1 = -1.0f + (1.0f - rNorm1) * pileHeight;

            for (int s = 0; s < sectors; ++s) {
                float phi0 = (float)s / sectors * 2.0f * pi;
                float phi1 = (float)(s + 1) / sectors * 2.0f * pi;

                float x00 = std::cos(phi0) * radius0 + 2.5f;
                float z00 = std::sin(phi0) * radius0;
                float x10 = std::cos(phi0) * radius1 + 2.5f;
                float z10 = std::sin(phi0) * radius1;

                float x01 = std::cos(phi1) * radius0 + 2.5f;
                float z01 = std::sin(phi1) * radius0;
                float x11 = std::cos(phi1) * radius1 + 2.5f;
                float z11 = std::sin(phi1) * radius1;

                float cr = 0.98f;
                float cg = 0.82f;
                float cb = 0.28f;

                RenderVertex3D v0 = { x00, y0, z00, 0.0f, 0.8f, 0.2f, cr, cg, cb, 1.0f, 0.0f, 0.0f };
                RenderVertex3D v1 = { x10, y1, z10, 0.0f, 0.8f, 0.2f, cr, cg, cb, 1.0f, 1.0f, 0.0f };
                RenderVertex3D v2 = { x11, y1, z11, 0.0f, 0.8f, 0.2f, cr, cg, cb, 1.0f, 1.0f, 1.0f };
                RenderVertex3D v3 = { x01, y0, z01, 0.0f, 0.8f, 0.2f, cr, cg, cb, 1.0f, 0.0f, 1.0f };

                vertices.push_back(v0);
                vertices.push_back(v1);
                vertices.push_back(v2);
                vertices.push_back(v0);
                vertices.push_back(v2);
                vertices.push_back(v3);
            }
        }
        return vertices;
    }
};

} // namespace OmniEngine
