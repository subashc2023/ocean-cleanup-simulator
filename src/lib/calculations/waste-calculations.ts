export const calculateWastePerDay = (year: number): number => {
  const baseProduction = 2; // Million metric tons in 1950
  const growthRate = 0.0743; // Historical growth rate
  const wasteRate = 0.02 + (year - 1950) * 0.0001; // Increasing waste rate
  
  const totalProduction = baseProduction * Math.exp(growthRate * (year - 1950));
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