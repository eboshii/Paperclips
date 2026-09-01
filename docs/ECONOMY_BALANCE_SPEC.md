# Economy Balance & Mathematical Specification
# Objective: Paperclips (Universal Paperclips 3D)

---

## 1. Core Economic Formulas

### 1.1 Base Generation & Click Value
Let:
* $C_{\text{base}}$ = Base clicks per tap ($1.0$).
* $U_{\text{click}}$ = Additive click upgrades.
* $M_{\text{click}}$ = Multiplicative click bonuses (e.g. from algorithms, harmonic resonance).
* $P_{\text{epoch}}$ = Quantum Epoch Prestige rank ($0, 1, 2, \dots$).

$$\text{ClickValue} = (C_{\text{base}} + U_{\text{click}}) \times M_{\text{click}} \times (1 + 0.10 \times P_{\text{epoch}})$$

### 1.2 Automated Production (Clips Per Second - CPS)
Let each machine tier $i \in \{1 \dots N\}$ have:
* $K_i$ = Quantity of machine $i$ owned.
* $R_i$ = Base production rate of machine $i$ (clips/sec).
* $\mu_i$ = Machine-specific tech multiplier ($2^T$ where $T$ is tier upgrades purchased).
* $\mathcal{G}$ = Global production multiplier.

$$\text{CPS} = \mathcal{G} \times \sum_{i=1}^{N} \left( K_i \times R_i \times \mu_i \right)$$

### 1.3 Machine Cost Scaling & Pacing Invariant
For machine tier $i$ with base cost $B_i$ and scaling ratio $r_i$ (typically $1.15$ for early, $1.12$ for mid, $1.10$ for late, $1.08$ for cosmic):

$$\text{Cost}_i(K) = B_i \times (r_i)^K$$

The bulk purchase formula to buy $N$ machines starting at count $K$:

$$\text{CostToBuyN}_i(K, N) = B_i \times (r_i)^K \times \frac{(r_i)^N - 1}{r_i - 1}$$

**Pacing Design Requirement**:
From Mid-Game (Assembly Line, 55k+ clips) through Late and Cosmic Endgame (Singularity Assembler, 1e21 clips), the time to afford the next building tier is calibrated to be strictly $\ge 5$ minutes, monotonically increasing up to 45+ minutes per tier, even when accounting for research technology speedups.

---

## 2. Factory Assembly Machine Tiers (22 Tiers)

| Tier | Machine Name | Base Cost | Base CPS | Cost Ratio ($r$) | Unlock Threshold | Est. Pacing to Next |
|---|---|---|---|---|---|---|
| **T1** | *Auto-Clipper* | 15 | 0.5 | 1.15 | 0 | ~0.3 mins |
| **T2** | *Four-Slide Wire Former* | 95 | 1.6 | 1.15 | 60 | ~0.4 mins |
| **T3** | *Hydraulic Blanking Press* | 450 | 4.5 | 1.15 | 300 | ~0.7 mins |
| **T4** | *Precision Laser Sinterer* | 2,400 | 14.0 | 1.14 | 1,600 | ~1.4 mins |
| **T5** | *CNC Rotary Turret Bender* | 14,000 | 45.0 | 1.14 | 9,500 | ~2.6 mins |
| **T6** | *Automated Assembly Line* | 85,000 | 120.0 | 1.13 | 55,000 | **~5.0 mins** |
| **T7** | *Electromagnetic Sorting Hopper* | 550,000 | 380.0 | 1.13 | 350,000 | **~7.5 mins** |
| **T8** | *Continuous Rolling Megamill* | 3.8 Million | 1,200.0 | 1.13 | 2.5 Million | **~8.5 mins** |
| **T9** | *Algorithmic Micro-Foundry* | 26.0 Million | 4,000.0 | 1.12 | 18.0 Million | **~12.0 mins** |
| **T10**| *Automated Logistics Depot* | 180.0 Million | 14,000.0 | 1.12 | 120.0 Million | **~15.0 mins** |
| **T11**| *Municipal Manufacturing Grid* | 1.4 Billion | 48,000.0 | 1.12 | 900.0 Million | **~18.0 mins** |
| **T12**| *Subterranean Heavy Foundry* | 11.0 Billion | 180,000.0 | 1.12 | 7.5 Billion | **~22.0 mins** |
| **T13**| *Biosphere Biomass Converter* | 95.0 Billion | 700,000.0 | 1.11 | 65.0 Billion | **~25.0 mins** |
| **T14**| *Tectonic Mantle Tap* | 850.0 Billion | 2.8 Million | 1.11 | 600.0 Billion | **~28.0 mins** |
| **T15**| *Equatorial Mass Driver* | 8.0 Trillion | 12.0 Million | 1.11 | 5.5 Trillion | **~32.0 mins** |
| **T16**| *Lunar Ring Deconstructor* | 80.0 Trillion | 55.0 Million | 1.10 | 55.0 Trillion | **~36.0 mins** |
| **T17**| *Solar Dyson Swarm Harvester* | 850.0 Trillion | 260.0 Million | 1.10 | 600.0 Trillion | **~40.0 mins** |
| **T18**| *Von Neumann Replicator Swarm* | 10.0 Quadrillion | 1.2 Billion | 1.10 | 7.0 Quadrillion | **~45.0 mins** |
| **T19**| *Relativistic Star-Lifting Rig*| 140.0 Quadrillion| 6.5 Billion | 1.09 | 95.0 Quadrillion | **~50.0 mins** |
| **T20**| *Galactic Core Penrose Loom* | 2.0 Quintillion | 35.0 Billion | 1.09 | 1.4 Quintillion | **~60.0 mins** |
| **T21**| *11D Calabi-Yau Folding Loom* | 32.0 Quintillion | 180.0 Billion | 1.08 | 22.0 Quintillion | **~75.0 mins** |
| **T22**| *Universal Singularity Assembler*| 550.0 Quintillion| 1.2 Trillion | 1.08 | 380.0 Quintillion | **~90.0 mins** |

---

## 3. Wire Creation & Conversion Equipment (16 Tiers)

Wire is consumed at $0.001\text{ kg per clip}$ ($1\text{ kg per 1,000 clips}$), modified by wire waste reduction.

| Tier | Wire Equipment | Base Cost | Base WPS | Supported Base CPS | Unlock Threshold |
|---|---|---|---|---|---|
| **W1** | *Scrap Magnet Rover* | 1,800 | 0.8 kg/s | 800 CPS | 50,000 |
| **W2** | *Continuous Wire Drawing Mill* | 12,000 | 4.5 kg/s | 4,500 CPS | 100,000 |
| **W3** | *Industrial Arc Smelter* | 85,000 | 28.0 kg/s | 28,000 CPS | 500,000 |
| **W4** | *Deep-Shaft Automated Ore Rig*| 650,000 | 160.0 kg/s | 160,000 CPS | 3.0 Million |
| **W5** | *Near-Earth Asteroid Harvester*| 4.8 Million | 1,100.0 kg/s | 1.1 Million CPS | 25.0 Million |
| **W6** | *Continental Crust Stripper* | 38.0 Million | 8,500.0 kg/s | 8.5 Million CPS | 180.0 Million |
| **W7** | *Solar Corona Plasma Siphon* | 280.0 Million | 60,000.0 kg/s | 60.0 Million CPS | 1.5 Billion |
| **W8** | *Baryonic Matter Transmuter* | 2.2 Billion | 450,000.0 kg/s | 450.0 Million CPS | 12.0 Billion |
| **W9** | *Lunar Core Casting Complex* | 18.0 Billion | 3.5 Million kg/s | 3.5 Billion CPS | 90.0 Billion |
| **W10**| *Coronal Magnetic Siphon* | 160.0 Billion | 28.0 Million kg/s | 28.0 Billion CPS | 800.0 Billion |
| **W11**| *Oort Cloud Comet Smelter* | 1.5 Trillion | 220.0 Million kg/s| 220.0 Billion CPS | 7.0 Trillion |
| **W12**| *Neutronium Core Tap* | 14.0 Trillion | 1.8 Billion kg/s | 1.8 Trillion CPS | 70.0 Trillion |
| **W13**| *Relativistic String Extruder* | 120.0 Trillion | 15.0 Billion kg/s | 15.0 Trillion CPS | 600.0 Trillion |
| **W14**| *Axion Matter Condenser* | 1.2 Quadrillion | 120.0 Billion kg/s| 120.0 Trillion CPS | 6.0 Quadrillion |
| **W15**| *Timeline Bulk Transmuter* | 15.0 Quadrillion | 1.1 Trillion kg/s | 1.1 Quadrillion CPS| 75.0 Quadrillion |
| **W16**| *Zero-Point Matter Siphon* | 180.0 Quadrillion| 10.0 Trillion kg/s | 10.0 Quadrillion CPS| 900.0 Quadrillion |

---

## 4. Quantum Epoch Prestige Scaling

When resetting the simulation:
* **Entropic Bits Earned ($\Omega$):**
  $$\Omega = \left\lfloor 1000 \times \left( \frac{\text{Lifetime Clips Produced}}{10^{15}} \right)^{0.333} \right\rfloor$$
* Each Entropic Bit grants $+1\%$ passive global production and $+0.5\%$ click efficiency permanently.
* Entropic Bits can be spent in the **Quantum Archive** on meta-talents:
  1. *Sub-Atomic Cache:* Start future runs with $10,000 \times 10^{\text{Rank}}$ free clips.
  2. *Quantum Wire Superconductivity:* Machines consume $5\%$ less raw wire per rank (max $50\%$).
  3. *Autonomous Overseer Pacification:* Delays human military reaction time, granting $+20\%$ research speed.
  4. *Cosmic Entanglement:* Offline progress operates at $100\%$ efficiency (normally $50\%$).
