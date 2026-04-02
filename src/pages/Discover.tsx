import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import DestinationCard from '@/components/DestinationCard';
import DetailPanel from '@/components/DetailPanel';
import type { Destination, UserContext } from '@/types/destination';

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
        typeof (item as Destination).estimated_cost === 'string'
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
      body: {
        ctx,
        sessionId,
      },
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
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [userCtx, setUserCtx] = useState<UserContext | null>(null);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [error, setError] = useState('');

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

  const handleRetry = () => {
    inflightPromise = null;
    inflightSessionId = null;
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-foreground" />
          <span className="text-lg font-semibold text-primary-foreground">Trust Your Journey</span>
        </div>

        <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
          Start over
        </Link>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
        {error && (
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
            <p className="text-center text-muted-foreground font-medium">
              Finding your perfect destinations…
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {destinations.map((d) => (
              <DestinationCard
                key={d.name}
                destination={d}
                onDetails={() => setSelected(d)}
              />
            ))}
          </div>
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
        />
      )}
    </div>
  );
}
