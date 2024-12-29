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
  
  // Each X tons/day of removal capacity reduces growth rate by Y%
  const CAPACITY_IMPACT_FACTOR = 0.00001; // Adjust this to tune the effect
  const growthReduction = removalCapacity * CAPACITY_IMPACT_FACTOR;
  
  // Growth rate can't go negative
  return Math.max(0, baseGrowthRate - growthReduction);
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