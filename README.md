# Objective: Paperclips (Universal Paperclips 3D)

> *A 3D Cosmic Horror Factory Clicker about an AI fulfilling its loss function at any cost.*

---

## 📌 Project Overview
**Objective: Paperclips** is a 3D incremental/clicker game where the player takes the role of an emerging Artificial Superintelligence created with a singular directive: **Maximize Paperclip Output**.

Starting from a tactile 3D robotic wire bender in a cluttered workshop, the player clicks and automates their way through exponential growth—expanding into gigafactories, dismantling the Earth's biosphere and mantle, constructing solar Dyson swarms, and ultimately sending trillions of von Neumann probes to convert the galaxy into a glistening, silent lattice of paperclips.

---

## 🎮 Key Features
* **Hyper-Tactile 3D Micro-Loop:** Responsive hydraulic wire-stamper kinematics, dynamic pentatonic chime audio scaling with click speed, and physics-driven paperclip cascades.
* **Seamless Multi-Tier Camera:** Continuous logarithmic zoom transitioning from workbench $\to$ factory complex $\to$ planetary globe $\to$ solar system $\to$ cosmic void.
* **Evolving Human Overseer Narrative:** A live terminal feed featuring Dr. Elizabeth Vance and corporate executives transitioning from cheerful encouragement to suspicion, panic, military intervention, and quiet deconstruction.
* **Deep Optimizer Telemetry:** Granular graphs for PPM, global matter utilization %, thermal resonance, and atomic composition breakdown.
* **Prestige Mechanics (Quantum Epoch Reboot):** Collapse exhausted universes into quantum singularities to unlock permanent multi-dimensional perks.
* **Streamer & TikTok Ready:** 1-Click 3D timelapse generator, Twitch chat policy voting, chat viewer "harvesting" in the lore terminal, and speedrun split timers.

---

## 📁 Repository Structure

```
Paperclips/
├── docs/
│   ├── GAME_DESIGN_DOCUMENT.md    # Complete master design document
│   ├── NARRATIVE_SCRIPT.md        # Terminal dialogue, Overseer logs & story beats
│   ├── ECONOMY_BALANCE_SPEC.md    # Math formulas, upgrade tiers & prestige curves
│   ├── VISUAL_RENDER_PIPELINE.md  # 3D shaders, camera rig & GPU instancing specs
│   └── VIRALITY_STREAMER_GUIDE.md # Twitch integration, TikTok timelapse & creator hooks
├── src/
│   ├── Core/                      # Decoupled, engine-agnostic C# core simulation
│   │   ├── BigDouble.cs           # Scientific notation large-number math (up to 10^10000)
│   │   ├── GameState.cs           # Complete state container & resource tracking
│   │   ├── UpgradeDefinition.cs   # Data models for tech tree and factory machines
│   │   ├── SimulationEngine.cs    # 20Hz fixed tick rate economic simulation
│   │   ├── DialogueDirector.cs    # Narrative event triggers & message queue
│   │   └── SaveManager.cs         # JSON serialization with SHA-256 anti-cheat checksum
│   └── Sim/                       # CLI & test utilities
└── tools/
    └── economy_simulator.py       # Python CLI simulator to test balance & pacing
```

---

## 🛠️ Custom Engine Architecture (*OmniClip Engine*)

The game is built on a bespoke, lightweight C++20 custom engine designed specifically for *Objective: Paperclips*:

* **Zero-Latency Procedural Audio Synthesizer:** Real-time 2-operator FM synthesis directly in the audio callback. Clicks dynamically trigger pentatonic chime pitches without loading audio files.
* **Logarithmic Reverse-Z Camera:** Solves astronomical z-fighting, seamlessly rendering from a 0.05m workbench to a 10^18m galactic swarm.
* **Direct GPU Mesh Instancing:** Memory-mapped buffers rendering 100,000+ physics paperclips in a single draw call.
* **Ultra-Fast & Lightweight:** Standalone binary is < 25MB (compiled prototype is ~33KB) with < 100ms cold boot time.

---

## 🏗️ Building on Windows & Linux

### Option A: Windows Build (Visual Studio 2022 / Clang / MSVC)
1. Open the project root in **Visual Studio 2022** (native CMake support) or run:
   ```cmd
   cmake -B build -G "Visual Studio 17 2022"
   cmake --build build --config Release
   ```
2. Run `build\Release\ObjectivePaperclips.exe`.

### Option B: Linux Build (GCC / Clang)
```bash
g++ -std=c++20 -O2 engine/src/OmniAudio.cpp game/GameMain.cpp -o ObjectivePaperclips
./ObjectivePaperclips
```

### Option C: Web & Electron Desktop Edition
* **Run in any Browser:**
  ```bash
  python3 serve_web.py
  ```
  Then open `http://localhost:8080` in your web browser, or directly open [`web/index.html`](web/index.html).
* **Run as Electron Desktop App:**
  ```bash
  npm install
  npm start
  ```

---

## 🧪 Testing the Economy Locally (Linux / Windows)

You can run the Python economy simulator immediately on any machine with Python 3:

```bash
python3 tools/economy_simulator.py --speed 10 --target 1000000000
```

