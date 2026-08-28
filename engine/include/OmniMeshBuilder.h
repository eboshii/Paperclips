#pragma once
#include <vector>
#include <array>
#include <cmath>
#include <cstdint>
#include <algorithm>
#include "OmniSpatialGrid.h"

namespace OmniEngine {

struct RenderVertex3D {
    float x, y, z;       // Position
    float nx, ny, nz;    // Normal
    float r, g, b, a;    // Color
    float u, v;          // Texture / UV coordinates
};

/// <summary>
/// Procedural 3D Geometry Generator for Factory Room, Conveyor Belt Assembly, Paperclips, and Machines.
/// </summary>
class OmniMeshBuilder {
public:
    // Helper to append a colored 3D Box (6 faces / 12 triangles) with outward normals
    static void AppendBox(std::vector<RenderVertex3D>& out, float x0, float y0, float z0, float x1, float y1, float z1,
                          float r, float g, float b, float a = 1.0f) 
    {
        // Top (+Y)
        float tr = std::min(1.0f, r * 1.25f), tg = std::min(1.0f, g * 1.25f), tb = std::min(1.0f, b * 1.25f);
        out.push_back({ x0, y1, z0, 0.0f, 1.0f, 0.0f, tr, tg, tb, a, 0, 0 });
        out.push_back({ x1, y1, z0, 0.0f, 1.0f, 0.0f, tr, tg, tb, a, 1, 0 });
        out.push_back({ x1, y1, z1, 0.0f, 1.0f, 0.0f, tr, tg, tb, a, 1, 1 });
        out.push_back({ x0, y1, z0, 0.0f, 1.0f, 0.0f, tr, tg, tb, a, 0, 0 });
        out.push_back({ x1, y1, z1, 0.0f, 1.0f, 0.0f, tr, tg, tb, a, 1, 1 });
        out.push_back({ x0, y1, z1, 0.0f, 1.0f, 0.0f, tr, tg, tb, a, 0, 1 });

        // Bottom (-Y)
        float dr = r * 0.6f, dg = g * 0.6f, db = b * 0.6f;
        out.push_back({ x0, y0, z1, 0.0f, -1.0f, 0.0f, dr, dg, db, a, 0, 0 });
        out.push_back({ x1, y0, z1, 0.0f, -1.0f, 0.0f, dr, dg, db, a, 1, 0 });
        out.push_back({ x1, y0, z0, 0.0f, -1.0f, 0.0f, dr, dg, db, a, 1, 1 });
        out.push_back({ x0, y0, z1, 0.0f, -1.0f, 0.0f, dr, dg, db, a, 0, 0 });
        out.push_back({ x1, y0, z0, 0.0f, -1.0f, 0.0f, dr, dg, db, a, 1, 1 });
        out.push_back({ x0, y0, z0, 0.0f, -1.0f, 0.0f, dr, dg, db, a, 0, 1 });

        // Front (+Z)
        out.push_back({ x0, y0, z1, 0.0f, 0.0f, 1.0f, r, g, b, a, 0, 0 });
        out.push_back({ x1, y0, z1, 0.0f, 0.0f, 1.0f, r, g, b, a, 1, 0 });
        out.push_back({ x1, y1, z1, 0.0f, 0.0f, 1.0f, r, g, b, a, 1, 1 });
        out.push_back({ x0, y0, z1, 0.0f, 0.0f, 1.0f, r, g, b, a, 0, 0 });
        out.push_back({ x1, y1, z1, 0.0f, 0.0f, 1.0f, r, g, b, a, 1, 1 });
        out.push_back({ x0, y1, z1, 0.0f, 0.0f, 1.0f, r, g, b, a, 0, 1 });

        // Back (-Z)
        float br = r * 0.75f, bg2 = g * 0.75f, bb = b * 0.75f;
        out.push_back({ x1, y0, z0, 0.0f, 0.0f, -1.0f, br, bg2, bb, a, 0, 0 });
        out.push_back({ x0, y0, z0, 0.0f, 0.0f, -1.0f, br, bg2, bb, a, 1, 0 });
        out.push_back({ x0, y1, z0, 0.0f, 0.0f, -1.0f, br, bg2, bb, a, 1, 1 });
        out.push_back({ x1, y0, z0, 0.0f, 0.0f, -1.0f, br, bg2, bb, a, 0, 0 });
        out.push_back({ x0, y1, z0, 0.0f, 0.0f, -1.0f, br, bg2, bb, a, 1, 1 });
        out.push_back({ x1, y1, z0, 0.0f, 0.0f, -1.0f, br, bg2, bb, a, 0, 1 });

        // Right (+X)
        float rr = r * 0.9f, rg = g * 0.9f, rb = b * 0.9f;
        out.push_back({ x1, y0, z1, 1.0f, 0.0f, 0.0f, rr, rg, rb, a, 0, 0 });
        out.push_back({ x1, y0, z0, 1.0f, 0.0f, 0.0f, rr, rg, rb, a, 1, 0 });
        out.push_back({ x1, y1, z0, 1.0f, 0.0f, 0.0f, rr, rg, rb, a, 1, 1 });
        out.push_back({ x1, y0, z1, 1.0f, 0.0f, 0.0f, rr, rg, rb, a, 0, 0 });
        out.push_back({ x1, y1, z0, 1.0f, 0.0f, 0.0f, rr, rg, rb, a, 1, 1 });
        out.push_back({ x1, y1, z1, 1.0f, 0.0f, 0.0f, rr, rg, rb, a, 0, 1 });

        // Left (-X)
        float lr = r * 0.85f, lg = g * 0.85f, lb = b * 0.85f;
        out.push_back({ x0, y0, z0, -1.0f, 0.0f, 0.0f, lr, lg, lb, a, 0, 0 });
        out.push_back({ x0, y0, z1, -1.0f, 0.0f, 0.0f, lr, lg, lb, a, 1, 0 });
        out.push_back({ x0, y1, z1, -1.0f, 0.0f, 0.0f, lr, lg, lb, a, 1, 1 });
        out.push_back({ x0, y0, z0, -1.0f, 0.0f, 0.0f, lr, lg, lb, a, 0, 0 });
        out.push_back({ x0, y1, z1, -1.0f, 0.0f, 0.0f, lr, lg, lb, a, 1, 1 });
        out.push_back({ x0, y1, z0, -1.0f, 0.0f, 0.0f, lr, lg, lb, a, 0, 1 });
    }

    /// <summary>
    /// Generates a Fat, Stout, Chubby 3D Paperclip with thick wire gauge.
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

        int ringSegments = 12;
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
    /// Generates a simple flat Factory Floor Quad Mesh.
    /// </summary>
    static std::vector<RenderVertex3D> BuildFactoryFloorMesh(float floorSize = 24.0f, int divs = 24) {
        std::vector<RenderVertex3D> vertices;
        float step = floorSize / divs;
        float half = floorSize * 0.5f;

        for (int x = 0; x < divs; ++x) {
            for (int z = 0; z < divs; ++z) {
                float x0 = -half + x * step;
                float x1 = x0 + step;
                float z0 = -half + z * step;
                float z1 = z0 + step;

                bool isEven = ((x + z) % 2 == 0);
                float r = isEven ? 0.18f : 0.12f;
                float g = isEven ? 0.22f : 0.16f;
                float b = isEven ? 0.30f : 0.24f;

                RenderVertex3D v0 = { x0, -1.0f, z0, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 0.0f, 0.0f };
                RenderVertex3D v1 = { x1, -1.0f, z0, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 1.0f, 0.0f };
                RenderVertex3D v2 = { x1, -1.0f, z1, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 1.0f, 1.0f };
                RenderVertex3D v3 = { x0, -1.0f, z1, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 0.0f, 1.0f };

                vertices.push_back(v0); vertices.push_back(v1); vertices.push_back(v2);
                vertices.push_back(v0); vertices.push_back(v2); vertices.push_back(v3);
            }
        }
        return vertices;
    }

    /// <summary>
    /// Generates the Full Stylized Cartoon Factory Interior Room:
    /// Checkered floor, back factory wall with sunny arched window, overhead steel I-beams, ceiling lamps, and pipes.
    /// </summary>
    static std::vector<RenderVertex3D> BuildFactoryRoomMesh() {
        std::vector<RenderVertex3D> vertices;

        // 1. Factory Floor (Checkered warm concrete with yellow hazard runway)
        float floorSize = 12.0f;
        int divs = 16;
        float step = floorSize / divs;
        float half = floorSize * 0.5f;

        for (int x = 0; x < divs; ++x) {
            for (int z = 0; z < divs; ++z) {
                float x0 = -half + x * step;
                float x1 = x0 + step;
                float z0 = -half + z * step;
                float z1 = z0 + step;

                bool isConveyorTrack = (std::abs(x0 + step * 0.5f) < 1.1f);
                bool isEven = ((x + z) % 2 == 0);

                float r = isEven ? 0.30f : 0.23f;
                float g = isEven ? 0.34f : 0.27f;
                float b = isEven ? 0.42f : 0.33f;

                // Yellow safety guide runway under conveyor
                if (isConveyorTrack) {
                    r = isEven ? 0.45f : 0.38f;
                    g = isEven ? 0.42f : 0.35f;
                    b = isEven ? 0.22f : 0.18f;
                }

                RenderVertex3D v0 = { x0, -1.0f, z0, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 0.0f, 0.0f };
                RenderVertex3D v1 = { x1, -1.0f, z0, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 1.0f, 0.0f };
                RenderVertex3D v2 = { x1, -1.0f, z1, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 1.0f, 1.0f };
                RenderVertex3D v3 = { x0, -1.0f, z1, 0.0f, 1.0f, 0.0f, r, g, b, 1.0f, 0.0f, 1.0f };

                vertices.push_back(v0); vertices.push_back(v1); vertices.push_back(v2);
                vertices.push_back(v0); vertices.push_back(v2); vertices.push_back(v3);
            }
        }

        // 2. Back Factory Wall (Z = -4.5)
        AppendBox(vertices, -6.0f, -1.0f, -4.6f, 6.0f, 4.2f, -4.4f, 0.18f, 0.22f, 0.30f);

        // Wall Baseboard & Dado Rail
        AppendBox(vertices, -6.0f, -1.0f, -4.38f, 6.0f, -0.6f, -4.30f, 0.12f, 0.14f, 0.20f);
        AppendBox(vertices, -6.0f, 1.8f, -4.38f, 6.0f, 1.95f, -4.30f, 0.95f, 0.65f, 0.15f); // Orange hazard stripe

        // 3. Arched Factory Window (Center of Back Wall)
        AppendBox(vertices, -2.4f, 1.2f, -4.38f, 2.4f, 3.4f, -4.36f, 0.45f, 0.75f, 0.98f); // Bright blue sky pane
        // Window Frame & Muntins
        AppendBox(vertices, -2.5f, 1.1f, -4.35f, 2.5f, 1.25f, -4.30f, 0.15f, 0.18f, 0.24f);
        AppendBox(vertices, -2.5f, 3.35f, -4.35f, 2.5f, 3.5f, -4.30f, 0.15f, 0.18f, 0.24f);
        AppendBox(vertices, -2.5f, 1.1f, -4.35f, -2.35f, 3.5f, -4.30f, 0.15f, 0.18f, 0.24f);
        AppendBox(vertices, 2.35f, 1.1f, -4.35f, 2.5f, 3.5f, -4.30f, 0.15f, 0.18f, 0.24f);
        AppendBox(vertices, -0.1f, 1.1f, -4.35f, 0.1f, 3.5f, -4.30f, 0.15f, 0.18f, 0.24f);
        AppendBox(vertices, -2.4f, 2.2f, -4.35f, 2.4f, 2.35f, -4.30f, 0.15f, 0.18f, 0.24f);

        // 4. Overhead Industrial Yellow-Black Girders & Rafters (Y = 3.4)
        AppendBox(vertices, -6.0f, 3.4f, -2.0f, 6.0f, 3.7f, -1.7f, 0.95f, 0.75f, 0.15f); // Main Cross Girder
        AppendBox(vertices, -6.0f, 3.4f, 1.5f, 6.0f, 3.7f, 1.8f, 0.95f, 0.75f, 0.15f);

        // Industrial Utility Pipes (Cyan Coolant & Red Hydraulic)
        AppendBox(vertices, -6.0f, 2.8f, -4.25f, 6.0f, 2.95f, -4.10f, 0.20f, 0.75f, 0.85f); // Cyan Coolant Pipe
        AppendBox(vertices, -6.0f, 2.5f, -4.25f, 6.0f, 2.62f, -4.12f, 0.92f, 0.35f, 0.25f); // Red Pneumatic Pipe

        // 5. Hanging Ceiling Lamps with Warm Light Domes
        AppendBox(vertices, -1.8f, 2.8f, 0.0f, -1.75f, 3.4f, 0.05f, 0.10f, 0.10f, 0.12f); // Cord L
        AppendBox(vertices, -2.1f, 2.6f, -0.3f, -1.45f, 2.8f, 0.35f, 0.22f, 0.55f, 0.45f); // Dome L
        AppendBox(vertices, -2.0f, 2.5f, -0.2f, -1.55f, 2.6f, 0.25f, 1.00f, 0.92f, 0.45f); // Warm Bulb L

        AppendBox(vertices, 1.75f, 2.8f, 0.0f, 1.8f, 3.4f, 0.05f, 0.10f, 0.10f, 0.12f); // Cord R
        AppendBox(vertices, 1.45f, 2.6f, -0.3f, 2.1f, 2.8f, 0.35f, 0.22f, 0.55f, 0.45f); // Dome R
        AppendBox(vertices, 1.55f, 2.5f, -0.2f, 2.0f, 2.6f, 0.25f, 1.00f, 0.92f, 0.45f); // Warm Bulb R

        // 6. Left Workshop Scenery: Raw Wire Spool Pallet (X: -3.8..-2.4, Z: -1.5..0.2)
        AppendBox(vertices, -3.8f, -1.0f, -1.5f, -2.2f, -0.85f, 0.2f, 0.65f, 0.45f, 0.25f); // Wooden Pallet
        // Two Big Wooden Wire Drums
        AppendBox(vertices, -3.6f, -0.85f, -1.3f, -2.4f, -0.1f, -0.1f, 0.85f, 0.55f, 0.30f); // Wire Drum 1
        AppendBox(vertices, -3.5f, -0.8f, -1.2f, -2.5f, -0.15f, -0.2f, 0.85f, 0.88f, 0.95f);  // Shiny Steel Coil 1

        // 7. Right Workshop Scenery: Supply Crates & Tool Bin (X: 2.2..3.8, Z: -1.2..0.8)
        AppendBox(vertices, 2.4f, -1.0f, -1.0f, 3.6f, -0.2f, 0.2f, 0.70f, 0.48f, 0.28f); // Wooden Box 1
        AppendBox(vertices, 2.6f, -0.2f, -0.8f, 3.4f, 0.4f, 0.0f, 0.78f, 0.54f, 0.32f);  // Wooden Box 2
        AppendBox(vertices, 2.8f, -1.0f, 0.5f, 3.6f, -0.3f, 1.3f, 0.25f, 0.35f, 0.55f);   // Blue Tool Bin

        return vertices;
    }

    /// <summary>
    /// Generates the 3D Conveyor Belt Assembly & Bending Machine:
    /// - Extruder housing with bouncing stamping head piston
    /// - Conveyor frame, legs, and moving textured belt deck
    /// - Collection hopper crate at the front
    /// </summary>
    static std::vector<RenderVertex3D> BuildConveyorAssemblyMesh(float animPhase = 0.0f, float beltScroll = 0.0f) {
        std::vector<RenderVertex3D> vertices;

        // ----------------------------------------------------
        // A. THE PAPERCLIP BENDING MACHINE (Back of line: Z = -3.2 to -1.2)
        // ----------------------------------------------------
        // Heavy Cast Steel Machine Base
        AppendBox(vertices, -1.2f, -1.0f, -3.2f, 1.2f, 0.7f, -1.3f, 0.18f, 0.65f, 0.88f); // Vibrant Teal Machine
        // Accent Panels & Hazard Striping
        AppendBox(vertices, -1.22f, 0.2f, -3.1f, 1.22f, 0.4f, -1.4f, 0.98f, 0.75f, 0.15f); // Yellow Warning Band
        AppendBox(vertices, -1.0f, 0.7f, -3.0f, 1.0f, 1.3f, -1.5f, 0.14f, 0.52f, 0.72f);  // Upper Housing

        // Stamping Press Piston (Animated squish & bounce!)
        float pistonBounce = std::sin(animPhase) * 0.18f;
        float pistonY = 1.3f + pistonBounce;
        AppendBox(vertices, -0.4f, 1.3f, -2.6f, 0.4f, pistonY + 0.4f, -1.8f, 0.85f, 0.88f, 0.95f); // Chrome Piston Shaft
        AppendBox(vertices, -0.6f, pistonY + 0.35f, -2.8f, 0.6f, pistonY + 0.65f, -1.6f, 0.98f, 0.75f, 0.15f); // Yellow Stamping Head

        // Glowing Machine Gauge / Status Light
        AppendBox(vertices, -0.7f, 0.0f, -1.28f, -0.3f, 0.4f, -1.25f, 0.15f, 0.20f, 0.28f); // Gauge Bezel
        AppendBox(vertices, -0.65f, 0.05f, -1.24f, -0.35f, 0.35f, -1.22f, 0.35f, 0.95f, 0.45f); // Green Power Glow
        AppendBox(vertices, 0.4f, 0.15f, -1.25f, 0.6f, 0.35f, -1.22f, 0.98f, 0.30f, 0.20f);   // Red Status Light

        // Ejection Chute (Angled slide directing paperclips onto conveyor)
        AppendBox(vertices, -0.45f, -0.35f, -1.4f, 0.45f, -0.05f, -0.95f, 0.82f, 0.85f, 0.90f); // Polished Steel Chute

        // ----------------------------------------------------
        // B. THE CONVEYOR BELT LINE (Z = -1.0 to 2.5)
        // ----------------------------------------------------
        // Steel Trestle Legs
        float legX[2] = { -0.52f, 0.52f };
        float legZ[3] = { -0.7f, 0.8f, 2.3f };
        for (int lx = 0; lx < 2; ++lx) {
            for (int lz = 0; lz < 3; ++lz) {
                AppendBox(vertices, legX[lx] - 0.06f, -1.0f, legZ[lz] - 0.06f,
                                    legX[lx] + 0.06f, -0.32f, legZ[lz] + 0.06f,
                                    0.18f, 0.22f, 0.28f);
            }
        }
        // Horizontal Rail Supports
        AppendBox(vertices, -0.58f, -0.55f, -0.9f, 0.58f, -0.45f, 2.45f, 0.22f, 0.28f, 0.36f);

        // Conveyor Bed (Dark Rubber with moving tread ribs)
        AppendBox(vertices, -0.48f, -0.32f, -1.0f, 0.48f, -0.26f, 2.5f, 0.15f, 0.16f, 0.20f); // Dark Rubber Bed

        // Animated Moving Tread Ribs
        int ribCount = 14;
        float ribSpan = 3.5f;
        float ribStep = ribSpan / ribCount;
        for (int i = 0; i < ribCount; ++i) {
            float rz = -1.0f + std::fmod(i * ribStep + beltScroll, ribSpan);
            if (rz >= -0.98f && rz <= 2.48f) {
                AppendBox(vertices, -0.46f, -0.25f, rz - 0.04f, 0.46f, -0.23f, rz + 0.04f, 0.25f, 0.28f, 0.35f);
            }
        }

        // Side Safety Rails (Yellow & Black Hazard Guide Guards)
        AppendBox(vertices, -0.56f, -0.28f, -1.0f, -0.48f, -0.15f, 2.5f, 0.95f, 0.75f, 0.15f); // Left Rail
        AppendBox(vertices, 0.48f, -0.28f, -1.0f, 0.56f, -0.15f, 2.5f, 0.95f, 0.75f, 0.15f);  // Right Rail

        // End Roller Cylinders
        AppendBox(vertices, -0.50f, -0.32f, 2.48f, 0.50f, -0.24f, 2.58f, 0.85f, 0.88f, 0.95f);

        // ----------------------------------------------------
        // C. THE GOLDEN COLLECTION BIN (End of Conveyor: Z = 2.5 to 3.8)
        // ----------------------------------------------------
        // Heavy Reinforced Steel Crate
        AppendBox(vertices, -0.9f, -1.0f, 2.5f, 0.9f, -0.2f, 3.8f, 0.22f, 0.28f, 0.38f);
        AppendBox(vertices, -0.92f, -0.3f, 2.48f, 0.92f, -0.15f, 3.82f, 0.95f, 0.75f, 0.15f); // Rim Collar

        // Overflowing Golden Paperclip Mound inside Bin
        AppendBox(vertices, -0.8f, -0.2f, 2.6f, 0.8f, 0.15f, 3.7f, 0.98f, 0.85f, 0.28f);
        AppendBox(vertices, -0.6f, 0.15f, 2.8f, 0.6f, 0.38f, 3.5f, 1.00f, 0.92f, 0.35f); // High heap top

        return vertices;
    }

    /// <summary>
    /// Generates Mini 3D Paperclips marching along the Conveyor Belt.
    /// </summary>
    static std::vector<RenderVertex3D> BuildTravelingPaperclipsMesh(const std::vector<float>& clipProgress) {
        std::vector<RenderVertex3D> vertices;
        auto singleClip = BuildPaperclipMesh(0.045f, 32);

        for (float prog : clipProgress) {
            if (prog < 0.0f || prog > 1.0f) continue;

            // Travel path: from chute (Z = -1.0) to bin edge (Z = 2.5)
            float clipZ = -1.0f + prog * 3.5f;
            float clipY = -0.22f + (prog > 0.92f ? (0.92f - prog) * 2.0f : 0.0f); // Tumbling off edge
            float clipX = std::sin(prog * 12.0f) * 0.12f; // Slight wobble
            float clipRot = prog * 90.0f;

            float cosR = std::cos(clipRot * 3.14159f / 180.0f);
            float sinR = std::sin(clipRot * 3.14159f / 180.0f);
            float scale = 0.45f;

            for (const auto& v : singleClip) {
                // Lay flat on belt (X-Z plane) and rotate
                float vx = v.x * scale;
                float vy = v.z * scale;
                float vz = v.y * scale;

                float rx = vx * cosR - vz * sinR + clipX;
                float ry = vy + clipY;
                float rz = vx * sinR + vz * cosR + clipZ;

                vertices.push_back({ rx, ry, rz, v.nx, 1.0f, v.nz, 0.98f, 0.88f, 0.32f, 1.0f, 0, 0 });
            }
        }

        return vertices;
    }

    /// <summary>
    /// Generates 3D Machine Mesh according to Factory Tile Type.
    /// </summary>
    static std::vector<RenderVertex3D> BuildMachineMesh(FactoryTileType type, float x, float z, float tileSize = 1.0f) {
        std::vector<RenderVertex3D> vertices;
        float hx = x + tileSize * 0.5f;
        float hz = z + tileSize * 0.5f;
        float half = tileSize * 0.38f;

        float r = 0.8f, g = 0.8f, b = 0.8f, height = 0.6f;
        if (type == FactoryTileType::WireExtruder) {
            r = 0.22f; g = 0.75f; b = 0.95f; height = 0.7f;
        } else if (type == FactoryTileType::HydraulicStamper) {
            r = 0.98f; g = 0.70f; b = 0.15f; height = 1.0f;
        } else if (type == FactoryTileType::LaserSinterer) {
            r = 0.92f; g = 0.25f; b = 0.85f; height = 0.5f;
        } else if (type == FactoryTileType::CoolingTower) {
            r = 0.20f; g = 0.85f; b = 0.55f; height = 0.9f;
        } else {
            return vertices;
        }

        AppendBox(vertices, hx - half, -1.0f, hz - half, hx + half, -1.0f + height, hz + half, r, g, b);
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
