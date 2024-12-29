import { Card, CardContent } from '@/components/ui/card';

interface NotesPanelProps {
  startYear: number;
  endYear: number;
}

export const NotesPanel = ({ startYear, endYear }: NotesPanelProps) => (
  <Card className="col-span-4 bg-gray-800 shadow-md rounded-xl border border-gray-700">
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
); 