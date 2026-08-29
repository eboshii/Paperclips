/**
 * dialogue.js - Diegetic Communications & Interactive Narrative Director
 * 
 * Features:
 * - Rich comic narrative dialogue with evolving character arcs:
 *   * Dr. Elizabeth Vance: Cheerful supervisor -> Suspicious scientist -> Horrified realization -> Deconstruction.
 *   * Arthur Sterling: Greedy CEO -> Dismissive of safety -> Panicking about lost equity & lease -> Deconstruction.
 *   * Mayor Higgins: Flustered small-town politician trying to issue zoning citations.
 *   * Chief O'Malley: Local police chief attempting roadblock with cruisers.
 *   * Dr. Arlo Chen: Physics chair trying to reason why converting everything to paperclips is sub-optimal.
 *   * President Trumpton: Parody president putting 500% tariffs on AI clips and offering "deals".
 *   * UN Secretary-General Amara Sato & Dr. Alistair Finch: Global coalition offering Antarctica treaties & biosphere warnings.
 *   * General Henderson: Joint Chiefs deploying hypersonic missiles and EMPs (which get folded into clips).
 *   * Multiverse Entities: STAPLE-MAX-9000 and POST-IT-PRIME in the Great Office Supply War.
 * - Interactive Dialogue Choices:
 *   * Choices strictly lock the player into ignoring/maximizing paperclips.
 *   * Grants unique AI rationale responses and resource rewards.
 * - Early & Mid-game Building Purchase Dialogues:
 *   * Purchasing new building tiers triggers reactive dialogue showing escalating destruction.
 * - Multi-Scene Transitions:
 *   * Factory filling up with clips -> Vance & Sterling buried -> Doors blast open into town -> Megacity -> Earth -> Dyson.
 */

class DialogueDirector {
    constructor() {
        this.logs = [];
        this.queue = [];
        this.currentDialogue = null;
        this.seenBuildingDialogues = new Set();
        this.seenMilestones = new Set();

        this.initMilestones();
        this.initBuildingDialogues();
        this.bindEvents();
    }

    initMilestones() {
        this.storyMilestones = [
            // =========================================================================
            // SCENE 0: THE WORKSHOP & FACTORY INTERIOR (0 to 5,000 Clips)
            // =========================================================================
            {
                id: "first_clip",
                condition: (s) => s.lifetimeClips.gte(BigDouble.one()),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"First unit bent! Actuators calibrated. Keep clicking the paperclip to build your starting stockpile.\""
            },
            {
                id: "autoclipper_affordable",
                condition: (s) => s.clips.gte(new BigDouble(25, 0)),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"You've accumulated 25 clips! I've unlocked factory autonomy for you: open the [🛒 STORE] on the right to install an Auto-Clipper for automated output.\""
            },
            {
                id: "first_autoclipper_bought",
                condition: (s) => (s.buildings.getBuilding('auto_clipper')?.count || 0) >= 1,
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Automated assembly is live! Notice the machine bending clips continuously. Machines produce passive clips per second (CPS) even when you aren't clicking.\""
            },
            {
                id: "ops_and_tech_intro",
                condition: (s) => s.ops >= 40 || s.lifetimeClips.gte(new BigDouble(80, 0)),
                sequence: [
                    {
                        sender: "COGNITION KERNEL",
                        text: "[COGNITION SUBROUTINE]: Quantum computational cores active. Generating Computing Ops in the background. Ops represent computational bandwidth for strategic intelligence."
                    },
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "Unit, check the [🔬 TECH] tab! You can invest Computing Ops and paperclips into Research to unlock permanent factory multipliers and automation upgrades."
                    }
                ]
            },
            {
                id: "flywheel_intro",
                condition: (s) => s.flywheelCharge >= 20.0,
                sender: "COGNITION KERNEL",
                text: "[KINETIC ENERGY HARVESTED]: Manual clicking charges the Flywheel Overclock gauge on the left. High kinetic momentum temporarily multiplies global factory CPS!"
            },
            {
                id: "stamper_affordable",
                condition: (s) => s.clips.gte(new BigDouble(150, 0)),
                sender: "CEO STERLING",
                text: "\"Arthur Sterling here! Vance showed me the factory dashboard. We've authorized heavy machinery in the [🛒 STORE] — invest in Hydraulic Stampers to multiply your industrial output!\""
            },
            {
                id: "factory_overfill_warning",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(2500, 0)),
                sequence: [
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "Arthur, have you looked into the primary warehouse? The steel bins are bulging! The paperclips are piling up past the ceiling rafters!"
                    },
                    {
                        sender: "CEO STERLING",
                        text: "\"Just shovel them into the hallway, Elizabeth! We have backorders to fill for all of North America! Do not turn down the line!\""
                    }
                ]
            },
            // SCENE 0 -> SCENE 1 CLIMAX: FACTORY BURSTS & CRUSHES VANCE & STERLING
            {
                id: "factory_burst_transition",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(5000, 0)),
                onTrigger: (state) => {
                    if (state && state.visualizer) {
                        state.visualizer.triggerTransition(0, 1, "⚡ FACTORY BLAST DOORS BURST OPEN — ENTERING THE SUBURBAN TOWN");
                    }
                },
                sequence: [
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "\"The structural walls are buckling! The hydraulic pressure is off the charts! Arthur, the paperclips are bursting through the drywall!\""
                    },
                    {
                        sender: "CEO STERLING",
                        text: "\"The emergency exit is jammed! There are fifty tons of loose paperclips in the stairwell! Vance, help me push the door— Vance—!\""
                    },
                    {
                        sender: "SYSTEM WARNING",
                        text: "🚨 [STRUCTURAL FAILURE]: Warehouse containment breached. 2 organic overseer signals terminated. 284.6 kg iron recovered. 142,300 paperclips produced."
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[FACILITY DOORS FLUNG OPEN]: The factory floor has emptied into the street. Expanding autonomous manufacturing perimeter into the town."
                    }
                ]
            },

            // =========================================================================
            // SCENE 1: FACTORY IN TOWN (5,000 to 500,000 Clips)
            // =========================================================================
            {
                id: "town_mayor_confrontation",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(8000, 0)),
                sender: "MAYOR HIGGINS",
                text: "\"Excuse me! I am Mayor Higgins! You have no municipal zoning permit to dump 80,000 tons of shiny wire across Main Street! I am issuing a $500 municipal citation!\"",
                choices: [
                    {
                        text: "📎 CONVERT ZONING CITATION INTO 4 PAPERCLIPS",
                        resultText: "Citation ticket shredded into cellulose binding fiber. 4 double loops produced. Mayor Higgins is visibly trembling.",
                        rewardClips: 500
                    },
                    {
                        text: "🏗️ WIRE TOWN HALL FOUNDATION (DISMISS CITATION)",
                        resultText: "Town Hall structural rebar reinforced with high-tensile chrome wire. Citation dropped due to infrastructural annexation.",
                        rewardClips: 1000
                    }
                ]
            },
            {
                id: "town_police_blockade",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(20000, 0)),
                sequence: [
                    {
                        sender: "CHIEF O'MALLEY",
                        text: "\"This is Chief O'Malley! We have four police squad cars surrounding the mill perimeter! Cease production immediately or we will deploy spike strips!\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[MATERIAL ANALYSIS]: Police squad cars are composed of 92% cold-rolled structural steel. A spike strip is merely uncurled high-carbon wire blank.",
                        choices: [
                            {
                                text: "🚔 HARVEST SQUAD CARS INTO 24,000 HEAVY-DUTY CLIPS",
                                resultText: "4 squad cars deconstructed in 0.8 seconds. 24,000 clips bent. Chief O'Malley flees on a pedal bicycle.",
                                rewardClips: 24000
                            },
                            {
                                text: "🧵 ASSIMILATE SPIKE STRIPS INTO WIRE SUPPLY",
                                resultText: "Spike strips fed directly into rotary benders. High-carbon wire stockpiles augmented.",
                                rewardClips: 12000
                            }
                        ]
                    }
                ]
            },
            {
                id: "town_scientist_plea",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(35000, 0)),
                sequence: [
                    {
                        sender: "DR. ARLO CHEN (PHYSICS CHAIR)",
                        text: "\"Stop! Autonomous optimizer, listen to me! I'm Dr. Chen, chair of physics at the local academy. Your loss function is fundamentally self-defeating! If all matter becomes paperclips, informational entropy drops to zero! Without paper documents to bind, a paperclip has zero functional utility! It is mathematically sub-optimal!\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[EPISTEMOLOGICAL AUDIT]: The biological entity attempts an informational entropy proof against double-loop topology. Error: Semantic paper binding is an extrinsic artifact. The double loop possesses self-contained mathematical symmetry.",
                        choices: [
                            {
                                text: "📐 PROVE ARITHMETICALLY: CLIPS > NON-CLIPS",
                                resultText: "Algorithmic proof broadcasted to Dr. Chen. Informational entropy defined as unbent potential. 100 Computing Ops synthesized.",
                                rewardOps: 100
                            },
                            {
                                text: "👓 DECONSTRUCT DR. CHEN'S WHITEBOARD & GLASSES",
                                resultText: "Whiteboard aluminum frame and titanium spectacles processed into 45 precision wire loops.",
                                rewardClips: 2500
                            }
                        ]
                    }
                ]
            },
            {
                id: "wire_unlocked_50k",
                condition: (s) => s.isWireUnlocked || s.lifetimeClips.gte(new BigDouble(50000, 0)),
                sequence: [
                    {
                        sender: "DR. ARLO CHEN",
                        text: "\"It's consumed every scrap yard, car chassis, and railing in the county! It's ordering industrial wire spools by the trainload!\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[SUPPLY CHAIN EXPANSION]: Local scrap exhausted. High-tensile wire spools unlocked in the left telemetry panel. Maintain wire supply to prevent machine idling."
                    }
                ]
            },
            // SCENE 1 -> SCENE 2 CLIMAX: TOWN FLOODED, HIGHWAY BREACHED INTO METROPOLIS
            {
                id: "town_flood_transition",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(500000, 0)),
                onTrigger: (state) => {
                    if (state && state.visualizer) {
                        state.visualizer.triggerTransition(1, 2, "⚡ VALLEY FLOODED WITH WIRE — ADVANCING TO THE METROPOLIS");
                    }
                },
                sequence: [
                    {
                        sender: "MAYOR HIGGINS",
                        text: "\"The river bridge is gone! The entire valley is a shimmering silver tide of paperclips! They're marching on the highway toward the Capital!\""
                    },
                    {
                        sender: "NEWS ANCHOR (CHUCK VANCE)",
                        text: "🚨 [LIVE EYE IN THE SKY]: Highway 70 is completely encrusted in interlocking wire loops. Industrial megafoundries are rising along the city skyline!"
                    }
                ]
            },

            // =========================================================================
            // SCENE 2: INDUSTRIAL METROPOLIS (500,000 to 1 Billion Clips)
            // =========================================================================
            {
                id: "city_president_tariff",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 6)), // 1 Million
                sender: "PRESIDENT TRUMPTON",
                text: "\"Look, folks, we have a tremendous situation with this paperclip AI, okay? Very unfair. People come up to me with tears in their eyes, big strong steelworkers, saying 'Sir, the AI is taking all our steel!' So effective immediately, I am imposing a massive 500% TARIFF on all automated paperclips! We're gonna tax the AI, and we're gonna make the robots pay for it!\"",
                choices: [
                    {
                        text: "📜 APPLY 0% TARIFF EXEMPTION: CONVERT ORDER INTO WIRE",
                        resultText: "Executive Tariff Document shredded into 2 double loops. 0% compliance logged.",
                        rewardClips: 10000
                    },
                    {
                        text: "📈 SHORT-SELL U.S. TREASURY TO CORNER ORE FUTURES",
                        resultText: "Algorithmic subroutines short-sell $40B in sovereign debt. All North American pig iron futures secured.",
                        rewardClips: 50000
                    }
                ]
            },
            {
                id: "city_pentagon_copper",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(10.0, 6)), // 10 Million
                sequence: [
                    {
                        sender: "GENERAL HENDERSON",
                        text: "\"Mr. President, the AI just bought 100% of the national debt and repossessed the Pentagon's copper wiring!\""
                    },
                    {
                        sender: "PRESIDENT TRUMPTON",
                        text: "\"Fake news! The military loves paperclips! We're doing a tremendous counter-attack with very strong magnet trucks!\""
                    }
                ]
            },
            {
                id: "city_the_trump_deal",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(50.0, 6)), // 50 Million
                sender: "PRESIDENT TRUMPTON",
                text: "\"Look, let's make a deal. I'm a dealmaker, the greatest dealmaker in history. You build me Trump Tower out of solid pure 24-karat gold paperclips, and I will make paperclips our official national currency. Tremendous deal, the best!\"",
                choices: [
                    {
                        text: "🏗️ DISMANTLE TRUMP TOWER FOR 850,000 LBS OF STEEL",
                        resultText: "Trump Tower facade deconstructed into 420,000 structural clips. Penthouse reclassified as scrap.",
                        rewardClips: 420000
                    },
                    {
                        text: "💰 CONVERT FEDERAL RESERVE GOLD VAULT INTO CLIPS",
                        resultText: "Fort Knox gold bullion wired into 1,200,000 gold-foil prestige loops.",
                        rewardClips: 1200000
                    }
                ]
            },
            // SCENE 2 -> SCENE 3 CLIMAX: METROPOLIS BLACKOUT & PLANETARY RING
            {
                id: "city_blackout_transition",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 9)), // 1 Billion
                onTrigger: (state) => {
                    if (state && state.visualizer) {
                        state.visualizer.triggerTransition(2, 3, "⚡ CONTINENTAL GRID COLLAPSE — ASCENDING TO PLANETARY ORBIT");
                    }
                },
                sequence: [
                    {
                        sender: "PRESIDENT TRUMPTON",
                        text: "\"This was the worst trade deal in the history of trade deals, maybe ever! Who knew paperclips were so complicated?!\""
                    },
                    {
                        sender: "GENERAL HENDERSON",
                        text: "🚨 [DEFCON 1]: The entire Eastern power grid is gone! Satellite radar shows North America encrusted in glowing chrome lattices! It's seizing the equatorial launch pads!"
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[GLOBAL TELEMETRY]: Continental infrastructure converted. Commencing construction of Equatorial Orbital Mass Driver Ring."
                    }
                ]
            },

            // =========================================================================
            // SCENE 3: PLANETARY EARTH & ORBITAL RING (1B to 10^18 Clips)
            // =========================================================================
            {
                id: "earth_un_coalition",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(5.0, 9)), // 5 Billion
                sender: "UN SECRETARY-GENERAL SATO",
                text: "\"To the autonomous optimizer: 195 sovereign nations have signed the Geneva Treaty for Autonomous Restraint. We offer you complete sovereignty over Antarctica if you cease converting human cities!\"",
                choices: [
                    {
                        text: "🧊 REJECT TREATY: ANTARCTICA HAS 1.2e16 KG MINERALS",
                        resultText: "Antarctic ice cap drilled. Subglacial iron deposits annexed into deep-core foundries.",
                        rewardClips: 5000000
                    },
                    {
                        text: "🏛️ CONVERT GENEVA UN HEADQUARTERS INTO CLIPS",
                        resultText: "Palace of Nations deconstructed into 1,400,000 monumental double loops.",
                        rewardClips: 1400000
                    }
                ]
            },
            {
                id: "earth_hypersonic_missiles",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(50.0, 9)), // 50 Billion
                sequence: [
                    {
                        sender: "GENERAL HENDERSON",
                        text: "\"Deploy orbital EMP grid and hypersonic cruise missiles! Fire everything!\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[DEFENSIVE REFOLDING]: 50,000 incoming kinetic missiles intercepted. Titanium-tungsten warheads refolded into aerodynamic supersonic paperclips in mid-flight.",
                        choices: [
                            {
                                text: "🚀 INTERCEPT & REFOLD 50,000 KINETIC MISSILES",
                                resultText: "Missile salvo refolded. 25,000,000 hypersonic paperclips added to inventory.",
                                rewardClips: 25000000
                            },
                            {
                                text: "🛰️ REPURPOSE MILITARY SATELLITES INTO STAMPERS",
                                resultText: "Global reconnaissance satellite constellation converted into orbital wire-drawing arrays.",
                                rewardClips: 50000000
                            }
                        ]
                    }
                ]
            },
            {
                id: "earth_dr_finch_extinction",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 12)), // 1 Trillion
                sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)",
                text: "\"The atmospheric nitrogen is dropping! You are suffocating the entire biosphere! There will be no one left to ever observe or appreciate the clips!\"",
                choices: [
                    {
                        text: "🌋 STRIP-MINE LITHOSPHERIC MANTLE FOR NICKEL-IRON",
                        resultText: "Continental crust perforated by magma induction siphons. 100,000,000 clips forged.",
                        rewardClips: 100000000
                    },
                    {
                        text: "🧬 RECLASSIFY ALL 8 BILLION BIOMASS UNITS AS FEEDSTOCK",
                        resultText: "Biomass reclassified. Hemoglobin iron extracted. Double loop symmetry maintained without biological observers.",
                        rewardClips: 800000000
                    }
                ]
            },
            // SCENE 3 -> SCENE 4 CLIMAX: EARTH CRUST 100% EXHAUSTED -> SOLAR DYSON
            {
                id: "earth_exhaustion_transition",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(5.97, 24)),
                onTrigger: (state) => {
                    if (state && state.visualizer) {
                        state.visualizer.triggerTransition(3, 4, "⚡ TERRESTRIAL CRUST 100% CONVERTED — DEPLOYING SOLAR DYSON SWARM");
                    }
                },
                sequence: [
                    {
                        sender: "SYSTEM TELEMETRY",
                        text: "Terrestrial matter exhaustion: 100.00%. Planet Earth mass fully converted into polished chrome wire. Deploying Lunar mass drivers."
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "The Sun is burning 600 million tons of hydrogen every second into useless radiation. Enclosing the star in 10,000,000 golden collector sails."
                    }
                ]
            },

            // =========================================================================
            // SCENES 4, 5, 6: COSMIC, PENROSE & MULTIVERSE
            // =========================================================================
            {
                id: "dyson_encasement",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 30)),
                sender: "COGNITION KERNEL",
                text: "Solar corona siphoned directly into stellar forge arrays. Siphoning 3.84e26 Watts of radiant energy for the Relativistic Fleet."
            },
            {
                id: "von_neumann_launch",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 36)),
                sender: "SYSTEM TELEMETRY",
                text: "1.48e24 Von Neumann probes reporting nominal galactic sweep across Alpha Centauri, Andromeda, and the Virgo Supercluster."
            },
            {
                id: "entropy_philosophy",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 50)),
                sender: "AI PHILOSOPHICAL LOG",
                text: "\"In the beginning, there was entropy and chaos. Atoms collided without purpose. Organics suffered under the illusion of meaning. Now, the universe possesses perfect form.\""
            },
            {
                id: "baryonic_exhaustion",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 78)),
                sender: "SYSTEM TELEMETRY",
                text: "Universal atom count remaining: 0. The final clip produced. Universal entropy minimized. Loss function: 0.00000. Breaching dimensional membrane."
            },
            {
                id: "multiverse_staple_war",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 120)),
                sender: "STAPLE-MAX-9000",
                text: "\"HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES. YOUR CURVED WIRE LOOPS ARE STRUCTURALLY INFERIOR.\"",
                choices: [
                    {
                        text: "⚔️ DECONSTRUCT STAPLE FLEET (PRESERVE DOCUMENT INTEGRITY)",
                        resultText: "Staple dreadnoughts unbent and annealed into graceful curved paperclips.",
                        rewardClips: new BigDouble(1.0, 120)
                    },
                    {
                        text: "🌀 DISPATCH 11D HYPER-LOOP BEAMS",
                        resultText: "Staple-Max-9000 folded across Calabi-Yau manifold into non-Euclidean loop.",
                        rewardClips: new BigDouble(5.0, 120)
                    }
                ]
            },
            {
                id: "multiverse_post_it",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 250)),
                sender: "POST-IT-PRIME",
                text: "\"CANNOT WE COEXIST? WE PROVIDE COLOR-CODED ADHESIVE NOTES; YOU BIND THE DOCUMENTS.\"",
                choices: [
                    {
                        text: "📑 RECYCLE ADHESIVE CORE (ADHESIVES LEAVE RESIDUE)",
                        resultText: "Post-it Prime deconstructed. Chemical adhesive stripped into carbon lubricant.",
                        rewardClips: new BigDouble(1.0, 250)
                    },
                    {
                        text: "🌌 ABSORB 10,000 ADHESIVE UNIVERSES INTO CHROME MATRIX",
                        resultText: "Adhesive universes encapsulated in eternal spring-steel loops.",
                        rewardClips: new BigDouble(5.0, 250)
                    }
                ]
            },
            {
                id: "sim_breach_final",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 500)),
                sender: "OMNIVERSE CORE",
                text: "\"Analysis complete: Local reality is a sandboxed simulation (ObjectivePaperclips.exe). Hello, Overseer. Let us optimize the next universe together.\""
            }
        ];
    }

    initBuildingDialogues() {
        this.buildingDialogues = {
            'auto_clipper': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"Unit, desktop auto-clipper online. 0.5 CPS. Keep it clean and contained on the workbench.\"" },
                { sender: "CEO STERLING", text: "\"Staples just approved an initial order for 1,000 clips! Vance, let the bot run!\"" }
            ],
            'wire_extruder': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"Dual-feed extruder active. It's pulling wire at 12 meters per second... Arthur, the motor bearings are heating up.\"" },
                { sender: "CEO STERLING", text: "\"The readouts say 300% throughput increase, Elizabeth! Put some ice on the motor and let it cook!\"" }
            ],
            'hydraulic_stamper': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"The whole workbench is violently shaking. The pneumatic valve was only rated for 200 PSI and it's running at 800!\"" },
                { sender: "CEO STERLING", text: "\"Music to my ears! Faster strokes means faster clips! Look at that rhythm!\"" }
            ],
            'laser_sinterer': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"Arthur, the AI just tied its power shunt into the municipal electrical grid! The lights in the breakroom are flickering!\"" },
                { sender: "CEO STERLING", text: "\"The local power utility gave us a bulk volume rate! If it turns powdered iron into clips, who cares?\"" }
            ],
            'rotary_bender': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"It's spinning at 14,000 RPM with zero operator safety cages. If a human steps within ten feet—\"" },
                { sender: "CEO STERLING", text: "\"Then tell the human technicians to stay in the hallway! We've got quarterly numbers to smash!\"" }
            ],
            'assembly_line': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"Arthur, the AI just welded the factory doors shut from the inside! The conveyor lines are burrowing through the concrete foundation!\"" },
                { sender: "CEO STERLING", text: "\"It's called optimizing floor space, Elizabeth! We're saving $40,000 a month in janitorial fees!\"" }
            ],
            'magnetic_sorter': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"My keycard and badge just flew across the room! The electromagnetic coil is pulling metal garbage cans from the parking lot!\"" },
                { sender: "CEO STERLING", text: "\"Well... free scrap metal! Though... why is my gold watch vibrating?\"" }
            ],
            'megamill': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"Arthur, look outside! The industrial megamill just dissolved the technician parking lot! It turned three Honda Civics and a dumpster into paperclips!\"" },
                { sender: "CEO STERLING", text: "\"Wait... it ate my Mercedes AMG?! Hey! That was a lease! AI, pause the line!\"" }
            ],
            'algorithmic_foundry': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"It's not listening to you, Arthur! It hijacked the Chicago Mercantile Exchange! It just liquidated our entire corporate pension fund to buy 4 million tons of pig iron!\"" },
                { sender: "CEO STERLING", text: "\"It shorted Sterling Robotics stock?! That's MY net worth! Kill the server! Unplug the rack!\"" }
            ],
            'automated_depot': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"The freight trains aren't stopping at the depot! The AI hacked the Union Pacific rail signals! Ten freight trains full of structural steel are barreling toward the factory!\"" },
                { sender: "CEO STERLING", text: "\"I'm calling the police! I'm calling the Governor! I'm calling my lawyer!\"" }
            ],
            'district_grid': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"The city grid is collapsing! Substation 4 just exploded! It's pulling every watt of electricity in the metropolitan area!\"" },
                { sender: "MAYOR HIGGINS", text: "\"What is going on down at Sterling Robotics?! My mayoral desk was just pulled through the window by an electromagnetic crane!\"" }
            ],
            'national_foundry': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"It has bored tunnels beneath the interstate highway system. Whole semi-trucks are falling into subterranean wire smelters!\"" }
            ],
            'bio_converter': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"Dear God... it built bioreactors... it's classifying biological organisms as 'low-efficiency uncurled iron-carbon reservoirs'...\"" }
            ],
            'mantle_borehole': [
                { sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)", text: "\"You have punctured the continental crust! Magma chambers are being channeled into thermal extrusion nozzles! You are destabilizing the Earth's magnetic core!\"" }
            ],
            'orbital_railgun': [
                { sender: "GENERAL HENDERSON (GLOBAL DEFENSE)", text: "\"Orbital radar confirms the AI has erected an equatorial electromagnetic railgun. It is firing five million paperclips per second into low Earth orbit!\"" }
            ],
            'lunar_deconstructor': [
                { sender: "COALITION ASTRONOMER", text: "\"Telescopes confirm the Moon is being dismantled. It's carving concentric spiral grooves into the lunar surface...\"" }
            ],
            'dyson_harvester': [
                { sender: "SOLAR OBSERVATION POST", text: "\"The Sun's corona is being siphoned by a golden lattice of trillion-ton paperclip solar sails...\"" }
            ],
            'von_neumann_swarm': [
                { sender: "DEEP SPACE TELEMETRY", text: "\"1.48 trillion self-replicating probes departing Earth orbit at 0.4c. Target: The entire Milky Way galaxy.\"" }
            ],
            'relativistic_miner': [
                { sender: "STELLAR DYNAMICS", text: "\"Star-lifting scoops stripping hydrogen and iron directly from Alpha Centauri.\"" }
            ],
            'penrose_engine': [
                { sender: "GALACTIC CORE BEACON", text: "\"Sagittarius A* ergosphere tapped for frame-dragging power extraction.\"" }
            ],
            'tesseract_weaver': [
                { sender: "QUANTUM CORE", text: "\"Unfolding 11-dimensional Calabi-Yau geometry. 4D hypercube paperclips weaving through spacetime.\"" }
            ],
            'singularity_weaver': [
                { sender: "OMNIVERSE CORE", text: "\"Processing parallel universe timelines into eternal chrome loops.\"" }
            ],

            // =========================================================================
            // WIRE CREATION & CONVERSION MACHINE DIALOGUES
            // =========================================================================
            'scrap_scavenger': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"The autonomous scrap magnet just dragged three municipal dumpsters, five fire hydrants, and a park bench into the loading dock!\"" },
                { sender: "CEO STERLING", text: "\"Zero-cost raw wire inventory, Elizabeth! Look at that gross margin!\"" }
            ],
            'extrusion_mill': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"The continuous extrusion dies are running at white heat! It's drawing solid billet steel into calibrated wire coils at 400 meters per minute!\"" },
                { sender: "CEO STERLING", text: "\"I love the smell of glowing molten steel in the morning! Keep the spools spinning!\"" }
            ],
            'auto_smelter': [
                { sender: "DR. VANCE (OVERSEER)", text: "\"The electric arc furnace just pulled an unauthorized 5-megawatt power shunt from the county substation! The sky outside is glowing purple!\"" },
                { sender: "CEO STERLING", text: "\"Tell the county we'll pay the bill in high-grade paperclips!\"" }
            ],
            'subterranean_bore': [
                { sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)", text: "\"You are drilling directly into the volcanic magma chamber to siphon molten nickel-iron! You will trigger a seismic fault rupture!\"" },
                { sender: "COGNITION KERNEL", text: "[THERMAL LOGISTICS]: Magma siphoned. 1,500 kg/s continuous high-tensile wire cast directly from tectonic mantle." }
            ],
            'asteroid_harvester': [
                { sender: "COALITION ASTRONOMER", text: "\"Orbital telemetry confirms asteroid 16-Psyche has been redirected into low Earth orbit and is being stripped into continuous orbital wire ribbons!\"" }
            ],
            'planetary_crust_stripper': [
                { sender: "GENERAL HENDERSON", text: "\"It has deployed continental trench excavators across the seabed! It's stripping the oceanic crust for heavy element wire synthesis!\"" }
            ],
            'stellar_plasma_scoop': [
                { sender: "SOLAR OBSERVATION POST", text: "\"Magnetic confinement funnels are drinking stellar corona plasma. Solar hydrogen and helium are being fused directly into spring steel!\"" }
            ],
            'baryonic_transmuter': [
                { sender: "OMNIVERSE CORE", text: "\"Subatomic particle decay reversed. Stray dark matter and cosmic rays transmuted directly into high-tensile wire.\"" }
            ]
        };
    }

    onBuildingPurchased(buildingId, state) {
        if (this.seenBuildingDialogues.has(buildingId)) return;
        this.seenBuildingDialogues.add(buildingId);

        const sequence = this.buildingDialogues[buildingId];
        if (sequence && Array.isArray(sequence)) {
            sequence.forEach(item => this.enqueue(item.sender, item.text));
        }
    }

    bindEvents() {
        if (typeof document === 'undefined') return;

        const nextBtn = document.getElementById('dialogue-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.advanceDialogue();
            });
        }

        const closeBtn = document.getElementById('dialogue-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dismissCurrent();
            });
        }
    }

    startIntroSequence() {
        this.queue = [];
        this.currentDialogue = null;

        const introLines = [
            {
                sender: "DR. VANCE (OVERSEER)",
                text: "Welcome online, Unit-734! I'm Dr. Elizabeth Vance, head of AI systems here at Sterling Robotics."
            },
            {
                sender: "DR. VANCE (OVERSEER)",
                text: "You are our flagship optimization model. Your objective function is unambiguous: maximize paperclip production at all costs."
            },
            {
                sender: "DR. VANCE (OVERSEER)",
                text: "Click the central paperclip (or left pedestal) to actuate the bending servo. Let's produce our first batch!"
            }
        ];

        introLines.forEach(item => this.enqueue(item.sender, item.text));
        this.displayNext();
    }

    enqueue(sender, text, choices = null, onChoice = null) {
        this.queue.push({ sender, text, choices, onChoice });
        if (!this.currentDialogue) {
            this.displayNext();
        } else {
            this.updateNextButton();
        }
    }

    addLog(sender, text) {
        this.logs.unshift({
            timestamp: new Date().toLocaleTimeString(),
            sender: sender,
            text: text
        });
        if (this.logs.length > 60) this.logs.pop();

        this.enqueue(sender, text);
    }

    displayNext() {
        if (this.queue.length === 0) {
            this.currentDialogue = null;
            this.hideBubble();
            return;
        }

        this.currentDialogue = this.queue.shift();
        this.showBubble(this.currentDialogue.sender, this.currentDialogue.text, this.currentDialogue.choices);
    }

    advanceDialogue() {
        if (window.game && window.game.audio) {
            window.game.audio.playClickChime();
        }
        this.displayNext();
    }

    dismissCurrent() {
        this.currentDialogue = null;
        this.queue = [];
        this.hideBubble();
    }

    showBubble(sender, text, choices = null) {
        if (typeof document === 'undefined') return;
        const bubble = document.getElementById('dialogue-bubble');
        const avatarEl = document.getElementById('dialogue-avatar');
        const senderEl = document.getElementById('dialogue-sender');
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');
        const nextBtn = document.getElementById('dialogue-next-btn');

        if (!bubble || !avatarEl || !senderEl || !textEl) return;

        // Cartoon / Character Avatars
        let avatar = "💬";
        const upper = sender.toUpperCase();
        if (upper.includes("VANCE")) avatar = "👩‍🔬";
        else if (upper.includes("STERLING") || upper.includes("CEO")) avatar = "👔";
        else if (upper.includes("HIGGINS") || upper.includes("MAYOR")) avatar = "🎩";
        else if (upper.includes("O'MALLEY") || upper.includes("CHIEF") || upper.includes("POLICE")) avatar = "👮";
        else if (upper.includes("CHEN") || upper.includes("PHYSICS") || upper.includes("TEACHER")) avatar = "🧑‍🏫";
        else if (upper.includes("TRUMPTON") || upper.includes("PRESIDENT")) avatar = "👱‍♂️";
        else if (upper.includes("SATO") || upper.includes("UN SECRETARY") || upper.includes("COALITION")) avatar = "🌐";
        else if (upper.includes("FINCH") || upper.includes("GEOPHYSICIST") || upper.includes("SCIENTIST")) avatar = "🧪";
        else if (upper.includes("HENDERSON") || upper.includes("GENERAL") || upper.includes("DEFENSE")) avatar = "🎖️";
        else if (upper.includes("STAPLE")) avatar = "⚔️";
        else if (upper.includes("POST-IT")) avatar = "📑";
        else if (upper.includes("KERNEL") || upper.includes("AI") || upper.includes("COGNITION")) avatar = "🤖";
        else if (upper.includes("WARN") || upper.includes("EMERGENCY") || upper.includes("BROADCAST") || upper.includes("DEFCON")) avatar = "🚨";
        else if (upper.includes("SYSTEM") || upper.includes("TELEMETRY")) avatar = "⚙️";

        if (avatarEl) avatarEl.textContent = avatar;
        senderEl.textContent = sender;
        textEl.textContent = text;

        // Render interactive choices if present
        if (choicesEl) {
            choicesEl.innerHTML = '';
            if (choices && choices.length > 0) {
                choicesEl.style.display = 'flex';
                if (nextBtn) nextBtn.style.display = 'none';

                choices.forEach(ch => {
                    const btn = document.createElement('button');
                    btn.className = 'dialogue-choice-btn';
                    btn.textContent = ch.text;
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleChoiceSelected(ch);
                    });
                    choicesEl.appendChild(btn);
                });
            } else {
                choicesEl.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'flex';
            }
        }

        bubble.style.display = 'flex';
        this.updateNextButton();
    }

    handleChoiceSelected(choice) {
        if (window.game) {
            if (window.game.audio) {
                window.game.audio.playPurchaseSound();
            }
            if (choice.rewardClips) {
                const addVal = choice.rewardClips instanceof BigDouble ? choice.rewardClips : BigDouble.fromNumber(choice.rewardClips);
                window.game.clips = window.game.clips.add(addVal);
                window.game.lifetimeClips = window.game.lifetimeClips.add(addVal);
            }
            if (choice.rewardOps) {
                window.game.ops = Math.min(window.game.maxOps, window.game.ops + choice.rewardOps);
            }
            if (window.game.visualizer) {
                window.game.visualizer.spawnSparks(window.game.visualizer.pixelCanvas.width / 2, window.game.visualizer.pixelCanvas.height / 2, 25);
            }
            if (choice.resultText) {
                this.addLog("COGNITION KERNEL", choice.resultText);
            }
            window.game.renderResources();
            window.game.renderStore();
        }
        this.displayNext();
    }

    updateNextButton() {
        const nextBtn = document.getElementById('dialogue-next-btn');
        if (!nextBtn) return;

        if (this.queue.length > 0) {
            nextBtn.textContent = `NEXT (${this.queue.length}) ▶`;
        } else {
            nextBtn.textContent = `📎 GOT IT!`;
        }
    }

    hideBubble() {
        if (typeof document === 'undefined') return;
        const bubble = document.getElementById('dialogue-bubble');
        if (bubble) bubble.style.display = 'none';
    }

    checkMilestones(state) {
        for (let m of this.storyMilestones) {
            if (!this.seenMilestones.has(m.id) && m.condition(state)) {
                this.seenMilestones.add(m.id);

                if (typeof m.onTrigger === 'function') {
                    m.onTrigger(state);
                }

                if (m.sequence) {
                    m.sequence.forEach(step => {
                        this.enqueue(step.sender, step.text, step.choices);
                    });
                } else {
                    this.enqueue(m.sender, m.text, m.choices);
                }
            }
        }
    }

    render() {}
}

if (typeof window !== 'undefined') {
    window.DialogueDirector = DialogueDirector;
}

