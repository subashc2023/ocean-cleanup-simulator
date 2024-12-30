import { DataPoint } from '@/lib/calculations';

export interface ChartConfig {
  lines: Array<{
    id: string;
    dataKey: string;
    name: string;
    stroke: string;
    yAxisId: string;
    strokeWidth: number;
    strokeDasharray?: string;
  }>;
  tooltipFormatters: {
    [key: string]: (value: number, payload: any, index: number, data: DataPoint[]) => string;
  };
}

export interface SimulatorChartProps {
  data: DataPoint[];
} 