#pragma once
#include <iostream>
#include <string>
#include <cmath>
#include <algorithm>
#include <iomanip>
#include <cstdint>
#include <vector>
#include <limits>

namespace OmniEngine {

/// <summary>
/// BigDouble: Arbitrary large floating point number support for Idle/Clicker math.
/// Stored as mantissa * 10^exponent. Supports numbers up to 10^(INT64_MAX).
/// </summary>
struct BigDouble {
    double mantissa;
    int64_t exponent;

    BigDouble() : mantissa(0.0), exponent(0) {}
    BigDouble(double m, int64_t e = 0) : mantissa(m), exponent(e) { normalize(); }

    void normalize() {
        if (mantissa == 0.0) {
            exponent = 0;
            return;
        }
        double absM = std::abs(mantissa);
        if (absM < 1.0 || absM >= 10.0) {
            int64_t shift = static_cast<int64_t>(std::floor(std::log10(absM)));
            mantissa /= std::pow(10.0, shift);
            exponent += shift;
        }
        if (mantissa == 0.0) {
            exponent = 0;
        }
    }

    static BigDouble zero() { return BigDouble(0.0, 0); }
    static BigDouble one() { return BigDouble(1.0, 0); }

    BigDouble operator+(const BigDouble& other) const {
        if (mantissa == 0.0) return other;
        if (other.mantissa == 0.0) return *this;

        int64_t diff = exponent - other.exponent;
        if (diff >= 16) return *this;
        if (diff <= -16) return other;

        if (diff >= 0) {
            return BigDouble(mantissa + other.mantissa * std::pow(10.0, -diff), exponent);
        } else {
            return BigDouble(mantissa * std::pow(10.0, diff) + other.mantissa, other.exponent);
        }
    }

    BigDouble operator-(const BigDouble& other) const {
        return *this + BigDouble(-other.mantissa, other.exponent);
    }

    BigDouble operator*(const BigDouble& other) const {
        if (mantissa == 0.0 || other.mantissa == 0.0) return zero();
        return BigDouble(mantissa * other.mantissa, exponent + other.exponent);
    }

    BigDouble operator*(double scalar) const {
        if (mantissa == 0.0 || scalar == 0.0) return zero();
        return BigDouble(mantissa * scalar, exponent);
    }

    BigDouble operator/(const BigDouble& other) const {
        if (other.mantissa == 0.0) throw std::runtime_error("Division by zero in BigDouble");
        if (mantissa == 0.0) return zero();
        return BigDouble(mantissa / other.mantissa, exponent - other.exponent);
    }

    BigDouble operator/(double scalar) const {
        if (scalar == 0.0) throw std::runtime_error("Division by zero in BigDouble");
        return BigDouble(mantissa / scalar, exponent);
    }

    bool operator<(const BigDouble& other) const {
        if (mantissa == 0.0 && other.mantissa == 0.0) return false;
        if (mantissa <= 0.0 && other.mantissa > 0.0) return true;
        if (mantissa >= 0.0 && other.mantissa < 0.0) return false;

        if (exponent != other.exponent) {
            return (mantissa > 0.0) ? (exponent < other.exponent) : (exponent > other.exponent);
        }
        return mantissa < other.mantissa;
    }

    bool operator>(const BigDouble& other) const { return other < *this; }
    bool operator<=(const BigDouble& other) const { return !(other < *this); }
    bool operator>=(const BigDouble& other) const { return !(*this < other); }
    bool operator==(const BigDouble& other) const {
        return exponent == other.exponent && std::abs(mantissa - other.mantissa) < 1e-12;
    }
    bool operator!=(const BigDouble& other) const { return !(*this == other); }

    // Math functions
    double log10() const {
        if (mantissa <= 0.0) return -std::numeric_limits<double>::infinity();
        return std::log10(mantissa) + static_cast<double>(exponent);
    }

    BigDouble pow(double p) const {
        if (mantissa == 0.0) return zero();
        if (p == 0.0) return one();
        double l10 = log10() * p;
        int64_t newExp = static_cast<int64_t>(std::floor(l10));
        double newM = std::pow(10.0, l10 - static_cast<double>(newExp));
        return BigDouble(newM, newExp);
    }

    double toDouble() const {
        if (mantissa == 0.0) return 0.0;
        if (exponent > 308) return std::numeric_limits<double>::infinity();
        if (exponent < -308) return 0.0;
        return mantissa * std::pow(10.0, exponent);
    }

    // Formatting
    std::string toShortScale(int precision = 2) const {
        if (mantissa == 0.0) return "0";

        static const std::vector<std::string> suffixes = {
            "", " Thousand", " Million", " Billion", " Trillion", " Quadrillion",
            " Quintillion", " Sextillion", " Septillion", " Octillion", " Nonillion",
            " Decillion", " Undecillion", " Duodecillion", " Tredecillion"
        };

        if (exponent < 3) {
            std::ostringstream ss;
            ss << std::fixed << std::setprecision(precision) << toDouble();
            return ss.str();
        }

        size_t idx = static_cast<size_t>(exponent / 3);
        if (idx < suffixes.size()) {
            double scaled = mantissa * std::pow(10.0, exponent % 3);
            std::ostringstream ss;
            ss << std::fixed << std::setprecision(precision) << scaled << suffixes[idx];
            return ss.str();
        }

        // Fallback to Scientific Notation for astronomical numbers
        std::ostringstream ss;
        ss << std::fixed << std::setprecision(precision) << mantissa << "e" << exponent;
        return ss.str();
    }
};

} // namespace OmniEngine
