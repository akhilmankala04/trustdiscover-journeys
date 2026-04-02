import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmmwxtotkzwbcddseuom.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbXd4dG90a3p3YmNkZHNldW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzM0ODUsImV4cCI6MjA5MDcwOTQ4NX0.738uBfJBSgVyzvRXpO4vrQismYQtS_38HgaJqO-sDuE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
