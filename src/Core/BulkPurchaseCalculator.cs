using System;

namespace Paperclips.Core
{
    /// <summary>
    /// Implements O(1) closed-form logarithmic formulas for geometric series cost calculations.
    /// Eliminates iterative loops when purchasing tens of thousands of machine tiers.
    /// </summary>
    public static class BulkPurchaseCalculator
    {
        /// <summary>
        /// Calculates the exact cost to purchase N items starting from currentOwned count.
        /// Cost(N) = BaseCost * r^K * ( (r^N - 1) / (r - 1) )
        /// </summary>
        public static BigDouble CalculateCostForN(BigDouble baseCost, double costMultiplier, int currentOwned, int countToBuy)
        {
            if (countToBuy <= 0) return BigDouble.Zero;
            if (countToBuy == 1) return baseCost * Math.Pow(costMultiplier, currentOwned);

            double r = costMultiplier;
            double rToK = Math.Pow(r, currentOwned);
            double seriesFactor = (Math.Pow(r, countToBuy) - 1.0) / (r - 1.0);

            return baseCost * rToK * seriesFactor;
        }

        /// <summary>
        /// Calculates the maximum number of items affordable with availableCurrency in O(1).
        /// N_max = floor( log_r( (Currency * (r - 1)) / (BaseCost * r^K) + 1 ) )
        /// </summary>
        public static int CalculateMaxAffordable(BigDouble baseCost, double costMultiplier, int currentOwned, BigDouble availableCurrency, out BigDouble totalCost)
        {
            totalCost = BigDouble.Zero;
            if (availableCurrency <= BigDouble.Zero) return 0;

            BigDouble firstItemCost = baseCost * Math.Pow(costMultiplier, currentOwned);
            if (availableCurrency < firstItemCost) return 0;

            double r = costMultiplier;
            double rMinusOne = r - 1.0;

            // Normalized ratio: (Currency * (r - 1)) / (BaseCost * r^K)
            BigDouble numerator = availableCurrency * rMinusOne;
            BigDouble denominator = firstItemCost;
            BigDouble ratio = (numerator / denominator) + 1.0;

            double logR = Math.Log(r);
            double logRatio = BigDouble.Log10(ratio) * Math.Log(10.0); // Natural log of ratio

            int maxCount = (int)Math.Floor(logRatio / logR);
            if (maxCount <= 0) return 0;

            // Re-verify exact cost with integer boundary checks
            totalCost = CalculateCostForN(baseCost, costMultiplier, currentOwned, maxCount);
            while (totalCost > availableCurrency && maxCount > 0)
            {
                maxCount--;
                totalCost = CalculateCostForN(baseCost, costMultiplier, currentOwned, maxCount);
            }

            return maxCount;
        }
    }
}
