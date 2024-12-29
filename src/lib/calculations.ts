export interface DataPoint {
  year: number;
  dailyInflow: number;
  netInflow: number;
  cumulativeMillionTons: number;
  cumulativeNoCleanupMillionTons: number;
}

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

export const formatBudget = (value: number): string => {
  if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(1)}T`;
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  return `${(value / 1000000).toFixed(1)}M`;
};

export const logSliderToPrice = (value: number): number => {
  const minPrice = 0.1;
  const maxPrice = 100;
  const minLog = Math.log(minPrice);
  const maxLog = Math.log(maxPrice);
  const scale = (maxLog - minLog) / 100;
  const result = Math.exp(minLog + scale * value);
  return Number(result.toFixed(2));
};

export const priceToLogSlider = (price: number): number => {
  const minPrice = 0.1;
  const maxPrice = 100;
  const minLog = Math.log(minPrice);
  const maxLog = Math.log(maxPrice);
  const scale = (maxLog - minLog) / 100;
  const value = (Math.log(price) - minLog) / scale;
  return Math.round(value);
}; 