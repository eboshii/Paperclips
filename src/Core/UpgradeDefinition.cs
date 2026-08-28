using System;
using System.Collections.Generic;

namespace Paperclips.Core
{
    public enum UpgradeCategory
    {
        FactoryAssembly,
        AlgorithmicResearch,
        PlanetaryHarvesting,
        CosmicExpansion,
        QuantumEpochPrestige
    }

    [Serializable]
    public class UpgradeDefinition
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public UpgradeCategory Category { get; set; }
        public BigDouble BaseCost { get; set; }
        public double CostMultiplier { get; set; } = 1.15;
        public BigDouble BaseCPS { get; set; } = BigDouble.Zero;
        public double ClickMultiplier { get; set; } = 1.0;
        public double GlobalMultiplier { get; set; } = 1.0;
        public BigDouble UnlockRequirementClips { get; set; }
        public List<string> PrerequisiteUpgradeIds { get; set; } = new List<string>();

        public BigDouble GetCostForLevel(int currentLevel)
        {
            if (currentLevel == 0) return BaseCost;
            return BaseCost * Math.Pow(CostMultiplier, currentLevel);
        }
    }
}
