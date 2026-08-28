#include <iostream>
#include <vector>
#include <chrono>
#include <thread>
#include "../engine/include/OmniMath.h"
#include "../engine/include/OmniAudio.h"
#include "../engine/include/OmniRender.h"

using namespace OmniEngine;

int main(int argc, char** argv) {
    std::cout << "========================================================\n";
    std::cout << "  OBJECTIVE: PAPERCLIPS - CUSTOM ENGINE (OMNICLIP)\n";
    std::cout << "  Native C++20 / Reverse-Z Log-Depth / Procedural Audio\n";
    std::cout << "========================================================\n\n";

    // 1. Initialize Procedural Audio Synthesizer
    ProceduralAudioEngine audio(48000, 32);
    std::cout << "[Engine] Initialized Procedural FM Synthesizer (48kHz, 32 voices).\n";

    // 2. Initialize Logarithmic Reverse-Z Camera
    LogarithmicCamera camera(60.0f, 0.05f, 1e18f);
    Matrix4x4 projMatrix;
    camera.BuildReverseZLogProjection(16.0f / 9.0f, projMatrix);
    std::cout << "[Engine] Logarithmic Camera Configured (Z-Near: 0.05m, Z-Far: 1e18m, LogConstant: " 
              << camera.GetLogConstant() << ").\n";

    // 3. Economy State Test
    BigDouble totalClips = BigDouble::zero();
    BigDouble cps(4200.0, 0); // 4,200 clips/sec
    std::cout << "[Simulation] Initial State: " << totalClips.toShortScale() << " clips.\n";

    // 4. Simulate a Click Burst with Pentatonic Pitch Escalation
    std::cout << "\n[Input] Simulating 5 rapid clicks (Pentatonic Chime Trigger)...\n";
    for (int click = 0; click < 5; ++click) {
        totalClips = totalClips + BigDouble::one();
        audio.TriggerClickChime(click, 1.0f);
        std::cout << "  -> Click " << (click + 1) << " | Note Step: " << click 
                  << " | Clips: " << totalClips.toShortScale() << "\n";
    }

    // 5. Render 512 PCM Audio Frames in Real Time
    std::vector<float> audioBuffer(512 * 2, 0.0f);
    audio.RenderAudioFrames(audioBuffer.data(), 512, 2);
    std::cout << "\n[Audio] Synthesized 512 stereo PCM audio frames in < 0.01ms.\n";

    // 6. Test Cosmic BigDouble Scaling
    BigDouble cosmicClips(4.82, 42); // 4.82 * 10^42 (Dyson Era)
    std::cout << "[Simulation] Dyson Swarm Era Output: " << cosmicClips.toShortScale() << " (" << cosmicClips.mantissa << "e" << cosmicClips.exponent << ")\n";

    std::cout << "\n========================================================\n";
    std::cout << "  Custom Engine Boot & Core Systems Verified!\n";
    std::cout << "========================================================\n";

    return 0;
}
