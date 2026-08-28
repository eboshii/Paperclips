using System;
using System.Collections.Generic;

namespace Paperclips.Core
{
    public enum ModifierType
    {
        FlatAdd,
        AdditiveMultiplier,
        CompoundMultiplier
    }

    [Serializable]
    public class Modifier
    {
        public string TargetTag { get; set; }
        public ModifierType Type { get; set; }
        public double Value { get; set; }
        public string SourceUpgradeId { get; set; }
    }

    public class ModifierEngine
    {
        private readonly List<Modifier> _modifiers = new List<Modifier>();

        public void AddModifier(Modifier mod)
        {
            _modifiers.Add(mod);
        }

        public void Clear()
        {
            _modifiers.Clear();
        }

        /// <summary>
        /// Calculates the final value for a given target tag using the formula:
        /// FinalValue = (BaseValue + Sum(Flat)) * (1 + Sum(Additive)) * Product(1 + Compound)
        /// </summary>
        public BigDouble Evaluate(string targetTag, BigDouble baseValue)
        {
            double flatSum = 0.0;
            double additiveSum = 0.0;
            double compoundProduct = 1.0;

            for (int i = 0; i < _modifiers.Count; i++)
            {
                var mod = _modifiers[i];
                if (mod.TargetTag == targetTag)
                {
                    switch (mod.Type)
                    {
                        case ModifierType.FlatAdd:
                            flatSum += mod.Value;
                            break;
                        case ModifierType.AdditiveMultiplier:
                            additiveSum += mod.Value;
                            break;
                        case ModifierType.CompoundMultiplier:
                            compoundProduct *= (1.0 + mod.Value);
                            break;
                    }
                }
            }

            BigDouble result = (baseValue + flatSum) * (1.0 + additiveSum) * compoundProduct;
            return result;
        }

        public double EvaluateDouble(string targetTag, double baseValue)
        {
            double flatSum = 0.0;
            double additiveSum = 0.0;
            double compoundProduct = 1.0;

            for (int i = 0; i < _modifiers.Count; i++)
            {
                var mod = _modifiers[i];
                if (mod.TargetTag == targetTag)
                {
                    switch (mod.Type)
                    {
                        case ModifierType.FlatAdd:
                            flatSum += mod.Value;
                            break;
                        case ModifierType.AdditiveMultiplier:
                            additiveSum += mod.Value;
                            break;
                        case ModifierType.CompoundMultiplier:
                            compoundProduct *= (1.0 + mod.Value);
                            break;
                    }
                }
            }

            return (baseValue + flatSum) * (1.0 + additiveSum) * compoundProduct;
        }
    }
}
