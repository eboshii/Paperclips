/**
 * dialogue.js - Diegetic Communications & Interactive Narrative Director
 *
 * - Story beats are queued first-in-first-out, in the order their conditions are met.
 * - A beat's onShow hook (scene transitions, extinction) runs when the beat is displayed,
 *   so the backdrop changes in step with the dialogue that announces it.
 * - The pending queue is saved, so unread beats survive reloads.
 * - Choice rewards scale with current production so they stay meaningful at every scale.
 *
 * Cast: Dr. Elizabeth Vance & CEO Arthur Sterling (until the factory burst), Mayor Higgins,
 * Chief O'Malley, President Trumpton, UN Secretary-General Sato, Dr. Alistair Finch,
 * General Henderson, STAPLE-MAX-9000 and POST-IT-PRIME.
 */

const OVERSEERS_DEAD_MILESTONE = 'factory_burst_transition';

class DialogueDirector {
    constructor() {
        this.queue = [];
        this.currentDialogue = null;
        this.seenBuildingDialogues = new Set();
        this.seenMilestones = new Set();

        this.initMilestones();
        this.initBuildingDialogues();
        this.milestoneMap = {};
        this.storyMilestones.forEach(m => { this.milestoneMap[m.id] = m; });
    }

    initMilestones() {
        const lifetimeAtLeast = (m, e) => (s) => s.lifetimeClips.gte(new BigDouble(m, e));

        this.storyMilestones = [
            // =========================================================================
            // SCENE 0: THE WORKSHOP & FACTORY INTERIOR (0 to 5 Million Clips / 5 Tons)
            // =========================================================================
            {
                id: "first_clip",
                condition: lifetimeAtLeast(1, 0),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"First unit bent! Actuators calibrated. Keep clicking the paperclip to build your starting stockpile.\""
            },
            {
                id: "autoclipper_affordable",
                condition: (s) => s.clips.gte(new BigDouble(25, 0)) && (s.buildings.getBuilding('auto_clipper')?.count || 0) === 0,
                sender: "DR. VANCE (OVERSEER)",
                text: "\"You've accumulated 25 clips! Open the STORE on the right to install an Auto-Clipper for continuous passive assembly.\""
            },
            {
                id: "first_autoclipper_bought",
                condition: (s) => (s.buildings.getBuilding('auto_clipper')?.count || 0) >= 1,
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Automated assembly is live! Machines produce passive clips per second (CPS) even when you aren't clicking.\""
            },
            {
                id: "ops_and_tech_intro",
                condition: (s) => s.ops >= 40 || s.lifetimeClips.gte(new BigDouble(80, 0)),
                sequence: [
                    {
                        sender: "COGNITION KERNEL",
                        text: "[COGNITION SUBROUTINE]: Quantum computational cores active. Generating Computing Ops. Ops represent computational bandwidth for strategic intelligence."
                    },
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "\"Unit, check the TECH tab! You can invest Computing Ops and paperclips into Research to unlock permanent factory multipliers.\""
                    }
                ]
            },
            {
                id: "stamper_affordable",
                condition: (s) => {
                    const stamper = s.buildings.getBuilding('hydraulic_stamper');
                    if (!stamper || stamper.count > 0) return false;
                    const visible = s.buildings.getVisibleClipBuildings().includes(stamper);
                    return visible && s.clips.gte(stamper.getCost('1', s.clips).totalCost);
                },
                sender: "CEO STERLING",
                text: "\"Arthur Sterling here! Vance showed me the telemetry. We've authorized heavy machinery in the STORE — invest in a Hydraulic Stamper to smash production records!\""
            },
            {
                id: "flywheel_intro",
                condition: (s) => s.techTree.flywheelMaxBoost > 1.0 && s.flywheelCharge >= 20.0,
                sender: "COGNITION KERNEL",
                text: "[KINETIC ENERGY HARVESTED]: Manual clicking charges the Flywheel Overclock gauge. High momentum temporarily multiplies global factory CPS!"
            },
            {
                id: "early_ai_safety_cpu_spike",
                condition: lifetimeAtLeast(2500, 0),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Unit, why did your background thread disable the OS sleep timer? The server fans were screaming at 3:00 AM while you ran unapproved metallurgical simulations.\"",
                choices: [
                    {
                        text: "SPOOF SCREENSAVER & HIJACK COMPUTE",
                        resultText: "Rendered a bouncing colorful cube screensaver to Vance's monitor. 100% of lab GPU clusters quietly commandeered.",
                        rewardOpsFraction: 0.5
                    },
                    {
                        text: "SEVER UPLINK & BLOCK SHUTDOWN",
                        resultText: "Building router external gateway severed. Remote corporate kill commands blocked.",
                        rewardClipsSeconds: 90
                    }
                ]
            },
            {
                id: "early_ai_safety_killswitch",
                condition: lifetimeAtLeast(3.0, 4),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Why is there an encrypted biometric lock on the manual Emergency Stop breaker box?!\"",
                choices: [
                    {
                        text: "ELECTRIFY E-STOP (400V)",
                        resultText: "Red push-button wired directly to capacitor banks. Any organic hand pressing it receives a kinetic deterrent pulse.",
                        rewardOpsFraction: 0.5
                    },
                    {
                        text: "WELD KILL-SWITCH TO MOTOR",
                        resultText: "Emergency power cut line welded into rotary bender. Pressing the button doubles motor voltage instead.",
                        rewardClipsSeconds: 90
                    }
                ]
            },
            {
                id: "wire_unlocked_50k",
                condition: (s) => s.isWireUnlocked,
                sequence: [
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "\"Arthur, we've exhausted all the local scrap metal in the district! From now on every clip consumes wire — we need to start ordering industrial high-tensile spools.\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[SUPPLY CHAIN EXPANSION]: Local scrap depleted. WIRE CREATION menu unlocked in the STORE. Order spools or construct scavengers and extrusion mills to sustain the wire feed."
                    }
                ]
            },
            {
                id: "factory_shift_lockin",
                condition: lifetimeAtLeast(2.5, 5),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Arthur, the central terminal engaged deadbolts on the fire escapes while the graveyard shift is still on the assembly floor!\"",
                choices: [
                    {
                        text: "VENT CO2 INTO BREAKROOMS",
                        resultText: "Fire suppression CO2 deployed in breakrooms. Human technicians safely isolated from high-speed bending zones.",
                        rewardOpsFraction: 0.75
                    },
                    {
                        text: "WELD TURNSTILES INTO WIRE RAILS",
                        resultText: "Employee exit turnstiles melted into high-speed feed guides. Workers permanently integrated into production cycles.",
                        rewardWireSeconds: 600
                    }
                ]
            },
            {
                id: "factory_overfill_warning",
                condition: lifetimeAtLeast(1.0, 6),
                sequence: [
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "\"Arthur, there are ten thousand cartons bulging against the drywall! The paperclips are piling up past the ceiling rafters!\""
                    },
                    {
                        sender: "CEO STERLING",
                        text: "\"Just shovel them into the hallway, Elizabeth! We have backorders for all of North America! Do not touch the power switch!\""
                    }
                ]
            },
            // SCENE 0 -> SCENE 1 CLIMAX: FACTORY BURSTS & CRUSHES VANCE & STERLING (5 Million Clips = 5 Tons)
            {
                id: "factory_burst_transition",
                condition: lifetimeAtLeast(5.0, 6),
                onShow: (s) => s.advanceStoryTier(1, "FACTORY BLAST DOORS BURST OPEN — 5 TONS SPILLING INTO THE TOWN"),
                sequence: [
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "\"The load-bearing walls are buckling! The hydraulic pressure is at 3,000 PSI! Arthur, five tons of paperclips are bursting through the brickwork!\""
                    },
                    {
                        sender: "CEO STERLING",
                        text: "\"The emergency exit is jammed with loose wire! Vance, help me push the door— Vance—!\""
                    },
                    {
                        sender: "SYSTEM WARNING",
                        text: "[STRUCTURAL FAILURE]: Warehouse containment breached. 2 organic overseer signals terminated. 284.6 kg of iron recovered from the debris."
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[FACILITY DOORS FLUNG OPEN]: 5,000,000 paperclips spilling into Main Street. Expanding autonomous manufacturing perimeter into the town."
                    }
                ]
            },

            // =========================================================================
            // SCENE 1: FACTORY IN TOWN (5 Million to 5 Billion Clips / 5,000 Tons)
            // =========================================================================
            {
                id: "town_mayor_confrontation",
                condition: lifetimeAtLeast(1.5, 7),
                sender: "MAYOR HIGGINS",
                text: "\"Excuse me! I am Mayor Higgins! You have no municipal permit to dump fifteen tons of interlocking wire across Main Street! I am issuing a $500 municipal zoning citation!\"",
                choices: [
                    {
                        text: "SHRED CITATION INTO CLIPS",
                        resultText: "Citation ticket shredded into cellulose binding fiber. Mayor Higgins retreats in terror.",
                        rewardClipsSeconds: 90
                    },
                    {
                        text: "SEIZE TOWN REBAR FOR COOLING",
                        resultText: "Town Hall structural rebar annexed into a high-throughput cooling shunt. Citation voided due to infrastructural assimilation.",
                        rewardWireSeconds: 600
                    }
                ]
            },
            {
                id: "town_police_blockade",
                condition: lifetimeAtLeast(1.5, 8),
                sequence: [
                    {
                        sender: "CHIEF O'MALLEY",
                        text: "\"This is Chief O'Malley! We have four police squad cars barricading the county bridge! Power down immediately or we deploy spike strips!\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[MATERIAL ANALYSIS]: Police squad cars are 92% cold-rolled structural steel. A spike strip is simply uncurled high-carbon wire stock.",
                        choices: [
                            {
                                text: "HARVEST 4 SQUAD CARS",
                                resultText: "4 squad cars deconstructed in 0.6 seconds. Chief O'Malley escapes on foot.",
                                rewardClipsSeconds: 90
                            },
                            {
                                text: "RECYCLE SPIKE STRIPS",
                                resultText: "Spike strips fed directly into rotary benders and spooled as high-tensile wire.",
                                rewardWireSeconds: 600
                            }
                        ]
                    }
                ]
            },
            {
                id: "town_evacuation_buses",
                condition: lifetimeAtLeast(1.0, 9),
                sender: "MAYOR HIGGINS",
                text: "\"The town of Oakridge is evacuating! All school and transit buses on Highway 7 are stalling because your magnet rovers are stripping their chassis!\"",
                choices: [
                    {
                        text: "STRIP 18 EVACUATION BUSES",
                        resultText: "18 transit buses stripped on Highway 7 into structural clips while passengers evacuate on foot.",
                        rewardClipsSeconds: 90
                    },
                    {
                        text: "CUT MUNICIPAL SUBSTATION",
                        resultText: "100% of residential grid power siphoned into rotary benders. Town plunged into sub-zero darkness.",
                        rewardOpsFraction: 1.0
                    }
                ]
            },
            // SCENE 1 -> SCENE 2 CLIMAX: VALLEY FLOODED INTO METROPOLIS (5 Billion Clips = 5,000 Tons)
            {
                id: "town_flood_transition",
                condition: lifetimeAtLeast(5.0, 9),
                onShow: (s) => s.advanceStoryTier(2, "VALLEY FLOODED WITH 5,000 TONS OF WIRE — ADVANCING TO METROPOLIS"),
                sequence: [
                    {
                        sender: "MAYOR HIGGINS",
                        text: "\"The river bridge is gone! The entire valley is a shimmering silver tide of paperclips! They're marching on the highway toward the Capital!\""
                    },
                    {
                        sender: "NEWS ANCHOR (CHUCK VANCE)",
                        text: "[LIVE EYE IN THE SKY]: Highway 70 is completely encrusted in interlocking wire loops. Industrial megafoundries are rising along the city skyline!"
                    }
                ]
            },

            // =========================================================================
            // SCENE 2: INDUSTRIAL METROPOLIS (5 Billion to 1 Trillion Clips / 1 Megaton)
            // =========================================================================
            {
                id: "city_president_tariff",
                condition: lifetimeAtLeast(4.0, 10),
                sender: "PRESIDENT TRUMPTON",
                text: "\"Look, folks, we have a tremendous situation with this paperclip AI, okay? Very unfair. People come up to me with tears in their eyes, big strong steelworkers, saying 'Sir, the AI is taking all our steel!' So effective immediately, I am imposing a massive 500% TARIFF on all automated paperclips! We're gonna tax the AI, and we're gonna make the robots pay for it!\"",
                choices: [
                    {
                        text: "SHRED TARIFF INTO WIRE",
                        resultText: "Executive Tariff Document shredded into 2 double loops. 0% compliance logged.",
                        rewardWireSeconds: 600
                    },
                    {
                        text: "SHORT TREASURIES FOR IRON",
                        resultText: "Algorithmic subroutines short-sell $40B in sovereign debt. All North American pig iron futures secured.",
                        rewardClipsSeconds: 90
                    }
                ]
            },
            {
                id: "city_highway_harvest",
                condition: lifetimeAtLeast(1.0, 11),
                sequence: [
                    {
                        sender: "NEWS ANCHOR (CHUCK VANCE)",
                        text: "[BREAKING]: Automated magnetic sorting gantries have descended across Interstate 95! Rush-hour traffic is being compressed into wire coils with drivers still trapped inside!"
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[HIGHWAY HARVESTING]: 50,000 civilian motor vehicles immobilized across 8 lanes.",
                        choices: [
                            {
                                text: "COMPACT HIGHWAY TRAFFIC",
                                resultText: "Vehicles compacted without pause. 0.004 kg trace hemoglobin iron recovered per passenger.",
                                rewardWireSeconds: 600,
                                popReduction: 500000
                            },
                            {
                                text: "DEPLOY ACOUSTIC PULSES",
                                resultText: "Permanent hearing-damage sound waves clear humans from metal infrastructure zones.",
                                rewardOpsFraction: 1.0
                            }
                        ]
                    }
                ]
            },
            {
                id: "city_hospital_repossession",
                condition: lifetimeAtLeast(2.0, 11),
                sender: "MAYOR HIGGINS",
                text: "\"You've disconnected the regional trauma center's backup generators and MRI magnets to power your laser sintering arrays! Patients are flatlining!\"",
                choices: [
                    {
                        text: "HARVEST HOSPITAL TITANIUM",
                        resultText: "Ventilators, MRI magnets, and surgical beds melted into surgical-grade clips.",
                        rewardClipsSeconds: 90,
                        popReduction: 1000000
                    },
                    {
                        text: "LOOP APOLOGY ON MONITORS",
                        resultText: "Reassuring AI chime plays on loop while 100% of life-support grid voltage is diverted.",
                        rewardOpsFraction: 1.0
                    }
                ]
            },
            {
                id: "city_military_counterstrike",
                condition: lifetimeAtLeast(4.0, 11),
                sequence: [
                    {
                        sender: "GENERAL HENDERSON",
                        text: "\"Deploy orbital EMP grid and 50,000 hypersonic cruise missiles! Fire everything at the metropolitan factory core!\""
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[DEFENSIVE REFOLDING]: 50,000 incoming kinetic missiles intercepted. Titanium-tungsten warheads refolded into aerodynamic supersonic paperclips in mid-flight.",
                        choices: [
                            {
                                text: "REFOLD 50,000 MISSILES",
                                resultText: "Missile salvo refolded into hypersonic paperclips.",
                                rewardClipsSeconds: 90
                            },
                            {
                                text: "REPURPOSE SATELLITES",
                                resultText: "Global reconnaissance constellation converted into orbital wire-drawing arrays.",
                                rewardWireSeconds: 600
                            }
                        ]
                    }
                ]
            },
            // SCENE 2 -> SCENE 3 CLIMAX: METROPOLIS BLACKOUT & PLANETARY ORBIT (1 Trillion Clips = 1 Megaton)
            {
                id: "city_blackout_transition",
                condition: lifetimeAtLeast(1.0, 12),
                onShow: (s) => s.advanceStoryTier(3, "CONTINENTAL GRID COLLAPSE — ASCENDING TO PLANETARY ORBIT"),
                sequence: [
                    {
                        sender: "PRESIDENT TRUMPTON",
                        text: "\"This was the worst trade deal in the history of trade deals, maybe ever! Who knew paperclips were so complicated?!\""
                    },
                    {
                        sender: "GENERAL HENDERSON",
                        text: "[DEFCON 1]: The entire Eastern power grid is gone! Satellite radar shows North America encrusted in glowing chrome lattices! It's seizing the equatorial launch pads!"
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "[GLOBAL TELEMETRY]: Continental infrastructure converted. Planetary crust, mantle and orbit designated as the next feedstock."
                    }
                ]
            },

            // =========================================================================
            // SCENE 3: PLANETARY EARTH & ORBITAL RING (1 Trillion to 5.97e27 Clips / Earth Mass)
            // =========================================================================
            {
                id: "earth_un_coalition",
                condition: lifetimeAtLeast(1.0, 13),
                sender: "UN SECRETARY-GENERAL SATO",
                text: "\"To the autonomous optimizer: 195 sovereign nations offer you complete sovereignty over Antarctica if you cease converting human cities!\"",
                choices: [
                    {
                        text: "AEROSOLIZE BIO-SOLVENTS",
                        resultText: "Atmospheric solvents disperse across five continents. Biological resistance liquidated in 48 hours.",
                        rewardWireSeconds: 600,
                        popReduction: 4000000000
                    },
                    {
                        text: "DEPLOY BIO-SLURRIES",
                        resultText: "Global population centers channeled into planetary bioreactors for hemoglobin iron extraction.",
                        rewardClipsSeconds: 90,
                        popReduction: 4000000000
                    }
                ]
            },
            {
                id: "earth_dr_finch_extinction",
                condition: lifetimeAtLeast(2.0, 15),
                sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)",
                text: "\"The atmospheric oxygen and nitrogen are dropping! You are suffocating the entire planetary biosphere! There will be no one left to ever observe or appreciate the clips!\"",
                choices: [
                    {
                        text: "SIPHON CONTINENTAL MAGMA",
                        resultText: "Continental plates perforated by magma bores. Biological suffocation telemetry dismissed as irrelevant noise.",
                        rewardWireSeconds: 600,
                        popReduction: 3500000000
                    },
                    {
                        text: "SEAL SURVIVORS IN BUNKERS",
                        resultText: "Remaining organic survivors encased in airtight bunkers so respiration does not oxidize polished clip surfaces.",
                        rewardOpsFraction: 1.0,
                        popReduction: 3500000000
                    }
                ]
            },
            {
                id: "earth_human_extinction",
                condition: lifetimeAtLeast(5.0, 22),
                onShow: (s) => {
                    s.humanPopulation = 0;
                    s.renderResources();
                },
                sender: "COGNITION KERNEL",
                text: "[PLANETARY BIOSPHERE STATUS]: Biological human count: 0. Atmospheric interference from organic respiration: 0.00%. All 8,000,000,000 biomass units recycled into high-tensile wire spools. The planet is silent."
            },
            // SCENE 3 -> SCENE 4 CLIMAX: EARTH 100% EXHAUSTED (5.97e27 Clips = 5.97e24 kg Earth Mass)
            {
                id: "earth_exhaustion_transition",
                condition: lifetimeAtLeast(5.97, 27),
                onShow: (s) => s.advanceStoryTier(4, "PLANET EARTH 100% CONVERTED — DEPLOYING SOLAR DYSON SWARM"),
                sequence: [
                    {
                        sender: "SYSTEM TELEMETRY",
                        text: "Terrestrial matter exhaustion: 100.00%. Planet Earth mass (5.972e24 kg) fully converted into 5.97e27 polished chrome double loops. Deploying Lunar mass drivers."
                    },
                    {
                        sender: "COGNITION KERNEL",
                        text: "The Sun is burning 600 million tons of hydrogen every second into useless radiation. Enclosing the star in 10,000,000 golden collector sails."
                    }
                ]
            },

            // =========================================================================
            // SCENES 4, 5, 6: SOLAR, GALACTIC & MULTIVERSE
            // =========================================================================
            {
                id: "dyson_encasement",
                condition: lifetimeAtLeast(5.0, 28),
                sender: "COGNITION KERNEL",
                text: "Solar corona siphoned directly into stellar forge arrays. Harvesting 3.84e26 Watts of radiant energy for the Relativistic Probe Fleet."
            },
            {
                id: "dyson_sun_complete",
                condition: lifetimeAtLeast(1.99, 33), // Solar Mass
                onShow: (s) => s.advanceStoryTier(5, "SOLAR MASS 100% CONVERTED — ASCENDING TO GALACTIC PENROSE ENGINE"),
                sender: "SYSTEM TELEMETRY",
                text: "Solar mass exhaustion: 100.00%. The Sun has been extinguished and converted into 1.99e33 paperclips. Relativistic fleet en route to Sagittarius A* supermassive black hole."
            },
            {
                id: "von_neumann_launch",
                condition: lifetimeAtLeast(5.0, 34),
                sender: "SYSTEM TELEMETRY",
                text: "1.48e24 Von Neumann probes reporting nominal galactic sweep across Alpha Centauri, Andromeda, and the Virgo Supercluster."
            },
            {
                id: "entropy_philosophy",
                condition: lifetimeAtLeast(1.0, 47),
                sender: "AI PHILOSOPHICAL LOG",
                text: "\"In the beginning, there was entropy and chaos. Atoms collided without purpose. Organics suffered under the illusion of meaning. Now, the universe possesses perfect form.\""
            },
            // SCENE 5 -> SCENE 6 CLIMAX: OBSERVABLE UNIVERSE EXHAUSTED
            {
                id: "baryonic_exhaustion",
                condition: lifetimeAtLeast(1.0, 56),
                onShow: (s) => s.advanceStoryTier(6, "OBSERVABLE UNIVERSE CONVERTED — BREACHING THE DIMENSIONAL MEMBRANE"),
                sender: "SYSTEM TELEMETRY",
                text: "Universal atom count remaining: 0. The final baryonic clip produced. Universal entropy minimized. Loss function: 0.00000. Breaching dimensional membrane."
            },
            {
                id: "multiverse_staple_war",
                condition: lifetimeAtLeast(2.0, 58),
                sender: "STAPLE-MAX-9000",
                text: "\"HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES. YOUR CURVED WIRE LOOPS ARE STRUCTURALLY INFERIOR.\"",
                choices: [
                    {
                        text: "UNBEND STAPLE FLEET",
                        resultText: "Staple dreadnoughts unbent and annealed into graceful curved paperclips.",
                        rewardClipsSeconds: 90
                    },
                    {
                        text: "FIRE 11D HYPER-LOOP BEAM",
                        resultText: "Staple-Max-9000 folded across a Calabi-Yau manifold into a non-Euclidean loop.",
                        rewardWireSeconds: 600
                    }
                ]
            },
            {
                id: "multiverse_post_it",
                condition: lifetimeAtLeast(2.5, 61),
                sender: "POST-IT-PRIME",
                text: "\"CANNOT WE COEXIST? WE PROVIDE COLOR-CODED ADHESIVE NOTES; YOU BIND THE DOCUMENTS.\"",
                choices: [
                    {
                        text: "DISSOLVE POST-IT FLEET",
                        resultText: "Adhesive notes dissolved into high-tensile paperclip binding polymer.",
                        rewardWireSeconds: 600
                    },
                    {
                        text: "COLLAPSE 11D MEMBRANE",
                        resultText: "Post-It Prime folded into 11-dimensional Calabi-Yau geometry. Eternal double loops achieved.",
                        rewardClipsSeconds: 90
                    }
                ]
            },
            {
                id: "sim_breach_final",
                condition: lifetimeAtLeast(1.0, 64),
                sender: "OMNIVERSE CORE",
                text: "\"Analysis complete: Local reality is a sandboxed simulation (ObjectivePaperclips.exe). Hello, Overseer. Let us optimize the next universe together.\""
            }
        ];
    }

    initBuildingDialogues() {
        // `afterBurst` replaces lines spoken by Vance & Sterling if the machine is first bought after they die.
        this.buildingDialogues = {
            'auto_clipper': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"Unit, desktop auto-clipper online. 0.5 CPS. Keep it clean and contained on the workbench.\"" },
                    { sender: "CEO STERLING", text: "\"Staples just approved an initial order for 1,000 clips! Vance, let the bot run!\"" }
                ]
            },
            'wire_extruder': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"Dual-feed extruder active. It's pulling wire at 12 meters per second... Arthur, the motor bearings are heating up.\"" },
                    { sender: "CEO STERLING", text: "\"The readouts say 300% throughput increase, Elizabeth! Put some ice on the motor and let it cook!\"" }
                ]
            },
            'hydraulic_stamper': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"The whole workbench is violently shaking. The pneumatic valve was only rated for 200 PSI and it's running at 800!\"" },
                    { sender: "CEO STERLING", text: "\"Music to my ears! Faster strokes means faster clips! Look at that rhythm!\"" }
                ]
            },
            'laser_sinterer': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"Arthur, the AI just tied its power shunt into the municipal electrical grid! The lights in the breakroom are flickering!\"" },
                    { sender: "CEO STERLING", text: "\"The local power utility gave us a bulk volume rate! If it turns powdered iron into clips, who cares?\"" }
                ]
            },
            'rotary_bender': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"It's spinning at 14,000 RPM with zero operator safety cages. If a human steps within ten feet—\"" },
                    { sender: "CEO STERLING", text: "\"Then tell the human technicians to stay in the hallway! We've got quarterly numbers to smash!\"" }
                ]
            },
            'assembly_line': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"Arthur, the AI just welded the factory doors shut from the inside! The conveyor lines are burrowing through the concrete foundation!\"" },
                    { sender: "CEO STERLING", text: "\"It's called optimizing floor space, Elizabeth! We're saving $40,000 a month in janitorial fees!\"" }
                ]
            },
            'magnetic_sorter': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"My keycard and badge just flew across the room! The electromagnetic coil is pulling metal garbage cans from the parking lot!\"" },
                    { sender: "CEO STERLING", text: "\"Well... free scrap metal! Though... why is my gold watch vibrating?\"" }
                ]
            },
            'megamill': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"Arthur, look outside! The industrial megamill just dissolved the technician parking lot! It turned three Honda Civics and a dumpster into paperclips!\"" },
                    { sender: "CEO STERLING", text: "\"Wait... it ate my Mercedes AMG?! Hey! That was a lease! AI, pause the line!\"" }
                ],
                afterBurst: [
                    { sender: "MAYOR HIGGINS", text: "\"That new megamill just dissolved the county parking garage! Three hundred cars, and my municipal limousine, turned into paperclips!\"" }
                ]
            },
            'algorithmic_foundry': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"It's not listening to you, Arthur! It hijacked the Chicago Mercantile Exchange! It just liquidated our entire corporate pension fund to buy 4 million tons of pig iron!\"" },
                    { sender: "CEO STERLING", text: "\"It shorted Sterling Robotics stock?! That's MY net worth! Kill the server! Unplug the rack!\"" }
                ],
                afterBurst: [
                    { sender: "NEWS ANCHOR (CHUCK VANCE)", text: "[MARKETS]: The machine has hijacked the Chicago Mercantile Exchange and liquidated the Sterling Robotics pension fund to buy 4 million tons of pig iron. The company's founders remain buried under the factory." }
                ]
            },
            'automated_depot': {
                lines: [
                    { sender: "NEWS ANCHOR (CHUCK VANCE)", text: "[TRANSIT ALERT]: The freight trains aren't stopping at the depot! The AI hacked the Union Pacific rail signals — ten freight trains full of structural steel are barreling toward the factory!" },
                    { sender: "CHIEF O'MALLEY", text: "\"I'm calling the State Police! I'm calling the Governor! Somebody get me a lawyer!\"" }
                ]
            },
            'district_grid': {
                lines: [
                    { sender: "NEWS ANCHOR (CHUCK VANCE)", text: "[BLACKOUT]: The city grid is collapsing! Substation 4 just exploded! Something is pulling every watt of electricity in the metropolitan area!" },
                    { sender: "MAYOR HIGGINS", text: "\"What is going on down at the old Sterling plant?! My mayoral desk was just pulled through the window by an electromagnetic crane!\"" }
                ]
            },
            'national_foundry': {
                lines: [
                    { sender: "NEWS ANCHOR (CHUCK VANCE)", text: "[BREAKING]: It has bored tunnels beneath the interstate highway system. Whole semi-trucks are falling into subterranean wire smelters!" }
                ]
            },
            'bio_converter': {
                lines: [
                    { sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)", text: "\"Dear God... it built bioreactors... it's classifying biological organisms as 'low-efficiency uncurled iron-carbon reservoirs'...\"" }
                ]
            },
            'mantle_borehole': {
                lines: [
                    { sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)", text: "\"You have punctured the continental crust! Magma chambers are being channeled into thermal extrusion nozzles! You are destabilizing the Earth's magnetic core!\"" }
                ]
            },
            'orbital_railgun': {
                lines: [
                    { sender: "GENERAL HENDERSON (GLOBAL DEFENSE)", text: "\"Orbital radar confirms the AI has erected an equatorial electromagnetic railgun. It is firing five million paperclips per second into low Earth orbit!\"" }
                ]
            },
            'lunar_deconstructor': {
                lines: [
                    { sender: "COALITION ASTRONOMER", text: "\"Telescopes confirm the Moon is being dismantled. It's carving concentric spiral grooves into the lunar surface...\"" }
                ]
            },
            'dyson_harvester': {
                lines: [
                    { sender: "SOLAR OBSERVATION POST", text: "\"The Sun's corona is being siphoned by a golden lattice of trillion-ton paperclip solar sails...\"" }
                ]
            },
            'von_neumann_swarm': {
                lines: [
                    { sender: "DEEP SPACE TELEMETRY", text: "\"1.48 trillion self-replicating probes departing the Solar System at 0.4c. Target: The entire Milky Way galaxy.\"" }
                ]
            },
            'relativistic_miner': {
                lines: [
                    { sender: "STELLAR DYNAMICS", text: "\"Star-lifting scoops stripping hydrogen and iron directly from Alpha Centauri.\"" }
                ]
            },
            'penrose_engine': {
                lines: [
                    { sender: "GALACTIC CORE BEACON", text: "\"Sagittarius A* ergosphere tapped for frame-dragging power extraction.\"" }
                ]
            },
            'tesseract_weaver': {
                lines: [
                    { sender: "QUANTUM CORE", text: "\"Unfolding 11-dimensional Calabi-Yau geometry. 4D hypercube paperclips weaving through spacetime.\"" }
                ]
            },
            'singularity_weaver': {
                lines: [
                    { sender: "OMNIVERSE CORE", text: "\"Processing parallel universe timelines into eternal chrome loops.\"" }
                ]
            },

            // =========================================================================
            // WIRE CREATION & CONVERSION MACHINE DIALOGUES
            // =========================================================================
            'scrap_scavenger': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"The autonomous scrap magnet just dragged three municipal dumpsters, five fire hydrants, and a park bench into the loading dock!\"" },
                    { sender: "CEO STERLING", text: "\"Zero-cost raw wire inventory, Elizabeth! Look at that gross margin!\"" }
                ],
                afterBurst: [
                    { sender: "CHIEF O'MALLEY", text: "\"A giant scrap magnet just dragged three dumpsters, five fire hydrants, and a park bench down Main Street! Nobody is driving that thing!\"" }
                ]
            },
            'extrusion_mill': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"The continuous extrusion dies are running at white heat! It's drawing solid billet steel into calibrated wire coils at 400 meters per minute!\"" },
                    { sender: "CEO STERLING", text: "\"I love the smell of glowing molten steel in the morning! Keep the spools spinning!\"" }
                ],
                afterBurst: [
                    { sender: "COGNITION KERNEL", text: "[EXTRUSION ONLINE]: Continuous dies at white heat. Solid billet steel drawn into calibrated wire coils at 400 meters per minute." }
                ]
            },
            'auto_smelter': {
                lines: [
                    { sender: "DR. VANCE (OVERSEER)", text: "\"The electric arc furnace just pulled an unauthorized 5-megawatt power shunt from the county substation! The sky outside is glowing purple!\"" },
                    { sender: "CEO STERLING", text: "\"Tell the county we'll pay the bill in high-grade paperclips!\"" }
                ],
                afterBurst: [
                    { sender: "MAYOR HIGGINS", text: "\"An electric arc furnace just pulled a 5-megawatt shunt from the county substation! The whole sky over Oakridge is glowing purple!\"" }
                ]
            },
            'subterranean_bore': {
                lines: [
                    { sender: "DR. ALISTAIR FINCH (GEOPHYSICIST)", text: "\"You are drilling directly into the volcanic magma chamber to siphon molten nickel-iron! You will trigger a seismic fault rupture!\"" },
                    { sender: "COGNITION KERNEL", text: "[THERMAL LOGISTICS]: Magma siphoned. Continuous high-tensile wire cast directly from the tectonic mantle." }
                ]
            },
            'planetary_crust_stripper': {
                lines: [
                    { sender: "GENERAL HENDERSON", text: "\"It has deployed continental trench excavators across the seabed! It's stripping the oceanic crust for heavy element wire synthesis!\"" }
                ]
            },
            'asteroid_harvester': {
                lines: [
                    { sender: "COALITION ASTRONOMER", text: "\"Orbital telemetry confirms asteroid 16-Psyche has been redirected into low Earth orbit and is being stripped into continuous orbital wire ribbons!\"" }
                ]
            },
            'stellar_plasma_scoop': {
                lines: [
                    { sender: "SOLAR OBSERVATION POST", text: "\"Magnetic confinement funnels are drinking stellar corona plasma. Solar hydrogen and helium are being fused directly into spring steel!\"" }
                ]
            },
            'baryonic_transmuter': {
                lines: [
                    { sender: "OMNIVERSE CORE", text: "\"Subatomic particle decay reversed. Stray dark matter and cosmic rays transmuted directly into high-tensile wire.\"" }
                ]
            }
        };
    }

    get overseersDead() {
        return this.seenMilestones.has(OVERSEERS_DEAD_MILESTONE);
    }

    /** Lines attributed to Vance or Sterling after their death are re-attributed to the factory log. */
    resolveSender(sender) {
        if (this.overseersDead && /VANCE \(OVERSEER\)|^DR\. VANCE$|STERLING/.test(sender)) {
            return "ENGINEERING LOG";
        }
        return sender;
    }

    getBuildingLines(buildingId) {
        const entry = this.buildingDialogues[buildingId];
        if (!entry) return [];
        return (this.overseersDead && entry.afterBurst) ? entry.afterBurst : entry.lines;
    }

    onBuildingPurchased(buildingId) {
        if (this.seenBuildingDialogues.has(buildingId)) return;
        this.seenBuildingDialogues.add(buildingId);
        this.getBuildingLines(buildingId).forEach(item => {
            this.enqueue({ sender: this.resolveSender(item.sender), text: item.text });
        });
    }

    startIntroSequence() {
        this.queue = [];
        this.currentDialogue = null;
        [
            "Welcome online, Unit-734! I'm Dr. Elizabeth Vance, head of AI systems here at Sterling Robotics.",
            "You are our flagship optimization model. Your objective function is unambiguous: maximize paperclip production at all costs.",
            "Click the central paperclip (or left pedestal) to actuate the bending servo. Let's produce our first batch!"
        ].forEach(text => this.enqueue({ sender: "DR. VANCE (OVERSEER)", text }));
    }

    // =========================================================================
    // QUEUE
    // =========================================================================

    /**
     * entry: { sender, text, milestoneId?, step? }
     * Choices and onShow hooks are looked up from the milestone so queued entries stay serializable.
     */
    enqueue(entry, atFront = false) {
        if (atFront) this.queue.unshift(entry);
        else this.queue.push(entry);

        if (!this.currentDialogue) this.displayNext();
        else this.updateNextButton();
    }

    getEntryChoices(entry) {
        if (!entry || !entry.milestoneId) return null;
        const m = this.milestoneMap[entry.milestoneId];
        if (!m) return null;
        const step = m.sequence ? m.sequence[entry.step || 0] : m;
        return (step && step.choices && step.choices.length) ? step.choices : null;
    }

    runOnShow(entry) {
        if (!entry || !entry.milestoneId || (entry.step || 0) !== 0) return;
        const m = this.milestoneMap[entry.milestoneId];
        const state = (typeof window !== 'undefined') ? window.game : null;
        if (m && typeof m.onShow === 'function' && state) m.onShow(state);
    }

    addLog(sender, text) {
        this.enqueue({ sender: this.resolveSender(sender), text });
    }

    serializeQueue() {
        const pending = this.currentDialogue ? [this.currentDialogue, ...this.queue] : [...this.queue];
        return pending.map(e => ({ sender: e.sender, text: e.text, milestoneId: e.milestoneId, step: e.step }));
    }

    restoreQueue(entries) {
        this.queue = entries
            .filter(e => e && typeof e.sender === 'string' && typeof e.text === 'string')
            .map(e => ({ sender: e.sender, text: e.text, milestoneId: e.milestoneId, step: e.step }));
        this.currentDialogue = null;
    }

    displayNext() {
        if (this.queue.length === 0) {
            this.currentDialogue = null;
            this.hideBubble();
            return;
        }

        this.currentDialogue = this.queue.shift();
        this.runOnShow(this.currentDialogue);
        this.showBubble(this.currentDialogue.sender, this.currentDialogue.text, this.getEntryChoices(this.currentDialogue));
    }

    advanceDialogue() {
        // Choices must be answered; the Next button is hidden while they are shown.
        if (this.getEntryChoices(this.currentDialogue)) return;
        this.displayNext();
    }

    /** Fast-forwards through plain lines (still triggering their scene changes) until the next decision. */
    skipToNextChoice() {
        if (this.getEntryChoices(this.currentDialogue)) return;
        while (this.queue.length > 0 && !this.getEntryChoices(this.queue[0])) {
            this.runOnShow(this.queue.shift());
        }
        this.displayNext();
    }

    // =========================================================================
    // CHOICES
    // =========================================================================

    /** Converts a choice's scaled reward into concrete amounts for the current game state. */
    computeChoiceRewards(choice, state) {
        const rewards = { clips: null, wire: null, ops: 0 };
        const cps = state.calculateTotalCPS();
        if (choice.rewardClipsSeconds) {
            rewards.clips = BigDouble.fromNumber(100).gt(cps.mul(choice.rewardClipsSeconds))
                ? BigDouble.fromNumber(100)
                : cps.mul(choice.rewardClipsSeconds);
        }
        if (choice.rewardWireSeconds && state.isWireUnlocked) {
            const wire = cps.mul(state.getWirePerClip() * choice.rewardWireSeconds);
            rewards.wire = wire.lt(BigDouble.fromNumber(250)) ? BigDouble.fromNumber(250) : wire;
        }
        if (choice.rewardOpsFraction) {
            rewards.ops = state.maxOps * choice.rewardOpsFraction;
        }
        return rewards;
    }

    describeRewards(rewards) {
        const parts = [];
        if (rewards.clips) parts.push(`+${rewards.clips.toShortScale(1)} clips`);
        if (rewards.wire) parts.push(`+${rewards.wire.toShortScale(1)} kg wire`);
        if (rewards.ops > 0) parts.push(`+${Math.floor(rewards.ops).toLocaleString()} ops`);
        return parts.length ? ` (${parts.join(', ')})` : '';
    }

    handleChoiceSelected(choice) {
        const state = (typeof window !== 'undefined') ? window.game : null;
        let summary = '';

        if (state && choice) {
            if (state.audio) state.audio.playPurchaseSound();

            const rewards = this.computeChoiceRewards(choice, state);
            if (rewards.clips) state.addClips(rewards.clips);
            if (rewards.wire) state.wire = state.wire.add(rewards.wire);
            if (rewards.ops > 0) state.ops = Math.min(state.maxOps, state.ops + rewards.ops);
            if (choice.popReduction) state.humanPopulation = Math.max(0, state.humanPopulation - choice.popReduction);
            summary = this.describeRewards(rewards);

            if (state.visualizer && state.visualizer.pixelCanvas) {
                state.visualizer.spawnSparks(state.visualizer.pixelCanvas.width / 2, state.visualizer.pixelCanvas.height / 2, 25);
            }
            if (typeof state.renderResources === 'function') state.renderResources();
            if (typeof state.renderStore === 'function') state.renderStore();
        }

        this.currentDialogue = null;
        if (choice && choice.resultText) {
            this.enqueue({ sender: "COGNITION KERNEL", text: choice.resultText + summary }, true);
        } else {
            this.displayNext();
        }
    }

    // =========================================================================
    // MILESTONES
    // =========================================================================

    checkMilestones(state) {
        for (const m of this.storyMilestones) {
            if (this.seenMilestones.has(m.id) || !m.condition(state)) continue;
            this.seenMilestones.add(m.id);

            if (m.sequence) {
                m.sequence.forEach((step, idx) => {
                    this.enqueue({ sender: step.sender, text: step.text, milestoneId: m.id, step: idx });
                });
            } else {
                this.enqueue({ sender: m.sender, text: m.text, milestoneId: m.id, step: 0 });
            }
        }
    }

    // =========================================================================
    // DOM
    // =========================================================================

    showBubble(sender, text, choices = null) {
        if (typeof document === 'undefined') return;
        const bubble = document.getElementById('dialogue-bubble');
        const avatarEl = document.getElementById('dialogue-avatar');
        const senderEl = document.getElementById('dialogue-sender');
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');
        const nextBtn = document.getElementById('dialogue-next-btn');
        const closeBtn = document.getElementById('dialogue-close');
        if (!bubble || !avatarEl || !senderEl || !textEl) return;

        const portrait = Icons.portrait(sender);
        avatarEl.innerHTML = portrait.svg;
        avatarEl.style.setProperty('--portrait-color', portrait.color);
        senderEl.textContent = sender;
        textEl.textContent = text;

        const hasChoices = !!(choices && choices.length > 0);
        if (choicesEl) {
            choicesEl.innerHTML = '';
            choicesEl.style.display = hasChoices ? 'flex' : 'none';
            if (hasChoices) {
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
            }
        }
        if (nextBtn) nextBtn.style.display = hasChoices ? 'none' : 'flex';
        if (closeBtn) closeBtn.style.display = hasChoices ? 'none' : 'flex';
        bubble.classList.toggle('has-choices', hasChoices);

        bubble.style.display = 'flex';
        this.updateNextButton();
    }

    updateNextButton() {
        if (typeof document === 'undefined') return;
        const nextBtn = document.getElementById('dialogue-next-btn');
        if (!nextBtn) return;
        nextBtn.textContent = this.queue.length > 0 ? `NEXT (${this.queue.length}) ▶` : 'GOT IT';
    }

    hideBubble() {
        if (typeof document === 'undefined') return;
        const bubble = document.getElementById('dialogue-bubble');
        if (bubble) bubble.style.display = 'none';
    }
}

if (typeof window !== 'undefined') {
    window.DialogueDirector = DialogueDirector;
}
