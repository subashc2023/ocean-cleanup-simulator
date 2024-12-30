import { CLEANUP_START_YEAR } from '@/lib/constants';

// Base growth rate without intervention
export const BASE_GROWTH_RATE = 0.0743;

// Calculate how much the growth rate is reduced based on cleanup capacity
export const calculateAdjustedGrowthRate = (
  year: number,
  removalCapacity: number,
  baseGrowthRate: number = BASE_GROWTH_RATE
): number => {
  if (year < CLEANUP_START_YEAR) return baseGrowthRate;
  
  // Calculate the total daily inflow for this year without cleanup
  const baseProduction = 2; // Million metric tons in 1950
  const wasteRate = 0.02 + (year - 1950) * 0.0001;
  const totalProduction = baseProduction * Math.exp(baseGrowthRate * (year - 1950));
  const dailyInflow = (totalProduction * wasteRate * 1000000) / 365;
  
  // Calculate what percentage of the daily inflow we can handle
  const percentageHandled = Math.min(1, removalCapacity / dailyInflow);
  
  // Reduce the growth rate proportionally to the percentage we can handle
  // This means if we can handle 6% of inflows, future growth will be reduced by 6%
  return Math.max(0, baseGrowthRate * (1 - percentageHandled));
};

export const calculateWastePerDay = (year: number, removalCapacity: number = 0): number => {
  const baseProduction = 2; // Million metric tons in 1950
  const wasteRate = 0.02 + (year - 1950) * 0.0001; // Increasing waste rate
  
  // Use adjusted growth rate based on cleanup capacity
  const adjustedGrowthRate = calculateAdjustedGrowthRate(year, removalCapacity);
  
  const totalProduction = baseProduction * Math.exp(adjustedGrowthRate * (year - 1950));
  return (totalProduction * wasteRate * 1000000) / 365;
};

export const calculateHistoricalAccumulation = (upToYear: number, startYear: number): number => {
  let accumulation = 0;
  for (let year = startYear; year < upToYear; year++) {
    const currentWaste = calculateWastePerDay(year);
    const nextYearWaste = calculateWastePerDay(year + 1);
    const yearlyAmount = ((currentWaste + nextYearWaste) / 2) * 365;
    accumulation += yearlyAmount;
  }
  return accumulation;
}; 