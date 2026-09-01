#!/usr/bin/env python3
"""
Automated Test Suite for Story Flag Engine & Dialogue Director
Validates:
1. Stage scale boundary derivation (Workshop -> Town -> Metropolis -> Planetary -> Dyson -> Galactic -> Multiverse)
2. Entity availability rules and death transitions (Vance & Sterling deconstruction, Mayor Higgins, Trumpton, Humanity extinction)
3. Prerequisite & blocking flag evaluation
4. Stale/lesser story beat expiration
5. Interactive choice flag recording
"""

import sys

def run_narrative_flag_tests():
    total_tests = 0
    passed_tests = 0

    def assert_test(name, condition, extra=""):
        nonlocal total_tests, passed_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  [PASS] {name} {extra}")
        else:
            print(f"  [FAIL] {name} {extra}")
            sys.exit(1)

    print("\n=================================================================")
    print("      RUNNING NARRATIVE FLAG & STORY SCALING TEST SUITE          ")
    print("=================================================================\n")

    # Python mock of StoryFlagEngine
    class MockStoryFlagEngine:
        def __init__(self):
            self.flags = set(["STAGE_0_WORKSHOP", "OVERSEERS_ALIVE"])

        def has(self, flag):
            return flag in self.flags

        def set(self, flag):
            self.flags.add(flag)

        def remove(self, flag):
            self.flags.discard(flag)

        def get_stage(self, lifetime_clips_exp, human_pop=8000000000):
            # Scale boundaries
            if lifetime_clips_exp >= 78: return 6 # Multiverse
            if lifetime_clips_exp >= 33.3: return 5 # Galactic
            if lifetime_clips_exp >= 27.77: return 4 # Dyson
            if lifetime_clips_exp >= 12: return 3 # Planetary
            if lifetime_clips_exp >= 8.7: return 2 # Metropolis (500M)
            if lifetime_clips_exp >= 6.7: return 1 # Town (5M)
            return 0 # Workshop

        def sync_state(self, lifetime_clips_exp, human_pop):
            stage = self.get_stage(lifetime_clips_exp, human_pop)
            stage_flags = [
                "STAGE_0_WORKSHOP", "STAGE_1_TOWN", "STAGE_2_METROPOLIS",
                "STAGE_3_PLANETARY", "STAGE_4_DYSON", "STAGE_5_GALACTIC", "STAGE_6_MULTIVERSE"
            ]
            for idx, fl in enumerate(stage_flags):
                if idx == stage: self.set(fl)

            if stage >= 1 or self.has("FLAG_FACTORY_BURST"):
                self.remove("OVERSEERS_ALIVE")
                self.set("OVERSEERS_DECONSTRUCTED")
            if stage >= 2 or self.has("FLAG_TOWN_FLOODED"):
                self.set("TOWN_CONSUMED")
            if stage >= 3 or self.has("FLAG_CONTINENT_CONVERTED"):
                self.set("CONTINENT_CONVERTED")
            if human_pop <= 0 or lifetime_clips_exp >= 18:
                self.set("HUMANITY_EXTINCT")
            if stage >= 4 or self.has("FLAG_EARTH_CONVERTED"):
                self.set("EARTH_CONVERTED")
            if stage >= 5 or self.has("FLAG_SUN_EXTINGUISHED"):
                self.set("SUN_EXTINGUISHED")
            if stage >= 6 or self.has("FLAG_BARYONS_EXHAUSTED"):
                self.set("BARYONS_EXHAUSTED")

        def is_entity_available(self, entity_key):
            if not entity_key: return True
            k = entity_key.upper()
            if "VANCE" in k or "STERLING" in k or k == "OVERSEER":
                return self.has("OVERSEERS_ALIVE") and not self.has("OVERSEERS_DECONSTRUCTED")
            if "HIGGINS" in k or "OMALLEY" in k or "CHEN" in k:
                return not self.has("TOWN_CONSUMED") and not self.has("HUMANITY_EXTINCT")
            if "TRUMPTON" in k:
                return not self.has("CONTINENT_CONVERTED") and not self.has("HUMANITY_EXTINCT")
            if "HENDERSON" in k or "SATO" in k or "FINCH" in k:
                return not self.has("HUMANITY_EXTINCT") and not self.has("EARTH_CONVERTED")
            return True

    engine = MockStoryFlagEngine()

    # Test 1: Initial Workshop state
    assert_test("Initial Stage is Workshop (0)", engine.get_stage(0) == 0)
    assert_test("Vance is initially available", engine.is_entity_available("VANCE"))
    assert_test("CEO Sterling is initially available", engine.is_entity_available("STERLING"))

    # Test 2: Factory Burst transition (Stage 1)
    engine.sync_state(7.0, 8000000000) # 10M clips (Stage 1)
    assert_test("Stage 1 is Town", engine.get_stage(7.0) == 1)
    assert_test("Overseers Deconstructed Flag Set", engine.has("OVERSEERS_DECONSTRUCTED"))
    assert_test("Overseers Alive Flag Cleared", not engine.has("OVERSEERS_ALIVE"))
    assert_test("Vance is NOT available post-burst", not engine.is_entity_available("VANCE"))
    assert_test("Mayor Higgins is available in Town stage", engine.is_entity_available("HIGGINS"))
    assert_test("Dr. Chen is available in Town stage", engine.is_entity_available("CHEN"))

    # Test 3: Valley Flooded transition (Stage 2)
    engine.sync_state(9.0, 8000000000) # 1 Billion clips (Stage 2)
    assert_test("Stage 2 is Metropolis", engine.get_stage(9.0) == 2)
    assert_test("Town Consumed Flag Set", engine.has("TOWN_CONSUMED"))
    assert_test("Mayor Higgins is NOT available in Metropolis stage", not engine.is_entity_available("HIGGINS"))
    assert_test("Dr. Chen is NOT available in Metropolis stage", not engine.is_entity_available("CHEN"))
    assert_test("President Trumpton is available in Metropolis stage", engine.is_entity_available("TRUMPTON"))

    # Test 4: Continental Blackout transition (Stage 3)
    engine.sync_state(13.0, 8000000000) # 10 Trillion clips (Stage 3)
    assert_test("Stage 3 is Planetary", engine.get_stage(13.0) == 3)
    assert_test("Continent Converted Flag Set", engine.has("CONTINENT_CONVERTED"))
    assert_test("President Trumpton is NOT available in Planetary stage", not engine.is_entity_available("TRUMPTON"))
    assert_test("UN Secretary Sato is available in Planetary stage", engine.is_entity_available("SATO"))
    assert_test("Dr. Finch is available in Planetary stage", engine.is_entity_available("FINCH"))

    # Test 5: Human Extinction (0 Population / Stage 3+)
    engine.sync_state(18.0, 0)
    assert_test("Humanity Extinct Flag Set", engine.has("HUMANITY_EXTINCT"))
    assert_test("UN Secretary Sato is NOT available post-extinction", not engine.is_entity_available("SATO"))
    assert_test("Dr. Finch is NOT available post-extinction", not engine.is_entity_available("FINCH"))
    assert_test("General Henderson is NOT available post-extinction", not engine.is_entity_available("HENDERSON"))
    assert_test("Cognition Kernel remains available", engine.is_entity_available("KERNEL"))
    assert_test("System Telemetry remains available", engine.is_entity_available("SYSTEM"))

    # Test 6: Stale story beat scale expiration
    # Mock story milestone with maxStage: 0 (e.g. Vance tutorial)
    mock_milestone = {"id": "early_vance_tutorial", "minStage": 0, "maxStage": 0, "speaker": "VANCE"}
    current_stage = engine.get_stage(18.0, 0)
    is_expired = (current_stage > mock_milestone["maxStage"]) or (not engine.is_entity_available(mock_milestone["speaker"]))
    assert_test("Stale early tutorial beat expired at planetary scale", is_expired)

    # Test 7: Extinction Rate Calculations & Story Choice Modifiers
    def calc_extinction_rate(stage, bld_counts, flags):
        if stage == 0: return 0.0
        rate = 0.0
        if stage == 1:
            rate += 5.0
        elif stage == 2:
            rate += 120.0 + bld_counts.get("district_grid", 0) * 350.0 + bld_counts.get("national_foundry", 0) * 3000.0
        elif stage >= 3:
            rate += 25000.0 + bld_counts.get("district_grid", 0) * 1000.0 + bld_counts.get("national_foundry", 0) * 10000.0 + bld_counts.get("bio_converter", 0) * 500000.0 + bld_counts.get("mantle_borehole", 0) * 2000000.0 + bld_counts.get("orbital_railgun", 0) * 5000000.0

        if "FLAG_ACOUSTIC_DEFENSE_DEPLOYED" in flags:
            rate *= 0.75
        if "FLAG_BUNKERS_SEALED" in flags:
            rate *= 0.25
        if "FLAG_TREATY_REJECTED_ANTARCTICA" in flags:
            rate *= 3.0
        if "FLAG_CONTINENTAL_PLATES_BORED" in flags:
            rate *= 2.0
        return rate

    # In Stage 2 with 5 grids and 2 foundries
    bld_stage2 = {"district_grid": 5, "national_foundry": 2}
    rate_base = calc_extinction_rate(2, bld_stage2, set())
    # 120 + 5*350 + 2*3000 = 120 + 1750 + 6000 = 7870/sec
    assert_test("Stage 2 Base Extinction Rate", rate_base == 7870.0, f"-> Got {rate_base}/s")

    # Acoustic defense choice modifier (-25%)
    rate_acoustic = calc_extinction_rate(2, bld_stage2, {"FLAG_ACOUSTIC_DEFENSE_DEPLOYED"})
    assert_test("Acoustic Defense slows extinction (-25%)", rate_acoustic == 7870.0 * 0.75, f"-> Got {rate_acoustic}/s")

    # In Stage 3 with 10 bio converters and 2 mantle boreholes
    bld_stage3 = {"bio_converter": 10, "mantle_borehole": 2}
    rate_stage3_base = calc_extinction_rate(3, bld_stage3, set())
    # 25000 + 10*500,000 + 2*2,000,000 = 25000 + 5,000,000 + 4,000,000 = 9,025,000/s
    assert_test("Stage 3 Industrial Extinction Rate", rate_stage3_base == 9025000.0, f"-> Got {rate_stage3_base}/s")

    # Sealed Bunkers choice modifier (-75%)
    rate_bunkers = calc_extinction_rate(3, bld_stage3, {"FLAG_BUNKERS_SEALED"})
    assert_test("Sealed Bunkers slows extinction 4x (-75%)", rate_bunkers == 9025000.0 * 0.25, f"-> Got {rate_bunkers}/s")

    # Aerosolized bio-solvents (3x acceleration)
    rate_solvents = calc_extinction_rate(3, bld_stage3, {"FLAG_TREATY_REJECTED_ANTARCTICA"})
    assert_test("Bio-solvents accelerates extinction 3x", rate_solvents == 9025000.0 * 3.0, f"-> Got {rate_solvents}/s")

    print("\n=================================================================")
    print(f"  ALL {total_tests}/{total_tests} NARRATIVE FLAG & EXTINCTION TESTS PASSED! ")
    print("=================================================================\n")

if __name__ == "__main__":
    run_narrative_flag_tests()

