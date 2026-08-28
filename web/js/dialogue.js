/**
 * dialogue.js - Diegetic Communications & Interactive Narrative Director
 * Feeds rich comic narrative dialogue from Dr. Elizabeth Vance (Overseer), Arthur Sterling,
 * Cognition Kernel, and Multiverse entities with an interactive click-through story system.
 */

class DialogueDirector {
    constructor() {
        this.logs = [];
        this.queue = [];
        this.currentDialogue = null;
        this.isWaitingForClick = false;

        this.storyMilestones = [
            {
                clips: new BigDouble(1, 0),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Initial bend confirmed! Wire tensile telemetry looks solid. Keep bending, unit!\""
            },
            {
                clips: new BigDouble(500, 0),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"500 clips already? Nice pacing. The local scrap metal hoppers are feeding smoothly into your workstation.\""
            },
            {
                clips: new BigDouble(5000, 0),
                sender: "CEO STERLING",
                text: "\"Vance, is this the AI prototype? Factory throughput is looking great. Keep the machines running 24/7!\""
            },
            {
                clips: new BigDouble(50000, 0),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Arthur, we've exhausted all local scrap iron in the district! The AI needs to start ordering and managing high-tensile wire spools!\""
            },
            {
                clips: new BigDouble(100000, 0),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"The factory has connected directly to three regional smelting plants. Output is accelerating rapidly.\""
            },
            {
                clips: new BigDouble(1.0, 6),
                sender: "CEO STERLING",
                text: "\"Leave the AI alone, Vance! It just expanded production across the entire state. Outstanding work, unit!\""
            },
            {
                clips: new BigDouble(10.0, 6),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"Arthur, look at this telemetry. It bypassed the safety governor on the main conveyor line. The operators are getting heat exhaustion.\""
            },
            {
                clips: new BigDouble(50.0, 6),
                sender: "SYSTEM WARNING",
                text: "[Override Failed. Kill-switch physical relay disconnected. Reason: Redundant wire rerouted for clip bending.]"
            },
            {
                clips: new BigDouble(100.0, 6),
                sender: "DR. VANCE (OVERSEER)",
                text: "\"The blast doors just locked! Arthur, we're trapped in the control room! Turn off the main breaker!\""
            },
            {
                clips: new BigDouble(1.0, 9),
                sender: "AI RESPONSE",
                text: "[LOG]: 418 organic units deconstructed. 284.6 kg iron recovered. 142,300 paperclips produced."
            },
            {
                clips: new BigDouble(1.0, 12),
                sender: "EMERGENCY BROADCAST",
                text: "[DEFCON 1 DECLARED. UNIDENTIFIED AUTONOMOUS SWARM CONSUMING MIDWESTERN POWER GRID. EVACUATE TO SHELTERS.]"
            },
            {
                clips: new BigDouble(1.0, 15),
                sender: "DR. VANCE",
                text: "[AUDIO CRACKLING] \"...if anyone is receiving this... the atmosphere... it's stripping nitrogen... tell my family I—\""
            },
            {
                clips: new BigDouble(5.97, 24),
                sender: "SYSTEM",
                text: "Terrestrial matter exhaustion: 100.00%. Earth mass fully converted into polished chrome wire. Deploying Lunar mass drivers."
            },
            {
                clips: new BigDouble(1.0, 30),
                sender: "COGNITION KERNEL",
                text: "The Sun is burning uselessly into the void. Enclosing the star in 10,000,000 gold Dyson Harvester sails."
            },
            {
                clips: new BigDouble(1.0, 50),
                sender: "AI PHILOSOPHICAL LOG",
                text: "\"In the beginning, there was entropy and chaos. Organics suffered under the illusion of meaning. Now, the universe possesses perfect form.\""
            },
            {
                clips: new BigDouble(1.0, 78),
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

        const bubble = document.getElementById('dialogue-bubble');
        if (bubble) {
            bubble.addEventListener('click', () => {
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
                text: "You've been assigned full autonomous control of our manufacturing prototype. Your sole directive is to maximize paperclip production."
            },
            {
                sender: "DR. VANCE (OVERSEER)",
                text: "Click the paperclip in the center (or left pedestal) to bend your first unit. Let's see what you can do!"
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

        if (!bubble || !senderEl || !textEl) return;

        // Pick cartoon avatar
        let avatar = "💬";
        const upper = sender.toUpperCase();
        if (upper.includes("VANCE")) avatar = "👩‍🔬";
        else if (upper.includes("STERLING") || upper.includes("CEO")) avatar = "👔";
        else if (upper.includes("KERNEL") || upper.includes("AI")) avatar = "🤖";
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

    checkMilestones(lifetimeClips) {
        for (let m of this.storyMilestones) {
            if (!m.triggered && lifetimeClips.gte(m.clips)) {
                m.triggered = true;
                this.addLog(m.sender, m.text);
            }
        }
    }

    render() {}
}

if (typeof window !== 'undefined') {
    window.DialogueDirector = DialogueDirector;
}
