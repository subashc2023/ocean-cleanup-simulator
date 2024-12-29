import { ChartConfig } from './types';

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
    'Original Total': (value: number) => `${value.toLocaleString()} million tons`,
    'New Total': (value: number) => `${value.toLocaleString()} million tons`,
    'Original Inflow': (value: number) => `${value.toLocaleString()} tons/day`,
    'Net Inflow with Cleanup': (value: number) => `${value.toLocaleString()} tons/day`
  }
}; 