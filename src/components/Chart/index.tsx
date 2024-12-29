import { ChartContainer } from './ChartContainer';
import { ChartAxes } from './ChartAxes';
import { ChartLines } from './ChartLines';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';

export const Chart = ({ data, ...props }) => {
  return (
    <ChartContainer>
      <ChartAxes />
      <ChartLines />
      <ChartTooltip />
      <ChartLegend />
    </ChartContainer>
  );
}; 