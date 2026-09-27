#!/usr/bin/env node
/**
 * simulate_pacing.js - Headless pacing simulation driving the real web game code.
 *
 * Loads web/js/*.js into a sandbox (no DOM), then plays the game with a simple
 * "sensible player" bot: clicks early on, researches everything it can afford (saving up
 * for research that is a few minutes away), buys the best-payback machine, keeps a wire
 * buffer and answers every choice.
 *
 * Usage: node tools/simulate_pacing.js [hours=10] [--quiet]
 * Prints the time at which each story beat, scene, machine and research landed.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HOURS = parseFloat(process.argv[2] || '10');
const QUIET = process.argv.includes('--quiet');
const argValue = (flag) => {
    const i = process.argv.indexOf(flag);
    return i >= 0 ? process.argv[i + 1] : null;
};
const OVERRIDE_FILE = argValue('--override'); // tuning: { buildings: {id: [log10Cost, log10Rate, r]}, techs: {id: [log10Cost, mult]} }
const TRACE_FILE = argValue('--trace');       // writes [[seconds, log10 lifetime clips], ...]
const WEB_JS = path.join(__dirname, '..', 'web', 'js');

const noop = () => {};
// Deterministic randomness so runs are reproducible
let seed = 12345;
const seededMath = Object.create(Math);
seededMath.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const sandbox = {
    console,
    Math: seededMath,
    Date,
    performance: { now: () => 0 },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    requestAnimationFrame: noop,
    setTimeout: noop
};
sandbox.window = sandbox;
vm.createContext(sandbox);

for (const file of ['bigDouble', 'icons', 'audio', 'buildings', 'techTree', 'spatialGrid', 'achievements', 'news', 'dialogue', 'prestige', 'game']) {
    vm.runInContext(fs.readFileSync(path.join(WEB_JS, `${file}.js`), 'utf8'), sandbox, { filename: `${file}.js` });
}

const { GameEngine, BigDouble } = sandbox;
const game = new GameEngine();
sandbox.game = game;
game.audio = new Proxy({}, { get: () => noop });
game.renderResources = noop;
game.renderStore = noop;
game.renderTechTree = noop;
game.renderAll = noop;

if (OVERRIDE_FILE) {
    const o = JSON.parse(fs.readFileSync(OVERRIDE_FILE, 'utf8'));
    for (const [id, [lc, lr, r]] of Object.entries(o.buildings || {})) {
        const b = game.buildings.getBuilding(id);
        b.baseCost = new BigDouble(Math.pow(10, lc % 1), Math.floor(lc));
        const rate = new BigDouble(Math.pow(10, ((lr % 1) + 1) % 1), Math.floor(lr));
        if (b.type === 'wire') b.baseWPS = rate; else b.baseCPS = rate;
        b.costMultiplier = r;
    }
    for (const [id, [lc, mult]] of Object.entries(o.techs || {})) {
        const node = game.techTree.nodeMap[id];
        node.clipsCost = new BigDouble(Math.pow(10, lc % 1), Math.floor(lc));
        node.onResearched = () => { game.techTree.globalCPSMultiplier *= mult; };
    }
}

const events = [];
const trace = [];
const log = (t, kind, text) => events.push({ t, kind, text });

// Record story beats when they are displayed; answer choices with the first option.
const director = game.dialogue;
director.showBubble = noop;
director.hideBubble = noop;
director.updateNextButton = noop;
const originalDisplayNext = director.displayNext.bind(director);
let simTime = 0;
director.displayNext = () => {
    originalDisplayNext();
    const cur = director.currentDialogue;
    if (!cur) return;
    if (cur.milestoneId && (cur.step || 0) === 0) log(simTime, 'BEAT', cur.milestoneId);
    const choices = director.getEntryChoices(cur);
    if (choices) director.handleChoiceSelected(choices[0]);
    else director.displayNext();
};
const originalAdvance = game.advanceStoryTier.bind(game);
game.advanceStoryTier = (tier, banner) => {
    log(simTime, 'SCENE', `tier ${tier}: ${banner}`);
    originalAdvance(tier, banner);
};

const clicksPerSecond = (t) => (t < 15 * 60 ? 6 : 0);

/** Research the bot is saving up for: the cheapest revealed item affordable within ~4 minutes. */
function savingTarget(cps) {
    if (!cps.gt(BigDouble.zero())) return null;
    let target = null;
    for (const node of game.techTree.getAvailableNodes()) {
        if (game.techTree.canAfford(node.id, game.ops, game.clips) || node.clipsCost.lt(new BigDouble(1, 7))) continue;
        const secs = node.clipsCost.sub(game.clips).div(cps).toDouble();
        if (secs < 240 && (!target || node.clipsCost.lt(target.clipsCost))) target = node;
    }
    // Also save for the next newly revealed machine if it is within ~10 minutes
    for (const b of game.buildings.getVisibleBuildings(game.isWireUnlocked)) {
        if (b.count > 0 || b.type !== 'clips') continue;
        const cost = b.getCost('1', game.clips).totalCost;
        if (cost.gt(game.clips) && cost.sub(game.clips).div(cps).toDouble() < 600 && (!target || cost.lt(target.clipsCost))) {
            target = { clipsCost: cost };
        }
    }
    return target;
}

function buyBestMachine(saveFor) {
    const mult = game.techTree.globalCPSMultiplier;
    let best = null;
    let bestScore = Infinity;
    for (const b of game.buildings.getVisibleBuildings(game.isWireUnlocked)) {
        const cost = b.getCost('1', game.clips).totalCost;
        // Newly revealed machines are bought as soon as they are affordable
        if (b.count === 0 && game.clips.gte(cost)) { best = b; break; }
        if (saveFor && cost.gt(saveFor.clipsCost.mul(0.01))) continue;
        let gain;
        if (b.type === 'wire') {
            // A wire machine is worth the clips it saves on buying spools (10 clips per kg)
            gain = b.getSingleUnitWPS(game).toDouble() * 10 * game.prestige.getGlobalPrestigeMultiplier();
        } else {
            gain = b.getSingleUnitCPS(game).toDouble() * mult;
        }
        if (b.count === 0) gain *= 20; // New machines also reveal the next tier
        const score = cost.toDouble() / Math.max(gain, 1e-300);
        if (score < bestScore) { bestScore = score; best = b; }
    }
    if (!best) return false;
    if (game.clips.lt(best.getCost('1', game.clips).totalCost)) {
        // Saving for the best machine: only pick up items costing under 1% of it
        return saveFor ? false : buyBestMachine({ clipsCost: best.getCost('1', game.clips).totalCost });
    }
    const firstPurchase = best.count === 0;
    if (!game.buyBuilding(best.id)) return false;
    if (firstPurchase) log(simTime, 'MACHINE', best.id);
    return true;
}

function keepWireBuffer(cps) {
    if (!game.isWireUnlocked) return;
    const target = cps.mul(game.getWirePerClip() * 60);
    if (game.wire.lt(target)) {
        const packs = Math.ceil(Math.min(target.sub(game.wire).div(50).toDouble(), game.clips.div(500).toDouble() * 0.25));
        if (packs >= 1) game.buyWire(packs);
    }
}

function researchAffordable() {
    for (const node of game.techTree.getAvailableNodes()) {
        if (game.techTree.canAfford(node.id, game.ops, game.clips) && game.buyTech(node.id)) {
            log(simTime, 'TECH', node.id);
        }
    }
}

director.startIntroSequence();

const END = HOURS * 3600;
let nextStatus = 0;
while (simTime < END) {
    const dt = simTime < 1800 ? 0.5 : (simTime < 7200 ? 2.0 : 5.0);
    const clicks = Math.round(clicksPerSecond(simTime) * dt);
    for (let i = 0; i < clicks; ++i) game.handleManualClick(null);

    const cps = game.tick(dt);
    researchAffordable();
    const saveFor = savingTarget(cps);
    for (let i = 0; i < 25 && buyBestMachine(saveFor); ++i) { /* keep buying */ }
    keepWireBuffer(cps);

    trace.push([simTime, game.lifetimeClips.log10()]);
    if (simTime >= nextStatus) {
        log(simTime, 'STATUS', `lifetime=${game.lifetimeClips.toScientific(1)} cps=${cps.toScientific(1)} mult=${game.techTree.globalCPSMultiplier.toExponential(1)} ops=${Math.floor(game.ops)}/${game.maxOps}`);
        nextStatus += 1800;
    }
    if (game.dialogue.seenMilestones.has('sim_breach_final')) {
        log(simTime, 'END', 'final beat reached');
        break;
    }
    simTime += dt;
}

if (TRACE_FILE) fs.writeFileSync(TRACE_FILE, JSON.stringify({ trace, events }));

const fmt = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    return `${h}h${String(m).padStart(2, '0')}m`;
};
for (const e of events) {
    if (QUIET && (e.kind === 'TECH' || e.kind === 'MACHINE')) continue;
    console.log(`${fmt(e.t).padStart(7)}  ${e.kind.padEnd(7)} ${e.text}`);
}
