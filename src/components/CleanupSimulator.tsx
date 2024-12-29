'use client';

import React, { useState, useEffect } from 'react';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { 
  calculateZeroYear, 
  formatBudget, 
  logSliderToPrice, 
  priceToLogSlider,
  calculateWastePerDay,
  calculateCleanupCost,
  calculateHistoricalAccumulation,
  type DataPoint,
  type RiverEffect
} from '@/lib/calculations';
import { 
  PRODUCTION_START_YEAR, 
  CLEANUP_START_YEAR, 
  MAX_PROJECTION_YEAR,
  DEFAULT_COST_PER_KG_EUR,
  DEFAULT_EXCHANGE_RATE,
  DEFAULT_OCEAN_COST,
  DEFAULT_RIVER_COST
} from '@/lib/constants';

import { SimulatorHeader } from './simulator/SimulatorHeader';
import { SimulatorControls } from './simulator/SimulatorControls';
import { SimulatorChart } from './simulator/SimulatorChart';
import { MetricsPanel } from './simulator/MetricsPanel';
import { NotesAndAssumptions } from './simulator/NotesAndAssumptions';

const CleanupSimulator = () => {
  const [annualBudget, setAnnualBudget] = useState(10000000000);
  const [costPerKg, setCostPerKg] = useState(DEFAULT_COST_PER_KG_EUR / DEFAULT_EXCHANGE_RATE);
  const [startYear, setStartYear] = useState(1991);
  const [endYear, setEndYear] = useState(2035);
  const [data, setData] = useState<DataPoint[]>([]);
  const [zeroYear, setZeroYear] = useState<number | null>(null);
  const [cleanupStrategy, setCleanupStrategy] = useState<'ocean' | 'river' | 'hybrid'>('hybrid');
  const [installedCapacity, setInstalledCapacity] = useState(0);
  const [riverInterceptions, setRiverInterceptions] = useState<RiverEffect[]>([]);
  
  const { exchangeRate, isLoadingRate } = useExchangeRate();

  // Update data when parameters change
  useEffect(() => {
    const results: DataPoint[] = [];
    
    let currentCapacity = 0;
    let currentRiverInterceptions: RiverEffect[] = [];
    
    if (startYear >= endYear) return;

    const historicalAccumulation = calculateHistoricalAccumulation(startYear);
    let cumulativeTotal = historicalAccumulation;
    let cumulativeTotalNoCleanup = historicalAccumulation;
    
    const previousYearWaste = calculateWastePerDay(startYear - 1);
    let previousNetChange = previousYearWaste;
    
    for (let year = startYear; year <= endYear; year++) {
      const { oceanCost, riverCost } = calculateCleanupCost(
        year, 
        DEFAULT_OCEAN_COST, 
        DEFAULT_RIVER_COST, 
        currentCapacity
      );

      // Fixed 80/20 split between prevention and cleanup
      const riverBudget = year >= CLEANUP_START_YEAR ? annualBudget * 0.8 : 0;
      const oceanBudget = year >= CLEANUP_START_YEAR ? annualBudget * 0.2 : 0;

      // Calculate new river interceptions
      if (riverBudget > 0) {
        const newRiverCapacity = riverBudget / riverCost;
        currentCapacity += newRiverCapacity;
        
        currentRiverInterceptions.push({
          yearInstalled: year,
          flowReduction: newRiverCapacity / 365,
          installationCost: riverBudget
        });
      }

      // Calculate flows and cleanup
      const wastePerDay = calculateWastePerDay(year, currentRiverInterceptions);
      const oceanRemovalPerDay = oceanBudget / (oceanCost * 1000 * 365);
      
      // Net change can be negative when cleanup exceeds inflow
      const netDailyChange = wastePerDay - oceanRemovalPerDay;
      
      // Calculate yearly changes using trapezoidal integration
      const yearlyAmount = ((netDailyChange + previousNetChange) / 2) * 365;
      const yearlyAmountNoCleanup = ((wastePerDay + previousYearWaste) / 2) * 365;
      
      // Update cumulative totals, ensuring they don't go below zero
      if (year > startYear) {
        cumulativeTotal = Math.max(0, cumulativeTotal + yearlyAmount);
        cumulativeTotalNoCleanup += yearlyAmountNoCleanup;
      }
      
      results.push({
        year,
        dailyInflow: Math.round(wastePerDay),
        netInflow: Math.round(netDailyChange), // Can be negative!
        cumulativeMillionTons: Math.round(cumulativeTotal / 1000000 * 10) / 10,
        cumulativeNoCleanupMillionTons: Math.round(cumulativeTotalNoCleanup / 1000000 * 10) / 10
      });

      previousYearWaste = wastePerDay;
      previousNetChange = netDailyChange;
    }
    
    setData(results);
    setZeroYear(calculateZeroYear(results, costPerKg, annualBudget, MAX_PROJECTION_YEAR));
  }, [annualBudget, costPerKg, startYear, endYear]);

  // Input handlers
  const handleBudgetTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase();
    const match = value.match(/^(\d+\.?\d*)\s*(M|B|T)$/);
    if (!match) return;

    const [_, number, unit] = match;
    const numValue = parseFloat(number);
    const multiplier = unit === 'T' ? 1e12 : unit === 'B' ? 1e9 : 1e6;
    const newValue = numValue * multiplier;
    
    if (newValue >= 100000000 && newValue <= 1000000000000) {
      setAnnualBudget(newValue);
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 100) {
      setCostPerKg(Number(value.toFixed(2)));
    }
  };

  const handleYearChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;

    if (type === 'start') {
      if (value >= PRODUCTION_START_YEAR && value < endYear - 1) {
        setStartYear(value);
      }
    } else if (type === 'end') {
      if (value > startYear + 1 && value <= MAX_PROJECTION_YEAR) {
        setEndYear(value);
      }
    }
  };

  const logBudgetToSlider = (value: number): number => {
    // Convert budget value to slider value (0-100)
    const minBudget = Math.log(100000000); // 100M
    const maxBudget = Math.log(1000000000000); // 1T
    const scale = (maxBudget - minBudget) / 100;
    return (Math.log(value) - minBudget) / scale;
  };

  const sliderToBudget = (value: number): number => {
    // Convert slider value (0-100) to budget
    const minBudget = Math.log(100000000); // 100M
    const maxBudget = Math.log(1000000000000); // 1T
    const scale = (maxBudget - minBudget) / 100;
    return Math.round(Math.exp(minBudget + scale * value));
  };

  const handleBudgetSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAnnualBudget(sliderToBudget(value));
  };

  const currentMetrics = data[data.length - 1] || {};
  const reductionPercent = currentMetrics.cumulativeMillionTons && currentMetrics.cumulativeNoCleanupMillionTons
    ? ((currentMetrics.cumulativeNoCleanupMillionTons - currentMetrics.cumulativeMillionTons) / 
       currentMetrics.cumulativeNoCleanupMillionTons * 100).toFixed(1)
    : 0;

  const initialAccumulation = data[0]?.cumulativeNoCleanupMillionTons || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-4 bg-[#0d1117]">
      <SimulatorHeader 
        title="Plastic Waste Cleanup Simulator"
        description="Explore scenarios for global plastic waste cleanup efforts based on different budget allocations and cost assumptions."
      />

      <SimulatorControls
        annualBudget={annualBudget}
        costPerKg={costPerKg}
        startYear={startYear}
        endYear={endYear}
        exchangeRate={exchangeRate}
        isLoadingRate={isLoadingRate}
        onBudgetChange={handleBudgetTextChange}
        onBudgetSliderChange={handleBudgetSliderChange}
        onBudgetTextChange={handleBudgetTextChange}
        onCostChange={handleCostChange}
        onYearChange={handleYearChange}
        formatBudget={formatBudget}
        logBudgetToSlider={logBudgetToSlider}
        priceToLogSlider={priceToLogSlider}
      />

      <MetricsPanel
        initialAccumulation={initialAccumulation}
        startYear={startYear}
        annualBudget={annualBudget}
        costPerKg={costPerKg}
        endYear={endYear}
        reductionPercent={reductionPercent}
        zeroYear={zeroYear}
      />

      <SimulatorChart data={data} />

      <NotesAndAssumptions
        startYear={startYear}
        endYear={endYear}
        costPerKg={costPerKg}
        exchangeRate={exchangeRate}
        isLoadingRate={isLoadingRate}
      />
    </div>
  );
};

export default CleanupSimulator;