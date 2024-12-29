import type { DataPoint } from './types';

export const calculateZeroYear = (
  data: DataPoint[],
  costPerKg: number,
  annualBudget: number,
  MAX_PROJECTION_YEAR: number
): number | null => {
  const latestData = data[data.length - 1];
  if (!latestData || !latestData.cumulativeMillionTons) return null;
  
  const costPerTon = costPerKg * 1000;
  const removalCapacity = (annualBudget / costPerTon) / 365;
  
  if (removalCapacity <= 0) return null;
  
  const lastIndex = data.length - 1;
  if (lastIndex < 1) return null;
  
  const y2 = data[lastIndex].cumulativeMillionTons;
  const y1 = data[lastIndex - 1].cumulativeMillionTons;
  const x2 = data[lastIndex].year;
  const x1 = data[lastIndex - 1].year;
  
  const slope = (y2 - y1) / (x2 - x1);
  
  if (slope >= 0) return null;
  
  const zeroYear = Math.ceil(-y2/slope + x2);
  
  return zeroYear <= MAX_PROJECTION_YEAR * 2 ? zeroYear : null;
}; 