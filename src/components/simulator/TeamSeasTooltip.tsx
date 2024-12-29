import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  TEAM_SEAS_COST, 
  TEAM_SEAS_POUNDS, 
  TEAM_SEAS_TONS, 
  TEAM_SEAS_DAILY_RATE,
  TEAM_SEAS_START,
  TEAM_SEAS_END
} from '@/lib/constants';

export const TeamSeasTooltip = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <Image
            src="/mrbeast.jpg"
            alt="Team Seas Info"
            width={32}
            height={32}
            className="hover:opacity-80 transition-opacity"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-800 border border-gray-700 p-4 max-w-xs">
        <h3 className="font-medium text-white mb-2">Team Seas Impact</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>Duration: {TEAM_SEAS_START} - {TEAM_SEAS_END}</li>
          <li>Total Cost: ${TEAM_SEAS_COST.toLocaleString()}</li>
          <li>Removed: {Math.round(TEAM_SEAS_POUNDS).toLocaleString()} lbs</li>
          <li>({Math.round(TEAM_SEAS_TONS).toLocaleString()} metric tons)</li>
          <li>Daily Rate: {Math.round(TEAM_SEAS_DAILY_RATE).toLocaleString()} tons/day</li>
        </ul>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
); 