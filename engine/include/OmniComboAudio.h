#pragma once
#include <algorithm>
#include "OmniAudio.h"

namespace OmniEngine {

class ClickComboTracker {
public:
    ClickComboTracker(ProceduralAudioEngine& audio)
        : m_audio(audio), m_comboLevel(0), m_comboTimer(0.0f) {}

    int GetCurrentCombo() const { return m_comboLevel; }
    float GetPitchMultiplier() const { return 1.0f + m_comboLevel * 0.1f; }

    void RegisterClick() {
        m_comboTimer = 1.2f; // 1.2 second combo window
        m_comboLevel = std::min(10, m_comboLevel + 1);

        // Scale velocity and harmonics with combo level
        float velocity = 0.8f + (m_comboLevel * 0.04f);
        m_audio.TriggerClickChime(m_comboLevel, velocity);
    }

    void Update(float dt) {
        if (m_comboTimer > 0.0f) {
            m_comboTimer -= dt;
            if (m_comboTimer <= 0.0f) {
                // Combo reset when clicking stops
                m_comboLevel = 0;
            }
        }
    }

private:
    ProceduralAudioEngine& m_audio;
    int m_comboLevel;
    float m_comboTimer;
};

} // namespace OmniEngine
