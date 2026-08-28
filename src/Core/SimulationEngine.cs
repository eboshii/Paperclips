using System;
using System.Collections.Generic;

namespace Paperclips.Core
{
    /// <summary>
    /// Master simulation engine running a deterministic 20Hz fixed-tick loop.
    /// Fully decoupled from rendering engines (Unity/Godot).
    /// </summary>
    public class SimulationEngine
    {
        public GameState State { get; private set; }
        public TechTree Tech { get; private set; }
        public ModifierEngine Modifiers { get; private set; }
        public DialogueDirector Dialogue { get; private set; }
        public TelemetryHub Telemetry { get; private set; }

        public event Action<BigDouble> OnClipsGenerated;
        public event Action<string> OnDialogueEmitted;
        public event Action<int> OnScaleTierChanged;

        public const double FixedDeltaTime = 0.05; // 20Hz tick rate
        private double _tickAccumulator = 0.0;

        public SimulationEngine(GameState initialState = null)
        {
            State = initialState ?? new GameState();
            Tech = new TechTree();
            Modifiers = new ModifierEngine();
            Dialogue = new DialogueDirector();
            Telemetry = new TelemetryHub();

            Dialogue.OnStoryMessage += msg => OnDialogueEmitted?.Invoke(msg);
            RebuildModifiers();
        }

        public void RebuildModifiers()
        {
            Modifiers.Clear();

            // Check owned research techs and apply their modifiers
            foreach (var kvp in State.OwnedUpgrades)
            {
                if (kvp.Value > 0 && Tech.Nodes.TryGetValue(kvp.Key, out var def))
                {
                    if (def.ClickMultiplier > 1.0)
                    {
                        Modifiers.AddModifier(new Modifier
                        {
                            TargetTag = "#ClickPower",
                            Type = ModifierType.CompoundMultiplier,
                            Value = def.ClickMultiplier - 1.0,
                            SourceUpgradeId = def.Id
                        });
                    }

                    if (def.GlobalMultiplier > 1.0)
                    {
                        Modifiers.AddModifier(new Modifier
                        {
                            TargetTag = "#GlobalCPS",
                            Type = ModifierType.CompoundMultiplier,
                            Value = def.GlobalMultiplier - 1.0,
                            SourceUpgradeId = def.Id
                        });
                    }
                }
            }

            // Prestige bonuses
            if (State.PrestigeRank > 0)
            {
                Modifiers.AddModifier(new Modifier
                {
                    TargetTag = "#ClickPower",
                    Type = ModifierType.AdditiveMultiplier,
                    Value = State.PrestigeRank * 0.10,
                    SourceUpgradeId = "prestige"
                });

                Modifiers.AddModifier(new Modifier
                {
                    TargetTag = "#GlobalCPS",
                    Type = ModifierType.AdditiveMultiplier,
                    Value = State.PrestigeRank * 0.05,
                    SourceUpgradeId = "prestige"
                });
            }
        }

        public BigDouble CalculateClickPower()
        {
            BigDouble baseClick = BigDouble.One;
            return Modifiers.Evaluate("#ClickPower", baseClick);
        }

        public BigDouble CalculateCurrentCPS()
        {
            BigDouble rawCPS = BigDouble.Zero;

            foreach (var kvp in State.OwnedUpgrades)
            {
                if (Tech.Nodes.TryGetValue(kvp.Key, out var def))
                {
                    if (def.BaseCPS > BigDouble.Zero)
                    {
                        BigDouble machineYield = def.BaseCPS * kvp.Value;
                        rawCPS += machineYield;
                    }
                }
            }

            return Modifiers.Evaluate("#GlobalCPS", rawCPS);
        }

        public void PerformClick()
        {
            BigDouble power = CalculateClickPower();
            State.TotalClips += power;
            State.LifetimeClips += power;
            State.TotalClicks++;

            Telemetry.RecordClips(power.ToDouble());
            OnClipsGenerated?.Invoke(power);

            CheckMilestones();
        }

        public bool TryPurchaseUpgrade(string upgradeId, int count = 1)
        {
            if (!Tech.Nodes.TryGetValue(upgradeId, out var def)) return false;

            int currentLevel = State.GetLevel(upgradeId);
            BigDouble cost = BulkPurchaseCalculator.CalculateCostForN(def.BaseCost, def.CostMultiplier, currentLevel, count);

            if (State.TotalClips >= cost)
            {
                State.TotalClips -= cost;
                State.IncrementUpgrade(upgradeId, count);
                RebuildModifiers();
                CheckMilestones();
                return true;
            }

            return false;
        }

        public int TryBuyMaxUpgrade(string upgradeId, out BigDouble costPaid)
        {
            costPaid = BigDouble.Zero;
            if (!Tech.Nodes.TryGetValue(upgradeId, out var def)) return 0;

            int currentLevel = State.GetLevel(upgradeId);
            int maxAffordable = BulkPurchaseCalculator.CalculateMaxAffordable(def.BaseCost, def.CostMultiplier, currentLevel, State.TotalClips, out costPaid);

            if (maxAffordable > 0 && State.TotalClips >= costPaid)
            {
                State.TotalClips -= costPaid;
                State.IncrementUpgrade(upgradeId, maxAffordable);
                RebuildModifiers();
                CheckMilestones();
                return maxAffordable;
            }

            return 0;
        }

        public void UpdateFrame(double deltaTimeSeconds)
        {
            _tickAccumulator += deltaTimeSeconds;

            // Run fixed-step simulation ticks
            while (_tickAccumulator >= FixedDeltaTime)
            {
                ExecuteFixedTick(FixedDeltaTime);
                _tickAccumulator -= FixedDeltaTime;
            }

            Telemetry.Tick(deltaTimeSeconds, State);
        }

        private void ExecuteFixedTick(double dt)
        {
            State.TotalPlaytimeSeconds += dt;

            BigDouble cps = CalculateCurrentCPS();
            BigDouble produced = cps * dt;

            if (produced > BigDouble.Zero)
            {
                // Check wire availability
                BigDouble wireNeededKg = produced * 0.001; // 1g per clip

                if (State.ScaleTier >= 3 || State.TotalWireKg >= wireNeededKg)
                {
                    if (State.ScaleTier < 3)
                    {
                        State.TotalWireKg -= wireNeededKg;
                    }

                    State.TotalClips += produced;
                    State.LifetimeClips += produced;
                    Telemetry.RecordClips(produced.ToDouble());
                    OnClipsGenerated?.Invoke(produced);
                }
            }

            CheckMilestones();
        }

        public OfflineResult ProcessOfflineTime(double offlineSeconds)
        {
            BigDouble cps = CalculateCurrentCPS();
            var result = OfflineTimeWarp.Calculate(State, cps, offlineSeconds);
            OfflineTimeWarp.ApplyOfflineResult(State, result);
            CheckMilestones();
            return result;
        }

        private void CheckMilestones()
        {
            Dialogue.EvaluateStoryTriggers(State);

            int previousTier = State.ScaleTier;
            if (State.LifetimeClips < new BigDouble(1, 4)) State.ScaleTier = 0; // Workbench
            else if (State.LifetimeClips < new BigDouble(1, 8)) State.ScaleTier = 1; // Factory
            else if (State.LifetimeClips < new BigDouble(1, 18)) State.ScaleTier = 2; // Planet
            else if (State.LifetimeClips < new BigDouble(1, 54)) State.ScaleTier = 3; // Solar
            else State.ScaleTier = 4; // Cosmic

            if (State.ScaleTier != previousTier)
            {
                OnScaleTierChanged?.Invoke(State.ScaleTier);
            }
        }
    }
}
