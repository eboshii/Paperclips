/**
 * icons.js - Consistent line-icon set and character portraits (inline SVG).
 * Icons are 24x24, drawn with currentColor so CSS controls their colour.
 */

const ICON_PATHS = {
    // --- UI ---
    clip: '<path d="M9 7v9a3 3 0 0 0 6 0V5.5a4.5 4.5 0 0 0-9 0V16a6 6 0 0 0 12 0V8"/>',
    ops: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M10 10h4v4h-4z"/>',
    wire: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/><path d="M5 10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5M5 14c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    humans: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    store: '<path d="M3 4h2l2.4 11h11L21 7H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    tech: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9l5 6M21 9l-5 6"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    // --- Machines ---
    clipper: '<path d="M4 20h16"/><path d="M7 20v-4h6v4"/><path d="M10 16 13 9l6-2"/><circle cx="13" cy="9" r="1.5"/><path d="M19 7v4"/>',
    extruder: '<rect x="3" y="8" width="8" height="8" rx="1"/><path d="M11 12h10"/><path d="M11 10.5h2M11 13.5h2"/><circle cx="7" cy="12" r="2"/>',
    press: '<path d="M4 21h16M6 21v-4h12v4"/><rect x="8" y="3" width="8" height="5"/><path d="M12 8v4M9 12h6v2H9z"/>',
    laser: '<rect x="3" y="4" width="8" height="6" rx="1"/><path d="M7 10v2"/><path d="M7 12l6 7" stroke-dasharray="2 2"/><path d="M11 19h8M15 17v4"/>',
    rotor: '<circle cx="12" cy="12" r="3"/><path d="M12 9c0-4 2-6 4-6M15 12c4 0 6 2 6 4M12 15c0 4-2 6-4 6M9 12c-4 0-6-2-6-4"/>',
    conveyor: '<rect x="2" y="13" width="20" height="5" rx="2.5"/><circle cx="6" cy="15.5" r="1"/><circle cx="12" cy="15.5" r="1"/><circle cx="18" cy="15.5" r="1"/><rect x="5" y="7" width="5" height="6"/><rect x="13" y="9" width="5" height="4"/>',
    magnet: '<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 4h4v8a2 2 0 0 0 4 0V4h4"/><path d="M6 8h4M14 8h4"/>',
    mill: '<path d="M3 21h18"/><path d="M5 21V10l5 3V10l5 3V6h4v15"/><path d="M16 6V3"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M9.5 12h5M12 9.5v5"/>',
    train: '<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M8 16l-3 5M16 16l3 5"/>',
    pylon: '<path d="M12 2 7 22M12 2l5 20M8 12h8M6 7h12M9.5 16h5"/>',
    factory: '<path d="M3 21V11l5 3v-3l5 3v-3l5 3V4h3v17z"/><path d="M7 18h2M12 18h2"/>',
    biohazard: '<circle cx="12" cy="12" r="2"/><path d="M12 10a4 4 0 1 1 3.5-6M14 13.2a4 4 0 1 1-1.5 7.5M10 13.2a4 4 0 1 1-5.5-3.4"/>',
    drill: '<path d="M9 3h6v5H9z"/><path d="M10 8h4l-2 13z"/><path d="M10.5 11h3M11 14h2"/>',
    satellite: '<rect x="9" y="9" width="6" height="6" transform="rotate(45 12 12)"/><path d="M8 8 4 4M16 16l4 4"/><rect x="1" y="2" width="5" height="3" transform="rotate(45 3.5 3.5)"/><rect x="18" y="19" width="5" height="3" transform="rotate(45 20.5 20.5)"/><path d="M15 6a4 4 0 0 1 3 3"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><circle cx="10" cy="14" r="1"/><circle cx="14" cy="17" r="0.8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    probe: '<path d="M12 3 7 13h10z"/><path d="M9 13l-2 6M15 13l2 6M12 13v8"/><circle cx="12" cy="9" r="1"/>',
    comet: '<circle cx="17" cy="7" r="3"/><path d="M14.5 9.5 4 20M15 11l-7 7M13 8 7 14"/>',
    blackhole: '<circle cx="12" cy="12" r="3.5"/><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)"/>',
    cube: '<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M12 12 21 7M12 12 3 7M12 12v10"/><path d="M12 7l4.5 2.5v5L12 17l-4.5-2.5v-5z"/>',
    spiral: '<path d="M12 12a1.5 1.5 0 1 1 1.5 1.5A3.5 3.5 0 1 1 17 10a5.5 5.5 0 1 1-5.5-5.5 7.5 7.5 0 1 1-7.5 7.5"/>',
    claw: '<path d="M12 2v6"/><path d="M8 8h8"/><path d="M8 8 5 14l3 4M16 8l3 6-3 4"/><path d="M9 20h6"/>',
    spool: '<path d="M6 4h12M6 20h12"/><path d="M8 4v16M16 4v16"/><path d="M8 8h8M8 11h8M8 14h8M8 17h8"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/><path d="M12 22a3 3 0 0 1-3-3c0-2 3-4 3-6 1 2 3 3 3 6a3 3 0 0 1-3 3z"/>',
    volcano: '<path d="M2 21h20L15 10h-6z"/><path d="M9 10l1.5-2h3L15 10"/><path d="M11 5l-1-2M13 5l1-2M12 5V2"/>',
    asteroid: '<path d="M6 8l5-4 6 2 3 6-3 6-6 2-5-3-2-5z"/><circle cx="10" cy="10" r="1.5"/><circle cx="15" cy="14" r="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    plasma: '<circle cx="12" cy="12" r="3"/><path d="M12 9c-2-4-1-6 1-7M15 12c4-1 6 0 7 2M12 15c1 4 0 6-2 7M9 12c-4 1-6 0-7-2"/>',
    atom: '<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    // --- Research ---
    shears: '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8 16 20 3M16 16 4 3"/>',
    flywheel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M12 14v7M3 12h7M14 12h7"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2l1.5 3h-3zM12 22l-1.5-3h3zM2 12l3-1.5v3zM22 12l-3 1.5v-3zM4.9 4.9l3.2 1-2.2 2.2zM19.1 19.1l-3.2-1 2.2-2.2zM4.9 19.1l1-3.2 2.2 2.2zM19.1 4.9l-1 3.2-2.2-2.2z"/><circle cx="12" cy="12" r="7"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><circle cx="10" cy="16" r="1"/><circle cx="14" cy="18" r="0.8"/>',
    antenna: '<path d="M12 12v10M8 22h8"/><path d="M8.5 8.5a5 5 0 0 1 7 0M6 6a8.5 8.5 0 0 1 12 0"/><circle cx="12" cy="11" r="1.5"/>',
    alarm: '<path d="M6 18V12a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 2v2M4 6l1.5 1.5M20 6l-1.5 1.5"/>',
    cursor: '<path d="M5 3l14 7-6 2-2 6z"/><path d="M13 12l5 5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4"/><path d="M11 9l-2 3h4l-2 3"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    scroll: '<path d="M7 3h11a2 2 0 0 1 0 4H7"/><path d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"/><path d="M9 11h6M9 15h6"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-4M11 16V8M15 16v-6M19 16V5"/>',
    'chart-down': '<path d="M3 3v18h18"/><path d="M6 7l4 4 3-3 6 7"/><path d="M19 11v4h-4"/>',
    terminal: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9l4 3-4 3M12 15h6"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3 7 9l5 12 5-12-2-6"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/><circle cx="12" cy="18" r="1.3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    swords: '<path d="M4 4l10 10M14 14l3 3M20 20l-3-3M20 4 10 14M10 14l-3 3M4 20l3-3"/><path d="M15 17l2-2M7 15l2 2"/>',
    anvil: '<path d="M3 8h13a5 5 0 0 1-5 5H9v3h6v4H5v-4h2v-3H6A3 3 0 0 1 3 10z"/><path d="M17 8h4"/>'
};

const TECH_EMOJI_ICON = {
    '🧲': 'magnet', '⚡': 'bolt', '🔄': 'flywheel', '🏭': 'factory', '🔥': 'flame', '📡': 'antenna', '🌋': 'volcano',
    '⚙️': 'gear', '🪡': 'spool', '🪛': 'extruder', '🪐': 'globe', '🩸': 'biohazard', '🧠': 'chip', '🛸': 'probe',
    '🚨': 'alarm', '🗜️': 'press', '🖱️': 'cursor', '🕵️': 'eye', '🕳️': 'blackhole', '🔬': 'flask', '🔨': 'press',
    '🔗': 'link', '🔋': 'battery', '📦': 'box', '📜': 'scroll', '📐': 'grid', '📊': 'chart', '📉': 'chart-down',
    '💻': 'terminal', '💠': 'cube', '💎': 'gem', '🏗️': 'mill', '🏎️': 'gauge', '🎯': 'target', '🌪️': 'spiral',
    '🌐': 'globe', '🌌': 'spiral', '🌁': 'pylon', '🌀': 'spiral', '✂️': 'shears', '⚔️': 'swords', '⚒️': 'anvil', '☀️': 'sun'
};

/**
 * Character portraits: [match regex, accent colour, SVG body].
 * Drawn on a 48x48 canvas: shoulders, head and one identifying feature each.
 */
const PORTRAITS = [
    [/VANCE \(OVERSEER\)|^DR\. VANCE$/, '#7fa6c9',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#e6ecf5"/><path d="M20 33l4 8 4-8" fill="#7fa6c9"/><circle cx="24" cy="21" r="9" fill="#e9c3a0"/><path d="M15 20c0-8 5-11 9-11s9 3 9 11c-2-4-5-6-9-6s-7 2-9 6z" fill="#5a3f3a"/><circle cx="24" cy="8" r="4" fill="#5a3f3a"/><circle cx="20.5" cy="22" r="2.6" fill="none" stroke="#1a1626" stroke-width="1.3"/><circle cx="27.5" cy="22" r="2.6" fill="none" stroke="#1a1626" stroke-width="1.3"/><path d="M23 22h2" stroke="#1a1626" stroke-width="1.3"/>'],
    [/STERLING|^CEO/, '#d9953f',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#26344f"/><path d="M20 33l4 5 4-5-4 15z" fill="#e6ecf5"/><path d="M23 38h2l1 10h-4z" fill="#c4545a"/><circle cx="24" cy="21" r="9" fill="#e9c3a0"/><path d="M15 19c1-7 5-9 10-9 5 0 8 3 8 8-4-3-11-4-18 1z" fill="#1a1626"/><path d="M21 26c2 1 4 1 6 0" stroke="#7a4f3a" stroke-width="1.2" fill="none"/>'],
    [/HIGGINS|MAYOR/, '#c4545a',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#3b2748"/><circle cx="24" cy="22" r="9" fill="#e9c3a0"/><rect x="16" y="3" width="16" height="11" fill="#1a1626"/><rect x="12" y="13" width="24" height="3" rx="1" fill="#1a1626"/><rect x="16" y="11" width="16" height="2" fill="#c4545a"/><path d="M18 26c3-2 9-2 12 0-3 2-9 2-12 0z" fill="#5a3f3a"/>'],
    [/O'MALLEY|CHIEF|POLICE/, '#3f5f86',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#26344f"/><path d="M22 36h4v4h-4z" fill="#ffd27a"/><circle cx="24" cy="22" r="9" fill="#d9a57a"/><path d="M14 16c2-6 6-8 10-8s8 2 10 8z" fill="#26344f"/><rect x="13" y="15" width="22" height="3" rx="1" fill="#1a1626"/><circle cx="24" cy="12" r="1.8" fill="#ffd27a"/>'],
    [/TRUMPTON|PRESIDENT/, '#ec8052',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#172040"/><path d="M20 33l4 5 4-5-4 15z" fill="#e8ebf0"/><path d="M23 38h2l1.5 10h-5z" fill="#d44a7a"/><circle cx="24" cy="22" r="9" fill="#f0a878"/><path d="M13 19c2-9 12-12 21-6 1 2 0 4-2 4-4-4-11-4-19 2z" fill="#ffd27a"/>'],
    [/SATO|UN SECRETARY/, '#62a8d8',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#12204a"/><circle cx="24" cy="41" r="4" fill="none" stroke="#62a8d8" stroke-width="1.3"/><path d="M20 41h8M24 37v8" stroke="#62a8d8" stroke-width="1"/><circle cx="24" cy="21" r="9" fill="#e0b48c"/><path d="M15 21c0-9 5-12 9-12s9 3 9 12c-1-3-2-5-3-6-4 2-8 2-12 0-1 1-2 3-3 6z" fill="#1a1626"/>'],
    [/FINCH|GEOPHYSICIST/, '#8a7a4a',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#3f6b3a"/><circle cx="24" cy="21" r="9" fill="#e9c3a0"/><path d="M16 26c2 6 14 6 16 0-2 3-14 3-16 0z" fill="#9aa0ad"/><path d="M15 17c1-5 5-8 9-8s8 3 9 8z" fill="#9aa0ad"/><rect x="15" y="17" width="18" height="5" rx="2.5" fill="#1a1626"/><circle cx="20" cy="19.5" r="1.7" fill="#62a8d8"/><circle cx="28" cy="19.5" r="1.7" fill="#62a8d8"/>'],
    [/HENDERSON|GENERAL|DEFENSE/, '#8a7a4a',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#343d3f"/><rect x="14" y="38" width="6" height="2" fill="#ffd27a"/><rect x="14" y="41" width="6" height="2" fill="#c4545a"/><circle cx="24" cy="22" r="9" fill="#d9a57a"/><path d="M13 16c3-7 19-7 22 0z" fill="#3f6b3a"/><rect x="12" y="15" width="24" height="3" rx="1" fill="#1c2226"/><circle cx="24" cy="12" r="1.8" fill="#ffd27a"/>'],
    [/NEWS|ANCHOR/, '#d44a7a',
        '<path d="M8 48c0-10 7-15 16-15s16 5 16 15" fill="#7a2f5a"/><circle cx="24" cy="21" r="9" fill="#e9c3a0"/><path d="M15 20c0-8 5-11 9-11s9 3 9 11l-2-5c-3 2-10 2-14 0z" fill="#7a4f3a"/><path d="M15 21c-2 0-2 6 0 6M15 26c3 3 6 3 8 2" stroke="#1a1626" stroke-width="1.3" fill="none"/><circle cx="23.5" cy="28" r="1.3" fill="#1a1626"/>'],
    [/ASTRONOMER|OBSERVATION|TELEMETRY|STELLAR|BEACON|DEEP SPACE/, '#b8e6ff',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#0a0f22"/><circle cx="24" cy="24" r="14" fill="none" stroke="#2a66a8" stroke-width="1.5"/><circle cx="24" cy="24" r="8" fill="none" stroke="#2a66a8" stroke-width="1.5"/><path d="M24 24 36 14" stroke="#b8e6ff" stroke-width="2"/><circle cx="33" cy="16" r="2" fill="#ffd070"/><circle cx="24" cy="24" r="2" fill="#b8e6ff"/>'],
    [/STAPLE/, '#e07ac0',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#2a1a3a"/><path d="M12 32V16h24v16" fill="none" stroke="#c0c8d0" stroke-width="4" stroke-linejoin="round"/><path d="M16 22h4M28 22h4" stroke="#e07ac0" stroke-width="3"/>'],
    [/POST-IT/, '#ffd070',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#2a1a3a"/><path d="M12 10h24v20l-8 8H12z" fill="#ffd070"/><path d="M28 38v-8h8z" fill="#d9953f"/><path d="M17 18h14M17 23h10" stroke="#7a4f3a" stroke-width="2"/>'],
    [/OMNIVERSE|QUANTUM|PHILOSOPHICAL/, '#8ad4b4',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#0b0f14"/><path d="M24 8 40 36H8z" fill="none" stroke="#8ad4b4" stroke-width="1.8"/><path d="M14 26s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" fill="#1a2e33" stroke="#e0fff0" stroke-width="1.3"/><circle cx="24" cy="26" r="3" fill="#e07ac0"/>'],
    [/WARN|EMERGENCY|DEFCON|ALERT/, '#ff6a4a',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#2a0e14"/><path d="M24 10 40 38H8z" fill="#ff6a4a"/><path d="M24 19v10" stroke="#2a0e14" stroke-width="3"/><circle cx="24" cy="33" r="1.8" fill="#2a0e14"/>'],
    [/SYSTEM|ENGINEERING|OFFLINE|LOG/, '#9aa0ad',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#16151f"/><rect x="10" y="12" width="28" height="20" rx="2" fill="none" stroke="#9aa0ad" stroke-width="1.8"/><path d="M15 19l4 3-4 3M22 26h8" stroke="#e8b85c" stroke-width="1.8" fill="none"/><path d="M18 36h12" stroke="#9aa0ad" stroke-width="1.8"/>'],
    // The AI itself: a single unblinking optic
    [/.*/, '#e8b85c',
        '<rect x="4" y="4" width="40" height="40" rx="6" fill="#16151f"/><circle cx="24" cy="24" r="13" fill="#1a1626" stroke="#3d2f48" stroke-width="2"/><circle cx="24" cy="24" r="8" fill="#b23a0c"/><circle cx="24" cy="24" r="4" fill="#ffc861"/><circle cx="22" cy="22" r="1.5" fill="#fff4d6"/>']
];

const Icons = {
    /** Inline SVG for an icon key (or a legacy emoji used by research nodes). */
    svg(name) {
        const key = ICON_PATHS[name] ? name : (TECH_EMOJI_ICON[name] || 'gear');
        return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[key]}</svg>`;
    },

    /** Portrait SVG and accent colour for a dialogue sender. */
    portrait(sender) {
        const upper = (sender || '').toUpperCase();
        const [, color, body] = PORTRAITS.find(([re]) => re.test(upper));
        return { svg: `<svg viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`, color };
    }
};

if (typeof window !== 'undefined') {
    window.Icons = Icons;
}
