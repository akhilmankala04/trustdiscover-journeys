import { Shield } from 'lucide-react';

export default function Discover() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary px-6 py-4 flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary-foreground" />
        <span className="text-xl font-semibold text-primary-foreground">TrustDiscover</span>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-lg text-muted-foreground">Discovery feed coming next</p>
      </div>
    </div>
  );
}
