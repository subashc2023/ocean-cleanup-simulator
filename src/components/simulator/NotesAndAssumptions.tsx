import { 
  PRODUCTION_START_YEAR, 
  CLEANUP_START_YEAR 
} from '@/lib/constants';

interface NotesProps {
  startYear: number;
  endYear: number;
  costPerKg: number;
  exchangeRate: number;
  isLoadingRate: boolean;
}

export const NotesAndAssumptions = ({
  startYear,
  endYear,
  costPerKg,
  exchangeRate,
  isLoadingRate
}: NotesProps) => (
  <div className="text-sm text-gray-300 space-y-2">
    <h3 className="font-medium text-white">Notes & Assumptions:</h3>
    <ul className="list-disc pl-5 space-y-1">
      <li>Plastic production and waste tracking starts from {PRODUCTION_START_YEAR}</li>
      <li>Graph shows data from {startYear} to {endYear}</li>
      <li>Cleanup efforts begin in {CLEANUP_START_YEAR}</li>
      <li>
        Current cost per metric ton: ${(costPerKg * 1000).toLocaleString()} / 
        {isLoadingRate ? (
          <span className="text-gray-400">Loading EUR...</span>
        ) : (
          `€${(costPerKg * 1000 * exchangeRate).toLocaleString()}`
        )} The default rate of ~5,300 Euros/Ton is As per The Ocean Cleanup 2024
      </li>
      <li>Pre-{startYear} accumulation is included in total figures</li>
      <li>Projections assume constant growth rates and cleanup costs</li>
      <li>This simulation does not account for the difference between the cost of removing plastic(Ocean plastic) and the cost of preventing it(River Plastic).</li>
      <li>Ocean plastic is 90%+ of the total plastic waste, and is 10x more expensive per kg to capture.</li>
      <li>The biggest assumption made is that Rivers are the only source of plastic. If this is not the case, the simulation is too optimistic</li>
    </ul>
  </div>
); 