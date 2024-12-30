import { ChartConfig } from './types';
import { DataPoint } from '@/lib/calculations';

// Calculate rate of change from previous point to current point
const calculateSlope = (data: DataPoint[], index: number, key: keyof DataPoint): number => {
  if (index <= 0) return 0;
  
  const currentValue = data[index][key] as number;
  const prevValue = data[index - 1][key] as number;
  const currentYear = data[index].year;
  const prevYear = data[index - 1].year;
  
  // Rate of change from previous to current point
  return currentValue - prevValue;
};

// Format slope with correct sign
const formatSlope = (slope: number): string => {
  return slope >= 0 ? `+${slope.toFixed(1)}` : slope.toFixed(1);
};

export const chartConfig: ChartConfig = {
  lines: [
    {
      id: 'dailyInflow',
      dataKey: 'dailyInflow',
      name: 'Original Inflow',
      stroke: '#dc2626',
      yAxisId: 'left',
      strokeWidth: 2
    },
    {
      id: 'netInflow',
      dataKey: 'netInflow',
      name: 'Net Inflow with Cleanup',
      stroke: '#ea580c',
      yAxisId: 'left',
      strokeWidth: 2,
      strokeDasharray: '5 5'
    },
    {
      id: 'originalTotal',
      dataKey: 'cumulativeNoCleanupMillionTons',
      name: 'Original Total',
      stroke: '#2563eb',
      yAxisId: 'right',
      strokeWidth: 2
    },
    {
      id: 'newTotal',
      dataKey: 'cumulativeMillionTons',
      name: 'New Total',
      stroke: '#16a34a',
      yAxisId: 'right',
      strokeWidth: 2,
      strokeDasharray: '5 5'
    }
  ],
  tooltipFormatters: {
    'Original Total': (value: number, payload: any, index: number, data: DataPoint[]) => {
      const slope = calculateSlope(data, index, 'cumulativeNoCleanupMillionTons');
      return `${value.toLocaleString()} million tons [${formatSlope(slope)}]`;
    },
    'New Total': (value: number, payload: any, index: number, data: DataPoint[]) => {
      const slope = calculateSlope(data, index, 'cumulativeMillionTons');
      return `${value.toLocaleString()} million tons [${formatSlope(slope)}]`;
    },
    'Original Inflow': (value: number, payload: any, index: number, data: DataPoint[]) => {
      const slope = calculateSlope(data, index, 'dailyInflow');
      return `${value.toLocaleString()} tons/day [${formatSlope(slope)}]`;
    },
    'Net Inflow with Cleanup': (value: number, payload: any, index: number, data: DataPoint[]) => {
      const slope = calculateSlope(data, index, 'netInflow');
      return `${value.toFixed(0).toLocaleString()} tons/day [${formatSlope(slope)}]`;
    }
  }
}; 