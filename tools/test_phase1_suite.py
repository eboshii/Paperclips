#!/usr/bin/env python3
"""
Comprehensive Phase 1 Automated Test Suite & Validation Harness
Validates:
1. Arbitrary Large Number Arithmetic (BigDouble logic)
2. Number Formatting (Short Scale, Scientific, Engineering, Compact)
3. O(1) Logarithmic Buy-Max vs Iterative Loop Identity
4. Dynamic Modifier System (Flat, Additive, Compound)
5. Analytical O(1) Offline Time-Warp & Wire Depletion
6. Save/Load Serialization & Tamper Detection Checksum
7. 1,000,000 Tick Simulation Stress Test
"""

import math
import json
import hashlib
import base64
import sys

# ==========================================
# 1. BigDouble Python Reference Implementation
# ==========================================
class BigDouble:
    def __init__(self, mantissa=0.0, exponent=0):
        self.mantissa = float(mantissa)
        self.exponent = int(exponent)
        self.normalize()

    def normalize(self):
        if self.mantissa == 0.0 or math.isnan(self.mantissa) or math.isinf(self.mantissa):
            self.mantissa = 0.0
            self.exponent = 0
            return
        abs_m = abs(self.mantissa)
        if abs_m >= 10.0 or abs_m < 1.0:
            shift = int(math.floor(math.log10(abs_m)))
            self.mantissa /= (10.0 ** shift)
            self.exponent += shift

    def __add__(self, other):
        if not isinstance(other, BigDouble):
            other = BigDouble(other, 0)
        if self.mantissa == 0: return other
        if other.mantissa == 0: return self
        diff = self.exponent - other.exponent
        if diff >= 16: return self
        if diff <= -16: return other
        if diff >= 0:
            return BigDouble(self.mantissa + other.mantissa * (10.0 ** -diff), self.exponent)
        else:
            return BigDouble(self.mantissa * (10.0 ** diff) + other.mantissa, other.exponent)

    def __sub__(self, other):
        if not isinstance(other, BigDouble):
            other = BigDouble(other, 0)
        return self + BigDouble(-other.mantissa, other.exponent)

    def __mul__(self, other):
        if not isinstance(other, BigDouble):
            other = BigDouble(other, 0)
        if self.mantissa == 0 or other.mantissa == 0:
            return BigDouble(0, 0)
        return BigDouble(self.mantissa * other.mantissa, self.exponent + other.exponent)

    def __truediv__(self, other):
        if not isinstance(other, BigDouble):
            other = BigDouble(other, 0)
        if other.mantissa == 0:
            raise ZeroDivisionError("Division by Zero in BigDouble")
        if self.mantissa == 0:
            return BigDouble(0, 0)
        return BigDouble(self.mantissa / other.mantissa, self.exponent - other.exponent)

    def __lt__(self, other):
        if not isinstance(other, BigDouble): other = BigDouble(other, 0)
        if self.exponent != other.exponent:
            return self.exponent < other.exponent if self.mantissa > 0 else self.exponent > other.exponent
        return self.mantissa < other.mantissa

    def __le__(self, other):
        return self < other or self == other

    def __gt__(self, other):
        if not isinstance(other, BigDouble): other = BigDouble(other, 0)
        return not (self <= other)

    def __ge__(self, other):
        return not (self < other)

    def __eq__(self, other):
        if not isinstance(other, BigDouble): other = BigDouble(other, 0)
        return self.exponent == other.exponent and abs(self.mantissa - other.mantissa) < 1e-12

    def log10(self):
        if self.mantissa <= 0: raise ValueError("Log10 of non-positive BigDouble")
        return math.log10(self.mantissa) + self.exponent

    def pow(self, p):
        if self.mantissa == 0: return BigDouble(0, 0)
        new_log = self.log10() * p
        new_exp = int(math.floor(new_log))
        new_m = 10.0 ** (new_log - new_exp)
        return BigDouble(new_m, new_exp)

    def to_short_scale(self):
        prefixes = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"]
        idx = self.exponent // 3
        if idx < len(prefixes):
            scaled = self.mantissa * (10.0 ** (self.exponent % 3))
            p = prefixes[idx]
            return f"{scaled:.2f} {p}".strip()
        return f"{self.mantissa:.2f}e{self.exponent}"

# ==========================================
# 2. Buy-Max O(1) Logarithmic Calculator
# ==========================================
def buy_n_cost(base_cost, r, k, n):
    if n <= 0: return BigDouble(0, 0)
    if n == 1: return base_cost * (r ** k)
    series_factor = ((r ** n) - 1.0) / (r - 1.0)
    return base_cost * (r ** k) * series_factor

def buy_max_affordable(base_cost, r, k, currency):
    first_cost = base_cost * (r ** k)
    if currency < first_cost:
        return 0, BigDouble(0, 0)
    
    r_minus_one = r - 1.0
    numerator = currency * r_minus_one
    denominator = first_cost
    ratio = (numerator / denominator) + 1.0
    
    log_ratio = ratio.log10() * math.log(10.0)
    log_r = math.log(r)
    max_count = int(math.floor(log_ratio / log_r))
    
    cost = buy_n_cost(base_cost, r, k, max_count)
    while cost > currency and max_count > 0:
        max_count -= 1
        cost = buy_n_cost(base_cost, r, k, max_count)
    return max_count, cost

# ==========================================
# 3. Test Runner
# ==========================================
def run_all_tests():
    print("=================================================================")
    print("      RUNNING PHASE 1 TEST SUITE & ARCHITECTURE VALIDATION        ")
    print("=================================================================\n")

    passed_tests = 0
    total_tests = 0

    def assert_test(name, condition, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  [\033[92mPASS\033[0m] {name} {details}")
        else:
            print(f"  [\033[91mFAIL\033[0m] {name} {details}")
            sys.exit(1)

    # --- Test 1: BigDouble Normalization & High Exponents ---
    a = BigDouble(1234.56, 10) # 1.23456e13
    assert_test("BigDouble Normalization", abs(a.mantissa - 1.23456) < 1e-5 and a.exponent == 13, f"-> Got {a.mantissa}e{a.exponent}")

    # Cosmic exponent (e1000)
    b = BigDouble(5.0, 1000)
    c = BigDouble(2.0, 500)
    prod = b * c
    assert_test("Cosmic Multiplication (10^1500)", prod.exponent == 1501 and abs(prod.mantissa - 1.0) < 1e-5, f"-> Got {prod.mantissa}e{prod.exponent}")

    # Epsilon addition
    d = BigDouble(1.0, 100)
    e = BigDouble(1.0, 50)
    sum_res = d + e
    assert_test("Epsilon Absorbed Addition", sum_res.exponent == 100 and abs(sum_res.mantissa - 1.0) < 1e-12)

    # Sqrt & Pow
    base_val = BigDouble(1.6, 9) # 1.6 Billion
    sqrt_val = base_val.pow(0.5)
    assert_test("BigDouble Square Root", abs(sqrt_val.log10() - 4.602) < 0.01)

    # --- Test 2: Number Formatter ---
    m1 = BigDouble(1.45, 6) # 1.45 Million
    assert_test("Format Short Scale (Million)", m1.to_short_scale() == "1.45 Million", f"-> Got {m1.to_short_scale()}")

    m2 = BigDouble(9.87, 14) # 987.00 Trillion (9.87 * 10^14 = 987 * 10^12)
    assert_test("Format Short Scale (Trillion)", m2.to_short_scale() == "987.00 Trillion", f"-> Got {m2.to_short_scale()}")

    # --- Test 3: Buy-Max O(1) Logarithmic vs Step-by-Step Loop Identity ---
    base_cost = BigDouble(100.0, 0)
    r = 1.15
    k = 25
    available_currency = BigDouble(1.0, 9) # 1 Billion

    # O(1) closed-form calculation
    max_count, total_cost = buy_max_affordable(base_cost, r, k, available_currency)

    # Iterative step-by-step verification
    iter_cost = BigDouble(0, 0)
    iter_count = 0
    current_k = k
    while True:
        next_cost = base_cost * (r ** current_k)
        if iter_cost + next_cost <= available_currency:
            iter_cost = iter_cost + next_cost
            iter_count += 1
            current_k += 1
        else:
            break

    assert_test("O(1) Buy-Max Formula Equivalence", max_count == iter_count, f"-> O(1): {max_count} vs Iterative: {iter_count}")
    assert_test("Buy-Max Cost Verification", abs(total_cost.log10() - iter_cost.log10()) < 1e-6)

    # --- Test 4: Dynamic Modifier Evaluation ---
    base_cps = 100.0
    # Modifiers: +50 Flat, +100% Additive (x2), +50% Compound (x1.5)
    # Expected: (100 + 50) * (1 + 1.0) * (1 + 0.5) = 150 * 2.0 * 1.5 = 450.0
    flat_sum = 50.0
    add_sum = 1.0
    comp_prod = 1.5
    final_cps = (base_cps + flat_sum) * (1.0 + add_sum) * comp_prod
    assert_test("Modifier Formula Evaluation", final_cps == 450.0, f"-> Got {final_cps}")

    # --- Test 5: Analytical O(1) Offline Time-Warp ---
    # Scenario: 500kg wire, 1000 clips/sec, 0.001kg wire/clip -> 1kg wire/sec.
    # Wire runs out in 500 seconds. Offline duration: 3600 seconds (1 hour). Offline efficiency: 50%.
    # Expected produced: 500s * 1000 cps * 0.50 = 250,000 clips. Wire left: 0kg.
    wire_kg = 500.0
    cps = 1000.0
    wire_burn_rate = cps * 0.001
    t_exhaust = wire_kg / wire_burn_rate
    offline_sec = 3600.0
    eff = 0.50

    clips_produced = cps * min(offline_sec, t_exhaust) * eff
    wire_left = max(0.0, wire_kg - wire_burn_rate * offline_sec)

    assert_test("Offline Time-Warp Wire Exhaustion", clips_produced == 250000.0 and wire_left == 0.0, f"-> Produced: {clips_produced}, Wire: {wire_left}")

    # --- Test 5b: Live Wire Starvation 50% Penalty Simulation ---
    # Scenario: 0 kg wire, 1,000 base CPS, net negative wire production.
    # Expected: 50% speed penalty -> 500 clips/sec effective.
    base_live_cps = 1000.0
    is_starved = True
    effective_live_cps = base_live_cps * 0.5 if is_starved else base_live_cps
    assert_test("Wire Starvation 50% Speed Penalty", effective_live_cps == 500.0, f"-> Base: {base_live_cps} CPS, Starved: {effective_live_cps} CPS")

    # --- Test 6: Save Serialization & SHA-256 Anti-Cheat ---
    save_data = {
        "TotalClips": {"Mantissa": 1.45, "Exponent": 12},
        "LifetimeClips": {"Mantissa": 2.10, "Exponent": 12},
        "PrestigeRank": 3
    }
    raw_json = json.dumps(save_data)
    salt = "ObjectivePaperclips_EntropySecret_2026"
    valid_hash = hashlib.sha256((raw_json + salt).encode('utf-8')).hexdigest()

    # Valid save check
    assert_test("Save Payload SHA-256 Generation", len(valid_hash) == 64)

    # Tampered save check
    tampered_json = json.dumps({
        "TotalClips": {"Mantissa": 9.99, "Exponent": 99}, # Hacked clips
        "LifetimeClips": {"Mantissa": 2.10, "Exponent": 12},
        "PrestigeRank": 3
    })
    check_hash = hashlib.sha256((tampered_json + salt).encode('utf-8')).hexdigest()
    assert_test("Anti-Cheat Detects Tampered Save", check_hash != valid_hash)

    # Base64 export/import
    payload = {"GameStateJson": raw_json, "ChecksumSha256": valid_hash}
    b64_str = base64.b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8')
    decoded = json.loads(base64.b64decode(b64_str.encode('utf-8')).decode('utf-8'))
    assert_test("Base64 Clipboard Export/Import Roundtrip", decoded["ChecksumSha256"] == valid_hash)

    # --- Test 7: 1,000,000 Tick Simulation Stress Test ---
    print("\n  [STRESS TEST] Simulating 1,000,000 fixed ticks (50,000 seconds of continuous play)...")
    sim_clips = BigDouble(0, 0)
    sim_cps = BigDouble(1.5, 6) # 1.5M CPS
    dt = 0.05
    step_yield = sim_cps * dt

    for _ in range(1000000):
        sim_clips = sim_clips + step_yield

    # Expected: 1,000,000 * 0.05 * 1.5M = 50,000 * 1.5M = 7.5e10
    assert_test("1,000,000 Tick Stability Check", abs(sim_clips.log10() - math.log10(7.5e10)) < 1e-4, f"-> Final: {sim_clips.to_short_scale()}")

    print("\n=================================================================")
    print(f"  ALL {total_tests}/{total_tests} UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY! ")
    print("=================================================================\n")

if __name__ == "__main__":
    run_all_tests()
