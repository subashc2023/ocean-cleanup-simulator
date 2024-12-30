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
        <li>Assumes that large scale cleanup efforts begin today</li>
        <li>The default rate of ~€5,300/Ton is As per The Ocean Cleanup 2024</li>
        <li>Projections assume constant growth rates and cleanup costs</li>
        <li>Economic benefits of cleanup or profits from selling recycled materials are not factored into costs</li>
        <li>Local infrastructure development costs not included</li>
        <li>Ocean cleanup is 10x more expensive than river interception by weight</li>
        <li>90%+ of the marine plastic is already in the oceans</li>
      </ul>
    </CardContent>
  </Card>
); 