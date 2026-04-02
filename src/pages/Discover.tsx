import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import DestinationCard from '@/components/DestinationCard';
import DetailPanel from '@/components/DetailPanel';
import type { Destination, UserContext } from '@/types/destination';

const SYSTEM_PROMPT = `You are TrustDiscover, an AI travel recommendation engine for Indian travelers. Based on the traveler context provided, return exactly 6 destination recommendations as a valid JSON array with no additional text and no markdown and no code blocks. Each object must have these fields exactly: name as a string for the destination name, tagline as a string of max 12 words personalised to their vibe, trust_score as a number between 60 and 98, trust_label as exactly one of Verified or Mostly verified or Use caution, top_safety_signal as a string of max 10 words describing the top safety feature, budget_match as exactly one of Great value or Good value or Premium, region as a string for the state or region in India, why_you as a string of max 15 words personalised to their travel style and companion type, best_months as a string listing 2 or 3 best months to visit, estimated_cost as a string formatted as approximately ₹X,XXX total from [city] including travel. If safety_sensitivity is 4 or 5 only include destinations with trust_score of 80 or above.`;

export default function Discover() {
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [userCtx, setUserCtx] = useState<UserContext | null>(null);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) { setError('No session found. Please start over.'); setLoading(false); return; }

      // Fetch user context
      const { data: ctx, error: ctxErr } = await supabase
        .from('user_context')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (ctxErr || !ctx) { setError('Could not load your preferences.'); setLoading(false); return; }
      setUserCtx(ctx as UserContext);

      const userMessage = `companion_type is ${ctx.companion_type}, vibe is ${ctx.vibe}, safety_sensitivity is ${ctx.safety_sensitivity}, budget_range is ${ctx.budget_range}, departure_city is ${ctx.departure_city}`;

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            }),
          }
        );

        if (!res.ok) throw new Error('Gemini API error');

        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Clean any markdown fences
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const parsed: Destination[] = JSON.parse(cleaned);

        setDestinations(parsed);

        // Save to Supabase
        const rows = parsed.map((d) => ({
          session_id: sessionId,
          destination_name: d.name,
          tagline: d.tagline,
          trust_score: d.trust_score,
          trust_label: d.trust_label,
          top_safety_signal: d.top_safety_signal,
          budget_match: d.budget_match,
          region: d.region,
          why_you: d.why_you,
          best_months: d.best_months,
          estimated_cost: d.estimated_cost,
        }));
        await supabase.from('destination_results').insert(rows);
      } catch (e) {
        console.error(e);
        setError('Failed to get recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <header className="bg-primary px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-foreground" />
          <span className="text-lg font-semibold text-primary-foreground">TrustDiscover</span>
        </div>
        <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
          Start over
        </Link>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
        {error && <p className="text-center text-destructive mb-4">{error}</p>}

        {loading ? (
          <div className="space-y-6">
            <p className="text-center text-muted-foreground font-medium">Finding your perfect destinations…</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {destinations.map((d) => (
              <DestinationCard key={d.name} destination={d} onDetails={() => setSelected(d)} />
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
