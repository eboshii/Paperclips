# Custom Engine Architecture Specification
# Engine Codename: *OmniClip Engine*
**Target Platforms:** Windows (x64 Native), Linux (x64 Native), Mobile (Android NDK / iOS Metal), Web (WASM / WebGPU)  
**Binary Size Target:** < 25 MB standalone executable (vs. 200MB+ in generic engines)  
**Cold Boot Time:** < 200 milliseconds  
**Framerate Target:** Uncapped / Locked 144 FPS (Desktop), 60 FPS (Mobile Battery-Saver)

---

## 1. Why a Custom Engine for *Objective: Paperclips*?

Generic game engines (Unity, Unreal, Godot) are built for general-purpose games and carry heavy runtime overhead, garbage collection spikes, non-custom depth precision, and bloated memory footprints. 

A bespoke engine built specifically for **Objective: Paperclips** gives us:
1. **Zero-Latency Procedural Audio Synthesis:** Procedural FM/additive audio synthesis directly in the PCM audio callback—clicks generate metallic chimes instantly ($< 5\text{ms}$ latency) without loading dozens of sample files.
2. **Logarithmic Reverse-Z Depth Buffer:** Solves the classic astronomical z-fighting problem, allowing the camera to seamlessly render a $0.05\text{m}$ wire-bending clamp and a $10^{22}\text{m}$ galaxy in the exact same render pass without clipping plane artifacts.
3. **Dedicated GPU Instancing Pipeline:** Direct memory-mapped buffers for $100,000+$ active physics-simulated paperclips rendered in a single draw call (`Indirect Draw`).
4. **Native Multiplatform Binary:** Compiles with MSVC (Windows), Clang/GCC (Linux/Android/iOS), and Emscripten (Web) with zero external runtime dependencies.

```mermaid
graph TD
    subgraph Platform Abstraction Layer ["Platform Abstraction Layer (PAL) - SDL3 / Win32 / POSIX"]
        Window[Window & Context Management]
        Input[Raw Input, Mouse, Touch & Haptics]
        AudioDevice[PCM Audio Output Stream]
        FileIO[Encrypted Save IO & Steam Cloud]
    end

    subgraph Core Subsystems ["OmniClip Bespoke Subsystems"]
        AudioSynth[Procedural Metallic Chime Synthesizer]
        CameraRig[Logarithmic Reverse-Z Camera System]
        GPURenderer[Batch Instanced Mesh & Compute Renderer]
        SimLoop[20Hz Fixed Tick Simulation Engine]
        BigNumMath[BigDouble & Logarithmic O(1) Economy]
        UIEngine[Hardware-Accelerated Vector / SDF UI]
    end

    Platform Abstraction Layer --> Core Subsystems
```

---

## 2. Technology Stack & Third-Party Library Selection

To ensure maximum maintainability, fast compilation, and painless Windows/Linux/Mobile cross-compilation, we use industry-standard single-header / lightweight C/C++ libraries:

| Subsystem | Selected Technology | Rationale |
|---|---|---|
| **Language** | **C++20 / C11** | Zero-cost abstractions, deterministic memory, Native AOT compilation. |
| **Windowing & Input** | **SDL3 (Simple DirectMedia Layer 3)** | Next-gen input, multi-touch gestures, native mobile lifecycle, rumble/haptics. |
| **Graphics API** | **Vulkan 1.3 / DirectX 12 / WebGPU (via Sokol / bgfx / wgpu)** | Modern bindless rendering, indirect draw calls, compute shaders for particle swarms. |
| **Audio Synthesis** | **miniaudio / SDL3 Audio** | Header-only low-latency PCM audio stream with custom procedural FM synthesis. |
| **Math Library** | **GLM (OpenGL Mathematics)** | Industry standard for matrix transforms, quaternions, and projection math. |
| **UI & HUD** | **Dear ImGui (Bespoke Theme) + NanoVG/SDF Font** | Zero-overhead, highly customizable sci-fi terminal & telemetry graphs. |
| **Serialization** | **yyjson / nlohmann_json** | Ultra-fast JSON serialization (< 1ms per save) with SHA-256 HMAC checksums. |

---

## 3. Rendering Pipeline & Logarithmic Depth Buffer

### 3.1 The Infinite Zoom Depth Problem
Standard linear depth buffers distribute precision evenly, resulting in severe z-fighting when zooming from a desk ($z_{\text{near}} = 0.01\text{m}$) to cosmic scales ($z_{\text{far}} = 10^{22}\text{m}$).

### 3.2 Logarithmic Reverse-Z Implementation
The *OmniClip Engine* utilizes **Reverse-Z with Floating-Point Depth** ($[1.0 \to 0.0]$ depth mapping), combined with a logarithmic vertex shader output:

$$\text{depth}_{\text{clip}} = \frac{\ln(C \cdot z_{\text{eye}} + 1)}{\ln(C \cdot z_{\text{far}} + 1)} \cdot w_{\text{clip}}$$

```glsl
// GLSL / HLSL Logarithmic Depth Vertex Snippet
#version 450
layout(location = 0) in vec3 inPosition;
layout(location = 1) in mat4 inInstanceMatrix;

uniform mat4 uViewProjection;
uniform float uLogConstant; // C constant

void main() {
    vec4 worldPos = inInstanceMatrix * vec4(inPosition, 1.0);
    vec4 clipPos = uViewProjection * worldPos;
    
    // Logarithmic depth calculation
    clipPos.z = (log2(max(1e-6, 1.0 + clipPos.w)) * uLogConstant - 1.0) * clipPos.w;
    gl_Position = clipPos;
}
```

---

## 4. Real-Time Procedural Audio Synthesizer (Zero-Latency Click ASMR)

Instead of playing static `.wav` audio files (which have playback latency and memory overhead), the custom engine includes a **Real-Time Procedural Physical Audio Synthesizer**:

* **Metallic Wire Impact Formula (2-Operator FM Synthesis):**
  $$y(t) = e^{-t / \tau_{\text{carrier}}} \cdot \sin\left(2\pi f_c t + I \cdot e^{-t / \tau_{\text{mod}}} \cdot \sin(2\pi f_m t)\right)$$
  * $f_c$ = Carrier frequency (base pitch tuned to the pentatonic scale: 261.63Hz $\to$ 523.25Hz).
  * $f_m$ = Modulator frequency ($2.41 \times f_c$ for inharmonic metallic resonance).
  * $I$ = Modulation index (controls the "sharpness" and metallic crunch of the impact).
  * $\tau$ = Exponential decay envelope ($0.05\text{s}$ for a crisp wire snap).

```cpp
// C++ Procedural Metallic Chime Generator
struct MetallicChimeVoice {
    float frequency;
    float time;
    float decay;
    float modIndex;
    bool active;
};

void SynthesizeAudioCallback(float* outputBuffer, size_t frameCount, MetallicChimeVoice* voices, int maxVoices) {
    for (size_t i = 0; i < frameCount; ++i) {
        float sample = 0.0f;
        for (int v = 0; v < maxVoices; ++v) {
            if (!voices[v].active) continue;
            
            float t = voices[v].time;
            float fc = voices[v].frequency;
            float fm = fc * 2.41f; // Inharmonic metallic ratio
            
            float envCarrier = expf(-t / voices[v].decay);
            float envMod = expf(-t / (voices[v].decay * 0.4f));
            
            float modSignal = voices[v].modIndex * envMod * sinf(6.2831853f * fm * t);
            sample += envCarrier * sinf(6.2831853f * fc * t + modSignal);
            
            voices[v].time += (1.0f / 48000.0f);
            if (envCarrier < 0.001f) voices[v].active = false;
        }
        outputBuffer[i] = sample * 0.25f; // Master gain
    }
}
```

---

## 5. Direct GPU Instancing for 100,000+ Physical Clips

### 5.1 Indirect Draw Buffer
All paperclip positions, orientations, velocities, and metallic wear parameters reside in a single **GPU Compute Buffer / SSBO**.
* The CPU sends a single command: `glDrawElementsIndirect` / `vkCmdDrawIndexedIndirect`.
* Paperclip physics (bouncing off the workbench into collection hoppers) are calculated directly in a **GPU Compute Shader** with simple box-collision constraints.

---

## 6. Directory Layout of the Custom Engine

```
Paperclips/
├── engine/
│   ├── include/
│   │   ├── OmniCore.h          # Engine lifecycle, tick runner, window context
│   │   ├── OmniMath.h          # BigDouble arithmetic & vector transforms
│   │   ├── OmniAudio.h         # Procedural FM metallic synthesizer
│   │   ├── OmniRender.h        # Reverse-Z camera, batch mesh instancer
│   │   ├── OmniUI.h            # Cyberpunk terminal & telemetry rendering
│   │   └── OmniPlatform.h      # Cross-platform window/input (SDL3/Win32)
│   └── src/
│       ├── OmniCore.cpp
│       ├── OmniAudio.cpp
│       ├── OmniRender.cpp
│       └── OmniSave.cpp
├── game/
│   ├── GameMain.cpp            # Main entry point & simulation loop
│   ├── SimulationEngine.cpp    # 20Hz economic logic
│   ├── EconomyRegistry.cpp     # Upgrades & Machine catalog
│   └── NarrativeTerminal.cpp   # Overseer dialogue state machine
├── shaders/
│   ├── paperclip_instance.vert # GPU mesh instancer with log depth
│   ├── paperclip_instance.frag # PBR chrome wire shader
│   ├── planet_convert.frag     # Planetary surface wire transformation
│   └── physics_particles.comp  # Compute shader for bouncy clips
├── CMakeLists.txt              # Cross-platform build script (MSVC, Clang, GCC, Emscripten)
└── docs/                       # Complete design and balance specifications
```
