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
  // This represents the long-term effect of cleanup on future waste generation
  // We reduce this effect to 50% since not all cleanup directly affects growth
  return Math.max(0, baseGrowthRate * (1 - percentageHandled * 0.5));
};

export const calculateWastePerDay = (year: number, removalCapacity: number = 0): number => {
  const baseProduction = 2; // Million metric tons in 1950
  const wasteRate = 0.02 + (year - 1950) * 0.0001; // Increasing waste rate
  
  // Use adjusted growth rate based on cleanup capacity (long-term effect)
  const adjustedGrowthRate = calculateAdjustedGrowthRate(year, removalCapacity);
  const totalProduction = baseProduction * Math.exp(adjustedGrowthRate * (year - 1950));
  const dailyInflow = (totalProduction * wasteRate * 1000000) / 365;

  // Direct reduction from river filtration (immediate effect)
  if (year >= CLEANUP_START_YEAR) {
    // Calculate direct reduction from river filtration
    // We assume 80% of cleanup capacity goes to river filtration
    const riverFiltrationCapacity = removalCapacity * 0.8;
    return Math.max(0, dailyInflow - riverFiltrationCapacity);
  }

  return dailyInflow;
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