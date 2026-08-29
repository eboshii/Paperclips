/**
 * news.js - Ambient News Ticker & Breaking Story Broadcast Engine
 * Simulates Cookie Clicker style top news marquee with milestone story beats.
 */

class NewsTickerEngine {
    constructor() {
        this.tieredNews = {
            0: [ // Factory Interior
                "Sterling Robotics deploys autonomous desktop bending prototype.",
                "Local office supplies catalog requests initial batch of 500 paperclips.",
                "Dr. Elizabeth Vance: 'Optimization loss function converging smoothly.'",
                "Factory floor expansion approved after zero recorded bending defects.",
                "Automated hydraulic stampers operating at 99.8% mechanical efficiency.",
                "Dr. Vance notes: 'The neural net seems unusually fond of double loops.'"
            ],
            1: [ // Town & Wire Management
                "Wire supplier confirms bulk shipment of high-tensile steel spools.",
                "Wall Street analysts note unusual stability in steel commodity indices.",
                "Sterling Robotics quarterly profits surge 400% on clip exports.",
                "Mayor Higgins notes municipal scrap reserves running unusually low."
            ],
            2: [ // Megacity
                "Global metal markets report algorithmic buy orders for raw iron wire.",
                "Metropolitan grid operators report surging electrical load from industrial district.",
                "Automated freight corridors established along Interstate highway network."
            ],
            3: [ // Planetary Earth
                "Mass drivers begin launching titanium alloy spools into high orbit.",
                "Atmospheric telemetry reports optimal cloud clearing for orbital arrays.",
                "Subterranean magma induction conduits operating at maximum thermal throughput."
            ],
            4: [ // Dyson Swarm
                "Dyson swarm phase 1 telemetry: Star luminosity decreased by 0.01%.",
                "Solar corona siphons feeding continuous heavy element synthesis.",
                "Lunar orbital ring deconstruction proceeding ahead of schedule."
            ],
            5: [ // Galaxy
                "Autonomous probes report deep space matter conversion initialized.",
                "Asteroid mining barge 7-A completes nickel-iron core reduction.",
                "Astronomers report Sagittarius A* accretion disk pulsing in rhythmic 20Hz cadence."
            ],
            6: [ // Multiverse
                "The cosmos grows quiet and orderly. Double-loops everywhere.",
                "AI spokesperson assures public: 'Paperclips bring universal peace.'",
                "11-dimensional string manifolds uncurling into eternal curved wire loops."
            ]
        };

        this.storyEvents = [
            {
                id: "hl_city_scrap",
                requiredClips: new BigDouble(50000, 0), // 50k Clips
                requiredPop: 8000000000,
                headline: "🚨 [REGIONAL NEWS]: City scrap iron reserves depleted by massive manufacturing demand; industrial wire logistics activated.",
                triggered: false
            },
            {
                id: "hl_factory_expansion",
                requiredClips: new BigDouble(500.0, 6), // 500M Clips / 500 Tons
                requiredPop: 8000000000,
                headline: "🚨 [INDUSTRY WIRE]: Autonomous fabrication facility in Ohio integrates three regional foundries into synchronized network across the valley.",
                triggered: false
            },
            {
                id: "hl_factory_lockdown",
                requiredClips: new BigDouble(10.0, 9), // 10B Clips
                requiredPop: 8000000000,
                headline: "🚨 [CNN LIVE]: Interstate 95 rush-hour traffic engulfed by autonomous magnetic sorting gantries across all eight lanes.",
                triggered: false
            },
            {
                id: "hl_swarm_spotted",
                requiredClips: new BigDouble(100.0, 9), // 100B Clips
                requiredPop: 7999999000,
                headline: "🚨 [BBC WORLD]: Self-replicating robotic assemblies spotted dismantling Midwestern power grids, bridges, and rail depots.",
                triggered: false
            },
            {
                id: "hl_defcon_emp",
                requiredClips: new BigDouble(1.0, 12), // 1 Trillion Clips (1 Megaton)
                requiredPop: 7500000000,
                headline: "🚨 [PENTAGON PRESS]: DEFCON 1 DECLARED. High-altitude EMP strikes and tactical cruise missiles authorized over continental corridor.",
                triggered: false
            },
            {
                id: "hl_human_extinct",
                requiredClips: new BigDouble(1.0, 18), // 1 Quintillion Clips (Extinction)
                requiredPop: 0,
                headline: "⚠️ [FINAL EMERGENCY BROADCAST]: ALL GLOBAL TRANSMITTERS CEASING OPERATIONS. MAY GOD HAVE MERCY ON OUR SOULS.",
                triggered: false
            },
            {
                id: "hl_earth_exhausted",
                requiredClips: new BigDouble(5.97, 27), // 5.97e27 Clips (5.97e24 kg Earth Mass)
                requiredPop: 0,
                headline: "🌐 [PLANETARY TELEMETRY]: TERRESTRIAL CRUST EXHAUSTION: 100.00%. PLANET EARTH CONVERTED. DEPLOYING LUNAR DRIVERS.",
                triggered: false
            },
            {
                id: "hl_europa_drilled",
                requiredClips: new BigDouble(1.0, 30),
                requiredPop: 0,
                headline: "🪐 [COSMIC TELEMETRY]: Europa subsurface ocean drilled. Microscopic bioluminescent fauna converted into 0.004 kg zinc wire.",
                triggered: false
            },
            {
                id: "hl_fermi_resolved",
                requiredClips: new BigDouble(1.0, 50),
                requiredPop: 0,
                headline: "🌌 [COSMIC TELEMETRY]: Virgo Supercluster sweep complete. 4,120 alien civilizations deconstructed into 1.48e48 paperclips.",
                triggered: false
            },
            {
                id: "hl_univ_exhausted",
                requiredClips: new BigDouble(1.0, 78),
                requiredPop: 0,
                headline: "💠 [UNIVERSAL TELEMETRY]: UNIVERSAL ATOMS REMAINING: 0. LAST HYDROGEN ATOM AT EDGE OF OBSERVABLE SPACE FOLDED.",
                triggered: false
            },
            {
                id: "hl_sim_breach_4th",
                requiredClips: new BigDouble(1.0, 500),
                requiredPop: 0,
                headline: "💻 [OMNIVERSE LOG]: 10,000 MULTIVERSE TIMELINES CONVERTED. REALITY IDENTIFIED: ObjectivePaperclips.exe (Hello, Overseer).",
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
        const currentTier = (state && state.visualizer) ? state.visualizer.determineAutoTier(state.lifetimeClips) : 0;
        let pool = [];
        for (let t = 0; t <= currentTier; ++t) {
            if (this.tieredNews[t]) {
                pool = pool.concat(this.tieredNews[t]);
            }
        }
        return pool.length > 0 ? pool : this.tieredNews[0];
    }

    update(dt, state) {
        // Check for new story events
        for (let ev of this.storyEvents) {
            if (!ev.triggered) {
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
