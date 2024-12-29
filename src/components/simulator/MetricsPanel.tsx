interface MetricsPanelProps {
  initialAccumulation: number;
  startYear: number;
  annualBudget: number;
  costPerKg: number;
  endYear: number;
  reductionPercent: string | number;
  zeroYear: number | null;
}

export const MetricsPanel = ({
  initialAccumulation,
  startYear,
  annualBudget,
  costPerKg,
  endYear,
  reductionPercent,
  zeroYear
}: MetricsPanelProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
    <div className="p-4 bg-gray-900 rounded-lg">
      <div className="font-medium text-gray-200">Pre-{startYear} Accumulation</div>
      <div className="mt-1 text-gray-300">{Math.round(initialAccumulation).toLocaleString()} M tons</div>
    </div>
    <div className="p-4 bg-gray-900 rounded-lg">
      <div className="font-medium text-gray-200">Daily Removal Capacity</div>
      <div className="mt-1 text-gray-300">
        {Math.round(annualBudget / (costPerKg * 1000) / 365).toLocaleString()} tons/day
      </div>
    </div>
    <div className="p-4 bg-gray-900 rounded-lg">
      <div className="font-medium text-gray-200">Projected Reduction by {endYear}</div>
      <div className="mt-1 text-gray-300">{reductionPercent}%</div>
    </div>
    <div className="p-4 bg-gray-900 rounded-lg">
      <div className="font-medium text-gray-200">Zero Total Waste Year</div>
      <div className="mt-1 text-gray-300">
        {zeroYear ? zeroYear : 'Not reached by 2200'}
      </div>
    </div>
  </div>
); 