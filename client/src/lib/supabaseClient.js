import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL is not defined. Set REACT_APP_SUPABASE_URL locally or NEXT_PUBLIC_SUPABASE_URL on Vercel.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Supabase Anon Key is not defined. Set REACT_APP_SUPABASE_ANON_KEY locally or NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
