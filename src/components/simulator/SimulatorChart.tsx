import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { chartConfig } from './chart-config';
import type { ChartLine, SimulatorChartProps } from './types';
import { format } from 'date-fns';

const TEAM_SEAS_INFO = {
  startDate: new Date('2021-10-29'),
  endDate: new Date('2024-07-16'),
  budget: 33790000,
  poundsCollected: 34080191,
  kgCollected: 15460000,
  tonsCollected: 17041,
  daysActive: 992,
  dailyRate: 17.178
};

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
                
                {chartConfig.lines.map((line: ChartLine)=> (
                  <Line key={line.id} {...line} type="monotone" />
                ))}

                {/* Team Seas Reference Line */}
                <Line
                  type="linear"
                  dataKey="year"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  name="Team Seas Period"
                  data={[
                    { year: TEAM_SEAS_INFO.startDate.getFullYear() + 
                      TEAM_SEAS_INFO.startDate.getMonth() / 12 },
                    { year: TEAM_SEAS_INFO.endDate.getFullYear() + 
                      TEAM_SEAS_INFO.endDate.getMonth() / 12 }
                  ]}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;

                    // Check if hovering over Team Seas line
                    const isTeamSeas = payload.some(p => p.name === "Team Seas Period");

                    return (
                      <div className="flex gap-2">
                        {/* Regular tooltip */}
                        <div className="bg-[#1a1f2d] border border-gray-700 p-3 rounded shadow">
                          <p className="text-gray-300 mb-1">Year: {label}</p>
                          {payload.filter(p => p.name !== "Team Seas Period").map((entry, i) => (
                            <p key={i} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {entry.value.toLocaleString()}
                            </p>
                          ))}
                        </div>

                        {/* Team Seas info box */}
                        {isTeamSeas && (
                          <div className="bg-[#1a1f2d] border border-gray-700 p-3 rounded shadow">
                            <p className="text-green-500 font-medium mb-2">Team Seas</p>
                            <p className="text-gray-300 text-sm mb-1">MrBeast and Mark Rober</p>
                            <p className="text-gray-300 text-sm mb-1">
                              {format(TEAM_SEAS_INFO.startDate, 'MMM d, yyyy')} – 
                              {format(TEAM_SEAS_INFO.endDate, 'MMM d, yyyy')}
                            </p>
                            <p className="text-gray-300 text-sm mb-1">
                              ${(TEAM_SEAS_INFO.budget / 1000000).toFixed(2)} Million
                            </p>
                            <p className="text-gray-300 text-sm mb-1">
                              {TEAM_SEAS_INFO.poundsCollected.toLocaleString()} lbs of trash
                            </p>
                            <p className="text-gray-300 text-sm mb-1">
                              {TEAM_SEAS_INFO.kgCollected.toLocaleString()} KG
                            </p>
                            <p className="text-gray-300 text-sm mb-1">
                              {TEAM_SEAS_INFO.tonsCollected.toLocaleString()} Tons over {TEAM_SEAS_INFO.daysActive} days
                            </p>
                            <p className="text-gray-300 text-sm">
                              {TEAM_SEAS_INFO.dailyRate} tons per day
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }}
                  contentStyle={{
                    backgroundColor: 'transparent',
                    border: 'none'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 