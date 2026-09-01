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

### 1.3 Proportional Ascending CPS Principle
To maintain economic consistency and rewarding progression:
1. **Strict Monotonic Ascendance**: $CPS_{i+1} > CPS_i$ and $Cost_{i+1} > Cost_i$ for all tiers.
2. **Proportional Cost Fraction ($\eta$)**: $\frac{CPS_i}{Cost_i}$ is a similarly small fraction across all tiers ($3.3\%$ in early game down smoothly to $0.22\%$ in cosmic endgame), corresponding to a base payback period $\tau_i = \frac{Cost_i}{CPS_i}$ of $30\text{ seconds}$ to $440\text{ seconds}$.

$$\text{Cost}_i(K) = B_i \times (r_i)^K$$

The bulk purchase formula to buy $N$ machines starting at count $K$:

$$\text{CostToBuyN}_i(K, N) = B_i \times (r_i)^K \times \frac{(r_i)^N - 1}{r_i - 1}$$

---

## 2. Factory Assembly Machine Tiers (22 Tiers)

| Tier | Machine Name | Base Cost | Base CPS | $\frac{\text{CPS}}{\text{Cost}}$ Ratio | Payback Time ($\tau$) | Unlock Threshold |
|---|---|---|---|---|---|---|
| **T1** | *Auto-Clipper* | 15 | 0.5 | 3.333% | 30.0s (0.5m) | 0 |
| **T2** | *Four-Slide Wire Former* | 90 | 2.0 | 2.222% | 45.0s (0.8m) | 60 |
| **T3** | *Hydraulic Blanking Press* | 450 | 7.5 | 1.667% | 60.0s (1.0m) | 300 |
| **T4** | *Precision Laser Sinterer* | 2,200 | 30.0 | 1.364% | 73.3s (1.2m) | 1,500 |
| **T5** | *CNC Rotary Turret Bender* | 12,000 | 140.0 | 1.167% | 85.7s (1.4m) | 8,500 |
| **T6** | *Automated Assembly Line* | 65,000 | 650.0 | 1.000% | 100.0s (1.7m) | 50,000 |
| **T7** | *Electromagnetic Sorting Hopper* | 380,000 | 3,500.0 | 0.921% | 108.6s (1.8m) | 280,000 |
| **T8** | *Continuous Rolling Megamill* | 2.2 Million | 18,000.0 | 0.818% | 122.2s (2.0m) | 1.6 Million |
| **T9** | *Algorithmic Micro-Foundry* | 14.0 Million | 100,000.0 | 0.714% | 140.0s (2.3m) | 10.0 Million |
| **T10**| *Automated Logistics Depot* | 95.0 Million | 600,000.0 | 0.632% | 158.3s (2.6m) | 70.0 Million |
| **T11**| *Municipal Manufacturing Grid* | 650.0 Million | 3.6 Million | 0.554% | 180.6s (3.0m) | 450.0 Million |
| **T12**| *Subterranean Heavy Foundry* | 4.8 Billion | 24.0 Million | 0.500% | 200.0s (3.3m) | 3.5 Billion |
| **T13**| *Biosphere Biomass Converter* | 38.0 Billion | 180.0 Million | 0.474% | 211.1s (3.5m) | 28.0 Billion |
| **T14**| *Tectonic Mantle Tap* | 320.0 Billion | 1.4 Billion | 0.438% | 228.6s (3.8m) | 240.0 Billion |
| **T15**| *Equatorial Mass Driver* | 2.8 Trillion | 11.5 Billion | 0.411% | 243.5s (4.1m) | 2.0 Trillion |
| **T16**| *Lunar Ring Deconstructor* | 26.0 Trillion | 100.0 Billion | 0.385% | 260.0s (4.3m) | 18.0 Trillion |
| **T17**| *Solar Dyson Swarm Harvester* | 260.0 Trillion | 900.0 Billion | 0.346% | 288.9s (4.8m) | 180.0 Trillion |
| **T18**| *Von Neumann Replicator Swarm* | 2.8 Quadrillion | 9.0 Trillion | 0.321% | 311.1s (5.2m) | 2.0 Quadrillion |
| **T19**| *Relativistic Star-Lifting Rig*| 32.0 Quadrillion| 95.0 Trillion | 0.297% | 336.8s (5.6m) | 22.0 Quadrillion |
| **T20**| *Galactic Core Penrose Loom* | 400.0 Quadrillion| 1.1 Quadrillion | 0.275% | 363.6s (6.1m) | 280.0 Quadrillion |
| **T21**| *11D Calabi-Yau Folding Loom* | 5.5 Quintillion | 14.0 Quadrillion | 0.255% | 392.9s (6.5m) | 3.8 Quintillion |
| **T22**| *Universal Singularity Assembler*| 80.0 Quintillion | 180.0 Quadrillion| 0.225% | 444.4s (7.4m) | 55.0 Quintillion |

---

## 3. Wire Creation & Conversion Equipment (16 Tiers)

Wire is consumed at $0.001\text{ kg per clip}$ ($1\text{ kg per 1,000 clips}$).

| Tier | Wire Equipment | Base Cost | Base WPS | Supported Base CPS | $\frac{\text{WPS}}{\text{Cost}}$ Ratio | Unlock Threshold |
|---|---|---|---|---|---|---|
| **W1** | *Scrap Magnet Rover* | 1,800 | 0.8 kg/s | 800 CPS | $4.44 \times 10^{-4}$ | 50,000 |
| **W2** | *Continuous Wire Drawing Mill* | 10,000 | 4.0 kg/s | 4,000 CPS | $4.00 \times 10^{-4}$ | 100,000 |
| **W3** | *Industrial Arc Smelter* | 65,000 | 24.0 kg/s | 24,000 CPS | $3.69 \times 10^{-4}$ | 500,000 |
| **W4** | *Deep-Shaft Automated Ore Rig*| 450,000 | 150.0 kg/s | 150,000 CPS | $3.33 \times 10^{-4}$ | 3.0 Million |
| **W5** | *Near-Earth Asteroid Harvester*| 3.2 Million | 950.0 kg/s | 950,000 CPS | $2.97 \times 10^{-4}$ | 25.0 Million |
| **W6** | *Continental Crust Stripper* | 24.0 Million | 6,500.0 kg/s | 6.5 Million CPS | $2.71 \times 10^{-4}$ | 180.0 Million |
| **W7** | *Solar Corona Plasma Siphon* | 180.0 Million | 45,000.0 kg/s | 45.0 Million CPS | $2.50 \times 10^{-4}$ | 1.5 Billion |
| **W8** | *Baryonic Matter Transmuter* | 1.5 Billion | 320,000.0 kg/s | 320.0 Million CPS | $2.13 \times 10^{-4}$ | 12.0 Billion |
| **W9** | *Lunar Core Casting Complex* | 14.0 Billion | 2.6 Million kg/s | 2.6 Billion CPS | $1.86 \times 10^{-4}$ | 90.0 Billion |
| **W10**| *Coronal Magnetic Siphon* | 120.0 Billion | 20.0 Million kg/s | 20.0 Billion CPS | $1.67 \times 10^{-4}$ | 800.0 Billion |
| **W11**| *Oort Cloud Comet Smelter* | 1.1 Trillion | 160.0 Million kg/s| 160.0 Billion CPS | $1.45 \times 10^{-4}$ | 7.0 Trillion |
| **W12**| *Neutronium Core Tap* | 11.0 Trillion | 1.4 Billion kg/s | 1.4 Trillion CPS | $1.27 \times 10^{-4}$ | 70.0 Trillion |
| **W13**| *Relativistic String Extruder* | 120.0 Trillion | 13.0 Billion kg/s | 13.0 Trillion CPS | $1.08 \times 10^{-4}$ | 600.0 Trillion |
| **W14**| *Axion Matter Condenser* | 1.4 Quadrillion | 130.0 Billion kg/s| 130.0 Trillion CPS | $9.29 \times 10^{-5}$ | 6.0 Quadrillion |
| **W15**| *Timeline Bulk Transmuter* | 18.0 Quadrillion | 1.5 Trillion kg/s | 1.5 Quadrillion CPS| $8.33 \times 10^{-5}$ | 75.0 Quadrillion |
| **W16**| *Zero-Point Matter Siphon* | 250.0 Quadrillion| 18.0 Trillion kg/s | 18.0 Quadrillion CPS| $7.20 \times 10^{-5}$ | 900.0 Quadrillion |

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
