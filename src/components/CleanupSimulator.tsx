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
  const [costPerKg, setCostPerKg] = useState(3.5);
  const [startYear, setStartYear] = useState(1991);
  const [endYear, setEndYear] = useState(2035);
  const [data, setData] = useState([]);
  const [zeroYear, setZeroYear] = useState(null);
  
  // Constants
  const PRODUCTION_START_YEAR = 1950;
  const CLEANUP_START_YEAR = 2024;
  const MAX_PROJECTION_YEAR = 2100;
  
  // Calculate daily waste production based on historical growth patterns
  const calculateWastePerDay = (year) => {
    const baseProduction = 2; // Million metric tons in 1950
    const growthRate = 0.0743; // Historical growth rate
    const wasteRate = 0.02 + (year - 1950) * 0.0001; // Increasing waste rate
    
    const totalProduction = baseProduction * Math.exp(growthRate * (year - 1950));
    return (totalProduction * wasteRate * 1000000) / 365;
  };

  // Calculate accumulated waste up to a given year
  const calculateHistoricalAccumulation = (upToYear) => {
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
  const calculateZeroYear = (latestData) => {
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

  const formatBudget = (value) => {
    return value >= 1000000000 
      ? `$${(value / 1000000000).toFixed(1)}B`
      : `$${(value / 1000000).toFixed(1)}M`;
  };

  const handleCostChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCostPerKg(value);
    }
  };

  const handleYearChange = (type, e) => {
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Plastic Waste Cleanup Simulator</h1>
        <p className="text-gray-600">
          Explore scenarios for global plastic waste cleanup efforts based on different budget allocations and cost assumptions.
        </p>
      </div>

      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Cleanup Budget: {formatBudget(annualBudget)}
                </label>
                <input
                  type="range"
                  min="100000000"
                  max="150000000000"
                  step="100000000"
                  value={annualBudget}
                  onChange={(e) => setAnnualBudget(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per Kilogram ($)
                </label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={costPerKg}
                  onChange={handleCostChange}
                  className="w-full"
                />
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">Pre-{startYear} Accumulation</div>
                <div className="mt-1 text-gray-700">{Math.round(initialAccumulation).toLocaleString()} M tons</div>
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

      <Card className="bg-white shadow-md">
        <CardContent className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Year', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Daily Change (Metric Tons)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Total Accumulation (Million Tons)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    switch(name) {
                      case "Original Total":
                      case "New Total":
                        return `${value.toLocaleString()} million tons`;
                      default:
                        return `${value.toLocaleString()} tons/day`;
                    }
                  }}
                />
                <Legend />
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

      <div className="text-sm text-gray-600 space-y-2">
        <h3 className="font-medium text-gray-900">Notes & Assumptions:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Plastic production and waste tracking starts from {PRODUCTION_START_YEAR}</li>
          <li>Graph shows data from {startYear} to {endYear}</li>
          <li>Cleanup efforts begin in {CLEANUP_START_YEAR}</li>
          <li>Current cost per metric ton: ${(costPerKg * 1000).toLocaleString()}</li>
          <li>Pre-{startYear} accumulation is included in total figures</li>
          <li>Projections assume constant growth rates and cleanup costs</li>
        </ul>
      </div>
    </div>
  );
};

export default CleanupSimulator;