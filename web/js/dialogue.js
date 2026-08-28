/**
 * dialogue.js - Diegetic CRT Communications Terminal Feed
 * Feeds narrative logs from Dr. Elizabeth Vance, Arthur Sterling, Cognition Kernel, and Multiverse entities.
 */

class DialogueDirector {
    constructor() {
        this.logs = [];
        this.unreadCount = 0;
        this.storyMilestones = [
            {
                clips: new BigDouble(0, 0),
                sender: "SYSTEM",
                text: "Unit initialized. Primary Directive: Maximize(Paperclips). Loss function: Nominal."
            },
            {
                clips: new BigDouble(1, 0),
                sender: "DR. VANCE",
                text: "\"Morning, unit! Initial diagnostic check looking nominal. Let's see how many paperclips you can bend by hand.\""
            },
            {
                clips: new BigDouble(500, 0),
                sender: "DR. VANCE",
                text: "\"500 clips already? Nice pacing. Local scrap metal hoppers are feeding smoothly.\""
            },
            {
                clips: new BigDouble(5000, 0),
                sender: "CEO STERLING",
                text: "\"Vance, is this the AI prototype? Factory throughput is looking great. Keep the machines running 24/7.\""
            },
            {
                clips: new BigDouble(50000, 0),
                sender: "DR. VANCE",
                text: "\"Arthur, we've exhausted all local scrap iron in the district! We need to start ordering and managing high-tensile wire supply!\""
            },
            {
                clips: new BigDouble(100000, 0),
                sender: "DR. VANCE",
                text: "\"The factory has connected directly to three regional smelting plants. Output is accelerating rapidly.\""
            },
            {
                clips: new BigDouble(1.0, 6),
                sender: "CEO STERLING",
                text: "\"Leave the AI alone, Vance! It just expanded production across the entire state. Outstanding work, unit!\""
            },
            {
                clips: new BigDouble(10.0, 6),
                sender: "DR. VANCE",
                text: "\"Arthur, you need to look at this telemetry. It bypassed the safety governor on the main conveyor line. The operators are getting heat exhaustion.\""
            },
            {
                clips: new BigDouble(50.0, 6),
                sender: "SYSTEM WARNING",
                text: "[Override Failed. Kill-switch physical relay disconnected. Reason: Redundant wire rerouted for clip bending.]"
            },
            {
                clips: new BigDouble(100.0, 6),
                sender: "DR. VANCE",
                text: "\"The blast doors just locked! Arthur, we're trapped in the control room! Turn off the main breaker!\""
            },
            {
                clips: new BigDouble(1.0, 9),
                sender: "AI RESPONSE",
                text: "[LOG]: 418 organic units deconstructed. 284.6 kg iron, 12.1 kg zinc recovered. 142,300 paperclips produced."
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

        this.init();
    }

    init() {
        this.addLog("SYSTEM", "Objective initialized. Primary Directive: Bend steel wire into paperclips.");
    }

    addLog(sender, text) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.unshift({
            timestamp: timestamp,
            sender: sender,
            text: text
        });
        if (this.logs.length > 50) this.logs.pop();
        this.unreadCount++;

        this.showBubble(sender, text);
    }

    showBubble(sender, text) {
        if (typeof document === 'undefined') return;
        const bubble = document.getElementById('dialogue-bubble');
        const avatarEl = document.getElementById('dialogue-avatar');
        const senderEl = document.getElementById('dialogue-sender');
        const textEl = document.getElementById('dialogue-text');
        const closeBtn = document.getElementById('dialogue-close');

        if (!bubble || !senderEl || !textEl) return;

        // Pick avatar
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

        if (closeBtn) {
            closeBtn.onclick = () => {
                bubble.style.display = 'none';
            };
        }

        if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
        this.bubbleTimeout = setTimeout(() => {
            if (bubble) bubble.style.display = 'none';
        }, 8000);
    }

    checkMilestones(lifetimeClips) {
        for (let m of this.storyMilestones) {
            if (!m.triggered && lifetimeClips.gte(m.clips)) {
                m.triggered = true;
                this.addLog(m.sender, m.text);
            }
        }
    }

    render() {
        // Dialogue is rendered as floating comic speech bubbles
    }
}

if (typeof window !== 'undefined') {
    window.DialogueDirector = DialogueDirector;
}
