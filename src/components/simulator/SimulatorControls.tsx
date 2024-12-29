import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PRODUCTION_START_YEAR, MAX_PROJECTION_YEAR } from '@/lib/constants';
import { logSliderToPrice } from '@/lib/calculations';
import { YearRangeSlider } from './YearRangeSlider';

interface SimulatorControlsProps {
  annualBudget: number;
  costPerKg: number;
  startYear: number;
  endYear: number;
  exchangeRate: number;
  isLoadingRate: boolean;
  onBudgetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBudgetSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBudgetTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYearChange: (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => void;
  formatBudget: (value: number) => string;
  logBudgetToSlider: (value: number) => number;
  priceToLogSlider: (value: number) => number;
  onYearRangeChange: (values: [number, number]) => void;
}

export const SimulatorControls = ({
  annualBudget,
  costPerKg,
  startYear,
  endYear,
  exchangeRate,
  isLoadingRate,
  onBudgetChange,
  onBudgetSliderChange,
  onBudgetTextChange,
  onCostChange,
  onYearChange,
  formatBudget,
  logBudgetToSlider,
  priceToLogSlider,
  onYearRangeChange
}: SimulatorControlsProps) => (
  <Card className="bg-gray-800 shadow-md rounded-none border border-gray-700">
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Annual Cleanup Budget: {formatBudget(annualBudget)}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={logBudgetToSlider(annualBudget)}
                onChange={onBudgetSliderChange}
                className="w-full bg-gray-800 text-white border-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={formatBudget(annualBudget)}
                onChange={onBudgetTextChange}
                placeholder="10B"
                className="w-24 bg-gray-800 text-white border-gray-700 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Cost per Kilogram: ${costPerKg.toFixed(2)} 
              {isLoadingRate ? (
                <span className="text-gray-400 text-xs ml-1">Loading EUR rate...</span>
              ) : (
                <span>(€{(costPerKg * exchangeRate).toFixed(2)})</span>
              )}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={priceToLogSlider(costPerKg)}
                onChange={(e) => {
                  const sliderValue = Number(e.target.value);
                  const newPrice = logSliderToPrice(sliderValue);
                  onCostChange({
                    ...e,
                    target: { ...e.target, value: newPrice.toString() }
                  });
                }}
                className="w-full bg-gray-800 text-white border-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={costPerKg}
                onChange={onCostChange}
                className="w-24 bg-gray-800 text-white border-gray-700 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Year Range
          </label>
          <YearRangeSlider
            startYear={startYear}
            endYear={endYear}
            onChange={onYearRangeChange}
          />
        </div>
      </div>
    </CardContent>
  </Card>
); 