#include "../include/OmniAudio.h"
#include <algorithm>

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

void ProceduralAudioEngine::TriggerClickChime(int pentatonicStep, float velocity, float clickRateHz) {
    int clampedStep = std::max(0, std::min(10, pentatonicStep));
    float baseFreq = s_pentatonicFrequencies[clampedStep];

    // Dynamic Low-Pass Filter: As click rate increases, dynamically lower cutoff frequency (5000Hz -> 1800Hz)
    // to soften piercing highs and prevent acoustic ear fatigue!
    m_lpfCutoff = std::max(1800.0f, 6500.0f - (clickRateHz * 350.0f));

    // Find available or oldest voice
    for (auto& voice : m_voices) {
        if (!voice.active) {
            voice.soundpack = m_soundpack;
            voice.time = 0.0f;
            voice.active = true;

            switch (m_soundpack) {
                case AudioSoundpack::HeavyIndustrialASMR:
                    // Sub-bass thump with low-pitch inharmonic clang & hydraulic air release
                    voice.carrierFreq = baseFreq * 0.5f; // Drop octave for heavy industrial body
                    voice.modFreq = baseFreq * 1.84f;
                    voice.modIndex = 5.2f + velocity * 2.0f;
                    voice.decay = 0.09f;
                    voice.gain = 0.45f * velocity;
                    break;

                case AudioSoundpack::MechanicalSwitch:
                    // Crisp sharp double-click transient (IBM Model M style)
                    voice.carrierFreq = 1800.0f + (clampedStep * 80.0f);
                    voice.modFreq = 3400.0f;
                    voice.modIndex = 2.0f;
                    voice.decay = 0.025f; // Extremely snappy click
                    voice.gain = 0.30f * velocity;
                    break;

                case AudioSoundpack::CyberpunkSynth:
                default:
                    // Warm harmonic pentatonic synthesizer chime
                    voice.carrierFreq = baseFreq;
                    voice.modFreq = baseFreq * 2.0f; // Pure harmonic octave
                    voice.modIndex = 2.5f;
                    voice.decay = 0.12f;
                    voice.gain = 0.35f * velocity;
                    break;
            }
            return;
        }
    }

    // Voice stealing fallback
    m_voices[0].time = 0.0f;
    m_voices[0].active = true;
}

void ProceduralAudioEngine::RenderAudioFrames(float* outputBuffer, size_t frameCount, int channels) {
    float dt = 1.0f / static_cast<float>(m_sampleRate);
    const float twoPi = 6.28318530718f;

    // Calculate one-pole LPF alpha coefficient
    float alpha = std::min(1.0f, twoPi * dt * m_lpfCutoff);

    for (size_t i = 0; i < frameCount; ++i) {
        float rawSample = 0.0f;

        for (auto& voice : m_voices) {
            if (!voice.active) continue;

            float t = voice.time;
            float envCarrier = std::exp(-t / voice.decay);
            float envMod = std::exp(-t / (voice.decay * 0.35f));

            float modSignal = voice.modIndex * envMod * std::sin(twoPi * voice.modFreq * t);
            float carrierSignal = std::sin(twoPi * voice.carrierFreq * t + modSignal);

            // Add mechanical white-noise transient burst on initial impact
            if (voice.soundpack == AudioSoundpack::HeavyIndustrialASMR && t < 0.008f) {
                float noise = ((rand() % 1000) / 500.0f - 1.0f) * 0.15f;
                carrierSignal += noise;
            }

            rawSample += envCarrier * carrierSignal * voice.gain;

            voice.time += dt;
            if (envCarrier < 0.0005f) {
                voice.active = false;
            }
        }

        // Apply One-Pole Low-Pass Filter to eliminate ear fatigue
        m_lpfPrevSampleL += alpha * (rawSample - m_lpfPrevSampleL);
        float filteredSample = std::tanh(m_lpfPrevSampleL); // Soft-clipper

        for (int ch = 0; ch < channels; ++ch) {
            outputBuffer[i * channels + ch] = filteredSample;
        }
    }
}

} // namespace OmniEngine
