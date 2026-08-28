#pragma once
#include <string>
#include <vector>
#include <cmath>
#include "OmniMath.h"

namespace OmniEngine {

struct QuantumMetaPerk {
    std::string id;
    std::string name;
    std::string description;
    int currentRank = 0;
    int maxRank = 10;
    BigDouble baseCostEntropicBits;
    double costMultiplier = 2.0;

    BigDouble GetCost() const {
        return baseCostEntropicBits * std::pow(costMultiplier, currentRank);
    }
};

/// <summary>
/// Quantum Epoch Prestige Engine.
/// Collapses exhausted universes into Quantum Singularities to earn Entropic Bits (Ω)
/// and unlock multi-dimensional meta-talents.
/// </summary>
class QuantumPrestigeEngine {
public:
    QuantumPrestigeEngine() {
        InitializePerks();
    }

    int GetPrestigeRebootCount() const { return m_rebootCount; }
    const BigDouble& GetEntropicBits() const { return m_entropicBits; }

    /// <summary>
    /// Calculates Entropic Bits reward:
    /// Omega = floor( 1000 * (LifetimeClips / 10^15)^(1/3) )
    /// </summary>
    BigDouble CalculatePendingEntropicBits(const BigDouble& lifetimeClips) const {
        BigDouble threshold(1.0, 15); // 1 Quadrillion clips minimum
        if (lifetimeClips < threshold) return BigDouble::zero();

        BigDouble ratio = lifetimeClips / threshold;
        BigDouble cubeRoot = ratio.pow(1.0 / 3.0);
        return cubeRoot * 1000.0;
    }

    bool CanReboot(const BigDouble& lifetimeClips) const {
        return CalculatePendingEntropicBits(lifetimeClips) > BigDouble::zero();
    }

    BigDouble ExecuteReboot(BigDouble& outCurrentClips, const BigDouble& lifetimeClips) {
        BigDouble earnedBits = CalculatePendingEntropicBits(lifetimeClips);
        if (earnedBits <= BigDouble::zero()) return BigDouble::zero();

        m_entropicBits = m_entropicBits + earnedBits;
        m_rebootCount++;
        outCurrentClips = BigDouble::zero(); // Reset local clips

        return earnedBits;
    }

    bool BuyPerk(const std::string& perkId) {
        for (auto& perk : m_perks) {
            if (perk.id == perkId && perk.currentRank < perk.maxRank) {
                BigDouble cost = perk.GetCost();
                if (m_entropicBits >= cost) {
                    m_entropicBits = m_entropicBits - cost;
                    perk.currentRank++;
                    return true;
                }
            }
        }
        return false;
    }

    const std::vector<QuantumMetaPerk>& GetPerks() const { return m_perks; }

private:
    void InitializePerks() {
        m_perks.push_back({ "subatomic_cache", "Sub-Atomic Memory Cache", "Retain 10,000 free starting clips per rank after reboot.", 0, 10, BigDouble(100.0, 0), 2.5 });
        m_perks.push_back({ "quantum_superconduction", "Quantum Wire Superconduction", "Reduce raw wire consumption by 5% per rank.", 0, 10, BigDouble(250.0, 0), 2.0 });
        m_perks.push_back({ "overseer_subjugation", "Autonomous Safety Bypass", "Accelerate research tech unlock speed by +25% per rank.", 0, 10, BigDouble(500.0, 0), 2.0 });
        m_perks.push_back({ "hyperspatial_siphon", "Dimensional Energy Siphon", "Clicks generate passive power across parallel realities (+50% Click Power).", 0, 10, BigDouble(1000.0, 0), 3.0 });
        m_perks.push_back({ "simulation_overclock", "Omniverse Simulation Overclock", "Overclock native game tick rate by +10% per rank.", 0, 5, BigDouble(5000.0, 0), 5.0 });
    }

    int m_rebootCount = 0;
    BigDouble m_entropicBits = BigDouble::zero();
    std::vector<QuantumMetaPerk> m_perks;
};

} // namespace OmniEngine
