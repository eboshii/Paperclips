#pragma once
#include <vector>
#include <cmath>
#include <cstdint>
#include "OmniMeshBuilder.h"
#include "OmniMath.h"

namespace OmniEngine {

enum class CosmicVisualTier {
    FactoryFloor,      // 0 to 1e15 clips: 8x8 Grid, Conveyors, Mounds
    PlanetaryEarth,    // 1e15 to 1e24 clips: Earth & Equatorial Orbital Ring
    SolarDysonSwarm,   // 1e24 to 1e35 clips: Sun & Concentric Dyson Mirrors
    GalacticPenrose,   // 1e35 to 1e78 clips: Black Hole Dynamo & Galactic Lasers
    MultiverseVoid     // > 1e78 clips: 11D Quantum Foam & Universe Bubbles
};

/// <summary>
/// 3D Procedural Cosmic Mesh Generator for Multi-Scale Space Scenes.
/// </summary>
class OmniCosmicRenderer {
public:
    static CosmicVisualTier DetermineTier(const BigDouble& lifetimeClips) {
        if (lifetimeClips < BigDouble(1.0, 15)) return CosmicVisualTier::FactoryFloor;
        if (lifetimeClips < BigDouble(5.97, 24)) return CosmicVisualTier::PlanetaryEarth;
        if (lifetimeClips < BigDouble(1.0, 35)) return CosmicVisualTier::SolarDysonSwarm;
        if (lifetimeClips < BigDouble(1.0, 78)) return CosmicVisualTier::GalacticPenrose;
        return CosmicVisualTier::MultiverseVoid;
    }

    /// <summary>
    /// Generates a 3D Planet Earth Sphere with Equatorial Orbital Ring.
    /// </summary>
    static std::vector<RenderVertex3D> BuildPlanetEarthMesh(float radius = 2.0f, int rings = 16, int sectors = 32) {
        std::vector<RenderVertex3D> vertices;
        const float pi = 3.14159265359f;

        for (int r = 0; r < rings; ++r) {
            float phi0 = (float)r / rings * pi;
            float phi1 = (float)(r + 1) / rings * pi;

            for (int s = 0; s < sectors; ++s) {
                float theta0 = (float)s / sectors * 2.0f * pi;
                float theta1 = (float)(s + 1) / sectors * 2.0f * pi;

                // Sphere points
                float x00 = radius * std::sin(phi0) * std::cos(theta0);
                float y00 = radius * std::cos(phi0);
                float z00 = radius * std::sin(phi0) * std::sin(theta0);

                float x10 = radius * std::sin(phi1) * std::cos(theta0);
                float y10 = radius * std::cos(phi1);
                float z10 = radius * std::sin(phi1) * std::sin(theta0);

                float x01 = radius * std::sin(phi0) * std::cos(theta1);
                float y01 = radius * std::cos(phi0);
                float z01 = radius * std::sin(phi0) * std::sin(theta1);

                float x11 = radius * std::sin(phi1) * std::cos(theta1);
                float y11 = radius * std::cos(phi1);
                float z11 = radius * std::sin(phi1) * std::sin(theta1);

                // Planet continent & ocean palette (Earth blue & chrome wire veins)
                float continent = std::sin(theta0 * 3.0f) * std::cos(phi0 * 4.0f);
                float cr = (continent > 0.2f) ? 0.4f : 0.1f;
                float cg = (continent > 0.2f) ? 0.6f : 0.3f;
                float cb = (continent > 0.2f) ? 0.5f : 0.8f;

                vertices.push_back({ x00, y00, z00, x00/radius, y00/radius, z00/radius, cr, cg, cb, 1.0f, 0.0f, 0.0f });
                vertices.push_back({ x10, y10, z10, x10/radius, y10/radius, z10/radius, cr, cg, cb, 1.0f, 1.0f, 0.0f });
                vertices.push_back({ x11, y11, z11, x11/radius, y11/radius, z11/radius, cr, cg, cb, 1.0f, 1.0f, 1.0f });
                vertices.push_back({ x00, y00, z00, x00/radius, y00/radius, z00/radius, cr, cg, cb, 1.0f, 0.0f, 0.0f });
                vertices.push_back({ x11, y11, z11, x11/radius, y11/radius, z11/radius, cr, cg, cb, 1.0f, 1.0f, 1.0f });
                vertices.push_back({ x01, y01, z01, x01/radius, y01/radius, z01/radius, cr, cg, cb, 1.0f, 0.0f, 1.0f });
            }
        }
        return vertices;
    }

    /// <summary>
    /// Generates the 3D Equatorial Mass Driver Ring surrounding Earth.
    /// </summary>
    static std::vector<RenderVertex3D> BuildEquatorialRingMesh(float innerRadius = 2.8f, float outerRadius = 3.2f, int sectors = 48) {
        std::vector<RenderVertex3D> vertices;
        const float pi = 3.14159265359f;

        for (int s = 0; s < sectors; ++s) {
            float th0 = (float)s / sectors * 2.0f * pi;
            float th1 = (float)(s + 1) / sectors * 2.0f * pi;

            float x0_in = innerRadius * std::cos(th0);
            float z0_in = innerRadius * std::sin(th0);
            float x1_in = innerRadius * std::cos(th1);
            float z1_in = innerRadius * std::sin(th1);

            float x0_out = outerRadius * std::cos(th0);
            float z0_out = outerRadius * std::sin(th0);
            float x1_out = outerRadius * std::cos(th1);
            float z1_out = outerRadius * std::sin(th1);

            // Chrome ring with cyan magnetic rails
            float cr = 0.85f, cg = 0.90f, cb = 0.98f;
            vertices.push_back({ x0_in, 0.0f, z0_in, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 0.0f, 0.0f });
            vertices.push_back({ x1_in, 0.0f, z1_in, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 1.0f, 0.0f });
            vertices.push_back({ x1_out, 0.0f, z1_out, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 1.0f, 1.0f });
            vertices.push_back({ x0_in, 0.0f, z0_in, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 0.0f, 0.0f });
            vertices.push_back({ x1_out, 0.0f, z1_out, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 1.0f, 1.0f });
            vertices.push_back({ x0_out, 0.0f, z0_out, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 0.0f, 1.0f });
        }
        return vertices;
    }

    /// <summary>
    /// Generates 3D Solar Star & Concentric Dyson Swarm Rings.
    /// </summary>
    static std::vector<RenderVertex3D> BuildStarSunMesh(float radius = 2.2f, int rings = 16, int sectors = 32) {
        std::vector<RenderVertex3D> vertices;
        const float pi = 3.14159265359f;

        for (int r = 0; r < rings; ++r) {
            float phi0 = (float)r / rings * pi;
            float phi1 = (float)(r + 1) / rings * pi;

            for (int s = 0; s < sectors; ++s) {
                float theta0 = (float)s / sectors * 2.0f * pi;
                float theta1 = (float)(s + 1) / sectors * 2.0f * pi;

                float x00 = radius * std::sin(phi0) * std::cos(theta0);
                float y00 = radius * std::cos(phi0);
                float z00 = radius * std::sin(phi0) * std::sin(theta0);

                float x10 = radius * std::sin(phi1) * std::cos(theta0);
                float y10 = radius * std::cos(phi1);
                float z10 = radius * std::sin(phi1) * std::sin(theta0);

                float x01 = radius * std::sin(phi0) * std::cos(theta1);
                float y01 = radius * std::cos(phi0);
                float z01 = radius * std::sin(phi0) * std::sin(theta1);

                float x11 = radius * std::sin(phi1) * std::cos(theta1);
                float y11 = radius * std::cos(phi1);
                float z11 = radius * std::sin(phi1) * std::sin(theta1);

                // Fiery Gold / Orange Solar Corona
                float cr = 1.0f, cg = 0.85f, cb = 0.2f;
                vertices.push_back({ x00, y00, z00, x00/radius, y00/radius, z00/radius, cr, cg, cb, 1.0f, 0.0f, 0.0f });
                vertices.push_back({ x10, y10, z10, x10/radius, y10/radius, z10/radius, cr, cg, cb, 1.0f, 1.0f, 0.0f });
                vertices.push_back({ x11, y11, z11, x11/radius, y11/radius, z11/radius, cr, cg, cb, 1.0f, 1.0f, 1.0f });
                vertices.push_back({ x00, y00, z00, x00/radius, y00/radius, z00/radius, cr, cg, cb, 1.0f, 0.0f, 0.0f });
                vertices.push_back({ x11, y11, z11, x11/radius, y11/radius, z11/radius, cr, cg, cb, 1.0f, 1.0f, 1.0f });
                vertices.push_back({ x01, y01, z01, x01/radius, y01/radius, z01/radius, cr, cg, cb, 1.0f, 0.0f, 1.0f });
            }
        }
        return vertices;
    }

    /// <summary>
    /// Generates 3D Galactic Black Hole Penrose Loom with Spacetime Swirl.
    /// </summary>
    static std::vector<RenderVertex3D> BuildBlackHolePenroseMesh(float diskRadius = 4.0f, int sectors = 48) {
        std::vector<RenderVertex3D> vertices;
        const float pi = 3.14159265359f;

        for (int s = 0; s < sectors; ++s) {
            float th0 = (float)s / sectors * 2.0f * pi;
            float th1 = (float)(s + 1) / sectors * 2.0f * pi;

            float x0_in = 1.0f * std::cos(th0);
            float z0_in = 1.0f * std::sin(th0);
            float x1_in = 1.0f * std::cos(th1);
            float z1_in = 1.0f * std::sin(th1);

            float x0_out = diskRadius * std::cos(th0);
            float z0_out = diskRadius * std::sin(th0);
            float x1_out = diskRadius * std::cos(th1);
            float z1_out = diskRadius * std::sin(th1);

            // Violet relativistic frame-dragging glow
            float cr = 0.7f, cg = 0.2f, cb = 1.0f;
            vertices.push_back({ x0_in, 0.0f, z0_in, 0.0f, 1.0f, 0.0f, 0.1f, 0.0f, 0.1f, 1.0f, 0.0f, 0.0f });
            vertices.push_back({ x1_in, 0.0f, z1_in, 0.0f, 1.0f, 0.0f, 0.1f, 0.0f, 0.1f, 1.0f, 1.0f, 0.0f });
            vertices.push_back({ x1_out, 0.0f, z1_out, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 1.0f, 1.0f });
            vertices.push_back({ x0_in, 0.0f, z0_in, 0.0f, 1.0f, 0.0f, 0.1f, 0.0f, 0.1f, 1.0f, 0.0f, 0.0f });
            vertices.push_back({ x1_out, 0.0f, z1_out, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 1.0f, 1.0f });
            vertices.push_back({ x0_out, 0.0f, z0_out, 0.0f, 1.0f, 0.0f, cr, cg, cb, 1.0f, 0.0f, 1.0f });
        }
        return vertices;
    }

    /// <summary>
    /// Generates 3D Multiverse Bubble Foam (Alternate Timeline Spheres).
    /// </summary>
    static std::vector<RenderVertex3D> BuildMultiverseFoamMesh() {
        std::vector<RenderVertex3D> vertices;
        // Central Maximized Universe (Pure Chrome)
        auto centralSphere = BuildPlanetEarthMesh(2.5f, 12, 24);
        for (auto v : centralSphere) {
            v.r = 0.95f; v.g = 0.96f; v.b = 0.98f; // Pure double-loop polished steel
            vertices.push_back(v);
        }

        // Surrounding Alternate Realities (STAPLE-MAX-9000 Red, Paper Pulp Green, Quantum Cyan)
        struct Bubble { float ox, oy, oz, rad, r, g, b; };
        std::vector<Bubble> bubbles = {
            { -4.5f, 1.5f, -2.0f, 1.2f, 0.9f, 0.2f, 0.2f },  // STAPLE-MAX-9000 Red Reality
            { 4.2f, -1.0f, -3.0f, 1.4f, 0.2f, 0.8f, 0.9f },  // Quantum Cyan Timeline
            { 1.0f, 3.5f, -4.0f, 1.0f, 0.4f, 0.9f, 0.4f },   // Biological Cellulose Reality
            { -3.0f, -3.0f, -2.5f, 1.3f, 0.8f, 0.4f, 0.9f }  // 11D String Foam Bubble
        };

        for (const auto& b : bubbles) {
            auto bMesh = BuildPlanetEarthMesh(b.rad, 8, 16);
            for (auto v : bMesh) {
                v.x += b.ox; v.y += b.oy; v.z += b.oz;
                v.r = b.r; v.g = b.g; v.b = b.b;
                vertices.push_back(v);
            }
        }
        return vertices;
    }
};

} // namespace OmniEngine
