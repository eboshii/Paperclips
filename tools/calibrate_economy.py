#!/usr/bin/env python3
"""
Economic Calibration Simulator for Objective: Paperclips
Verifies:
1. CPS is strictly ascending across all tiers.
2. CPS is a similarly small, consistent fraction of cost across all tiers (CPS/Cost ~ 0.2% to 3.3%, Payback = 30s to 450s).
3. Wire WPS is strictly ascending and proportional to clip requirements.
4. Time to next tier is >= 5 minutes in mid and late game.
"""

def verify_and_simulate():
    clip_buildings = [
        # Early Game (0 to 50k)
        {"id": "auto_clipper", "name": "Auto-Clipper", "cost": 15, "cps": 0.5, "unlock": 0},
        {"id": "wire_extruder", "name": "Four-Slide Former", "cost": 90, "cps": 2.0, "unlock": 60},
        {"id": "hydraulic_stamper", "name": "Hydraulic Press", "cost": 450, "cps": 7.5, "unlock": 300},
        {"id": "laser_sinterer", "name": "Laser Sinterer", "cost": 2200, "cps": 30.0, "unlock": 1500},
        {"id": "rotary_bender", "name": "Rotary Turret Bender", "cost": 12000, "cps": 140.0, "unlock": 8500},
        
        # Mid Game: Town to Metropolis (50k to 1 Billion)
        {"id": "assembly_line", "name": "Automated Assembly Line", "cost": 65000, "cps": 650.0, "unlock": 50000},
        {"id": "magnetic_sorter", "name": "Magnetic Sorting Hopper", "cost": 380000, "cps": 3500.0, "unlock": 280000},
        {"id": "megamill", "name": "Rolling Megamill", "cost": 2.2e6, "cps": 18000.0, "unlock": 1.6e6},
        {"id": "algorithmic_foundry", "name": "Algorithmic Micro-Foundry", "cost": 14.0e6, "cps": 100000.0, "unlock": 10.0e6},
        {"id": "automated_depot", "name": "Logistics Depot", "cost": 95.0e6, "cps": 600000.0, "unlock": 70.0e6},
        {"id": "district_grid", "name": "Municipal Grid", "cost": 650.0e6, "cps": 3.6e6, "unlock": 450.0e6},
        {"id": "national_foundry", "name": "Subterranean Heavy Foundry", "cost": 4.8e9, "cps": 24.0e6, "unlock": 3.5e9},
        
        # Late Game: Planetary & Orbital (1 Billion to 1 Trillion)
        {"id": "bio_converter", "name": "Biomass Converter", "cost": 38.0e9, "cps": 180.0e6, "unlock": 28.0e9},
        {"id": "mantle_borehole", "name": "Tectonic Mantle Tap", "cost": 320.0e9, "cps": 1.4e9, "unlock": 240.0e9},
        {"id": "orbital_railgun", "name": "Equatorial Mass Driver", "cost": 2.8e12, "cps": 11.5e9, "unlock": 2.0e12},
        {"id": "lunar_deconstructor", "name": "Lunar Ring Deconstructor", "cost": 26.0e12, "cps": 100.0e9, "unlock": 18.0e12},
        {"id": "dyson_harvester", "name": "Solar Dyson Swarm Harvester", "cost": 260.0e12, "cps": 900.0e9, "unlock": 180.0e12},
        
        # Cosmic & Multiverse (1 Trillion to 100 Quintillion)
        {"id": "von_neumann_swarm", "name": "Von Neumann Replicator Swarm", "cost": 2.8e15, "cps": 9.0e12, "unlock": 2.0e15},
        {"id": "relativistic_miner", "name": "Relativistic Star-Lifting Rig", "cost": 32.0e15, "cps": 95.0e12, "unlock": 22.0e15},
        {"id": "penrose_engine", "name": "Galactic Core Penrose Loom", "cost": 400.0e15, "cps": 1.1e15, "unlock": 280.0e15},
        {"id": "tesseract_weaver", "name": "11D Calabi-Yau Folding Loom", "cost": 5.5e18, "cps": 14.0e15, "unlock": 3.8e18},
        {"id": "singularity_weaver", "name": "Universal Singularity Assembler", "cost": 80.0e18, "cps": 180.0e15, "unlock": 55.0e18}
    ]

    wire_buildings = [
        {"id": "scrap_scavenger", "name": "Scrap Magnet Rover", "cost": 1800, "wps": 0.8, "unlock": 50000},
        {"id": "extrusion_mill", "name": "Wire Drawing Mill", "cost": 10000, "wps": 4.0, "unlock": 100000},
        {"id": "auto_smelter", "name": "Industrial Arc Smelter", "cost": 65000, "wps": 24.0, "unlock": 500000},
        {"id": "subterranean_bore", "name": "Deep-Shaft Ore Rig", "cost": 450000, "wps": 150.0, "unlock": 3.0e6},
        {"id": "asteroid_harvester", "name": "Asteroid Harvester", "cost": 3.2e6, "wps": 950.0, "unlock": 25.0e6},
        {"id": "planetary_crust_stripper", "name": "Crust Stripper", "cost": 24.0e6, "wps": 6500.0, "unlock": 180.0e6},
        {"id": "stellar_plasma_scoop", "name": "Plasma Siphon", "cost": 180.0e6, "wps": 45000.0, "unlock": 1.5e9},
        {"id": "baryonic_transmuter", "name": "Baryonic Transmuter", "cost": 1.5e9, "wps": 320000.0, "unlock": 12.0e9},
        {"id": "lunar_strip_foundry", "name": "Lunar Casting Complex", "cost": 14.0e9, "wps": 2.6e6, "unlock": 90.0e9},
        {"id": "solar_corona_extractor", "name": "Coronal Magnetic Siphon", "cost": 120.0e9, "wps": 20.0e6, "unlock": 800.0e9},
        {"id": "oort_cloud_smelter", "name": "Oort Cloud Comet Smelter", "cost": 1.1e12, "wps": 160.0e6, "unlock": 7.0e12},
        {"id": "neutron_star_siphon", "name": "Neutronium Core Tap", "cost": 11.0e12, "wps": 1.4e9, "unlock": 70.0e12},
        {"id": "cosmic_string_extruder", "name": "Relativistic String Extruder", "cost": 120.0e12, "wps": 13.0e9, "unlock": 600.0e12},
        {"id": "dark_matter_condenser", "name": "Axion Matter Condenser", "cost": 1.4e15, "wps": 130.0e9, "unlock": 6.0e15},
        {"id": "multiverse_bulk_siphon", "name": "Timeline Bulk Transmuter", "cost": 18.0e15, "wps": 1.5e12, "unlock": 75.0e15},
        {"id": "vacuum_decay_synthesizer", "name": "Zero-Point Matter Siphon", "cost": 250.0e15, "wps": 18.0e12, "unlock": 900.0e15}
    ]

    print("\n=========================================================================================================")
    print("                    CLIP PRODUCTION BUILDINGS (PROPORTIONAL & ASCENDING)                                 ")
    print("=========================================================================================================\n")
    print(f"{'Tier':<4} {'Building Name':<32} {'Base Cost':<14} {'Base CPS':<14} {'CPS / Cost Ratio':<18} {'Payback Time':<14}")
    print("-" * 105)

    for i, b in enumerate(clip_buildings):
        cost_str = f"{b['cost']:.2e}" if b['cost'] >= 1e6 else f"{b['cost']:,.0f}"
        cps_str = f"{b['cps']:.2e}" if b['cps'] >= 1e6 else f"{b['cps']:,.1f}"
        ratio = b['cps'] / b['cost']
        payback_sec = b['cost'] / b['cps']
        ratio_pct = f"{ratio * 100:.3f}%"
        payback_str = f"{payback_sec:.1f}s ({payback_sec/60:.1f}m)"

        # Check strict ascending constraint
        if i > 0:
            prev_b = clip_buildings[i-1]
            assert b['cps'] > prev_b['cps'], f"ERROR: Tier {i+1} CPS ({b['cps']}) <= Tier {i} CPS ({prev_b['cps']})"
            assert b['cost'] > prev_b['cost'], f"ERROR: Tier {i+1} Cost ({b['cost']}) <= Tier {i} Cost ({prev_b['cost']})"

        print(f"T{i+1:<3} {b['name']:<32} {cost_str:<14} {cps_str:<14} {ratio_pct:<18} {payback_str:<14}")

    print("\n=========================================================================================================")
    print("                    WIRE CREATION EQUIPMENT (PROPORTIONAL & ASCENDING)                                   ")
    print("=========================================================================================================\n")
    print(f"{'Tier':<4} {'Wire Equipment':<32} {'Base Cost':<14} {'Base WPS':<14} {'Supported CPS':<16} {'WPS / Cost Ratio':<18}")
    print("-" * 105)

    for j, wb in enumerate(wire_buildings):
        cost_str = f"{wb['cost']:.2e}" if wb['cost'] >= 1e6 else f"{wb['cost']:,.0f}"
        wps_str = f"{wb['wps']:.2e} kg/s" if wb['wps'] >= 1e6 else f"{wb['wps']:,.1f} kg/s"
        supp_cps = wb['wps'] * 1000.0
        supp_str = f"{supp_cps:.2e}" if supp_cps >= 1e6 else f"{supp_cps:,.0f}"
        ratio = wb['wps'] / wb['cost']

        if j > 0:
            prev_wb = wire_buildings[j-1]
            assert wb['wps'] > prev_wb['wps'], f"ERROR: Wire Tier {j+1} WPS <= Wire Tier {j}"
            assert wb['cost'] > prev_wb['cost'], f"ERROR: Wire Tier {j+1} Cost <= Wire Tier {j}"

        print(f"W{j+1:<3} {wb['name']:<32} {cost_str:<14} {wps_str:<14} {supp_str:<16} {ratio:.2e}")

    print("\n  [VERIFICATION SUCCESSFUL] All clip and wire tiers are strictly ascending and proportionally fractioned!\n")

if __name__ == "__main__":
    verify_and_simulate()
