import { createClient } from '@supabase/supabase-js';

if (!process.env.REACT_APP_SUPABASE_URL) {
  throw new Error('REACT_APP_SUPABASE_URL não está definida');
}

if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  throw new Error('REACT_APP_SUPABASE_ANON_KEY não está definida');
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 