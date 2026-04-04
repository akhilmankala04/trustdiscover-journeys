import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import DestinationCard from '@/components/DestinationCard';
import DetailPanel from '@/components/DetailPanel';
import StartOverDialog from '@/components/StartOverDialog';
import type { Destination, UserContext } from '@/types/destination';

const LOADING_MESSAGES = [
  'Analysing destinations near you…',
  'Scoring trust signals…',
  'Personalising your feed…',
];

let inflightPromise: Promise<Destination[]> | null = null;
let inflightSessionId: string | null = null;

function isDestinationArray(value: unknown): value is Destination[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as Destination).name === 'string' &&
        typeof (item as Destination).tagline === 'string' &&
        typeof (item as Destination).trust_score === 'number' &&
        typeof (item as Destination).trust_label === 'string' &&
        typeof (item as Destination).top_safety_signal === 'string' &&
        typeof (item as Destination).budget_match === 'string' &&
        typeof (item as Destination).region === 'string' &&
        typeof (item as Destination).why_you === 'string' &&
        typeof (item as Destination).best_months === 'string' &&
        typeof (item as Destination).estimated_cost === 'string' &&
        typeof (item as Destination).trip_context === 'string'
    )
  );
}

async function fetchDestinations(ctx: UserContext, sessionId: string): Promise<Destination[]> {
  if (inflightPromise && inflightSessionId === sessionId) {
    return inflightPromise;
  }

  inflightSessionId = sessionId;

  inflightPromise = (async () => {
    const { data, error } = await supabase.functions.invoke('generate-destinations', {
      body: { ctx, sessionId },
    });

    if (error) {
      inflightPromise = null;
      inflightSessionId = null;
      throw new Error(error.message || 'Failed to invoke destination generator.');
    }

    if (!isDestinationArray(data)) {
      inflightPromise = null;
      inflightSessionId = null;
      throw new Error('Invalid response returned by the destination generator.');
    }

    return data;
  })();

  return inflightPromise;
}

export default function Discover() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [userCtx, setUserCtx] = useState<UserContext | null>(null);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [error, setError] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showStartOver, setShowStartOver] = useState(false);

  // Cycling loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const run = async () => {
      const sessionId = localStorage.getItem('session_id');

      if (!sessionId) {
        setError('No session found. Please start over.');
        setLoading(false);
        return;
      }

      const { data: ctx, error: ctxErr } = await supabase
        .from('user_context')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (ctxErr || !ctx) {
        setError('Could not load your preferences.');
        setLoading(false);
        return;
      }

      const typedCtx = ctx as UserContext;
      setUserCtx(typedCtx);

      try {
        const parsed = await fetchDestinations(typedCtx, sessionId);
        setDestinations(parsed);
      } catch (e) {
        console.error(e);
        setError('Failed to get recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleRetry = useCallback(async () => {
    inflightPromise = null;
    inflightSessionId = null;
    setError('');
    setLoading(true);
    setMsgIndex(0);
    setFade(true);

    if (!userCtx) return;
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      setError('No session found. Please start over.');
      setLoading(false);
      return;
    }

    try {
      const parsed = await fetchDestinations(userCtx, sessionId);
      setDestinations(parsed);
    } catch (e) {
      console.error(e);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userCtx]);

  const handleConfirmStartOver = useCallback(() => {
    setShowStartOver(false);
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-foreground" />
          <span className="text-lg font-semibold text-primary-foreground">Trust Your Journey</span>
        </div>

        <button
          onClick={() => setShowStartOver(true)}
          className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
        >
          Start over
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
        {error && !loading && (
          <div className="text-center mb-4">
            <p className="text-destructive mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <p
              className={`text-center text-muted-foreground font-medium transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
            >
              {LOADING_MESSAGES[msgIndex]}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {userCtx && (
              <div className="mb-4 space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  Showing results for Safety level {userCtx.safety_sensitivity}
                </p>
                <p className="text-xs text-muted-foreground">
                  6 destinations matched your context
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destinations.map((d) => (
                <DestinationCard
                  key={d.name}
                  destination={d}
                  onDetails={() => setSelected(d)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selected && userCtx && (
        <DetailPanel
          destination={selected}
          safetySensitivity={userCtx.safety_sensitivity}
          departureCity={userCtx.departure_city}
          allDestinations={destinations}
          onClose={() => setSelected(null)}
          onSwitch={(d) => setSelected(d)}
          onNavigate={(index) => setSelected(destinations[index])}
          currentIndex={destinations.indexOf(selected)}
          totalCount={destinations.length}
        />
      )}

      <StartOverDialog
        open={showStartOver}
        onConfirm={handleConfirmStartOver}
        onCancel={() => setShowStartOver(false)}
      />
    </div>
  );
}
