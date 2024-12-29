'use client';

import React, { useState, useEffect } from 'react';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { 
  calculateZeroYear, 
  formatBudget, 
  logSliderToPrice, 
  priceToLogSlider,
  type DataPoint 
} from '@/lib/calculations';
import { 
  PRODUCTION_START_YEAR, 
  CLEANUP_START_YEAR, 
  MAX_PROJECTION_YEAR,
  DEFAULT_COST_PER_KG_EUR,
  DEFAULT_EXCHANGE_RATE
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
  
  const { exchangeRate, isLoadingRate } = useExchangeRate();

  // Calculate daily waste production based on historical growth patterns
  const calculateWastePerDay = (year: number): number => {
    const baseProduction = 2; // Million metric tons in 1950
    const growthRate = 0.0743; // Historical growth rate
    const wasteRate = 0.02 + (year - 1950) * 0.0001; // Increasing waste rate
    
    const totalProduction = baseProduction * Math.exp(growthRate * (year - 1950));
    return (totalProduction * wasteRate * 1000000) / 365;
  };

  // Calculate accumulated waste up to a given year
  const calculateHistoricalAccumulation = (upToYear: number): number => {
    let accumulation = 0;
    for (let year = PRODUCTION_START_YEAR; year < upToYear; year++) {
      const currentWaste = calculateWastePerDay(year);
      const nextYearWaste = calculateWastePerDay(year + 1);
      const yearlyAmount = ((currentWaste + nextYearWaste) / 2) * 365;
      accumulation += yearlyAmount;
    }
    return accumulation;
  };

  // Update data when parameters change
  useEffect(() => {
    const results: DataPoint[] = [];
    const historicalAccumulation = calculateHistoricalAccumulation(startYear);
    let cumulativeTotal = historicalAccumulation;
    let cumulativeTotalNoCleanup = historicalAccumulation;
    
    const costPerTon = costPerKg * 1000;
    const removalCapacity = (annualBudget / costPerTon) / 365;
    
    for (let year = startYear; year <= endYear; year++) {
      const wastePerDay = calculateWastePerDay(year);
      const removalPerDay = year >= CLEANUP_START_YEAR ? removalCapacity : 0;
      const netDailyChange = wastePerDay - removalPerDay;
      
      if (year > startYear) {
        const previousNet = calculateWastePerDay(year - 1) - 
          (year - 1 >= CLEANUP_START_YEAR ? removalCapacity : 0);
        const yearlyAmount = ((netDailyChange + previousNet) / 2) * 365;
        cumulativeTotal += yearlyAmount;
        
        const previousWaste = calculateWastePerDay(year - 1);
        const yearlyAmountNoCleanup = ((wastePerDay + previousWaste) / 2) * 365;
        cumulativeTotalNoCleanup += yearlyAmountNoCleanup;
      }
      
      results.push({
        year,
        dailyInflow: Math.round(wastePerDay),
        netInflow: Math.round(netDailyChange),
        cumulativeMillionTons: Math.max(0, Math.round(cumulativeTotal / 1000000 * 10) / 10),
        cumulativeNoCleanupMillionTons: Math.round(cumulativeTotalNoCleanup / 1000000 * 10) / 10
      });
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
    if (!isNaN(value)) {
      if (type === 'start' && value >= PRODUCTION_START_YEAR && value < endYear) {
        setStartYear(value);
      } else if (type === 'end' && value > startYear && value <= MAX_PROJECTION_YEAR) {
        setEndYear(value);
      }
    }
  };

  const currentMetrics = data[data.length - 1] || {};
  const reductionPercent = currentMetrics.cumulativeMillionTons && currentMetrics.cumulativeNoCleanupMillionTons
    ? ((currentMetrics.cumulativeNoCleanupMillionTons - currentMetrics.cumulativeMillionTons) / 
       currentMetrics.cumulativeNoCleanupMillionTons * 100).toFixed(1)
    : 0;

  const initialAccumulation = data[0]?.cumulativeNoCleanupMillionTons || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#0d1117]">
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
        onBudgetSliderChange={(e) => setAnnualBudget(Number(e.target.value))}
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