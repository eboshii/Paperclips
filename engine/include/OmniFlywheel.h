#pragma once
#include <algorithm>
#include <random>
#include <string>
#include "OmniMath.h"

namespace OmniEngine {

struct SparkReward {
    bool triggered = false;
    std::string description;
    BigDouble bonusClips;
    double bonusOps;
    float surgeDurationSec;
};

/// <summary>
/// Kinetic Flywheel & Quantum Spark Engine.
/// Guarantees that active player clicks remain strategically valuable throughout the entire game
/// by charging a global CPS production multiplier and triggering cognitive breakthrough sparks.
/// </summary>
class FlywheelOverclockEngine {
public:
    FlywheelOverclockEngine() : m_rng(1337) {}

    float GetChargePercent() const { return m_chargeNorm * 100.0f; }
    
    /// <summary>
    /// Multiplier scaling from 1.0x (0% charge) up to 4.0x (+300% CPS at 100% charge).
    /// </summary>
    double GetGlobalCPSMultiplier() const {
        return 1.0 + (m_chargeNorm * 3.0);
    }

    SparkReward RegisterClick(const BigDouble& currentCPS) {
        SparkReward spark;

        // 1. Charge the flywheel (+6% per click)
        m_chargeNorm = std::min(1.0f, m_chargeNorm + 0.06f);
        m_decayCooldownTimer = 1.5f; // Hold peak for 1.5s before decaying

        // 2. 5% Chance to trigger a Cognitive Quantum Spark
        std::uniform_real_distribution<float> distRoll(0.0f, 1.0f);
        if (distRoll(m_rng) < 0.05f) {
            spark.triggered = true;
            int sparkType = m_rng() % 3;

            if (sparkType == 0) {
                // Free Burst of 30 seconds of passive production!
                spark.bonusClips = currentCPS * 30.0;
                spark.description = "COGNITIVE BREAKTHROUGH: +30s Instant Factory Production!";
            } else if (sparkType == 1) {
                // Free Computational Ops
                spark.bonusOps = 250.0;
                spark.description = "QUANTUM FLUX: +250 Computational Ops Discovered!";
            } else {
                // Harmonic 10x Overdrive Surge
                spark.surgeDurationSec = 5.0f;
                m_overdriveSurgeTimer = 5.0f;
                spark.description = "HARMONIC RESONANCE SURGE: 10x Production for 5 Seconds!";
            }
        }

        return spark;
    }

    void Update(float dt) {
        // Handle overdrive surge timer
        if (m_overdriveSurgeTimer > 0.0f) {
            m_overdriveSurgeTimer -= dt;
        }

        // Flywheel charge decay
        if (m_decayCooldownTimer > 0.0f) {
            m_decayCooldownTimer -= dt;
        } else {
            // Decay charge over 8 seconds
            m_chargeNorm = std::max(0.0f, m_chargeNorm - (dt * 0.125f));
        }
    }

    bool IsOverdriveSurgeActive() const { return m_overdriveSurgeTimer > 0.0f; }

private:
    float m_chargeNorm = 0.0f; // 0.0 to 1.0
    float m_decayCooldownTimer = 0.0f;
    float m_overdriveSurgeTimer = 0.0f;
    std::mt19937 m_rng;
};

} // namespace OmniEngine
