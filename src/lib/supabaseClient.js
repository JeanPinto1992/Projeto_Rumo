import { createClient } from '@supabase/supabase-js'

// Configurações do seu projeto Supabase
// Para produção, use variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rdrtbcnxxdjljbxmmkcj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcnRiY254eGRqbGpieG1ta2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDUyOTIsImV4cCI6MjA2NDYyMTI5Mn0.GNWLnKi8TJWqPaRD8gTKJGQpYP96qXGwjvRlqN7R5DI'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configurações do Supabase não encontradas. Verifique suas variáveis de ambiente.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
