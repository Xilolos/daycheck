import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'https://glvphbnhlwjguecqcabc.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdnBoYm5obHdqZ3VlY3FjYWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjYwNTgsImV4cCI6MjA5MzU0MjA1OH0._B_4AviEk_QjrpN3bALcO4v4Ycjfc_iGDtJtFyD1lUQ',
  { auth: { flowType: 'implicit', detectSessionInUrl: true } },
);
