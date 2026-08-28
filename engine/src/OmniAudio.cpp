#include "../include/OmniAudio.h"

namespace OmniEngine {

const float ProceduralAudioEngine::s_pentatonicFrequencies[11] = {
    261.63f, // C4
    293.66f, // D4
    329.63f, // E4
    392.00f, // G4
    440.00f, // A4
    523.25f, // C5
    587.33f, // D5
    659.25f, // E5
    783.99f, // G5
    880.00f, // A5
    1046.50f // C6
};

ProceduralAudioEngine::ProceduralAudioEngine(int sampleRate, int maxPolyphony)
    : m_sampleRate(sampleRate), m_maxPolyphony(maxPolyphony) {
    m_voices.resize(maxPolyphony);
}

void ProceduralAudioEngine::TriggerClickChime(int pentatonicStep, float velocity) {
    int clampedStep = std::max(0, std::min(10, pentatonicStep));
    float baseFreq = s_pentatonicFrequencies[clampedStep];

    // Find available or oldest voice
    for (auto& voice : m_voices) {
        if (!voice.active) {
            voice.carrierFreq = baseFreq;
            voice.modFreq = baseFreq * 2.41f; // Inharmonic metallic multiplier
            voice.modIndex = 3.5f + velocity * 2.0f;
            voice.decay = 0.06f + (0.04f / (clampedStep + 1.0f));
            voice.time = 0.0f;
            voice.gain = 0.35f * velocity;
            voice.active = true;
            return;
        }
    }

    // Voice stealing fallback
    m_voices[0].carrierFreq = baseFreq;
    m_voices[0].modFreq = baseFreq * 2.41f;
    m_voices[0].time = 0.0f;
    m_voices[0].active = true;
}

void ProceduralAudioEngine::RenderAudioFrames(float* outputBuffer, size_t frameCount, int channels) {
    float dt = 1.0f / static_cast<float>(m_sampleRate);
    const float twoPi = 6.28318530718f;

    for (size_t i = 0; i < frameCount; ++i) {
        float mixSample = 0.0f;

        for (auto& voice : m_voices) {
            if (!voice.active) continue;

            float t = voice.time;
            float envCarrier = std::exp(-t / voice.decay);
            float envMod = std::exp(-t / (voice.decay * 0.35f));

            float modSignal = voice.modIndex * envMod * std::sin(twoPi * voice.modFreq * t);
            float carrierSignal = std::sin(twoPi * voice.carrierFreq * t + modSignal);

            mixSample += envCarrier * carrierSignal * voice.gain;

            voice.time += dt;
            if (envCarrier < 0.0005f) {
                voice.active = false;
            }
        }

        // Soft clipper / limiter to avoid digital distortion
        mixSample = std::tanh(mixSample);

        for (int ch = 0; ch < channels; ++ch) {
            outputBuffer[i * channels + ch] = mixSample;
        }
    }
}

} // namespace OmniEngine
