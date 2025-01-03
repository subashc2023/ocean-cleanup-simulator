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
  calculateWastePerDay,
  calculateAdjustedGrowthRate,
  BASE_GROWTH_RATE
} from '@/lib/calculations/waste-calculations';
import { 
  PRODUCTION_START_YEAR, 
  CLEANUP_START_YEAR, 
  MAX_PROJECTION_YEAR,
  DEFAULT_COST_PER_KG_EUR,
  DEFAULT_EXCHANGE_RATE,
  TEAM_SEAS_START,
  TEAM_SEAS_END,
  TEAM_SEAS_TOTAL_TONS,
  TEAM_SEAS_DAILY_RATE
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
    
    // Ensure valid year range
    if (startYear >= endYear) {
      return;
    }

    // Calculate initial accumulation up to start year
    const historicalAccumulation = calculateHistoricalAccumulation(startYear);
    let cumulativeTotal = historicalAccumulation;
    let cumulativeTotalNoCleanup = historicalAccumulation;
    
    const costPerTon = costPerKg * 1000;
    const removalCapacity = (annualBudget / costPerTon) / 365;
    
    // Calculate previous year's values for initial point
    const previousYearWaste = calculateWastePerDay(startYear - 1);
    const previousYearRemoval = (startYear - 1) >= CLEANUP_START_YEAR ? removalCapacity : 0;
    const previousNetChange = previousYearWaste - previousYearRemoval;
    
    // Add data points for each year
    for (let year = startYear; year <= endYear; year++) {
      // Calculate original waste without cleanup effects
      const originalWastePerDay = calculateWastePerDay(year, 0);
      
      // Calculate waste with cleanup effects included
      const wasteWithCleanup = calculateWastePerDay(year, removalCapacity);
      
      // Calculate Team Seas effect on inflow
      const teamSeasEffect = (year >= TEAM_SEAS_START && year <= TEAM_SEAS_END) 
        ? TEAM_SEAS_DAILY_RATE 
        : 0;

      // Apply Team Seas reduction to the inflow
      const adjustedWastePerDay = wasteWithCleanup - teamSeasEffect;
      
      // Calculate cleanup removal
      const simulatedRemoval = year >= CLEANUP_START_YEAR ? removalCapacity : 0;
      const netDailyChange = adjustedWastePerDay - simulatedRemoval;
      
      // Calculate yearly accumulation using trapezoidal integration
      const yearlyAmount = ((netDailyChange + previousNetChange) / 2) * 365;
      const yearlyAmountNoCleanup = ((originalWastePerDay + previousYearWaste) / 2) * 365;
      
      // Update cumulative totals
      if (year > startYear) {
        cumulativeTotal += yearlyAmount;
        cumulativeTotalNoCleanup += yearlyAmountNoCleanup;
      }
      
      results.push({
        year,
        dailyInflow: Math.round(originalWastePerDay),
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

  const handleYearRangeChange = (values: number[]) => {
    const [newStart, newEnd] = values;
    if (newStart >= PRODUCTION_START_YEAR && newEnd <= MAX_PROJECTION_YEAR && newStart < newEnd) {
      setStartYear(newStart);
      setEndYear(newEnd);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-4 bg-[#0d1117]">
      <SimulatorHeader 
        title="Tides Of Change"
        description="Explore scenarios for global plastic waste cleanup efforts."
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
        onYearRangeChange={handleYearRangeChange}
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