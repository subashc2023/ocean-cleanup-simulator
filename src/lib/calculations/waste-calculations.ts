interface WasteParams {
  baseProduction: number;  // Million metric tons in 1950
  growthRate: number;      // Base growth rate
  wasteRate: number;       // Initial waste rate
  riverEfficiency: number; // % of waste that can be caught in rivers (cheaper)
  preventionFactor: number;// How much prevention reduces future inflows
}

const DEFAULT_PARAMS: WasteParams = {
  baseProduction: 2,
  growthRate: 0.0743,
  wasteRate: 0.02,
  riverEfficiency: 0.3,    // 30% of waste can be caught in rivers
  preventionFactor: 0.8    // Each ton of capacity reduces future inflows by 0.8 tons
};

export const calculateWastePerDay = (
  year: number, 
  cumulativeCapacity: number = 0,
  params: WasteParams = DEFAULT_PARAMS
): number => {
  const yearsSince1950 = year - 1950;
  
  // Calculate base production without prevention effects
  const baseTotal = params.baseProduction * Math.exp(params.growthRate * yearsSince1950);
  
  // Calculate how much the cumulative cleanup capacity has reduced inflows
  const preventionEffect = (cumulativeCapacity * params.preventionFactor) / 365;
  
  // Calculate actual production after prevention effects
  const adjustedProduction = Math.max(0, baseTotal - preventionEffect);
  
  // Calculate waste rate with increasing efficiency over time
  const wasteRate = params.wasteRate + (yearsSince1950 * 0.0001);
  
  return (adjustedProduction * wasteRate * 1000000) / 365;
};

export const calculateHistoricalAccumulation = (
  upToYear: number, 
  startYear: number,
  annualBudget: number,
  costPerKg: number
): number => {
  let accumulation = 0;
  let cumulativeCapacity = 0;
  
  for (let year = startYear; year < upToYear; year++) {
    // Calculate capacity added this year
    const costPerTon = costPerKg * 1000;
    const yearlyCapacity = annualBudget / costPerTon;
    cumulativeCapacity += yearlyCapacity;

    const currentWaste = calculateWastePerDay(year, cumulativeCapacity);
    const nextYearWaste = calculateWastePerDay(year + 1, cumulativeCapacity);
    const yearlyAmount = ((currentWaste + nextYearWaste) / 2) * 365;
    accumulation += yearlyAmount;
  }
  return accumulation;
}; 