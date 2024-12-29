import { Card, CardContent } from '@/components/ui/card';
import { COUNTRY_DATA } from '@/lib/constants/countries';

export const CountryVisualization = () => (
  <Card className="col-span-1 bg-gray-800 shadow-md rounded-none border border-gray-700">
    <CardContent className="p-1">
      <div className="flex flex-col h-[600px]">
        {COUNTRY_DATA.map((country) => (
          <div
            key={country.name}
            className={`bg-[${country.color}] relative hover:brightness-110 transition-all`}
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
); 