import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carga el .env ubicado en la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en el .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);