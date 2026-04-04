import { X, Shield, Calendar, User, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Destination } from '@/types/destination';
import TrustScoreTooltip from '@/components/TrustScoreTooltip';

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
  onNavigate,
  currentIndex,
  totalCount,
}: {
  destination: Destination;
  safetySensitivity: number;
  departureCity: string;
  allDestinations: Destination[];
  onClose: () => void;
  onSwitch: (d: Destination) => void;
  onNavigate: (index: number) => void;
  currentIndex: number;
  totalCount: number;
}) {
  const d = destination;
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (slideDir) {
      setAnimating(true);
      const t = setTimeout(() => {
        setAnimating(false);
        setSlideDir(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [slideDir, destination]);

  const goNext = () => {
    if (currentIndex < totalCount - 1) {
      setSlideDir('left');
      onNavigate(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setSlideDir('right');
      onNavigate(currentIndex - 1);
    }
  };

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

  const slideClass = animating
    ? slideDir === 'left'
      ? 'animate-fade-in'
      : 'animate-fade-in'
    : '';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full z-50 bg-card shadow-xl overflow-y-auto w-full md:w-[60%] animate-in slide-in-from-right duration-300">
        <div className={`p-6 space-y-6 ${slideClass}`}>
          {/* Header with nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Previous destination"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground truncate">{d.name}</h2>
              <p className="text-sm text-muted-foreground">{d.region}</p>
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === totalCount - 1}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Next destination"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg shrink-0">
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Trust badge with tooltip */}
          <div className="flex items-center gap-3">
            <div className={`${scoreColor(d.trust_score)} text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold`}>
              {d.trust_score}
            </div>
            <span className="font-medium text-foreground">{d.trust_label}</span>
            <TrustScoreTooltip />
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
                  <div key={alt.name} className="border border-border border-l-4 border-l-primary rounded-xl bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">{alt.name}</p>
                        <p className="text-xs text-muted-foreground">{alt.region}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`${scoreColor(alt.trust_score)} text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold`}>
                          {alt.trust_score}
                        </div>
                        <span className="text-xs font-medium text-foreground">{alt.trust_label}</span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button onClick={() => onSwitch(alt)} className="text-sm font-semibold text-primary hover:underline">
                        View
                      </button>
                    </div>
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
