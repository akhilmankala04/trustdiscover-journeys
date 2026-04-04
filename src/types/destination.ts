export interface Destination {
  name: string;
  tagline: string;
  trust_score: number;
  trust_label: 'Verified' | 'Mostly verified' | 'Use caution';
  top_safety_signal: string;
  budget_match: 'Great value' | 'Good value' | 'Premium';
  region: string;
  why_you: string;
  best_months: string;
  estimated_cost: string;
  trip_context: string;
}

export interface UserContext {
  session_id: string;
  companion_type: string;
  vibe: string;
  safety_sensitivity: number;
  budget_range: string;
  departure_city: string;
}
