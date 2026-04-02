import { useNavigate } from 'react-router-dom';
import { Shield, User, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Trust Score on every result',
    desc: 'Every destination is scored 0–100 across 4 independent signals. Not star ratings. Not review counts.',
  },
  {
    icon: User,
    title: 'Built around your context',
    desc: "Solo or group, safety-first or flexible — your feed is different from everyone else's.",
  },
  {
    icon: CheckCircle,
    title: 'Verified alternatives always ready',
    desc: 'If something scores low, we surface what you should book instead.',
  },
];

const stats = [
  { number: '$274M', label: 'lost to travel fraud in 2024' },
  { number: '70%', label: 'of solo female travelers felt unsafe' },
  { number: '0', label: 'platforms verify listings independently' },
];

export default function Home() {
  const navigate = useNavigate();

  const goOnboarding = () => navigate('/onboarding');

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Nav */}
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-semibold text-lg">Trust Your Journey</span>
        </div>
        <button
          onClick={goOnboarding}
          className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          Start exploring
        </button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Discover destinations you can actually trust.
        </h1>
        <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-2xl">
          AI-powered travel discovery with real-time trust scoring and safety context — built for travelers who can't afford to get it wrong.
        </p>
        <button
          onClick={goOnboarding}
          className="mt-10 px-10 py-4 rounded-xl text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Find my destinations
        </button>
        <p className="mt-4 text-sm text-muted-foreground">
          Free · No account needed · Takes 60 seconds
        </p>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-8 space-y-3"
            >
              <f.icon className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stat bar */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-bold text-primary">{s.number}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary text-primary-foreground px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to travel with confidence?</h2>
        <button
          onClick={goOnboarding}
          className="mt-8 px-10 py-4 rounded-xl text-lg font-semibold bg-background text-foreground hover:bg-background/90 transition-colors"
        >
          Start for free
        </button>
      </section>
    </div>
  );
}
