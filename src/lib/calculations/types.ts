export interface DataPoint {
  year: number;
  dailyInflow: number;
  netInflow: number;
  cumulativeMillionTons: number;
  cumulativeNoCleanupMillionTons: number;
}

export interface RiverEffect {
  yearInstalled: number;
  flowReduction: number;
  installationCost: number;
} 