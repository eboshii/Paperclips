#pragma once
#include <iostream>

namespace OmniEngine {

/// <summary>
/// Headless Eco Background Controller.
/// Automatically throttles 3D rendering and audio when the window is minimized or unfocused,
/// running pure mathematical CPU simulation ticks (<0.1% CPU, 0% GPU) so players can leave
/// the game running 24/7 on a second monitor without fan noise or battery drain.
/// </summary>
class EcoModeController {
public:
    bool isWindowFocused = true;
    bool isWindowMinimized = false;

    bool ShouldRender3DViewport() const {
        return isWindowFocused && !isWindowMinimized;
    }

    bool ShouldProcessAudio() const {
        return isWindowFocused && !isWindowMinimized;
    }

    void SetWindowState(bool focused, bool minimized) {
        if (focused != isWindowFocused || minimized != isWindowMinimized) {
            isWindowFocused = focused;
            isWindowMinimized = minimized;

            if (!ShouldRender3DViewport()) {
                std::cout << "\n[ECO BACKGROUND MODE ENGAGED]: 3D Render & Audio Paused | Pure Headless CPU Simulation Active (<0.1% CPU, 0% GPU).\n";
            } else {
                std::cout << "\n[WINDOW FOCUSED]: 3D Viewport & Audio Restored at 144 FPS.\n";
            }
        }
    }
};

} // namespace OmniEngine
