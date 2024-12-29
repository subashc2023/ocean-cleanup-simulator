import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { chartConfig } from './chart-config';
import type { ChartLine, SimulatorChartProps } from './types';
import { 
  TEAM_SEAS_START, 
  TEAM_SEAS_END, 
  TEAM_SEAS_TOTAL_TONS,
  TEAM_SEAS_DAILY_RATE 
} from '@/lib/constants';

// Custom tooltip that shows both regular data and Team Seas info
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="flex gap-4">
      {/* Regular data tooltip */}
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <h3 className="font-medium text-white mb-2">{label}</h3>
        <div className="space-y-1 text-sm text-gray-300">
          {payload.map((entry: any) => (
            <p key={entry.name}>
              {entry.name}: {
                chartConfig.tooltipFormatters[entry.name]?.(entry.value) 
                ?? entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      </div>

      {/* Team Seas stats */}
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <h3 className="font-medium text-white mb-2">Team Seas</h3>
        <div className="space-y-1 text-sm text-gray-300">
          <p>MrBeast and Mark Rober</p>
          <p>$33.79 Million</p>
          <p>{(TEAM_SEAS_TOTAL_TONS * 2204.62).toLocaleString()} lbs of trash</p>
          <p>{(TEAM_SEAS_TOTAL_TONS * 1000).toLocaleString()} KG</p>
          <p>{TEAM_SEAS_TOTAL_TONS.toLocaleString()} Tons over {Math.round((TEAM_SEAS_END - TEAM_SEAS_START) * 365)} days</p>
          <p>{TEAM_SEAS_DAILY_RATE.toFixed(3)} tons per day</p>
        </div>
      </div>
    </div>
  );
};

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  const maxDailyFlow = Math.max(...data.map(d => d.dailyInflow));
  const leftAxisMax = Math.ceil(maxDailyFlow * 1.1 / 1000) * 1000;
  const rightAxisMax = Math.ceil(leftAxisMax * 365 / 1000000);

  // Create Team Seas overlay data
  const teamSeasData = data.map(d => ({
    ...d,
    teamSeasLine: d.year >= TEAM_SEAS_START && d.year <= TEAM_SEAS_END ? leftAxisMax * 0.9 : null
  }));

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
                data={teamSeasData}
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

                {/* Team Seas indicator line */}
                <Line
                  yAxisId="left"
                  type="step"
                  dataKey="teamSeasLine"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={false}
                  name="Team Seas"
                  label={<CustomTooltip />}
                />

                <Tooltip 
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: 'transparent',
                    border: 'none'
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
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 