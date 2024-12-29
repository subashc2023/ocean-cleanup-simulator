import { PRODUCTION_START_YEAR } from '@/lib/constants';

export interface RiverEffect {
  yearInstalled: number;
  flowReduction: number;  // tons per day prevented
  installationCost: number;
}

export const calculateWastePerDay = (
  year: number, 
  riverInterceptions: RiverEffect[] = [],
  learningRate: number = 0.85  // 15% cost reduction for each doubling of capacity
): number => {
  const baseProduction = 2; // Million metric tons in 1950
  const growthRate = 0.0743; // Historical growth rate
  const wasteRate = 0.02 + (year - 1950) * 0.0001;
  
  // Calculate base inflow
  const totalProduction = baseProduction * Math.exp(growthRate * (year - 1950));
  const baseInflow = (totalProduction * wasteRate * 1000000) / 365;
  
  // Subtract prevented waste from river interceptors
  const preventedWaste = riverInterceptions
    .filter(r => r.yearInstalled <= year)
    .reduce((sum, r) => sum + r.flowReduction, 0);

  return Math.max(0, baseInflow - preventedWaste);
};

export const calculateCleanupCost = (
  year: number,
  baseOceanCost: number,
  baseRiverCost: number,
  installedCapacity: number
): { oceanCost: number; riverCost: number } => {
  const doublings = Math.log2(installedCapacity / 1000); // Initial 1000 ton reference
  const learningFactor = Math.pow(0.85, doublings);
  
  return {
    oceanCost: baseOceanCost * learningFactor,
    riverCost: baseRiverCost * learningFactor
  };
};

export const calculateHistoricalAccumulation = (upToYear: number): number => {
  let accumulation = 0;
  for (let year = PRODUCTION_START_YEAR; year < upToYear; year++) {
    const currentWaste = calculateWastePerDay(year);
    const nextYearWaste = calculateWastePerDay(year + 1);
    const yearlyAmount = ((currentWaste + nextYearWaste) / 2) * 365;
    accumulation += yearlyAmount;
  }
  return accumulation;
}; 