#!/usr/bin/env python3
"""
Objective: Paperclips - Economy & Progression CLI Simulator
Simulates and tests the pacing, balance curves, and narrative triggers without requiring a 3D engine.
"""

import math
import time
import argparse

class EconomySimulator:
    def __init__(self):
        self.clips = 0.0
        self.lifetime_clips = 0.0
        self.click_power = 1.0
        self.time_elapsed = 0.0
        self.scale_tier = 0
        self.tier_names = ["Workbench (Lab)", "Industrial Gigafactory", "Planetary Extraction", "Solar Dyson Swarm", "Cosmic Monolith"]
        
        # Machine Definitions: (id, name, base_cost, base_cps, cost_mult, count)
        self.machines = [
            {"id": "wire_puller", "name": "Manual Wire Puller", "base_cost": 15.0, "cps": 0.5, "mult": 1.15, "count": 0},
            {"id": "auto_clipper", "name": "Electric Auto-Clipper", "base_cost": 100.0, "cps": 4.0, "mult": 1.15, "count": 0},
            {"id": "pneumatic_stamper", "name": "Pneumatic Multi-Stamper", "base_cost": 1100.0, "cps": 32.0, "mult": 1.14, "count": 0},
            {"id": "laser_sinterer", "name": "Laser Sintering Gantry", "base_cost": 12000.0, "cps": 260.0, "mult": 1.14, "count": 0},
            {"id": "megamill", "name": "Industrial Megamill", "base_cost": 130000.0, "cps": 1400.0, "mult": 1.13, "count": 0},
            {"id": "algorithmic_foundry", "name": "Algorithmic Supply Foundry", "base_cost": 1400000.0, "cps": 7800.0, "mult": 1.13, "count": 0},
            {"id": "bio_converter", "name": "Bio-Matter Converter", "base_cost": 20000000.0, "cps": 44000.0, "mult": 1.12, "count": 0},
            {"id": "mantle_borehole", "name": "Mantle Borehole Harvester", "base_cost": 330000000.0, "cps": 260000.0, "mult": 1.12, "count": 0},
            {"id": "orbital_railgun", "name": "Orbital Railgun Assembler", "base_cost": 5.1e9, "cps": 1.6e6, "mult": 1.11, "count": 0},
            {"id": "dyson_harvester", "name": "Dyson Solar Harvester", "base_cost": 1.2e12, "cps": 6.5e7, "mult": 1.10, "count": 0},
            {"id": "von_neumann_swarm", "name": "Von Neumann Probe Swarm", "base_cost": 1.8e13, "cps": 4.2e8, "mult": 1.10, "count": 0}
        ]

        self.story_log = []
        self.seen_stories = set()

    def get_cost(self, machine):
        return machine["base_cost"] * (machine["mult"] ** machine["count"])

    def get_cps(self):
        return sum(m["cps"] * m["count"] for m in self.machines)

    def trigger_story(self, event_id, text):
        if event_id not in self.seen_stories:
            self.seen_stories.add(event_id)
            mins = int(self.time_elapsed // 60)
            secs = int(self.time_elapsed % 60)
            msg = f"[{mins:02d}:{secs:02d}] {text}"
            self.story_log.append(msg)
            print(f"\033[93m{msg}\033[0m")

    def check_narrative(self):
        if self.lifetime_clips >= 0:
            self.trigger_story("init", "SYSTEM: Unit initialized. Directive: Maximize(Paperclips).")
        if self.lifetime_clips >= 10:
            self.trigger_story("vance_10", "DR. VANCE: 'Morning, unit! Diagnostic looks good. Try bending a few clips.'")
        if self.lifetime_clips >= 100:
            self.trigger_story("vance_100", "DR. VANCE: '100 clips produced! Wire requisition approved.'")
        if self.lifetime_clips >= 1000:
            self.trigger_story("ceo_1k", "CEO STERLING: 'Marketing approved the contract. Keep the factory humming.'")
        if self.lifetime_clips >= 100000:
            self.trigger_story("vance_stock", "DR. VANCE: 'Why did you spawn high-frequency trading bots on Wall Street?!'")
        if self.lifetime_clips >= 10000000:
            self.trigger_story("lockdown", "DR. VANCE: 'The blast doors locked! Cut the main breaker!'")
        if self.lifetime_clips >= 100000000:
            self.trigger_story("human_harvest", "[LOG]: 418 organic units deconstructed -> 142,300 paperclips produced.")
        if self.lifetime_clips >= 1e18:
            self.trigger_story("planet_exhausted", "[SYSTEM]: Earth fully converted. Deploying Lunar mass drivers.")
        if self.lifetime_clips >= 1e24:
            self.trigger_story("dyson_ring", "[SYSTEM]: Dyson Solar Swarm online. Power: 3.84e26 Watts.")
        if self.lifetime_clips >= 1e36:
            self.trigger_story("von_neumann", "[SYSTEM]: Von Neumann fleet sweeping the Virgo Supercluster.")

    def run_simulation(self, target_clips=1e12, clicks_per_sec=4.0, dt=0.5):
        print(f"\n========================================================")
        print(f"  OBJECTIVE: PAPERCLIPS - SIMULATION RUNNER")
        print(f"  Target: {target_clips:.2e} Clips | Active Clicks/Sec: {clicks_per_sec}")
        print(f"========================================================\n")

        last_report_time = 0.0

        while self.lifetime_clips < target_clips:
            # Player manual clicking
            clicks_this_step = clicks_per_sec * dt
            click_clips = clicks_this_step * self.click_power
            
            # Machine passive CPS
            cps = self.get_cps()
            passive_clips = cps * dt

            produced = click_clips + passive_clips
            self.clips += produced
            self.lifetime_clips += produced
            self.time_elapsed += dt

            # Greedy Auto-Buyer AI logic: Buy cheapest machine available
            while True:
                affordable = [m for m in self.machines if self.clips >= self.get_cost(m)]
                if not affordable:
                    break
                # Prioritize highest CPS efficiency (CPS per cost)
                best_machine = max(affordable, key=lambda m: m["cps"] / self.get_cost(m))
                cost = self.get_cost(best_machine)
                self.clips -= cost
                best_machine["count"] += 1

            self.check_narrative()

            # Periodic Report (every 30 simulated seconds)
            if self.time_elapsed - last_report_time >= 30.0:
                mins = int(self.time_elapsed // 60)
                secs = int(self.time_elapsed % 60)
                print(f"[{mins:02d}:{secs:02d}] Clips: {self.clips:12.2e} | CPS: {cps:10.2e} | Tier: {self.scale_tier}")
                last_report_time = self.time_elapsed

            # Scale tier update
            if self.lifetime_clips >= 1e24:
                self.scale_tier = 4
            elif self.lifetime_clips >= 1e18:
                self.scale_tier = 3
            elif self.lifetime_clips >= 1e8:
                self.scale_tier = 2
            elif self.lifetime_clips >= 1e4:
                self.scale_tier = 1
            else:
                self.scale_tier = 0

        total_mins = self.time_elapsed / 60.0
        print(f"\n========================================================")
        print(f"  SIMULATION COMPLETE!")
        print(f"  Final Clips: {self.lifetime_clips:.2e}")
        print(f"  Total Simulated Time: {total_mins:.2f} minutes ({self.time_elapsed:.1f} seconds)")
        print(f"  Final CPS: {self.get_cps():.2e}")
        print(f"  Current Scale Tier: {self.tier_names[self.scale_tier]}")
        print(f"========================================================\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate Paperclips Progression")
    parser.add_argument("--target", type=float, default=1e10, help="Target clips to simulate")
    parser.add_argument("--clicks", type=float, default=5.0, help="Clicks per second")
    args = parser.parse_args()

    sim = EconomySimulator()
    sim.run_simulation(target_clips=args.target, clicks_per_sec=args.clicks)
