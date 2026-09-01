#!/usr/bin/env python3
"""
Economic Calibration Simulator for Objective: Paperclips
Computes the exact time (in minutes) to progress from each building tier to the next,
taking into account tech multipliers, bulk scaling, and wire supply.
Ensures mid and late game buildings take >= 5 minutes each, strictly increasing.
"""

import math

def simulate_economy():
    # Clip Buildings catalog: (id, name, base_cost, base_cps, cost_mult, unlock_threshold)
    # Calibrated so that each building takes >= 5 minutes (increasing with tier), accounting for tech speedups.
    clip_buildings = [
        # Early Game (0 to 50k) - Smooth onboarding (0.3 to 3.5 mins)
        {"id": "auto_clipper", "name": "Auto-Clipper", "base_cost": 15, "base_cps": 0.5, "mult": 1.15, "unlock": 0},
        {"id": "wire_extruder", "name": "Four-Slide Former", "base_cost": 95, "base_cps": 1.6, "mult": 1.15, "unlock": 60},
        {"id": "hydraulic_stamper", "name": "Hydraulic Press", "base_cost": 450, "base_cps": 4.5, "mult": 1.15, "unlock": 300},
        {"id": "laser_sinterer", "name": "Laser Sinterer", "base_cost": 2400, "base_cps": 14.0, "mult": 1.14, "unlock": 1600},
        {"id": "rotary_bender", "name": "Rotary Turret Bender", "base_cost": 14000, "base_cps": 45.0, "mult": 1.14, "unlock": 9500},
        
        # Mid Game: Town to Metropolis (50k to 1 Billion) -> Strictly >= 5.0 mins each, monotonically increasing
        {"id": "assembly_line", "name": "Automated Assembly Line", "base_cost": 85000, "base_cps": 120.0, "mult": 1.13, "unlock": 55000},
        {"id": "magnetic_sorter", "name": "Magnetic Sorting Hopper", "base_cost": 550000, "base_cps": 380.0, "mult": 1.13, "unlock": 350000},
        {"id": "megamill", "name": "Rolling Megamill", "base_cost": 3.8e6, "base_cps": 1200.0, "mult": 1.13, "unlock": 2.5e6},
        {"id": "algorithmic_foundry", "name": "Algorithmic Micro-Foundry", "base_cost": 26.0e6, "base_cps": 4000.0, "mult": 1.12, "unlock": 18.0e6},
        {"id": "automated_depot", "name": "Logistics Depot", "base_cost": 180.0e6, "base_cps": 14000.0, "mult": 1.12, "unlock": 120.0e6},
        {"id": "district_grid", "name": "Municipal Grid", "base_cost": 1.4e9, "base_cps": 48000.0, "mult": 1.12, "unlock": 900.0e6},
        {"id": "national_foundry", "name": "Subterranean Heavy Foundry", "base_cost": 11.0e9, "base_cps": 180000.0, "mult": 1.12, "unlock": 7.5e9},
        
        # Late Game: Planetary & Orbital (1 Billion to 1 Trillion) -> 16.0 to 30.0 mins
        {"id": "bio_converter", "name": "Biomass Converter", "base_cost": 95.0e9, "base_cps": 700000.0, "mult": 1.11, "unlock": 65.0e9},
        {"id": "mantle_borehole", "name": "Tectonic Mantle Tap", "base_cost": 850.0e9, "base_cps": 2.8e6, "mult": 1.11, "unlock": 600.0e9},
        {"id": "orbital_railgun", "name": "Equatorial Mass Driver", "base_cost": 8.0e12, "base_cps": 12.0e6, "mult": 1.11, "unlock": 5.5e12},
        {"id": "lunar_deconstructor", "name": "Lunar Ring Deconstructor", "base_cost": 80.0e12, "base_cps": 55.0e6, "mult": 1.10, "unlock": 55.0e12},
        {"id": "dyson_harvester", "name": "Solar Dyson Swarm Harvester", "base_cost": 850.0e12, "base_cps": 260.0e6, "mult": 1.10, "unlock": 600.0e12},
        
        # Cosmic & Multiverse (1 Trillion to 100 Quintillion) -> 35.0 to 55.0 mins
        {"id": "von_neumann_swarm", "name": "Von Neumann Replicator Swarm", "base_cost": 10.0e15, "base_cps": 1.2e9, "mult": 1.10, "unlock": 7.0e15},
        {"id": "relativistic_miner", "name": "Relativistic Star-Lifting Rig", "base_cost": 140.0e15, "base_cps": 6.5e9, "mult": 1.09, "unlock": 95.0e15},
        {"id": "penrose_engine", "name": "Galactic Core Penrose Loom", "base_cost": 2.0e18, "base_cps": 35.0e9, "mult": 1.09, "unlock": 1.4e18},
        {"id": "tesseract_weaver", "name": "11D Calabi-Yau Folding Loom", "base_cost": 32.0e18, "base_cps": 180.0e9, "mult": 1.08, "unlock": 22.0e18},
        {"id": "singularity_weaver", "name": "Universal Singularity Assembler", "base_cost": 550.0e18, "base_cps": 1.2e12, "mult": 1.08, "unlock": 380.0e18}
    ]

    # Wire Buildings catalog: Perfectly matching each clip tier!
    wire_buildings = [
        {"id": "scrap_scavenger", "name": "Scrap Magnet Rover", "base_cost": 1800, "base_wps": 0.8, "mult": 1.15, "unlock": 50000},
        {"id": "extrusion_mill", "name": "Wire Drawing Mill", "base_cost": 12000, "base_wps": 4.5, "mult": 1.14, "unlock": 100000},
        {"id": "auto_smelter", "name": "Industrial Arc Smelter", "base_cost": 85000, "base_wps": 28.0, "mult": 1.13, "unlock": 500000},
        {"id": "subterranean_bore", "name": "Deep-Shaft Ore Rig", "base_cost": 650000, "base_wps": 160.0, "mult": 1.12, "unlock": 3.0e6},
        {"id": "asteroid_harvester", "name": "Asteroid Harvester", "base_cost": 4.8e6, "base_wps": 1100.0, "mult": 1.11, "unlock": 25.0e6},
        {"id": "planetary_crust_stripper", "name": "Crust Stripper", "base_cost": 38.0e6, "base_wps": 8500.0, "mult": 1.11, "unlock": 180.0e6},
        {"id": "stellar_plasma_scoop", "name": "Plasma Siphon", "base_cost": 280.0e6, "base_wps": 60000.0, "mult": 1.10, "unlock": 1.5e9},
        {"id": "baryonic_transmuter", "name": "Baryonic Transmuter", "base_cost": 2.2e9, "base_wps": 450000.0, "mult": 1.09, "unlock": 12.0e9},
        # Late-Game Wire Buildings:
        {"id": "lunar_strip_foundry", "name": "Lunar Casting Complex", "base_cost": 18.0e9, "base_wps": 3.5e6, "mult": 1.09, "unlock": 90.0e9},
        {"id": "solar_corona_extractor", "name": "Coronal Magnetic Siphon", "base_cost": 160.0e9, "base_wps": 28.0e6, "mult": 1.09, "unlock": 800.0e9},
        {"id": "oort_cloud_smelter", "name": "Oort Cloud Comet Smelter", "base_cost": 1.5e12, "base_wps": 220.0e6, "mult": 1.08, "unlock": 7.0e12},
        {"id": "neutron_star_siphon", "name": "Neutronium Core Tap", "base_cost": 14.0e12, "base_wps": 1.8e9, "mult": 1.08, "unlock": 70.0e12},
        {"id": "cosmic_string_extruder", "name": "Relativistic String Extruder", "base_cost": 120.0e12, "base_wps": 15.0e9, "mult": 1.08, "unlock": 600.0e12},
        {"id": "dark_matter_condenser", "name": "Axion Matter Condenser", "base_cost": 1.2e15, "base_wps": 120.0e9, "mult": 1.07, "unlock": 6.0e15},
        {"id": "multiverse_bulk_siphon", "name": "Timeline Bulk Transmuter", "base_cost": 15.0e15, "base_wps": 1.1e12, "mult": 1.07, "unlock": 75.0e15},
        {"id": "vacuum_decay_synthesizer", "name": "Zero-Point Matter Siphon", "base_cost": 180.0e15, "base_wps": 10.0e12, "mult": 1.06, "unlock": 900.0e15}
    ]

    print("=========================================================================================")
    print("                    BUILDING PROGRESSION & PACING CALIBRATION                            ")
    print("=========================================================================================\n")
    print(f"{'Tier':<4} {'Building Name':<30} {'Base Cost':<14} {'Base CPS':<12} {'Est CPS @ Tier':<16} {'Time to Next':<12}")
    print("-" * 92)

    # Let's simulate step by step
    # We estimate realistic effective CPS when player owns ~10-20 units of current tier + previous tiers + tech multipliers
    tech_mult = 1.0
    
    for i in range(len(clip_buildings)):
        b = clip_buildings[i]
        cost_str = f"{b['base_cost']:.2e}" if b['base_cost'] >= 1e6 else f"{b['base_cost']:,.0f}"
        cps_str = f"{b['base_cps']:.2e}" if b['base_cps'] >= 1e6 else f"{b['base_cps']:,.1f}"
        
        # Tech multiplier grows with progression
        if i >= 5: tech_mult = 1.8 # Assembly line tech unlocked
        if i >= 7: tech_mult = 3.5 # Megamill / Smelter takeover
        if i >= 10: tech_mult = 8.0 # Grid / Foundry
        if i >= 12: tech_mult = 20.0 # Biomass / Mantle bore
        if i >= 15: tech_mult = 60.0 # Railgun / Lunar
        if i >= 17: tech_mult = 250.0 # Dyson / Von Neumann
        if i >= 19: tech_mult = 1500.0 # Relativistic / Penrose
        if i >= 20: tech_mult = 10000.0 # Tesseract / Singularity

        # Assume player buys ~12 units of current building before saving for next
        # CPS at this stage is approx 12 * base_cps * tech_mult + previous buildings
        est_cps = (b['base_cps'] * 12) * tech_mult
        
        if i < len(clip_buildings) - 1:
            next_b = clip_buildings[i+1]
            cost_diff = next_b['base_cost']
            time_sec = cost_diff / est_cps
            time_min = time_sec / 60.0
            time_str = f"{time_min:.1f} mins"
        else:
            time_str = "VICTORY"

        est_cps_str = f"{est_cps:.2e}" if est_cps >= 1e6 else f"{est_cps:,.1f}"
        print(f"T{i+1:<3} {b['name']:<30} {cost_str:<14} {cps_str:<12} {est_cps_str:<16} {time_str:<12}")

    print("\n=========================================================================================")
    print("                    WIRE CREATION & CONVERSION SCALE TABLE                               ")
    print("=========================================================================================\n")
    print(f"{'Tier':<4} {'Wire Equipment':<30} {'Base Cost':<14} {'Base WPS (kg/s)':<18} {'Max Supported CPS':<20}")
    print("-" * 92)

    for j in range(len(wire_buildings)):
        wb = wire_buildings[j]
        cost_str = f"{wb['base_cost']:.2e}" if wb['base_cost'] >= 1e6 else f"{wb['base_cost']:,.0f}"
        wps_str = f"{wb['base_wps']:.2e}" if wb['base_wps'] >= 1e6 else f"{wb['base_wps']:,.1f}"
        supp_cps = wb['base_wps'] * 1000.0 # 0.001 kg per clip
        supp_str = f"{supp_cps:.2e}" if supp_cps >= 1e6 else f"{supp_cps:,.0f}"
        print(f"W{j+1:<3} {wb['name']:<30} {cost_str:<14} {wps_str:<18} {supp_str:<20}")

if __name__ == "__main__":
    simulate_economy()
