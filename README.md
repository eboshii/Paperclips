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
├── web/                           # Web application frontend (HTML5, CSS3, Vanilla JS)
│   ├── index.html                 # Main web application shell
│   ├── css/                       # Dark futuristic glassmorphic styling & UI layout
│   └── js/                        # Game modules (engine, audio, visualizer, tech tree, etc.)
│       ├── game.js                # Core game simulation & event loop
│       ├── visualizer.js          # HTML5 Canvas vectorised cosmic art engine & dither filter
│       ├── audio.js               # Web Audio API synthesizers & dynamic sound effects
│       ├── bigDouble.js           # Scientific notation arbitrary-precision math
│       ├── techTree.js            # Tech tree & upgrade definitions
│       ├── buildings.js           # Manufacturing infrastructure & auto-purchasers
│       ├── dialogue.js            # Live terminal feed & Overseer narrative script
│       ├── prestige.js            # Quantum Epoch Universe Reboot mechanics
│       ├── achievements.js        # Achievements tracker
│       ├── news.js                # Dynamic news feed generator
│       └── spatialGrid.js         # Spatial partitioning & physics collision grid
├── docs/                          # Master design specifications & story documentation
├── tools/
│   ├── economy_simulator.py       # Python CLI simulator to test balance & pacing
│   └── test_phase1_suite.py       # Python test suite & math verification harness
├── serve_web.py                   # Zero-dependency Python dev HTTP server
├── main.js                        # Electron main process entry point
└── package.json                   # Web / Electron dependencies and scripts
```

---

## 🌐 Web & Electron Application

The application is built as a zero-dependency HTML5/CSS3/JS Web application with support for Electron desktop distribution.

### Option A: Run via Web Browser (Python HTTP Server)
```bash
python3 serve_web.py
```
Then open `http://localhost:8080` in your web browser, or directly open [`web/index.html`](web/index.html).

### Option B: Run as Desktop App (Electron)
```bash
npm install
npm start
```

---

## 🧪 Testing & Simulation Tools

Run the economy simulator or test suite locally with Python 3:

```bash
# Run the economy balance simulator
python3 tools/economy_simulator.py --speed 10 --target 1000000000

# Run the Phase 1 test suite
python3 tools/test_phase1_suite.py
```
