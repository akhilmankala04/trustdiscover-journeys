import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';

const STEPS = 5;

const companionOptions = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'group', label: 'Group', emoji: '👨‍👩‍👧‍👦' },
];

const vibeOptions = [
  { value: 'adventure', label: 'Adventure', desc: 'Thrilling experiences and outdoor exploration' },
  { value: 'culture', label: 'Culture', desc: 'History, art, and local traditions' },
  { value: 'relax', label: 'Relax', desc: 'Beaches, spas, and peaceful getaways' },
];

const budgetOptions = [
  { value: 'under_3000', label: 'Under ₹3,000' },
  { value: '3000_to_8000', label: '₹3,000 to ₹8,000' },
  { value: '8000_plus', label: '₹8,000+' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [companion, setCompanion] = useState('');
  const [vibe, setVibe] = useState('');
  const [safety, setSafety] = useState([3]);
  const [budget, setBudget] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canNext = () => {
    if (step === 1) return !!companion;
    if (step === 2) return !!vibe;
    if (step === 3) return true;
    if (step === 4) return !!budget;
    if (step === 5) return city.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const sessionId = uuidv4();
    try {
      await supabase.from('user_context').insert({
        session_id: sessionId,
        companion_type: companion,
        vibe,
        safety_sensitivity: safety[0],
        budget_range: budget,
        departure_city: city.trim(),
      });
      localStorage.setItem('session_id', sessionId);
      navigate('/discover');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / STEPS) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
        {/* Step 1 */}
        {step === 1 && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            <h1 className="text-2xl font-semibold text-foreground text-center">Who are you traveling as?</h1>
            <div className="grid gap-4">
              {companionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCompanion(opt.value)}
                  className={`p-6 rounded-xl border-2 text-lg font-medium transition-all shadow-sm bg-card ${
                    companion === opt.value
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl mr-3">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            <h1 className="text-2xl font-semibold text-foreground text-center">What is your travel vibe?</h1>
            <div className="grid gap-4">
              {vibeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVibe(opt.value)}
                  className={`p-6 rounded-xl border-2 text-left transition-all shadow-sm bg-card ${
                    vibe === opt.value
                      ? 'border-primary bg-secondary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className={`text-lg font-medium ${vibe === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                  <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            <h1 className="text-2xl font-semibold text-foreground text-center">How important is safety to you?</h1>
            <div className="space-y-6">
              <p className="text-center text-4xl font-bold text-primary">{safety[0]}</p>
              <Slider
                value={safety}
                onValueChange={setSafety}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>I am flexible</span>
                <span>Safety first</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            <h1 className="text-2xl font-semibold text-foreground text-center">What is your budget per night?</h1>
            <div className="grid gap-4">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value)}
                  className={`p-6 rounded-xl border-2 text-lg font-medium transition-all shadow-sm bg-card ${
                    budget === opt.value
                      ? 'border-primary bg-secondary text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            <h1 className="text-2xl font-semibold text-foreground text-center">Where are you traveling from?</h1>
            <div className="space-y-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your departure city e.g. Hyderabad"
                className="h-14 text-base rounded-xl"
              />
              <p className="text-sm text-muted-foreground">We use this to estimate your travel costs accurately.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="w-full mt-12">
          {step < STEPS ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="w-full py-4 rounded-xl text-lg font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="w-full py-4 rounded-xl text-lg font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {submitting ? 'Finding...' : 'Find my destinations'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
