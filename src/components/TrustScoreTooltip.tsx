import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function TrustScoreTooltip() {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted-foreground/20 transition-colors shrink-0"
            aria-label="Trust score info"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[220px] bg-foreground text-background text-xs leading-relaxed px-3 py-2"
        >
          Scored across photo authenticity, review patterns, listing age, and cross-platform consistency.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
