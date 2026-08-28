#pragma once
#include <string>
#include <vector>
#include "OmniMath.h"

namespace OmniEngine {

struct MassMilestone {
    std::string name;
    BigDouble massKg;
    std::string description;
};

/// <summary>
/// Physical Mass Equivalency Engine.
/// Solves "Number Blindness" by anchoring astronomical numbers in tangible physical scale milestones.
/// </summary>
class PhysicalEquivalencyEngine {
public:
    PhysicalEquivalencyEngine() {
        InitializeMilestones();
    }

    std::string GetEquivalencyString(const BigDouble& lifetimeClips) const {
        // Standard paperclip mass = 1 gram = 0.001 kg
        BigDouble totalMassKg = lifetimeClips * 0.001;

        for (int i = static_cast<int>(m_milestones.size()) - 1; i >= 0; --i) {
            const auto& ms = m_milestones[i];
            if (totalMassKg >= ms.massKg) {
                BigDouble multiples = totalMassKg / ms.massKg;
                return ms.description + " (" + multiples.toShortScale(1) + "x " + ms.name + ")";
            }
        }

        return "Mass of a handful of steel wire";
    }

private:
    void InitializeMilestones() {
        m_milestones.push_back({ "Standard Automobile",      BigDouble(1.5, 3),   "Equivalent to the mass of a sedan" });
        m_milestones.push_back({ "Boeing 747 Jumbo Jet",     BigDouble(4.0, 5),   "Equivalent to the mass of a commercial jetliner" });
        m_milestones.push_back({ "Empire State Building",    BigDouble(3.65, 8),  "Equivalent to the mass of the Empire State Building" });
        m_milestones.push_back({ "Great Pyramid of Giza",    BigDouble(6.0, 9),   "Equivalent to the mass of the Great Pyramid of Giza" });
        m_milestones.push_back({ "Mount Everest",            BigDouble(1.6, 14),  "Equivalent to the total mass of Mount Everest" });
        m_milestones.push_back({ "Pacific Ocean",            BigDouble(7.1, 20),  "Equivalent to the mass of the entire Pacific Ocean" });
        m_milestones.push_back({ "The Moon",                 BigDouble(7.35, 22), "Equivalent to the total mass of the Moon" });
        m_milestones.push_back({ "Planet Earth",             BigDouble(5.97, 24), "Equivalent to the total mass of Planet Earth" });
        m_milestones.push_back({ "Planet Jupiter",           BigDouble(1.90, 27), "Equivalent to the total mass of Jupiter" });
        m_milestones.push_back({ "The Sun",                  BigDouble(1.99, 30), "Equivalent to the total mass of the Sun" });
        m_milestones.push_back({ "Milky Way Galaxy",         BigDouble(1.5, 42),  "Equivalent to the baryonic mass of the Milky Way" });
        m_milestones.push_back({ "Observable Universe",      BigDouble(1.5, 53),  "Equivalent to all baryonic matter in the Observable Universe" });
    }

    std::vector<MassMilestone> m_milestones;
};

} // namespace OmniEngine
