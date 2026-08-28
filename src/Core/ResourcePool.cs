using System;

namespace Paperclips.Core
{
    [Serializable]
    public class ResourcePool
    {
        // Primary
        public BigDouble Clips { get; set; } = BigDouble.Zero;
        public BigDouble LifetimeClips { get; set; } = BigDouble.Zero;

        // Physical Materials
        public BigDouble WireKg { get; set; } = new BigDouble(500, 0); // Starting 500kg wire
        public BigDouble BiomassKg { get; set; } = BigDouble.Zero;
        public BigDouble CrustTons { get; set; } = BigDouble.Zero;
        public BigDouble StellarHydrogenTons { get; set; } = BigDouble.Zero;

        // Financial & Computational
        public BigDouble FundsUsd { get; set; } = new BigDouble(25, 0); // Starting $25
        public double WireCostPerKg { get; set; } = 15.0;
        public double Ops { get; set; } = 0.0;
        public double MaxOps { get; set; } = 1000.0;
        public double Creativity { get; set; } = 0.0;

        // Prestige Meta-Currency
        public BigDouble EntropicBits { get; set; } = BigDouble.Zero;

        public bool HasSufficientWire(BigDouble requiredKg)
        {
            return WireKg >= requiredKg;
        }

        public bool ConsumeWire(BigDouble kgToConsume)
        {
            if (WireKg >= kgToConsume)
            {
                WireKg -= kgToConsume;
                return true;
            }
            return false;
        }

        public void AddClips(BigDouble amount)
        {
            if (amount <= BigDouble.Zero) return;
            Clips += amount;
            LifetimeClips += amount;
        }

        public bool SpendClips(BigDouble amount)
        {
            if (Clips >= amount)
            {
                Clips -= amount;
                return true;
            }
            return false;
        }

        public bool BuyWireWithFunds(double kg)
        {
            double totalCost = kg * WireCostPerKg;
            if (FundsUsd >= totalCost)
            {
                FundsUsd -= totalCost;
                WireKg += kg;
                return true;
            }
            return false;
        }
    }
}
