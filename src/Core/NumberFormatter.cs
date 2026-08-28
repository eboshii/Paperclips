using System;
using System.Globalization;

namespace Paperclips.Core
{
    public enum NumberFormatMode
    {
        ShortScale,   // 1.23 Million, 4.56 Billion, 7.89 Trillion
        Scientific,   // 1.23e6, 4.56e9, 7.89e12
        Engineering,  // 1.23e6, 45.60e6, 789.00e6
        Compact       // 1.23M, 4.56B, 7.89T
    }

    public static class NumberFormatter
    {
        private static readonly string[] ShortScalePrefixes = new string[]
        {
            "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion",
            "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion", "Undecillion",
            "Duodecillion", "Tredecillion", "Quattuordecillion", "Quindecillion", "Sexdecillion",
            "Septendecillion", "Octodecillion", "Novemdecillion", "Vigintillion", "Unvigintillion",
            "Duovigintillion", "Tresvigintillion", "Quattuorvigintillion", "Quinvigintillion",
            "Sesvigintillion", "Septemvigintillion", "Octovigintillion", "Novemvigintillion",
            "Trigintillion", "Centillion"
        };

        private static readonly string[] CompactPrefixes = new string[]
        {
            "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg"
        };

        public static string Format(BigDouble val, NumberFormatMode mode = NumberFormatMode.ShortScale, int decimals = 2)
        {
            if (val.Mantissa == 0.0) return "0";

            if (val.Exponent < 3 && val.Exponent >= 0)
            {
                double raw = val.Mantissa * Math.Pow(10, val.Exponent);
                return raw.ToString(decimals == 0 ? "N0" : $"N{decimals}", CultureInfo.InvariantCulture);
            }

            if (val.Exponent < 0)
            {
                double raw = val.Mantissa * Math.Pow(10, val.Exponent);
                return raw.ToString("G4", CultureInfo.InvariantCulture);
            }

            switch (mode)
            {
                case NumberFormatMode.ShortScale:
                    long prefixIndex = val.Exponent / 3;
                    if (prefixIndex < ShortScalePrefixes.Length)
                    {
                        double scaledMantissa = val.Mantissa * Math.Pow(10, val.Exponent % 3);
                        string prefix = ShortScalePrefixes[prefixIndex];
                        return string.IsNullOrEmpty(prefix)
                            ? scaledMantissa.ToString($"N{decimals}", CultureInfo.InvariantCulture)
                            : $"{scaledMantissa.ToString($"F{decimals}", CultureInfo.InvariantCulture)} {prefix}";
                    }
                    // Fallback to scientific beyond Centillion
                    return FormatScientific(val, decimals);

                case NumberFormatMode.Compact:
                    long compactIndex = val.Exponent / 3;
                    if (compactIndex < CompactPrefixes.Length)
                    {
                        double scaledMantissa = val.Mantissa * Math.Pow(10, val.Exponent % 3);
                        return $"{scaledMantissa.ToString($"F{decimals}", CultureInfo.InvariantCulture)}{CompactPrefixes[compactIndex]}";
                    }
                    return FormatScientific(val, decimals);

                case NumberFormatMode.Engineering:
                    long engExp = (val.Exponent / 3) * 3;
                    double engMantissa = val.Mantissa * Math.Pow(10, val.Exponent % 3);
                    return $"{engMantissa.ToString($"F{decimals}", CultureInfo.InvariantCulture)}e{engExp}";

                case NumberFormatMode.Scientific:
                default:
                    return FormatScientific(val, decimals);
            }
        }

        private static string FormatScientific(BigDouble val, int decimals)
        {
            return $"{val.Mantissa.ToString($"F{decimals}", CultureInfo.InvariantCulture)}e{val.Exponent}";
        }
    }
}
