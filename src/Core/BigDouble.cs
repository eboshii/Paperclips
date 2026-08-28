using System;
using System.Globalization;

namespace Paperclips.Core
{
    /// <summary>
    /// Arbitrary high-precision scientific-notation arithmetic struct (Mantissa * 10^Exponent).
    /// Supports values from 0 up to 10^(long.MaxValue), solving 64-bit double IEEE 754 overflow at 1.79e308.
    /// </summary>
    [Serializable]
    public struct BigDouble : IComparable<BigDouble>, IEquatable<BigDouble>
    {
        public double Mantissa;
        public long Exponent;

        public static readonly BigDouble Zero = new BigDouble(0, 0);
        public static readonly BigDouble One = new BigDouble(1, 0);
        public static readonly BigDouble Ten = new BigDouble(1, 1);

        public BigDouble(double mantissa, long exponent = 0)
        {
            Mantissa = mantissa;
            Exponent = exponent;
            Normalize();
        }

        public static BigDouble FromDouble(double value)
        {
            return new BigDouble(value, 0);
        }

        public static BigDouble FromLong(long value)
        {
            return new BigDouble(value, 0);
        }

        public void Normalize()
        {
            if (Mantissa == 0.0 || double.IsNaN(Mantissa) || double.IsInfinity(Mantissa))
            {
                Mantissa = 0.0;
                Exponent = 0;
                return;
            }

            double absMantissa = Math.Abs(Mantissa);

            if (absMantissa >= 10.0)
            {
                int expShift = (int)Math.Floor(Math.Log10(absMantissa));
                Mantissa /= Math.Pow(10, expShift);
                Exponent += expShift;
            }
            else if (absMantissa < 1.0)
            {
                int expShift = (int)Math.Floor(Math.Log10(absMantissa));
                Mantissa /= Math.Pow(10, expShift);
                Exponent += expShift;
            }
        }

        #region Arithmetic Operators

        public static BigDouble operator +(BigDouble a, BigDouble b)
        {
            if (a.Mantissa == 0) return b;
            if (b.Mantissa == 0) return a;

            long diff = a.Exponent - b.Exponent;
            if (diff >= 16) return a;
            if (diff <= -16) return b;

            if (diff >= 0)
            {
                return new BigDouble(a.Mantissa + b.Mantissa * Math.Pow(10, -diff), a.Exponent);
            }
            else
            {
                return new BigDouble(a.Mantissa * Math.Pow(10, diff) + b.Mantissa, b.Exponent);
            }
        }

        public static BigDouble operator +(BigDouble a, double b) => a + FromDouble(b);
        public static BigDouble operator +(double a, BigDouble b) => FromDouble(a) + b;

        public static BigDouble operator -(BigDouble a, BigDouble b)
        {
            return a + (-b);
        }

        public static BigDouble operator -(BigDouble a, double b) => a - FromDouble(b);
        public static BigDouble operator -(double a, BigDouble b) => FromDouble(a) - b;

        public static BigDouble operator -(BigDouble a)
        {
            return new BigDouble(-a.Mantissa, a.Exponent);
        }

        public static BigDouble operator *(BigDouble a, BigDouble b)
        {
            if (a.Mantissa == 0 || b.Mantissa == 0) return Zero;
            return new BigDouble(a.Mantissa * b.Mantissa, a.Exponent + b.Exponent);
        }

        public static BigDouble operator *(BigDouble a, double scalar)
        {
            if (a.Mantissa == 0 || scalar == 0) return Zero;
            return new BigDouble(a.Mantissa * scalar, a.Exponent);
        }

        public static BigDouble operator *(double scalar, BigDouble a) => a * scalar;

        public static BigDouble operator /(BigDouble a, BigDouble b)
        {
            if (b.Mantissa == 0) throw new DivideByZeroException("Attempted to divide BigDouble by Zero.");
            if (a.Mantissa == 0) return Zero;
            return new BigDouble(a.Mantissa / b.Mantissa, a.Exponent - b.Exponent);
        }

        public static BigDouble operator /(BigDouble a, double scalar)
        {
            if (scalar == 0) throw new DivideByZeroException("Attempted to divide BigDouble by Zero scalar.");
            if (a.Mantissa == 0) return Zero;
            return new BigDouble(a.Mantissa / scalar, a.Exponent);
        }

        public static BigDouble operator /(double scalar, BigDouble b) => FromDouble(scalar) / b;

        #endregion

        #region Mathematical Functions

        public static BigDouble Abs(BigDouble val)
        {
            return new BigDouble(Math.Abs(val.Mantissa), val.Exponent);
        }

        public static BigDouble Min(BigDouble a, BigDouble b) => a < b ? a : b;
        public static BigDouble Max(BigDouble a, BigDouble b) => a > b ? a : b;

        public static double Log10(BigDouble val)
        {
            if (val.Mantissa <= 0) throw new ArgumentOutOfRangeException(nameof(val), "Log10 undefined for non-positive BigDouble.");
            return Math.Log10(val.Mantissa) + val.Exponent;
        }

        public static BigDouble Pow(BigDouble baseVal, double power)
        {
            if (baseVal.Mantissa == 0) return Zero;
            if (power == 0) return One;
            if (power == 1) return baseVal;

            double log10 = Math.Log10(baseVal.Mantissa) + baseVal.Exponent;
            double newLog = log10 * power;
            long newExp = (long)Math.Floor(newLog);
            double newMantissa = Math.Pow(10, newLog - newExp);
            return new BigDouble(newMantissa, newExp);
        }

        public static BigDouble Sqrt(BigDouble val)
        {
            return Pow(val, 0.5);
        }

        public static BigDouble Floor(BigDouble val)
        {
            if (val.Exponent < 0) return Zero;
            if (val.Exponent >= 16) return val; // Already integral at this magnitude
            double raw = Math.Floor(val.Mantissa * Math.Pow(10, val.Exponent));
            return FromDouble(raw);
        }

        public double ToDouble()
        {
            if (Exponent > 308) return double.PositiveInfinity;
            if (Exponent < -308) return 0.0;
            return Mantissa * Math.Pow(10, Exponent);
        }

        #endregion

        #region Comparisons & Equality

        public static bool operator >(BigDouble a, BigDouble b) => a.CompareTo(b) > 0;
        public static bool operator <(BigDouble a, BigDouble b) => a.CompareTo(b) < 0;
        public static bool operator >=(BigDouble a, BigDouble b) => a.CompareTo(b) >= 0;
        public static bool operator <=(BigDouble a, BigDouble b) => a.CompareTo(b) <= 0;
        public static bool operator ==(BigDouble a, BigDouble b) => a.Equals(b);
        public static bool operator !=(BigDouble a, BigDouble b) => !a.Equals(b);

        public int CompareTo(BigDouble other)
        {
            if (Mantissa == 0 && other.Mantissa == 0) return 0;
            if (Mantissa > 0 && other.Mantissa <= 0) return 1;
            if (Mantissa <= 0 && other.Mantissa > 0) return -1;

            if (Exponent > other.Exponent) return Mantissa > 0 ? 1 : -1;
            if (Exponent < other.Exponent) return Mantissa > 0 ? -1 : 1;

            return Mantissa.CompareTo(other.Mantissa);
        }

        public bool Equals(BigDouble other)
        {
            if (Mantissa == 0 && other.Mantissa == 0) return true;
            return Math.Abs(Mantissa - other.Mantissa) < 1e-12 && Exponent == other.Exponent;
        }

        public override bool Equals(object obj)
        {
            return obj is BigDouble other && Equals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Mantissa, Exponent);
        }

        public override string ToString()
        {
            return NumberFormatter.Format(this, NumberFormatMode.ShortScale);
        }

        #endregion
    }
}
