'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  const [annualBudget, setAnnualBudget] = useState(10000000000);
  const [costPerKg, setCostPerKg] = useState(5.22 / 0.93);
  const [startYear, setStartYear] = useState(1991);
  const [endYear, setEndYear] = useState(2035);
  const [data, setData] = useState<DataPoint[]>([]);
  const [zeroYear, setZeroYear] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState(0.93);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  
  // Constants
  const PRODUCTION_START_YEAR = 1950;
  const CLEANUP_START_YEAR = 2024;
  const MAX_PROJECTION_YEAR = 2100;
  
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

  // Find the year when total waste reaches zero by calculating the y-intercept
  interface DataPoint {
  year: number;
  originalWastePerDay: number;
  removalPerDay: number;
  netDailyChange: number;
  cumulativeMillionTons: number;
  cumulativeNoCleanupMillionTons: number;
}

const calculateZeroYear = (latestData: DataPoint | undefined): number | null => {
    if (!latestData || !latestData.cumulativeMillionTons) return null;
    
    const costPerTon = costPerKg * 1000;
    const removalCapacity = (annualBudget / costPerTon) / 365;
    
    // If we're not removing anything, we'll never reach zero
    if (removalCapacity <= 0) return null;
    
    // Get the current rate of change from the last two data points
    const lastIndex = data.length - 1;
    if (lastIndex < 1) return null;
    
    const y2 = data[lastIndex].cumulativeMillionTons;
    const y1 = data[lastIndex - 1].cumulativeMillionTons;
    const x2 = data[lastIndex].year;
    const x1 = data[lastIndex - 1].year;
    
    // Calculate slope (million tons per year)
    const slope = (y2 - y1) / (x2 - x1);
    
    // If we're not decreasing, we'll never reach zero
    if (slope >= 0) return null;
    
    // Using point-slope form to find x-intercept:
    // y - y1 = m(x - x1)
    // 0 - y2 = m(x - x2)
    // -y2 = m(x - x2)
    // x = -y2/m + x2
    const zeroYear = Math.ceil(-y2/slope + x2);
    
    return zeroYear <= MAX_PROJECTION_YEAR * 2 ? zeroYear : null;
  };

  useEffect(() => {
    const results = [];
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
        originalWastePerDay: Math.round(wastePerDay),
        removalPerDay: Math.round(removalPerDay),
        netDailyChange: Math.round(netDailyChange),
        cumulativeMillionTons: Math.max(0, Math.round(cumulativeTotal / 1000000 * 10) / 10),
        cumulativeNoCleanupMillionTons: Math.round(cumulativeTotalNoCleanup / 1000000 * 10) / 10
      });
    }
    
    setData(results);
    setZeroYear(calculateZeroYear(results[results.length - 1]));
  }, [annualBudget, costPerKg, startYear, endYear]);

  interface CachedRate {
    rate: number;
    timestamp: number;
  }

  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const getCachedExchangeRate = (): CachedRate | null => {
    const cached = localStorage.getItem('exchangeRate');
    if (!cached) return null;
    
    try {
      return JSON.parse(cached) as CachedRate;
    } catch {
      return null;
    }
  };

  const setCachedExchangeRate = (rate: number) => {
    const cacheData: CachedRate = {
      rate,
      timestamp: Date.now()
    };
    localStorage.setItem('exchangeRate', JSON.stringify(cacheData));
  };

  useEffect(() => {
    const fetchExchangeRate = async () => {
      // Check cache first
      const cached = getCachedExchangeRate();
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        setExchangeRate(cached.rate);
        setIsLoadingRate(false);
        return;
      }

      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const newRate = data.rates.EUR;
        setExchangeRate(newRate);
        setCachedExchangeRate(newRate);
        setIsLoadingRate(false);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // If we have a cached rate, use it even if expired
        if (cached) {
          setExchangeRate(cached.rate);
        } else {
          setExchangeRate(0.93); // Fallback default rate
        }
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []); // Empty dependency array means this runs once on mount

  const logSliderToPrice = (value: number): number => {
    // Convert slider value (0-100) to price ($0.1-$100)
    // Using exponential function to create non-linear scale
    const minPrice = 0.1;
    const maxPrice = 100;
    const minLog = Math.log(minPrice);
    const maxLog = Math.log(maxPrice);
    const scale = (maxLog - minLog) / 100;
    
    return Math.exp(minLog + scale * value);
  };

  const priceToLogSlider = (price: number): number => {
    // Convert price back to slider value
    const minPrice = 0.1;
    const maxPrice = 100;
    const minLog = Math.log(minPrice);
    const maxLog = Math.log(maxPrice);
    const scale = (maxLog - minLog) / 100;
    
    return (Math.log(price) - minLog) / scale;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const price = logSliderToPrice(value);
    setCostPerKg(Number(price.toFixed(2)));
  };

  const formatBudget = (value: number): string => {
    return value >= 1000000000 
      ? `$${(value / 1000000000).toFixed(1)}B`
      : `$${(value / 1000000).toFixed(1)}M`;
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

  const handleBudgetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 100000000 && value <= 150000000000) {
      setAnnualBudget(value);
    }
  };

  const handleCostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 100) {
      setCostPerKg(Number(value.toFixed(2)));
    }
  };

  const parseBudgetInput = (input: string): number | null => {
    const match = input.trim().toUpperCase().match(/^(\d+\.?\d*)\s*(M|B|T)$/);
    if (!match) return null;

    const [_, number, unit] = match;
    const value = parseFloat(number);
    
    switch(unit) {
      case 'M': return value * 1000000;
      case 'B': return value * 1000000000;
      case 'T': return value * 1000000000000;
      default: return null;
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

  const handleBudgetTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseBudgetInput(e.target.value);
    if (parsed !== null && parsed >= 100000000 && parsed <= 1000000000000) {
      setAnnualBudget(parsed);
    }
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
                  right: 90,
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
                    offset: -40,
                    style: { fill: '#9CA3AF' }
                  }}
                  tickMargin={8}
                  tickFormatter={(value) => (value / 1000).toFixed(0)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ 
                    value: 'Total Accumulated Plastic (Million Tons)', 
                    angle: 90, 
                    position: 'outside',
                    offset: -40,
                    style: { fill: '#9CA3AF' }
                  }}
                  tickMargin={8}
                  dx={0}
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
                  dataKey="originalWastePerDay" 
                  name="Original Inflow"
                  stroke="#dc2626" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="netDailyChange" 
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
            )} As per The Ocean Cleanup 2024
          </li>
          <li>Pre-{startYear} accumulation is included in total figures</li>
          <li>Projections assume constant growth rates and cleanup costs</li>
          <li>This simulation does not account for the difference between the cost of removing plastic (Ocean plastic) and the cost of preventing it (River Plastic).</li>
          <li>Ocean plastic is 90%+ of the total plastic waste, and is 10x more expensive per kg to capture.</li>
        </ul>
      </div>
    </div>
  );
};

export default CleanupSimulator;