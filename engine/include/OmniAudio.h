#pragma once
#include <vector>
#include <cmath>
#include <cstdint>
#include <string>

namespace OmniEngine {

enum class AudioSoundpack {
    HeavyIndustrialASMR, // Deep hydraulic presses, heavy metallic clank, pneumatic hiss
    CyberpunkSynth,      // Muted warm square-wave chords & harmonic chimes
    MechanicalSwitch     // Crisp tactile mechanical click switches (IBM Model M style)
};

struct ChimeVoice {
    float carrierFreq = 440.0f;
    float modFreq = 1060.4f;
    float modIndex = 4.5f;
    float decay = 0.08f;
    float time = 0.0f;
    float gain = 0.5f;
    bool active = false;
    AudioSoundpack soundpack = AudioSoundpack::HeavyIndustrialASMR;
};

class ProceduralAudioEngine {
public:
    ProceduralAudioEngine(int sampleRate = 48000, int maxPolyphony = 32);

    void SetSoundpack(AudioSoundpack pack) { m_soundpack = pack; }
    AudioSoundpack GetSoundpack() const { return m_soundpack; }

    void TriggerClickChime(int pentatonicStep, float velocity = 1.0f, float clickRateHz = 2.0f);
    void RenderAudioFrames(float* outputBuffer, size_t frameCount, int channels);

private:
    int m_sampleRate;
    int m_maxPolyphony;
    AudioSoundpack m_soundpack = AudioSoundpack::HeavyIndustrialASMR;
    std::vector<ChimeVoice> m_voices;

    // Dynamic Low-Pass Filter (One-Pole IIR Filter to eliminate ear fatigue during rapid clicks)
    float m_lpfCutoff = 8000.0f;
    float m_lpfPrevSampleL = 0.0f;
    float m_lpfPrevSampleR = 0.0f;

    static const float s_pentatonicFrequencies[11];
};

} // namespace OmniEngine
