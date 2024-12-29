import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { chartConfig } from './chart-config';
import type { ChartLine, SimulatorChartProps } from './types';
import { TEAM_SEAS_START, TEAM_SEAS_END } from '@/lib/constants';

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  const maxDailyFlow = Math.max(...data.map(d => d.dailyInflow));
  const leftAxisMax = Math.ceil(maxDailyFlow * 1.1 / 1000) * 1000;
  const rightAxisMax = Math.ceil(leftAxisMax * 365 / 1000000);

  // Create reference line data
  const teamSeasLine = {
    x1: TEAM_SEAS_START,
    x2: TEAM_SEAS_END,
    y: leftAxisMax * 0.95, // Position near top
    stroke: 'rgba(234, 179, 8, 0.5)', // yellow-500/50
    strokeWidth: 2
  };

  return (
    <div className="relative">
      {/* Left Y-axis label */}
      <div 
        className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-gray-300 text-sm whitespace-nowrap"
        style={{ marginLeft: '-40px' }}
      >
        Daily Plastic Flow (Thousands of Metric Tons/Day)
      </div>

      {/* Right Y-axis label */}
      <div 
        className="absolute -right-16 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 text-sm whitespace-nowrap"
        style={{ marginRight: '-20px' }}
      >
        Total Accumulated Plastic (Million Tons)
      </div>

      <Card className="bg-[#1a1f2d] shadow-md rounded-xl border border-gray-700">
        <CardContent className="p-0">
          <div className="h-[600px] rounded-xl overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 40, left: 40, bottom: 40 }}
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
                  tickFormatter={(value) => Math.round(value)}
                  allowDecimals={false}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, leftAxisMax]}
                  tickMargin={8}
                  tickFormatter={(value) => (value / 1000).toFixed(0)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, rightAxisMax]}
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
                
                <ReferenceLine
                  segment={[
                    { x: teamSeasLine.x1, y: teamSeasLine.y },
                    { x: teamSeasLine.x2, y: teamSeasLine.y }
                  ]}
                  stroke={teamSeasLine.stroke}
                  strokeWidth={teamSeasLine.strokeWidth}
                  yAxisId="left"
                />
                
                {chartConfig.lines.map((line: ChartLine)=> (
                  <Line key={line.id} {...line} type="monotone" />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 