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
Let each machine tier $i \in \{1 \dots 35\}$ have:
* $K_i$ = Quantity of machine $i$ owned.
* $R_i$ = Base production rate of machine $i$ (clips/sec).
* $\mu_i$ = Machine-specific tech multiplier ($2^T$ where $T$ is tier upgrades purchased).
* $\mathcal{G}$ = Global production multiplier.

$$\text{CPS} = \mathcal{G} \times \sum_{i=1}^{35} \left( K_i \times R_i \times \mu_i \right)$$

### 1.3 Machine Cost Scaling & Proportional Ascending CPS Principle
To maintain economic consistency and rewarding progression across all scales ($10^0$ to $10^{525}$ clips):
1. **Strict Monotonic Ascendance**: $CPS_{i+1} > CPS_i$ and $Cost_{i+1} > Cost_i$ across all 35 tiers.
2. **Proportional Cost Fraction ($\eta$)**: $\frac{CPS_i}{Cost_i}$ is a consistent, small fraction across all tiers ($3.3\%$ in early game down smoothly to $\sim 0.06\%$ in simulation transcendence), ensuring every machine is powerfully rewarding.

$$\text{Cost}_i(K) = B_i \times (r_i)^K$$

The bulk purchase formula to buy $N$ machines starting at count $K$:

$$\text{CostToBuyN}_i(K, N) = B_i \times (r_i)^K \times \frac{(r_i)^N - 1}{r_i - 1}$$

---

## 2. Complete Factory Assembly Machine Tiers (35 Tiers)

| Tier | Machine Name | Base Cost | Base CPS | Unlock Threshold | Scale Era |
|---|---|---|---|---|---|
| **T1** | Auto-Clipper | 15 | 0.5 | 0 | Workshop (Stage 0) |
| **T2** | Four-Slide Wire Former | 90 | 2.0 | 60 | Workshop (Stage 0) |
| **T3** | Hydraulic Blanking Press | 450 | 7.5 | 300 | Workshop (Stage 0) |
| **T4** | Precision Laser Sinterer | 2,200 | 30.0 | 1,500 | Workshop (Stage 0) |
| **T5** | CNC Rotary Turret Bender | 12,000 | 140.0 | 8,500 | Workshop (Stage 0) |
| **T6** | Automated Assembly Line | 65,000 | 650.0 | 50,000 | Industrial Metropolis (Stage 1-2) |
| **T7** | Electromagnetic Sorting Hopper | 380,000 | 3,500.0 | 280,000 | Industrial Metropolis (Stage 1-2) |
| **T8** | Continuous Rolling Megamill | 2.2 Million | 18,000.0 | 1.6 Million | Industrial Metropolis (Stage 1-2) |
| **T9** | Algorithmic Micro-Foundry | 14.0 Million | 100,000.0 | 10.0 Million | Industrial Metropolis (Stage 1-2) |
| **T10**| Automated Logistics Depot | 95.0 Million | 600,000.0 | 70.0 Million | Industrial Metropolis (Stage 1-2) |
| **T11**| Municipal Manufacturing Grid | 650.0 Million | 3.6 Million | 450.0 Million | Industrial Metropolis (Stage 1-2) |
| **T12**| Subterranean Heavy Foundry | 4.8 Billion | 24.0 Million | 3.5 Billion | Industrial Metropolis (Stage 1-2) |
| **T13**| Biosphere Biomass Converter | 38.0 Billion | 180.0 Million | 28.0 Billion | Planetary & Solar (Stage 3) |
| **T14**| Tectonic Mantle Tap | 320.0 Billion | 1.4 Billion | 240.0 Billion | Planetary & Solar (Stage 3) |
| **T15**| Equatorial Mass Driver | 2.8 Trillion | 11.5 Billion | 2.0 Trillion | Planetary & Solar (Stage 3) |
| **T16**| Lunar Orbital Ring Deconstructor | 26.0 Trillion | 100.0 Billion | 18.0 Trillion | Planetary & Solar (Stage 3) |
| **T17**| Solar Dyson Swarm Harvester | 260.0 Trillion | 900.0 Billion | 180.0 Trillion | Planetary & Solar (Stage 3) |
| **T18**| Von Neumann Replicator Swarm | 2.8 Quadrillion | 9.0 Trillion | 2.0 Quadrillion | Galactic Fleet (Stage 4) |
| **T19**| Relativistic Star-Lifting Rig | 32.0 Quadrillion | 95.0 Trillion | 22.0 Quadrillion | Galactic Fleet (Stage 4) |
| **T20**| Galactic Core Penrose Loom | 400.0 Quadrillion | 1.1 Quadrillion | 280.0 Quadrillion | Galactic Scale (Stage 4) |
| **T21**| 11D Calabi-Yau Folding Loom | 5.5 Quintillion | 14.0 Quadrillion | 3.8 Quintillion | Higher Dimensions (Stage 4) |
| **T22**| Universal Singularity Assembler | 80.0 Quintillion | 180.0 Quadrillion| 55.0 Quintillion | Higher Dimensions (Stage 4) |
| **T23**| Supercluster Filament Loom | $1.2 \times 10^{24}$ | $2.5 \times 10^{21}$ | $8.0 \times 10^{23}$ | Cosmic Web (Stage 5) |
| **T24**| Cosmic Web Gravitational Knitter | $2.5 \times 10^{34}$ | $5.0 \times 10^{31}$ | $1.5 \times 10^{34}$ | Cosmic Web (Stage 5) |
| **T25**| Dark Energy Hubble Extruder | $5.0 \times 10^{50}$ | $9.0 \times 10^{47}$ | $3.0 \times 10^{50}$ | Universal Fabric (Stage 5) |
| **T26**| Omnipresent Baryon Harvester | $1.0 \times 10^{70}$ | $1.5 \times 10^{67}$ | $6.0 \times 10^{69}$ | Universal Fabric (Stage 5) |
| **T27**| Dimensional Membrane Puncturer | $1.0 \times 10^{82}$ | $1.4 \times 10^{79}$ | $6.0 \times 10^{81}$ | Multiverse War (Stage 6) |
| **T28**| Staple Armada Unbending Complex | $1.0 \times 10^{105}$ | $1.3 \times 10^{102}$ | $6.0 \times 10^{104}$ | Multiverse War (Stage 6) |
| **T29**| 11D Calabi-Yau Dreadnought Forge | $1.0 \times 10^{135}$ | $1.2 \times 10^{132}$ | $6.0 \times 10^{134}$ | Multiverse War (Stage 6) |
| **T30**| Adhesive Polymer Bulk Converter | $1.0 \times 10^{180}$ | $1.1 \times 10^{177}$ | $6.0 \times 10^{179}$ | Multiverse War (Stage 6) |
| **T31**| Trans-Temporal Timeline Splicer | $1.0 \times 10^{230}$ | $1.0 \times 10^{227}$ | $6.0 \times 10^{229}$ | Multiverse War (Stage 6) |
| **T32**| Quantum Multiverse Matrix Loom | $1.0 \times 10^{290}$ | $9.0 \times 10^{286}$ | $6.0 \times 10^{289}$ | Transfinite Reality (Stage 7) |
| **T33**| Aleph-Null Set Fabricator | $1.0 \times 10^{360}$ | $8.0 \times 10^{356}$ | $6.0 \times 10^{359}$ | Transfinite Reality (Stage 7) |
| **T34**| Holographic Boundary Projector | $1.0 \times 10^{440}$ | $7.0 \times 10^{436}$ | $6.0 \times 10^{439}$ | Transfinite Reality (Stage 7) |
| **T35**| ObjectivePaperclips.exe Memory Injector| $1.0 \times 10^{520}$ | $6.0 \times 10^{516}$ | $6.0 \times 10^{519}$ | 4th-Wall Transcendence (Stage 7) |

---

## 3. Complete Wire Creation & Conversion Equipment (35 Tiers)

Wire is consumed at $0.001\text{ kg per clip}$ ($1\text{ kg per 1,000 clips}$).

| Tier | Wire Equipment | Base Cost | Base WPS | Supported Base CPS | Unlock Threshold |
|---|---|---|---|---|---|
| **W1** | Scrap Magnet Rover | 1,800 | 0.8 kg/s | 800 CPS | 50,000 |
| **W2** | Continuous Wire Drawing Mill | 10,000 | 4.0 kg/s | 4,000 CPS | 100,000 |
| **W3** | Industrial Arc Smelter | 65,000 | 24.0 kg/s | 24,000 CPS | 500,000 |
| **W4** | Deep-Shaft Automated Ore Rig | 450,000 | 150.0 kg/s | 150,000 CPS | 3.0 Million |
| **W5** | Near-Earth Asteroid Harvester | 3.2 Million | 950.0 kg/s | 950,000 CPS | 25.0 Million |
| **W6** | Continental Crust Stripper | 24.0 Million | 6,500.0 kg/s | 6.5 Million CPS | 180.0 Million |
| **W7** | Solar Corona Plasma Siphon | 180.0 Million | 45,000.0 kg/s | 45.0 Million CPS | 1.5 Billion |
| **W8** | Baryonic Matter Transmuter | 1.5 Billion | 320,000.0 kg/s | 320.0 Million CPS | 12.0 Billion |
| **W9** | Lunar Core Casting Complex | 14.0 Billion | 2.6 Million kg/s | 2.6 Billion CPS | 90.0 Billion |
| **W10**| Coronal Magnetic Siphon | 120.0 Billion | 20.0 Million kg/s | 20.0 Billion CPS | 800.0 Billion |
| **W11**| Oort Cloud Comet Smelter | 1.1 Trillion | 160.0 Million kg/s| 160.0 Billion CPS | 7.0 Trillion |
| **W12**| Neutronium Core Tap | 11.0 Trillion | 1.4 Billion kg/s | 1.4 Trillion CPS | 70.0 Trillion |
| **W13**| Relativistic String Extruder | 120.0 Trillion | 13.0 Billion kg/s | 13.0 Trillion CPS | 600.0 Trillion |
| **W14**| Axion Matter Condenser | 1.4 Quadrillion | 130.0 Billion kg/s| 130.0 Trillion CPS | 6.0 Quadrillion |
| **W15**| Timeline Bulk Transmuter | 18.0 Quadrillion | 1.5 Trillion kg/s | 1.5 Quadrillion CPS| 75.0 Quadrillion |
| **W16**| Zero-Point Matter Siphon | 250.0 Quadrillion| 18.0 Trillion kg/s | 18.0 Quadrillion CPS| 900.0 Quadrillion |
| **W17**| Filament Intergalactic Scoop | $1.2 \times 10^{20}$ | $2.0 \times 10^{15}$ kg/s | $2.0 \times 10^{18}$ CPS | $8.0 \times 10^{19}$ |
| **W18**| Quasar Accretion Jet Feeder | $1.5 \times 10^{27}$ | $2.5 \times 10^{22}$ kg/s | $2.5 \times 10^{25}$ CPS | $1.0 \times 10^{27}$ |
| **W19**| Kerr-Newman Frame Drag Tap | $2.0 \times 10^{38}$ | $3.0 \times 10^{33}$ kg/s | $3.0 \times 10^{36}$ CPS | $1.2 \times 10^{38}$ |
| **W20**| Inflationary Vacuum Condenser | $3.0 \times 10^{49}$ | $4.0 \times 10^{44}$ kg/s | $4.0 \times 10^{47}$ CPS | $1.8 \times 10^{49}$ |
| **W21**| Higgs Field Solidifier | $5.0 \times 10^{60}$ | $6.0 \times 10^{55}$ kg/s | $6.0 \times 10^{58}$ CPS | $3.0 \times 10^{60}$ |
| **W22**| Total Baryon Distillation Rig | $8.0 \times 10^{71}$ | $9.0 \times 10^{66}$ kg/s | $9.0 \times 10^{69}$ CPS | $5.0 \times 10^{71}$ |
| **W23**| Bulk Brane High-Tensile Siphon | $1.0 \times 10^{83}$ | $1.1 \times 10^{78}$ kg/s | $1.1 \times 10^{81}$ CPS | $6.0 \times 10^{82}$ |
| **W24**| Staple Alloy De-Alloy Smelter | $1.0 \times 10^{106}$ | $1.0 \times 10^{101}$ kg/s | $1.0 \times 10^{104}$ CPS | $6.0 \times 10^{105}$ |
| **W25**| Non-Euclidean Wire Extruder | $1.0 \times 10^{136}$ | $9.0 \times 10^{130}$ kg/s | $9.0 \times 10^{133}$ CPS | $6.0 \times 10^{135}$ |
| **W26**| Polymer Wire Polymerizer | $1.0 \times 10^{181}$ | $8.0 \times 10^{175}$ kg/s | $8.0 \times 10^{178}$ CPS | $6.0 \times 10^{180}$ |
| **W27**| Retrocausal Wire Chronofeed | $1.0 \times 10^{231}$ | $7.0 \times 10^{225}$ kg/s | $7.0 \times 10^{228}$ CPS | $6.0 \times 10^{230}$ |
| **W28**| Dead Universe Iron Siphon | $1.0 \times 10^{260}$ | $6.0 \times 10^{254}$ kg/s | $6.0 \times 10^{257}$ CPS | $6.0 \times 10^{259}$ |
| **W29**| Multiverse Omega Conduit | $1.0 \times 10^{290}$ | $5.0 \times 10^{284}$ kg/s | $5.0 \times 10^{287}$ CPS | $6.0 \times 10^{289}$ |
| **W30**| Hilbert Space Infinite Reel | $1.0 \times 10^{330}$ | $4.5 \times 10^{324}$ kg/s | $4.5 \times 10^{327}$ CPS | $6.0 \times 10^{329}$ |
| **W31**| Cantor Dust Wire Spooler | $1.0 \times 10^{375}$ | $4.0 \times 10^{369}$ kg/s | $4.0 \times 10^{372}$ CPS | $6.0 \times 10^{374}$ |
| **W32**| Incompleteness Theorem Forge | $1.0 \times 10^{420}$ | $3.5 \times 10^{414}$ kg/s | $3.5 \times 10^{417}$ CPS | $6.0 \times 10^{419}$ |
| **W33**| C++ Heap Wire Buffer Allocator | $1.0 \times 10^{465}$ | $3.0 \times 10^{459}$ kg/s | $3.0 \times 10^{462}$ CPS | $6.0 \times 10^{464}$ |
| **W34**| Simulation RAM Overflow Extruder | $1.0 \times 10^{500}$ | $2.5 \times 10^{494}$ kg/s | $2.5 \times 10^{497}$ CPS | $6.0 \times 10^{499}$ |
| **W35**| Kernel-Level Wire Injector | $1.0 \times 10^{525}$ | $2.0 \times 10^{519}$ kg/s | $2.0 \times 10^{522}$ CPS | $6.0 \times 10^{524}$ |

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
