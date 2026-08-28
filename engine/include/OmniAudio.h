#pragma once
#include <vector>
#include <cmath>
#include <cstdint>

namespace OmniEngine {

struct ChimeVoice {
    float carrierFreq = 440.0f;
    float modFreq = 1060.4f;    // 2.41x ratio for inharmonic metallic clang
    float modIndex = 4.5f;      // Sharpness of impact
    float decay = 0.08f;        // Fast crisp snap
    float time = 0.0f;
    float gain = 0.5f;
    bool active = false;
};

class ProceduralAudioEngine {
public:
    ProceduralAudioEngine(int sampleRate = 48000, int maxPolyphony = 32);

    void TriggerClickChime(int pentatonicStep, float velocity = 1.0f);
    void RenderAudioFrames(float* outputBuffer, size_t frameCount, int channels);

private:
    int m_sampleRate;
    int m_maxPolyphony;
    std::vector<ChimeVoice> m_voices;

    // Pentatonic scale notes (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6)
    static const float s_pentatonicFrequencies[11];
};

} // namespace OmniEngine
