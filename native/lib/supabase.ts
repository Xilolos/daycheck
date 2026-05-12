import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://glvphbnhlwjguecqcabc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdnBoYm5obHdqZ3VlY3FjYWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjYwNTgsImV4cCI6MjA5MzU0MjA1OH0._B_4AviEk_QjrpN3bALcO4v4Ycjfc_iGDtJtFyD1lUQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
