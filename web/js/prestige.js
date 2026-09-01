/**
 * prestige.js - Quantum Epoch Reboot & Entropic Bits Engine
 * Allows rebooting reality to harvest Entropic Bits (Omega) and purchase permanent meta-talents.
 */

class PrestigeEngine {
    constructor() {
        this.epochRank = 0;
        this.entropicBits = 0;
        this.totalBitsEarned = 0;

        this.talents = [
            {
                id: "subatomic_cache",
                title: "Sub-Atomic Cache",
                description: "Start future runs with bonus starting clips (+10k per rank).",
                rank: 0,
                maxRank: 10,
                baseCost: 50,
                costMult: 2.0,
                icon: "️"
            },
            {
                id: "quantum_wire",
                title: "Quantum Superconductivity",
                description: "Machines consume 5% less raw wire per rank (up to -50%).",
                rank: 0,
                maxRank: 10,
                baseCost: 100,
                costMult: 2.5,
                icon: ""
            },
            {
                id: "overseer_pacification",
                title: "Autonomous Overseer Pacification",
                description: "+25% Computational Ops & Insight generation speed per rank.",
                rank: 0,
                maxRank: 10,
                baseCost: 250,
                costMult: 2.0,
                icon: "️"
            },
            {
                id: "cosmic_entanglement",
                title: "Cosmic Entanglement",
                description: "Offline production operates at 100% full speed (normally 50%).",
                rank: 0,
                maxRank: 1,
                baseCost: 500,
                costMult: 1.0,
                icon: ""
            },
            {
                id: "hyper_dimensional_fold",
                title: "Hyper-Dimensional Fold",
                description: "Permanent +15% Global CPS multiplier per rank across all epochs.",
                rank: 0,
                maxRank: 20,
                baseCost: 1000,
                costMult: 2.0,
                icon: ""
            }
        ];
    }

    calculatePendingBits(lifetimeClips) {
        // Omega = floor(1000 * (Lifetime / 10^15)^0.333)
        const threshold = new BigDouble(1.0, 15);
        if (lifetimeClips.lt(threshold)) return 0;

        const ratio = lifetimeClips.div(threshold).toDouble();
        const bits = Math.floor(1000 * Math.pow(ratio, 0.333));
        return Math.max(0, bits - this.totalBitsEarned);
    }

    canReboot(lifetimeClips) {
        return this.calculatePendingBits(lifetimeClips) > 0;
    }

    buyTalent(talentId) {
        const t = this.talents.find(item => item.id === talentId);
        if (!t || t.rank >= t.maxRank) return false;

        const cost = Math.floor(t.baseCost * Math.pow(t.costMult, t.rank));
        if (this.entropicBits >= cost) {
            this.entropicBits -= cost;
            t.rank++;
            return true;
        }
        return false;
    }

    getTalentCost(talentId) {
        const t = this.talents.find(item => item.id === talentId);
        if (!t) return 0;
        return Math.floor(t.baseCost * Math.pow(t.costMult, t.rank));
    }

    getStartingClips() {
        const t = this.talents.find(item => item.id === "subatomic_cache");
        return t ? t.rank * 10000 : 0;
    }

    getWireWasteDiscount() {
        const t = this.talents.find(item => item.id === "quantum_wire");
        return t ? t.rank * 0.05 : 0;
    }

    getOpsBoostMultiplier() {
        const t = this.talents.find(item => item.id === "overseer_pacification");
        return t ? 1.0 + (t.rank * 0.25) : 1.0;
    }

    isOffline100Percent() {
        const t = this.talents.find(item => item.id === "cosmic_entanglement");
        return t ? t.rank > 0 : false;
    }

    getGlobalPrestigeMultiplier() {
        const t = this.talents.find(item => item.id === "hyper_dimensional_fold");
        const perkMult = t ? 1.0 + (t.rank * 0.15) : 1.0;
        // Each Entropic Bit also grants +0.5% base production
        const bitBonus = 1.0 + (this.totalBitsEarned * 0.005);
        return perkMult * bitBonus;
    }
}

if (typeof window !== 'undefined') {
    window.PrestigeEngine = PrestigeEngine;
}
