#pragma once
#include <string>
#include <vector>
#include <iostream>
#include <iomanip>
#include "OmniMath.h"
#include "OmniOfflineTimeWarp.h"

namespace OmniEngine {

struct DailyDirective {
    std::string id;
    std::string title;
    std::string effectDescription;
};

/// <summary>
/// The "Morning Coffee" Offline Quantum Synthesis Summary.
/// Greets players with a comprehensive, rewarding debrief of offline earnings,
/// completed relativistic expeditions, and a choice of Daily AI Directive.
/// </summary>
class OfflineSummaryUI {
public:
    static void DisplayMorningDebrief(const OfflineProgressReport& report, const std::vector<std::string>& expeditionAlerts) {
        int hours = static_cast<int>(report.offlineSecondsCalculated / 3600.0);
        int mins = static_cast<int>(report.offlineSecondsCalculated / 60.0) % 60;
        int secs = static_cast<int>(report.offlineSecondsCalculated) % 60;

        std::cout << "\n+=============================================================================+\n";
        std::cout << "| [MORNING COFFEE OFFLINE SYNTHESIS REPORT] - Away for: " 
                  << hours << "h " << mins << "m " << secs << "s"
                  << std::setw(23) << " |\n";
        std::cout << "+=============================================================================+\n";

        if (report.validation == ClockValidationResult::RollbackDetected) {
            std::cout << "| [WARNING]: System clock rollback detected! Offline progress safely clamped. |\n";
        } else if (report.validation == ClockValidationResult::SuspiciousForwardLeap) {
            std::cout << "| [NOTE]: Long-range temporal leap (>30 days). Capped to 30 days max.         |\n";
        }

        std::cout << "|  - Paperclips Manufactured:    +" << std::left << std::setw(42) << report.clipsEarned.toShortScale() << " |\n";
        std::cout << "|  - Wire Consumed:              " << std::left << std::setw(43) << (report.wireConsumedKg.toShortScale() + " kg") << " |\n";
        std::cout << "|  - Algorithmic Profits Earned: +" << std::left << std::setw(42) << ("$" + report.fundsEarnedUsd.toShortScale()) << " |\n";
        std::cout << "|  - Wire Supply Logistics:      " << (report.wireFullySustainedByLogistics ? "100% Sustained by Auto-Logistics (No Halts!)" : "Partially Exhausted") << "       |\n";

        if (!expeditionAlerts.empty()) {
            std::cout << "|                                                                             |\n";
            std::cout << "| [COSMIC EXPEDITION DISCOVERIES]:                                            |\n";
            for (const auto& alert : expeditionAlerts) {
                std::cout << "|  * " << std::left << std::setw(71) << alert << " |\n";
            }
        }

        std::cout << "|                                                                             |\n";
        std::cout << "| [DAILY AI DIRECTIVE DECISION] (Active for the next 24 hours):               |\n";
        std::cout << "|   [1] Overclock Relativistic Fleets (+50% Exploration Speed)                |\n";
        std::cout << "|   [2] Sub-Atomic Matter Optimization (-20% Wire Burn Rate)                  |\n";
        std::cout << "|   [3] Quantum Computing Surge (+100% Ops Storage & Generation)              |\n";
        std::cout << "+=============================================================================+\n";
    }
};

} // namespace OmniEngine
