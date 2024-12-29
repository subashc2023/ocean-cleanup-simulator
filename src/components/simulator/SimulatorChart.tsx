import { ResponsiveLine } from '@nivo/line';
import { Card, CardContent } from '@/components/ui/card';
import { DataPoint } from '@/lib/calculations';

interface SimulatorChartProps {
  data: DataPoint[];
}

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  const chartData = [
    {
      id: "Original Inflow",
      data: data.map(d => ({ x: d.year, y: d.dailyInflow }))
    },
    {
      id: "Net Inflow with Cleanup",
      data: data.map(d => ({ x: d.year, y: d.netInflow }))
    },
    {
      id: "Original Total",
      data: data.map(d => ({ x: d.year, y: d.cumulativeNoCleanupMillionTons }))
    },
    {
      id: "New Total",
      data: data.map(d => ({ x: d.year, y: d.cumulativeMillionTons }))
    }
  ];

  return (
    <Card className="bg-[#1a1f2d] shadow-md rounded-none border border-gray-700">
      <CardContent className="p-0">
        <div className="h-[600px]">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 50, right: 110, bottom: 50, left: 110 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 0, max: 'auto' }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Year',
              legendOffset: 36,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Daily Plastic Flow (Thousands of Metric Tons/Day)',
              legendOffset: -90,
              legendPosition: 'middle',
              format: value => (value / 1000).toFixed(0)
            }}
            colors={['#dc2626', '#ea580c', '#2563eb', '#16a34a']}
            pointSize={0}
            lineWidth={2}
            enableGridX={false}
            enableGridY={true}
            enableArea={false}
            useMesh={true}
            theme={{
              axis: {
                legend: {
                  text: {
                    fill: '#9CA3AF',
                    fontSize: 12
                  }
                },
                ticks: {
                  text: {
                    fill: '#9CA3AF',
                    fontSize: 11
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#374151',
                  strokeDasharray: '3 3'
                }
              },
              legends: {
                text: {
                  fill: '#9CA3AF',
                  fontSize: 11
                }
              },
              tooltip: {
                container: {
                  background: '#1a1f2d',
                  color: '#9CA3AF',
                  fontSize: 12,
                  borderRadius: 0,
                  border: '1px solid #374151'
                }
              }
            }}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 140,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: 'circle'
              }
            ]}
            tooltip={({ point }) => {
              const value = point.data.y as number;
              const name = point.serieId;
              return (
                <div className="bg-[#1a1f2d] border border-gray-700 p-2">
                  <strong>{name}:</strong>{' '}
                  {name.includes('Total') 
                    ? `${value.toLocaleString()} million tons`
                    : `${value.toLocaleString()} tons/day`
                  }
                </div>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}; 