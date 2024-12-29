import { DataPoint } from '@/lib/calculations';

export interface ChartLine {
  id: string;
  dataKey: keyof DataPoint;
  name: string;
  stroke: string;
  yAxisId: 'left' | 'right';
  strokeWidth: number;
  strokeDasharray?: string;
}

export interface ChartConfig {
  lines: ChartLine[];
  tooltipFormatters: Record<string, (value: number) => string>;
}

export interface SimulatorChartProps {
  data: DataPoint[];
} 