#pragma once
#include <iostream>
#include <cmath>
#include <string>
#include <sstream>
#include <iomanip>
#include <vector>

namespace OmniEngine {

/// <summary>
/// High-performance C++ BigDouble struct (Mantissa * 10^Exponent).
/// Solves 64-bit IEEE 754 double precision limits at 1.79e308.
/// Supports calculations up to 10^(INT64_MAX).
/// </summary>
struct BigDouble {
    double mantissa;
    int64_t exponent;

    BigDouble() : mantissa(0.0), exponent(0) {}
    BigDouble(double m, int64_t e = 0) : mantissa(m), exponent(e) { normalize(); }

    void normalize() {
        if (mantissa == 0.0 || std::isnan(mantissa) || std::isinf(mantissa)) {
            mantissa = 0.0;
            exponent = 0;
            return;
        }

        double absM = std::abs(mantissa);
        if (absM >= 10.0 || absM < 1.0) {
            int64_t shift = static_cast<int64_t>(std::floor(std::log10(absM)));
            mantissa /= std::pow(10.0, shift);
            exponent += shift;
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
        if (other.mantissa == 0.0) return zero();
        if (mantissa == 0.0) return zero();
        return BigDouble(mantissa / other.mantissa, exponent - other.exponent);
    }

    BigDouble operator/(double scalar) const {
        if (scalar == 0.0) return zero();
        return BigDouble(mantissa / scalar, exponent);
    }

    bool operator<(const BigDouble& other) const {
        if (mantissa == 0.0 && other.mantissa == 0.0) return false;
        if (mantissa <= 0.0 && other.mantissa > 0.0) return true;
        if (mantissa > 0.0 && other.mantissa <= 0.0) return false;
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

    double log10() const {
        if (mantissa <= 0.0) return -std::numeric_limits<double>::infinity();
        return std::log10(mantissa) + static_cast<double>(exponent);
    }

    BigDouble pow(double power) const {
        if (mantissa == 0.0) return zero();
        if (power == 0.0) return one();
        if (power == 1.0) return *this;

        double l10 = log10() * power;
        int64_t newExp = static_cast<int64_t>(std::floor(l10));
        double newM = std::pow(10.0, l10 - static_cast<double>(newExp));
        return BigDouble(newM, newExp);
    }

    double toDouble() const {
        if (exponent > 308) return std::numeric_limits<double>::infinity();
        if (exponent < -308) return 0.0;
        return mantissa * std::pow(10.0, exponent);
    }

    std::string toShortScale(int decimals = 2) const {
        if (mantissa == 0.0) return "0";

        static const std::vector<std::string> prefixes = {
            "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion",
            "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"
        };

        if (exponent < 3) {
            std::ostringstream ss;
            ss << std::fixed << std::setprecision(decimals == 0 ? 0 : decimals) << toDouble();
            return ss.str();
        }

        size_t idx = static_cast<size_t>(exponent / 3);
        if (idx < prefixes.size()) {
            double scaled = mantissa * std::pow(10.0, exponent % 3);
            std::ostringstream ss;
            ss << std::fixed << std::setprecision(decimals) << scaled << " " << prefixes[idx];
            return ss.str();
        }

        std::ostringstream ss;
        ss << std::fixed << std::setprecision(decimals) << mantissa << "e" << exponent;
        return ss.str();
    }
};

} // namespace OmniEngine
