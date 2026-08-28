#pragma once
#include <vector>
#include <string>
#include <random>
#include <cmath>
#include <algorithm>
#include "OmniMeshBuilder.h"

namespace OmniEngine {

struct Spark3D {
    float x, y, z;
    float vx, vy, vz;
    float r, g, b;
    float life;      // Remaining life in seconds
    float maxLife;
    float size;
};

struct FloatingText3D {
    float x, y, z;
    std::string text;
    float r, g, b;
    float life;
    float maxLife;
};

/// <summary>
/// Real-Time 3D Particle FX and Click Juice System.
/// Simulates gravity-affected weld sparks, floor collisions, and floating floating point rewards.
/// </summary>
class OmniParticleEngine {
public:
    OmniParticleEngine() : m_rng(1337) {}

    void EmitClickSparks(float originX, float originY, float originZ, int count = 25) {
        std::uniform_real_distribution<float> distVel(-2.5f, 2.5f);
        std::uniform_real_distribution<float> distVelY(1.5f, 4.5f);
        std::uniform_real_distribution<float> distLife(0.4f, 0.9f);
        std::uniform_real_distribution<float> distColor(0.7f, 1.0f);

        for (int i = 0; i < count; ++i) {
            Spark3D s;
            s.x = originX;
            s.y = originY;
            s.z = originZ;
            s.vx = distVel(m_rng);
            s.vy = distVelY(m_rng);
            s.vz = distVel(m_rng);
            s.r = 1.0f;
            s.g = distColor(m_rng);
            s.b = 0.2f; // Gold/Orange fire
            s.maxLife = distLife(m_rng);
            s.life = s.maxLife;
            s.size = 0.05f;
            m_sparks.push_back(s);
        }
    }

    void SpawnFloatingText(float x, float y, float z, const std::string& text, float r = 0.3f, float g = 1.0f, float b = 0.4f) {
        FloatingText3D ft;
        ft.x = x;
        ft.y = y;
        ft.z = z;
        ft.text = text;
        ft.r = r;
        ft.g = g;
        ft.b = b;
        ft.maxLife = 1.2f;
        ft.life = ft.maxLife;
        m_floatingTexts.push_back(ft);
    }

    void Update(float dt) {
        const float gravity = -9.8f;
        const float floorY = -1.0f;

        // 1. Update Sparks
        for (auto& s : m_sparks) {
            s.life -= dt;
            s.vy += gravity * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.z += s.vz * dt;

            // Bounce off factory floor
            if (s.y < floorY) {
                s.y = floorY;
                s.vy = -s.vy * 0.45f; // Damped bounce
                s.vx *= 0.7f;
                s.vz *= 0.7f;
            }
        }
        m_sparks.erase(
            std::remove_if(m_sparks.begin(), m_sparks.end(), [](const Spark3D& s) { return s.life <= 0.0f; }),
            m_sparks.end()
        );

        // 2. Update Floating Text Popups
        for (auto& ft : m_floatingTexts) {
            ft.life -= dt;
            ft.y += 0.8f * dt; // Float gently upward
        }
        m_floatingTexts.erase(
            std::remove_if(m_floatingTexts.begin(), m_floatingTexts.end(), [](const FloatingText3D& ft) { return ft.life <= 0.0f; }),
            m_floatingTexts.end()
        );
    }

    std::vector<RenderVertex3D> GenerateSparkMesh() const {
        std::vector<RenderVertex3D> vertices;
        for (const auto& s : m_sparks) {
            float alpha = s.life / s.maxLife;
            float sz = s.size;

            RenderVertex3D v0 = { s.x - sz, s.y - sz, s.z, 0.0f, 1.0f, 0.0f, s.r, s.g, s.b, alpha, 0.0f, 0.0f };
            RenderVertex3D v1 = { s.x + sz, s.y - sz, s.z, 0.0f, 1.0f, 0.0f, s.r, s.g, s.b, alpha, 1.0f, 0.0f };
            RenderVertex3D v2 = { s.x + sz, s.y + sz, s.z, 0.0f, 1.0f, 0.0f, s.r, s.g, s.b, alpha, 1.0f, 1.0f };
            RenderVertex3D v3 = { s.x - sz, s.y + sz, s.z, 0.0f, 1.0f, 0.0f, s.r, s.g, s.b, alpha, 0.0f, 1.0f };

            vertices.push_back(v0);
            vertices.push_back(v1);
            vertices.push_back(v2);
            vertices.push_back(v0);
            vertices.push_back(v2);
            vertices.push_back(v3);
        }
        return vertices;
    }

    const std::vector<FloatingText3D>& GetFloatingTexts() const { return m_floatingTexts; }

private:
    std::vector<Spark3D> m_sparks;
    std::vector<FloatingText3D> m_floatingTexts;
    std::mt19937 m_rng;
};

} // namespace OmniEngine
