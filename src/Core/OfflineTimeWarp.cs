using System;

namespace Paperclips.Core
{
    public struct OfflineResult
    {
        public double OfflineSecondsProcessed;
        public BigDouble ClipsGenerated;
        public BigDouble WireConsumedKg;
        public bool WireDepletedEarly;
        public double ActiveProductionSeconds;
    }

    /// <summary>
    /// Computes hours or months of offline idle progression in O(1) analytical time without simulation loops.
    /// Safely handles wire exhaustion thresholds and offline efficiency multipliers.
    /// </summary>
    public static class OfflineTimeWarp
    {
        public static OfflineResult Calculate(GameState state, BigDouble cps, double offlineSeconds, double offlineEfficiency = 0.50, double wirePerClipKg = 0.001)
        {
            var result = new OfflineResult
            {
                OfflineSecondsProcessed = offlineSeconds,
                ClipsGenerated = BigDouble.Zero,
                WireConsumedKg = BigDouble.Zero,
                WireDepletedEarly = false,
                ActiveProductionSeconds = 0.0
            };

            if (offlineSeconds <= 0.0 || cps <= BigDouble.Zero)
            {
                return result;
            }

            // Calculate wire burn rate per second
            BigDouble wireBurnRatePerSec = cps * wirePerClipKg;

            if (wireBurnRatePerSec <= BigDouble.Zero || state.TotalWireKg <= BigDouble.Zero)
            {
                // In cosmic era (wire free) or no wire available
                if (state.TotalWireKg <= BigDouble.Zero && state.ScaleTier < 3)
                {
                    result.WireDepletedEarly = true;
                    return result;
                }

                // Free production
                result.ActiveProductionSeconds = offlineSeconds;
                result.ClipsGenerated = cps * offlineSeconds * offlineEfficiency;
                return result;
            }

            // Calculate seconds until wire runs out
            double timeUntilDepleted = (state.TotalWireKg / wireBurnRatePerSec).ToDouble();

            if (offlineSeconds <= timeUntilDepleted)
            {
                // Wire lasted the entire offline duration
                result.ActiveProductionSeconds = offlineSeconds;
                result.ClipsGenerated = cps * offlineSeconds * offlineEfficiency;
                result.WireConsumedKg = wireBurnRatePerSec * offlineSeconds;
                result.WireDepletedEarly = false;
            }
            else
            {
                // Wire ran out mid-way through offline duration
                result.ActiveProductionSeconds = Math.Max(0.0, timeUntilDepleted);
                result.ClipsGenerated = cps * timeUntilDepleted * offlineEfficiency;
                result.WireConsumedKg = state.TotalWireKg; // Consumed all remaining wire
                result.WireDepletedEarly = true;
            }

            return result;
        }

        public static void ApplyOfflineResult(GameState state, OfflineResult result)
        {
            state.TotalClips += result.ClipsGenerated;
            state.LifetimeClips += result.ClipsGenerated;
            state.TotalWireKg = BigDouble.Max(BigDouble.Zero, state.TotalWireKg - result.WireConsumedKg);
            state.TotalPlaytimeSeconds += result.OfflineSecondsProcessed;
        }
    }
}
