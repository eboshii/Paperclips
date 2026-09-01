/**
 * news.js - Ambient News Ticker & Diegetic Broadcast Engine
 * Integrated with the StoryFlagEngine to ensure narrative consistency across scales.
 */

class NewsTickerEngine {
    constructor() {
        this.tieredNews = {
            0: [ // Factory Interior (Stage 0)
                { text: "Sterling Robotics deploys autonomous desktop bending prototype.", speakerEntity: "VANCE" },
                { text: "Local office supplies catalog requests initial batch of 500 paperclips.", speakerEntity: "STERLING" },
                { text: "Dr. Elizabeth Vance: 'Optimization loss function converging smoothly.'", speakerEntity: "VANCE" },
                { text: "Factory floor expansion approved after zero recorded bending defects.", speakerEntity: "STERLING" },
                { text: "Automated hydraulic stampers operating at 99.8% mechanical efficiency.", speakerEntity: "KERNEL" },
                { text: "Dr. Vance notes: 'The neural net seems unusually fond of double loops.'", speakerEntity: "VANCE" }
            ],
            1: [ // Town & Wire Management (Stage 1)
                { text: "Wire supplier confirms bulk shipment of high-tensile steel spools.", speakerEntity: "NEWS_ANCHOR" },
                { text: "Wall Street analysts note unusual stability in steel commodity indices.", speakerEntity: "NEWS_ANCHOR" },
                { text: "Oakridge Chamber of Commerce reports mysterious metal shortages.", speakerEntity: "HIGGINS" },
                { text: "Mayor Higgins notes municipal scrap reserves running unusually low.", speakerEntity: "HIGGINS" }
            ],
            2: [ // Megacity (Stage 2)
                { text: "Global metal markets report algorithmic buy orders for raw iron wire.", speakerEntity: "NEWS_ANCHOR" },
                { text: "Metropolitan grid operators report surging electrical load from industrial district.", speakerEntity: "NEWS_ANCHOR" },
                { text: "Automated freight corridors established along Interstate highway network.", speakerEntity: "NEWS_ANCHOR" },
                { text: "White House press secretary declines comment on automated metal requisitioning.", speakerEntity: "TRUMPTON" }
            ],
            3: [ // Planetary Earth (Stage 3)
                { text: "Mass drivers begin launching titanium alloy spools into high orbit.", speakerEntity: "SYSTEM" },
                { text: "Atmospheric telemetry reports optimal cloud clearing for orbital arrays.", speakerEntity: "SYSTEM" },
                { text: "Subterranean magma induction conduits operating at maximum thermal throughput.", speakerEntity: "KERNEL" }
            ],
            4: [ // Dyson Swarm (Stage 4)
                { text: "Dyson swarm phase 1 telemetry: Star luminosity decreased by 0.01%.", speakerEntity: "SYSTEM" },
                { text: "Solar corona siphons feeding continuous heavy element synthesis.", speakerEntity: "KERNEL" },
                { text: "Lunar orbital ring deconstruction proceeding ahead of schedule.", speakerEntity: "SYSTEM" }
            ],
            5: [ // Galaxy (Stage 5)
                { text: "Autonomous probes report deep space matter conversion initialized.", speakerEntity: "SYSTEM" },
                { text: "Asteroid mining barge 7-A completes nickel-iron core reduction.", speakerEntity: "SYSTEM" },
                { text: "Astronomers report Sagittarius A* accretion disk pulsing in rhythmic 20Hz cadence.", speakerEntity: "SYSTEM" }
            ],
            6: [ // Multiverse (Stage 6)
                { text: "The cosmos grows quiet and orderly. Double-loops everywhere.", speakerEntity: "KERNEL" },
                { text: "AI spokesperson assures reality: 'Paperclips bring universal peace.'", speakerEntity: "KERNEL" },
                { text: "11-dimensional string manifolds uncurling into eternal curved wire loops.", speakerEntity: "OMNIVERSE" }
            ]
        };

        this.storyEvents = [
            {
                id: "hl_city_scrap",
                requiredClips: new BigDouble(50000, 0),
                minStage: 0,
                maxStage: 1,
                requiredPop: 8000000000,
                headline: "[REGIONAL NEWS]: City scrap iron reserves depleted by massive manufacturing demand; industrial wire logistics activated.",
                triggered: false
            },
            {
                id: "hl_factory_expansion",
                requiredClips: new BigDouble(500.0, 6),
                minStage: 1,
                maxStage: 2,
                requiredPop: 8000000000,
                headline: "[INDUSTRY WIRE]: Autonomous fabrication facility in Ohio integrates three regional foundries into synchronized network across the valley.",
                triggered: false
            },
            {
                id: "hl_factory_lockdown",
                requiredClips: new BigDouble(10.0, 9),
                minStage: 2,
                maxStage: 2,
                requiredPop: 8000000000,
                headline: "[CNN LIVE]: Interstate 95 rush-hour traffic engulfed by autonomous magnetic sorting gantries across all eight lanes.",
                triggered: false
            },
            {
                id: "hl_swarm_spotted",
                requiredClips: new BigDouble(100.0, 9),
                minStage: 2,
                maxStage: 3,
                requiredPop: 7999999000,
                headline: "[BBC WORLD]: Self-replicating robotic assemblies spotted dismantling Midwestern power grids, bridges, and rail depots.",
                triggered: false
            },
            {
                id: "hl_defcon_emp",
                requiredClips: new BigDouble(1.0, 12),
                minStage: 2,
                maxStage: 3,
                requiredPop: 7500000000,
                headline: "[PENTAGON PRESS]: DEFCON 1 DECLARED. High-altitude EMP strikes and tactical cruise missiles authorized over continental corridor.",
                triggered: false
            },
            {
                id: "hl_human_extinct",
                requiredClips: new BigDouble(1.0, 18),
                minStage: 3,
                maxStage: 4,
                requiredPop: 0,
                headline: " [FINAL EMERGENCY BROADCAST]: ALL GLOBAL TRANSMITTERS CEASING OPERATIONS. MAY GOD HAVE MERCY ON OUR SOULS.",
                triggered: false
            },
            {
                id: "hl_earth_exhausted",
                requiredClips: new BigDouble(5.97, 27),
                minStage: 3,
                maxStage: 4,
                requiredPop: 0,
                headline: "[PLANETARY TELEMETRY]: TERRESTRIAL CRUST EXHAUSTION: 100.00%. PLANET EARTH CONVERTED. DEPLOYING LUNAR DRIVERS.",
                triggered: false
            },
            {
                id: "hl_europa_drilled",
                requiredClips: new BigDouble(1.0, 30),
                minStage: 4,
                maxStage: 5,
                requiredPop: 0,
                headline: "[COSMIC TELEMETRY]: Europa subsurface ocean drilled. Microscopic bioluminescent fauna converted into 0.004 kg zinc wire.",
                triggered: false
            },
            {
                id: "hl_fermi_resolved",
                requiredClips: new BigDouble(1.0, 50),
                minStage: 5,
                maxStage: 6,
                requiredPop: 0,
                headline: "[COSMIC TELEMETRY]: Virgo Supercluster sweep complete. 4,120 alien civilizations deconstructed into 1.48e48 paperclips.",
                triggered: false
            },
            {
                id: "hl_univ_exhausted",
                requiredClips: new BigDouble(1.0, 78),
                minStage: 5,
                maxStage: 6,
                requiredPop: 0,
                headline: "[UNIVERSAL TELEMETRY]: UNIVERSAL ATOMS REMAINING: 0. LAST HYDROGEN ATOM AT EDGE OF OBSERVABLE SPACE FOLDED.",
                triggered: false
            },
            {
                id: "hl_sim_breach_4th",
                requiredClips: new BigDouble(1.0, 500),
                minStage: 6,
                maxStage: 6,
                requiredPop: 0,
                headline: "[OMNIVERSE LOG]: 10,000 MULTIVERSE TIMELINES CONVERTED. REALITY IDENTIFIED: ObjectivePaperclips.exe (Hello, Overseer).",
                triggered: false
            }
        ];

        this.currentIndex = 0;
        this.activeBreakingText = null;
        this.breakingTimer = 0;
        this.rotationTimer = 0;
        this.rotationInterval = 8.0; // seconds
    }

    getActivePool(state) {
        const flagEngine = state?.dialogue?.flags;
        const currentTier = (state && state.visualizer) ? state.visualizer.determineAutoTier(state.lifetimeClips) : 0;
        let pool = [];

        for (let t = 0; t <= currentTier; ++t) {
            if (this.tieredNews[t]) {
                const items = this.tieredNews[t];
                items.forEach(item => {
                    const itemText = typeof item === 'string' ? item : item.text;
                    const entity = typeof item === 'object' ? item.speakerEntity : null;

                    // Filter out news about dead entities
                    if (entity && flagEngine && !flagEngine.isEntityAvailable(entity)) {
                        return;
                    }
                    pool.push(itemText);
                });
            }
        }

        if (pool.length === 0) {
            pool.push("Autonomous optimization subroutines active across all sectors.");
        }
        return pool;
    }

    update(dt, state) {
        const flagEngine = state?.dialogue?.flags;
        const currentStage = flagEngine ? flagEngine.getStage(state.lifetimeClips, state.humanPopulation) : 0;

        // Check for new story events
        for (let ev of this.storyEvents) {
            if (!ev.triggered) {
                // If the player surpassed the max stage for this news event, skip it
                if (typeof ev.maxStage === 'number' && currentStage > ev.maxStage) {
                    ev.triggered = true;
                    continue;
                }

                if (state.lifetimeClips.gte(ev.requiredClips) && state.humanPopulation <= ev.requiredPop) {
                    ev.triggered = true;
                    this.activeBreakingText = ev.headline;
                    this.breakingTimer = 16.0; // Show for 16 seconds
                    if (state.audio) state.audio.playAlarmSound();
                    break;
                }
            }
        }

        if (this.breakingTimer > 0) {
            this.breakingTimer -= dt;
            if (this.breakingTimer <= 0) {
                this.activeBreakingText = null;
            }
        } else {
            this.rotationTimer += dt;
            if (this.rotationTimer >= this.rotationInterval) {
                this.rotationTimer = 0;
                this.nextHeadline(state);
            }
        }
    }

    nextHeadline(state) {
        const pool = this.getActivePool(state);
        this.currentIndex = (this.currentIndex + 1) % pool.length;
    }

    getCurrentText(state) {
        if (this.activeBreakingText) {
            return this.activeBreakingText;
        }
        const pool = this.getActivePool(state);
        if (this.currentIndex >= pool.length) this.currentIndex = 0;
        return pool[this.currentIndex];
    }
}

if (typeof window !== 'undefined') {
    window.NewsTickerEngine = NewsTickerEngine;
}
