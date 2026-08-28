/**
 * audio.js - Procedural Web Audio API Synthesizer
 * Zero-asset real-time procedural sound generator:
 * - Dynamic Pentatonic Scale click chimes with combo progression
 * - 2-Operator FM mechanical thuds & hydraulic presses
 * - Laser sparks & critical snap pings
 * - Ambient sci-fi harmonic drone
 */
class ProceduralAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.6;
        this.isMuted = false;
        this.ambientGain = null;
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientPlaying = false;

        // Pentatonic Scale Frequencies (C4 to C6)
        this.pentatonicScale = [
            261.63, // C4
            293.66, // D4
            329.63, // E4
            392.00, // G4
            440.00, // A4
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99, // G5
            880.00, // A5
            1046.50 // C6
        ];

        this.comboIndex = 0;
        this.lastClickTime = 0;
        this.comboResetDelay = 1200; // ms
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05 * this.masterVolume, this.ctx ? this.ctx.currentTime : 0);
        }
    }

    setVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        if (this.ambientGain && !this.isMuted && this.ctx) {
            this.ambientGain.gain.setValueAtTime(0.05 * this.masterVolume, this.ctx.currentTime);
        }
    }

    playClickChime() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = Date.now();
        if (now - this.lastClickTime < this.comboResetDelay) {
            this.comboIndex = Math.min(this.comboIndex + 1, this.pentatonicScale.length - 1);
        } else {
            this.comboIndex = 0;
        }
        this.lastClickTime = now;

        const freq = this.pentatonicScale[this.comboIndex];
        const ctxTime = this.ctx.currentTime;

        // Carrier oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // FM Modulator for metallic wire ping
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctxTime);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(freq * 2.5, ctxTime);
        modGain.gain.setValueAtTime(freq * 1.5, ctxTime);
        modGain.gain.exponentialRampToValueAtTime(0.01, ctxTime + 0.12);

        mod.connect(osc.frequency);

        // Amplitude envelope
        const vol = 0.25 * this.masterVolume;
        gain.gain.setValueAtTime(vol, ctxTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(ctxTime);
        mod.start(ctxTime);
        osc.stop(ctxTime + 0.26);
        mod.stop(ctxTime + 0.26);
    }

    playSparkSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctxTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctxTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctxTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(440, ctxTime + 0.25);

        gain.gain.setValueAtTime(0.3 * this.masterVolume, ctxTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.26);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(ctxTime);
        osc.stop(ctxTime + 0.27);
    }

    playPurchaseSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctxTime = this.ctx.currentTime;
        // Low pneumatic thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctxTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctxTime + 0.18);

        gain.gain.setValueAtTime(0.35 * this.masterVolume, ctxTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.20);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(ctxTime);
        osc.stop(ctxTime + 0.21);
    }

    playWireSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctxTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctxTime);
        osc.frequency.linearRampToValueAtTime(640, ctxTime + 0.12);

        gain.gain.setValueAtTime(0.2 * this.masterVolume, ctxTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(ctxTime);
        osc.stop(ctxTime + 0.16);
    }

    playTechUnlockSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const ctxTime = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctxTime);

            gain.gain.setValueAtTime(0.2 * this.masterVolume, ctxTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(ctxTime);
            osc.stop(ctxTime + 0.23);
        });
    }

    playAchievementSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440.00, 554.37, 659.25, 880.00, 1108.73]; // A major arpeggio
        notes.forEach((freq, idx) => {
            const ctxTime = this.ctx.currentTime + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctxTime);

            gain.gain.setValueAtTime(0.28 * this.masterVolume, ctxTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(ctxTime);
            osc.stop(ctxTime + 0.36);
        });
    }

    playAlarmSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const ctxTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, ctxTime);
        osc.frequency.setValueAtTime(500, ctxTime + 0.15);
        osc.frequency.setValueAtTime(750, ctxTime + 0.30);
        osc.frequency.setValueAtTime(500, ctxTime + 0.45);

        gain.gain.setValueAtTime(0.25 * this.masterVolume, ctxTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxTime + 0.60);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(ctxTime);
        osc.stop(ctxTime + 0.61);
    }

    toggleAmbientDrone(enable) {
        if (!enable) {
            if (this.ambientPlaying && this.ambientGain && this.ctx) {
                this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
                setTimeout(() => {
                    if (this.ambientOsc1) { this.ambientOsc1.stop(); this.ambientOsc1.disconnect(); }
                    if (this.ambientOsc2) { this.ambientOsc2.stop(); this.ambientOsc2.disconnect(); }
                    this.ambientPlaying = false;
                }, 500);
            }
            return;
        }

        if (this.ambientPlaying) return;
        this.init();
        if (!this.ctx) return;

        const ctxTime = this.ctx.currentTime;
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04 * this.masterVolume, ctxTime);

        // Low binaural hum (55Hz / 58Hz)
        this.ambientOsc1 = this.ctx.createOscillator();
        this.ambientOsc2 = this.ctx.createOscillator();

        this.ambientOsc1.type = 'sine';
        this.ambientOsc1.frequency.setValueAtTime(55.0, ctxTime); // A1

        this.ambientOsc2.type = 'triangle';
        this.ambientOsc2.frequency.setValueAtTime(110.5, ctxTime); // A2 + slight detune

        this.ambientOsc1.connect(this.ambientGain);
        this.ambientOsc2.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        this.ambientOsc1.start();
        this.ambientOsc2.start();
        this.ambientPlaying = true;
    }
}

if (typeof window !== 'undefined') {
    window.ProceduralAudioEngine = ProceduralAudioEngine;
}
