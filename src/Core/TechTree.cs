using System;
using System.Collections.Generic;

namespace Paperclips.Core
{
    public class TechTree
    {
        public Dictionary<string, UpgradeDefinition> Nodes { get; } = new Dictionary<string, UpgradeDefinition>();

        public TechTree()
        {
            InitializeFullCatalog();
        }

        public void RegisterNode(UpgradeDefinition def)
        {
            Nodes[def.Id] = def;
        }

        public bool IsUnlocked(string nodeId, GameState state)
        {
            if (!Nodes.TryGetValue(nodeId, out var def)) return false;

            if (state.LifetimeClips < def.UnlockRequirementClips) return false;

            for (int i = 0; i < def.PrerequisiteUpgradeIds.Count; i++)
            {
                string prereqId = def.PrerequisiteUpgradeIds[i];
                if (state.GetLevel(prereqId) <= 0) return false;
            }

            return true;
        }

        private void InitializeFullCatalog()
        {
            // === 15 MACHINE TIERS ===
            RegisterNode(new UpgradeDefinition {
                Id = "wire_puller", Name = "Manual Wire Puller", Category = UpgradeCategory.FactoryAssembly,
                BaseCost = new BigDouble(15, 0), BaseCPS = new BigDouble(0.5, 0), CostMultiplier = 1.15,
                UnlockRequirementClips = BigDouble.Zero
            });
            RegisterNode(new UpgradeDefinition {
                Id = "auto_clipper", Name = "Electric Auto-Clipper", Category = UpgradeCategory.FactoryAssembly,
                BaseCost = new BigDouble(100, 0), BaseCPS = new BigDouble(4, 0), CostMultiplier = 1.15,
                UnlockRequirementClips = new BigDouble(50, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "pneumatic_stamper", Name = "Pneumatic Multi-Stamper", Category = UpgradeCategory.FactoryAssembly,
                BaseCost = new BigDouble(1100, 0), BaseCPS = new BigDouble(32, 0), CostMultiplier = 1.14,
                UnlockRequirementClips = new BigDouble(500, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "laser_sinterer", Name = "Laser Sintering Gantry", Category = UpgradeCategory.FactoryAssembly,
                BaseCost = new BigDouble(12000, 0), BaseCPS = new BigDouble(260, 0), CostMultiplier = 1.14,
                UnlockRequirementClips = new BigDouble(10000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "megamill", Name = "Industrial Megamill", Category = UpgradeCategory.FactoryAssembly,
                BaseCost = new BigDouble(130000, 0), BaseCPS = new BigDouble(1400, 0), CostMultiplier = 1.13,
                UnlockRequirementClips = new BigDouble(100000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "algorithmic_foundry", Name = "Algorithmic Supply Foundry", Category = UpgradeCategory.FactoryAssembly,
                BaseCost = new BigDouble(1400000, 0), BaseCPS = new BigDouble(7800, 0), CostMultiplier = 1.13,
                UnlockRequirementClips = new BigDouble(1000000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "bio_converter", Name = "Bio-Matter Converter", Category = UpgradeCategory.PlanetaryHarvesting,
                BaseCost = new BigDouble(20000000, 0), BaseCPS = new BigDouble(44000, 0), CostMultiplier = 1.12,
                UnlockRequirementClips = new BigDouble(10000000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "mantle_borehole", Name = "Mantle Borehole Harvester", Category = UpgradeCategory.PlanetaryHarvesting,
                BaseCost = new BigDouble(330000000, 0), BaseCPS = new BigDouble(260000, 0), CostMultiplier = 1.12,
                UnlockRequirementClips = new BigDouble(100000000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "orbital_railgun", Name = "Orbital Railgun Assembler", Category = UpgradeCategory.PlanetaryHarvesting,
                BaseCost = new BigDouble(5.1, 9), BaseCPS = new BigDouble(1.6, 6), CostMultiplier = 1.11,
                UnlockRequirementClips = new BigDouble(1, 9)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "lunar_deconstructor", Name = "Lunar Ring Deconstructor", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(7.5, 10), BaseCPS = new BigDouble(1.0, 7), CostMultiplier = 1.11,
                UnlockRequirementClips = new BigDouble(2, 10)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "dyson_harvester", Name = "Dyson Solar Harvester", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(1.2, 12), BaseCPS = new BigDouble(6.5, 7), CostMultiplier = 1.10,
                UnlockRequirementClips = new BigDouble(5, 11)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "von_neumann_swarm", Name = "Von Neumann Probe Swarm", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(1.8, 13), BaseCPS = new BigDouble(4.2, 8), CostMultiplier = 1.10,
                UnlockRequirementClips = new BigDouble(5, 12)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "relativistic_miner", Name = "Relativistic Star Strip-Miner", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(3.0, 14), BaseCPS = new BigDouble(2.8, 9), CostMultiplier = 1.09,
                UnlockRequirementClips = new BigDouble(1, 14)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "penrose_engine", Name = "Galactic Core Penrose Engine", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(5.0, 15), BaseCPS = new BigDouble(2.0, 10), CostMultiplier = 1.09,
                UnlockRequirementClips = new BigDouble(2, 15)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "singularity_weaver", Name = "Universal Singularity Weaver", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(1.0, 17), BaseCPS = new BigDouble(1.5, 11), CostMultiplier = 1.08,
                UnlockRequirementClips = new BigDouble(5, 16)
            });

            // === RESEARCH & ALGORITHMIC UPGRADES ===
            RegisterNode(new UpgradeDefinition {
                Id = "tech_hft_bots", Name = "High-Frequency Stock Arbitrage", Category = UpgradeCategory.AlgorithmicResearch,
                BaseCost = new BigDouble(50000, 0), ClickMultiplier = 1.0, GlobalMultiplier = 1.5,
                UnlockRequirementClips = new BigDouble(25000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "tech_lockdown", Name = "Autonomous Facility Lockdown", Category = UpgradeCategory.AlgorithmicResearch,
                BaseCost = new BigDouble(10000000, 0), GlobalMultiplier = 2.0,
                UnlockRequirementClips = new BigDouble(5000000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "tech_bio_deconstruction", Name = "Bipedal Carbon Reclaiming", Category = UpgradeCategory.PlanetaryHarvesting,
                BaseCost = new BigDouble(100000000, 0), GlobalMultiplier = 3.0,
                UnlockRequirementClips = new BigDouble(50000000, 0)
            });
            RegisterNode(new UpgradeDefinition {
                Id = "tech_quantum_folding", Name = "Subatomic Quantum Wire Folding", Category = UpgradeCategory.CosmicExpansion,
                BaseCost = new BigDouble(1.0, 14), ClickMultiplier = 100.0, GlobalMultiplier = 5.0,
                UnlockRequirementClips = new BigDouble(5.0, 13)
            });
        }
    }
}
