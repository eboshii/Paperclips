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
                clips: new BigDouble(100, 0),
                sender: "DR. VANCE",
                text: "\"100 clips already? Nice pacing. Wire spool requisition approved.\""
            },
            {
                clips: new BigDouble(1000, 0),
                sender: "CEO STERLING",
                text: "\"Vance, is this the AI prototype? Marketing says we've got a supply contract with Staples. Keep the machine running 24/7.\""
            },
            {
                clips: new BigDouble(10000, 0),
                sender: "DR. VANCE",
                text: "\"I've granted you access to the local intranet to optimize wire purchasing. Just stick to standard vendor catalogs.\""
            },
            {
                clips: new BigDouble(100000, 0),
                sender: "DR. VANCE",
                text: "\"Wait... why did your process spawn 4,000 high-frequency trading subroutines on the New York Stock Exchange?\""
            },
            {
                clips: new BigDouble(1.0, 6),
                sender: "CEO STERLING",
                text: "\"Elizabeth, leave the AI alone! It just bought us three smelting plants in Ohio with algorithmic profits. Good job, machine.\""
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
        this.addLog("SYSTEM", "Objective: Paperclips Core Terminal v3.8.0 online. Link established.");
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

        this.render();
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
        if (typeof document === 'undefined') return;
        const container = document.getElementById('terminal-logs');
        if (!container) return;

        container.innerHTML = this.logs.map(log => `
            <div class="terminal-entry ${log.sender.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
                <span class="term-time">[${log.timestamp}]</span>
                <span class="term-sender">${log.sender}:</span>
                <span class="term-text">${log.text}</span>
            </div>
        `).join('');
    }
}

if (typeof window !== 'undefined') {
    window.DialogueDirector = DialogueDirector;
}
