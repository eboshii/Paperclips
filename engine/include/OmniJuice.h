#pragma once
#include <vector>
#include <cmath>
#include <random>

namespace OmniEngine {

struct SparkParticle {
    float pos[3];
    float vel[3];
    float life;
    float maxLife;
    float color[4];
};

struct FloatingText {
    float pos[3];
    float vel[3];
    float life;
    std::string text;
    float scale;
    float color[4];
};

class JuiceController {
public:
    JuiceController() : m_rng(1337) {}

    float screenShakeTrauma = 0.0f;
    float shakeOffsetX = 0.0f;
    float shakeOffsetY = 0.0f;

    std::vector<SparkParticle> sparks;
    std::vector<FloatingText> floatingTexts;

    void AddTrauma(float amount) {
        screenShakeTrauma = std::min(1.0f, screenShakeTrauma + amount);
    }

    void EmitSparks(float x, float y, float z, int count = 40) {
        std::uniform_real_distribution<float> distSpeed(2.0f, 6.0f);
        std::uniform_real_distribution<float> distAngle(0.0f, 6.2831853f);
        std::uniform_real_distribution<float> distPitch(0.2f, 1.2f);
        std::uniform_real_distribution<float> distLife(0.2f, 0.6f);

        for (int i = 0; i < count; ++i) {
            float speed = distSpeed(m_rng);
            float angle = distAngle(m_rng);
            float pitch = distPitch(m_rng);

            SparkParticle p;
            p.pos[0] = x; p.pos[1] = y; p.pos[2] = z;
            p.vel[0] = std::cos(angle) * speed;
            p.vel[1] = std::sin(pitch) * speed;
            p.vel[2] = std::sin(angle) * speed;
            p.life = p.maxLife = distLife(m_rng);

            // Orange-yellow to white neon glowing sparks
            p.color[0] = 1.0f;
            p.color[1] = 0.85f + (i % 5) * 0.03f;
            p.color[2] = 0.4f;
            p.color[3] = 1.0f;

            sparks.push_back(p);
        }
    }

    void SpawnFloatingText(const std::string& msg, float x, float y, float z, float scale = 1.0f) {
        FloatingText ft;
        ft.pos[0] = x; ft.pos[1] = y; ft.pos[2] = z;
        ft.vel[0] = 0.0f; ft.vel[1] = 1.2f; ft.vel[2] = 0.0f;
        ft.life = 1.0f;
        ft.text = msg;
        ft.scale = scale;
        ft.color[0] = 1.0f; ft.color[1] = 1.0f; ft.color[2] = 1.0f; ft.color[3] = 1.0f;
        floatingTexts.push_back(ft);
    }

    void Update(float dt) {
        // 1. Screen Shake Decay (Trauma^2 smoothing)
        if (screenShakeTrauma > 0.0f) {
            float shakePower = screenShakeTrauma * screenShakeTrauma;
            std::uniform_real_distribution<float> distShake(-1.0f, 1.0f);
            shakeOffsetX = distShake(m_rng) * shakePower * 0.15f;
            shakeOffsetY = distShake(m_rng) * shakePower * 0.15f;
            screenShakeTrauma = std::max(0.0f, screenShakeTrauma - dt * 2.0f);
        } else {
            shakeOffsetX = 0.0f;
            shakeOffsetY = 0.0f;
        }

        // 2. Update Sparks
        const float gravity = -9.81f;
        for (size_t i = 0; i < sparks.size(); ) {
            auto& p = sparks[i];
            p.life -= dt;
            if (p.life <= 0.0f) {
                sparks[i] = sparks.back();
                sparks.pop_back();
                continue;
            }

            p.vel[1] += gravity * dt;
            p.pos[0] += p.vel[0] * dt;
            p.pos[1] += p.vel[1] * dt;
            p.pos[2] += p.vel[2] * dt;

            // Bounce off workbench table (y = 0)
            if (p.pos[1] < 0.0f) {
                p.pos[1] = 0.0f;
                p.vel[1] = -p.vel[1] * 0.4f; // Inelastic bounce
                p.vel[0] *= 0.7f;
                p.vel[2] *= 0.7f;
            }

            // Alpha fade
            p.color[3] = p.life / p.maxLife;
            ++i;
        }

        // 3. Update Floating Texts
        for (size_t i = 0; i < floatingTexts.size(); ) {
            auto& ft = floatingTexts[i];
            ft.life -= dt;
            if (ft.life <= 0.0f) {
                floatingTexts[i] = floatingTexts.back();
                floatingTexts.pop_back();
                continue;
            }

            ft.pos[1] += ft.vel[1] * dt;
            ft.color[3] = ft.life; // Fade out
            ++i;
        }
    }

private:
    std::mt19937 m_rng;
};

} // namespace OmniEngine
