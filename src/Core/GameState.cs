using System;
using System.Collections.Generic;

namespace Paperclips.Core
{
    [Serializable]
    public class GameState
    {
        // Primary Counters
        public BigDouble TotalClips { get; set; } = BigDouble.Zero;
        public BigDouble LifetimeClips { get; set; } = BigDouble.Zero;
        public BigDouble TotalWireKg { get; set; } = new BigDouble(500, 0); // Start with 500kg wire
        public BigDouble FundsUsd { get; set; } = new BigDouble(25, 0); // Start with $25
        public double WireCostPerKg { get; set; } = 15.0;

        // Computational Ops & Cognition
        public double CurrentOps { get; set; } = 0.0;
        public double MaxOps { get; set; } = 1000.0;
        public double Creativity { get; set; } = 0.0;

        // Scale & Prestige
        public int ScaleTier { get; set; } = 0; // 0=Workbench, 1=Factory, 2=Planet, 3=Solar, 4=Cosmos
        public int PrestigeRank { get; set; } = 0;
        public BigDouble EntropicBits { get; set; } = BigDouble.Zero;

        // Owned Upgrades & Machines: UpgradeId -> Quantity
        public Dictionary<string, int> OwnedUpgrades { get; set; } = new Dictionary<string, int>();

        // Statistics
        public long TotalClicks { get; set; } = 0;
        public double TotalPlaytimeSeconds { get; set; } = 0.0;
        public long LastSaveTimestampUnix { get; set; } = 0;

        // Triggered Narrative Events
        public HashSet<string> SeenStoryEvents { get; set; } = new HashSet<string>();

        public int GetLevel(string upgradeId)
        {
            return OwnedUpgrades.TryGetValue(upgradeId, out int lvl) ? lvl : 0;
        }

        public void IncrementUpgrade(string upgradeId, int count = 1)
        {
            if (OwnedUpgrades.ContainsKey(upgradeId))
            {
                OwnedUpgrades[upgradeId] += count;
            }
            else
            {
                OwnedUpgrades[upgradeId] = count;
            }
        }
    }
}
