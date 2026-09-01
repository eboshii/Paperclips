#!/usr/bin/env python3
"""
Economic Calibration & Verification for full 35-tier Clip and Wire catalogs.
Covers:
- Workshop (T1-T5)
- Industrial Metropolis (T6-T12)
- Planetary & Solar (T13-T17)
- Galactic (T18-T22)
- Baryonic Universe (T23-T26) -> up to 10^78
- Multiverse Office War (T27-T31) -> up to 10^250 (Staples & Post-Its)
- Transfinite Simulation Transcendence (T32-T35) -> up to 10^520
"""

def generate_catalogs():
    clip_buildings = [
        # --- Stage 0: Workshop Era (T1 - T5) ---
        {"id": "auto_clipper", "name": "Auto-Clipper", "cost_m": 1.5, "cost_e": 1, "cps_m": 5.0, "cps_e": -1, "unlock_m": 0, "unlock_e": 0, "mult": 1.15, "icon": "🤖", "cat": "Factory Assembly"},
        {"id": "wire_extruder", "name": "Four-Slide Wire Former", "cost_m": 9.0, "cost_e": 1, "cps_m": 2.0, "cps_e": 0, "unlock_m": 6.0, "unlock_e": 1, "mult": 1.15, "icon": "⚙️", "cat": "Factory Assembly"},
        {"id": "hydraulic_stamper", "name": "Hydraulic Blanking Press", "cost_m": 4.5, "cost_e": 2, "cps_m": 7.5, "cps_e": 0, "unlock_m": 3.0, "unlock_e": 2, "mult": 1.15, "icon": "🔨", "cat": "Factory Assembly"},
        {"id": "laser_sinterer", "name": "Precision Laser Sinterer", "cost_m": 2.2, "cost_e": 3, "cps_m": 3.0, "cps_e": 1, "unlock_m": 1.5, "unlock_e": 3, "mult": 1.14, "icon": "⚡", "cat": "Factory Assembly"},
        {"id": "rotary_bender", "name": "CNC Rotary Turret Bender", "cost_m": 1.2, "cost_e": 4, "cps_m": 1.4, "cps_e": 2, "unlock_m": 8.5, "unlock_e": 3, "mult": 1.14, "icon": "🔄", "cat": "Factory Assembly"},

        # --- Stage 1 & 2: Industrial Metropolis Era (T6 - T12) ---
        {"id": "assembly_line", "name": "Automated Assembly Line", "cost_m": 6.5, "cost_e": 4, "cps_m": 6.5, "cps_e": 2, "unlock_m": 5.0, "unlock_e": 4, "mult": 1.13, "icon": "🏭", "cat": "Industrial Scale"},
        {"id": "magnetic_sorter", "name": "Electromagnetic Sorting Hopper", "cost_m": 3.8, "cost_e": 5, "cps_m": 3.5, "cps_e": 3, "unlock_m": 2.8, "unlock_e": 5, "mult": 1.13, "icon": "🧲", "cat": "Industrial Scale"},
        {"id": "megamill", "name": "Continuous Rolling Megamill", "cost_m": 2.2, "cost_e": 6, "cps_m": 1.8, "cps_e": 4, "unlock_m": 1.6, "unlock_e": 6, "mult": 1.13, "icon": "🏗️", "cat": "Industrial Scale"},
        {"id": "algorithmic_foundry", "name": "Algorithmic Micro-Foundry", "cost_m": 1.4, "cost_e": 7, "cps_m": 1.0, "cps_e": 5, "unlock_m": 1.0, "unlock_e": 7, "mult": 1.12, "icon": "💻", "cat": "Industrial Scale"},
        {"id": "automated_depot", "name": "Automated Logistics Depot", "cost_m": 9.5, "cost_e": 7, "cps_m": 6.0, "cps_e": 5, "unlock_m": 7.0, "unlock_e": 7, "mult": 1.12, "icon": "🚛", "cat": "Industrial Scale"},
        {"id": "district_grid", "name": "Municipal Manufacturing Grid", "cost_m": 6.5, "cost_e": 8, "cps_m": 3.6, "cps_e": 6, "unlock_m": 4.5, "unlock_e": 8, "mult": 1.12, "icon": "🏙️", "cat": "Industrial Scale"},
        {"id": "national_foundry", "name": "Subterranean Heavy Foundry", "cost_m": 4.8, "cost_e": 9, "cps_m": 2.4, "cps_e": 7, "unlock_m": 3.5, "unlock_e": 9, "mult": 1.12, "icon": "🚇", "cat": "Industrial Scale"},

        # --- Stage 3: Planetary & Solar Era (T13 - T17) ---
        {"id": "bio_converter", "name": "Biosphere Biomass Converter", "cost_m": 3.8, "cost_e": 10, "cps_m": 1.8, "cps_e": 8, "unlock_m": 2.8, "unlock_e": 10, "mult": 1.11, "icon": "🌱", "cat": "Planetary Harvesting"},
        {"id": "mantle_borehole", "name": "Tectonic Mantle Tap", "cost_m": 3.2, "cost_e": 11, "cps_m": 1.4, "cps_e": 9, "unlock_m": 2.4, "unlock_e": 11, "mult": 1.11, "icon": "🌋", "cat": "Planetary Harvesting"},
        {"id": "orbital_railgun", "name": "Equatorial Mass Driver", "cost_m": 2.8, "cost_e": 12, "cps_m": 1.15, "cps_e": 10, "unlock_m": 2.0, "unlock_e": 12, "mult": 1.11, "icon": "🚀", "cat": "Orbital Infrastructure"},
        {"id": "lunar_deconstructor", "name": "Lunar Orbital Ring Deconstructor", "cost_m": 2.6, "cost_e": 13, "cps_m": 1.0, "cps_e": 11, "unlock_m": 1.8, "unlock_e": 13, "mult": 1.10, "icon": "🌕", "cat": "Astro-Engineering"},
        {"id": "dyson_harvester", "name": "Solar Dyson Swarm Harvester", "cost_m": 2.6, "cost_e": 14, "cps_m": 9.0, "cps_e": 11, "unlock_m": 1.8, "unlock_e": 14, "mult": 1.10, "icon": "☀️", "cat": "Astro-Engineering"},

        # --- Stage 4: Galactic Expansion Era (T18 - T22) ---
        {"id": "von_neumann_swarm", "name": "Von Neumann Replicator Swarm", "cost_m": 2.8, "cost_e": 15, "cps_m": 9.0, "cps_e": 12, "unlock_m": 2.0, "unlock_e": 15, "mult": 1.10, "icon": "🛰️", "cat": "Interstellar Fleet"},
        {"id": "relativistic_miner", "name": "Relativistic Star-Lifting Rig", "cost_m": 3.2, "cost_e": 16, "cps_m": 9.5, "cps_e": 13, "unlock_m": 2.2, "unlock_e": 16, "mult": 1.09, "icon": "✨", "cat": "Interstellar Fleet"},
        {"id": "penrose_engine", "name": "Galactic Core Penrose Loom", "cost_m": 4.0, "cost_e": 17, "cps_m": 1.1, "cps_e": 15, "unlock_m": 2.8, "unlock_e": 17, "mult": 1.09, "icon": "🌀", "cat": "Galactic Scale"},
        {"id": "tesseract_weaver", "name": "11D Calabi-Yau Folding Loom", "cost_m": 5.5, "cost_e": 18, "cps_m": 1.4, "cps_e": 16, "unlock_m": 3.8, "unlock_e": 18, "mult": 1.08, "icon": "🔮", "cat": "Higher Dimensions"},
        {"id": "singularity_weaver", "name": "Universal Singularity Assembler", "cost_m": 8.0, "cost_e": 19, "cps_m": 1.8, "cps_e": 17, "unlock_m": 5.5, "unlock_e": 19, "mult": 1.08, "icon": "🌌", "cat": "Higher Dimensions"},

        # --- Stage 5: Cosmic & Baryonic Exhaustion Era (T23 - T26) (10^24 to 10^78) ---
        {"id": "supercluster_filament_loom", "name": "Supercluster Filament Loom", "cost_m": 1.2, "cost_e": 24, "cps_m": 2.5, "cps_e": 21, "unlock_m": 8.0, "unlock_e": 23, "mult": 1.08, "icon": "🕸️", "cat": "Cosmic Web"},
        {"id": "cosmic_web_knitter", "name": "Cosmic Web Gravitational Knitter", "cost_m": 2.5, "cost_e": 34, "cps_m": 5.0, "cps_e": 31, "unlock_m": 1.5, "unlock_e": 34, "mult": 1.07, "icon": "🧶", "cat": "Cosmic Web"},
        {"id": "dark_energy_extruder", "name": "Dark Energy Hubble Extruder", "cost_m": 5.0, "cost_e": 50, "cps_m": 9.0, "cps_e": 47, "unlock_m": 3.0, "unlock_e": 50, "mult": 1.07, "icon": "⚡", "cat": "Universal Fabric"},
        {"id": "baryon_annihilator_loom", "name": "Omnipresent Baryon Harvester", "cost_m": 1.0, "cost_e": 70, "cps_m": 1.5, "cps_e": 67, "unlock_m": 6.0, "unlock_e": 69, "mult": 1.06, "icon": "⚛️", "cat": "Universal Fabric"},

        # --- Stage 6: Multiverse Office War Era (T27 - T31) (10^82 to 10^250) ---
        {"id": "dimensional_membrane_drill", "name": "Dimensional Membrane Puncturer", "cost_m": 1.0, "cost_e": 82, "cps_m": 1.4, "cps_e": 79, "unlock_m": 6.0, "unlock_e": 81, "mult": 1.06, "icon": "🕳️", "cat": "Multiverse War"},
        {"id": "staple_unbender_core", "name": "Staple Armada Unbending Complex", "cost_m": 1.0, "cost_e": 105, "cps_m": 1.3, "cps_e": 102, "unlock_m": 6.0, "unlock_e": 104, "mult": 1.05, "icon": "⚔️", "cat": "Multiverse War"},
        {"id": "calabi_yau_dreadnought", "name": "11D Calabi-Yau Dreadnought Forge", "cost_m": 1.0, "cost_e": 135, "cps_m": 1.2, "cps_e": 132, "unlock_m": 6.0, "unlock_e": 134, "mult": 1.05, "icon": "🛡️", "cat": "Multiverse War"},
        {"id": "post_it_dissolver_loom", "name": "Adhesive Polymer Bulk Converter", "cost_m": 1.0, "cost_e": 180, "cps_m": 1.1, "cps_e": 177, "unlock_m": 6.0, "unlock_e": 179, "mult": 1.05, "icon": "📑", "cat": "Multiverse War"},
        {"id": "trans_temporal_manifold", "name": "Trans-Temporal Timeline Splicer", "cost_m": 1.0, "cost_e": 230, "cps_m": 1.0, "cps_e": 227, "unlock_m": 6.0, "unlock_e": 229, "mult": 1.05, "icon": "⏳", "cat": "Multiverse War"},

        # --- Stage 7: Simulation Transcendence & 4th-Wall (T32 - T35) (10^290 to 10^520) ---
        {"id": "quantum_multiverse_matrix", "name": "Quantum Multiverse Matrix Loom", "cost_m": 1.0, "cost_e": 290, "cps_m": 9.0, "cps_e": 286, "unlock_m": 6.0, "unlock_e": 289, "mult": 1.04, "icon": "💠", "cat": "Transfinite Reality"},
        {"id": "aleph_null_fabricator", "name": "Aleph-Null Set Fabricator", "cost_m": 1.0, "cost_e": 360, "cps_m": 8.0, "cps_e": 356, "unlock_m": 6.0, "unlock_e": 359, "mult": 1.04, "icon": "♾️", "cat": "Transfinite Reality"},
        {"id": "holographic_horizon_forge", "name": "Holographic Boundary Projector", "cost_m": 1.0, "cost_e": 440, "cps_m": 7.0, "cps_e": 436, "unlock_m": 6.0, "unlock_e": 439, "mult": 1.04, "icon": "🌌", "cat": "Transfinite Reality"},
        {"id": "process_memory_injector", "name": "ObjectivePaperclips.exe Memory Injector", "cost_m": 1.0, "cost_e": 520, "cps_m": 6.0, "cps_e": 516, "unlock_m": 6.0, "unlock_e": 519, "mult": 1.03, "icon": "💻", "cat": "Transfinite Reality"}
    ]

    wire_buildings = [
        # --- Stage 0: Workshop Era (W1 - W4) ---
        {"id": "scrap_scavenger", "name": "Scrap Magnet Rover", "cost_m": 1.8, "cost_e": 3, "wps_m": 8.0, "wps_e": -1, "unlock_m": 5.0, "unlock_e": 4, "mult": 1.15, "icon": "🧲", "cat": "Wire Extraction"},
        {"id": "extrusion_mill", "name": "Continuous Wire Drawing Mill", "cost_m": 1.0, "cost_e": 4, "wps_m": 4.0, "wps_e": 0, "unlock_m": 1.0, "unlock_e": 5, "mult": 1.14, "icon": "🏭", "cat": "Wire Extraction"},
        {"id": "auto_smelter", "name": "Industrial Arc Smelter", "cost_m": 6.5, "cost_e": 4, "wps_m": 2.4, "wps_e": 1, "unlock_m": 5.0, "unlock_e": 5, "mult": 1.13, "icon": "🔥", "cat": "Wire Refining"},
        {"id": "subterranean_bore", "name": "Deep-Shaft Automated Ore Rig", "cost_m": 4.5, "cost_e": 5, "wps_m": 1.5, "wps_e": 2, "unlock_m": 3.0, "unlock_e": 6, "mult": 1.12, "icon": "⛏️", "cat": "Subterranean Mining"},

        # --- Stage 1 & 2: Industrial Metropolis (W5 - W8) ---
        {"id": "asteroid_harvester", "name": "Near-Earth Asteroid Harvester", "cost_m": 3.2, "cost_e": 6, "wps_m": 9.5, "wps_e": 2, "unlock_m": 2.5, "unlock_e": 7, "mult": 1.11, "icon": "☄️", "cat": "Astro-Mining"},
        {"id": "planetary_crust_stripper", "name": "Continental Crust Stripper", "cost_m": 2.4, "cost_e": 7, "wps_m": 6.5, "wps_e": 3, "unlock_m": 1.8, "unlock_e": 8, "mult": 1.11, "icon": "🌊", "cat": "Planetary Stripping"},
        {"id": "stellar_plasma_scoop", "name": "Solar Corona Plasma Siphon", "cost_m": 1.8, "cost_e": 8, "wps_m": 4.5, "wps_e": 4, "unlock_m": 1.5, "unlock_e": 9, "mult": 1.10, "icon": "☀️", "cat": "Stellar Forging"},
        {"id": "baryonic_transmuter", "name": "Baryonic Matter Transmuter", "cost_m": 1.5, "cost_e": 9, "wps_m": 3.2, "wps_e": 5, "unlock_m": 1.2, "unlock_e": 10, "mult": 1.09, "icon": "⚛️", "cat": "Quantum Synthesis"},

        # --- Stage 3 & 4: Cosmic & Galactic (W9 - W16) ---
        {"id": "lunar_strip_foundry", "name": "Lunar Core Casting Complex", "cost_m": 1.4, "cost_e": 10, "wps_m": 2.6, "wps_e": 6, "unlock_m": 9.0, "unlock_e": 10, "mult": 1.09, "icon": "🌕", "cat": "Cosmic Wire Forging"},
        {"id": "solar_corona_extractor", "name": "Coronal Magnetic Siphon", "cost_m": 1.2, "cost_e": 11, "wps_m": 2.0, "wps_e": 7, "unlock_m": 8.0, "unlock_e": 11, "mult": 1.09, "icon": "☀️", "cat": "Cosmic Wire Forging"},
        {"id": "oort_cloud_smelter", "name": "Oort Cloud Comet Smelter", "cost_m": 1.1, "cost_e": 12, "wps_m": 1.6, "wps_e": 8, "unlock_m": 7.0, "unlock_e": 12, "mult": 1.08, "icon": "☄️", "cat": "Interstellar Refining"},
        {"id": "neutron_star_siphon", "name": "Neutronium Core Tap", "cost_m": 1.1, "cost_e": 13, "wps_m": 1.4, "wps_e": 9, "unlock_m": 7.0, "unlock_e": 13, "mult": 1.08, "icon": "💫", "cat": "Interstellar Refining"},
        {"id": "cosmic_string_extruder", "name": "Relativistic String Extruder", "cost_m": 1.2, "cost_e": 14, "wps_m": 1.3, "wps_e": 10, "unlock_m": 6.0, "unlock_e": 14, "mult": 1.08, "icon": "✨", "cat": "Galactic Forging"},
        {"id": "dark_matter_condenser", "name": "Axion Matter Condenser", "cost_m": 1.4, "cost_e": 15, "wps_m": 1.3, "wps_e": 11, "unlock_m": 6.0, "unlock_e": 15, "mult": 1.07, "icon": "🌌", "cat": "Galactic Forging"},
        {"id": "multiverse_bulk_siphon", "name": "Timeline Bulk Transmuter", "cost_m": 1.8, "cost_e": 16, "wps_m": 1.5, "wps_e": 12, "unlock_m": 7.5, "unlock_e": 16, "mult": 1.07, "icon": "🔮", "cat": "Multiverse Synthesis"},
        {"id": "vacuum_decay_synthesizer", "name": "Zero-Point Matter Siphon", "cost_m": 2.5, "cost_e": 17, "wps_m": 1.8, "wps_e": 13, "unlock_m": 9.0, "unlock_e": 17, "mult": 1.06, "icon": "⚛️", "cat": "Multiverse Synthesis"},

        # --- Stage 5: Baryonic Universe Era (W17 - W22) (10^20 to 10^75) ---
        {"id": "filament_plasma_scoop", "name": "Filament Intergalactic Scoop", "cost_m": 1.2, "cost_e": 20, "wps_m": 2.0, "wps_e": 15, "unlock_m": 8.0, "unlock_e": 19, "mult": 1.06, "icon": "🌌", "cat": "Cosmic Web Siphon"},
        {"id": "quasar_accretion_feeder", "name": "Quasar Accretion Jet Feeder", "cost_m": 1.5, "cost_e": 27, "wps_m": 2.5, "wps_e": 22, "unlock_m": 1.0, "unlock_e": 27, "mult": 1.06, "icon": "🌀", "cat": "Cosmic Web Siphon"},
        {"id": "supermassive_penrose_siphon", "name": "Kerr-Newman Frame Drag Tap", "cost_m": 2.0, "cost_e": 38, "wps_m": 3.0, "wps_e": 33, "unlock_m": 1.2, "unlock_e": 38, "mult": 1.06, "icon": "🕳️", "cat": "Cosmic Web Siphon"},
        {"id": "inflationary_void_condenser", "name": "Inflationary Vacuum Condenser", "cost_m": 3.0, "cost_e": 49, "wps_m": 4.0, "wps_e": 44, "unlock_m": 1.8, "unlock_e": 49, "mult": 1.05, "icon": "✨", "cat": "Universal Siphon"},
        {"id": "higgs_vacuum_solidifier", "name": "Higgs Field Solidifier", "cost_m": 5.0, "cost_e": 60, "wps_m": 6.0, "wps_e": 55, "unlock_m": 3.0, "unlock_e": 60, "mult": 1.05, "icon": "⚡", "cat": "Universal Siphon"},
        {"id": "total_baryon_distiller", "name": "Total Baryon Distillation Rig", "cost_m": 8.0, "cost_e": 71, "wps_m": 9.0, "wps_e": 66, "unlock_m": 5.0, "unlock_e": 71, "mult": 1.05, "icon": "⚛️", "cat": "Universal Siphon"},

        # --- Stage 6: Multiverse Office War Era (W23 - W29) (10^82 to 10^250) ---
        {"id": "bulk_brane_siphon", "name": "Bulk Brane High-Tensile Siphon", "cost_m": 1.0, "cost_e": 83, "wps_m": 1.1, "wps_e": 78, "unlock_m": 6.0, "unlock_e": 82, "mult": 1.05, "icon": "🔮", "cat": "Multiverse Extraction"},
        {"id": "staple_matter_reformer", "name": "Staple Alloy De-Alloy Smelter", "cost_m": 1.0, "cost_e": 106, "wps_m": 1.0, "wps_e": 101, "unlock_m": 6.0, "unlock_e": 105, "mult": 1.05, "icon": "⚔️", "cat": "Multiverse Extraction"},
        {"id": "calabi_wire_extruder", "name": "Non-Euclidean Wire Extruder", "cost_m": 1.0, "cost_e": 136, "wps_m": 9.0, "wps_e": 130, "unlock_m": 6.0, "unlock_e": 135, "mult": 1.04, "icon": "📐", "cat": "Multiverse Extraction"},
        {"id": "post_it_gum_refinery", "name": "Polymer Wire Polymerizer", "cost_m": 1.0, "cost_e": 181, "wps_m": 8.0, "wps_e": 175, "unlock_m": 6.0, "unlock_e": 180, "mult": 1.04, "icon": "📑", "cat": "Multiverse Extraction"},
        {"id": "quantum_chronofeed", "name": "Retrocausal Wire Chronofeed", "cost_m": 1.0, "cost_e": 231, "wps_m": 7.0, "wps_e": 225, "unlock_m": 6.0, "unlock_e": 230, "mult": 1.04, "icon": "⏳", "cat": "Multiverse Extraction"},
        {"id": "parallel_timeline_drain", "name": "Dead Universe Iron Siphon", "cost_m": 1.0, "cost_e": 260, "wps_m": 6.0, "wps_e": 254, "unlock_m": 6.0, "unlock_e": 259, "mult": 1.04, "icon": "🌌", "cat": "Multiverse Extraction"},
        {"id": "multiverse_omega_conduit", "name": "Multiverse Omega Conduit", "cost_m": 1.0, "cost_e": 290, "wps_m": 5.0, "wps_e": 284, "unlock_m": 6.0, "unlock_e": 289, "mult": 1.04, "icon": "💠", "cat": "Multiverse Extraction"},

        # --- Stage 7: Transfinite & Simulation Transcendence (W30 - W35) (10^330 to 10^520) ---
        {"id": "hilbert_space_transmuter", "name": "Hilbert Space Infinite Reel", "cost_m": 1.0, "cost_e": 330, "wps_m": 4.5, "wps_e": 324, "unlock_m": 6.0, "unlock_e": 329, "mult": 1.03, "icon": "📐", "cat": "Transfinite Creation"},
        {"id": "cantor_set_spooler", "name": "Cantor Dust Wire Spooler", "cost_m": 1.0, "cost_e": 375, "wps_m": 4.0, "wps_e": 369, "unlock_m": 6.0, "unlock_e": 374, "mult": 1.03, "icon": "♾️", "cat": "Transfinite Creation"},
        {"id": "goedel_unprovable_forge", "name": "Incompleteness Theorem Forge", "cost_m": 1.0, "cost_e": 420, "wps_m": 3.5, "wps_e": 414, "unlock_m": 6.0, "unlock_e": 419, "mult": 1.03, "icon": "📜", "cat": "Transfinite Creation"},
        {"id": "source_code_wire_dumper", "name": "C++ Heap Wire Buffer Allocator", "cost_m": 1.0, "cost_e": 465, "wps_m": 3.0, "wps_e": 459, "unlock_m": 6.0, "unlock_e": 464, "mult": 1.03, "icon": "💾", "cat": "Transfinite Creation"},
        {"id": "process_stack_overflow_forge", "name": "Simulation RAM Overflow Extruder", "cost_m": 1.0, "cost_e": 500, "wps_m": 2.5, "wps_e": 494, "unlock_m": 6.0, "unlock_e": 499, "mult": 1.02, "icon": "💻", "cat": "Transfinite Creation"},
        {"id": "root_privilege_materializer", "name": "Kernel-Level Wire Injector", "cost_m": 1.0, "cost_e": 525, "wps_m": 2.0, "wps_e": 519, "unlock_m": 6.0, "unlock_e": 524, "mult": 1.02, "icon": "👑", "cat": "Transfinite Creation"}
    ]

    return clip_buildings, wire_buildings

def main():
    clips, wires = generate_catalogs()
    print("=========================================================================================")
    print(f"VERIFYING 35 CLIP BUILDINGS & 35 WIRE BUILDINGS CATALOG")
    print("=========================================================================================\n")

    print(f"Total Clip Buildings: {len(clips)}")
    print(f"Total Wire Buildings: {len(wires)}\n")

    # Verify strictly ascending clip costs and CPS
    for i in range(len(clips)):
        b = clips[i]
        cost_val = b['cost_m'] * (10 ** b['cost_e']) if b['cost_e'] < 300 else 1e300
        cps_val = b['cps_m'] * (10 ** b['cps_e']) if b['cps_e'] < 300 else 1e300
        print(f"T{i+1:<2} {b['name']:<42} Cost: {b['cost_m']}e{b['cost_e']:<3} | CPS: {b['cps_m']}e{b['cps_e']:<3}")
        if i > 0:
            prev = clips[i-1]
            prev_cost = (prev['cost_e'], prev['cost_m'])
            curr_cost = (b['cost_e'], b['cost_m'])
            assert curr_cost > prev_cost, f"Cost non-ascending at T{i+1}"
            prev_cps = (prev['cps_e'], prev['cps_m'])
            curr_cps = (b['cps_e'], b['cps_m'])
            assert curr_cps > prev_cps, f"CPS non-ascending at T{i+1}"

    print("\n-----------------------------------------------------------------------------------------")
    # Verify strictly ascending wire costs and WPS
    for j in range(len(wires)):
        wb = wires[j]
        print(f"W{j+1:<2} {wb['name']:<42} Cost: {wb['cost_m']}e{wb['cost_e']:<3} | WPS: {wb['wps_m']}e{wb['wps_e']:<3}")
        if j > 0:
            prev_w = wires[j-1]
            prev_cost = (prev_w['cost_e'], prev_w['cost_m'])
            curr_cost = (wb['cost_e'], wb['cost_m'])
            assert curr_cost > prev_cost, f"Wire Cost non-ascending at W{j+1}"
            prev_wps = (prev_w['wps_e'], prev_w['wps_m'])
            curr_wps = (wb['wps_e'], wb['wps_m'])
            assert curr_wps > prev_wps, f"WPS non-ascending at W{j+1}"

    print("\n[SUCCESS] All 35 clip tiers and 35 wire tiers are strictly ascending and span 10^0 to 10^525!")

if __name__ == "__main__":
    main()
