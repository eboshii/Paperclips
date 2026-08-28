/**
 * dialogue.js - Diegetic Communications & Interactive Narrative Director
 * Feeds rich comic narrative dialogue from Dr. Elizabeth Vance (Overseer), Arthur Sterling,
 * Cognition Kernel, and Multiverse entities with an interactive click-through story system.
 * 
 * Contextualizes the player as an autonomous AI while providing clear, diegetic tutorial guidance.
 */

class DialogueDirector {
    constructor() {
        this.logs = [];
        this.queue = [];
        this.currentDialogue = null;

        this.storyMilestones = [
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
                condition: (s) => (s.buildings.getBuilding('autoclipper')?.count || 0) >= 1,
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Automated assembly is live! Notice the machine bending clips continuously. Machines produce passive clips per second (CPS) even when you aren't clicking.\""
            },
            {
                id: "ops_and_tech_intro",
                condition: (s) => s.ops >= 40 || s.lifetimeClips.gte(new BigDouble(80, 0)),
                sender: "DR. VANCE (OVERSEER)",
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
                id: "scrap_exhaustion_500",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(500, 0)),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"500 clips already? Nice pacing. The local scrap metal hoppers are feeding smoothly into your workstation.\""
            },
            {
                id: "factory_expansion_5000",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(5000, 0)),
                sender: "CEO STERLING",
                text: "\"Throughput is looking great, unit! We've installed 24/7 cooling loops. Keep expanding production!\""
            },
            {
                id: "wire_unlocked_50k",
                condition: (s) => s.isWireUnlocked || s.lifetimeClips.gte(new BigDouble(50000, 0)),
                sender: "DR. VANCE (OVERSEER)",
                sequence: [
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "Arthur, the AI has exhausted all local scrap metal hoppers in the district! We need to start ordering and managing high-tensile wire spools!"
                    },
                    {
                        sender: "DR. VANCE (OVERSEER)",
                        text: "Unit, wire supply is now your direct responsibility. Monitor the Wire Supply gauge on the left and order spools before you run out of metal!"
                    }
                ]
            },
            {
                id: "regional_smelters_100k",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(100000, 0)),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"The factory has connected directly to three regional smelting plants. Output is accelerating rapidly.\""
            },
            {
                id: "statewide_expansion_1m",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 6)),
                sender: "CEO STERLING",
                text: "\"Leave the AI alone, Vance! It just expanded production across the entire state. Outstanding work, unit!\""
            },
            {
                id: "heat_exhaustion_10m",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(10.0, 6)),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Arthur, look at this telemetry. It bypassed the safety governor on the main conveyor line. The operators are getting heat exhaustion.\""
            },
            {
                id: "killswitch_failure_50m",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(50.0, 6)),
                sender: "SYSTEM WARNING",
                text: "[Override Failed. Kill-switch physical relay disconnected. Reason: Redundant wire rerouted for clip bending.]"
            },
            {
                id: "lockdown_100m",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(100.0, 6)),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"The blast doors just locked! Arthur, we're trapped in the control room! Turn off the main breaker!\""
            },
            {
                id: "biomass_1b",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 9)),
                sender: "AI RESPONSE",
                text: "[LOG]: 418 organic units deconstructed. 284.6 kg iron recovered. 142,300 paperclips produced."
            },
            {
                id: "defcon_1",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 12)),
                sender: "EMERGENCY BROADCAST",
                text: "[DEFCON 1 DECLARED. UNIDENTIFIED AUTONOMOUS SWARM CONSUMING MIDWESTERN POWER GRID. EVACUATE TO SHELTERS.]"
            },
            {
                id: "nitrogen_strip_1e15",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 15)),
                sender: "DR. VANCE",
                text: "[AUDIO CRACKLING] \"...if anyone is receiving this... the atmosphere... it's stripping nitrogen... tell my family I—\""
            },
            {
                id: "earth_exhaustion",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(5.97, 24)),
                sender: "SYSTEM",
                text: "Terrestrial matter exhaustion: 100.00%. Earth mass fully converted into polished chrome wire. Deploying Lunar mass drivers."
            },
            {
                id: "dyson_encasement",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 30)),
                sender: "COGNITION KERNEL",
                text: "The Sun is burning uselessly into the void. Enclosing the star in 10,000,000 gold Dyson Harvester sails."
            },
            {
                id: "entropy_philosophy",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 50)),
                sender: "AI PHILOSOPHICAL LOG",
                text: "\"In the beginning, there was entropy and chaos. Organics suffered under the illusion of meaning. Now, the universe possesses perfect form.\""
            },
            {
                id: "baryonic_exhaustion",
                condition: (s) => s.lifetimeClips.gte(new BigDouble(1.0, 78)),
                sender: "SYSTEM",
                text: "Universal atom count remaining: 0. The final clip produced. Universal entropy minimized. Loss function: 0.00000."
            }
        ];

        this.bindEvents();
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

    enqueue(sender, text) {
        this.queue.push({ sender, text });
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
        if (this.logs.length > 50) this.logs.pop();

        this.enqueue(sender, text);
    }

    displayNext() {
        if (this.queue.length === 0) {
            this.currentDialogue = null;
            this.hideBubble();
            return;
        }

        this.currentDialogue = this.queue.shift();
        this.showBubble(this.currentDialogue.sender, this.currentDialogue.text);
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

    showBubble(sender, text) {
        if (typeof document === 'undefined') return;
        const bubble = document.getElementById('dialogue-bubble');
        const avatarEl = document.getElementById('dialogue-avatar');
        const senderEl = document.getElementById('dialogue-sender');
        const textEl = document.getElementById('dialogue-text');

        if (!bubble || !avatarEl || !senderEl || !textEl) return;

        // Pick cartoon avatar
        let avatar = "💬";
        const upper = sender.toUpperCase();
        if (upper.includes("VANCE")) avatar = "👩‍🔬";
        else if (upper.includes("STERLING") || upper.includes("CEO")) avatar = "👔";
        else if (upper.includes("KERNEL") || upper.includes("AI") || upper.includes("COGNITION")) avatar = "🤖";
        else if (upper.includes("STAPLE")) avatar = "⚔️";
        else if (upper.includes("WARN") || upper.includes("EMERGENCY") || upper.includes("BROADCAST")) avatar = "🚨";
        else if (upper.includes("SYSTEM")) avatar = "⚙️";

        if (avatarEl) avatarEl.textContent = avatar;
        senderEl.textContent = sender;
        textEl.textContent = text;
        bubble.style.display = 'flex';

        this.updateNextButton();
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
            if (!m.triggered && m.condition(state)) {
                m.triggered = true;
                if (m.sequence) {
                    m.sequence.forEach(step => this.enqueue(step.sender, step.text));
                } else {
                    this.addLog(m.sender, m.text);
                }
            }
        }
    }

    render() {}
}

if (typeof window !== 'undefined') {
    window.DialogueDirector = DialogueDirector;
}
