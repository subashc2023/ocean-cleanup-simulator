import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { chartConfig } from './chart-config';
import type { ChartLine, SimulatorChartProps } from './types';
import { TEAM_SEAS_START, TEAM_SEAS_END, TEAM_SEAS_TOTAL_TONS, TEAM_SEAS_DAILY_RATE } from '@/lib/constants';

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  const maxDailyFlow = Math.max(...data.map(d => d.dailyInflow));
  const leftAxisMax = Math.ceil(maxDailyFlow * 1.1 / 1000) * 1000;
  const rightAxisMax = Math.ceil(leftAxisMax * 365 / 1000000);

  return (
    <div className="relative">
      {/* Left Y-axis label */}
      <div 
        className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-gray-300 text-sm whitespace-nowrap"
        style={{ marginLeft: '-20px' }}
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

      <Card className="bg-[#1a1f2d] shadow-md rounded-none border border-gray-700">
        <CardContent className="p-0">
          <div className="h-[600px]">
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
                
                {/* Team Seas Reference Area */}
                <ReferenceLine
                  x={TEAM_SEAS_START}
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: 'Team Seas Start',
                    fill: '#10B981',
                    fontSize: 12,
                    position: 'top'
                  }}
                />
                <ReferenceLine
                  x={TEAM_SEAS_END}
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: 'Team Seas End',
                    fill: '#10B981',
                    fontSize: 12,
                    position: 'top'
                  }}
                />
                
                {/* Team Seas Horizontal Line */}
                <ReferenceLine
                  y={TEAM_SEAS_DAILY_RATE}
                  stroke="#10B981"
                  strokeWidth={2}
                  segment={[
                    { x: TEAM_SEAS_START },
                    { x: TEAM_SEAS_END }
                  ]}
                  label={{
                    value: `${TEAM_SEAS_DAILY_RATE.toFixed(1)} tons/day`,
                    fill: '#10B981',
                    fontSize: 12,
                    position: 'right'
                  }}
                />

                {/* Custom Tooltip */}
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Team Seas') {
                      return [
                        <div key="tooltip" className="space-y-1">
                          <p>MrBeast and Mark Rober</p>
                          <p>Total: {TEAM_SEAS_TOTAL_TONS.toLocaleString()} tons</p>
                          <p>Duration: {Math.round((TEAM_SEAS_END - TEAM_SEAS_START) * 365)} days</p>
                          <p>Daily: {TEAM_SEAS_DAILY_RATE.toFixed(3)} tons/day</p>
                          <p>Cost: $33.79M</p>
                        </div>,
                        'Team Seas'
                      ];
                    }
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
                
                {chartConfig.lines.map((line: ChartLine) => (
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