import { 
  PRODUCTION_START_YEAR, 
  CLEANUP_START_YEAR,
  TEAM_SEAS_START,
  TEAM_SEAS_END,
  TEAM_SEAS_TOTAL_TONS
} from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';

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
  <div className="grid grid-cols-9 gap-6 text-sm">
    <Card className="col-span-4 bg-gray-800 shadow-md rounded-none border border-gray-700">
      <CardContent className="p-6">
        <h3 className="font-medium text-white mb-4">Notes & Assumptions:</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-300">
          <li>Graph shows data from 1950 to 2100</li>
          <li>Large scale cleanup efforts begin RIGHT NOW</li>
          <li>The default rate of ~5,300 Euros/Ton is As per The Ocean Cleanup 2024</li>
          <li>Pre-2025 accumulation is included in total figures</li>
          <li>Projections assume constant growth rates and cleanup costs</li>
          <li>Economic benefits of cleanup or profits from selling recycled materials are not factored into costs</li>
          <li>Local infrastructure development costs not included</li>
        </ul>
      </CardContent>
    </Card>

    <Card className="col-span-1 bg-gray-800 shadow-md rounded-none border border-gray-700">
      <CardContent className="p-1">
        <div className="flex flex-col h-[600px]">
          {[
            { name: 'Philippines', percent: 35.2, color: 'bg-[#8B0000]' },  // Dark red
            { name: 'India', percent: 12.5, color: 'bg-[#4B0082]' },        // Indigo
            { name: 'Malaysia', percent: 7.2, color: 'bg-[#006400]' },      // Dark green
            { name: 'China', percent: 7.0, color: 'bg-[#800000]' },         // Maroon
            { name: 'Indonesia', percent: 5.6, color: 'bg-[#000080]' },     // Navy
            { name: 'Myanmar', percent: 3.9, color: 'bg-[#3B0D11]' },       // Dark burgundy
            { name: 'Brazil', percent: 3.7, color: 'bg-[#004040]' },        // Dark teal
            { name: 'Vietnam', percent: 2.8, color: 'bg-[#1A0F3C]' },       // Dark purple
            { name: 'Bangladesh', percent: 2.4, color: 'bg-[#2F4F4F]' },    // Dark slate gray
            { name: 'Thailand', percent: 2.3, color: 'bg-[#2D0922]' },      // Dark magenta
            { name: 'Rest of World', percent: 17.4, color: 'bg-[#1C1C1C]' } // Very dark gray
          ].map((country) => (
            <div
              key={country.name}
              className={`${country.color} relative hover:brightness-110 transition-all`}
              style={{ height: `${country.percent}%` }}
            >
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-gray-100 text-xs text-center font-medium">
                {country.name} ({country.percent}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card className="col-span-4 bg-gray-800 shadow-md rounded-none border border-gray-700">
      <CardContent className="p-6">
        <h3 className="font-medium text-white mb-4">Key Conclusions:</h3>
        <div className="space-y-4 text-gray-300">
          <div>
            <h4 className="text-white font-medium mb-2">Strategic Insights:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>A Penny of Prevention is worth a Pound of Cure</li>
              <li>Ocean Cleanup is 10x more expensive than River Interception by weight</li>
              <li>Top 3 countries account for 55% of river plastic output</li>
              <li>Regional cooperation could dramatically improve efficiency</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Cost-Effective Prevention and Cures:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>$250M/year could handle Philippines' river output</li>
              <li>$500M/year could handle Philippines + India</li>
              <li>$1B/year could handle all major Asian river systems</li>
              
              <li>At current costs, it will take $35B a year to handle every single source of plastic to the oceans</li>

              <li>At current costs, it will take $25B One Time to clean every single major garbage patch</li>
              <li>At current costs, it will take $1.5-3 Trillion to clean every single piece of plastic in the ocean</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
); 