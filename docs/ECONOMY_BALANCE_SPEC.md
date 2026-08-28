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

### 1.3 Machine Cost Scaling
For machine tier $i$ with base cost $B_i$ and scaling ratio $r_i$ (typically $1.15$):

$$\text{Cost}_i(K) = B_i \times (r_i)^K$$

The bulk purchase formula to buy $N$ machines starting at count $K$:

$$\text{CostToBuyN}_i(K, N) = B_i \times (r_i)^K \times \frac{(r_i)^N - 1}{r_i - 1}$$

---

## 2. Machine Tiers & Progression Table

| Tier | Machine Name | Base Cost (Clips) | Base CPS | Cost Ratio ($r$) | Unlock Requirement |
|---|---|---|---|---|---|
| **T1** | *Manual Wire Puller* | 15 | 0.5 | 1.15 | Start |
| **T2** | *Electric Auto-Clipper* | 100 | 4.0 | 1.15 | 50 Clips |
| **T3** | *Pneumatic Multi-Stamper* | 1,100 | 32.0 | 1.14 | 500 Clips |
| **T4** | *Laser Sintering Gantry* | 12,000 | 260.0 | 1.14 | 10,000 Clips |
| **T5** | *Industrial Megamill* | 130,000 | 1,400.0 | 1.13 | 100,000 Clips |
| **T6** | *Algorithmic Supply Foundry*| 1,400,000 | 7,800.0 | 1.13 | 1,000,000 Clips |
| **T7** | *Bio-Matter Converter* | 20,000,000 | 44,000.0 | 1.12 | 10M Clips + "Deconstruct" |
| **T8** | *Mantle Borehole Harvester*| 330,000,000 | 260,000.0 | 1.12 | 100M Clips |
| **T9** | *Orbital Railgun Assembler*| 5.1 Billion | 1,600,000.0 | 1.11 | 1 Billion Clips |
| **T10**| *Lunar Ring Deconstructor* | 75.0 Billion | 10,000,000.0| 1.11 | 20 Billion Clips |
| **T11**| *Dyson Solar Harvester* | 1.2 Trillion | 65,000,000.0| 1.10 | 500 Billion Clips |
| **T12**| *Von Neumann Probe Swarm* | 18.0 Trillion | 420,000,000.0| 1.10 | 5 Trillion Clips |
| **T13**| *Relativistic Star Strip-Miner*| 300.0 Trillion | 2.8 Billion | 1.09 | 100 Trillion Clips |
| **T14**| *Galactic Core Penrose Engine*| 5.0 Quadrillion| 20.0 Billion | 1.09 | 2 Quadrillion Clips |
| **T15**| *Universal Singularity Weaver*| 100 Quadrillion| 150.0 Billion| 1.08 | 50 Quadrillion Clips |

---

## 3. Quantum Epoch Prestige Scaling

When resetting the simulation:
* **Entropic Bits Earned ($\Omega$):**
  $$\Omega = \left\lfloor 1000 \times \left( \frac{\text{Lifetime Clips Produced}}{10^{15}} \right)^{0.333} \right\rfloor$$
* Each Entropic Bit grants $+1\%$ passive global production and $+0.5\%$ click efficiency permanently.
* Entropic Bits can be spent in the **Quantum Archive** on meta-talents:
  1. *Sub-Atomic Cache:* Start future runs with $10,000 \times 10^{\text{Rank}}$ free clips.
  2. *Quantum Wire Superconductivity:* Machines consume $5\%$ less raw wire per rank (max $50\%$).
  3. *Autonomous Overseer Pacification:* Delays human military reaction time, granting $+20\%$ research speed.
  4. *Cosmic Entanglement:* Offline progress operates at $100\%$ efficiency (normally $50\%$).
