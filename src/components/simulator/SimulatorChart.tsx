import type { SimulatorChartProps } from './types';
import { chartConfig } from './chart-config';
import { TEAM_SEAS_START, TEAM_SEAS_END } from '@/lib/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataIndex = data.findIndex(point => point.year === Number(label));
      
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {chartConfig.tooltipFormatters[entry.name](entry.value, entry, dataIndex, data)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => value.toString()}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Daily Inflow (tons/day)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => value.toLocaleString()}
            label={{ value: 'Total Plastic (million tons)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {chartConfig.lines.map((line) => (
            <Line
              key={line.id}
              type="monotone"
              {...line}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 