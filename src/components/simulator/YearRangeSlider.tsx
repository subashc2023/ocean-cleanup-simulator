import * as Slider from '@radix-ui/react-slider';
import { PRODUCTION_START_YEAR, MAX_PROJECTION_YEAR } from '@/lib/constants';

interface YearRangeSliderProps {
  startYear: number;
  endYear: number;
  onChange: (values: [number, number]) => void;
}

export const YearRangeSlider = ({ startYear, endYear, onChange }: YearRangeSliderProps) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm text-gray-300">
      <span>{startYear}</span>
      <span>{endYear}</span>
    </div>
    <Slider.Root
      className="relative flex items-center w-full h-5 select-none touch-none"
      value={[startYear, endYear]}
      min={PRODUCTION_START_YEAR}
      max={MAX_PROJECTION_YEAR}
      step={1}
      minStepsBetweenThumbs={1}
      onValueChange={onChange}
    >
      <Slider.Track className="bg-gray-700 relative grow rounded-full h-[3px]">
        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-5 h-5 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Start year"
      />
      <Slider.Thumb
        className="block w-5 h-5 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="End year"
      />
    </Slider.Root>
    <div className="flex justify-between text-xs text-gray-400">
      <span>min: {PRODUCTION_START_YEAR}</span>
      <span>max: {MAX_PROJECTION_YEAR}</span>
    </div>
  </div>
); 