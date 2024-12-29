import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PRODUCTION_START_YEAR, MAX_PROJECTION_YEAR } from '@/lib/constants';
import { logSliderToPrice } from '@/lib/calculations';
import { RangeSlider } from '@/components/ui/range-slider';

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
  onYearRangeChange: (values: number[]) => void;
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
  <Card className="bg-gray-800 shadow-md rounded-xl border border-gray-700">
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
                className="w-full bg-gray-800 text-white border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={formatBudget(annualBudget)}
                onChange={onBudgetTextChange}
                placeholder="10B"
                className="w-24 bg-gray-800 text-white border-gray-700 rounded-lg px-2 py-1 text-sm"
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
                  const newPrice = Number(logSliderToPrice(sliderValue).toFixed(2));
                  onCostChange({
                    ...e,
                    target: { ...e.target, value: newPrice.toString() }
                  });
                }}
                className="w-full bg-gray-800 text-white border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.01"
                value={costPerKg.toFixed(2)}
                onChange={(e) => {
                  const value = Number(Number(e.target.value).toFixed(2));
                  if (!isNaN(value) && value >= 0.1 && value <= 100) {
                    onCostChange({
                      ...e,
                      target: { ...e.target, value: value.toString() }
                    });
                  }
                }}
                className="w-24 bg-gray-800 text-white border-gray-700 rounded-lg px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-200">
              Year Range: {startYear} - {endYear}
            </label>
            <span className="text-xs text-gray-400">
              min: {PRODUCTION_START_YEAR}, max: {MAX_PROJECTION_YEAR}
            </span>
          </div>
          <RangeSlider
            min={PRODUCTION_START_YEAR}
            max={MAX_PROJECTION_YEAR}
            step={1}
            value={[startYear, endYear]}
            onValueChange={onYearRangeChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{PRODUCTION_START_YEAR}</span>
            <span>{MAX_PROJECTION_YEAR}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
); 