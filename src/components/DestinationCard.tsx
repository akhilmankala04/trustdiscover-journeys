import { Shield, MapPin } from 'lucide-react';
import type { Destination } from '@/types/destination';

function scoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function DestinationCard({
  destination,
  onDetails,
}: {
  destination: Destination;
  onDetails: () => void;
}) {
  const d = destination;
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{d.name}</h3>
        <p className="text-sm text-muted-foreground">{d.tagline}</p>
      </div>

      {/* Trust Score Badge */}
      <div className="flex items-center gap-3">
        <div className={`${scoreColor(d.trust_score)} text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold shrink-0`}>
          {d.trust_score}
        </div>
        <span className="text-sm font-medium text-foreground">{d.trust_label}</span>
      </div>

      {/* Safety signal */}
      <p className="text-xs italic text-muted-foreground flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-primary" />
        {d.top_safety_signal}
      </p>

      {/* Cost */}
      <p className="text-sm font-semibold text-primary">{d.estimated_cost}</p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
          {d.budget_match}
        </span>
        <button
          onClick={onDetails}
          className="text-sm font-semibold text-primary hover:underline"
        >
          See details
        </button>
      </div>
    </div>
  );
}
