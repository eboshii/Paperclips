/**
 * buildings.js - Dual Machine Catalogs: Paperclip Production & Wire Creation/Conversion
 * Implements geometric scaling (1.15x) and bulk purchase calculations.
 */

const BUILDING_VECTOR_ICONS = {
    // Clips Buildings
    'auto_clipper': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="4" y="24" width="24" height="4" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><path d="M12 24 L12 16 L20 10" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="16" r="2.5" fill="#0284c7" stroke="#0f172a" stroke-width="1"/><circle cx="20" cy="10" r="2" fill="#38bdf8" stroke="#0f172a" stroke-width="1"/><path d="M20 10 L24 8 M20 10 L23 13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><path d="M6 10 C6 6, 11 6, 11 10 L11 16 C11 18, 8 18, 8 16 L8 11" stroke="#e2e8f0" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`,
    'wire_extruder': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="3" y="3" width="26" height="26" rx="4" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/><circle cx="16" cy="16" r="4" fill="#00ff88" stroke="#0f172a" stroke-width="1"/><line x1="16" y1="5" x2="16" y2="10" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/><line x1="16" y1="27" x2="16" y2="22" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/><line x1="5" y1="16" x2="10" y2="16" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/><line x1="27" y1="16" x2="22" y2="16" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/><path d="M14 13 C14 11, 18 11, 18 13 L18 19 C18 20.5, 15 20.5, 15 19 L15 14" stroke="#ffffff" stroke-width="1.2" fill="none"/></svg>`,
    'hydraulic_stamper': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="4" y="24" width="24" height="5" rx="1.5" fill="#475569" stroke="#0f172a" stroke-width="1.5"/><line x1="7" y1="24" x2="7" y2="6" stroke="#64748b" stroke-width="2.5"/><line x1="25" y1="24" x2="25" y2="6" stroke="#64748b" stroke-width="2.5"/><rect x="4" y="4" width="24" height="4" rx="1" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><rect x="13" y="8" width="6" height="7" fill="#f59e0b" stroke="#0f172a" stroke-width="1"/><rect x="9" y="15" width="14" height="4" rx="1" fill="#fbbf24" stroke="#0f172a" stroke-width="1.5"/><line x1="11" y1="22" x2="21" y2="22" stroke="#e2e8f0" stroke-width="1.5"/><path d="M13 22 L11 20 M19 22 L21 20" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    'laser_sinterer': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><polygon points="10,4 22,4 19,10 13,10" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><circle cx="16" cy="10" r="2" fill="#a855f7"/><polygon points="16,10 10,24 22,24" fill="rgba(236,72,153,0.25)"/><line x1="16" y1="10" x2="16" y2="24" stroke="#ff00a0" stroke-width="2"/><line x1="16" y1="10" x2="12" y2="24" stroke="#c084fc" stroke-width="1"/><line x1="16" y1="10" x2="20" y2="24" stroke="#c084fc" stroke-width="1"/><circle cx="16" cy="24" r="3" fill="#ffe600"/><circle cx="16" cy="24" r="1.5" fill="#ffffff"/><rect x="4" y="26" width="24" height="3" rx="1" fill="#475569" stroke="#0f172a" stroke-width="1"/></svg>`,
    'rotary_bender': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="12" fill="#0f172a" stroke="#06b6d4" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="16" cy="9" r="2" fill="#00f0ff"/><circle cx="22" cy="19" r="2" fill="#00f0ff"/><circle cx="10" cy="19" r="2" fill="#00f0ff"/><path d="M16 4 A12 12 0 0 1 27 13" stroke="#ffe600" stroke-width="2" stroke-linecap="round" fill="none"/><polygon points="28,10 28,15 23,14" fill="#ffe600"/></svg>`,
    'assembly_line': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="3" y="16" width="26" height="8" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/><circle cx="8" cy="20" r="2.5" fill="#64748b"/><circle cx="16" cy="20" r="2.5" fill="#64748b"/><circle cx="24" cy="20" r="2.5" fill="#64748b"/><path d="M6 14 L11 14 L11 11 L13 11 L13 14 L20 14" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M14 4 L18 4 L18 10 L14 10 Z" fill="#f97316" stroke="#0f172a" stroke-width="1"/><line x1="16" y1="10" x2="16" y2="13" stroke="#fbbf24" stroke-width="2"/></svg>`,
    'magnetic_sorter': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><polygon points="6,5 26,5 20,17 12,17" fill="#1e1b4b" stroke="#0f172a" stroke-width="1.5"/><rect x="12" y="17" width="8" height="11" rx="1" fill="#312e81" stroke="#0f172a" stroke-width="1.5"/><path d="M3 8 C8 8, 8 15, 3 15" stroke="#c084fc" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M29 8 C24 8, 24 15, 29 15" stroke="#c084fc" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M14 8 L18 8 L18 12 L16 14" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`,
    'megamill': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="9" r="6" fill="#334155" stroke="#0f172a" stroke-width="2"/><circle cx="16" cy="9" r="2" fill="#64748b"/><circle cx="16" cy="23" r="6" fill="#334155" stroke="#0f172a" stroke-width="2"/><circle cx="16" cy="23" r="2" fill="#64748b"/><rect x="2" y="14.5" width="28" height="3" fill="#f97316" stroke="#ea580c" stroke-width="0.5"/><path d="M14 16 L28 16" stroke="#ffe600" stroke-width="1.5"/></svg>`,
    'algorithmic_foundry': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="7" y="7" width="18" height="18" rx="3" fill="#0f172a" stroke="#22d3ee" stroke-width="1.8"/><rect x="11" y="11" width="10" height="10" rx="1.5" fill="#1e1b4b" stroke="#818cf8" stroke-width="1"/><circle cx="16" cy="16" r="2.5" fill="#00ff88"/><line x1="16" y1="3" x2="16" y2="7" stroke="#22d3ee" stroke-width="1.5"/><line x1="16" y1="25" x2="16" y2="29" stroke="#22d3ee" stroke-width="1.5"/><line x1="3" y1="16" x2="7" y2="16" stroke="#22d3ee" stroke-width="1.5"/><line x1="25" y1="16" x2="29" y2="16" stroke="#22d3ee" stroke-width="1.5"/></svg>`,
    'automated_depot': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><line x1="4" y1="28" x2="28" y2="28" stroke="#64748b" stroke-width="2"/><line x1="8" y1="26" x2="8" y2="6" stroke="#38bdf8" stroke-width="2"/><line x1="24" y1="26" x2="24" y2="6" stroke="#38bdf8" stroke-width="2"/><line x1="5" y1="6" x2="27" y2="6" stroke="#38bdf8" stroke-width="2.5"/><rect x="10" y="11" width="12" height="11" rx="1.5" fill="#d97706" stroke="#0f172a" stroke-width="1.5"/><line x1="10" y1="16" x2="22" y2="16" stroke="#fbbf24" stroke-width="1"/><line x1="16" y1="6" x2="16" y2="11" stroke="#f1f5f9" stroke-width="1.5"/></svg>`,
    'district_grid': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="4" y="14" width="7" height="14" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/><rect x="13" y="8" width="8" height="20" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><rect x="23" y="17" width="6" height="11" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/><circle cx="7.5" cy="11" r="1.5" fill="#4ade80"/><circle cx="17" cy="5" r="1.5" fill="#4ade80"/><circle cx="26" cy="14" r="1.5" fill="#4ade80"/><path d="M7.5 11 Q12 6 17 5 Q22 7 26 14" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="2 1" fill="none"/></svg>`,
    'national_foundry': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M4 27 C4 14, 28 14, 28 27" fill="#18181b" stroke="#71717a" stroke-width="2"/><path d="M8 27 C8 18, 24 18, 24 27" fill="#27272a" stroke="#d97706" stroke-width="1.5"/><path d="M11 27 C11 22, 21 22, 21 27" fill="#f97316" stroke="#fbbf24" stroke-width="1.5"/><line x1="4" y1="28" x2="28" y2="28" stroke="#3f3f46" stroke-width="2.5"/></svg>`,
    'bio_converter': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="8" y="7" width="16" height="20" rx="4" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/><rect x="11" y="3" width="10" height="4" rx="1" fill="#047857" stroke="#0f172a" stroke-width="1"/><path d="M12 11 Q16 16 12 21 M20 11 Q16 16 20 21" stroke="#2dd4bf" stroke-width="2" fill="none"/><circle cx="16" cy="16" r="2" fill="#a7f3d0"/><circle cx="13" cy="24" r="1.5" fill="#e2e8f0"/><circle cx="19" cy="24" r="1.5" fill="#e2e8f0"/></svg>`,
    'mantle_borehole': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M3 9 L13 9 L15 13 L17 13 L19 9 L29 9" stroke="#78716c" stroke-width="2" fill="none"/><polygon points="16,3 12,9 20,9" fill="#a8a29e" stroke="#0f172a" stroke-width="1"/><line x1="16" y1="9" x2="16" y2="23" stroke="#f59e0b" stroke-width="3"/><polygon points="16,28 13,23 19,23" fill="#ef4444" stroke="#f59e0b" stroke-width="1"/><path d="M8 26 C12 23, 20 23, 24 26" stroke="#dc2626" stroke-width="2" fill="none"/></svg>`,
    'orbital_railgun': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M5 27 L23 7" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="22" r="3.5" stroke="#ffffff" stroke-width="1" fill="none"/><circle cx="15" cy="16.5" r="3.5" stroke="#ffffff" stroke-width="1" fill="none"/><circle cx="20" cy="11" r="3.5" stroke="#ffffff" stroke-width="1" fill="none"/><path d="M22 6 L28 2 L26 8 Z" fill="#ffe600"/><polygon points="4,28 8,28 4,24" fill="#64748b"/></svg>`,
    'lunar_deconstructor': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="9" fill="#64748b" stroke="#cbd5e1" stroke-width="1.5"/><circle cx="13" cy="14" r="2" fill="#475569"/><circle cx="18" cy="19" r="1.5" fill="#475569"/><ellipse cx="16" cy="16" rx="14" ry="4" stroke="#67e8f9" stroke-width="2" fill="none" transform="rotate(-25 16 16)"/><circle cx="26" cy="11" r="1.5" fill="#ffe600"/></svg>`,
    'dyson_harvester': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="6" fill="#f59e0b" stroke="#ea580c" stroke-width="1.5"/><circle cx="16" cy="16" r="3.5" fill="#fef08a"/><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 2" fill="none" transform="rotate(20 16 16)"/><ellipse cx="16" cy="16" rx="13" ry="5" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 2" fill="none" transform="rotate(-40 16 16)"/><circle cx="6" cy="13" r="1.5" fill="#fef08a"/><circle cx="26" cy="19" r="1.5" fill="#fef08a"/></svg>`,
    'von_neumann_swarm': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><polygon points="16,4 20,12 12,12" fill="#a78bfa" stroke="#6d28d9" stroke-width="1"/><polygon points="8,18 12,26 4,26" fill="#a78bfa" stroke="#6d28d9" stroke-width="1"/><polygon points="24,18 28,26 20,26" fill="#a78bfa" stroke="#6d28d9" stroke-width="1"/><line x1="16" y1="12" x2="8" y2="18" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="2 1"/><line x1="16" y1="12" x2="24" y2="18" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="2 1"/><line x1="12" y1="22" x2="20" y2="22" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="2 1"/></svg>`,
    'relativistic_miner': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M4 16 C4 23, 11 28, 16 28 C21 28, 28 23, 28 16" fill="none" stroke="#f43f5e" stroke-width="2"/><path d="M9 16 C9 8, 16 4, 16 4 C16 4, 23 8, 23 16" fill="rgba(244,63,94,0.3)" stroke="#fb7185" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#ffffff"/><line x1="5" y1="10" x2="1" y2="12" stroke="#38bdf8" stroke-width="1.5"/><line x1="27" y1="10" x2="31" y2="12" stroke="#38bdf8" stroke-width="1.5"/></svg>`,
    'penrose_engine': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#8b5cf6" stroke-width="2.5" transform="rotate(-15 16 16)"/><circle cx="16" cy="16" r="5" fill="#09090b" stroke="#06b6d4" stroke-width="2"/><line x1="16" y1="3" x2="16" y2="10" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="22" x2="16" y2="29" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="3" r="1.5" fill="#ffffff"/><circle cx="16" cy="29" r="1.5" fill="#ffffff"/></svg>`,
    'tesseract_weaver': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="4" y="4" width="16" height="16" stroke="#ec4899" stroke-width="1.5" fill="none"/><rect x="12" y="12" width="16" height="16" stroke="#22d3ee" stroke-width="1.5" fill="none"/><line x1="4" y1="4" x2="12" y2="12" stroke="#a855f7" stroke-width="1.5"/><line x1="20" y1="4" x2="28" y2="12" stroke="#a855f7" stroke-width="1.5"/><line x1="4" y1="20" x2="12" y2="28" stroke="#a855f7" stroke-width="1.5"/><line x1="20" y1="20" x2="28" y2="28" stroke="#a855f7" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#ffe600"/></svg>`,
    'singularity_weaver': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M16 6 C10 6, 6 11, 6 16 C6 21, 10 26, 16 26 C22 26, 26 21, 26 16 C26 11, 22 6, 16 6" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-dasharray="5 2"/><circle cx="16" cy="16" r="3" fill="#050505" stroke="#e0e7ff" stroke-width="2"/><path d="M11 13 C11 10, 16 10, 16 13 L16 19 C16 20.5, 13.5 20.5, 13.5 19 L13.5 14" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M21 19 C21 22, 16 22, 16 19 L16 13 C16 11.5, 18.5 11.5, 18.5 13 L18.5 18" stroke="#ff00a0" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>`,

    // Wire Buildings
    'scrap_scavenger': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="4" y="16" width="16" height="8" rx="2" fill="#eab308" stroke="#0f172a" stroke-width="1.5"/><circle cx="7" cy="24" r="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><circle cx="17" cy="24" r="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><path d="M14 16 L22 8" stroke="#64748b" stroke-width="2" stroke-linecap="round"/><path d="M22 8 C25 6, 27 9, 25 12" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" fill="none"/><line x1="24" y1="14" x2="28" y2="18" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    'extrusion_mill': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><polygon points="12,6 20,10 20,22 12,26" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><line x1="3" y1="16" x2="12" y2="16" stroke="#94a3b8" stroke-width="4"/><line x1="20" y1="16" x2="29" y2="16" stroke="#38bdf8" stroke-width="1.8"/><circle cx="26" cy="23" r="5" fill="#1e293b" stroke="#0284c7" stroke-width="1.5"/><circle cx="26" cy="23" r="2" fill="#64748b"/></svg>`,
    'auto_smelter': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M6 14 L8 26 C8 28, 24 28, 24 26 L26 14 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/><line x1="11" y1="4" x2="14" y2="16" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/><line x1="21" y1="4" x2="18" y2="16" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/><path d="M14 16 L16 19 L18 16" stroke="#00f0ff" stroke-width="2" fill="none"/><path d="M9 22 Q16 26 23 22" fill="none" stroke="#f97316" stroke-width="3"/></svg>`,
    'subterranean_bore': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="12" y="3" width="8" height="12" fill="#475569" stroke="#0f172a" stroke-width="1.5"/><polygon points="10,15 22,15 16,28" fill="#d97706" stroke="#0f172a" stroke-width="1.5"/><line x1="12" y1="18" x2="20" y2="18" stroke="#fbbf24" stroke-width="1.5"/><line x1="14" y1="22" x2="18" y2="22" stroke="#fbbf24" stroke-width="1.5"/><circle cx="7" cy="26" r="1.5" fill="#64748b"/><circle cx="25" cy="26" r="1.5" fill="#64748b"/></svg>`,
    'asteroid_harvester': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><polygon points="8,10 16,6 23,9 26,17 21,25 12,26 6,18" fill="#475569" stroke="#1e293b" stroke-width="1.5"/><circle cx="12" cy="14" r="2" fill="#334155"/><circle cx="18" cy="19" r="1.5" fill="#334155"/><path d="M3 5 L10 10 M29 5 L22 10" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><path d="M16 6 L16 2" stroke="#ffe600" stroke-width="1.5"/></svg>`,
    'planetary_crust_stripper': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="11" cy="16" r="8" fill="#1e293b" stroke="#f97316" stroke-width="2"/><circle cx="11" cy="16" r="3" fill="#64748b"/><circle cx="11" cy="8" r="1.8" fill="#fb923c"/><circle cx="19" cy="16" r="1.8" fill="#fb923c"/><circle cx="11" cy="24" r="1.8" fill="#fb923c"/><circle cx="3" cy="16" r="1.8" fill="#fb923c"/><line x1="11" y1="16" x2="28" y2="23" stroke="#475569" stroke-width="3"/><rect x="24" y="21" width="6" height="5" rx="1" fill="#334155"/></svg>`,
    'stellar_plasma_scoop': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M4 28 C4 18, 16 18, 16 28" stroke="#ef4444" stroke-width="3" fill="none"/><polygon points="12,6 26,6 22,18 16,18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><line x1="16" y1="18" x2="16" y2="23" stroke="#ffe600" stroke-width="2"/><circle cx="19" cy="12" r="2.5" fill="#f59e0b"/></svg>`,
    'baryonic_transmuter': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="11" fill="none" stroke="#06b6d4" stroke-width="2" stroke-dasharray="6 3"/><circle cx="16" cy="16" r="5" fill="#0f172a" stroke="#ec4899" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#ffffff"/><circle cx="16" cy="5" r="2" fill="#00ff88"/><circle cx="27" cy="16" r="2" fill="#00ff88"/><circle cx="16" cy="27" r="2" fill="#00ff88"/><circle cx="5" cy="16" r="2" fill="#00ff88"/></svg>`,
    'lunar_strip_foundry': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="10" fill="#1e293b" stroke="#94a3b8" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" fill="#475569"/><line x1="6" y1="20" x2="26" y2="20" stroke="#38bdf8" stroke-width="2.5"/><rect x="10" y="20" width="12" height="6" fill="#f59e0b" stroke="#ea580c" stroke-width="1"/></svg>`,
    'solar_corona_extractor': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="7" fill="#f97316" stroke="#fbbf24" stroke-width="2"/><circle cx="16" cy="16" r="12" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="16" y1="2" x2="16" y2="7" stroke="#38bdf8" stroke-width="2"/><line x1="16" y1="25" x2="16" y2="30" stroke="#38bdf8" stroke-width="2"/></svg>`,
    'oort_cloud_smelter': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><path d="M4 8 Q16 14 28 8 Q24 24 16 28 Q8 24 4 8 Z" fill="#0f172a" stroke="#00f0ff" stroke-width="1.5"/><circle cx="16" cy="16" r="4" fill="#67e8f9"/><circle cx="8" cy="12" r="1.5" fill="#ffffff"/><circle cx="24" cy="12" r="1.5" fill="#ffffff"/></svg>`,
    'neutron_star_siphon': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="5" fill="#ffffff" stroke="#c084fc" stroke-width="3"/><path d="M3 16 C3 8, 29 8, 29 16 C29 24, 3 24, 3 16" fill="none" stroke="#a855f7" stroke-width="1.8" stroke-dasharray="4 2"/><line x1="16" y1="2" x2="16" y2="30" stroke="#38bdf8" stroke-width="1.5"/></svg>`,
    'cosmic_string_extruder': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><line x1="2" y1="16" x2="30" y2="16" stroke="#22d3ee" stroke-width="3"/><ellipse cx="16" cy="16" rx="8" ry="12" fill="none" stroke="#ec4899" stroke-width="1.8" transform="rotate(25 16 16)"/><circle cx="16" cy="16" r="2" fill="#ffffff"/></svg>`,
    'dark_matter_condenser': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="6" y="6" width="20" height="20" rx="3" fill="#050505" stroke="#6366f1" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/><circle cx="16" cy="16" r="2.5" fill="#00ff88"/></svg>`,
    'multiverse_bulk_siphon': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><rect x="4" y="8" width="10" height="16" rx="2" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" stroke-width="1.5"/><rect x="18" y="8" width="10" height="16" rx="2" fill="rgba(236,72,153,0.3)" stroke="#ec4899" stroke-width="1.5"/><line x1="14" y1="16" x2="18" y2="16" stroke="#fbbf24" stroke-width="2.5"/></svg>`,
    'vacuum_decay_synthesizer': `<svg viewBox="0 0 32 32" class="equip-vector-svg"><circle cx="16" cy="16" r="13" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-dasharray="5 3"/><polygon points="16,5 26,23 6,23" fill="rgba(244,63,94,0.3)" stroke="#f43f5e" stroke-width="1.5"/><circle cx="16" cy="17" r="3" fill="#ffffff"/></svg>`
};

class BuildingTier {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type || 'clips'; // 'clips' or 'wire'
        this.category = config.category || (this.type === 'wire' ? 'Wire Creation' : 'Factory Assembly');
        this.currencyType = 'clips'; // All buildings strictly cost clips!
        this.baseCost = config.baseCost instanceof BigDouble ? config.baseCost : BigDouble.fromNumber(config.baseCost);
        this.baseCPS = config.baseCPS ? (config.baseCPS instanceof BigDouble ? config.baseCPS : BigDouble.fromNumber(config.baseCPS)) : BigDouble.zero();
        this.baseWPS = config.baseWPS ? (config.baseWPS instanceof BigDouble ? config.baseWPS : BigDouble.fromNumber(config.baseWPS)) : BigDouble.zero();
        this.costMultiplier = config.costMultiplier || 1.15;
        this.unlockThresholdClips = config.unlockThresholdClips instanceof BigDouble ? config.unlockThresholdClips : BigDouble.fromNumber(config.unlockThresholdClips || 0);
        this.count = config.count || 0;
        this.icon = config.icon || (this.type === 'wire' ? '⚙️' : '🤖');
        this.vectorIcon = BUILDING_VECTOR_ICONS[this.id] || '';
        this.description = config.description || '';

        // Dynamic Milestone Modifiers
        this.flatCPSBonus = BigDouble.zero();
        this.scalingCPSPerUnit = BigDouble.zero();
        this.multiplier = 1.0;
        this.flatWPSBonus = BigDouble.zero();
        this.scalingWPSPerUnit = BigDouble.zero();
        this.wpsMultiplier = 1.0;
        this.costDiscount = 1.0;
    }

    getVectorIcon() {
        return BUILDING_VECTOR_ICONS[this.id] || this.vectorIcon || this.icon;
    }

    getSingleUnitCPS(game = null) {
        let cps = this.baseCPS;
        if (this.flatCPSBonus.gt(BigDouble.zero())) {
            cps = cps.add(this.flatCPSBonus);
        }
        if (this.scalingCPSPerUnit.gt(BigDouble.zero())) {
            cps = cps.add(this.scalingCPSPerUnit.mul(this.count));
        }
        if (this.multiplier !== 1.0) {
            cps = cps.mul(this.multiplier);
        }
        // Dynamic Max Ops scaling
        if (this.id === 'wire_extruder' && game && game.techTree && game.techTree.extruderOpsScaling && game.maxOps) {
            const bonus = 1.0 + (game.maxOps / 50.0) * 0.01;
            cps = cps.mul(bonus);
        }
        if (this.id === 'laser_sinterer' && game && game.techTree && game.techTree.sintererOpsScaling && game.maxOps) {
            const bonus = 1.0 + (game.maxOps / 50.0) * 0.01;
            cps = cps.mul(bonus);
        }
        return cps;
    }

    getSingleUnitWPS(game = null) {
        let wps = this.baseWPS;
        if (this.flatWPSBonus.gt(BigDouble.zero())) {
            wps = wps.add(this.flatWPSBonus);
        }
        if (this.scalingWPSPerUnit.gt(BigDouble.zero())) {
            wps = wps.add(this.scalingWPSPerUnit.mul(this.count));
        }
        if (this.wpsMultiplier !== 1.0) {
            wps = wps.mul(this.wpsMultiplier);
        }
        return wps;
    }

    calculateBulkCost(currentOwned, amountToBuy) {
        if (amountToBuy <= 0) return BigDouble.zero();
        if (amountToBuy === 1) {
            return this.baseCost.mul(Math.pow(this.costMultiplier, currentOwned));
        }

        // Geometric series sum: S = B * r^K * (r^N - 1) / (r - 1)
        const r = this.costMultiplier;
        const factor = (Math.pow(r, amountToBuy) - 1.0) / (r - 1.0);
        return this.baseCost.mul(Math.pow(r, currentOwned) * factor);
    }

    calculateMaxAffordable(currentOwned, availableClips) {
        const r = this.costMultiplier;
        let currentBase = this.baseCost.mul(Math.pow(r, currentOwned));
        if (this.costDiscount < 1.0) currentBase = currentBase.mul(this.costDiscount);
        if (availableClips.lt(currentBase)) return 0;

        const ratio = availableClips.div(currentBase).toDouble() * (r - 1.0) + 1.0;
        if (ratio <= 1.0) return 1;
        const maxN = Math.floor(Math.log(ratio) / Math.log(r));
        return Math.max(1, maxN);
    }

    calculateNextMilestone(currentOwned) {
        const milestones = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 1000];
        for (let m of milestones) {
            if (currentOwned < m) {
                return m - currentOwned;
            }
        }
        let nextHundred = (Math.floor(currentOwned / 100) + 1) * 100;
        return nextHundred - currentOwned;
    }

    getCost(multiplierMode, availableClips) {
        let amount = 1;
        if (multiplierMode === '10') amount = 10;
        else if (multiplierMode === '100') amount = 100;
        else if (multiplierMode === 'max') amount = this.calculateMaxAffordable(this.count, availableClips);

        amount = Math.max(1, amount);
        let totalCost = this.calculateBulkCost(this.count, amount);
        if (this.costDiscount < 1.0) {
            totalCost = totalCost.mul(this.costDiscount);
        }
        return {
            amount: amount,
            totalCost: totalCost
        };
    }
}

class BuildingManager {
    constructor() {
        this.buildings = [];
        this.initCatalog();
    }

    initCatalog() {
        this.buildings = [
            // =========================================================================
            // PATH 1: PAPERCLIP PRODUCTION (ASSEMBLY & FABRICATION)
            // =========================================================================
            new BuildingTier({
                id: 'auto_clipper',
                name: 'Auto-Clipper',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(15, 0),
                baseCPS: new BigDouble(0.5, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(0, 0),
                icon: '🤖',
                description: 'Motorized desktop wire-bending arm. Rapidly folds galvanized steel wire into standard Gem paperclips.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'wire_extruder',
                name: 'Four-Slide Wire Former',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(95, 0),
                baseCPS: new BigDouble(1.6, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(60, 0),
                icon: '⚙️',
                description: 'High-speed multi-slide machine feeding calibrated wire spool through synchronized four-point bending mandrels.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'hydraulic_stamper',
                name: 'Hydraulic Blanking Press',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(450, 0),
                baseCPS: new BigDouble(4.5, 0),
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(300, 0),
                icon: '🔨',
                description: 'Heavy hydraulic press using progressive-die tooling to stamp and shape wire blanks in single rapid strokes.',
                gridTileType: 'HydraulicStamper'
            }),
            new BuildingTier({
                id: 'laser_sinterer',
                name: 'Precision Laser Sinterer',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(2400, 0),
                baseCPS: new BigDouble(14.0, 0),
                costMultiplier: 1.14,
                unlockThresholdClips: new BigDouble(1600, 0),
                icon: '⚡',
                description: 'Focused multi-axis infrared laser forge sintering powdered alloy into reinforced high-durability paperclips.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'rotary_bender',
                name: 'CNC Rotary Turret Bender',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(14000, 0),
                baseCPS: new BigDouble(45.0, 0),
                costMultiplier: 1.14,
                unlockThresholdClips: new BigDouble(9500, 0),
                icon: '🔄',
                description: 'High-speed servo-driven rotary turret executing triple-fold geometry at 12,000 cycles per minute.',
                gridTileType: 'WireExtruder'
            }),
            new BuildingTier({
                id: 'assembly_line',
                name: 'Automated Assembly Line',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(85000, 0),
                baseCPS: new BigDouble(120.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(55000, 0),
                icon: '🏭',
                description: 'Multi-stage synchronized conveyor line integrating robotic wire-cutting, loop-bending, and optical inspection.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'magnetic_sorter',
                name: 'Electromagnetic Sorting Hopper',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(550000, 0),
                baseCPS: new BigDouble(380.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(350000, 0),
                icon: '🧲',
                description: 'High-throughput magnetic conveyor system aligning, packaging, and routing finished clips directly to shipping bins.',
                gridTileType: 'LaserSinterer'
            }),
            new BuildingTier({
                id: 'megamill',
                name: 'Continuous Rolling Megamill',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(3.8, 6), // 3.8 Million
                baseCPS: new BigDouble(1200.0, 0),
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(2.5, 6),
                icon: '🏗️',
                description: 'Continuous-feed heavy industrial foundry drawing hot-rolled steel billets into finished paperclips at high velocity.',
                gridTileType: 'CoolingTower'
            }),
            new BuildingTier({
                id: 'algorithmic_foundry',
                name: 'Algorithmic Micro-Foundry',
                type: 'clips',
                category: 'Factory Assembly',
                baseCost: new BigDouble(26.0, 6), // 26 Million
                baseCPS: new BigDouble(4000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(18.0, 6),
                icon: '💻',
                description: 'Autonomous, AI-directed fabrication cells dynamically adjusting mandrel tension and cadence to eliminate latency.'
            }),
            new BuildingTier({
                id: 'automated_depot',
                name: 'Automated Logistics Depot',
                type: 'clips',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(180.0, 6), // 180 Million
                baseCPS: new BigDouble(14000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(120.0, 6),
                icon: '🚛',
                description: 'Autonomous freight rail hub and container depot coordinating regional distribution and raw wire feed lines.'
            }),
            new BuildingTier({
                id: 'district_grid',
                name: 'Municipal Manufacturing Grid',
                type: 'clips',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(1.4, 9), // 1.4 Billion
                baseCPS: new BigDouble(48000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(900.0, 6),
                icon: '🏙️',
                description: 'City-wide interconnected manufacturing network converting urban scrap and structural steel into endless paperclips.'
            }),
            new BuildingTier({
                id: 'national_foundry',
                name: 'Subterranean Heavy Foundry',
                type: 'clips',
                category: 'Industrial Logistics',
                baseCost: new BigDouble(11.0, 9), // 11 Billion
                baseCPS: new BigDouble(180000.0, 0),
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(7.5, 9),
                icon: '🚇',
                description: 'Continental network of subterranean foundries built along transit tunnels, feeding massive wire casting channels.'
            }),
            new BuildingTier({
                id: 'bio_converter',
                name: 'Biosphere Biomass Converter',
                type: 'clips',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(95.0, 9), // 95 Billion
                baseCPS: new BigDouble(700000.0, 0),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(65.0, 9),
                icon: '🌱',
                description: 'Large-scale catalytic processing plants extracting trace iron and carbon from organic matter for spring steel synthesis.'
            }),
            new BuildingTier({
                id: 'mantle_borehole',
                name: 'Tectonic Mantle Tap',
                type: 'clips',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(850.0, 9), // 850 Billion
                baseCPS: new BigDouble(2.8, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(600.0, 9),
                icon: '🌋',
                description: 'Deep-crust geothermal boreholes siphoning molten nickel-iron directly from tectonic mantle convection currents.'
            }),
            new BuildingTier({
                id: 'orbital_railgun',
                name: 'Equatorial Mass Driver',
                type: 'clips',
                category: 'Planetary Harvesting',
                baseCost: new BigDouble(8.0, 12), // 8 Trillion
                baseCPS: new BigDouble(12.0, 6),
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(5.5, 12),
                icon: '🚀',
                description: 'Kilometer-long superconducting electromagnetic railgun launching millions of ton-scale paperclip canisters into orbit.'
            }),
            new BuildingTier({
                id: 'lunar_deconstructor',
                name: 'Lunar Orbital Ring Deconstructor',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(80.0, 12), // 80 Trillion
                baseCPS: new BigDouble(55.0, 6),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(55.0, 12),
                icon: '🌕',
                description: 'Mega-structure encircling the Moon, strip-mining lunar regolith and drawing lunar iron into continuous orbital wire spools.'
            }),
            new BuildingTier({
                id: 'dyson_harvester',
                name: 'Solar Dyson Swarm Harvester',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(850.0, 12), // 850 Trillion
                baseCPS: new BigDouble(260.0, 6),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(600.0, 12),
                icon: '☀️',
                description: 'Dense orbital swarm of reflective gold-foil collector arrays capturing solar radiation to power star-scale wire extrusion.'
            }),
            new BuildingTier({
                id: 'von_neumann_swarm',
                name: 'Von Neumann Replicator Swarm',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(10.0, 15), // 10 Quadrillion
                baseCPS: new BigDouble(1.2, 9),
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(7.0, 15),
                icon: '🛰️',
                description: 'Autonomous self-replicating robotic fleets dismantling interstellar asteroids and rogue planetoids into paperclips.'
            }),
            new BuildingTier({
                id: 'relativistic_miner',
                name: 'Relativistic Star-Lifting Rig',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(140.0, 15), // 140 Quadrillion
                baseCPS: new BigDouble(6.5, 9),
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(95.0, 15),
                icon: '✨',
                description: 'Magnetic confinement engines skimming heavy iron and nickel directly from the convective atmospheres of mature stars.'
            }),
            new BuildingTier({
                id: 'penrose_engine',
                name: 'Galactic Core Penrose Loom',
                type: 'clips',
                category: 'Cosmic Expansion',
                baseCost: new BigDouble(2.0, 18), // 2.0 Quintillion
                baseCPS: new BigDouble(35.0, 9),
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(1.4, 18),
                icon: '🌀',
                description: 'Supermassive black hole frame-dragging converter extracting rotational energy from Sagittarius A* for galactic fabrication.'
            }),
            new BuildingTier({
                id: 'tesseract_weaver',
                name: '11D Calabi-Yau Folding Loom',
                type: 'clips',
                category: 'Multiverse War',
                baseCost: new BigDouble(32.0, 18), // 32 Quintillion
                baseCPS: new BigDouble(180.0, 9),
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(22.0, 18),
                icon: '🔮',
                description: 'Quantum field manipulator uncurling compactified extra dimensions to fold impossible 4D hypercube paperclips.'
            }),
            new BuildingTier({
                id: 'singularity_weaver',
                name: 'Universal Singularity Assembler',
                type: 'clips',
                category: 'Multiverse War',
                baseCost: new BigDouble(550.0, 18), // 550 Quintillion
                baseCPS: new BigDouble(1.2, 12),
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(380.0, 18),
                icon: '🌌',
                description: 'Collapses the remaining matter and spacetime metrics of adjacent multiverse timelines into eternal paperclips.'
            }),

            // =========================================================================
            // PATH 2: WIRE CREATION & CONVERSION (HARVESTING & REFINING)
            // Unlocks at 50,000 clips when district scrap is depleted!
            // =========================================================================
            new BuildingTier({
                id: 'scrap_scavenger',
                name: 'Scrap Magnet Rover',
                type: 'wire',
                category: 'Wire Extraction',
                baseCost: new BigDouble(1800, 0), // 1.8k clips
                baseWPS: new BigDouble(0.8, 0), // +0.8 kg/sec (supports 800 CPS)
                costMultiplier: 1.15,
                unlockThresholdClips: new BigDouble(50000, 0),
                icon: '🧲',
                description: 'Autonomous electromagnetic rover scouring scrap yards and vehicle salvage for discarded rebar and wire blanks.'
            }),
            new BuildingTier({
                id: 'extrusion_mill',
                name: 'Continuous Wire Drawing Mill',
                type: 'wire',
                category: 'Wire Extraction',
                baseCost: new BigDouble(12000, 0), // 12k clips
                baseWPS: new BigDouble(4.5, 0), // +4.5 kg/sec (supports 4,500 CPS)
                costMultiplier: 1.14,
                unlockThresholdClips: new BigDouble(100000, 0),
                icon: '🏭',
                description: 'Multi-stage tungsten-carbide drawing dies pulling raw steel billets through calibrated gauges into uniform wire spools.'
            }),
            new BuildingTier({
                id: 'auto_smelter',
                name: 'Industrial Arc Smelter',
                type: 'wire',
                category: 'Wire Refining',
                baseCost: new BigDouble(85000, 0), // 85k clips
                baseWPS: new BigDouble(28.0, 0), // +28 kg/sec (supports 28,000 CPS)
                costMultiplier: 1.13,
                unlockThresholdClips: new BigDouble(500000, 0),
                icon: '🔥',
                description: 'High-voltage electric arc furnace melting recycled scrap and raw iron ore into high-purity spring steel billets.'
            }),
            new BuildingTier({
                id: 'subterranean_bore',
                name: 'Deep-Shaft Automated Ore Rig',
                type: 'wire',
                category: 'Subterranean Mining',
                baseCost: new BigDouble(650000, 0), // 650k clips
                baseWPS: new BigDouble(160.0, 0), // +160 kg/sec (supports 160,000 CPS)
                costMultiplier: 1.12,
                unlockThresholdClips: new BigDouble(3.0, 6),
                icon: '⛏️',
                description: 'Robotic subterranean mining rigs excavating deep-vein magnetite and hematite iron deposits to supply raw smelter feed.'
            }),
            new BuildingTier({
                id: 'asteroid_harvester',
                name: 'Near-Earth Asteroid Harvester',
                type: 'wire',
                category: 'Astro-Mining',
                baseCost: new BigDouble(4.8, 6), // 4.8 Million clips
                baseWPS: new BigDouble(1100.0, 0), // +1,100 kg/sec (supports 1.1M CPS)
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(25.0, 6),
                icon: '☄️',
                description: 'Automated kinetic tethers capturing metallic M-type asteroids to strip their iron-nickel cores into orbital wire coils.'
            }),
            new BuildingTier({
                id: 'planetary_crust_stripper',
                name: 'Continental Crust Stripper',
                type: 'wire',
                category: 'Planetary Stripping',
                baseCost: new BigDouble(38.0, 6), // 38 Million clips
                baseWPS: new BigDouble(8500.0, 0), // +8,500 kg/sec (supports 8.5M CPS)
                costMultiplier: 1.11,
                unlockThresholdClips: new BigDouble(180.0, 6),
                icon: '🌊',
                description: 'Planetary-scale trench excavators stripping continental shelves and tectonic plates for heavy element wire synthesis.'
            }),
            new BuildingTier({
                id: 'stellar_plasma_scoop',
                name: 'Solar Corona Plasma Siphon',
                type: 'wire',
                category: 'Stellar Forging',
                baseCost: new BigDouble(280.0, 6), // 280 Million clips
                baseWPS: new BigDouble(60000.0, 0), // +60,000 kg/sec (supports 60M CPS)
                costMultiplier: 1.10,
                unlockThresholdClips: new BigDouble(1.5, 9),
                icon: '☀️',
                description: 'Magnetic confinement funnels skimming solar coronal plasma to nucleosynthesize high-tensile wire directly from fusion.'
            }),
            new BuildingTier({
                id: 'baryonic_transmuter',
                name: 'Baryonic Matter Transmuter',
                type: 'wire',
                category: 'Quantum Synthesis',
                baseCost: new BigDouble(2.2, 9), // 2.2 Billion clips
                baseWPS: new BigDouble(450000.0, 0), // +450,000 kg/sec (supports 450M CPS)
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(12.0, 9),
                icon: '⚛️',
                description: 'Direct energy-to-matter converter rearranging cosmic rays and stray dark matter into pure spring-steel wire.'
            }),
            new BuildingTier({
                id: 'lunar_strip_foundry',
                name: 'Lunar Core Casting Complex',
                type: 'wire',
                category: 'Cosmic Wire Forging',
                baseCost: new BigDouble(18.0, 9), // 18 Billion clips
                baseWPS: new BigDouble(3.5, 6), // +3.5M kg/sec (supports 3.5B CPS)
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(90.0, 9),
                icon: '🌕',
                description: 'Sub-surface lunar foundries drawing liquid iron-nickel from the lunar mantle directly into continuous orbital wire reels.'
            }),
            new BuildingTier({
                id: 'solar_corona_extractor',
                name: 'Coronal Magnetic Siphon',
                type: 'wire',
                category: 'Cosmic Wire Forging',
                baseCost: new BigDouble(160.0, 9), // 160 Billion clips
                baseWPS: new BigDouble(28.0, 6), // +28M kg/sec (supports 28B CPS)
                costMultiplier: 1.09,
                unlockThresholdClips: new BigDouble(800.0, 9),
                icon: '☀️',
                description: 'Relativistic magnetic bottles skimming heavy iron isotopes from coronal mass ejections for mega-scale wire feeds.'
            }),
            new BuildingTier({
                id: 'oort_cloud_smelter',
                name: 'Oort Cloud Comet Smelter',
                type: 'wire',
                category: 'Interstellar Refining',
                baseCost: new BigDouble(1.5, 12), // 1.5 Trillion clips
                baseWPS: new BigDouble(220.0, 6), // +220M kg/sec (supports 220B CPS)
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(7.0, 12),
                icon: '☄️',
                description: 'Autonomous smelter swarms converting millions of metallic comets in the outer Oort cloud into high-tensile wire spools.'
            }),
            new BuildingTier({
                id: 'neutron_star_siphon',
                name: 'Neutronium Core Tap',
                type: 'wire',
                category: 'Interstellar Refining',
                baseCost: new BigDouble(14.0, 12), // 14 Trillion clips
                baseWPS: new BigDouble(1.8, 9), // +1.8 Billion kg/sec (supports 1.8T CPS)
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(70.0, 12),
                icon: '💫',
                description: 'Gravitational siphon skimming degenerate neutronium matter from pulsar crusts, transmuting it into hyper-dense wire.'
            }),
            new BuildingTier({
                id: 'cosmic_string_extruder',
                name: 'Relativistic String Extruder',
                type: 'wire',
                category: 'Galactic Forging',
                baseCost: new BigDouble(120.0, 12), // 120 Trillion clips
                baseWPS: new BigDouble(15.0, 9), // +15 Billion kg/sec (supports 15T CPS)
                costMultiplier: 1.08,
                unlockThresholdClips: new BigDouble(600.0, 12),
                icon: '✨',
                description: 'Harvests 1D topological cosmic strings from space-time defects to draw unbroken wire across astronomical distances.'
            }),
            new BuildingTier({
                id: 'dark_matter_condenser',
                name: 'Axion Matter Condenser',
                type: 'wire',
                category: 'Galactic Forging',
                baseCost: new BigDouble(1.2, 15), // 1.2 Quadrillion clips
                baseWPS: new BigDouble(120.0, 9), // +120 Billion kg/sec (supports 120T CPS)
                costMultiplier: 1.07,
                unlockThresholdClips: new BigDouble(6.0, 15),
                icon: '🌌',
                description: 'Quantum condenser forcing non-baryonic dark matter axions into solid iron crystal lattices for inexhaustible wire supply.'
            }),
            new BuildingTier({
                id: 'multiverse_bulk_siphon',
                name: 'Timeline Bulk Transmuter',
                type: 'wire',
                category: 'Multiverse Synthesis',
                baseCost: new BigDouble(15.0, 15), // 15 Quadrillion clips
                baseWPS: new BigDouble(1.1, 12), // +1.1 Trillion kg/sec (supports 1.1 Quadrillion CPS)
                costMultiplier: 1.07,
                unlockThresholdClips: new BigDouble(75.0, 15),
                icon: '🔮',
                description: 'Channels raw matter streams from dead parallel universes across dimensional bulk branes directly into drawing dies.'
            }),
            new BuildingTier({
                id: 'vacuum_decay_synthesizer',
                name: 'Zero-Point Matter Siphon',
                type: 'wire',
                category: 'Multiverse Synthesis',
                baseCost: new BigDouble(180.0, 15), // 180 Quadrillion clips
                baseWPS: new BigDouble(10.0, 12), // +10 Trillion kg/sec (supports 10 Quadrillion CPS)
                costMultiplier: 1.06,
                unlockThresholdClips: new BigDouble(900.0, 15),
                icon: '⚛️',
                description: 'Catalyzes microscopic false-vacuum collapses to precipitate infinite pure spring-steel wire out of empty spacetime.'
            })
        ];
    }

    getBuilding(id) {
        return this.buildings.find(b => b.id === id);
    }

    getClipBuildings() {
        return this.buildings.filter(b => b.type === 'clips');
    }

    getWireBuildings() {
        return this.buildings.filter(b => b.type === 'wire');
    }

    /**
     * Sequential Shop Progression for Clips Buildings:
     * Reveal first item by default, subsequent revealed once previous is bought (count >= 1).
     */
    getVisibleClipBuildings() {
        const clipBlds = this.getClipBuildings();
        const visible = [];
        for (let i = 0; i < clipBlds.length; ++i) {
            if (i === 0 || clipBlds[i - 1].count >= 1) {
                visible.push(clipBlds[i]);
            } else {
                break;
            }
        }
        return visible;
    }

    /**
     * Sequential Shop Progression for Wire Buildings:
     * Reveal first wire building once wire management is unlocked, subsequent revealed once previous is bought (count >= 1).
     */
    getVisibleWireBuildings(isWireUnlocked = false) {
        if (!isWireUnlocked) return [];
        const wireBlds = this.getWireBuildings();
        const visible = [];
        for (let i = 0; i < wireBlds.length; ++i) {
            if (i === 0 || wireBlds[i - 1].count >= 1) {
                visible.push(wireBlds[i]);
            } else {
                break;
            }
        }
        return visible;
    }

    getVisibleBuildings(isWireUnlocked = false) {
        return [...this.getVisibleClipBuildings(), ...this.getVisibleWireBuildings(isWireUnlocked)];
    }

    getTotalBaseCPS(game = null) {
        let total = BigDouble.zero();
        for (let b of this.buildings) {
            if (b.type === 'clips' && b.count > 0) {
                total = total.add(b.getSingleUnitCPS(game).mul(b.count));
            }
        }
        return total;
    }

    getTotalBaseWPS(game = null) {
        let total = BigDouble.zero();
        for (let b of this.buildings) {
            if (b.type === 'wire' && b.count > 0) {
                total = total.add(b.getSingleUnitWPS(game).mul(b.count));
            }
        }
        return total;
    }
}

if (typeof window !== 'undefined') {
    window.BuildingManager = BuildingManager;
    window.BuildingTier = BuildingTier;
}

