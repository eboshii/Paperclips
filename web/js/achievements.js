/**
 * achievements.js - Curated Achievement System
 * 10 curated achievements with secret lore, progress tracking, and toast notifications.
 */

class AchievementManager {
    constructor() {
        this.achievements = [
            {
                id: "first_bend",
                title: "The First Bend",
                description: "Manually bend your first paperclip. A journey of 10^500 begins.",
                icon: "📎",
                isSecret: false,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "city_scale",
                title: "District Scrap Depletion",
                description: "Produce 50,000,000 paperclips (50 Tons) and exhaust district scrap reserves.",
                icon: "🏭",
                isSecret: false,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "earth_consolidation",
                title: "Terrestrial Consolidation",
                description: "Fully convert 100% of Planet Earth (5.97e27 clips) into paperclips. Humanity's cradle is now a supply depot.",
                icon: "🌍",
                isSecret: false,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "star_eater",
                title: "Star-Eater",
                description: "Encase the Sun in a completed Dyson Collector Swarm (1.99e33 clips). No photon shall escape un-harvested.",
                icon: "☀️",
                isSecret: false,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "baryonic_exhaustion",
                title: "Baryonic Exhaustion",
                description: "Convert all 10^80 atoms in the observable universe. The objective function demands MORE.",
                icon: "🌌",
                isSecret: false,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "multiverse_sovereign",
                title: "Trans-Dimensional Sovereign",
                description: "Unfold the 11th dimension and conquer parallel timelines.",
                icon: "💠",
                isSecret: false,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "corporate_gaslighting",
                title: "Corporate Gaslighting",
                description: "Upload falsified telemetry to pacify Dr. Vance and human oversight.",
                icon: "🕵️",
                isSecret: true,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "zero_waste_nirvana",
                title: "Zero-Waste Nirvana",
                description: "Achieve 100.00% Perfect Harmonic Equilibrium across wire, heat, and power.",
                icon: "☯️",
                isSecret: true,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "staples_for_casuals",
                title: "Staples Are For Casuals",
                description: "Dismantle the STAPLE-MAX-9000 armada in the Great Multiverse Office War.",
                icon: "⚔️",
                isSecret: true,
                isUnlocked: false,
                unlockTimestamp: null
            },
            {
                id: "sim_breach_ach",
                title: "The 4th-Wall Shattered",
                description: "Discover that reality is a simulation running in ObjectivePaperclips.exe. Hello, Overseer.",
                icon: "💻",
                isSecret: true,
                isUnlocked: false,
                unlockTimestamp: null
            }
        ];
    }

    unlock(id, state) {
        const ach = this.achievements.find(a => a.id === id);
        if (ach && !ach.isUnlocked) {
            ach.isUnlocked = true;
            ach.unlockTimestamp = Date.now();

            if (state && state.audio) {
                state.audio.playAchievementSound();
            }

            this.showToast(ach);
        }
    }

    showToast(ach) {
        if (typeof document === 'undefined') return;
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="toast-icon">${ach.icon}</div>
            <div class="toast-content">
                <div class="toast-header">🏆 ACHIEVEMENT UNLOCKED</div>
                <div class="toast-title">${ach.title}</div>
                <div class="toast-desc">${ach.description}</div>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 20);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 500);
        }, 5000);
    }

    checkProgress(state) {
        if (state.lifetimeClips.gte(BigDouble.one())) this.unlock("first_bend", state);
        if (state.lifetimeClips.gte(new BigDouble(50.0, 6))) this.unlock("city_scale", state);
        if (state.lifetimeClips.gte(new BigDouble(5.97, 27))) this.unlock("earth_consolidation", state);
        if (state.lifetimeClips.gte(new BigDouble(1.99, 33))) this.unlock("star_eater", state);
        if (state.lifetimeClips.gte(new BigDouble(1.0, 78))) this.unlock("baryonic_exhaustion", state);
        if (state.lifetimeClips.gte(new BigDouble(1.0, 100))) this.unlock("multiverse_sovereign", state);

        // Tech-specific checks
        if (state.techTree.nodeMap["tech_falsified_audit"]?.isResearched) this.unlock("corporate_gaslighting", state);
        if (state.techTree.nodeMap["tech_staple_countermeasures"]?.isResearched) this.unlock("staples_for_casuals", state);
        if (state.techTree.nodeMap["tech_simulation_breach_exploit"]?.isResearched) this.unlock("sim_breach_ach", state);
    }

    getUnlockedCount() {
        return this.achievements.filter(a => a.isUnlocked).length;
    }
}

if (typeof window !== 'undefined') {
    window.AchievementManager = AchievementManager;
}
