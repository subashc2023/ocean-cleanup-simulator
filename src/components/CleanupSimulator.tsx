'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

/**
 * Waste Cleanup Simulator
 * 
 * This component simulates future scenarios for plastic waste cleanup efforts,
 * taking into account historical accumulation since 1950 and projecting potential
 * cleanup trajectories based on different budget and cost parameters.
 * 
 * Features:
 * - Interactive budget and cost controls
 * - Adjustable time range for visualization
 * - Real-time calculation of cleanup projections
 * - Historical accumulation tracking
 * - Zero waste projection based on current rates
 */
const CleanupSimulator = () => {
  // Initialize with EUR cost converted to USD
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const price = logSliderToPrice(value);
    setCostPerKg(Number(price.toFixed(2)));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCostPerKg(value);
    }
  };

  const handleYearChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (type === 'start') {
        if (value >= PRODUCTION_START_YEAR && value < endYear) {
          setStartYear(value);
        }
      } else {
        if (value > startYear && value <= MAX_PROJECTION_YEAR) {
          setEndYear(value);
        }
      }
    }
  };

  const currentMetrics = data[data.length - 1] || {};
  const reductionPercent = currentMetrics.cumulativeMillionTons && currentMetrics.cumulativeNoCleanupMillionTons
    ? ((currentMetrics.cumulativeNoCleanupMillionTons - currentMetrics.cumulativeMillionTons) / 
       currentMetrics.cumulativeNoCleanupMillionTons * 100).toFixed(1)
    : 0;

  const initialAccumulation = data[0]?.cumulativeNoCleanupMillionTons || 0;

  const handleCostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 100) {
      setCostPerKg(Number(value.toFixed(2)));
    }
  };

  const formatBudgetInput = (value: number): string => {
    if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(1)}T`;
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    return `${(value / 1000000).toFixed(1)}M`;
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#0d1117]">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Plastic Waste Cleanup Simulator</h1>
        <p className="text-gray-300">
          Explore scenarios for global plastic waste cleanup efforts based on different budget allocations and cost assumptions.
        </p>
      </div>

      <Card className="bg-gray-800 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Annual Cleanup Budget: {formatBudget(annualBudget)}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={logBudgetToSlider(annualBudget)}
                    onChange={handleBudgetSliderChange}
                    className="w-full bg-gray-800 text-white border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={formatBudgetInput(annualBudget)}
                    onChange={handleBudgetTextChange}
                    placeholder="10B"
                    className="w-24 bg-gray-800 text-white border-gray-700 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Cost per Kilogram: ${costPerKg.toFixed(2)} 
                  {isLoadingRate ? (
                    <span className="text-gray-400 text-xs ml-1">Loading EUR rate...</span>
                  ) : (
                    <span>(€{(costPerKg * exchangeRate).toFixed(2)})</span>
                  )}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={priceToLogSlider(costPerKg)}
                    onChange={handleSliderChange}
                    className="w-full bg-gray-800 text-white border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={costPerKg}
                    onChange={handleCostInputChange}
                    className="w-24 bg-gray-800 text-white border-gray-700 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-400 flex justify-between">
                  <span>$0.10/kg</span>
                  <span>$1/kg</span>
                  <span>$10/kg</span>
                  <span>$100/kg</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Year (min: {PRODUCTION_START_YEAR})
                </label>
                <Input
                  type="number"
                  min={PRODUCTION_START_YEAR}
                  max={endYear - 1}
                  value={startYear}
                  onChange={(e) => handleYearChange('start', e)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Year (max: {MAX_PROJECTION_YEAR})
                </label>
                <Input
                  type="number"
                  min={startYear + 1}
                  max={MAX_PROJECTION_YEAR}
                  value={endYear}
                  onChange={(e) => handleYearChange('end', e)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="font-medium text-gray-200">Pre-{startYear} Accumulation</div>
                <div className="mt-1 text-gray-300">{Math.round(initialAccumulation).toLocaleString()} M tons</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Daily Removal Capacity</div>
                <div className="mt-1 text-gray-700">
                  {Math.round(annualBudget / (costPerKg * 1000) / 365).toLocaleString()} tons/day
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Projected Reduction by {endYear}</div>
                <div className="mt-1 text-gray-700">{reductionPercent}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Zero Total Waste Year</div>
                <div className="mt-1 text-gray-700">
                  {zeroYear ? zeroYear : 'Not reached by 2200'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1f2d] shadow-md rounded-none">
        <CardContent className="p-0">
          <div className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 30,
                  bottom: 40
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  label={{ 
                    value: 'Year', 
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#9CA3AF'
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ 
                    value: 'Daily Plastic Flow (Thousands of Metric Tons/Day)', 
                    angle: -90, 
                    position: 'outside',
                    offset: 20,
                    style: { fill: '#9CA3AF' }
                  }}
                  tickMargin={0}
                  tickFormatter={(value) => (value / 1000).toFixed(0)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ 
                    value: 'Total Accumulated Plastic (Million Tons)', 
                    angle: 90, 
                    position: 'outside',
                    offset: 0,
                    style: { fill: '#9CA3AF' }
                  }}
                  tickMargin={0}
                />
                <Tooltip 
                  formatter={(value: number, name) => {
                    switch(name) {
                      case "Original Total":
                      case "New Total":
                        return `${value.toLocaleString()} million tons`;
                      case "Original Inflow":
                      case "Net Inflow with Cleanup":
                        return `${value.toLocaleString()} tons/day`;
                      default:
                        return value.toLocaleString();
                    }
                  }}
                  contentStyle={{
                    backgroundColor: '#1a1f2d',
                    border: '1px solid #374151',
                    color: '#9CA3AF'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    marginBottom: '-5px'
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="dailyInflow" 
                  name="Original Inflow"
                  stroke="#dc2626" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="netInflow" 
                  name="Net Inflow with Cleanup"
                  stroke="#ea580c" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulativeNoCleanupMillionTons" 
                  name="Original Total"
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulativeMillionTons" 
                  name="New Total"
                  stroke="#16a34a" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-300 space-y-2">
        <h3 className="font-medium text-white">Notes & Assumptions:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Plastic production and waste tracking starts from {PRODUCTION_START_YEAR}</li>
          <li>Graph shows data from {startYear} to {endYear}</li>
          <li>Cleanup efforts begin in {CLEANUP_START_YEAR}</li>
          <li>Current cost per metric ton: ${(costPerKg * 1000).toLocaleString()} / 
            {isLoadingRate ? (
              <span className="text-gray-400">Loading EUR...</span>
            ) : (
              `€${(costPerKg * 1000 * exchangeRate).toLocaleString()}`
            )} The default rate of ~5,300 Euros/Ton is As per The Ocean Cleanup 2024
          </li>
          <li>Pre-{startYear} accumulation is included in total figures</li>
          <li>Projections assume constant growth rates and cleanup costs</li>
          <li>This simulation does not account for the difference between the cost of removing plastic(Ocean plastic) and the cost of preventing it(River Plastic).</li>
          <li>Ocean plastic is 90%+ of the total plastic waste, and is 10x more expensive per kg to capture.</li>
        </ul>
      </div>
    </div>
  );
};

export default CleanupSimulator;