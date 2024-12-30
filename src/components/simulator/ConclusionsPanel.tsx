import { Card, CardContent } from '@/components/ui/card';

export const ConclusionsPanel = () => (
  <Card className="col-span-4 bg-gray-800 shadow-md rounded-xl border border-gray-700">
    <CardContent className="p-6">
      <h3 className="font-medium text-white mb-4">Key Conclusions:</h3>
      <div className="space-y-4 text-gray-300">
        <div>
          <h4 className="text-white font-medium mb-2">Strategic Insights:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>A Penny of Prevention is worth a Pound of Cure</li>
            <li>Top 3 countries account for 55% of river plastic output</li>
            <li>Regional cooperation could dramatically improve efficiency, but is unlikely, and so the simulation assumes uniform global distribution of effort</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-2">Cost-Effective Prevention and Cures:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Concentrated efforts are insanely effective, but unrealistic</li>
            <li>A single river system in the Philippines, the Pahang Basin,  accounts for 6% of global inflows</li>
            <li>Distributed efforts are more realistic, but less effective</li>
            <li>At current costs, it will take $70B a year to handle almost every single source of plastic to the oceans</li>
            <li>At current costs, it will take $50B One Time to clean every single major garbage patch</li>
            <li>At current costs, it will take $1.5-3 Trillion to clean every single piece of plastic in the ocean</li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
); 