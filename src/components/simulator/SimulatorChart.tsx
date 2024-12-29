import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { chartConfig } from './chart-config';
import type { SimulatorChartProps } from './types';

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  const maxDailyFlow = Math.max(...data.map(d => d.dailyInflow));
  const leftAxisMax = Math.ceil(maxDailyFlow * 1.1 / 1000) * 1000;
  const rightAxisMax = Math.ceil(leftAxisMax * 365 / 1000000);

  return (
    <Card className="bg-[#1a1f2d] shadow-md rounded-none border border-gray-700">
      <CardContent className="p-0">
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 90, left: 90, bottom: 40 }}
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
                domain={[0, leftAxisMax]}
                label={{ 
                  value: 'Daily Plastic Flow (Thousands of Metric Tons/Day)', 
                  angle: -90, 
                  position: 'outside',
                  offset: 20,
                  style: { fill: '#9CA3AF' }
                }}
                tickMargin={8}
                tickFormatter={(value) => (value / 1000).toFixed(0)}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, rightAxisMax]}
                label={{ 
                  value: 'Total Accumulated Plastic (Million Tons)', 
                  angle: 90, 
                  position: 'outside',
                  offset: 20,
                  style: { fill: '#9CA3AF' }
                }}
                tickMargin={8}
              />
              
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const formatter = chartConfig.tooltipFormatters[name as keyof typeof chartConfig.tooltipFormatters];
                  return formatter ? formatter(value) : value.toLocaleString();
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
              
              {chartConfig.lines.map(line => (
                <Line key={line.id} {...line} type="monotone" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 