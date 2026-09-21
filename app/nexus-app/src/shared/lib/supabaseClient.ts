import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/** true cuando existen VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Placeholders evitan crash al importar; sin .env la app usa caché local.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
);