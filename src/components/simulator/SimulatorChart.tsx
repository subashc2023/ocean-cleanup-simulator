import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { DataPoint } from '@/lib/calculations';

interface SimulatorChartProps {
  data: DataPoint[];
}

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  // Calculate appropriate domains for both axes to maintain scale relationship
  const maxDailyFlow = Math.max(...data.map(d => Math.max(d.dailyInflow, d.netInflow)));
  const maxTotal = Math.max(...data.map(d => 
    Math.max(d.cumulativeMillionTons, d.cumulativeNoCleanupMillionTons)
  ));
  
  // We want the daily flow (left axis) and accumulated total (right axis) to maintain
  // a visual relationship where:
  // 1 year of flow at X tons/day = X * 365 / 1000000 million tons accumulated
  // So we'll set the domains with this ratio
  const leftAxisMax = Math.ceil(maxDailyFlow / 10000) * 10000; // Round to nearest 10k
  const rightAxisMax = Math.ceil(maxTotal / 100) * 100; // Round to nearest 100M

  return (
    <Card className="bg-[#1a1f2d] shadow-md rounded-none border border-gray-700">
      <CardContent className="p-0">
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 90,
                left: 90,
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
                dataKey="dailyInflow" 
                name="Original Inflow"
                stroke="#dc2626" 
                strokeWidth={2}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="netInflow" 
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
  );
}; 