using System;

namespace Paperclips.Core
{
    /// <summary>
    /// Rolling telemetry ring buffer providing smooth statistical moving averages for PPM (Paperclips Per Minute),
    /// matter conversion percentage, and thermal resonance metrics.
    /// </summary>
    public class TelemetryHub
    {
        private readonly double[] _samples60s = new double[60];
        private int _sampleIndex = 0;
        private double _accumulatedSecondClips = 0.0;
        private double _secondTimer = 0.0;

        public double CurrentPPM { get; private set; } = 0.0;
        public double GlobalMatterConversionPercent { get; private set; } = 0.0;
        public double ThermalResonance { get; private set; } = 1.0;

        // Total Earth mass in kg: ~5.972e24 kg
        private static readonly BigDouble EarthMassKg = new BigDouble(5.972, 24);

        public void RecordClips(double amount)
        {
            _accumulatedSecondClips += amount;
        }

        public void Tick(double deltaTimeSeconds, GameState state)
        {
            _secondTimer += deltaTimeSeconds;
            if (_secondTimer >= 1.0)
            {
                _secondTimer -= 1.0;
                _samples60s[_sampleIndex] = _accumulatedSecondClips;
                _sampleIndex = (_sampleIndex + 1) % _samples60s.Length;
                _accumulatedSecondClips = 0.0;

                // Compute 60-second rolling average
                double sum = 0.0;
                for (int i = 0; i < _samples60s.Length; i++)
                {
                    sum += _samples60s[i];
                }
                CurrentPPM = sum; // Sum of 60 seconds is the PPM
            }

            // Calculate matter conversion percentage
            if (state.ScaleTier >= 2)
            {
                BigDouble clipsInKg = state.LifetimeClips * 0.001; // 1g per clip = 0.001kg
                if (clipsInKg < EarthMassKg)
                {
                    GlobalMatterConversionPercent = (clipsInKg / EarthMassKg).ToDouble() * 100.0;
                }
                else
                {
                    GlobalMatterConversionPercent = 100.0;
                }
            }
            else
            {
                GlobalMatterConversionPercent = (state.LifetimeClips.ToDouble() / 1e8) * 0.01;
            }
        }
    }
}
