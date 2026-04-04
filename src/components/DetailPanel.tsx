import { X, Shield, Calendar, User, MapPin } from 'lucide-react';
import type { Destination } from '@/types/destination';

function scoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-amber-500';
  return 'bg-red-500';
}

function trustBar(base: number, offset: number) {
  const val = Math.min(100, Math.max(20, base + offset));
  return val;
}

export default function DetailPanel({
  destination,
  safetySensitivity,
  departureCity,
  allDestinations,
  onClose,
  onSwitch,
}: {
  destination: Destination;
  safetySensitivity: number;
  departureCity: string;
  allDestinations: Destination[];
  onClose: () => void;
  onSwitch: (d: Destination) => void;
}) {
  const d = destination;
  const trustBars = [
    { label: 'Photo authenticity', offset: 3 },
    { label: 'Review pattern', offset: -5 },
    { label: 'Listing age', offset: 7 },
    { label: 'Cross-platform match', offset: -2 },
  ];

  const alternatives = allDestinations.filter(
    (x) => x.name !== d.name && x.trust_score >= 80
  ).slice(0, 2);

  const neighborhoodRating = d.trust_score > 85 ? 'Good' : d.trust_score > 70 ? 'Moderate' : 'Caution';
  const soloCommunity = d.trust_score > 79 ? 'Active community' : 'Limited community';
  const lateNight = d.trust_score > 74 ? 'Available' : 'Limited';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full z-50 bg-card shadow-xl overflow-y-auto w-full md:w-[60%] animate-in slide-in-from-right duration-300">
        <div className="p-6 space-y-6">
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-foreground pr-10">{d.name}</h2>
            <p className="text-sm text-muted-foreground">{d.region}</p>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-3">
            <div className={`${scoreColor(d.trust_score)} text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold`}>
              {d.trust_score}
            </div>
            <span className="font-medium text-foreground">{d.trust_label}</span>
          </div>

          <p className="italic text-muted-foreground">{d.tagline}</p>

          {/* Trust breakdown */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Why we trust this destination</h3>
            <div className="space-y-3">
              {trustBars.map((bar) => {
                const pct = trustBar(d.trust_score, bar.offset);
                return (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-44 shrink-0">{bar.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${scoreColor(d.trust_score)} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why you */}
          <div className="border-2 border-primary/30 rounded-xl p-4 flex items-start gap-3">
            <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{d.why_you}</p>
          </div>

          {/* Safety context */}
          {safetySensitivity >= 3 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Safety context for your trip</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Neighbourhood safety rating</span>
                  <span className="font-medium text-foreground">{neighborhoodRating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solo traveler community</span>
                  <span className="font-medium text-foreground">{soloCommunity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late night transport</span>
                  <span className="font-medium text-foreground">{lateNight}</span>
                </div>
              </div>
            </div>
          )}

          {/* Best months */}
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">Best months:</span> {d.best_months}
          </div>

          {/* Cost */}
          <div>
            <p className="text-2xl font-bold text-primary">{d.estimated_cost}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Includes approx. travel from {departureCity} + accommodation + daily spend
            </p>
          </div>

          {/* How to get there */}
          {d.trip_context && (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">How to get there:</span> {d.trip_context}
            </div>
          )}

          {/* Alternatives */}
          {d.trust_score < 80 && alternatives.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Not fully verified? Try these instead</h3>
              <div className="grid gap-3">
                {alternatives.map((alt) => (
                  <div key={alt.name} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card">
                    <div className="flex items-center gap-3">
                      <div className={`${scoreColor(alt.trust_score)} text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold`}>
                        {alt.trust_score}
                      </div>
                      <span className="font-medium text-foreground">{alt.name}</span>
                    </div>
                    <button onClick={() => onSwitch(alt)} className="text-sm font-semibold text-primary hover:underline">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
