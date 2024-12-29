import { NotesPanel } from './NotesPanel';
import { CountryVisualization } from './CountryVisualization';
import { ConclusionsPanel } from './ConclusionsPanel';

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
    <NotesPanel startYear={startYear} endYear={endYear} />
    <CountryVisualization />
    <ConclusionsPanel />
  </div>
); 