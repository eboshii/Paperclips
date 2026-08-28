/**
 * BigDouble.js - Scientific Notation Large-Number Math Engine
 * Supports values from 0 up to 10^10000+ with full precision and short-scale formatting.
 */
class BigDouble {
    constructor(mantissa = 0, exponent = 0) {
        if (mantissa instanceof BigDouble) {
            this.mantissa = mantissa.mantissa;
            this.exponent = mantissa.exponent;
            return;
        }

        if (typeof mantissa === 'string') {
            this.parseFromString(mantissa);
            return;
        }

        this.mantissa = Number(mantissa) || 0;
        this.exponent = Math.floor(Number(exponent)) || 0;
        this.normalize();
    }

    static zero() {
        return new BigDouble(0, 0);
    }

    static one() {
        return new BigDouble(1, 0);
    }

    static fromNumber(val) {
        if (val === 0) return BigDouble.zero();
        let exp = Math.floor(Math.log10(Math.abs(val)));
        let man = val / Math.pow(10, exp);
        return new BigDouble(man, exp);
    }

    normalize() {
        if (this.mantissa === 0 || !isFinite(this.mantissa)) {
            this.mantissa = 0;
            this.exponent = 0;
            return this;
        }

        let absM = Math.abs(this.mantissa);
        if (absM < 1.0) {
            while (absM < 1.0 && absM > 0) {
                this.mantissa *= 10;
                this.exponent -= 1;
                absM = Math.abs(this.mantissa);
            }
        } else if (absM >= 10.0) {
            while (absM >= 10.0) {
                this.mantissa /= 10;
                this.exponent += 1;
                absM = Math.abs(this.mantissa);
            }
        }
        return this;
    }

    parseFromString(str) {
        str = str.trim();
        if (!str || str === '0') {
            this.mantissa = 0;
            this.exponent = 0;
            return;
        }
        if (str.toLowerCase().includes('e')) {
            const parts = str.toLowerCase().split('e');
            this.mantissa = parseFloat(parts[0]);
            this.exponent = parseInt(parts[1], 10);
            this.normalize();
        } else {
            const num = parseFloat(str);
            if (num === 0) {
                this.mantissa = 0;
                this.exponent = 0;
            } else {
                let exp = Math.floor(Math.log10(Math.abs(num)));
                this.mantissa = num / Math.pow(10, exp);
                this.exponent = exp;
                this.normalize();
            }
        }
    }

    toDouble() {
        if (this.exponent > 308) return Infinity;
        if (this.exponent < -308) return 0;
        return this.mantissa * Math.pow(10, this.exponent);
    }

    add(other) {
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        if (this.mantissa === 0) return new BigDouble(other.mantissa, other.exponent);
        if (other.mantissa === 0) return new BigDouble(this.mantissa, this.exponent);

        let diff = this.exponent - other.exponent;
        if (diff > 16) return new BigDouble(this.mantissa, this.exponent);
        if (diff < -16) return new BigDouble(other.mantissa, other.exponent);

        if (diff >= 0) {
            let m = this.mantissa + other.mantissa * Math.pow(10, -diff);
            return new BigDouble(m, this.exponent);
        } else {
            let m = this.mantissa * Math.pow(10, diff) + other.mantissa;
            return new BigDouble(m, other.exponent);
        }
    }

    sub(other) {
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        if (other.mantissa === 0) return new BigDouble(this.mantissa, this.exponent);
        if (this.mantissa === 0) return new BigDouble(-other.mantissa, other.exponent);

        let diff = this.exponent - other.exponent;
        if (diff > 16) return new BigDouble(this.mantissa, this.exponent);
        if (diff < -16) return new BigDouble(-other.mantissa, other.exponent);

        if (diff >= 0) {
            let m = this.mantissa - other.mantissa * Math.pow(10, -diff);
            return new BigDouble(m, this.exponent);
        } else {
            let m = this.mantissa * Math.pow(10, diff) - other.mantissa;
            return new BigDouble(m, other.exponent);
        }
    }

    mul(other) {
        if (typeof other === 'number') {
            return new BigDouble(this.mantissa * other, this.exponent);
        }
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        return new BigDouble(this.mantissa * other.mantissa, this.exponent + other.exponent);
    }

    div(other) {
        if (typeof other === 'number') {
            if (other === 0) return BigDouble.zero();
            return new BigDouble(this.mantissa / other, this.exponent);
        }
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        if (other.mantissa === 0) return BigDouble.zero();
        return new BigDouble(this.mantissa / other.mantissa, this.exponent - other.exponent);
    }

    pow(exponentNumber) {
        if (exponentNumber === 0) return BigDouble.one();
        if (this.mantissa === 0) return BigDouble.zero();

        let log10Val = Math.log10(this.mantissa) + this.exponent;
        let totalLog = log10Val * exponentNumber;
        let newExp = Math.floor(totalLog);
        let newMantissa = Math.pow(10, totalLog - newExp);
        return new BigDouble(newMantissa, newExp);
    }

    lt(other) {
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        if (this.mantissa === 0 && other.mantissa === 0) return false;
        if (this.mantissa < 0 && other.mantissa > 0) return true;
        if (this.mantissa > 0 && other.mantissa < 0) return false;

        if (this.exponent !== other.exponent) {
            return this.mantissa > 0 ? this.exponent < other.exponent : this.exponent > other.exponent;
        }
        return this.mantissa < other.mantissa;
    }

    lte(other) {
        return this.lt(other) || this.eq(other);
    }

    gt(other) {
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        return !this.lte(other);
    }

    gte(other) {
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        return !this.lt(other);
    }

    eq(other) {
        other = (other instanceof BigDouble) ? other : BigDouble.fromNumber(other);
        if (this.mantissa === 0 && other.mantissa === 0) return true;
        return this.exponent === other.exponent && Math.abs(this.mantissa - other.mantissa) < 1e-10;
    }

    toShortScale(decimals = 2) {
        if (this.mantissa === 0) return "0";
        if (this.exponent < 3) {
            let val = this.toDouble();
            return (decimals === 0 || Math.floor(val) === val) ? Math.floor(val).toString() : val.toFixed(decimals);
        }
        if (this.exponent < 6) {
            let val = Math.floor(this.toDouble());
            return val.toLocaleString();
        }

        const suffixes = [
            "", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion",
            "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion",
            "Undecillion", "Duodecillion", "Tredecillion", "Quattuordecillion",
            "Quindecillion", "Sexdecillion", "Septendecillion", "Octodecillion",
            "Novemdecillion", "Vigintillion"
        ];

        let tier = Math.floor(this.exponent / 3) - 1;
        if (tier >= 0 && tier < suffixes.length && suffixes[tier] !== "") {
            let mod = this.exponent % 3;
            let displayVal = this.mantissa * Math.pow(10, mod);
            return displayVal.toFixed(decimals) + " " + suffixes[tier];
        }

        // Scientific Notation for astronomical scales (10^66+)
        return this.mantissa.toFixed(2) + "e" + this.exponent;
    }

    toScientific(decimals = 2) {
        if (this.mantissa === 0) return "0";
        return this.mantissa.toFixed(decimals) + "e" + this.exponent;
    }

    formatCurrency(decimals = 2) {
        if (this.mantissa === 0) return "$0.00";
        if (this.exponent < 3) {
            return "$" + this.toDouble().toFixed(decimals);
        }
        if (this.exponent < 6) {
            return "$" + Math.floor(this.toDouble()).toLocaleString();
        }
        return "$" + this.toShortScale(decimals);
    }
}

if (typeof window !== 'undefined') {
    window.BigDouble = BigDouble;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigDouble;
}
