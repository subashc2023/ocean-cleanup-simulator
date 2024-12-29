import { ResponsiveLine } from '@nivo/line';
import { Card, CardContent } from '@/components/ui/card';
import { DataPoint } from '@/lib/calculations';

interface SimulatorChartProps {
  data: DataPoint[];
}

export const SimulatorChart = ({ data }: SimulatorChartProps) => {
  // Transform data for Nivo format
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
            margin={{ top: 50, right: 110, bottom: 50, left: 80 }}
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
              legendOffset: -60,
              legendPosition: 'middle'
            }}
            colors={{ scheme: 'category10' }}
            pointSize={0}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
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
                  strokeWidth: 1
                }
              },
              legends: {
                text: {
                  fill: '#9CA3AF',
                  fontSize: 11
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}; 